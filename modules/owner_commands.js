const logger = require('../logger');
const modHelper = require('../modHelper');

module.exports._mod_info = {
    name: 'owner_commands',
    description: 'Owber commands for RyBot',
    author: 'Ryzerth',
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

module.exports.module = {
    name: 'module',
    usage: 'module [list/name]',
    description: 'Get info about the loaded modules',
    adminOnly: false,
    ownerOnly: false,
    /**
     * @param {Eris.Client} bot Text channel
     * @param {Eris.Message} message Discord message
     * @param {Eris.Message} text Text after the command
     * @param {string[]} args Discord message
     */
    baseCmd: async (bot, message, text, args) => {
        modHelper.reload(bot);
        message.channel.createMessage(`:white_check_mark: \`Modules successfully!\``);
    },
    subCmds: {
        list: async (bot, message, text, args) => {
            // TODO: Finish this thing
        }
    }
};