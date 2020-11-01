import defaultLang from 'element-ui/src/locale/lang/zh-CN';
import Vue from 'vue';
import deepmerge from 'deepmerge'; // 深度合并对象 https://www.npmjs.com/package/deepmerge
import Format from './format';

const format = Format(Vue);
let lang = defaultLang;
let merged = false;
let i18nHandler = function() {
  /*
  * getPrototypeOf获取vue的原型对象
  *
  * .$t是vue使用国际化插件vue-i18n的时候添加上去的
  * import VueI18n from 'vue-i18n'
  * Vue.use(VueI18n)
  *
  * vue-i18n的使用: https://www.jianshu.com/p/2d3119f9bfd8
  * */
  const vuei18n = Object.getPrototypeOf(this || Vue).$t;
  if (typeof vuei18n === 'function' && !!Vue.locale) {
    if (!merged) {
      merged = true;
      // 第一个参数:'zh-cn', 第二个参数.json
      Vue.locale(
        Vue.config.lang,
        deepmerge(lang, Vue.locale(Vue.config.lang) || {}, { clone: true })
      );
    }
    return vuei18n.apply(this, arguments);
  }
};

export const t = function(path, options) {
  let value = i18nHandler.apply(this, arguments);
  if (value !== null && value !== undefined) return value;

  const array = path.split('.');
  let current = lang;

  for (let i = 0, j = array.length; i < j; i++) {
    const property = array[i];
    value = current[property];
    if (i === j - 1) return format(value, options);
    if (!value) return '';
    current = value;
  }
  return '';
};

export const use = function(l) {
  lang = l || lang;
};

export const i18n = function(fn) {
  i18nHandler = fn || i18nHandler;
};

export default { use, t, i18n };
