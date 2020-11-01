'use strict';

const { series, src, dest } = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer'); // 添加css浏览器兼容前缀
const cssmin = require('gulp-cssmin');  // 压缩

// 1.把packages/theme-chalk/src下的各scss文件分别用sass插件处理成css文件并压缩，输出到packages/theme-chalk/src/lib目录下；
function compile() {
  return src('./src/*.scss')
    .pipe(sass.sync())
    .pipe(autoprefixer({
      browsers: ['ie > 9', 'last 2 versions'],
      cascade: false
    }))
    .pipe(cssmin())
    .pipe(dest('./lib'));
}

// 2.把packages/theme-chalk/src/fonts下的字体文件经过压缩处理，同样输出到packages/theme-chalk/src/lib目录下；
function copyfont() {
  return src('./src/fonts/**')
    .pipe(cssmin())
    .pipe(dest('./lib/fonts'));
}

exports.build = series(compile, copyfont);
