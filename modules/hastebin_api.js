const querystring = require('querystring');
const https = require('https');
const logger = require('../logger');

module.exports._mod_info = {
    name: 'hastebin_api',
    description: 'Hastebin API',
    author: 'Ryzerth',
    version: '1.0.0'
};

module.exports._mod_init = (bot) => {
    logger.log(`Initializing hastebin_api...`);
    // TODO: Add shit idk
    logger.ok();
};

module.exports._mod_end = (bot) => {
    logger.log(`Stopping hastebin_api...`);
    // TODO: Add shit idk
    logger.ok();
};

module.exports._post = async (text) => {
    return new Promise((res) => {
        hastebin(text, (key) => {
            res(`https://hastebin.com/${key}`);
        });
    });
};

function hastebin(text, callback) {
    const options = {
        hostname: 'hastebin.com',
        port: 443,
        path: '/documents',
        method: 'post',
        headers: {
            'Content-Length': text.length
        }
    };
    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (d) => {
            data += d;
        });
        res.on('end', (d) => {
            callback(JSON.parse(data).key);
        });
    });
    req.on('error', (e) => {
        console.error(e);
    });
    req.write(text);
    req.end();
}