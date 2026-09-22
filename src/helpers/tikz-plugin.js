import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs";
import os from "os";
import path from "path";
import crypto from "crypto";

const execAsync = promisify(execFile);
export function tikzLimits(env = process.env) {
  const bounded = (key, fallback, max) => {
    const n = Number(env[key]);
    return Number.isInteger(n) && n > 0 ? Math.min(n, max) : fallback;
  };
  return { concurrency: bounded("TIKZ_CONCURRENCY", 2, 4), timeout: bounded("TIKZ_TIMEOUT_MS", 30000, 120000) };
}
export async function compileTikzBlocks(blocks, outputDir, compile = compileTikzToSvg) {
  const results = new Array(blocks.length);
  let next = 0;
  await Promise.all(Array.from({length: Math.min(tikzLimits().concurrency, blocks.length)}, async () => {
    while (next < blocks.length) {
      const index = next++;
      try { results[index] = {status: "fulfilled", value: await compile(blocks[index].code, outputDir)}; }
      catch (reason) { results[index] = {status: "rejected", reason}; }
    }
  }));
  return results;
}

// Per-build collection: hash -> {code, hash}
const tikzCodeMap = new Map();

function getTikzHash(tikzCode) {
  return crypto.createHash("md5").update(tikzCode).digest("hex");
}

/**
 * Compile one TikZ code block to SVG.
 * Uses latex -> DVI -> dvisvgm pipeline (more reliable than pdflatex -> PDF).
 * @param {string} tikzCode
 * @param {string} outputDir  directory to write the SVG into
 * @returns {string|null} public path like /img/tikz/tikz-<hash>.svg, or null on failure
 */
async function compileTikzToSvg(tikzCode, outputDir) {
  const hash = getTikzHash(tikzCode);
  const svgFileName = `tikz-${hash}.svg`;
  const svgFile = path.join(outputDir, svgFileName);

  // Already compiled — skip
  if (fs.existsSync(svgFile)) {
    return `/img/tikz/${svgFileName}`;
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "tikz-"));
  const texFile = path.join(tmpDir, "tikz.tex");

  const texDocument = String.raw`\documentclass[border=2pt]{standalone}
\usepackage{amsmath}
\usepackage{amssymb}
\usepackage{tikz}
\usetikzlibrary{arrows,calc,patterns,shapes,shadows,positioning}
\begin{document}
    ${extractDocumentBody(tikzCode)}
\end{document}
`;

  fs.writeFileSync(texFile, texDocument);

  try {
    fs.mkdirSync(outputDir, { recursive: true });

    // latex -> DVI
    await execAsync(
      "latex", ["-no-shell-escape", "-halt-on-error", "-interaction=nonstopmode", `-output-directory=${tmpDir}`, texFile],
      { timeout: tikzLimits().timeout, killSignal: "SIGKILL", maxBuffer: 1024 * 1024 },
    );

    const dviFile = path.join(tmpDir, "tikz.dvi");
    if (!fs.existsSync(dviFile)) {
      throw new Error("No DVI generated");
    }

    // DVI -> SVG via dvisvgm. Modern dvisvgm discovers Ghostscript through
    // its compiled-in integration; the removed --libgs option is unsupported
    // by current dvisvgm releases.
    await execAsync(
      "dvisvgm", ["--no-fonts", `--output=${svgFile}`, dviFile],
      { timeout: tikzLimits().timeout, killSignal: "SIGKILL", maxBuffer: 1024 * 1024 },
    );

    // dvisvgm can return successfully without producing the requested file
    // (for example when a converter/plugin is unavailable). Never publish a
    // URL for an artifact that is not actually present in dist.
    if (!fs.existsSync(svgFile) || fs.statSync(svgFile).size === 0) {
      throw new Error("dvisvgm completed without producing a non-empty SVG");
    }

    return `/img/tikz/${svgFileName}`;
  } catch (err) {
    const details = err.stderr?.trim() || err.stdout?.trim();
    console.error(
      `[tikz] compilation failed (hash=${hash}):`,
      details ? `${err.message}\n${details}` : err.message,
    );
    fs.rmSync(svgFile, { force: true });
    return null;
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

/**
 * Accept both a TikZ fragment and a pasted LaTeX document fragment. Markdown
 * notes in the wild sometimes include \begin{document}/\end{document} and
 * package declarations even though this plugin supplies the document shell.
 * Keep only the document body so those declarations cannot land in the body.
 */
function extractDocumentBody(code) {
  const begin = code.indexOf("\\begin{document}");
  if (begin === -1) {
    return code
      .replace(/^\\documentclass(?:\[[^\]]*\])?\{[^}]+\}\s*/gm, "")
      .replace(/^\\usepackage(?:\[[^\]]*\])?\{[^}]+\}\s*/gm, "");
  }

  const bodyStart = begin + "\\begin{document}".length;
  const end = code.lastIndexOf("\\end{document}");
  return code.slice(bodyStart, end === -1 ? code.length : end).trim();
}

/**
 * Ensure TikZ code is wrapped in a tikzpicture environment.
 * If the user writes bare \draw/\node commands, they get wrapped automatically.
 */
function ensureTikzpicture(code) {
  if (code.includes("\\begin{tikzpicture}")) return code;
  return `\\begin{tikzpicture}\n${code}\n\\end{tikzpicture}`;
}

/**
 * markdown-it plugin: intercept ```tikz fenced blocks, output an <img> tag
 * pointing at the pre-rendered SVG and a collapsible source-code <details>.
 * The actual SVG compilation is done post-build via compileTikzToSvg().
 */
export default function tikzPlugin(md) {
  const origFenceRule =
    md.renderer.rules.fence ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options, env, self);
    };

  md.renderer.rules.fence = function (tokens, idx, options, env, self) {
    const token = tokens[idx];
    if (token.info.trim() !== "tikz") {
      return origFenceRule(tokens, idx, options, env, self);
    }

    const tikzCode = token.content.trim();
    const wrappedCode = ensureTikzpicture(tikzCode);
    const hash = getTikzHash(wrappedCode);
    const svgPath = `/img/tikz/tikz-${hash}.svg`;

    tikzCodeMap.set(hash, { code: wrappedCode, hash });

    return `<div class="tikz-block" data-tikz-hash="${hash}">
<img class="tikz-svg" src="${svgPath}" alt="TikZ diagram" loading="lazy" />
<details class="tikz-source">
<summary>Show TikZ Source</summary>
<pre><code>${md.utils.escapeHtml(wrappedCode)}</code></pre>
</details>
</div>`;
  };

  return md;
}

function getTikzBlocks() {
  return [...tikzCodeMap.values()];
}

function clearTikzBlocks() {
  tikzCodeMap.clear();
}

export {
  compileTikzToSvg,
  getTikzBlocks,
  clearTikzBlocks,
  getTikzHash,
  extractDocumentBody,
};
