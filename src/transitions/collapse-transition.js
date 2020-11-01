import { addClass, removeClass } from 'element-ui/src/utils/dom';

class Transition {
  beforeEnter(el) {
    // 加class，
    // .collapse-transition { transition: 0.3s height ease-in-out, 0.3s padding-top ease-in-out, 0.3s padding-bottom ease-in-out; }
    // 改变height/paddingTop/paddingBottom
    addClass(el, 'collapse-transition');
    // HTMLElement.dataset是一个DOMString的映射,保存所有自定义数据属性(data-*)集
    if (!el.dataset) el.dataset = {};

    el.dataset.oldPaddingTop = el.style.paddingTop;
    el.dataset.oldPaddingBottom = el.style.paddingBottom;

    el.style.height = '0';
    el.style.paddingTop = 0;
    el.style.paddingBottom = 0;
  }

  enter(el) {
    el.dataset.oldOverflow = el.style.overflow;
    if (el.scrollHeight !== 0) {
      el.style.height = el.scrollHeight + 'px';
      el.style.paddingTop = el.dataset.oldPaddingTop;
      el.style.paddingBottom = el.dataset.oldPaddingBottom;
    } else {
      el.style.height = '';
      el.style.paddingTop = el.dataset.oldPaddingTop;
      el.style.paddingBottom = el.dataset.oldPaddingBottom;
    }

    el.style.overflow = 'hidden';
  }

  afterEnter(el) {
    // for safari: remove class then reset height is necessary
    removeClass(el, 'collapse-transition');
    el.style.height = '';
    el.style.overflow = el.dataset.oldOverflow;
  }

  beforeLeave(el) {
    if (!el.dataset) el.dataset = {};
    el.dataset.oldPaddingTop = el.style.paddingTop;
    el.dataset.oldPaddingBottom = el.style.paddingBottom;
    el.dataset.oldOverflow = el.style.overflow;

    el.style.height = el.scrollHeight + 'px';
    el.style.overflow = 'hidden';
  }

  leave(el) {
    if (el.scrollHeight !== 0) {
      // for safari: add class after set height, or it will jump to zero height suddenly, weired
      addClass(el, 'collapse-transition');
      el.style.height = 0;
      el.style.paddingTop = 0;
      el.style.paddingBottom = 0;
    }
  }

  afterLeave(el) {
    removeClass(el, 'collapse-transition');
    el.style.height = '';
    el.style.overflow = el.dataset.oldOverflow;
    el.style.paddingTop = el.dataset.oldPaddingTop;
    el.style.paddingBottom = el.dataset.oldPaddingBottom;
  }
}

/*
*
* 函数式组件: https://cn.vuejs.org/v2/guide/render-function.html#%E5%87%BD%E6%95%B0%E5%BC%8F%E7%BB%84%E4%BB%B6
* 参考： https://www.cnblogs.com/mmzuo-798/p/11778044.html
* 案例: https://codesandbox.io/s/functional-components-of-vuejs-forked-u7b4g?file=/src/components/FunctionalButton.js
*
* */

export default {
  name: 'ElCollapseTransition',
  functional: true,
  /*
  *
  * 将 h 作为 createElement 的别名是 Vue 生态系统中的一个通用惯例，
  * 实际上也是 JSX 所要求的。从 Vue 的 Babel 插件的 3.4.0 版本开始，
  * 我们会在以 ES2015 语法声明的含有 JSX 的任何方法和 getter 中 (不是函数或箭头函数中)
  * 自动注入 const h = this.$createElement，这样你就可以去掉 (h) 参数了。
  * 对于更早版本的插件，如果 h 在当前作用域中不可用，应用会抛错。
  *
  * context.children就是嵌套该<transiton></transiton>变迁内的子元素
  *
  * */
  render(h, { children }) {
    // 事件的重写
    const data = {
      on: new Transition()
    };

    return h('transition', data, children);
    /*
    * 返回了vue自带的<transiton></transiton>
    * 并重写了相应的事件beforeEnter/enter/afterEnter...
    *
    * */
  }
};
