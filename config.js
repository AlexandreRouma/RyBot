const fs = require('fs');
const Sequelize = require('sequelize');

const DEFAULT_GLOBAL = {
    token: '',
    modules: '',
    botOwner: '274976585650536449',
    tempPunishmentCheckInterval: 60000,
    status: '',
};

const DEFAULT_SERVER = {
    adminRole: '',
    prefix: ';',
    embedColor: '#FF0000',
    mutedRole: '',
};

let path = '';
let gconfig = {};
let sequelize;
let sconfig;

function migrate(oldCnf, newCnf, remove = true) {
    if (!oldCnf || !newCnf) {
        return;
    }
    let migrated = {};
    if (!remove) {
        migrated = oldCnf;
    }
    let keys = Object.keys(newCnf);
    for (let i = 0; i < keys.length; i++) {
        if (!oldCnf[keys[i]]) {
            migrated[keys[i]] = newCnf[keys[i]];
        }
        else {
            migrated[keys[i]] = oldCnf[keys[i]];
        }
    }
    return migrated;
}

module.exports.init = async (jsonpath, sqlitepath) => {
    if (!fs.existsSync(jsonpath)) {
        fs.writeFileSync(jsonpath, JSON.stringify(DEFAULT_GLOBAL, undefined, 4));
    }
    gconfig = migrate(JSON.parse(fs.readFileSync(jsonpath)), DEFAULT_GLOBAL, false);
    fs.writeFileSync(jsonpath, JSON.stringify(gconfig, undefined, 4));

    sequelize = new Sequelize('', '', '', {
        dialect: 'sqlite',
        operatorsAliases: false,
        storage: sqlitepath,
        logging: false
    });

    sconfig = sequelize.define('config', {
        serverId: {
            type: Sequelize.STRING
        },
        config: {
            type: Sequelize.STRING
        }
    });

    await sequelize.sync();
};

module.exports.getGlobal = () => {
    return gconfig;
};

module.exports.setGlobal = (config) => {
    gconfig = config;
    fs.writeFileSync(path, JSON.stringify(gconfig, undefined, 4));
};

async function addServer(server) {
    await sconfig.create({
        serverId: server,
        config: JSON.stringify(DEFAULT_SERVER)
    });
}

module.exports.get = async (server) => {
    let _config = await sconfig.findOne({
        where: {
            serverId: server
        }
    });
    if (_config == null) {
        addServer(server);
        return DEFAULT_SERVER;
    }
    let config = JSON.parse(_config.get('config'));
    if (Object.keys(config).length != Object.keys(DEFAULT_SERVER).length) {
        config = migrate(config, DEFAULT_SERVER);
        module.exports.set(server, config);
    }
    return config;
};

module.exports.set = async (server, config) => {
    await sconfig.update({
        config: JSON.stringify(config)
    },
    {
        where: {
            serverId: server
        }
    });
};

async function addOther(entry, def) {
    await sconfig.create({
        serverId: entry,
        config: JSON.stringify(def)
    });
}

module.exports.getOther = async (entry, def = {}) => {
    let _data = await sconfig.findOne({
        where: {
            serverId: entry
        }
    });
    if (_data == null) {
        addOther(entry, def);
        return def;
    }
    let data = JSON.parse(_data.get('config'));
    if (Object.keys(data).length != Object.keys(def).length) {
        data = migrate(data, def);
        module.exports.set(entry, data);
    }
    return data;
};

module.exports.setOther = async (entry, data) => {
    await sconfig.update({
        config: JSON.stringify(data)
    },
    {
        where: {
            serverId: entry
        }
    });
};