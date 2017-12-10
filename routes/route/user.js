const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const sha1 = require('sha1');
const checkNotLogin = require('../../middlewares/check').checkNotLogin;
const util = require('../../common/util');
const User = require('../../control/controlUser');

/* GET users listing. */
router.get('/getUserInfo', function(req, res, next) {
    let userInfo = req.session.user;
    User.getUserInfo(userInfo.id, (err, userInfo )=> {
     if(err) {
        return res.send({result: 700, message: err });
     }
     return res.send({result: 100, message: '', data: userInfo});
   });
});

// POST /signup 用户注册
router.post('/register', checkNotLogin, function(req, res, next) {
    let { name, gender, bio, password, repassword } = req.body;
    // 校验参数
    try {

        if (!(name.length >= 1 && name.length <= 20)) {
            throw new Error('名字请限制在 1-10 个字符');
        }
        if (['m', 'f', 'x'].indexOf(gender) === -1) {
            throw new Error('您的性别系统无法识别~');
        }
        if (!(bio.length >= 1 && bio.length <= 30)) {
            throw new Error('个人简介请限制在 1-30 个字符');
        }
        if (password.length < 6) {
            throw new Error('密码至少 6 个字符');
        }
        if (password !== repassword) {
            throw new Error('两次输入密码不一致');
        }

    } catch (e) {
        return res.send({result: 100, message: e, data: {} });
    }

    // 待写入数据库的用户信息
    let user = {
      name: name,
      password: sha1(password),
      gender: gender,
      bio: bio
    };

    User.register(user, function(err, info) {
        if(err) {
            return res.send({result: 100, message: err, data: info})
        }
        req.session.user = info;
        return res.send({result: 100, message: '注册成功', data: info})
    });
});


module.exports = router;
