import pluginLoader from "../../helpers/pluginLoader.cjs";
import dotenv from "dotenv";
import { ALL_NOTE_SETTINGS } from "../../helpers/constants.js";

// Load environment variables
dotenv.config();

const allSettings = [...new Set([...ALL_NOTE_SETTINGS, ...pluginLoader.getNoteSettingKeys()])];

export default {
  eleventyComputed: {
    layout: (data) => {
      if (data.tags.indexOf("gardenEntry") != -1) {
        return "layouts/index.njk";
      }
      return "layouts/note.njk";
    },
    permalink: (data) => {
      if (data.tags.indexOf("gardenEntry") != -1) {
        return "/";
      }
      return data.permalink || undefined;
    },
    settings: (data) => {
      const noteSettings = {};
      allSettings.forEach((setting) => {
        let noteSetting = data[setting];
        let globalSetting = process.env[setting];

        let settingValue =
          noteSetting || (globalSetting === "true" && noteSetting !== false);
        noteSettings[setting] = settingValue;
      });
      return noteSettings;
    },
    // Keep the current fork's template variables while accepting the
    // frontmatter names emitted by the current Digital Garden plugin.
    noteIcon: (data) => data["dg-note-icon"] ?? data.noteIcon,
    contentClasses: (data) =>
      data["dg-content-classes"] ?? data.contentClasses ?? "",
    metatags: (data) => data["dg-metatags"] ?? data.metatags,
  },
};
