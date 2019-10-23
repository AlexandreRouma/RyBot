const logger = require('../logger');
const config = require('../config');
const modHelper = require('../modHelper');
const embedBuilder = require('../embedBuilder');
const lt = require('long-timeout');
const uuidv4 = require('uuid/v4');

// Require Eris for synthax highlight
// eslint-disable-next-line no-unused-vars
const Eris = require('eris');

const PUNISHMENTS_DEFAULT = {
    list: {}
};

let eris_bot = {};

module.exports._mod_info = {
    name: 'moderation_commands',
    description: 'Moder a commands for RyBot',
    author: 'Ryzerth',
    version: '1.0.0'
};

module.exports._mod_init = (bot) => {
    logger.log(`Initializing moderation_commands...`);
    eris_bot = bot;
    handleTempPunishments();
    logger.ok();
};

let timers = [];

module.exports._mod_end = (bot) => {
    logger.log(`Stopping moderation_commands...`);
    let slots = Object.keys(timers);
    for (let i = 0; i < slots.length; i++) {
        console.log(timers);
        clearTimerSlot(slots[i]);
    }
    logger.ok();
};

function getTimerSlot(timer) {
    let slot = uuidv4();
    timers[slot] = timer;
    return slot;
}

function clearTimerSlot(slot) {
    lt.clearTimeout(timers[slot]);
    delete timers[slot];
}

function removePunishment(punishment, memberId, serverId, conf) {
    logger.logInfo(`Removing a temporary punishment of type '${punishment.type}' from ${memberId} on ${serverId}`);
    if (punishment.type == 'tempmute') {
        try {
            eris_bot.removeGuildMemberRole(serverId, memberId, conf.mutedRole, 'automatic unmute');
        }
        catch (err) {
            logger.logWarn(`Could not unmute ${punishment.member.username}#${punishment.member.discriminator} on '${punishment.server.name}'.`);
        }
    }
    else if (punishment.type == 'tempban') {
        try {
            eris_bot.unbanGuildMember(serverId, memberId, 'automatic unban');
        }
        catch (err) {
            logger.logWarn(`Could not unmute ${punishment.member.username}#${punishment.member.discriminator} on '${punishment.server.name}'.`);
        }
    }
}

async function handleTempPunishments() {
    let punishments = await config.getOther('punishments', PUNISHMENTS_DEFAULT);
    let IDs = Object.keys(punishments.list);
    let now = Date.now();
    for (let i = 0; i < IDs.length; i++) {
        let punish = punishments.list[IDs[i]];
        let id = IDs[i].split('_');
        let memberId = id[0];
        let serverId = id[1];
        let conf = await config.get(serverId);
        if (new Date(punish.expiry) < now) {
            removePunishment(punish, memberId, serverId, conf);
            delete punishments.list[IDs[i]];
        }
        else {
            let span = new Date(punish.expiry).getTime() - now;
            punishments.list[IDs[i]].timer = getTimerSlot(lt.setTimeout(() => {
                removePunishment(punish, memberId, serverId, conf);
                delete  punishments.list[`${memberId}_${serverId}_${punish.type}`];
            }, span));
        }
    }
    config.setOther('punishments', punishments);
}

async function addTempPunishment(memberId, serverId, punishment) {
    logger.logInfo(`Adding a temporary punishment of type '${punishment.type}' to ${memberId} on ${serverId}`);
    let conf = await config.get(serverId);
    let span = punishment.expiry - Date.now();
    let punishments = await config.getOther('punishments', PUNISHMENTS_DEFAULT);
    punishments.timer = getTimerSlot(lt.setTimeout(() => {
        removePunishment(punishment, memberId, serverId, conf);
        delete  punishments.list[`${memberId}_${serverId}_${punishment.type}`];
    }, span));
    punishments.list[`${memberId}_${serverId}_${punishment.type}`] = punishment;
    config.setOther('punishments', punishments);
}

async function removePunishmentEntry(memberId, serverId, punishment) {
    let punishments = await config.getOther('punishments', PUNISHMENTS_DEFAULT);
    if (punishments.list[`${memberId}_${serverId}_${punishment.type}`]) {
        let slot = punishments.list[`${memberId}_${serverId}_${punishment.type}`].timer;
        lt.clearTimeout(timers[slot]);
        clearTimerSlot(slot);
        delete  punishments.list[`${memberId}_${serverId}_${punishment.type}`];
    }
    config.setOther('punishments', punishments);
}

module.exports.flushpdb = {
    name: 'flushpdb',
    usage: 'flushpdb',
    description: 'Flush the punishment database (ONLY use when database is corrupted, this removed all future punishemnt removals)',
    adminOnly: false,
    ownerOnly: true,
    /**
     * @param {Eris.Client} bot Text channel
     * @param {Eris.Message} message Discord message
     * @param {Eris.Message} text Text after the command
     * @param {string[]} args Discord message
     */
    baseCmd: async (bot, message, text, args) => {
        config.setOther('punishments', PUNISHMENTS_DEFAULT);
        logger.logWarn(`The punishment database hasa been flushed, any autoremoved punishments will not occure after the next restart/reload.`);
        message.channel.createMessage(`:white_check_mark: \`Punishment database flushed.\``);
    }
};

module.exports.kick = {
    name: 'kick',
    usage: 'kick [user]',
    description: 'Kick a user from the server',
    adminOnly: true,
    ownerOnly: false,
    /**
     * @param {Eris.Client} bot Text channel
     * @param {Eris.Message} message Discord message
     * @param {Eris.Message} text Text after the command
     * @param {string[]} args Discord message
     */
    baseCmd: async (bot, message, text, args) => {
        let mentions = message.mentions;
        if (mentions.length < 1) {
            modHelper.modules['misc_commands']._help(message.channel, module.exports.kick);
            return;
        }
        for (let i = 0; i < mentions.length; i++) {
            try {
                await bot.kickGuildMember(message.channel.guild.id, mentions[i].id, `Kicked by ${message.author.username}#${message.author.discriminator}`);
            }
            catch (err)  {
                message.channel.createMessage(`:no_entry: \`Could not kick ${mentions[i].username}#${mentions[i].discriminator}\``);
                return;
            }
        }
        if (mentions.length > 1) {
            message.channel.createMessage(`:white_check_mark: \`Kicked ${mentions.length} users!\``);
            return;
        }
        message.channel.createMessage(`:white_check_mark: \`Kicked ${mentions[0].username}#${mentions[0].discriminator}!\``);
    }
};

module.exports.ban = {
    name: 'ban',
    usage: 'ban [user] ([duration][m/h/d/M/y])',
    description: 'Ban a user from the server',
    adminOnly: true,
    ownerOnly: false,
    /**
     * @param {Eris.Client} bot Text channel
     * @param {Eris.Message} message Discord message
     * @param {Eris.Message} text Text after the command
     * @param {string[]} args Discord message
     */
    baseCmd: async (bot, message, text, args) => {
        let mentions = message.mentions;
        let duration = '0';
        let unit = 'm';
        if (mentions.length < 1) {
            modHelper.modules['misc_commands']._help(message.channel, module.exports.ban);
            return;
        }
        for (let i = 1; i < args.length; i++) {
            if (args[i].endsWith('m') || args[i].endsWith('h') || args[i].endsWith('d') || args[i].endsWith('M') || args[i].endsWith('y')) {
                duration = args[i].substring(0, args[i].length - 1);
                unit = args[i][args[i].length - 1];
                break;
            }
        }
        for (let i = 0; i < mentions.length; i++) {
            if (!/^\d+$/.test(duration)) {
                message.channel.createMessage(`:no_entry: \`Invalid duration\``);
                return;
            }
            else if (Number.parseInt(duration) != 0) {
                let expiry = new Date();
                let dur = Number.parseInt(duration);
                if (unit == 'm') {
                    expiry.setMinutes(expiry.getMinutes() + dur);
                }
                if (unit == 'h') {
                    expiry.setHours(expiry.getHours() + dur);
                }
                if (unit == 'd') {
                    expiry.setDate(expiry.getDate() + dur);
                }
                if (unit == 'M') {
                    expiry.setMonth(expiry.getMonth() + dur);
                }
                if (unit == 'y') {
                    expiry.setFullYear(expiry.getMinutes() + dur);
                }
                addTempPunishment(mentions[i].id, message.channel.guild.id, {
                    type: 'tempban',
                    expiry: expiry,
                    server: message.channel.guild,
                    member: mentions[i].id
                });
            }
            try {
                await bot.banGuildMember(message.channel.guild.id, mentions[i].id, 7, `Banned by ${message.author.username}#${message.author.discriminator}`);
            }
            catch (err)  {
                message.channel.createMessage(`:no_entry: \`Could not ban ${mentions[i].username}#${mentions[i].discriminator}\``);
                return;
            }
        }
        if (mentions.length > 1) {
            message.channel.createMessage(`:white_check_mark: \`Banned ${mentions.length} users!\``);
            return;
        }
        message.channel.createMessage(`:white_check_mark: \`Banned ${mentions[0].username}#${mentions[0].discriminator}!\``);
    }
};

module.exports.softban = {
    name: 'softban',
    usage: 'softban [user]',
    description: 'Softbans a user from the server',
    adminOnly: true,
    ownerOnly: false,
    /**
     * @param {Eris.Client} bot Text channel
     * @param {Eris.Message} message Discord message
     * @param {Eris.Message} text Text after the command
     * @param {string[]} args Discord message
     */
    baseCmd: async (bot, message, text, args) => {
        let mentions = message.mentions;
        if (mentions.length < 1) {
            modHelper.modules['misc_commands']._help(message.channel, module.exports.softban);
            return;
        }
        for (let i = 0; i < mentions.length; i++) {
            try {
                await bot.banGuildMember(message.channel.guild.id, mentions[i].id, 7, `Softbanned by ${message.author.username}#${message.author.discriminator}`);
                await bot.unbanGuildMember(message.channel.guild.id, mentions[i].id, '420');
            }
            catch (err)  {
                message.channel.createMessage(`:no_entry: \`Could not softban ${mentions[i].username}#${mentions[i].discriminator}\``);
                return;
            }
        }
        if (mentions.length > 1) {
            message.channel.createMessage(`:white_check_mark: \`Softbanned ${mentions.length} users!\``);
            return;
        }
        message.channel.createMessage(`:white_check_mark: \`Softbanned ${mentions[0].username}#${mentions[0].discriminator}!\``);
    }
};

module.exports.clear = {
    name: 'clear',
    usage: 'clear [role]',
    description: 'Clears an amount of message from the channel',
    adminOnly: true,
    ownerOnly: false,
    /**
     * @param {Eris.Client} bot Text channel
     * @param {Eris.Message} message Discord message
     * @param {Eris.Message} text Text after the command
     * @param {string[]} args Discord message
     */
    baseCmd: async (bot, message, text, args) => {
        if (args.length < 2) {
            bot.createMessage(message.channel.id, 'You need to provide a valid number');
            return;
        }
        let number = parseInt(args[1]);
        if (number < 0 || number > 100) {
            bot.createMessage(message.channel.id, 'You need to provide a valid number between 1 and 100');
            return;
        }
        try {
            await bot.deleteMessage(message.channel.id, message.id);
            let messages = await bot.getMessages(message.channel.id, number);
            let ids = [];
            messages.forEach((m) => {
                ids.push(m.id);
            });
            bot.deleteMessages(message.channel.id, ids);
        }
        catch (e) {
            bot.createMessage(message.channel.id, 'Could not delete the messages');
        }
    }
};

module.exports.setmuted = {
    name: 'setmuted',
    usage: 'setmuted [role]',
    description: 'Set the muted role for the server',
    adminOnly: true,
    ownerOnly: false,
    /**
     * @param {Eris.Client} bot Text channel
     * @param {Eris.Message} message Discord message
     * @param {Eris.Message} text Text after the command
     * @param {string[]} args Discord message
     */
    baseCmd: async (bot, message, text, args) => {
        if (args.length != 2) {
            modHelper.modules['misc_commands']._help(message.channel, module.exports.setmuted);
            return;
        }
        let id = args[1].match(/<@&([0-9]+)>/);
        if (!id) {
            message.channel.createMessage(`:no_entry: \`Invalid role!\``);
            return;
        }
        let conf = await config.get(message.channel.guild.id);
        conf.mutedRole = id[1];
        config.set(message.channel.guild.id, conf);
        let channels = Array.from(message.channel.guild.channels.values());
        let errors = 0;
        for (let i = 0; i < channels.length; i++) {
            if (channels[i].type == 0) {
                try {
                    await channels[i].editPermission(conf.mutedRole, 0, 2048, 'role');
                }
                catch (err) {
                    errors++;
                }
            }
        }
        if (errors >= 0) {
            message.channel.createMessage(`:white_check_mark: \`Muted role set successfully but couldn't set role in ${errors} channels\``);
            return;
        }
        message.channel.createMessage(`:white_check_mark: \`Muted role set successfully!\``);
    }
};

module.exports.mute = {
    name: 'mute',
    usage: 'mute [user] ([duration][m/h/d/M/y])',
    description: 'Mute a user',
    adminOnly: true,
    ownerOnly: false,
    /**
     * @param {Eris.Client} bot Text channel
     * @param {Eris.Message} message Discord message
     * @param {Eris.Message} text Text after the command
     * @param {string[]} args Discord message
     */
    baseCmd: async (bot, message, text, args) => {
        let mentions = message.mentions;
        let duration = '0';
        let unit = 'm';
        let conf = await config.get(message.channel.guild.id);
        if (mentions.length < 1) {
            modHelper.modules['misc_commands']._help(message.channel, module.exports.mute);
            return;
        }
        for (let i = 1; i < args.length; i++) {
            if (args[i].endsWith('m') || args[i].endsWith('h') || args[i].endsWith('d') || args[i].endsWith('M') || args[i].endsWith('y')) {
                duration = args[i].substring(0, args[i].length - 1);
                unit = args[i][args[i].length - 1];
                break;
            }
        }
        for (let i = 0; i < mentions.length; i++) {
            if (!/^\d+$/.test(duration)) {
                message.channel.createMessage(`:no_entry: \`Invalid duration\``);
                return;
            }
            else if (Number.parseInt(duration) != 0) {
                let expiry = new Date();
                let dur = Number.parseInt(duration);
                if (unit == 'm') {
                    expiry.setMinutes(expiry.getMinutes() + dur);
                }
                if (unit == 'h') {
                    expiry.setHours(expiry.getHours() + dur);
                }
                if (unit == 'd') {
                    expiry.setDate(expiry.getDate() + dur);
                }
                if (unit == 'M') {
                    expiry.setMonth(expiry.getMonth() + dur);
                }
                if (unit == 'y') {
                    expiry.setFullYear(expiry.getMinutes() + dur);
                }
                addTempPunishment(mentions[i].id, message.channel.guild.id, {
                    type: 'tempmute',
                    expiry: expiry,
                    server: message.channel.guild,
                    member: mentions[i].id
                });
            }
            try {
                await message.channel.guild.addMemberRole(mentions[i].id, conf.mutedRole);
            }
            catch (err)  {
                message.channel.createMessage(`:no_entry: \`Could not mute ${mentions[i].username}#${mentions[i].discriminator}\``);
                return;
            }
        }
        if (mentions.length > 1) {
            message.channel.createMessage(`:white_check_mark: \`Muted ${mentions.length} users!\``);
            return;
        }
        message.channel.createMessage(`:white_check_mark: \`Muted ${mentions[0].username}#${mentions[0].discriminator}!\``);
    }
};

module.exports.unmute = {
    name: 'unmute',
    usage: 'unmute [user]',
    description: 'Unmute a user',
    adminOnly: true,
    ownerOnly: false,
    /**
     * @param {Eris.Client} bot Text channel
     * @param {Eris.Message} message Discord message
     * @param {Eris.Message} text Text after the command
     * @param {string[]} args Discord message
     */
    baseCmd: async (bot, message, text, args) => {
        let mentions = message.mentions;
        let conf = await config.get(message.channel.guild.id);
        if (mentions.length < 1) {
            modHelper.modules['misc_commands']._help(message.channel, module.exports.unmute);
            return;
        }

        for (let i = 0; i < mentions.length; i++) {
            try {
                await message.channel.guild.removeMemberRole(mentions[i].id, conf.mutedRole);
                removePunishmentEntry(message.member.id, message.channel.guild.id, { type: 'tempmute' });
            }
            catch (err)  {
                message.channel.createMessage(`:no_entry: \`Could not unmute ${mentions[i].username}#${mentions[i].discriminator}\``);
                return;
            }
        }
        if (mentions.length > 1) {
            message.channel.createMessage(`:white_check_mark: \`Unmuted ${mentions.length} users!\``);
            return;
        }
        message.channel.createMessage(`:white_check_mark: \`Unmuted ${mentions[0].username}#${mentions[0].discriminator}!\``);
    }
};

module.exports.userinfo = {
    name: 'userinfo',
    usage: 'userinfo [user]',
    description: 'Get information about a user',
    adminOnly: false,
    ownerOnly: false,
    /**
     * @param {Eris.Client} bot Text channel
     * @param {Eris.Message} message Discord message
     * @param {Eris.Message} text Text after the command
     * @param {string[]} args Discord message
     */
    baseCmd: async (bot, message, text, args) => {
        let conf = await config.get(message.channel.guild.id);
        let mentions = message.mentions;
        if (mentions.length < 1) {
            modHelper.modules['misc_commands']._help(message.channel, module.exports.userinfo);
            return;
        }
        message.channel.guild.fetchAllMembers();
        for (let i = 0; i < mentions.length; i++) {
            let member = message.channel.guild.members.get(mentions[i].id);
            let user = mentions[i];
            let embed = new embedBuilder.Embed();
            embed.setColor(conf.embedColor);
            embed.setThumbnail(member.avatarURL);
            embed.setAuthor(`${mentions[i].username}#${mentions[i].discriminator}`, undefined, member.avatarURL);
            embed.addField('Joined', new Date(member.joinedAt).toUTCString(), false);
            embed.addField('Created', new Date(member.createdAt).toUTCString(), false);
            embed.addField('Status', member.status, true);
            if (member.bot) {
                embed.addField('Bot', 'Yes', true);
            }
            else {
                embed.addField('Bot', 'No', true);
            }
            embed.addField('Playing', member.game.name, true);
            embed.addField('Mention', member.mention, true);
            let roleStr = '';
            // TODO: Finish userinfo
            embed.addField('Roles', member.mention, false);
            message.channel.createMessage({
                embed: embed.get()
            });
        }
    }
};
