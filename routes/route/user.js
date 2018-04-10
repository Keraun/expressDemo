const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const sha1 = require('sha1');
const checkNotLogin = require('../../middlewares/check').checkNotLogin;
const checkLogin = require('../../middlewares/check').checkLogin;

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
router.post('/xxx/register', checkNotLogin, function(req, res, next) {
    let { name, gender, bio, password, repassword } = req.body;

    // 校验参数
    try {
        if (!(name.length >= 1 && name.length <= 20)) {
            throw '名字请限制在 1-10 个字符';
        }
        if (name != 'wuly93@163.com') {
            throw '名字请输入wuly93@163.com';
        }
        if (['m', 'f', 'x'].indexOf(gender) === -1) {
            throw '您的性别系统无法识别~';
        }
        // if (!(bio.length >= 1 && bio.length <= 30)) {
        //     throw '个人简介请限制在 1-30 个字符';
        // }
        if (password.length < 6) {
            throw '密码至少 6 个字符';
        }
        if (password !== repassword) {
            throw '两次输入密码不一致';
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

// POST /signup 用户登录
router.post('/xxx/login', function(req, res, next) {
    let { name, password } = req.body;

    // 校验参数
    try {
        if (!(name.length >= 1 && name.length <= 20)) {
            throw '名字请限制在 1-10 个字符';
        }
        if (password === '') {
            throw '密码不能为空';
        }

    } catch (e) {
        return res.send({result: 100, message: e, data: {} });
    }

    // 待写入数据库的用户信息
    let user = {
      name: name,
      password: sha1(password),
    };

    User.login(user, function(err, info) {
        console.log('user login', err, info)
        if(err) {
            return res.send({result: 700, message: err, data: info})
        }
        req.session.user = info;
        return res.send({result: 100, message: '登录成功', data: info})
    });
});


// GET /signout 登出
router.get('/xxx/logout', checkLogin, function(req, res, next) {
  // 清空 session 中用户信息
  req.session.user = null;
  return res.send({result: 100, message: '注销成功', data: {}})
});


module.exports = router;
