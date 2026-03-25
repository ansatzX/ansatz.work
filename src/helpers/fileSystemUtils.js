const fs = require("fs");

const fileCache = new Map(); // path -> string (file content)
const existenceCache = new Map(); // path -> boolean

function memoizedReadFile(fullPath) {
  if (fileCache.has(fullPath)) return fileCache.get(fullPath);
  try {
    const content = fs.readFileSync(fullPath, "utf8");
    fileCache.set(fullPath, content);
    existenceCache.set(fullPath, true);
    return content;
  } catch (err) {
    if (err.code === "ENOENT") {
      existenceCache.set(fullPath, false);
      return null;
    }
    throw err;
  }
}

function exists(fullPath) {
  if (existenceCache.has(fullPath)) return existenceCache.get(fullPath);
  const result = fs.existsSync(fullPath);
  existenceCache.set(fullPath, result);
  return result;
}

module.exports = { memoizedReadFile, exists };
