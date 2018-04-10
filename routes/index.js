module.exports = function(app) {

    app.get('/', function(req, res) {
        res.render('index.ejs', {
            pageModel: 'home'
        });
    });
    app.get('/about', function(req, res) {
        res.render('about.ejs', {
            pageModel: 'about'
        });
    });
    app.get('/backend', function(req, res) {
        res.render('backend.ejs', {
            pageModel: 'backend'
        });
    });
    app.use('/user', require('./route/user'));
    app.use('/blog', require('./route/blog'));
    app.use('/posts', require('./route/posts'));
};
