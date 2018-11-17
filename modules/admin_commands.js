const logger = require('../logger');
const config = require('../config');
const modHelper = require('../modHelper');

module.exports._mod_info = {
    name: 'admin_commands',
    description: 'Admin commands for RyBot',
    author: 'Ryzerth',
};

module.exports._mod_init = (bot) => {
    logger.log(`Initializing admin_commands...`);
    // TODO: Add shit idk
    logger.ok();
};

module.exports._mod_end = (bot) => {
    logger.log(`Stopping admin_commands...`);
    // TODO: Add shit idk
    logger.ok();
};

module.exports.setcolor = {
    name: 'setcolor',
    usage: 'setcolor [hex_color]',
    description: 'Set the color of the embeds sent by the bot',
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
            modHelper.modules['misc_commands']._help(message.channel, module.exports.setcolor);
            return;
        }
        if (!args[1].match(/^#(?:[0-9a-fA-F]{3}){1,2}$/g)) {
            message.channel.createMessage(`:no_entry: \`Invalid hex color: ${args[1]}. Use format #FFFFFF\``);
            return;
        }
        let conf = await config.get(message.channel.guild.id);
        conf.embedColor = args[1];
        config.set(message.channel.guild.id, conf);
        message.channel.createMessage(`:white_check_mark: \`Color changed successfully!\``);
    }
};

module.exports.setprefix = {
    name: 'setprefix',
    usage: 'setprefix [prefix]',
    description: 'Set the bot\'s prefix',
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
            modHelper.modules['misc_commands']._help(message.channel, module.exports.setprefix);
            return;
        }
        let conf = await config.get(message.channel.guild.id);
        conf.prefix = args[1];
        config.set(message.channel.guild.id, conf);
        message.channel.createMessage(`:white_check_mark: \`Prefix changed successfully!\``);
    }
};

module.exports.setadmin = {
    name: 'setadmin',
    usage: 'setadmin [role]',
    description: 'Set the admin role for the server',
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
            modHelper.modules['misc_commands']._help(message.channel, module.exports.setadmin);
            return;
        }
        let id = args[1].match(/<@&([0-9]+)>/);
        if (!id) {
            message.channel.createMessage(`:no_entry: \`Invalid role!\``);
            return;
        }
        let conf = await config.get(message.channel.guild.id);
        conf.adminRole = id[1];
        config.set(message.channel.guild.id, conf);
        message.channel.createMessage(`:white_check_mark: \`Admin role set successfully!\``);
    }
};