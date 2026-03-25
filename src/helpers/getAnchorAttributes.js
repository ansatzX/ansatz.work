const matter = require("gray-matter");
const path = require("path");
const slugify = require("@sindresorhus/slugify");
const { headerToId } = require("./utils");
const { memoizedReadFile } = require("./fileSystemUtils");

class LinkResolutionError extends Error {
  constructor(message, filePath, cause) {
    super(message);
    this.name = "LinkResolutionError";
    this.filePath = filePath;
    this.cause = cause;
  }
}

const frontMatterCache = new Map();

// Directories to search, in priority order (first found wins)
const NOTES_DIRS = [
  "./src/helpers/__tests__/fixtures/notes/", // test fixtures
  "./src/site/notes/",                        // production notes
];

function resolveFilePath(cleanPath) {
  for (const dir of NOTES_DIRS) {
    const withExt = cleanPath.endsWith(".md") ? cleanPath : `${cleanPath}.md`;
    const fullPath = path.join(dir, withExt);
    if (require("./fileSystemUtils").exists(fullPath)) return fullPath;
  }
  // Fall back to production path for cache key
  const withExt = cleanPath.endsWith(".md") ? cleanPath : `${cleanPath}.md`;
  return path.join(NOTES_DIRS[NOTES_DIRS.length - 1], withExt);
}

function getCachedFrontMatter(fullPath) {
  if (frontMatterCache.has(fullPath)) return frontMatterCache.get(fullPath);

  const content = memoizedReadFile(fullPath);
  let result;
  if (content === null) {
      result = { exists: false };
  } else {
      const fm = matter(content);
      result = { data: fm.data, exists: true };
  }

  frontMatterCache.set(fullPath, result);
  return result;
}

function getAnchorAttributes(filePath, linkTitle) {
  let cleanPath = filePath.replaceAll("&amp;", "&");
  let headerLinkPath = "";
  if (cleanPath.includes("#")) {
    const [name, header] = cleanPath.split("#");
    headerLinkPath = `#${headerToId(header)}`;
    cleanPath = name;
  }

  const noteIcon = process.env.NOTE_ICON_DEFAULT || "";
  const title = linkTitle || cleanPath;
  let permalink = `/notes/${slugify(cleanPath)}`;

  const fullPath = resolveFilePath(cleanPath);

  const fm = getCachedFrontMatter(fullPath);

  if (!fm.exists) {
    return {
      attributes: { class: "internal-link is-unresolved", href: "/404", target: "" },
      innerHTML: title,
    };
  }

  if (fm.data.permalink) permalink = fm.data.permalink;
  if (fm.data.tags && fm.data.tags.indexOf("gardenEntry") !== -1) permalink = "/";

  const resolvedNoteIcon = fm.data.noteIcon || noteIcon;

  return {
    attributes: {
      class: "internal-link",
      target: "",
      "data-note-icon": resolvedNoteIcon,
      href: `${permalink}${headerLinkPath}`,
    },
    innerHTML: title,
  };
}

function getAnchorLink(filePath, linkTitle) {
  const { attributes, innerHTML } = getAnchorAttributes(filePath, linkTitle);
  return `<a ${Object.keys(attributes).map(key => `${key}="${attributes[key]}"`).join(" ")}>${innerHTML}</a>`;
}

module.exports = { getAnchorAttributes, getAnchorLink, getCachedFrontMatter, LinkResolutionError };
