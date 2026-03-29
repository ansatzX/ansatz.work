import faviconsPlugin from "eleventy-plugin-gen-favicons";
import tocPlugin from "eleventy-plugin-nesting-toc";
import pluginRss from "@11ty/eleventy-plugin-rss";

import buildFilters from "./src/helpers/eleventy-filters.js";
import buildTransforms from "./src/helpers/eleventy-transforms.js";
import { getAnchorAttributes, getAnchorLink } from "./src/helpers/getAnchorAttributes.js";
import { userEleventySetup } from "./src/helpers/userSetup.js";
import { createMarkdownIt, tagRegex } from "./src/helpers/markdown-plugins.js";


export default function (eleventyConfig) {
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
  eleventyConfig.addPassthroughCopy({"src/site/_includes/scripts": "scripts"});
  eleventyConfig.addPassthroughCopy("src/site/styles/_theme.*.css");
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
