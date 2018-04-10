;
(function($) {

    var domain = window.ajaxDomain;
    var ui = {
        $postList: $('#post-pre-list'),
        $more: $('.view-more-post')
    };

    var oPage = {
        init: function() {
            this.event();
            this.show();
        },
        event: function() {

        },
        show: function() {
            this.fetchPostList({ pageNo: 1, pageSize: 3 });
        },
        fetchPostList: function(params) {
            var self = this;
            $.ajax({
                url: domain + '/posts/getList',
                type: 'get',
                data: params || {}
            }).done(function(res) {
                if (res.result == 100) {
                    var data = res.data || {};
                    self.renderPostList(data.data || [])
                }

                console.log('res', res);
            });
        },
        renderPostList: function(list) {
            var html = '';
            list.forEach(function(item, idx) {
                var bOldNum = (idx % 2 == 0 ? true : false);
                var imgName = item.image;
                if(!imgName) {
                    imgName = '/image/item-book' + (idx % 2 ) +'.jpg';
                }
                var itemImg = 'background-image:url(\'' + imgName + '\');';
                html += [
                    '<article class="post-item clearfix">',
                    '<div class="post-item-image" style="'+ itemImg +'' + (!bOldNum ? 'float:right; ' : '') + '"></div>',
                    '<div class="post-item-info">',
                    '<div class="post-item_text post-item-time">' + (item.time || item.createdAt || '').split(' ')[0] + '</div>',
                    '<div>',
                    '<h2><a class="post-item-title post-title__text transition" href="/blog/post/'+item.postId+'">' + item.title + '</a></h2>',
                    '</div>',
                    '<div class="post-item_text post-item-description">',
                    item.description,
                    '</div>',
                    '<div class="post-item-opt"></div>',
                    '</div>',
                    '</article>',
                ].join('');
            });
            ui.$postList.html(html);
            if (list.length > 0) {
                ui.$more.html('<a class="blog-button button-fill button-big" href="/blog" >查看更多</a>');
            }
        },
    };

    oPage.init();

})(window.$)
