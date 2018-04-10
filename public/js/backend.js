;
(function($) {

    var domain = window.ajaxDomain;

    var ui = {
        $btnRegister: $('#btn-register'),
        $registerForm: $('#registerForm'),
        $loginForm: $('#loginForm'),
        $btnLogin: $('#btn-login')
    };

    var oPage = {
        init: function() {
            this.event();
            this.show();
        },
        event: function() {
            var self = this;
            ui.$btnRegister.on('click', function() {
                var params = self.getUserParams(ui.$registerForm);
                self.register(params);
            });
            ui.$btnLogin.on('click', function() {
                var params = self.getUserParams(ui.$loginForm);
                self.login(params);
            });
        },
        show: function() {
            this.getUserInfo();
        },
        getUserParams: function($form) {
            var paramsArr = $form.serializeArray();
            var params = {};
            paramsArr.map(function(item) {
                params[item.name] = item.value;
            });
            return params;
        },
        register: function(params) {
            $.ajax({
                url: domain + '/user/xxx/register',
                type: 'POST',
                data: params
            }).done(function(res) {
                alert(res.message);
                console.log('res', res);
            });
        },
        login: function(params) {
            $.ajax({
                url: domain + '/user/xxx/login',
                type: 'POST',
                data: params
            }).done(function(res) {
                if(res.result == 100) {
                    window.location = '/posts/manage'
                } else {
                    alert(res.message);
                }
                console.log('res', res);
            });
        },
        getUserInfo: function(params) {
            $.ajax({
                url: domain + '/user/getUserInfo',
                type: 'get',
                data: params
            }).done(function(res) {
                if(res.result == 100) {
                     window.location = '/posts/manage'
                }
                console.log('res', res);
            });
        },

    }

    oPage.init();

})(window.$)
