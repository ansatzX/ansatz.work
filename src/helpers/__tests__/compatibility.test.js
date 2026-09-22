import { extractDocumentBody } from "../tikz-plugin.js";
import { getFileTree } from "../filetreeUtils.js";
import { getGraph } from "../linkUtils.js";

describe("Digital Garden compatibility", () => {
  test("normalizes a pasted LaTeX document fragment before TikZ compilation", () => {
    expect(
      extractDocumentBody(
        String.raw`\usepackage{amsmath}
\begin{document}
\begin{tikzpicture}\draw (0,0) -- (1,1);\end{tikzpicture}
\end{document}`,
      ),
    ).toBe(String.raw`\begin{tikzpicture}\draw (0,0) -- (1,1);\end{tikzpicture}`);
  });

  test("accepts current plugin frontmatter aliases in the file tree", () => {
    const tree = getFileTree({
      collections: {
        note: [
          {
            filePathStem: "/notes/projects/example",
            data: {
              "dg-path": "projects/example",
              "dg-note-icon": "◆",
              "dg-pinned": true,
              "dg-hide-in-filetree": true,
            },
          },
        ],
      },
    });

    expect(tree.projects["example.md"]).toMatchObject({
      noteIcon: "◆",
      pinned: true,
      hide: true,
    });
  });

  test("accepts current plugin graph visibility aliases", async () => {
    const graph = await getGraph({
      collections: {
        note: [
          {
            filePathStem: "/notes/example",
            fileSlug: "example",
            url: "/example/",
            data: { "dg-hide-in-graph": true },
            template: {
              read: async () => ({ frontMatter: { content: "" } }),
            },
          },
        ],
      },
    });

    expect(graph.nodes["/example/"].hide).toBe(true);
  });
});
