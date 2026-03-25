// Clear module cache between tests to reset frontMatterCache
let getAnchorAttributes, getCachedFrontMatter;

beforeEach(() => {
  jest.resetModules();
  const mod = require("../getAnchorAttributes");
  getAnchorAttributes = mod.getAnchorAttributes;
  getCachedFrontMatter = mod.getCachedFrontMatter;
});

describe("getAnchorAttributes", () => {
  it("resolves existing note to correct href", () => {
    const result = getAnchorAttributes("link-target", "Link Target");
    expect(result.attributes.href).toBe("/notes/link-target");
    expect(result.innerHTML).toBe("Link Target");
    expect(result.attributes.class).toBe("internal-link");
  });

  it("returns /404 for unresolved note", () => {
    const result = getAnchorAttributes("nonexistent-note", "Missing");
    expect(result.attributes.href).toBe("/404");
    expect(result.attributes.class).toBe("internal-link is-unresolved");
  });

  it("resolves gardenEntry note to /", () => {
    const result = getAnchorAttributes("_test-garden-home", "Home");
    expect(result.attributes.href).toBe("/");
  });

  it("resolves note with custom permalink", () => {
    const result = getAnchorAttributes("with-permalink", "Custom");
    expect(result.attributes.href).toBe("/custom/path");
  });

  it("resolves note with header anchor", () => {
    // headerToId slugifies "some-heading" -> "some-heading"
    const result = getAnchorAttributes("link-target#some-heading", "Heading");
    expect(result.attributes.href).toBe("/notes/link-target#some-heading");
  });

  it("uses custom noteIcon from frontmatter", () => {
    const result = getAnchorAttributes("link-target", "Title");
    expect(result.attributes["data-note-icon"]).toBe("🔗");
  });

  it("uses NOTE_ICON_DEFAULT when no frontmatter noteIcon", () => {
    // _test-garden-home has no noteIcon in frontmatter
    const result = getAnchorAttributes("_test-garden-home", "Home");
    expect(result.attributes["data-note-icon"]).toBe("");
  });

  it("handles &amp; in wiki-link paths", () => {
    const result = getAnchorAttributes("nonexistent&amp;test", "Test");
    expect(result).toBeDefined();
    expect(result.attributes.href).toBe("/404");
  });
});

describe("getCachedFrontMatter", () => {
  it("returns exists:false for nonexistent file", () => {
    const result = getCachedFrontMatter("./nonexistent/file.md");
    expect(result.exists).toBe(false);
  });

  it("caches results", () => {
    const cachePath = "./src/site/notes/README.md";
    const r1 = getCachedFrontMatter(cachePath);
    const r2 = getCachedFrontMatter(cachePath);
    expect(r1).toBe(r2); // same object reference
  });
});
