/**
 * 用户自定义 Markdown 配置点
 *
 * @param {Object} md - markdown-it 实例
 *
 * 此函数允许用户添加自定义的 markdown-it 插件，而不需要修改 .eleventy.js
 *
 * 示例：
 * .use(require("markdown-it-emoji"))
 * .use(require("markdown-it-katex"), { throwOnError: false })
 */
function userMarkdownSetup(md) {
  // The md parameter stands for the markdown-it instance used throughout the site generator.
  // Feel free to add any plugin you want here instead of editing /.eleventy.js
}

/**
 * 用户自定义 Eleventy 配置点
 *
 * @param {Object} eleventyConfig - Eleventy 配置对象
 *
 * 此函数允许用户添加自定义的 Eleventy 插件、过滤器或转换器，而不需要修改 .eleventy.js
 *
 * 示例：
 * - 添加过滤器: eleventyConfig.addFilter("myFilter", function(...) { ... })
 * - 添加插件: eleventyConfig.addPlugin(require("eleventy-plugin-..."))
 * - 添加转换器: eleventyConfig.addTransform("myTransform", function(content, outputPath) { ... })
 */
function userEleventySetup(eleventyConfig) {
  // The eleventyConfig parameter stands for the config instantiated in /.eleventy.js.
  // Feel free to add any plugin you want here instead of editing /.eleventy.js
}

exports.userMarkdownSetup = userMarkdownSetup;
exports.userEleventySetup = userEleventySetup;
