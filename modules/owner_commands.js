const logger = require('../logger');
const modHelper = require('../modHelper');
const config = require('../config');
const embedBuilder = require('../embedBuilder');

// Require Eris for synthax highlight
// eslint-disable-next-line no-unused-vars
const Eris = require('eris');

module.exports._mod_info = {
    name: 'owner_commands',
    description: 'Owner commands for RyBot',
    author: 'Ryzerth',
    version: '1.0.0'
};

module.exports._mod_init = (bot) => {
    logger.log(`Initializing owner_commands...`);
    // TODO: Add shit idk
    logger.ok();
};

module.exports._mod_end = (bot) => {
    logger.log(`Stopping owner_commands...`);
    // TODO: Add shit idk
    logger.ok();
};

module.exports.reload = {
    name: 'reload',
    usage: 'reload',
    description: 'Reload the bot\'s modules',
    adminOnly: false,
    ownerOnly: true,
    /**
     * @param {Eris.Client} bot Text channel
     * @param {Eris.Message} message Discord message
     * @param {Eris.Message} text Text after the command
     * @param {string[]} args Discord message
     */
    baseCmd: async (bot, message, text, args) => {
        modHelper.reload(bot);
        message.channel.createMessage(`:white_check_mark: \`Reloaded modules successfully!\``);
    }
};

module.exports.setstatus = {
    name: 'setstatus',
    usage: 'setstatus [text]',
    description: 'Set the bot\'s status',
    adminOnly: false,
    ownerOnly: true,
    /**
     * @param {Eris.Client} bot Text channel
     * @param {Eris.Message} message Discord message
     * @param {Eris.Message} text Text after the command
     * @param {string[]} args Discord message
     */
    baseCmd: async (bot, message, text, args) => {
        if (args.length < 2) {
            modHelper.modules['misc_commands']._help(message.channel, module.exports.setcolor);
            return;
        }
        bot.editStatus({
            status: 'online'
        }, {
            name: text
        });
        let conf = await config.get(message.channel.guild.id);
        conf.status = text;
        config.set(message.channel.guild.id, conf);
        message.channel.createMessage(`:white_check_mark: \`Status changed successfully!\``);
    }
};

module.exports.module = {
    name: 'module',
    usage: 'module [list/info] [name]',
    description: 'List modules or get info about one',
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
            modHelper.modules['misc_commands']._help(message.channel, module.exports.setcolor);
            return;
        }
        message.channel.createMessage(`:no-entry: \`Unknown subcommand: ${args[1]}\``);
    },
    subCmds: {
        list: async (bot, message, text, args) => {
            let conf = await config.get(message.channel.guild.id);
            let modList = '';
            let mods = Object.keys(modHelper.modules);
            for (let i = 0; i < mods.length; i++) {
                modList += `${mods[i]}\n`;
            }
            let embed = new embedBuilder.Embed();
            embed.setTitle('Module list');
            embed.setDescription(modList);
            embed.setColor(conf.embedColor);
            message.channel.createMessage({
                embed: embed.get()
            });
        },
        info: async (bot, message, text, args) => {
            let conf = await config.get(message.channel.guild.id);
            let mod = modHelper.modules[args[2]];
            if (!mod) {
                message.channel.createMessage(`:no-entry: \`Unknown module\``);
                return;
            }
            let addedCmds = '';
            let cmds = Object.keys(mod);
            for (let i = 0; i < cmds.length; i++) {
                if (!cmds[i].startsWith('_')) {
                    addedCmds += `${cmds[i]}, `;
                }
            }
            addedCmds = addedCmds.substring(0, addedCmds.length - 2);
            let embed = new embedBuilder.Embed();
            embed.setTitle(`Module info: ${mod._mod_info.name}`);
            embed.setDescription(mod._mod_info.description);
            embed.addField('Author', mod._mod_info.author, true);
            embed.addField('Version', mod._mod_info.version, true);
            if (addedCmds != '') {
                embed.addField('Added commands', `\`\`\`${addedCmds}\`\`\``, true);
            }
            embed.setColor(conf.embedColor);
            message.channel.createMessage({
                embed: embed.get()
            });
        }
    }
};