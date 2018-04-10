'use strict';

const async = require('async');
const config = require('config-lite')(__dirname);
const util = require('../common/util');
const md5 = require('blueimp-md5');
const Base = require('../lib/base');

let User = new Base({
    tableName: 'user',
    keyId: 'id'
});

User.resetPwd = (params, callback) => {
    let opts = {
        id: params.id,
        password: User.getUserPwd(params.password)
    };
    User.update(opts, (err, user) => {
        if(err) return callback(err);
        callback(null, User.omitAllSecret(user));
    });
}

User.getUserInfo = (id, callback) => {
    User.findOne({
        id: id
    }, (err, user) => {
        if(err || !user) return callback('用户不存在');
        callback(null, User.omitPwd(user));
    });
}

User.getUserByName = (name, callback) => {
    User.findOne({
        name: name
    }, (err, user) => {
        if(err || !user) return callback(err || {
            result: 700,
            message: '用户不存在'
        });
        callback(null, User.omitAllSecret(user));
    });
}

User.getUserPwd = (str) => {
    return md5(str + config.mysql.pwdKey);
}

User.login = (params, callback) => {
    let password = User.getUserPwd(params.password);
    User.findOne({
        $or: [
            {name: params.name},
            {phone: params.name}
        ],
        password: password
    }, (err, user) => {
        if(err || !user) return callback(err || '用户不存在');
        callback(null, User.omitForLogin(user));
    });
}
User.updatePwd = (params, callback) => {
    params.password = User.getUserPwd(params.password);
    params.oldPwd   = User.getUserPwd(params.oldPwd);

    async.waterfall([
        (next) => {
            User.update({
                password: params.password,
                id: params.id
            }, next, {
                id: params.id,
                name: params.name,
                password: params.oldPwd
            });
        }
    ], (err) => {
        callback(err);
    });
}

User.register = (params, callback) => {
    let password  = User.getUserPwd(params.password)
    params.password = password;
    User.findOne({
        $or: [{name: params.name}, {phone: params.phone}]
    }, (err, user) => {
        if(err || user) return callback(err || '用户名已存在');
        User.create(params, (err, user) => {
            if(err) return callback(err);
            callback(null, User.omitForLogin(user));
        });
    });
};

User.getByIds = (ids, callback) => {
    User.find({
        id: {
            $in: ids
        }
    }, (err, users) => {
        if(err) return callback(err);
        let datas = {};
        users.map(u => {
            datas[u.id] = {
                ownerType: 'company',
                name: u.name,
                fullName: u.fullName,
                phone: u.phone
            };
        });
        return callback(null, datas);
    });
}

User.omitPwd = (obj) => {
    let v = obj.dataValues || obj;
    return util.omit(v, ['password']);
}

User.omitForLogin = (obj) => {
    if(!obj) return null;
    let v = obj.dataValues || obj;
    return util.omit(v, ['password', 'email']);
}

User.omitAllSecret = (obj) => {
    if(!obj) return null;
    let v = obj.dataValues || obj;
    return util.omit(v, ['password', 'email', 'phone']); //删掉用户的一些敏感字段
}
module.exports = User;
