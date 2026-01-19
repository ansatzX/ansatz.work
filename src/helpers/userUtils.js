/**
 * 用户自定义计算数据函数
 *
 * @param {Object} data - Eleventy 数据对象，包含所有集合和页面数据
 * @returns {Object} - 要添加到模板上下文的计算属性对象
 *
 * 此函数允许用户添加自定义计算属性，而不需要修改 eleventyComputed.js
 * 返回的对象将被合并到模板上下文中
 *
 * 示例：
 * return {
 *   currentYear: new Date().getFullYear(),
 *   customSetting: process.env.MY_CUSTOM_SETTING
 * };
 */
function userComputed(data) {
  return {};
}

exports.userComputed = userComputed;
