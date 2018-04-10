var express = require('express');
var router = express.Router();
const util = require('../../common/util');
const Posts = require('../../control/controlPosts');
const checkLogin = require('../../middlewares/check').checkLogin;


router.get('/manage', checkLogin, function(req, res, next) {
    let userInfo = req.session.user;
    if (userInfo) {
        return res.render('postsManage.ejs');
    } else {
        return res.redirect('/');
    }
});

router.get('/createPost', checkLogin, function(req, res, next) {
    res.render('createOrUpdatePost.ejs', {
        type: 'create'
    });
});

router.get('/editPost', checkLogin, function(req, res, next) {
    res.render('createOrUpdatePost.ejs', {
        type: 'update'
    });
});

router.post('/createPost', checkLogin, function(req, res, next) {
    let { content, markdown, author, title, time, status, image,description } = req.body;
    let { name } = author || req.session.user;
    let params = { content, markdown, author: name, title, time, status, image,description };
    if (time) {
        params.createdAt = time;
    }
    Posts.createPost(params, (err, data) => {
        if (err) {
            return res.send({ result: 100, data: {}, message: err });
        }
        res.send({ result: 100, data: data, message: '创建成功' });
    });
});

// GET /posts 所有用户或者特定用户的文章页
router.get('/getList', function(req, res, next) {
    let pageNo = Number(req.query.pageNo) || 1;
    let pageSize = Number(req.query.pageSize) || 10;
    let type = req.query.type || 'online';
    let offset = (pageNo - 1) * pageSize;
    let opts = {
        order: [
            ['created_at', 'desc']
        ],
        limit: pageSize,
        offset: offset
    }
    let where = {};
    if (type == 'all') {
        where.status = [1, 2]; //查询线上或草稿
    } else {
        where.status = 1; //查询线上
    }
    Posts.getList(where, (err, data) => {
        if (err) {
            console.log('err', err);
            return res.send({ result: 100, data: {}, message: '' });
        }
        res.send({ result: 100, data: data, message: '' });
    }, opts);
});

router.get('/deletePostById', checkLogin, function(req, res, next) {
    let postId = req.query.postId;
    if (!postId) {
        return res.send({ result: 100, data: {}, message: 'postId不能为空' });
    }
    let where = {
        postId: postId
    }
    Posts.deleteById({ status: 0 }, (err, data) => {
        if (err) {
            return res.send({ result: 100, data: {}, message: err });
        }
        let message = '删除成功';
        if (data == 0) {
            message = '该条记录不存在';
        }
        res.send({ result: 100, data: {}, message: message });
    }, where);
});

router.get('/getPostById', function(req, res, next) {
    let postId = req.query.postId;
    Posts.getById(postId, (err, data) => {
        if (err) {
            return res.send({ result: 100, data: {}, message: err });
        }
        res.send({ result: 100, data: data, message: '' });
    })
});

router.post('/updatePostById', checkLogin, function(req, res, next) {
    let { postId, content, markdown, author, title, time, status, image,description } = req.body;
    if (!postId) {
        return res.send({ result: 100, data: {}, message: 'postId不能为空' });
    }
    let where = {
        postId: postId
    }
    let params = {image};
    if (content) {
        params.content = content;
    }
    if (markdown) {
        params.markdown = markdown;
    }
    if (author) {
        params.author = author;
    }
    if (title) {
        params.title = title;
    }
    if (time) {
        params.time = time;
    }
    if (status) {
        params.status = status;
    }
    if (description) {
        params.description = description;
    }

    Posts.update(params, (err, data) => {
        if (err) {
            return res.send({ result: 100, data: {}, message: err });
        }
        let message = '更新成功';
        if (data == 0) {
            message = '该条记录不存在';
        }
        res.send({ result: 100, data: {}, message: message });
    }, where);
});

module.exports = router;
