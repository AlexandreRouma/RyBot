const logger = require('../logger');
const config = require('../config');
const ytapi = require('simple-youtube-api');

let youtube;

module.exports._mod_info = {
    name: 'youtube_api',
    description: 'YouTube API',
    author: 'Ryzerth',
};

module.exports._mod_init = (bot) => {
    logger.log(`Initializing youtube_api...`);
    if (!config.getGlobal().googleApiKey) {
        logger.failed();
        return 'Missing Google API key in configuration';
    }
    try {
        youtube = new ytapi(config.getGlobal().googleApiKey);
    }
    catch (err) {
        logger.failed();
        return 'Wrong YouTube API key!';
    }
    logger.ok();
};

module.exports._mod_end = (bot) => {
    logger.log(`Stopping youtube_api...`);
    // TODO: Add shit idk
    logger.ok();
};

module.exports._search = async (search, opt = undefined) => {
    return youtube.search(search, undefined, opt);
};

module.exports._getVideo = async (id, byId = false) => {
    if (byId) {
        return youtube.getVideoByID(id);
    }
    return youtube.getVideo(id);
};

module.exports._getPlaylist = async (id, byId = false) => {
    if (byId) {
        return youtube.getPlaylistByID(id);
    }
    return youtube.getPlaylist(id);
};

module.exports._getChannel = async (id, byId = false) => {
    if (byId) {
        return youtube.getChannelByID(id);
    }
    return youtube.getChannel(id);
};
