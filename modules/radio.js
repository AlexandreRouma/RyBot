const logger = require('../logger');
const config = require('../config');
const modHelper = require('../modHelper');
const embedBuilder = require('../embedBuilder');

// Require Eris for synthax highlight
// eslint-disable-next-line no-unused-vars
const Eris = require('eris');

// Physics constants
const speedOfLight = 299792458; // m/s

module.exports._mod_info = {
    name: 'code_commands',
    description: 'Q&A plugin for Signals Everywhere',
    author: 'Ryzerth',
    version: '1.0.0'
};

let calculators = {
    dipole: async (freq, baseFreq, message) => {
        let conf = await config.get(message.channel.guild.id);
        let embed = new embedBuilder.Embed();
        embed.setColor(conf.embedColor);
        embed.setAuthor(`${message.author.username}#${message.author.discriminator}'s dipole`, undefined, message.author.avatarURL);
        embed.addField('Frequency', baseFreq, true);
        embed.addField('Full length', `${((speedOfLight / freq) / 2).toFixed(3)}m`, true);
        embed.addField('Leg length', `${((speedOfLight / freq) / 4).toFixed(3)}m`, true);
        message.channel.createMessage({
            embed: embed.get()
        });
    }
};

module.exports._mod_init = (bot) => {
    logger.log(`Initializing code_commands...`);
    logger.ok();
};

module.exports._mod_end = (bot) => {
    logger.log(`Stopping code_commands...`);
    logger.ok();
};

module.exports.antenna = {
    name: 'antenna',
    usage: 'antenna [type/list] [frequency] ([range])',
    alias: 'ant',
    description: 'Calculate the dimensions of an antenna from its resonent frequency. The possible ranges are: Hz, KHz, MHz, GHz. Default is Hz',
    adminOnly: false,
    ownerOnly: false,
    /**
     * @param {Eris.Client} bot Text channel
     * @param {Eris.Message} message Discord message
     * @param {Eris.Message} text Text after the command
     * @param {string[]} args Discord message
     */
    baseCmd: async (bot, message, text, args) => {
        if (args.length != 3 && args.length != 4) {
            modHelper.modules['misc_commands']._help(message.channel, module.exports.antenna);
            return;
        }
        if (!calculators[args[1]]) {
            message.channel.createMessage(`:no_entry: \`Unknown antenna type, use the list option to list all antenna types.\``);
            return;
        }
        let freq = Number(args[2]);
        if (isNaN(freq)) {
            message.channel.createMessage(`:no_entry: \`Invalid frequency\``);
            return;
        }
        let baseFreq = `${freq} `;
        if (args.length == 4) {
            if (args[3].toUpperCase() == 'HZ') {
                // Do nothing
            }
            else if (args[3].toUpperCase() == 'KHZ') {
                freq *= 1000;
                baseFreq += 'kHz';
            }
            else if (args[3].toUpperCase() == 'MHZ') {
                freq *= 1000000;
                baseFreq += 'MHz';
            }
            else if (args[3].toUpperCase() == 'GHZ') {
                freq *= 1000000000;
                baseFreq += 'GHz';
            }
            else {
                message.channel.createMessage(`:no_entry: \`Invalid range\``);
                return;
            }
        }
        calculators[args[1]](freq, baseFreq, message);
    },
    subCmds: {
        list: async (bot, message, text, args) => {
            let conf = await config.get(message.channel.guild.id);
            let calcList = '';
            let calcs = Object.keys(calculators);
            for (let i = 0; i < calcs.length; i++) {
                calcList += `${calcs[i]}\n`;
            }
            let embed = new embedBuilder.Embed();
            embed.setTitle('Antenna list');
            embed.setDescription(calcList);
            embed.setColor(conf.embedColor);
            message.channel.createMessage({
                embed: embed.get()
            });
        }
    }
};