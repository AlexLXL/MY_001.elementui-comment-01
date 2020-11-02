const defaults = {
  title: null,
  message: '',
  type: '',
  iconClass: '',
  showInput: false,
  showClose: true,
  modalFade: true,
  lockScroll: true,
  closeOnClickModal: true,
  closeOnPressEscape: true,
  closeOnHashChange: true,
  inputValue: null,
  inputPlaceholder: '',
  inputType: 'text',
  inputPattern: null,
  inputValidator: null,
  inputErrorMessage: '',
  showConfirmButton: true,
  showCancelButton: false,
  confirmButtonPosition: 'right',
  confirmButtonHighlight: false,
  cancelButtonHighlight: false,
  confirmButtonText: '',
  cancelButtonText: '',
  confirmButtonClass: '',
  cancelButtonClass: '',
  customClass: '',
  beforeClose: null,
  dangerouslyUseHTMLString: false,
  center: false,
  roundButton: false,
  distinguishCancelAndClose: false
};

import Vue from 'vue';
import msgboxVue from './main.vue';
import merge from 'element-ui/src/utils/merge';
import { isVNode } from 'element-ui/src/utils/vdom';

const MessageBoxConstructor = Vue.extend(msgboxVue);

let currentMsg, instance;
let msgQueue = [];

const defaultCallback = action => {
  if (currentMsg) {
    let callback = currentMsg.callback;
    // 有callback的时候
    if (typeof callback === 'function') {
      if (instance.showInput) {
        callback(instance.inputValue, action);
      } else {
        callback(action);
      }
    }
    // 有.then的时候
    if (currentMsg.resolve) {
      if (action === 'confirm') {
        if (instance.showInput) {
          currentMsg.resolve({ value: instance.inputValue, action });
        } else {
          currentMsg.resolve(action);
        }
      } else if (currentMsg.reject && (action === 'cancel' || action === 'close')) {
        currentMsg.reject(action);
      }
    }
  }
};

const initInstance = () => {
  instance = new MessageBoxConstructor({
    el: document.createElement('div')
  });

  // 触发回调，可能是callback参数传的，可能是.then方式传的
  instance.callback = defaultCallback;
};

const showNextMsg = () => {
  if (!instance) {
    initInstance();
  }
  instance.action = '';

  if (!instance.visible || instance.closeTimer) {
    if (msgQueue.length > 0) {
      // msgQueue取出第一个元素
      currentMsg = msgQueue.shift();

      // 挂载参数到instance
      let options = currentMsg.options;
      for (let prop in options) {
        if (options.hasOwnProperty(prop)) {
          instance[prop] = options[prop];
        }
      }
      if (options.callback === undefined) {
        instance.callback = defaultCallback;
      }

      let oldCb = instance.callback;
      instance.callback = (action, instance) => {
        oldCb(action, instance);
        showNextMsg();
      };
      // message是不是虚拟dom
      if (isVNode(instance.message)) {
        instance.$slots.default = [instance.message];
        instance.message = null;
      } else {
        delete instance.$slots.default;
      }
      /*
      *
      * this.$slots.default详解
      *
      * <template>
      *     <div>
      *         <slot></slot>
      *         <slot name="up"></slot>
      *     </div>
      * </template>
      * <script type="text/ecmascript-6">
      *     export default {
      *         name: "pending-disposal-list",
      *         created(){
      *             // this.$slots 包含所有插槽使用的数组 在改测试中返回 {default: Array(2), up: Array(4)}
      *             // 在父组件中使用默认插槽2次，up插槽4次
      *             // this.$slots.default 返回默认插槽的数组 {default: Array(2)}
      *             // elment-ui el-button 中的用法  <span v-if="$slots.default"><slot></slot></span>
      *             console.log(this.$slots, this.$slots.default.length, 'slots');
      *         }
      *     };
      * </script>
      *
      * */

      // 没有配置的属性默认值为true
      ['modal', 'showClose', 'closeOnClickModal', 'closeOnPressEscape', 'closeOnHashChange'].forEach(prop => {
        if (instance[prop] === undefined) {
          instance[prop] = true;
        }
      });
      // 将instance挂载到body下面，visible设置为true
      document.body.appendChild(instance.$el);

      Vue.nextTick(() => {
        instance.visible = true;
      });
    }
  }
};

const MessageBox = function(options, callback) {
  if (Vue.prototype.$isServer) return;
  if (typeof options === 'string' || isVNode(options)) {
    options = {
      message: options
    };
    if (typeof arguments[1] === 'string') {
      options.title = arguments[1];
    }
  } else if (options.callback && !callback) {
    // 获取option里的callback
    callback = options.callback;
  }

  if (typeof Promise !== 'undefined') {
    return new Promise((resolve, reject) => { // eslint-disable-line
      // msgQueue数组保存options和callback，
      // 如果浏览器支持Promise，那么再将resovle和reject封装进msgQueue，分别触发后续then和catch逻辑
      msgQueue.push({
        options: merge({}, defaults, MessageBox.defaults, options),
        callback: callback,
        resolve: resolve,
        reject: reject
      });

      showNextMsg();
    });
  } else {
    msgQueue.push({
      options: merge({}, defaults, MessageBox.defaults, options),
      callback: callback
    });

    showNextMsg();
  }
};

MessageBox.setDefaults = defaults => {
  MessageBox.defaults = defaults;
};

// 二次封装messagebox，固定一些属性
/*
* Loading、Notification和Message也有类似做法
* Vue.prototype.$loading = Loading.service;
* Vue.prototype.$notify = Notification;
* Vue.prototype.$message = Message;
* */
MessageBox.alert = (message, title, options) => {
  if (typeof title === 'object') {
    options = title;
    title = '';
  } else if (title === undefined) {
    title = '';
  }
  return MessageBox(merge({
    title: title,
    message: message,
    $type: 'alert',
    closeOnPressEscape: false,
    closeOnClickModal: false
  }, options));
};

MessageBox.confirm = (message, title, options) => {
  if (typeof title === 'object') {
    options = title;
    title = '';
  } else if (title === undefined) {
    title = '';
  }
  return MessageBox(merge({
    title: title,
    message: message,
    $type: 'confirm',
    showCancelButton: true
  }, options));
};

MessageBox.prompt = (message, title, options) => {
  if (typeof title === 'object') {
    options = title;
    title = '';
  } else if (title === undefined) {
    title = '';
  }
  return MessageBox(merge({
    title: title,
    message: message,
    showCancelButton: true,
    showInput: true,
    $type: 'prompt'
  }, options));
};

MessageBox.close = () => {
  instance.doClose();
  instance.visible = false;
  msgQueue = [];
  currentMsg = null;
};

export default MessageBox;
export { MessageBox };
