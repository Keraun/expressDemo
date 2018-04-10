;
(function($) {

    var domain = window.ajaxDomain;

    var ui = {
        $btnLogout: $('#btn-logout'),
        $tbody: $('#tbody')
    };


    var oPage = {
        init: function() {
            this.event();
            this.show();
        },
        event: function() {
            var self = this;
            ui.$btnLogout.on('click', function() {
                self.logout();
            });
            ui.$tbody.on('click', '.btn-opt', function() {
                var type = $(this).data('action');
                var postId = $(this).closest('tr').data('postid');
                if (!postId) {
                    return;
                }
                switch (type) {
                    case 'publish':
                        self.publishPost(postId);
                        break;
                    case 'edit':
                        window.open('/posts/editPost?postId=' + postId);
                        break;
                    case 'preview':
                        window.open('/blog/post/'+ postId);
                        break;
                    case 'delete':
                        var reuslt = prompt("请确认删除", "");
                        if (reuslt != null && reuslt != "") {
                            self.deltePost(postId);
                        }
                        break;

                }
            });
            $(document).on('visibilitychange', function(e) {
                var isHidden = document.hidden;
                if (!isHidden) {
                    self.fetchPostList({ pageNo: 1, pageSize: 10000, type: 'all' });
                }
            })
        },
        show: function() {
            this.fetchPostList({ pageNo: 1, pageSize: 10000, type: 'all' });
        },
        logout: function() {
            $.ajax({
                url: domain + '/user/xxx/logout',
                type: 'get',
                data: {}
            }).done(function(res) {
                if (res.result == 100) {
                    window.location = "/blog";
                }
                console.log('res', res);
            }).fail(function(err) {});;
        },
        fetchPostList: function(params) {
            var self = this;
            $.ajax({
                url: domain + '/posts/getList',
                type: 'get',
                data: params || {}
            }).done(function(res) {
                if (res.result == 100) {
                    self.renderPostList(res.data.data);
                }
                console.log('res', res);
            }).fail(function(err) {});
        },
        renderPostList: function(list) {
            var html = [];
            var status = {
                0: '删除',
                1: '发布',
                2: '草稿',
            }

            function getOptHtml(state) {
                var optHtml = [
                    '<a class="btn-opt J_btn-edit"  data-action="edit"  href="javascript:;">编辑</a>',
                    '<a class="btn-opt J_btn-delete"   data-action="delete"  href="javascript:;">删除</a>',
                    state == 2 ? '<a class="btn-opt J_btn-publish" data-action="publish" href="javascript:;">发布</a>' : '',
                    state == 2 ? '<a class="btn-opt J_btn-preview"  data-action="preview"  href="javascript:;">预览</a>' : '',
                ].join('');
                return optHtml;
            }

            list.forEach(function(item) {
                html.push([
                    '<tr data-postid="' + item.postId + '">',
                    '<td class="al-c">' + item.postId + '</td>',
                    '<td>' + item.title + '</td>',
                    '<td><div class="post-content">' + item.markdown.slice(0, 100) + '</div></td>',
                    '<td>' + (status[item.status] || '') + '</td>',
                    '<td>' + (item.time || item.createdAt).split(' ')[0] + '</td>',
                    '<td>' + item.updatedAt.split(' ')[0] + '</td>',
                    '<td class="fs-12" data-id="">',
                    getOptHtml(item.status || 2),
                    '</td>',
                    '</tr>'
                ].join(''));

            })
            ui.$tbody.html(html.join(''));
        },
        deltePost: function(postId) {
            var self = this;
            $.ajax({
                url: domain + '/posts/deletePostById',
                type: 'get',
                data: { postId: postId }
            }).done(function(res) {
                if (res.result == 100) {
                    self.fetchPostList({ pageNo: 1, pageSize: 10000, type: 'all' });
                }
                console.log('res', res);
            }).fail(function(err) {});
        },
        publishPost: function(postId) {
            var self = this;
            $.ajax({
                url: domain + '/posts/updatePostById',
                type: 'POST',
                data: { postId: postId, status: 1 }
            }).done(function(res) {
                alert(res.message)
                if (res.result == 100) {

                    self.fetchPostList({ pageNo: 1, pageSize: 10000, type: 'all' });
                }
                console.log('res', res);
            }).fail(function(err) {
                alert('发布失败')
            });
        }
    };
    oPage.init();

})(window.$)
