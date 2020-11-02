/*
* 设置蒙版，当有多级蒙版时，能在此进行统一管理
* */

import Vue from 'vue';
import { addClass, removeClass } from 'element-ui/src/utils/dom';

let hasModal = false;
let hasInitZIndex = false;
let zIndex;
/**
 * 返回modalDom元素
 * 第一次调用时,会创建一个div,并绑定click事件,并将此div赋值给PopupManager的modalDom属性
 * 第二次调用时直接返回PopupManager.modalDom
 */

// modalDom --表示 黑色遮罩
const getModal = function() {
  if (Vue.prototype.$isServer) return;
  let modalDom = PopupManager.modalDom;
  if (modalDom) {
    hasModal = true;
  } else {
    hasModal = false;
    modalDom = document.createElement('div');
    PopupManager.modalDom = modalDom;

    modalDom.addEventListener('touchmove', function(event) {
      event.preventDefault();
      event.stopPropagation();
    });

    modalDom.addEventListener('click', function() {
      PopupManager.doOnModalClick && PopupManager.doOnModalClick();
    });
  }

  return modalDom;
};

const instances = {};

const PopupManager = {
  // 是否开启modal淡入淡出动画
  modalFade: true,

  // 根据id获取弹窗组件
  getInstance: function(id) {
    return instances[id];
  },

  // 注册弹窗组件
  register: function(id, instance) {
    if (id && instance) {
      instances[id] = instance;
    }
  },

  // 注销弹窗组件
  deregister: function(id) {
    if (id) {
      instances[id] = null;
      delete instances[id];
    }
  },

  nextZIndex: function() {
    return PopupManager.zIndex++;
  },

  // 虚拟的modal蒙层数组,每一个弹窗组件对应一个虚拟的modal蒙层,实际上在页面中只存在一个modal蒙层,所有的弹窗组件共用一个蒙层即可,可以参考嵌套弹窗demo
  modalStack: [],

  // 当有多个弹窗组件时,只有最上面的弹窗组件层级关系是在modalDom上,所以此时点击modal,应该去执行最上层弹窗组件的回调方法
  doOnModalClick: function() {
    const topItem = PopupManager.modalStack[PopupManager.modalStack.length - 1];
    if (!topItem) return;

    const instance = PopupManager.getInstance(topItem.id);
    if (instance && instance.closeOnClickModal) {
      instance.close();
    }
  },

  /**
   * 页面中添加modalDom,在上面的额popup-mixin的doOpen方法里面,就调用了PopupManager.openModal方法
   * 弹窗组件调用过openModal方法后,PopupManager会将弹窗组件(id,zIndex)push进modalStack中进行管理
   * 弹窗窗组件调用PopupManager.closeModal方法后,PopupManager会将弹窗组件从modalStack中删除
   */
  openModal: function(id, zIndex, dom, modalClass, modalFade) {
    if (Vue.prototype.$isServer) return;
    if (!id || zIndex === undefined) return;
    this.modalFade = modalFade;

    const modalStack = this.modalStack;

    for (let i = 0, j = modalStack.length; i < j; i++) {
      const item = modalStack[i];
      if (item.id === id) {
        return;
      }
    }
    // 调用getModal方法,获取到真实的modalDom元素
    const modalDom = getModal();

    addClass(modalDom, 'v-modal');
    if (this.modalFade && !hasModal) {
      addClass(modalDom, 'v-modal-enter');
    }
    if (modalClass) {
      let classArr = modalClass.trim().split(/\s+/);
      classArr.forEach(item => addClass(modalDom, item));
    }
    setTimeout(() => {
      removeClass(modalDom, 'v-modal-enter');
    }, 200);
    // 根据传入的dom元素,判断modalDom应该插入的节点
    if (dom && dom.parentNode && dom.parentNode.nodeType !== 11) {
      dom.parentNode.appendChild(modalDom);
    } else {
      document.body.appendChild(modalDom);
    }

    // 设置modalDom的zIndex,
    // 回到popup-mixin代码的openModa处,可以发现传入的zInxex值是PopupManager.nextZIndex(),
    // 然后弹窗组件又给自己设置了zindex,dom.style.zIndex = PopupManager.nextZIndex()
    // 这样就能确保弹窗组件的zIndex比modalDom高,展示在modalDom之上
    if (zIndex) {
      modalDom.style.zIndex = zIndex;
    }
    modalDom.tabIndex = 0;  // tabindex 属性规定元素的 tab 键控制次序（当 tab 键用于导航时）。
    modalDom.style.display = '';

    this.modalStack.push({ id: id, zIndex: zIndex, modalClass: modalClass });
  },

  // 关闭弹窗,阅读之前,请先看一下关闭嵌套dialog时,各个弹窗与modalDom的表现
  closeModal: function(id) {
    const modalStack = this.modalStack;
    const modalDom = getModal();

    //modalStack中删除对应的弹窗组件
    if (modalStack.length > 0) {
      const topItem = modalStack[modalStack.length - 1];
      if (topItem.id === id) {
        if (topItem.modalClass) {
          let classArr = topItem.modalClass.trim().split(/\s+/);
          classArr.forEach(item => removeClass(modalDom, item));
        }

        modalStack.pop();
        if (modalStack.length > 0) {
          /**
           * 如果是最上层的弹窗组件,且下面还存在其他的弹窗组件,则重新设置modalDOm的zindex,
           * modalStack中保存的zIndex并不是弹窗组件dom的Zindex,而是执行PopupManager.openModal方法时传入的zindex,
           * 弹窗组件dom的Zindex是在执行PopupManager.openModal方法后再设置的
           */
          modalDom.style.zIndex = modalStack[modalStack.length - 1].zIndex;
        }
      } else {
        // 异常情况处理
        for (let i = modalStack.length - 1; i >= 0; i--) {
          if (modalStack[i].id === id) {
            modalStack.splice(i, 1);
            break;
          }
        }
      }
    }
    // 如果没有其他弹窗组件了,则隐藏modalDom
    if (modalStack.length === 0) {
      if (this.modalFade) {
        addClass(modalDom, 'v-modal-leave');
      }
      setTimeout(() => {
        if (modalStack.length === 0) {
          if (modalDom.parentNode) modalDom.parentNode.removeChild(modalDom);
          modalDom.style.display = 'none';
          PopupManager.modalDom = undefined;
        }
        removeClass(modalDom, 'v-modal-leave');
      }, 200);
    }
  }
};

Object.defineProperty(PopupManager, 'zIndex', {
  configurable: true,
  get() {
    if (!hasInitZIndex) {
      zIndex = zIndex || (Vue.prototype.$ELEMENT || {}).zIndex || 2000;
      hasInitZIndex = true;
    }
    return zIndex;
  },
  set(value) {
    zIndex = value;
  }
});

const getTopPopup = function() {
  if (Vue.prototype.$isServer) return;
  if (PopupManager.modalStack.length > 0) {
    const topPopup = PopupManager.modalStack[PopupManager.modalStack.length - 1];
    if (!topPopup) return;
    const instance = PopupManager.getInstance(topPopup.id);

    return instance;
  }
};

if (!Vue.prototype.$isServer) {
  // handle `esc` key when the popup is shown
  window.addEventListener('keydown', function(event) {
    if (event.keyCode === 27) { // ESC
      const topPopup = getTopPopup();

      if (topPopup && topPopup.closeOnPressEscape) {
        topPopup.handleClose
          ? topPopup.handleClose()
          : (topPopup.handleAction ? topPopup.handleAction('cancel') : topPopup.close());
      }
    }
  });
}

export default PopupManager;
