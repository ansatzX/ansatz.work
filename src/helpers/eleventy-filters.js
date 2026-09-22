import { parse } from "node-html-parser";
import { tagRegex } from "./markdown-plugins.js";
import { getAnchorLink } from "./getAnchorAttributes.js";

export default function buildFilters(eleventyConfig) {
  eleventyConfig.addFilter("isoDate", function (date) {
    if (!date || !date.toISOString) return "";
    return date.toISOString();
  });

  eleventyConfig.addFilter("link", function (str) {
    if (!str || typeof str !== 'string') return str;
    return str.replace(/\`\[\[(.*?\|.*?)\]\]\`/g, function (match, p1) {
      // Check if it is an embedded excalidraw drawing or mathjax javascript
      if (p1.indexOf("],[") > -1 || p1.indexOf('"$"') > -1) {
        return match;
      }
      const [fileLink, linkTitle] = p1.split("|");
      return getAnchorLink(fileLink, linkTitle);
    });
  });

  eleventyConfig.addFilter("taggify", taggify);
  eleventyConfig.addFilter("searchText", searchText);
  eleventyConfig.addFilter("searchTags", (html, tags = []) => {
    const inline = [...searchText(html).matchAll(tagRegex)].map(m => m[2].slice(1));
    return [...new Set([...inline, ...(Array.isArray(tags) ? tags : [tags])])];
  });

  eleventyConfig.addFilter("hideDataview", function (str) {
    return (
      str &&
      str.replace(/\(\S+\:\:(.*)\)/g, function (_, value) {
        return value.trim();
      })
    );
  });

  eleventyConfig.addFilter("dateToZulu", function (date) {
    try {
      return new Date(date).toISOString("dd-MM-yyyyTHH:mm:ssZ");
    } catch {
      return "";
    }
  });

  eleventyConfig.addFilter("jsonify", function (variable) {
    return JSON.stringify(variable) || '""';
  });

  eleventyConfig.addFilter("validJson", function (variable) {
    if (Array.isArray(variable)) {
      return variable.map((x) => x.replaceAll("\\", "\\\\")).join(",");
    } else if (typeof variable === "string") {
      return variable.replaceAll("\\", "\\\\");
    }
    return variable;
  });
}

// Work on prose text nodes only: generated CSS, SVG and code are not hashtags.
export function taggify(html) {
  if (!html) return html;
  const root = parse(html);
  const skip = new Set(["STYLE", "SCRIPT", "PRE", "CODE", "A", "SVG", "MJX-CONTAINER", "MATH"]);
  const walk = node => {
    if (skip.has(node.tagName)) return;
    if (node.nodeType === 3) {
      node.rawText = node.rawText.replace(tagRegex, (_, prefix, tag) =>
        `${prefix}<a class="tag" data-content="${tag}">${tag}</a>`);
    } else node.childNodes.forEach(walk);
  };
  walk(root);
  return root.toString();
}

export function searchText(html) {
  const root = parse(html || "");
  root.querySelectorAll("style, script, pre, code, svg, .tikz-container summary").forEach(n => n.remove());
  return root.structuredText.replace(/\s+/g, " ").trim();
}
