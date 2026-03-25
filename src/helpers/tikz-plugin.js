import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import temp from "tmp";
import slugify from "@sindresorhus/slugify";

const execAsync = promisify(exec);

/**
 * markdown-it plugin for rendering TikZ diagrams.
 * Compiles ```tikz blocks to SVG via LaTeX + dvisvgm.
 *
 * @param {import('markdown-it')} md - markdown-it instance
 * @param {Object} [options]
 * @param {string} [options.outputDir='./dist/img/tikz'] - Directory to write SVG files
 * @param {string} [options.texOptions='-shell-escape -halt-on-error -interaction=nonstopmode'] - LaTeX flags
 */
export default function tikzPlugin(md, options) {
  const defaultOptions = {
    outputDir: "./dist/img/tikz",
    texOptions: "-shell-escape -halt-on-error -interaction=nonstopmode",
  };
  const opts = Object.assign({}, defaultOptions, options);

  md.renderer.rules.fence = async function (tokens, idx, options, env, slf) {
    const token = tokens[idx];
    if (token.info !== "tikz") {
      return slf.renderToken(tokens, idx, options, env, slf);
    }

    const tikzCode = token.content.trim();
    const tmpDir = temp.dirSync({ unsafeCleanup: true });
    const texFile = path.join(tmpDir.name, "tikz.tex");
    const svgFile = path.join(
      opts.outputDir,
      `${slugify(tikzCode.substring(0, 20))}.svg`
    );

    const texDocument = `\\documentclass{standalone}
\\usepackage{amsmath}
\\usepackage{tikz}

${tikzCode}
`;

    fs.writeFileSync(texFile, texDocument);

    try {
      fs.mkdirSync(opts.outputDir, { recursive: true });

      const latexCmd = `latex ${opts.texOptions} -output-directory=${tmpDir.name} ${texFile}`;
      const latexResult = await execAsync(latexCmd, { stdio: "pipe" });
      if (latexResult.stdout) {
        console.log("[tikz] latex stdout:", latexResult.stdout.toString());
      }
      if (latexResult.stderr) {
        console.log("[tikz] latex stderr:", latexResult.stderr.toString());
      }

      const dvisvgmCmd = `dvisvgm --no-fonts --output=${svgFile} ${path.join(
        tmpDir.name,
        "tikz.dvi"
      )}`;
      await execAsync(dvisvgmCmd, { stdio: "pipe" });

      const svgContent = fs.readFileSync(svgFile, "utf8");
      tmpDir.removeCallback();
      return `<div class="tikz-container">${svgContent}</div>`;
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
        console.error("[tikz] Error reading TeX file:", readError);
      }
      tmpDir.removeCallback();
      return `<div class="tikz-error">Error compiling TikZ code. Check console for details.</div>`;
    }
  };
}
