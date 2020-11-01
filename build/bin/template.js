const path = require('path');
const templates = path.resolve(process.cwd(), './examples/pages/template');

const chokidar = require('chokidar'); // 监听文件变化
let watcher = chokidar.watch([templates]);

watcher.on('ready', function() {
  watcher
    .on('change', function() {
      exec('npm run i18n');
    });
});

function exec(cmd) {
  // 创建子进程执行'npm run i18n'
  return require('child_process').execSync(cmd).toString().trim();
}
