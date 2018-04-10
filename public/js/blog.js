;
(function($) {

    var domain = window.ajaxDomain;

    var ui = {
        $postList: $('#post-list'),
        $pageOpt: $('.blog-page-opt'),
    }

    var query = window.GetRequest();


    var oPage = {

        pageNo: query.pageNo || 1,
        pageSize: query.pageSize || 10,
        pageTotal: 1,
        total: 1,

        init: function() {
            this.event();
            this.show();
        },
        event: function() {

        },
        show: function() {
            var params = this.getListParams(this.pageNo, this.pageSize);
            this.fetchPostList(params);
        },
        getListParams: function(pageNo, pageSize) {
            return {
                pageNo: pageNo || 1,
                pageSize: pageSize || 10,
                type: 'online'
            }
        },
        fetchPostList: function(params) {
            var self = this;
            $.ajax({
                url: domain + '/posts/getList',
                type: 'get',
                data: params || {}
            }).done(function(res) {
                if (res.result == 100) {
                    var data = res.data;
                    self.total = data.total;
                    self.pageTotal = Math.ceil(data.total / self.pageSize);
                    self.renderPostList(data.data || []);
                    self.renderPageOpt(self.pageNo, self.pageSize, self.pageTotal);
                    self.pageNo = parseInt(self.pageNo) + 1;
                }
                console.log('res', res);
            }).fail(function(err) {});
        },
        renderPostList: function(list) {
            var html = '';
            list.forEach(function(item, idx) {
                var bOldNum = (idx % 2 == 0 ? true : false);

                var imgName = item.image;
                if(!imgName) {
                    imgName = '/image/item-book' + (idx % 2 ) +'.webp';
                }
                var itemImg = 'background-image:url(\'' + imgName + '\');';
                html += [
                    '<article class="post-item clearfix">',
                    '<div class="post-item-image" style="'+ itemImg+ '' + (!bOldNum ? 'float:right; ' : '') + '"></div>',
                    '<div class="post-item-info">',
                    '<div class="post-item_text post-item-time">' + (item.time || item.createdAt || '').split(' ')[0] + '</div>',
                    '<div>',
                    '<h2><a class="post-item-title post-title__text transition" href="/blog/post/6">' + item.title + '</a></h2>',
                    '</div>',
                    '<div class="post-item_text post-item-description">',
                    item.markdown,
                    '</div>',
                    '<div class="post-item-opt"></div>',
                    '</div>',
                    '</article>',
                ].join('');
            });

            ui.$postList.html(html);
        },
        renderPageOpt: function(curPageNo, pageSize, pageTotal) {
            var html = [
                curPageNo > 1 ? '<a class="blog-button float-l" href="/blog/?pageNo=' + (parseInt(curPageNo)- 1) + '&pageSize=' + pageSize + '" alt="上一页">上一页</a>' : '',
                curPageNo < pageTotal ? '<a class="blog-button float-r" href="/blog/?pageNo=' +  (parseInt(curPageNo) + 1) + '&pageSize=' + pageSize + '"  alt="下一页">下一页</a>' : ''
            ].join('');

            ui.$pageOpt.html(html);
        },
    }
    oPage.init();

})($);
