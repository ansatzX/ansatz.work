import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import markdownItMark from "markdown-it-mark";
import markdownItFootnote from "markdown-it-footnote";
import markdownItMathjax3 from "markdown-it-mathjax3";
import markdownItAttrs from "markdown-it-attrs";
import markdownItTaskCheckbox from "markdown-it-task-checkbox";
import markdownItPlantuml from "markdown-it-plantuml";

import { headerToId, namedHeadingsFilter } from "./utils.js";
import { userMarkdownSetup } from "./userSetup.js";
// import tikzPlugin from "./tikz-plugin.js";

export const tagRegex = /(^|\s|>)(#[^\s!@#$%^&*()=+\.,\[{\]};:'"?><]+)(?![^<]*>)/g;

export function createMarkdownIt() {
  let markdownLib = markdownIt({
    breaks: true,
    html: true,
    linkify: true,
  })
    .use(markdownItAnchor, {
      slugify: headerToId,
    })
    .use(markdownItMark)
    .use(markdownItFootnote)
    .use(function (md) {
      md.renderer.rules.hashtag_open = function (tokens, idx) {
        return '<a class="tag" onclick="toggleTagSearch(this)">';
      };
    })
    .use(markdownItMathjax3, {
      mathjax: {
        tex: {
          // 行间公式：单$或\(...\)
          inlineMath: [['$', '$'], ['\\(', '\\)']],
          // 块级公式：双$$或\[...\]（需要前后有空行）
          displayMath: [['$$', '$$'], ['\\[', '\\]']],
          processEscapes: true,
          processEnvironments: true,
          processRefs: true,
          packages: {'[+]': ['noerrors', 'noundefined', 'amsmath', 'amssymbols', 'color', 'newcommand']},
        },
        options: {
          skipHtmlTags: {'[-]': ['pre']},
        }
      }
    })
    .use(markdownItAttrs)
    .use(markdownItTaskCheckbox, {
      disabled: true,
      divWrap: false,
      divClass: "checkbox",
      idPrefix: "cbx_",
      ulClass: "task-list",
      liClass: "task-list-item",
    })
    .use(markdownItPlantuml, {
      openMarker: "```plantuml",
      closeMarker: "```",
    })
    .use(namedHeadingsFilter)
    // .use(tikzPlugin, { outputDir: "./dist/img/tikz" })
    .use(function (md) {
      // https://github.com/DCsunset/markdown-it-mermaid-plugin
      const origFenceRule =
        md.renderer.rules.fence ||
        function (tokens, idx, options, env, self) {
          return self.renderToken(tokens, idx, options, env, self);
        };
      md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
        const token = tokens[idx];
        if (token.info === "mermaid") {
          const code = token.content.trim();
          return `<pre class="mermaid">${code}</pre>`;
        }
        if (token.info === "tikz") {
          const code = token.content.trim();
          return `<div class="tikz-block">
            <div class="tikz-header" onclick="this.closest('.tikz-block').classList.toggle('show-code')">
              <span class="tikz-label">TikZ (LaTeX)</span>
              <span class="tikz-toggle-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </span>
            </div>
            <div class="tikz-code">
              <pre><code>${md.utils.escapeHtml(code)}</code></pre>
            </div>
          </div>`;
        }
        if (token.info === "transclusion") {
          const code = token.content.trim();
          return `<div class="transclusion">${md.render(code)}</div>`;
        }
        if (token.info.startsWith("ad-")) {
          const code = token.content.trim();
          const parts = code.split("\n");
          let titleLine;
          let collapse;
          let collapsible = false;
          let collapsed = true;
          let icon;
          let color;
          let nbLinesToSkip = 0;
          for (let i = 0; i < 4; i++) {
            if (parts[i] && parts[i].trim()) {
              let line = parts[i] && parts[i].trim().toLowerCase();
              if (line.startsWith("title:")) {
                titleLine = line.substring(6);
                nbLinesToSkip++;
              } else if (line.startsWith("icon:")) {
                icon = line.substring(5);
                nbLinesToSkip++;
              } else if (line.startsWith("collapse:")) {
                collapsible = true;
                collapse = line.substring(9);
                if (collapse && collapse.trim().toLowerCase() == "open") {
                  collapsed = false;
                }
                nbLinesToSkip++;
              } else if (line.startsWith("color:")) {
                color = line.substring(6);
                nbLinesToSkip++;
              }
            }
          }
          const foldDiv = collapsible
            ? `<div class="callout-fold">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-chevron-down">
              <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
          </div>`
            : "";
          const titleDiv = titleLine
            ? `<div class="callout-title"><div class="callout-title-inner">${titleLine}</div>${foldDiv}</div>`
            : "";
          let collapseClasses = titleLine && collapsible ? "is-collapsible" : "";
          if (collapsible && collapsed) {
            collapseClasses += " is-collapsed";
          }

          let res = `<div data-callout-metadata class="callout ${collapseClasses}" data-callout="${token.info.substring(3)}">${titleDiv}
<div class="callout-content">${md.render(parts.slice(nbLinesToSkip).join("\n"))}</div></div>`;
          return res;
        }

        // Other languages
        return origFenceRule(tokens, idx, options, env, slf);
      };

      const defaultImageRule =
        md.renderer.rules.image ||
        function (tokens, idx, options, env, self) {
          return self.renderToken(tokens, idx, options, env, self);
        };
      md.renderer.rules.image = (tokens, idx, options, env, self) => {
        const imageName = tokens[idx].content;
        // "image.png|metadata?|width"
        const [fileName, ...widthAndMetaData] = imageName.split("|");
        const lastValue = widthAndMetaData[widthAndMetaData.length - 1];
        const lastValueIsNumber = !isNaN(lastValue);
        const width = lastValueIsNumber ? lastValue : null;

        let metaData = "";
        if (widthAndMetaData.length > 1) {
          metaData = widthAndMetaData.slice(0, widthAndMetaData.length - 1).join(" ");
        }

        if (!lastValueIsNumber) {
          metaData += ` ${lastValue}`;
        }

        if (width) {
          const widthIndex = tokens[idx].attrIndex("width");
          const widthAttr = `${width}px`;
          if (widthIndex < 0) {
            tokens[idx].attrPush(["width", widthAttr]);
          } else {
            tokens[idx].attrs[widthIndex][1] = widthAttr;
          }
        }

        return defaultImageRule(tokens, idx, options, env, self);
      };

      const defaultLinkRule =
        md.renderer.rules.link_open ||
        function (tokens, idx, options, env, self) {
          return self.renderToken(tokens, idx, options, env, self);
        };
      md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
        const aIndex = tokens[idx].attrIndex("target");
        const classIndex = tokens[idx].attrIndex("class");

        if (aIndex < 0) {
          tokens[idx].attrPush(["target", "_blank"]);
        } else {
          tokens[idx].attrs[aIndex][1] = "_blank";
        }

        if (classIndex < 0) {
          tokens[idx].attrPush(["class", "external-link"]);
        } else {
          tokens[idx].attrs[classIndex][1] = "external-link";
        }

        return defaultLinkRule(tokens, idx, options, env, self);
      };
    })
    .use(userMarkdownSetup);

  return markdownLib;
}
