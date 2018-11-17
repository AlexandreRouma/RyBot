const config = require('./config');
const logger = require('./logger');
const fs = require('fs');

module.exports.modules = {};
module.exports.commands = {};

module.exports.check = (mod) => {
    if (!mod._mod_init || !mod._mod_end || !mod._mod_info) {
        return false;
    }
    return true;
};

module.exports.checkCommand = (cmd) => {
    if (!cmd.name || !cmd.description || !cmd.usage || cmd.adminOnly == undefined || !cmd.baseCmd) {
        return false;
    }
    return true;
};

module.exports.load = (bot) => {
    let modules = fs.readdirSync(config.getGlobal().modules);
    let modDir = config.getGlobal().modules;
    let totalCmd = 0;
    let totalMod = 0;
    for (let i = 0; i < modules.length; i++) {
        let name = modules[i].split('.')[0];
        logger.log(`Loading ${name}...`);
        let mod;
        try {
            mod = require(`${modDir}/${name}`);
        }
        catch (err) {
            logger.failed();
            logger.panic(`Could not load ${name}: ${err}`);
        }
        if (!module.exports.check(mod)) {
            logger.failed();
            logger.panic(`Invalid module: ${name}`);
        }
        module.exports.modules[name] = mod;
        logger.info();
        let init = mod._mod_init(bot);
        if (init) {
            logger.panic(init);
            return;
        }
        logger.log(`Loading commands from ${name}...`);
        let funcs = Object.keys(mod);
        let cmdCount = 0;
        for (let j = 0; j < funcs.length; j++) {
            if (!funcs[j].startsWith('_')) {
                if (!module.exports.checkCommand(mod[funcs[j]])) {
                    logger.failed();
                    logger.panic(`Invalid command in module ${name}: ${funcs[j]}`);
                }
                if (module.exports.commands[mod[funcs[j]].name] || module.exports.commands[mod[funcs[j]].alias]) {
                    logger.failed();
                    logger.panic(`Command conflict in module ${name}: ${funcs[j]}`);
                }
                if (mod[funcs[j]].name != funcs[j]) {
                    logger.failed();
                    logger.panic(`Name missmatch in module ${name}: ${funcs[j]}`);
                }
                module.exports.commands[mod[funcs[j]].name] = mod[funcs[j]];
                if (mod[funcs[j]].alias) {
                    module.exports.commands[mod[funcs[j]].alias] = mod[funcs[j]];
                }
                cmdCount++;
                totalCmd++;
            }
        }
        logger.ok();
        logger.logInfo(`Loaded ${cmdCount} commands from ${name}`);
        totalMod++;
    }
    logger.logInfo(`Loaded a total ${totalCmd} commands from ${totalMod} modules.`);
};

module.exports.reload = (bot) => {
    logger.logInfo('Module reload triggered!');
    let modDir = config.getGlobal().modules;
    let modules = Object.keys(module.exports.modules);
    for (let i = 0; i < modules.length; i++) {
        module.exports.modules[modules[i]]._mod_end(bot);
        delete require.cache[require.resolve(`${modDir}/${modules[i]}.js`)];
    }
    module.exports.commands = {};
    module.exports.modules = {};
    module.exports.load(bot);
};