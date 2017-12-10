var express = require('express');
var router = express.Router();
const util = require('../../common/util');
const Posts = require('../../control/controlPosts');

router.post('/createPost', function(req, res, next) {
    let { content, author } = req.body;
    Posts.createPost({ content, author }, (err, data) => {
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
    let offset = (pageNo - 1) * pageSize;
    let opts = {
        order: [['created_at', 'desc']],
        limit: pageSize,
        offset: offset
    }
    let where = {};
    Posts.getList(where, (err, data) => {
        if (err) {
            console.log('err', err);
            return res.send({ result: 100, data: {}, message: '' });
        }
        res.send({ result: 100, data: data, message: '' });
    }, opts);
});

router.get('/deletePostById', function(req, res, next) {
    let postId = req.query.postId;
    if (!postId) {
        return res.send({ result: 100, data: {}, message: 'postId不能为空' });
    }
    Posts.deleteById(postId, (err, data) => {
        if (err) {
            return res.send({ result: 100, data: {}, message: err });
        }
        let message = '删除成功';
        if (data == 0) {
            message = '该条记录不存在';
        }
        res.send({ result: 100, data: {}, message: message });
    })
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

router.get('/updatePostById', function(req, res, next) {

});

module.exports = router;
