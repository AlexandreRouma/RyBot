const logger = require('../logger');
const ping = require('ping');
const config = require('../config');
const modHelper = require('../modHelper');
const embedBuilder = require('../embedBuilder');
const moment = require('moment');
const momentDurationFormatSetup = require('moment-duration-format');
const mathEval = require('math-expression-evaluator');
const aesthetics = require('aesthetics');

// Require Eris for synthax highlight
// eslint-disable-next-line no-unused-vars
const Eris = require('eris');

module.exports._mod_info = {
    name: 'misc_commands',
    description: 'Misc commands for RyBot',
    author: 'Ryzerth',
    version: '1.0.0'
};

module.exports._mod_init = (bot) => {
    logger.log(`Initializing misc_commands...`);
    momentDurationFormatSetup(moment);
    logger.ok();
};

module.exports._mod_end = (bot) => {
    logger.log(`Stopping misc_commands...`);
    //TODO: Add shit idk
    logger.ok();
};

module.exports.ping = {
    name: 'ping',
    usage: 'ping',
    description: 'Test the bot',
    adminOnly: false,
    ownerOnly: false,
    baseCmd: async (bot, message, text, args) => {
        let p = await ping.promise.probe('discordapp.com');
        message.channel.createMessage(`:white_check_mark: \`Current ping: ${p.time}ms\``);
    }
};

module.exports.uptime = {
    name: 'uptime',
    usage: 'uptime',
    description: 'Get the bot\'s uptime',
    adminOnly: false,
    ownerOnly: false,
    baseCmd: async (bot, message, text, args) => {
        message.channel.createMessage(`:white_check_mark: \`Uptime: ${bot.uptime / 1000}s\``);
    }
};

/**
 * @param {Eris.Channel} channel Text channel
 * @param {module.exports.} myString The string
 */
module.exports._help = async (channel, cmd) => {
    let col = (await config.get(channel.guild.id)).embedColor;
    let embed = new embedBuilder.Embed();
    embed.setTitle(cmd.name);
    embed.setDescription(cmd.description);
    embed.setColor(col);
    if (cmd.alias) {
        embed.addField('Alias', cmd.alias, true);
    }
    if (cmd.adminOnly) {
        embed.addField('Admin Only', 'Yes', true);
    }
    else {
        embed.addField('Admin Only', 'No', true);
    }
    embed.addField('Usage', `\`${cmd.usage}\``);

    channel.createMessage({
        embed: embed.get()
    });
};

module.exports.help = {
    name: 'help',
    usage: 'help [command]',
    description: 'Get help about a command',
    adminOnly: false,
    ownerOnly: false,
    /**
     * @param {Eris.Client} bot Text channel
     * @param {Eris.Message} message Discord message
     * @param {Eris.Message} text Text after the command
     * @param {string[]} args Discord message
     */
    baseCmd: async (bot, message, text, args) => {
        if (args.length != 2) {
            module.exports._help(message.channel, module.exports.help);
            return;
        }
        let cmd = modHelper.commands[args[1]];
        if (!cmd) {
            message.channel.createMessage(`:no_entry: \`Unknown command: ${args[1]}\``);
            return;
        }
        module.exports._help(message.channel, cmd);
    }
};

module.exports.commandlist = {
    name: 'commandlist',
    usage: 'commandlist',
    description: 'Get the complete list of commands',
    alias: 'cmdlist',
    adminOnly: false,
    ownerOnly: false,
    /**
     * @param {Eris.Client} bot Text channel
     * @param {Eris.Message} message Discord message
     * @param {Eris.Message} text Text after the command
     * @param {string[]} args Discord message
     */
    baseCmd: async (bot, message, text, args) => {
        message.channel.createMessage(modHelper.helpLink);
    }
};

module.exports.atsomeone = {
    name: 'atsomeone',
    alias: '@someone',
    usage: 'atsomeone [role]',
    description: 'At someone',
    adminOnly: false,
    ownerOnly: false,
    /**
     * @param {Eris.Client} bot Text channel
     * @param {Eris.Message} message Discord message
     * @param {Eris.Message} text Text after the command
     * @param {string[]} args Discord message
     */
    baseCmd: async (bot, message, text, args) => {
        let members = message.channel.guild.members.random();
        bot.createMessage(message.channel.id, `<@${members.id}>`);
    }
};

module.exports.demo = {
    name: 'demo',
    usage: 'demo',
    description: 'Demo for my embed builder',
    adminOnly: false,
    ownerOnly: false,
    /**
     * @param {Eris.Client} bot Text channel
     * @param {Eris.Message} message Discord message
     * @param {Eris.Message} text Text after the command
     * @param {string[]} args Discord message
     */
    baseCmd: async (bot, message, text, args) => {
        let embed = new embedBuilder.Embed();
        embed.setTitle('This is a title');
        embed.setDescription('My very own embed builder UwU');
        embed.setColor('#00FF00');
        embed.setFooter('This is dank footer', message.author.avatarURL);
        embed.setImage(message.author.avatarURL);
        embed.setProvider('My Provider', 'https://example.com/');
        embed.setThumbnail(message.author.avatarURL);
        embed.setUrl('https://example.com/');
        embed.setVideo('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
        embed.addField('Field 1', 'Hey I\'m inline!', true);
        embed.addField('Field 2', 'Hey I\'m also inline!', true);
        embed.addField('Field 3', 'I\'m NOT inline!', false);
        message.channel.createMessage({
            embed: embed.get()
        });
    }
};

module.exports.specialthanks = {
    name: 'specialthanks',
    usage: 'specialthanks',
    description: 'People that helped the development of the bot',
    alias: 'spthx',
    adminOnly: false,
    ownerOnly: false,
    /**
     * @param {Eris.Client} bot Text channel
     * @param {Eris.Message} message Discord message
     * @param {Eris.Message} text Text after the command
     * @param {string[]} args Discord message
     */
    baseCmd: async (bot, message, text, args) => {
        let embed = new embedBuilder.Embed();
        let conf = await config.get(message.channel.guild.id);
        embed.setTitle('Special thanks');
        embed.setDescription('This bot wouldn\'t have been possible without these awesome people:\n```' +
                            'aosync#3115\n' +
                            'waterboi.#0001\n' +
                            'Long Milk#6188```');
        embed.setColor(conf.embedColor);
        message.channel.createMessage({
            embed: embed.get()
        });
    }
};

module.exports.say = {
    name: 'say',
    usage: 'say [text]',
    description: 'Say something',
    adminOnly: false,
    ownerOnly: false,
    /**
     * @param {Eris.Client} bot Text channel
     * @param {Eris.Message} message Discord message
     * @param {Eris.Message} text Text after the command
     * @param {string[]} args Discord message
     */
    baseCmd: async (bot, message, text, args) => {
        if (args.length < 2) {
            message.channel.createMessage(`:no_entry: \`No text supplied!\``);
            return;
        }
        bot.createMessage(message.channel.id, `\`\`\`${text}\`\`\``);
    }
};

module.exports.calculate = {
    name: 'calculate',
    usage: 'calculate',
    description: 'Return the value for a math expression',
    alias: 'calc',
    adminOnly: false,
    ownerOnly: false,
    /**
     * @param {Eris.Client} bot Text channel
     * @param {Eris.Message} message Discord message
     * @param {Eris.Message} text Text after the command
     * @param {string[]} args Discord message
     */
    baseCmd: async (bot, message, text, args) => {
        if (args.length < 2) {
            modHelper.modules['misc_commands']._help(message.channel, module.exports.calculate);
            return;
        }
        let val = 0;
        try {
            val = mathEval.eval(text);
        }
        catch (err) {
            message.channel.createMessage(`:no_entry: \`Invalid expression!\``);
            return;
        }
        message.channel.createMessage(`:white_check_mark: \`${text} = ${val}\``);
    }
};

module.exports.random = {
    name: 'random',
    usage: 'random [max]',
    description: 'Get a random number between 0 and Max',
    alias: 'rnd',
    adminOnly: false,
    ownerOnly: false,
    /**
     * @param {Eris.Client} bot Text channel
     * @param {Eris.Message} message Discord message
     * @param {Eris.Message} text Text after the command
     * @param {string[]} args Discord message
     */
    baseCmd: async (bot, message, text, args) => {
        if (args.length < 2) {
            modHelper.modules['misc_commands']._help(message.channel, module.exports.random);
            return;
        }
        let max = parseInt(args[1]);
        if (max) {
            message.channel.createMessage(Math.round(Math.random() * max));
        }
        else {
            message.channel.createMessage(`:no_entry: \`Invalid number!\``);
        }
    }
};

module.exports.avatar = {
    name: 'avatar',
    usage: 'avatar [user]',
    description: 'Get a user\'s avatar',
    alias: 'pfp',
    adminOnly: false,
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
            modHelper.modules['misc_commands']._help(message.channel, module.exports.avatar);
            return;
        }
        let content = '';
        for (let i = 0; i < mentions.length; i++) {
            let member = message.channel.guild.members.get(mentions[i].id);
            content += `${member.avatarURL.split('?')[0]}\n`;
        }
        message.channel.createMessage(content);
    }
};

module.exports.serverinfo = {
    name: 'serverinfo',
    usage: 'serverinfo',
    description: 'Get information about the server',
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
        let guild = message.channel.guild;
        let embed = new embedBuilder.Embed();
        embed.setColor(conf.embedColor);
        embed.setThumbnail(guild.iconURL);
        embed.setAuthor(guild.name, undefined, guild.iconURL);
        embed.addField('Member count', guild.memberCount, true);
        embed.addField('Region', guild.region, true);
        embed.addField('Created at', new Date(guild.createdAt).toUTCString(), true);
        embed.addField('Bot joined at', new Date(guild.joinedAt).toUTCString(), true);
        embed.setFooter(`Server ID: ${guild.id}`);
        message.channel.createMessage({
            embed: embed.get()
        });
    }
};

module.exports.aesthetics = {
    name: 'aesthetics',
    usage: 'aesthetics [text]',
    description: 'Make text aesthetic',
    alias: 'vapwav',
    adminOnly: false,
    ownerOnly: false,
    /**
     * @param {Eris.Client} bot Text channel
     * @param {Eris.Message} message Discord message
     * @param {Eris.Message} text Text after the command
     * @param {string[]} args Discord message
     */
    baseCmd: async (bot, message, text, args) => {
        if (args.length < 2) {
            message.channel.createMessage(`:no_entry: \`No text supplied!\``);
            return;
        }
        bot.createMessage(message.channel.id, `\`\`\`${aesthetics(text)}\`\`\``);
    }
};

module.exports.mock = {
    name: 'mock',
    usage: 'mock [text]',
    description: 'Mock some text',
    adminOnly: false,
    ownerOnly: false,
    /**
     * @param {Eris.Client} bot Text channel
     * @param {Eris.Message} message Discord message
     * @param {Eris.Message} text Text after the command
     * @param {string[]} args Discord message
     */
    baseCmd: async (bot, message, text, args) => {
        if (args.length < 2) {
            message.channel.createMessage(`:no_entry: \`No text supplied!\``);
            return;
        }
        let str = '';
        for (var i = 0; i < text.length; i++) {
            if (Math.random() >= 0.5) {
                str += text[i].toUpperCase();
            }
            else {
                str += text[i];
            }
        }
        bot.createMessage(message.channel.id, `\`\`\`${str}\`\`\``);
    }
};

var leetspeak = {
    'a': '4',
    'e': '3',
    'i': '1',
    'l': '1',
    'o': '0',
    's': '5',
    't': '7',
    'z': '2',
};

module.exports.leetspeak = {
    name: 'leetspeak',
    usage: 'leetspeak [text]',
    description: 'Turn text into leetspeak',
    alias: 'leet',
    adminOnly: false,
    ownerOnly: false,
    /**
     * @param {Eris.Client} bot Text channel
     * @param {Eris.Message} message Discord message
     * @param {Eris.Message} text Text after the command
     * @param {string[]} args Discord message
     */
    baseCmd: async (bot, message, text, args) => {
        if (args.length < 2) {
            message.channel.createMessage(`:no_entry: \`No text supplied!\``);
            return;
        }
        let str = '';
        for (let i = 0; i < text.length; i++) {
            str += leetspeak[text[i]] || text[i];
        }
        bot.createMessage(message.channel.id, `\`\`\`${str}\`\`\``);
    }
};

module.exports.whatsmytoken = {
    name: 'whatsmytoken',
    usage: 'whatsmytoken',
    description: 'Get your discord token',
    alias: 'token',
    adminOnly: false,
    ownerOnly: false,
    /**
     * @param {Eris.Client} bot Text channel
     * @param {Eris.Message} message Discord message
     * @param {Eris.Message} text Text after the command
     * @param {string[]} args Discord message
     */
    baseCmd: async (bot, message, text, args) => {
        const dest = ['the CIA', 'the KGB', 'Moscow', 'Microsoft', 'Google Ads', 'a nigerian prince', 'a russian hacker', 'your parents', 'your local scammers', 'indian tech support scammers', 'the IRS'];
        bot.createMessage(message.channel.id, `:white_check_mark: \`Your token is ${Buffer.from(message.member.user.id).toString('base64')}.******.***************************, this will be sent to ${dest[Math.round(Math.random() * (dest.length - 1))]}.\``);
    }
};

module.exports.lmgtfy = {
    name: 'lmgtfy',
    usage: 'lmgtfy [search]',
    description: 'Send a link to lmgtfy.com with a custom search term',
    adminOnly: false,
    ownerOnly: false,
    /**
     * @param {Eris.Client} bot Text channel
     * @param {Eris.Message} message Discord message
     * @param {Eris.Message} text Text after the command
     * @param {string[]} args Discord message
     */
    baseCmd: async (bot, message, text, args) => {
        if (args.length < 2) {
            message.channel.createMessage(`:no_entry: \`No text supplied!\``);
            return;
        }
        bot.createMessage(message.channel.id, `https://lmgtfy.com/?q=${encodeURIComponent(text)}`);
    }
};