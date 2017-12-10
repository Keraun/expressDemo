module.exports = function(app) {

    app.get('/', function(req, res) {
        res.redirect('/posts');
    });

    app.use('/user', require('./route/user'));
    app.use('/posts', require('./route/posts'));

    //注册
    //登录
    //登出
    //查看文章
    //发表文章
    //修改文章
    //删除文章
    //留言

    // 404 page
    // app.use(function (req, res) {
    //   if (!res.headersSent) {
    //     res.status(404).render('404');
    //   }
    // });
};
