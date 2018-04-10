var express = require('express');
var router = express.Router();
const util = require('../../common/util');
const Posts = require('../../control/controlPosts');
const checkLogin = require('../../middlewares/check').checkLogin;

router.get('/', function(req, res) {
    res.render('blog.ejs', {
        pageModel: 'blog'
    });
});

router.get('/post/:postId', checkLogin, function(req, res, next) {
    let { postId } = req.params;
    Posts.getById(postId, (err, data) => {
        if (err) {
            return res.status == 404;
        }
        return res.render('postDetail.ejs', {
            pageModel: 'postDetail',
            ...data
        });
    });
});


module.exports = router;
