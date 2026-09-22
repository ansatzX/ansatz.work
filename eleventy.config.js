import faviconsPlugin from "eleventy-plugin-gen-favicons";
import tocPlugin from "eleventy-plugin-nesting-toc";
import pluginRss from "@11ty/eleventy-plugin-rss";

import buildFilters from "./src/helpers/eleventy-filters.js";
import buildTransforms from "./src/helpers/eleventy-transforms.js";
import { getAnchorAttributes, getAnchorLink } from "./src/helpers/getAnchorAttributes.js";
import { userEleventySetup } from "./src/helpers/userSetup.js";
import { createMarkdownIt, tagRegex } from "./src/helpers/markdown-plugins.js";
import { compileTikzBlocks, getTikzBlocks, clearTikzBlocks } from "./src/helpers/tikz-plugin.js";
import path from "path";
import pluginLoader from "./src/helpers/pluginLoader.cjs";


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
  eleventyConfig.addPassthroughCopy("src/site/styles/user/*.css");
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

  pluginLoader.applyEleventyHooks(eleventyConfig);
  userEleventySetup(eleventyConfig);

  // Post-build: compile TikZ code blocks to SVG
  eleventyConfig.on("eleventy.after", async ({ dir, outputMode }) => {
    const blocks = getTikzBlocks();
    if (blocks.length === 0) return;
    const svgDir = path.join(dir.output, "img", "tikz");
    console.log(`[tikz] compiling ${blocks.length} diagram(s) to ${svgDir}`);
    const results = await compileTikzBlocks(blocks, svgDir);
    const succeeded = results.filter((r) => r.status === "fulfilled" && r.value).length;
    const failed = results.length - succeeded;
    if (failed > 0) {
      clearTikzBlocks();
      const message =
        `[tikz] ${failed}/${results.length} diagram(s) failed to compile; ` +
        "install the LaTeX/dvisvgm toolchain (TinyTeX is supported) and retry";
      if (process.env.ELEVENTY_ENV === "prod" || ["1", "true"].includes(process.env.TIKZ_STRICT?.toLowerCase())) {
        throw new Error(message);
      }
      console.warn(message);
    } else {
      console.log(`[tikz] all ${succeeded} diagram(s) compiled successfully`);
    }
    clearTikzBlocks();
  });

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
