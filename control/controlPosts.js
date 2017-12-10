'use strict';

const async = require('async');
const config = require('config-lite')(__dirname);
const util = require('../common/util');
const md5 = require('blueimp-md5');
const Base = require('../lib/base');

let Posts = new Base({
    tableName: 'posts',
    keyId: 'id'
});

Posts.createPost = (params, callback) => {
    Posts.create(params, (err, data) => {
        if(err) return callback(err);
        callback(null, util.omit(data, ['content']));
    });
}

Posts.getById = (id, callback) => {
    Posts.findById(id, (err, data) => {
        if(err) return callback(err);
        return callback(null, data);
    });
}

Posts.deleteById = (id, callback) => {
    Posts.destroy({postId: id}, (err, data) => {
        if(err) return callback(err);
        return callback(null, data);
    });
}

Posts.getList = (where, callback ,opts) => {
    Posts.findAndCountAll(where, (err, data) => {
        if(err) return callback(err);
        return callback(null, data);
    }, opts);
}


module.exports = Posts;
