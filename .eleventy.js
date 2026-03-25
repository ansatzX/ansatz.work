const faviconsPlugin = require("eleventy-plugin-gen-favicons");
const tocPlugin = require("eleventy-plugin-nesting-toc");
const pluginRss = require("@11ty/eleventy-plugin-rss");

const buildFilters = require("./src/helpers/eleventy-filters");
const buildTransforms = require("./src/helpers/eleventy-transforms");
const { getAnchorAttributes, getAnchorLink } = require("./src/helpers/getAnchorAttributes");
const { userEleventySetup } = require("./src/helpers/userSetup");
const { createMarkdownIt, tagRegex } = require("./src/helpers/markdown-plugins");


module.exports = function (eleventyConfig) {
  console.log("[11ty] Starting Eleventy configuration...");

  eleventyConfig.on('eleventy.before', async ({ dir, runMode, outputMode }) => {
    console.log(`[11ty] Starting build in ${runMode} mode.`);
    console.log(`[11ty] Input directory: ${dir.input}`);
    console.log(`[11ty] Output directory: ${dir.output}`);
  });

  eleventyConfig.setLiquidOptions({
    dynamicPartials: true,
  });

  let markdownLib = createMarkdownIt();

  eleventyConfig.setLibrary("md", markdownLib);

  buildFilters(eleventyConfig);
  buildTransforms(eleventyConfig);


  eleventyConfig.addPassthroughCopy("src/site/img");
  eleventyConfig.addPassthroughCopy("src/site/scripts");
  eleventyConfig.addPassthroughCopy("src/site/styles/_theme.*.css");
  eleventyConfig.addPassthroughCopy({ 'src/site/robots.txt': '/robots.txt' });
  eleventyConfig.addPlugin(faviconsPlugin, { outputDir: "dist" });
  eleventyConfig.addPlugin(tocPlugin, {
    ul: true,
    tags: ["h1", "h2", "h3", "h4", "h5", "h6"],
  });

  eleventyConfig.addPlugin(pluginRss, {
    posthtmlRenderOptions: {
      closingSingleTag: "slash",
      singleTags: ["link"],
    },
  });

  userEleventySetup(eleventyConfig);

  eleventyConfig.addPassthroughCopy("dist/img/tikz");

  return {
    dir: {
      input: "src/site",
      output: "dist",
      data: `_data`,
    },
    templateFormats: ["njk", "md", "11ty.js"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: false,
    passthroughFileCopy: true,
  };
};