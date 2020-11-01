const path = require('path');
const ProgressBarPlugin = require('progress-bar-webpack-plugin'); // 编译进度条(webpack-dashboard的一种,让打包的过程可视)
const VueLoaderPlugin = require('vue-loader/lib/plugin'); // 解析和转换 .vue 文件（提取出其中的逻辑代码 script、样式代码 style、以及 HTML 模版 template，再分别把它们交给对应的 Loader 去处理，核心的作用，就是提取）
const TerserPlugin = require('terser-webpack-plugin'); // webpack新版本中default built-in的工具已经由旧有的uglifyJS变成了terserJS
// 旧的uglify已经被depreacted注解处理，不建议使用，相信不久之后的状态就会变成legacy，新的terser更好的性能，对ES6+的语法支持的更多，也同时兼容了babel 7的生态

const config = require('./config');

module.exports = {
  mode: 'production',
  entry: {
    app: ['./src/index.js']
  },
  output: {
    // __dirname：获得当前执行文件所在目录的完整目录名
    // __filename：获得当前执行文件的带有完整绝对路径的文件名
    // process.cwd()：获得当前执行node命令时候的文件夹目录名
    path: path.resolve(process.cwd(), './lib'),
    // publicPath主要是对你的页面里面引入的资源的路径做对应的补全，常见的就是css文件里面引入的图片
    publicPath: '/dist/',
    filename: 'index.js',
    // https://www.html.cn/doc/webpack/guides/code-splitting.html  代码分割
    // 非入口 chunk 的名称
    chunkFilename: '[id].js',
    // 开发库library、libraryTarget使用较多、不同的模块化  https://blog.csdn.net/frank_yll/article/details/78992778
    // var, assign, this, window, global,commonjs, comonjs2, amd, umd, jsonp
    libraryTarget: 'umd', // 定义打包方式Universal Module Definition,同时支持在CommonJS、AMD和全局变量使用(libraryTarget 设置成什么，底下的externals就会取对应的选项来进行require)
    libraryExport: 'default', // 对外暴露default属性，就可以直接调用default里的属性
    library: 'ELEMENT', // 指定类库名,主要用于直接引用的方式(比如使用script 标签)
    umdNamedDefine: true, // 如果 output.libraryTarget 设置为umd 而且output.library 也设置了。这个设为true，将为AMD模块命名
    globalObject: 'typeof self !== \'undefined\' ? self : this' // 定义全局变量,兼容node和浏览器运行，避免出现"window is not defined"的情况
  },
  // Resolve 配置 Webpack 如何寻找模块所对应的文件
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: config.alias
    // extensions在导入语句没带文件后缀时，Webpack 会自动带上后缀后去尝试访问文件是否存在
    // alias通过别名来把原导入路径映射成一个新的导入路径,如import xx form 'examples/xx' 替换为 import xx form '../examples/xx'
  },
  // externals 可以防止将这些 import 的包打包到 bundle 中，并在运行时再去从外部获取这些扩展依赖。
  externals: {
    vue: config.vue
  },
  // 提取公共代码：webpack4开始官方移除了commonchunk插件，改用了optimization属性进行更加灵活的配置
  optimization: {
    // minimize: true, // 如果mode是production类型，minimize的默认值是true，执行默认压缩，
    // 第三方的压缩插件，这个选项是webpack4新增的，主要是用来自定义一些优化打包策略。
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: {
            comments: false
          }
        }
      })
    ]
  },
  // 性能
  performance: {
    hints: false // 资源超过250kb的时候打开/关闭提示 (有助于防止把体积巨大的 bundle 部署到生产环境，从而影响网页的性能。)
  },
  // 信息统计（获取某部分 bundle 的信息）
  stats: {
    children: false
  },
  module: {
    rules: [
      // 处理jsx等文件
      {
        test: /\.(jsx?|babel|es6)$/,
        include: process.cwd(),
        exclude: config.jsexclude,
        loader: 'babel-loader'
      },
      // 处理packages下面的vue组件
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          compilerOptions: {
            preserveWhitespace: false
          }
        }
      }
    ]
  },
  plugins: [
    new ProgressBarPlugin(),
    new VueLoaderPlugin()
  ]
};
