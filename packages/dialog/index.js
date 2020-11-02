import ElDialog from './src/component';

/* istanbul ignore next */
/*
* 当使用Vue.use()的时候回调用install方法
* */
ElDialog.install = function(Vue) {
  // 注册全局组件
  Vue.component(ElDialog.name, ElDialog);
};

export default ElDialog;
