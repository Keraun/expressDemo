module.exports = {
    port: 3000,
    env: 'development',
    session: {
        secret: 'myblog',
        key: 'sessionId',
        //maxAge: 24 * 60 * 60 * 1000,
        maxAge: 10,
        tableName: 'sessions'
    },
    mysql: {
        host: '127.0.0.1',
        port: '3306',
        dataBase: 'myBlog',
        userName: 'root',
        localPwd: '123456',
        pwdKey: '123456',
        log: console.log
    }
}
