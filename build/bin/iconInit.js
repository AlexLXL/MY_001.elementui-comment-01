'use strict';
// postcss将css解析成树型结构，详见：https://www.dazhuanlan.com/2019/08/21/5d5d16d757eab/
/*
* postcss处理css的方式，主要区分三部分：
*   parser过程：将css字符串解析成可供我们操作的JavaScript对象
*   processor过程：我们应用postcss插件、或是自定义插件，都是在这个过程中，根据postcss提供的API，对parser生成的js对象做相应调整；
*   stringfier过程：将我们处理后的js对象，再转换回为css字符串
* */
var postcss = require('postcss');
var fs = require('fs');
var path = require('path');
var fontFile = fs.readFileSync(path.resolve(__dirname, '../../packages/theme-chalk/src/icon.scss'), 'utf8');
var nodes = postcss.parse(fontFile).nodes; // parse为postcss的API，将css字符串解析成可供我们操作的JavaScript对象
var classList = [];

nodes.forEach((node) => {
  var selector = node.selector || ''; // 获取选择器
  var reg = new RegExp(/\.el-icon-([^:]+):before/); // 是否.el-icon-开头
  var arr = selector.match(reg);

  // 例: .el-icon-delete，将delete抽取出去
  if (arr && arr[1]) {
    classList.push(arr[1]);
  }
});

classList.reverse(); // 希望按 css 文件顺序倒序排列

fs.writeFile(path.resolve(__dirname, '../../examples/icon.json'), JSON.stringify(classList), () => {});
