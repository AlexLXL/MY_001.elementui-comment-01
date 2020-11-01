import Vue from 'vue';

let scrollBarWidth;
// 获取滚动条宽度
export default function() {
  if (Vue.prototype.$isServer) return 0;
  if (scrollBarWidth !== undefined) return scrollBarWidth;

  // 1.创建一个100px宽度的div元素插入body中，并设置滚动模式，widthNoScroll保存该div的offseWidth，即100；
  const outer = document.createElement('div');
  outer.className = 'el-scrollbar__wrap';
  outer.style.visibility = 'hidden';
  outer.style.width = '100px';
  outer.style.position = 'absolute';
  outer.style.top = '-9999px';
  document.body.appendChild(outer);

  const widthNoScroll = outer.offsetWidth;
  outer.style.overflow = 'scroll';

  // 2.创建一个100%宽度的div元素，插入到第一步创建的div中，widthWithScroll保存offseWidth值，83左右(看具体电脑)；
  const inner = document.createElement('div');
  inner.style.width = '100%';
  outer.appendChild(inner);

  const widthWithScroll = inner.offsetWidth;
  outer.parentNode.removeChild(outer);
  // 3.返回值为widthNoScroll - widthWithScroll，即17。
  scrollBarWidth = widthNoScroll - widthWithScroll;

  return scrollBarWidth;
};
