
// 抹平各浏览器和平台滚动中的差异(★依赖已看)
// _ie, _firefox, _opera, _webkit, _chrome;
// _osx, _windows, _linux, _android;
// 在element-ui/packages/table/src/table.vue用到v-mousewheel指令。
import normalizeWheel from 'normalize-wheel';

const isFirefox = typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

// FF使用DOMMouseScroll，其他浏览器都是用mousewheel
const mousewheel = function(element, callback) {
  if (element && element.addEventListener) {
    element.addEventListener(isFirefox ? 'DOMMouseScroll' : 'mousewheel', function(event) {
      const normalized = normalizeWheel(event);
      callback && callback.apply(this, [event, normalized]);
    });
  }
};

export default {
  // 自定义指定：https://cn.vuejs.org/v2/guide/custom-directive.html
  // 钩子函数:
  // bind：只调用一次，指令第一次绑定到元素时调用。在这里可以进行一次性的初始化设置。
  // inserted：被绑定元素插入父节点时调用 (仅保证父节点存在，但不一定已被插入文档中)。
  // update：所在组件的 VNode 更新时调用，但是可能发生在其子 VNode 更新之前。指令的值可能发生了改变，也可能没有。但是你可以通过比较更新前后的值来忽略不必要的模板更新 (详细的钩子函数参数见下)。
  // componentUpdated：指令所在组件的 VNode 及其子 VNode 全部更新后调用。
  // unbind：只调用一次，指令与元素解绑时调用。
  bind(el, binding) {
    mousewheel(el, binding.value);
  }
};
