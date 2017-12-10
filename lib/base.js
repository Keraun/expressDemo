'use strict';

const methods = require('./dbMethod');

let Base = function(opts) {
    this.tableName = opts.tableName;
    this.keyId = opts.keyId;
};
Base.prototype = {};

Base.prototype.count = function(where, callback) {
    methods.count(this.tableName, where, callback);
}

Base.prototype.create = function(params, callback) {
    methods.create(this.tableName, params, callback);
}

Base.prototype.relateFind = function(relateTbName, where, relateField, callback) {
    methods.relateFind(this.tableName, relateTbName, where, relateField, callback);
}

Base.prototype.bulkCreate = function(list, fields, callback) {
    methods.bulkCreate(this.tableName, list, fields, callback);
}

Base.prototype.findOrCreate = function(params, callback) {
    methods.findOrCreate(this.tableName, params.where, params.defaults, callback)
}

Base.prototype.findOne = function(params, callback, opts) {
    methods.findOne(this.tableName, params, callback, opts)
}

Base.prototype.findById = function(id, callback, returnType) {
    methods.findById(this.tableName, id, callback, returnType);
}
Base.prototype.find = function(params, callback, opts) {
    methods.findAll(this.tableName, params, callback, opts)
}
Base.prototype.findAll = function(params, callback, opts) {
    methods.findAll(this.tableName, params, callback, opts)
}
Base.prototype.findAndCountAll = function(params, callback, attributes) {
    methods.findAndCountAll(this.tableName, params, callback, attributes)
}

Base.prototype.updateById = function(params, callback) {
    methods.update(this.tableName, params, this.keyId, callback);
}

Base.prototype.update = function(params, callback, where) {
    if (where) {
        methods.conditionUpdate(this.tableName, params, where, callback);
    } else {
        methods.update(this.tableName, params, this.keyId, callback);
    }
}
//慎用，小数不精确
Base.prototype.sum = function(field, where, callback) {
    methods.sum(this.tableName, field, where, callback);
};

Base.prototype.destroy = function(params, callback) {
    methods.destroy(this.tableName, params, callback);
}

module.exports = Base;
