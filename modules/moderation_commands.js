const logger = require('../logger');
const config = require('../config');
const modHelper = require('../modHelper');
const embedBuilder = require('../embedBuilder');

module.exports._mod_info = {
    name: 'moderation_commands',
    description: 'Moder a commands for RyBot',
    author: 'Ryzerth',
};

module.exports._mod_init = (bot) => {
    logger.log(`Initializing moderation_commands...`);
    // TODO: Add shit idk
    logger.ok();
};

module.exports._mod_end = (bot) => {
    logger.log(`Stopping moderation_commands...`);
    // TODO: Add shit idk
    logger.ok();
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
    usage: 'ban [user]',
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
        if (mentions.length < 1) {
            modHelper.modules['misc_commands']._help(message.channel, module.exports.ban);
            return;
        }
        for (let i = 0; i < mentions.length; i++) {
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
    usage: 'mute [user]',
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
        let conf = await config.get(message.channel.guild.id);
        if (mentions.length < 1) {
            modHelper.modules['misc_commands']._help(message.channel, module.exports.mute);
            return;
        }
        for (let i = 0; i < mentions.length; i++) {
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
            modHelper.modules['misc_commands']._help(message.channel, module.exports.mute);
            return;
        }

        for (let i = 0; i < mentions.length; i++) {
            try {
                await message.channel.guild.removeMemberRole(mentions[i].id, conf.mutedRole);
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
            modHelper.modules['misc_commands']._help(message.channel, module.exports.softban);
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
