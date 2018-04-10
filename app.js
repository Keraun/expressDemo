var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes');

var session = require('express-session');
var config = require('config-lite')(__dirname)
var mysqlStore = require('connect-mysql')(session);

require('./lib/database').initDb(); //加载Sequelize

require('./lib/database').createTables({ force: false }); //删除并重建表 { force: true, match: /_test$/ } //匹配对应的model

var app = express();

//设置跨域访问
// app.all('*', function(req, res, next) {
//     res.header('Access-Control-Allow-Origin:*');  //支持全域名访问，不安全，部署后需要限制为R.com
//     res.header('Access-Control-Allow-Methods:POST,GET,OPTIONS,DELETE'); //支持的http动作
//     res.header('Access-Control-Allow-Headers:x-requested-with');  //响应头 请按照自己需求添加。
//     res.header("X-Powered-By",' 3.2.1')
//     res.header("Content-Type", "application/json;charset=utf-8");
//     next();
// });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    //name: config.session.key, // 设置 cookie 中保存 session id 的字段名称
    secret: config.session.secret, // 通过设置 secret 来计算 hash 值并放在 cookie 中，使产生的 signedCookie 防篡改
    resave: false, // 强制更新 session
    saveUninitialized: false, // 设置为 false，强制创建一个 session，即使用户未登录
    // cookie: {
    //     maxAge: config.session.maxAge // 过期时间，过期后 cookie 中的 session id 自动删除
    // },
    store: new mysqlStore({
        config: {
            servers: [config.mysql.host + ':' + config.mysql.port],
            user: config.mysql.userName,
            password: config.mysql.localPwd,
            database: config.mysql.dataBase,
        },
        table: config.session.tableName
    })
}));

app.use(express.static(path.join(__dirname, 'public'))); //先去匹配静态资源

//路由
routes(app);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
app.use(function(rst, req, res, next) {
    if (rst && rst.data) {
        let data = util.defaults({
            result: 100
        }, rst);
        res.send(data);
        return;
    }
    next(rst);
});

// if ('development') {
//     app.use(function(err, req, res) {
//         res.status(err.status || 500);
//         res.send({
//             result: 500,
//             error: err,
//             message: err.message
//         });
//     });
// }

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    if (err) {
        console.log('originalUrl:', req.originalUrl);
        return res.render('error.ejs', {
            pageModel: 'error',
            message: err,
        });
    }
    res.status(200);
    res.send(err);
});



module.exports = app;
