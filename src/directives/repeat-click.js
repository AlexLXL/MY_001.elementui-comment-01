import { once, on } from 'element-ui/src/utils/dom';

/*
* on
* 很简单，判断是用addEventListener还是attachEvent来注册事件监控器：
* once：
* 从语义上来看，就是注册事件监听器并且只执行一次，然后取消监听方法：
* */

// 在element-ui/packages/input-number/src/input-number.vue用到v-repeat-click指令。
// 绑定事件
export default {
  bind(el, binding, vnode) {
    let interval = null;
    let startTime;
    const handler = () => vnode.context[binding.expression].apply();
    const clear = () => {
      if (Date.now() - startTime < 100) {
        handler();
      }
      clearInterval(interval);
      interval = null;
    };

    // 绑定按下事件
    /*
    *
    * 当用户鼠标左键一直按住不松手，只会触发一次触发mousedown的回调，
    * 但实际测量el-input-number发现，输入框中的数字会持续变大，
    * 原因就在于mousedown回调中加入了定时器，
    * 当鼠标松开，触发一次mouseup回调方法，取消该定时器；
    *
    * */
    on(el, 'mousedown', (e) => {
      if (e.button !== 0) return;
      startTime = Date.now();
      // 短按的时候
      once(document, 'mouseup', clear);
      clearInterval(interval);
      // 长按的时候
      interval = setInterval(handler, 100);
    });
  }
};

/*
*
* binding：一个对象，包含以下 property：
*   name：指令名，不包括 v- 前缀。
*   value：指令的绑定值，例如：v-my-directive="1 + 1" 中，绑定值为 2。
*   oldValue：指令绑定的前一个值，仅在 update 和 componentUpdated 钩子中可用。无论值是否改变都可用。
*   expression：字符串形式的指令表达式。例如 v-my-directive="1 + 1" 中，表达式为 "1 + 1"。
*   arg：传给指令的参数，可选。例如 v-my-directive:foo 中，参数为 "foo"。
*   modifiers：一个包含修饰符的对象。例如：v-my-directive.foo.bar 中，修饰符对象为 { foo: true, bar: true }。
*
*
* */
