/**
 * @fileoverview 应用常量定义
 * 按 Google JavaScript Style Guide 使用 CONSTANT_CASE
 */

// ========================================
// 笔记设置常量
// ========================================

export const ALL_NOTE_SETTINGS = [
  "dgHomeLink",
  "dgPassFrontmatter",
  "dgShowBacklinks",
  "dgShowLocalGraph",
  "dgShowInlineTitle",
  "dgShowFileTree",
  "dgEnableSearch",
  "dgShowToc",
  "dgLinkPreview",
  "dgShowTags",
  "dgNoteIcon",
  "dgCreatedDate",
  "dgUpdatedDate"
];

// ========================================
// 断点常量
// ========================================

/** 桌面端断点：1400px */
export const BREAKPOINT_DESKTOP = 1400;

/** 平板端断点：1024px */
export const BREAKPOINT_TABLET = 1024;

/** 移动端断点：768px */
export const BREAKPOINT_MOBILE = 768;

// ========================================
// LocalStorage 键名
// ========================================

/** 导航栏开关状态键名 */
export const STORAGE_KEY_NAV_OPEN = 'dg-nav-open';

/** 文件夹展开状态键名前缀 */
export const STORAGE_KEY_FOLDER_STATE = 'dg-folder-';

/** 图谱深度键名 */
export const STORAGE_KEY_GRAPH_DEPTH = 'dg-graph-depth';

/** 搜索索引缓存键名 */
export const STORAGE_KEY_SEARCH_INDEX = 'dg-search-index';

// ========================================
// 图谱配置
// ========================================

/** 最小图谱深度 */
export const GRAPH_DEPTH_MIN = 1;

/** 最大图谱深度 */
export const GRAPH_DEPTH_MAX = 3;

/** 默认图谱深度 */
export const GRAPH_DEPTH_DEFAULT = 1;

// ========================================
// 动画配置
// ========================================

/** 过渡动画时长（毫秒） */
export const TRANSITION_DURATION_FAST = 200;

/** 过渡动画时长（毫秒） */
export const TRANSITION_DURATION_BASE = 300;

/** 过渡动画时长（毫秒） */
export const TRANSITION_DURATION_SLOW = 500;

export default {
  ALL_NOTE_SETTINGS,
  BREAKPOINT_DESKTOP,
  BREAKPOINT_TABLET,
  BREAKPOINT_MOBILE,
  STORAGE_KEY_NAV_OPEN,
  STORAGE_KEY_FOLDER_STATE,
  STORAGE_KEY_GRAPH_DEPTH,
  STORAGE_KEY_SEARCH_INDEX,
  GRAPH_DEPTH_MIN,
  GRAPH_DEPTH_MAX,
  GRAPH_DEPTH_DEFAULT,
  TRANSITION_DURATION_FAST,
  TRANSITION_DURATION_BASE,
  TRANSITION_DURATION_SLOW,
};
