import dotenv from "dotenv";
import { globSync } from "glob";

// Load environment variables
dotenv.config();

function getBuildDate() {
  const sourceDateEpoch = process.env.SOURCE_DATE_EPOCH;
  if (sourceDateEpoch !== undefined && sourceDateEpoch !== "") {
    const epoch = Number(sourceDateEpoch);
    if (Number.isFinite(epoch)) {
      return new Date(epoch * 1000);
    }
  }
  return new Date();
}

export default async (data) => {
  let baseUrl = process.env.SITE_BASE_URL || "https://ansatz.work";
  if (baseUrl && !baseUrl.startsWith("http")) {
    baseUrl = "https://" + baseUrl;
  }
  baseUrl = new URL(baseUrl).origin;
  let themeStyle = globSync("src/site/styles/_theme.*.css")[0] || "";
  if (themeStyle) {
    themeStyle = themeStyle.split("site")[1];
  }
  let bodyClasses = [];
  let noteIconsSettings = {
    filetree: false,
    links: false,
    title: false,
    default: process.env.NOTE_ICON_DEFAULT || "",
  };

  const styleSettingsCss = process.env.STYLE_SETTINGS_CSS || "";
  const styleSettingsBodyClasses = process.env.STYLE_SETTINGS_BODY_CLASSES || "";

  if (process.env.NOTE_ICON_TITLE && process.env.NOTE_ICON_TITLE == "true") {
    bodyClasses.push("title-note-icon");
    noteIconsSettings.title = true;
  }
  if (
    process.env.NOTE_ICON_FILETREE &&
    process.env.NOTE_ICON_FILETREE == "true"
  ) {
    bodyClasses.push("filetree-note-icon");
    noteIconsSettings.filetree = true;
  }
  if (
    process.env.NOTE_ICON_INTERNAL_LINKS &&
    process.env.NOTE_ICON_INTERNAL_LINKS == "true"
  ) {
    bodyClasses.push("links-note-icon");
    noteIconsSettings.links = true;
  }
  if (
    process.env.NOTE_ICON_INTERNAL_LINKS &&
    process.env.NOTE_ICON_INTERNAL_LINKS == "true"
  ) {
    bodyClasses.push("backlinks-note-icon");
    noteIconsSettings.backlinks = true;
  }
  if (styleSettingsCss) {
    bodyClasses.push("css-settings-manager");
  }
  if (styleSettingsBodyClasses) {
    bodyClasses.push(styleSettingsBodyClasses);
  }

  let timestampSettings = {
    timestampFormat: process.env.TIMESTAMP_FORMAT || "MMM dd, yyyy h:mm a",
    showCreated: process.env.SHOW_CREATED_TIMESTAMP == "true",
    showUpdated: process.env.SHOW_UPDATED_TIMESTAMP == "true",
    createdDateField: process.env.DG_CREATED_DATE || "created",
    updatedDateField: process.env.DG_UPDATED_DATE || "updated",
  };
  const meta = {
    uiStrings: {
      searchButtonText: "Search", searchPlaceholder: "Search notes…", searchNotStarted: "Type to search",
      searchNoResults: "No results for", searchPreviewPlaceholder: "Select a result to preview",
      searchEnterHotkey: "Enter", searchEnterHint: "open", searchNavigateHotkey: "↑ ↓", searchNavigateHint: "navigate",
      searchCloseHotkey: "Esc", searchCloseHint: "close"
    },
    env: process.env.ELEVENTY_ENV,
    theme: process.env.THEME,
    themeStyle,
    bodyClasses: bodyClasses.join(" "),
    noteIconsSettings,
    timestampSettings,
    baseTheme: process.env.BASE_THEME || "light",
    siteName: process.env.SITE_NAME_HEADER || "Digital Garden",
    mainLanguage: process.env.SITE_MAIN_LANGUAGE || "en",
    siteBaseUrl: baseUrl,
    styleSettingsCss,
    buildDate: getBuildDate(),
  };

  return meta;
};
