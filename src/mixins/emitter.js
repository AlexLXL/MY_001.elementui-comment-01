// packages/select/src/select.vue中，value的监控方法中用到dispatch和broadcast：
function broadcast(componentName, eventName, params) {
  // 遍历所有子组件
  this.$children.forEach(child => {
    var name = child.$options.componentName;

    // 找到组件名为componentName的子组件，并调用该子组件的$emit方法；
    // 否则，继续递归
    if (name === componentName) {
      child.$emit.apply(child, [eventName].concat(params));
    } else {
      broadcast.apply(child, [componentName, eventName].concat([params]));
    }
  });
}
export default {
  methods: {
    /*
    * 子组件发送消息给上层组件
    * componentName: 上层组件名称
    * eventName: 时间名称
    * params: 参数
    * */
    dispatch(componentName, eventName, params) {
      // 当前父组件
      var parent = this.$parent || this.$root;
      // 当前父组件的组件名
      var name = parent.$options.componentName;

      // 通过$parent，一直向上找，直到组件名等于componentName
      while (parent && (!name || name !== componentName)) {
        parent = parent.$parent;

        if (parent) {
          name = parent.$options.componentName;
        }
      }
      if (parent) {
        // 如果找到目标组件，那么调用目标组件的$emit方法
        // 子组件select.vue里 this.dispatch('ElFormItem', 'el.form.change', val);
        // 父组件form-item.vue里 this.$on('el.form.change', this.onFieldChange);
        parent.$emit.apply(parent, [eventName].concat(params));
      }
    },
    /*
    * 上层组件通知下层组件
    *
    * */
    broadcast(componentName, eventName, params) {
      // this.broadcast('ElSelectDropdown', 'destroyPopper');
      broadcast.call(this, componentName, eventName, params);
    }
  }
};
