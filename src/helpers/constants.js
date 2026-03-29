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

/** 左侧边栏宽度键名 */
export const STORAGE_KEY_SIDEBAR_LEFT_WIDTH = 'dg-sidebar-left-width';

/** 右侧边栏宽度键名 */
export const STORAGE_KEY_SIDEBAR_RIGHT_WIDTH = 'dg-sidebar-right-width';

/** 左侧边栏收起状态键名 */
export const STORAGE_KEY_SIDEBAR_LEFT_COLLAPSED = 'dg-sidebar-left-collapsed';

/** 右侧边栏收起状态键名 */
export const STORAGE_KEY_SIDEBAR_RIGHT_COLLAPSED = 'dg-sidebar-right-collapsed';

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

// ========================================
// 侧边栏配置
// ========================================

/** 侧边栏最小宽度（像素） */
export const SIDEBAR_MIN_WIDTH = 180;

/** 侧边栏默认宽度（像素） */
export const SIDEBAR_DEFAULT_WIDTH = 280;

/** 侧边栏收起宽度（像素） */
export const SIDEBAR_COLLAPSE_WIDTH = 48;

export default {
  ALL_NOTE_SETTINGS,
  BREAKPOINT_DESKTOP,
  BREAKPOINT_TABLET,
  BREAKPOINT_MOBILE,
  STORAGE_KEY_NAV_OPEN,
  STORAGE_KEY_FOLDER_STATE,
  STORAGE_KEY_GRAPH_DEPTH,
  STORAGE_KEY_SEARCH_INDEX,
  STORAGE_KEY_SIDEBAR_LEFT_WIDTH,
  STORAGE_KEY_SIDEBAR_RIGHT_WIDTH,
  STORAGE_KEY_SIDEBAR_LEFT_COLLAPSED,
  STORAGE_KEY_SIDEBAR_RIGHT_COLLAPSED,
  GRAPH_DEPTH_MIN,
  GRAPH_DEPTH_MAX,
  GRAPH_DEPTH_DEFAULT,
  TRANSITION_DURATION_FAST,
  TRANSITION_DURATION_BASE,
  TRANSITION_DURATION_SLOW,
  SIDEBAR_MIN_WIDTH,
  SIDEBAR_DEFAULT_WIDTH,
  SIDEBAR_COLLAPSE_WIDTH,
};
