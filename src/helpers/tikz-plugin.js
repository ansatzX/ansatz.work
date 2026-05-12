import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import os from "os";
import path from "path";
import crypto from "crypto";

const execAsync = promisify(exec);

// Per-build collection: hash -> {code, hash}
const tikzCodeMap = new Map();

function getTikzHash(tikzCode) {
  return crypto.createHash("md5").update(tikzCode).digest("hex");
}

/**
 * Find Ghostscript binary (needed by dvisvgm for TikZ PostScript specials).
 * Returns the path string, or empty string if not found.
 */
function findGs() {
  const candidates = [
    "/opt/homebrew/bin/gs",
    "/usr/local/bin/gs",
    "/usr/bin/gs",
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  // Try PATH
  try {
    const { stdout } = execSync("which gs 2>/dev/null");
    return stdout.trim();
  } catch {
    return "";
  }
}

import { execSync } from "child_process";

let _gsPath = undefined;
function getGsPath() {
  if (_gsPath === undefined) _gsPath = findGs();
  return _gsPath;
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
${tikzCode}
\end{document}
`;

  fs.writeFileSync(texFile, texDocument);

  try {
    fs.mkdirSync(outputDir, { recursive: true });

    // latex -> DVI
    await execAsync(
      `latex -interaction=nonstopmode -output-directory=${tmpDir} ${texFile}`,
      { stdio: "pipe" },
    );

    const dviFile = path.join(tmpDir, "tikz.dvi");
    if (!fs.existsSync(dviFile)) {
      throw new Error("No DVI generated");
    }

    // DVI -> SVG via dvisvgm (with Ghostscript for PostScript specials)
    const gsPath = getGsPath();
    const libgsFlag = gsPath ? `--libgs=${gsPath}` : "";
    await execAsync(
      `dvisvgm --no-fonts ${libgsFlag} --output=${svgFile} ${dviFile}`,
      { stdio: "pipe" },
    );

    return `/img/tikz/${svgFileName}`;
  } catch (err) {
    console.error(`[tikz] compilation failed (hash=${hash}):`, err.message);
    return null;
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
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

export { compileTikzToSvg, getTikzBlocks, clearTikzBlocks, getTikzHash };
