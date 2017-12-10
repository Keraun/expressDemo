'use strict';

const getModel = require('./database').getModel;
const Sequelize = require('sequelize');
const util = require('../common/util');
let Methods = {};

let getErrorMsg = (err) => {
    if(err && err.message) return err.message;
    return err;
}

Methods.count = (type, where, callback) => {
    const Model = getModel(type);
    Model.count({
        where: where
    }).then(function(sum) {
        callback(null, sum);
    }).catch((e) => {
        callback(getErrorMsg(e))
    });
}

Methods.sum = (type, field, where, callback) => {
    const Model = getModel(type);
    field = util.snakeCase(field);
    Model.sum(field, {
        where: where
    }).then(function(sum) {
        callback(null, sum);
    }).catch((e) => {
        callback(getErrorMsg(e))
    });
}

Methods.create = (type, data, callback) => {
    const Model = getModel(type);
    data = util.snakeCaseField(data);

    Model.create(data).then(function(item) {
        item = util.camelCaseField(item.dataValues);
        callback(null, item);
    }).catch(e => {
        callback(getErrorMsg(e));
    });
}

Methods.upset = (type, data, idKey, callback) => {
    const Model = getModel(type);
    data = util.snakeCaseField(data);

    Model.findById(data[idKey]).then(function(item) {
        if(!item) return callback({
            message: '修改的数据不存在'
        });
        if(data.userId && item.user_id !== data.userId) {
            return callback({
                message: '修改的数据不存在~'
            });
        }
        item.update(data).then((newData) => {
            item = util.camelCaseField(newData.dataValues);
            callback(null, item);
        });
    }).catch((e) => {
        callback(getErrorMsg(e))
    });
}

Methods.conditionUpdate = (type, data, where, callback) => {
    const Model = getModel(type);
    data = util.snakeCaseField(data);
    where = util.snakeCaseField(where);
    Model.update(data, {
        where: where
    }).then(function(item) {
        callback(null, item);
    }).catch(e => {
        callback(getErrorMsg(e))
    });
}

Methods.update = (type, data, idKey, callback) => {
    const Model = getModel(type);
    data = util.snakeCaseField(data);

    Model.findById(data[idKey]).then(function(item) {
        if(!item) return callback({
            message: '修改的数据不存在'
        });
        item.update(data).then(() => {
            item = util.camelCaseField(item.dataValues);
            callback(null, item);
        });
    }).catch(e => {
        callback(getErrorMsg(e))
    });
}
Methods.findById = (type, id, callback, returnType) => {
    const Model = getModel(type);
    Model.findById(id).then(function(item) {
        if(!item) return callback(null, null);
        if(returnType === 'model') return callback(null, item);
        callback(null, util.camelCaseField(item.dataValues));
    }).catch(e => {
        callback(getErrorMsg(e))
    });
};
let checkLike = (where) => {
    if(typeof where !== 'object' || where.hasOwnProperty('length')) {
        console.log('==========', where);
        return 'where 格式不对';
    }
    let str = JSON.stringify(where);
    let reg = /%.+%/;
    if(str.indexOf('$like') >= 0) {
        Object.keys(where).map(key => {
            let value = where[key];
            if(typeof value === 'object' && !value.hasOwnProperty('length')) {
                let v = where[key].$like;
                if(reg.test(v)) {
                    return '不支持这种 like 查询';
                }
            }

        });
    }
    return null;
}
Methods.findOrCreate = (tableName, where, defaults, callback) => {
    const Model = getModel(tableName);
    where = util.snakeCaseField(where);
    defaults = util.snakeCaseField(defaults);
    Model.findOrCreate({
        where: where,
        defaults: defaults
    }).then((x) => {
        if(!x.length) return callback(null, null);
        callback(null, x[0].dataValues);
    }).catch((e) => {
        callback(getErrorMsg(e));
    });
};

Methods.relateFind = (tableName, relateTbName, where, relateField, callback) => {
    /*
     * test
    Trade.relateFind('xcx_trade', 'trade_id', 'trade.id', (err, data) => {
        console.log(err,'==========', data);
    });
    */
    const Model = getModel(tableName);
    const relateModel = getModel(relateTbName);
    const _where = {};
    relateModel.belongsTo(Model);
    _where[where] = Sequelize.col(relateField);
    //TODO where assign
    Model.findAll({
        include: [{
            model: relateModel,
            where: _where
        }]
    }).then(x => {
        callback(null, x);
    }).catch(e => {
        callback(e);
    });
}

Methods.find = (type, tableName, where, callback, opts) => {
    const Model = getModel(tableName);
    if(where) {
        let validate = checkLike(where);
        if(validate) return callback(validate);
    } else {
        where = {};
    }
    let params = {
        where,
    };
    if(opts) {
        params = util.defaults(params, opts);
    }
    if(opts && opts.attributes) {
        params.attributes = util.snakeCaseField(opts.attributes);
    }
    params.where = util.snakeCaseField(params.where);

    Model[type](params).then(function(items) {
        if(type === 'findAndCountAll') {
            let rsp = {
                data: [],
                total: items.count
            };
            util.forEach(items.rows, item => {
                rsp.data.push(util.camelCaseField(item.dataValues));
            });
            callback(null, rsp);
            return;
        }
        let r = [];
        util.forEach(items, item => {
            r.push(util.camelCaseField(item.dataValues));
        });
        callback(null, r);
    }).catch(callback);
}

Methods.findAndCountAll = (tableName, where, callback, opts) => {
    Methods.find('findAndCountAll', tableName, where, callback, opts);
}

Methods.findAll = (tableName, where, callback, opts) => {
    Methods.find('findAll', tableName, where, callback, opts);
}

Methods.bulkCreate = (type, list, fields, callback) => {
    callback = callback || function() {};
    const Model = getModel(type);

    let l = [];
    list.map(item => {
        l.push(util.snakeCaseField(item));
    });
    fields = util.snakeCaseField(fields);
    Model.bulkCreate(l, { fields: fields }).then(function() {
        callback();
    }).catch((e) => {
        callback(getErrorMsg(e))
    });
}

Methods.findOne = (type, where, callback, opts) => {
    const Model = getModel(type);

    let validate = checkLike(where);
    if(validate) return callback(validate);
    where = util.snakeCaseField(where);
    let params = {
        where: where
    };
    if(opts && opts.order) {
        params.order = opts.order;
    }
    Model.findOne(params).then((x) => {
        if(!x) return callback(null, null);

        x = util.camelCaseField(x.dataValues);
        callback(null, x);
    }).catch((e) => {
        callback(getErrorMsg(e))
    });
}

Methods.destroy = (type, where, callback) => {
    const Model = getModel(type);
    where = util.snakeCaseField(where);
     Model.destroy({
        where: where
    }).then(function(destroyCount) {
        callback(null, destroyCount);
    }).catch((e) => {
        callback(getErrorMsg(e))
    });
}

module.exports = Methods;
