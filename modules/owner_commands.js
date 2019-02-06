const logger = require('../logger');
const modHelper = require('../modHelper');
const config = require('../config');

// Require Eris for synthax highlight
// eslint-disable-next-line no-unused-vars
const Eris = require('eris');

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