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
                    module.exports.commands[mod[funcs[j]].alias].isAlias = true;
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

function bool2YN(b) {
    if (b) {
        return 'Yes';
    }
    else {
        return 'No ';
    }
}

module.exports.getMarkdownHelp = () => {
    let str = '';
    let name_l = 0;
    let alias_l = 0;
    let usage_l = 0;
    let desc_l = 0;
    let cmds = module.exports.commands;
    let ids = Object.keys(cmds);
    for (let i = 0; i < ids.length; i++) {
        let cmd = cmds[ids[i]];
        if (cmd.name.length > name_l) {
            name_l = cmd.name.length;
        }
        if (cmd.usage.length > usage_l) {
            usage_l = cmd.usage.length;
        }
        if (cmd.description.length > desc_l) {
            desc_l = cmd.description.length;
        }
        if (cmd.alias) {
            if (cmd.alias.length > alias_l) {
                alias_l = cmd.alias.length;
            }
        }
    }
    str += `| Name${' '.repeat(name_l - 'Name'.length)} | Alias${' '.repeat(alias_l - 'Alias'.length)} | Usage${' '.repeat(usage_l - 'Usage'.length)} | Admin | Owner | Description${' '.repeat(desc_l - 'Description'.length)} |\n`;
    str += `|${'-'.repeat(name_l + 2)}|${'-'.repeat(alias_l + 2)}|${'-'.repeat(usage_l + 2)}|-------|-------|${'-'.repeat(desc_l + 2)}|\n`;
    let processed = {};
    for (let i = 0; i < ids.length; i++) {
        let cmd = cmds[ids[i]];
        if (processed[cmd.name]) {
            continue;
        }
        let alias = ' '.repeat(alias_l);
        if (cmd.alias) {
            alias = cmd.alias + ' '.repeat(alias_l - cmd.alias.length);
        }
        str += `| ${cmd.name + ' '.repeat(name_l - cmd.name.length)} | ${alias} | ${cmd.usage + ' '.repeat(usage_l - cmd.usage.length)} | ${bool2YN(cmd.adminOnly)}   | ${bool2YN(cmd.ownerOnly)}   | ${cmd.description + ' '.repeat(desc_l - cmd.description.length)} |\n`;
        processed[cmd.name] = true;
    }
    return str;
};