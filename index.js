const logger = require('./logger');
const config = require('./config');
const Eris = require('eris');
const modHelper = require('./modHelper');
const fs = require('fs');

let bot = new Eris.Client();

logger.logInfo('Welcome to RyBot!');
main();

async function main() {
    // Create config if it doesn't exist

    // Load configuration
    logger.log('Loading configuation...');
    let cnfErr = await config.init('./config/config.json', './config/config.sqlite');
    if (cnfErr) {
        logger.failed();
        logger.panic(`Could not load configuration: ${cnfErr}`);
    }
    logger.ok();

    // Start bot
    logger.log('Starting Discord client...');
    let cliErr = await new Promise((res) => {
        try {
            bot = new Eris.Client(config.getGlobal().token, {
                disableEvents: {
                    //'VOICE_STATE_UPDATE': true,
                    'MESSAGE_DELETE_BULK': true,
                    'TYPING_START': true,
                },
                compress: true,
                disableEveryone: true,
                getAllUsers: true,
            });
            bot.connect();
        }
        catch (err) {
            res(err);
            return;
        }
        bot.on('ready', () => {
            res(undefined);
        });
    });
    if (cliErr) {
        logger.failed();
        logger.panic(`Could start discord client: ${cliErr}`);
    }
    logger.ok();

    // Load modules
    modHelper.load(bot);

    // Handlers
    logger.log('Starting handlers...');
    bot.on('messageCreate', async (message) => {
        if (message.author.id == bot.user.id || message.author.bot) {
            return;
        }

        let conf = await config.get(message.channel.guild.id);
        if (message.content.startsWith(conf.prefix)) {
            let fullMsg = message.content.substring(1);
            let args = fullMsg.split(' ');
            let cmd = modHelper.commands[args[0]];
            if (!cmd) {
                await message.channel.createMessage(`:no_entry: \`Unknown command: ${args[0].replace(/`/, '').replace(/@/, '')}\``);
                return;
            }
            let subCmd;
            if (cmd.subCmds && args.length > 1) {
                subCmd = cmd.subCmds[args[1]];
            }

            if (cmd.adminOnly && !message.member.roles.includes(conf.adminRole) && message.member.id != config.getGlobal().botOwner && !message.member.permission.has('administrator')) {
                await message.channel.createMessage(`:no_entry: \`You are not a bot admin!\``);
                return;
            }
            if (cmd.ownerOnly && message.member.id != config.getGlobal().botOwner) {
                await message.channel.createMessage(`:no_entry: \`You are not the owner of this bot!\``);
                return;
            }

            if (subCmd) {
                await subCmd(bot, message, fullMsg.substring(args[0].length + args[1].length + 2), args);
            }
            else {
                await cmd.baseCmd(bot, message, fullMsg.substring(args[0].length + 1), args);
            }
        }
    });

    logger.ok();
    logger.logInfo(`Ready! Logged in as ${bot.user.username}#${bot.user.discriminator}`);
}