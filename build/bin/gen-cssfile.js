/*
* 构建packages/theme-chalk/src/index.scss
* */
var fs = require('fs');
var path = require('path');
// 各个组件
var Components = require('../../components.json');
var themes = [
  'theme-chalk'
];
Components = Object.keys(Components);
var basepath = path.resolve(__dirname, '../../packages/');

/*
* nodejs使用stats对象来代表一个文件或设备信息，stats对象有如下方法：
* stats.isFile()	如果是文件返回 true，否则返回 false。
* stats.isDirectory()	如果是目录返回 true，否则返回 false。
* stats.isBlockDevice()	如果是块设备返回 true，否则返回 false。
* stats.isCharacterDevice()	如果是字符设备返回 true，否则返回 false。
* stats.isSymbolicLink()	如果是软链接返回 true，否则返回 false。
* stats.isFIFO()	如果是FIFO，返回true，否则返回 false。FIFO是UNIX中的一种特殊类型的命令管道。
* stats.isSocket()	如果是 Socket 返回 true，否则返回 false。
*
* */

function fileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch (err) {
    return false;
  }
}

themes.forEach((theme) => {
  var isSCSS = theme !== 'theme-default';
  // scss就引入scss，css就引入css
  var indexContent = isSCSS ? '@import "./base.scss";\n' : '@import "./base.css";\n';
  Components.forEach(function(key) {
    // 这三个不引入
    if (['icon', 'option', 'option-group'].indexOf(key) > -1) return;
    var fileName = key + (isSCSS ? '.scss' : '.css');
    indexContent += '@import "./' + fileName + '";\n';
    var filePath = path.resolve(basepath, theme, 'src', fileName);
    if (!fileExists(filePath)) {
      fs.writeFileSync(filePath, '', 'utf8');
      console.log(theme, ' 创建遗漏的 ', fileName, ' 文件');
    }
  });
  fs.writeFileSync(path.resolve(basepath, theme, 'src', isSCSS ? 'index.scss' : 'index.css'), indexContent);
});
