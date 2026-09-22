const fs = require("node:fs");
const path = require("node:path");
module.exports = {
  setupEleventy(config, context) {
    config.addTemplate("dg-search-index.njk",
      fs.readFileSync(path.join(context.pluginDir, "templates/search-index.njk"), "utf8"),
      { permalink: "/searchIndex.json", eleventyExcludeFromCollections: true });
  }
};
