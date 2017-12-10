'use strict';

var config = require('config-lite')(__dirname)
const util = require('../common/util');
const Sequelize = require('sequelize');
const fs = require('fs');
const Path = require('path');

let internals = {
    initialized: false,
};

let sequelize;

let initDb = (next) => {
    next = e => {
        console.log(e);
    }

    if (internals.initialized) return;

    let seq = new Sequelize(
        config.mysql.dataBase,
        config.mysql.userName,
        config.mysql.localPwd,
        {
            port: config.mysql.port,
            timezone: '+08:00',
            host: config.mysql.host,
            dialect: 'mysql',
            logging: config.mysql.log
        }
    );

    sequelize = seq;
    hackSequelize();

    loadModels(Path.resolve(__dirname, './models'));
    internals.initialized = true;
}

let getSeql = () => {
    return sequelize;
}
let getModel = (name) => {
    let sequelize = getSeql();
    return sequelize.model(name);
}
module.exports = {
    initDb: initDb,
    getSeql: getSeql,
    getModel: getModel,
    Sequelize: Sequelize,
    sequelize: sequelize,
    loadModels: loadModels,
    loadModel: loadModel,
    createTables: createTables,
    dropTables: dropTables
};


function hackSequelize() {
    var _define = Sequelize.prototype.define;

    Sequelize.prototype.define = function(modelName, attributes, options) {
        options = util.defaults({}, options, {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            deletedAt: 'deleted_at',
        });
        _define.call(this, modelName, attributes, options);
    };
}

function loadModel(path) {
    require(path).model(sequelize, Sequelize);
}

function loadModels(folder) {
    let filenames = fs.readdirSync(folder);
    filenames.map(function(file) {
        loadModel(Path.join(folder, file));
    });
}

function createTables(options) {
    sequelize.sync(options);
}

function dropTables() {
    sequelize.drop();
}
