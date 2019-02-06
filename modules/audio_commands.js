const logger = require('../logger');
const ytdl = require('ytdl-core');
const fs = require('fs');
const config = require('../config');
const modHelper = require('../modHelper');
const embedBuilder = require('../embedBuilder');
const moment = require('moment');
const momentDurationFormatSetup = require('moment-duration-format');

// Require Eris for synthax highlight
// eslint-disable-next-line no-unused-vars
const Eris = require('eris');

let playlist = {};

module.exports._mod_info = {
    name: 'audio_commands',
    description: 'Audio commands for RyBot',
    author: 'Ryzerth',
};

module.exports._mod_init = (bot) => {
    logger.log(`Initializing audio_commands...`);
    if (!fs.existsSync(`${config.getGlobal().modules}/youtube_api.js`)) {
        logger.failed();
        return 'Unmet dependency: rextester_api';
    }
    momentDurationFormatSetup(moment);
    logger.ok();
};

module.exports._mod_end = (bot) => {
    logger.log(`Stopping audio_commands...`);
    // TODO: Stop all instances
    let instances = Object.keys(playlist);
    for (let i = 0; i < instances.length; i++) {
        playlist[instances[i]].stop();
    }
    logger.ok();
};

module.exports.play = {
    name: 'play',
    usage: 'play [url/search]',
    description: 'Play some music',
    adminOnly: false,
    ownerOnly: false,
    /**
     * @param {Eris.Client} bot Text channel
     * @param {Eris.Message} message Discord message
     * @param {Eris.Message} text Text after the command
     * @param {string[]} args Discord message
     */
    baseCmd: async (bot, message, text, args) => {
        if (!playlist[message.channel.guild.id]) {
            playlist[message.channel.guild.id] = new Playlist(bot);
        }
        if (message.member.voiceState.channelID == null) {
            message.channel.createMessage(`:no_entry: \`You are not in a voice channel!\``);
            return;
        }
        if (playlist[message.channel.guild.id].playlist.length > 0 && message.member.voiceState.channelID != playlist[message.channel.guild.id].channelID) {
            message.channel.createMessage(`:no_entry: \`You are not in the same channel as the bot!\``);
            return;
        }
        let videos = await modHelper.modules['youtube_api']._search(text, { maxResults: 1, type: 'video' });
        if (videos.length == 0) {
            message.channel.createMessage(`:no_entry: \`Cannot find this video on youtube!\``);
            return;
        }
        let video = await modHelper.modules['youtube_api']._getVideo(videos[0].id, true);
        let channel = await modHelper.modules['youtube_api']._getChannel(video.channel.id, true);
        let conf = await config.get(message.channel.guild.id);
        let embed = new embedBuilder.Embed();
        let duration = video.duration.seconds + (video.duration.minutes * 60) + (video.duration.hours * 3600);
        embed.setAuthor(video.title, `https://www.youtube.com/watch?v=${video.id}`, channel.raw.snippet.thumbnails.default.url);
        embed.setDescription(video.description.substring(0, Math.min(150, video.description.length)));
        embed.setColor(conf.embedColor);
        embed.setThumbnail(video.thumbnails.default.url);
        embed.setFooter(moment.duration(duration, 'seconds').format('hh:mm:ss'));
        playlist[message.channel.guild.id].play(message.member.voiceState.channelID, {
            url: `https://www.youtube.com/watch?v=${video.id}`,
            title: video.title,
            member: message.member,
            thumbnail: video.thumbnails.default.url,
            duration: duration,
            tag: video,
        });
        message.channel.createMessage({
            content: `:white_check_mark: \`"${video.title}" has been added to the playlist\``,
            embed: embed.get(),
        });
    },
};

module.exports.stop = {
    name: 'stop',
    usage: 'stop',
    description: 'Stop playing music',
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
        if (!playlist[message.channel.guild.id]) {
            playlist[message.channel.guild.id] = new Playlist(bot);
        }
        if (message.member.voiceState.channelID == null) {
            message.channel.createMessage(`:no_entry: \`You are not in a voice channel!\``);
            return;
        }
        if (message.member.roles.includes(conf.adminRole)) {
            message.channel.createMessage(`:white_check_mark: \`Stopping...\``);
            playlist[message.channel.guild.id].stop();
            return;
        }
        if (playlist[message.channel.guild.id].stopVotes[message.member.id]) {
            message.channel.createMessage(`:no_entry: \`You already voted.\``);
            return;
        }
        playlist[message.channel.guild.id].stopVotes[message.member.id] = true;

        let voteCount = Object.keys(playlist[message.channel.guild.id].stopVotes).length;
        let memberCount = bot.getChannel(playlist[message.channel.guild.id].channelID).voiceMembers.length;
        if (voteCount >= Math.floor(memberCount)) {
            message.channel.createMessage(`:white_check_mark: \`Stopping...\``);
            playlist[message.channel.guild.id].stop();
        }
        else {
            message.channel.createMessage(`:white_check_mark: \`${Math.floor(memberCount) - voteCount} more votes needed to stop.\``);
        }
    },
};

module.exports.skip = {
    name: 'skip',
    usage: 'skip',
    description: 'Go to the next song',
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
        if (!playlist[message.channel.guild.id]) {
            playlist[message.channel.guild.id] = new Playlist(bot);
        }
        if (message.member.voiceState.channelID == null) {
            message.channel.createMessage(`:no_entry: \`You are not in a voice channel!\``);
            return;
        }
        if (message.member.roles.includes(conf.adminRole)) {
            message.channel.createMessage(`:white_check_mark: \`Skipping...\``);
            playlist[message.channel.guild.id].next();
            return;
        }
        if (playlist[message.channel.guild.id].skipVotes[message.member.id]) {
            message.channel.createMessage(`:no_entry: \`You already voted.\``);
            return;
        }
        playlist[message.channel.guild.id].skipVotes[message.member.id] = true;

        let voteCount = Object.keys(playlist[message.channel.guild.id].skipVotes).length;
        let memberCount = bot.getChannel(playlist[message.channel.guild.id].channelID).voiceMembers.length;
        if (voteCount >= Math.floor(memberCount)) {
            message.channel.createMessage(`:white_check_mark: \`Skipping...\``);
            playlist[message.channel.guild.id].next();
        }
        else {
            message.channel.createMessage(`:white_check_mark: \`${Math.floor(memberCount) - voteCount} more votes needed to skip.\``);
        }
    }
};

module.exports.playlist = {
    name: 'playlist',
    usage: 'playlist',
    description: 'List all songs in the playlist',
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
        if (!playlist[message.channel.guild.id]) {
            playlist[message.channel.guild.id] = new Playlist(bot);
        }
        if (playlist[message.channel.guild.id].playlist.length == 0) {
            message.channel.createMessage(`:no_entry: \`Nothing is being played at the moment.\``);
            return;
        }
        let list = '';
        let _playlist = playlist[message.channel.guild.id].playlist;
        let estimatedDuration = 0;
        for (let i = 0; i < _playlist.length; i++) {
            estimatedDuration += _playlist[i].duration;
            if (i == 0) {
                list += `**${i + 1}. \`[${moment.duration(_playlist[i].duration, 'seconds').format('hh:mm:ss')}]\` [${_playlist[i].title}](${_playlist[i].url}) (*${_playlist[i].member.username}#${_playlist[i].member.discriminator}*)**\n`;
            }
            else {
                list += `${i + 1}. \`[${moment.duration(_playlist[i].duration, 'seconds').format('hh:mm:ss')}]\` [${_playlist[i].title}](${_playlist[i].url}) (*${_playlist[i].member.username}#${_playlist[i].member.discriminator}*)\n`;
            }
        }
        let embed = new embedBuilder.Embed();
        embed.setTitle('Playlist');
        embed.setDescription(list);
        embed.setColor(conf.embedColor);
        embed.setThumbnail(_playlist[0].thumbnail);
        embed.setFooter(`Estimated duration: ${moment.duration(estimatedDuration, 'seconds').format('hh:mm:ss')}`);
        message.channel.createMessage({
            embed: embed.get()
        });
    }
};

class Playlist {
    /**
     * @param {Eris.Client} bot Text channel
     */
    constructor(bot) {
        this.bot = bot;
        this.playlist = [];
        this.skipVotes = [];
        this.stopVotes = [];
    }

    play(channelID, item) {
        this.channelID = channelID;
        this.bot.joinVoiceChannel(channelID).catch((err) => { // Join the user's voice channel
            console.log(err); // Log the error
        }).then((connection) => {
            this.connection = connection;
            this.playlist.push(item);
            if (!connection.playing) { // Stop playing if the connection is playing something
                connection.play(ytdl(this.playlist[0].url));
                connection.on('end', () => {
                    if (this.playlist.length == 0) {
                        return;
                    }
                    if (this.connection.playing) {
                        this.connection.stopPlaying();
                    }
                    this.playlist.shift();
                    if (this.playlist.length == 0) {
                        this.stop();
                        return;
                    }
                    this.connection.play(ytdl(this.playlist[0].url));
                });
            }
        });
    }

    next() {
        this.skipVotes = [];
        this.stopVotes = [];
        this.connection.stopPlaying();
    }

    stop() {
        this.playlist = [];
        this.skipVotes = [];
        this.stopVotes = [];
        if (!this.connection) {
            return;
        }
        if (this.connection.playing) {
            this.connection.stopPlaying();
        }
        this.bot.leaveVoiceChannel(this.channelID);
    }
}