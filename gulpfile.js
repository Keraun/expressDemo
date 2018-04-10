var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer'); // 处理css中浏览器兼容的前缀
var less = require('gulp-less'); //sass
var concat = require('gulp-concat'); //合并文件
var clean   = require('gulp-clean');
var watch = require('gulp-watch');

gulp.task("clean", function(){
    return gulp.src('./public/css/')
        .pipe(clean());
});

gulp.task('default', ['clean'], function() {
    return gulp.src([
            './public/less/bundle.less',
            './public/less/reset.less',
            './public/less/editReset.less',
        ])
        .pipe(less())
        .pipe(autoprefixer('last 2 version'))
        .pipe(gulp.dest('./public/css/'));
});
