import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import temp from "tmp";
import slugify from "@sindresorhus/slugify";
import crypto from "crypto";

const execAsync = promisify(exec);

// 缓存已编译的SVG，避免重复编译
const svgCache = new Map();
const pendingCompilations = new Map();

/**
 * 计算TikZ代码的哈希值，用于缓存
 */
function getTikzHash(tikzCode) {
  return crypto.createHash("md5").update(tikzCode).digest("hex");
}

/**
 * 同步编译TikZ代码为SVG
 * 这个函数会在构建时被调用
 */
async function compileTikzToSvg(tikzCode, outputDir = "./dist/img/tikz") {
  const hash = getTikzHash(tikzCode);

  // 检查缓存
  if (svgCache.has(hash)) {
    return svgCache.get(hash);
  }

  // 检查是否已经在编译中
  if (pendingCompilations.has(hash)) {
    return pendingCompilations.get(hash);
  }

  const compilationPromise = (async () => {
    const tmpDir = temp.dirSync({ unsafeCleanup: true });
    const texFile = path.join(tmpDir.name, "tikz.tex");
    const svgFileName = `tikz-${hash}.svg`;
    const svgFile = path.join(outputDir, svgFileName);
    const publicSvgPath = `/img/tikz/${svgFileName}`;

    // 检查是否已经存在（持久化缓存）
    if (fs.existsSync(svgFile)) {
      try {
        const svgContent = fs.readFileSync(svgFile, "utf8");
        tmpDir.removeCallback();
        svgCache.set(hash, { svgContent, svgPath: publicSvgPath });
        return { svgContent, svgPath: publicSvgPath };
      } catch (e) {
        // 文件存在但读取失败，继续重新编译
      }
    }

    const texDocument = String.raw`\documentclass[border=0pt]{standalone}
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

      // 第一步：使用pdflatex编译（更稳定）
      const pdflatexCmd = `pdflatex -interaction=nonstopmode -output-directory=${tmpDir.name} ${texFile}`;
      try {
        await execAsync(pdflatexCmd, { stdio: "pipe" });
      } catch (latexErr) {
        // 如果pdflatex失败，尝试latex
        console.log("[tikz] pdflatex failed, trying latex...");
        const latexCmd = `latex -interaction=nonstopmode -output-directory=${tmpDir.name} ${texFile}`;
        await execAsync(latexCmd, { stdio: "pipe" });
      }

      // 第二步：使用dvisvgm或pdf2svg转换为SVG
      const pdfFile = path.join(tmpDir.name, "tikz.pdf");
      const dviFile = path.join(tmpDir.name, "tikz.dvi");

      if (fs.existsSync(pdfFile)) {
        // 优先使用pdf2svg（如果可用）
        try {
          const pdf2svgCmd = `pdf2svg ${pdfFile} ${svgFile}`;
          await execAsync(pdf2svgCmd, { stdio: "pipe" });
        } catch (pdf2svgErr) {
          // pdf2svg不可用，使用dvisvgm
          console.log("[tikz] pdf2svg not available, trying dvisvgm...");
          const dvisvgmCmd = `dvisvgm --pdf --no-fonts --output=${svgFile} ${pdfFile}`;
          await execAsync(dvisvgmCmd, { stdio: "pipe" });
        }
      } else if (fs.existsSync(dviFile)) {
        const dvisvgmCmd = `dvisvgm --no-fonts --output=${svgFile} ${dviFile}`;
        await execAsync(dvisvgmCmd, { stdio: "pipe" });
      } else {
        throw new Error("No PDF or DVI file generated");
      }

      // 读取生成的SVG
      const svgContent = fs.readFileSync(svgFile, "utf8");

      // 清理并缓存
      tmpDir.removeCallback();
      svgCache.set(hash, { svgContent, svgPath: publicSvgPath });

      return { svgContent, svgPath: publicSvgPath };
    } catch (err) {
      console.error("[tikz] --- Compilation Error ---");
      console.error("[tikz] Failed to compile the following TikZ code:");
      console.error(tikzCode);
      console.error("[tikz] Error Message:", err.message);
      if (err.stderr) {
        console.error("[tikz] Compiler stderr:", err.stderr.toString());
      }
      if (err.stdout) {
        console.error("[tikz] Compiler stdout:", err.stdout.toString());
      }
      try {
        const texFileContent = fs.readFileSync(texFile, "utf8");
        console.error("[tikz] Generated TeX file content:\n", texFileContent);
      } catch (readError) {
        // ignore
      }
      tmpDir.removeCallback();

      // 返回错误占位符
      const errorSvg = String.raw`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="100" viewBox="0 0 300 100">
        <rect x="0" y="0" width="300" height="100" fill="#fee2e2" stroke="#ef4444" stroke-width="2"/>
        <text x="150" y="40" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#991b1b">TikZ Compilation Error</text>
        <text x="150" y="65" text-anchor="middle" font-family="monospace" font-size="10" fill="#7f1d1d">Check console for details</text>
      </svg>`;

      return { svgContent: errorSvg, svgPath: null, error: true };
    }
  })();

  pendingCompilations.set(hash, compilationPromise);

  try {
    const result = await compilationPromise;
    pendingCompilations.delete(hash);
    return result;
  } catch (err) {
    pendingCompilations.delete(hash);
    throw err;
  }
}

/**
 * 存储所有的TikZ代码块，用于后续编译
 */
const tikzCodeBlocks = [];

/**
 * markdown-it plugin for rendering TikZ diagrams.
 * 这个插件在渲染阶段收集TikZ代码块，
 * 然后在构建后统一编译。
 */
export default function tikzPlugin(md, options) {
  const opts = Object.assign(
    {
      outputDir: "./dist/img/tikz",
    },
    options
  );

  // 重置代码块收集
  md.core.ruler.push("tikz-collector", (state) => {
    tikzCodeBlocks.length = 0;
  });

  // 渲染时收集代码块
  const origFenceRule = md.renderer.rules.fence || function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options, env, self);
  };

  md.renderer.rules.fence = function (tokens, idx, options, env, self) {
    const token = tokens[idx];
    if (token.info !== "tikz") {
      return origFenceRule(tokens, idx, options, env, self);
    }

    const tikzCode = token.content.trim();
    const hash = getTikzHash(tikzCode);

    // 收集代码块
    tikzCodeBlocks.push({ code: tikzCode, hash });

    // 返回占位符，包含hash用于后续替换
    return `<div class="tikz-container" data-tikz-hash="${hash}">
      <div class="tikz-placeholder">Loading TikZ diagram...</div>
    </div>`;
  };

  return md;
}

/**
 * 导出编译函数，供eleventy配置使用
 */
export { compileTikzToSvg, tikzCodeBlocks, getTikzHash };
