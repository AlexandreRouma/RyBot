const logger = require('../logger');
const config = require('../config');
const modHelper = require('../modHelper');
const embedBuilder = require('../embedBuilder');
const fs = require('fs');

// Require Eris for synthax highlight
// eslint-disable-next-line no-unused-vars
const Eris = require('eris');

module.exports._mod_info = {
    name: 'code_commands',
    description: 'Code commands for RyBot',
    author: 'Ryzerth',
    version: '1.0.0'
};

module.exports._mod_init = (bot) => {
    logger.log(`Initializing code_commands...`);
    if (!fs.existsSync(`${config.getGlobal().modules}/rextester_api.js`)) {
        logger.failed();
        return 'Unmet dependency: rextester_api';
    }
    logger.ok();
};

module.exports._mod_end = (bot) => {
    logger.log(`Stopping code_commands...`);
    // TODO: Add shit idk
    logger.ok();
};

module.exports.run = {
    name: 'run',
    usage: 'run [lang/list] [code]',
    description: 'Run some code',
    adminOnly: false,
    ownerOnly: false,
    /**
     * @param {Eris.Client} bot Text channel
     * @param {Eris.Message} message Discord message
     * @param {Eris.Message} text Text after the command
     * @param {string[]} args Discord message
     */
    baseCmd: async (bot, message, text, args) => {
        if (args.length < 3) {
            module.exports._help(message.channel, module.exports.run);
            return;
        }
        if (!modHelper.modules['rextester_api']._getLanguages()[args[1]]) {
            message.channel.createMessage(`:no_entry: \`Unknown language: ${args[1]}!\``);
            return;
        }
        let conf = await config.get(message.channel.guild.id);
        let rex = await modHelper.modules['rextester_api']._runCode(args[1], text.substring(args[1].length + 1));
        if (!rex) {
            message.channel.createMessage(`:no_entry: \`Service unavailable :/\``);
            return;
        }
        let embed = new embedBuilder.Embed();
        embed.setColor(conf.embedColor);
        embed.setAuthor(`${message.author.username}#${message.author.discriminator}'s code result`, undefined, message.author.avatarURL);
        if (rex.Result != '') {
            embed.setDescription(`\`\`\`${rex.Result.substring(0, Math.min(1900, rex.Result.length))}\`\`\``);
        }
        if (rex.Warnings != null) {
            embed.addField('Warnings', rex.Warnings, false);
        }
        if (rex.Errors != null) {
            embed.addField('Errors', rex.Errors, false);
        }
        embed.setFooter(rex.Stats, message.author.avatarURL);
        message.channel.createMessage({
            embed: embed.get()
        });
    },
    subCmds: {
        list: async (bot, message, text, args) => {
            let conf = await config.get(message.channel.guild.id);
            let langList = '';
            let langs = Object.keys(modHelper.modules['rextester_api']._getLanguages());
            for (let i = 0; i < langs.length; i++) {
                langList += `${langs[i]}\n`;
            }
            let embed = new embedBuilder.Embed();
            embed.setTitle('Language list');
            embed.setDescription(langList);
            embed.setColor(conf.embedColor);
            message.channel.createMessage({
                embed: embed.get()
            });
        }
    }
};

module.exports.base64 = {
    name: 'base64',
    alias: 'b64',
    usage: 'base64 [enc/dec] [text]',
    description: 'Encode or decode base64',
    adminOnly: false,
    ownerOnly: false,
    /**
     * @param {Eris.Client} bot Text channel
     * @param {Eris.Message} message Discord message
     * @param {Eris.Message} text Text after the command
     * @param {string[]} args Discord message
     */
    baseCmd: async (bot, message, text, args) => {
        modHelper.modules['misc_commands']._help(message.channel, module.exports.base64);
    },
    subCmds: {
        enc: async (bot, message, text, args) => {
            if (text == '') {
                modHelper.modules['misc_commands']._help(message.channel, module.exports.base64);
                return;
            }
            message.channel.createMessage(`\`\`\`${Buffer.from(text).toString('base64')}\`\`\``);
        },
        dec: async (bot, message, text, args) => {
            if (text == '') {
                modHelper.modules['misc_commands']._help(message.channel, module.exports.base64);
                return;
            }
            let decoded;
            try {
                decoded = Buffer.from(text, 'base64').toString('ascii');
            }
            catch (err) {
                message.channel.createMessage(`:no_entry: \`Invalid base64!\``);
                return;
            }
            message.channel.createMessage(`\`\`\`${decoded}\`\`\``);
        }
    }
};