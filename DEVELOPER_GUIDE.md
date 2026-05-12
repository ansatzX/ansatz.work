# Ansatz Digital Garden - 开发者指南

> **版本**: 3.0
> **最后更新**: 2026-04-01
> **代码风格**: Google JavaScript Style Guide
> **架构风格**: ITCSS (Inverted Triangle CSS) + CSS @layer
> **状态**: 生产就绪

---

## 目录

1. [项目概览](#项目概览)
2. [快速开始](#快速开始)
3. [架构设计](#架构设计)
4. [核心模块](#核心模块)
5. [开发工作流](#开发工作流)
6. [扩展指南](#扩展指南)
7. [调试与故障排除](#调试与故障排除)
8. [参考资料](#参考资料)

---

## 项目概览

### 什么是 Ansatz Digital Garden？

Ansatz Digital Garden 是一个基于 **Eleventy v3.1.5** 的静态站点生成器，专门用于构建个人数字花园（Digital Garden）。它提供了完整的笔记管理、双向链接、知识图谱可视化等功能。

### 核心特性

| 特性 | 状态 | 说明 |
|------|------|------|
| 文件树导航 | ✅ | 嵌套文件夹、笔记图标、持久化状态 |
| 双向链接图谱 | ✅ | D3-based 力导向图可视化 |
| 全文搜索 | ✅ | FlexSearch 支持，键盘快捷键 |
| 反向链接 | ✅ | 自动显示引用当前笔记的页面 |
| 目录生成 | ✅ | 自动从标题生成 TOC |
| 悬停预览 | ✅ | 内部链接悬停显示预览 |
| 标签系统 | ✅ | 标签搜索和筛选 |
| 响应式设计 | ✅ | 移动端优化 (768px/1024px/1400px) |
| 主题切换 | ✅ | 浅色/深色主题支持 |
| 用户可扩展 | ✅ | 插槽系统、Hook 系统 |

### 技术栈分层

```
┌─────────────────────────────────────────┐
│   前端交互层 (Alpine.js v3)             │
│   - 状态管理                             │
│   - 组件交互                             │
├─────────────────────────────────────────┤
│   模板层 (Nunjucks)                     │
│   - 布局模板                             │
│   - 组件模板                             │
├─────────────────────────────────────────┤
│   内容层 (markdown-it)                  │
│   - Markdown 渲染                        │
│   - 自定义插件                           │
├─────────────────────────────────────────┤
│   样式层 (SCSS + ITCSS + CSS @layer)   │
│   - 设计令牌                             │
│   - 组件样式                             │
├─────────────────────────────────────────┤
│   构建层 (Eleventy v3.1.5)             │
│   - 数据处理                             │
│   - 模板渲染                             │
└─────────────────────────────────────────┘
```

---

## 快速开始

### 环境要求

- **Node.js**: v18+
- **npm**: v9+

### 安装与运行

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量（可选）
cp .env.example .env

# 3. 开发模式
npm run dev
# 访问: http://localhost:8087

# 4. 生产构建
npm run build
# 输出: dist/
```

### 环境变量配置

所有配置都是可选的，有合理的默认值。

```bash
# 站点配置
SITE_NAME_HEADER=ansatz
SITE_MAIN_LANGUAGE=en
SITE_BASE_URL=https://ansatz.work

# 功能开关
dgShowBacklinks=true
dgShowLocalGraph=true
dgShowFileTree=true
dgEnableSearch=true
dgShowToc=true

# 主题
BASE_THEME=light
```

---

## 架构设计

### 目录结构

```
ansatz.work/
├── eleventy.config.js          # Eleventy 主配置
├── package.json                 # 依赖和脚本
├── src/
│   ├── helpers/                 # ✅ 核心工具模块
│   │   ├── constants.js         # 常量定义（单一数据源）
│   │   ├── utils.js             # Markdown/标题工具
│   │   ├── eleventy-filters.js  # Nunjucks 过滤器
│   │   ├── eleventy-transforms.js # HTML 转换
│   │   ├── linkUtils.js         # 图谱和链接提取
│   │   ├── filetreeUtils.js     # 文件树生成
│   │   ├── getAnchorAttributes.js # 链接解析（带缓存）
│   │   ├── markdown-plugins.js  # Markdown-It 配置
│   │   ├── userSetup.js         # 用户自定义钩子
│   │   ├── userUtils.js         # 用户计算数据钩子
│   │   └── fileSystemUtils.js   # 文件系统操作（带缓存）
│   │
│   └── site/
│       ├── _data/                # ✅ Eleventy 数据级联
│       │   ├── meta.js          # 环境和主题配置
│       │   ├── dynamics.js      # 动态组件/插槽发现
│       │   └── eleventyComputed.js # 图谱、文件树计算
│       │
│       ├── _includes/
│       │   ├── layouts/         # 页面布局
│       │   │   ├── index.njk    # 首页布局
│       │   │   └── note.njk     # 笔记页面布局
│       │   ├── components/      # UI 组件
│       │   ├── scripts/         # 客户端脚本
│       │   └── user/            # 用户扩展插槽
│       │
│       ├── styles/              # ✅ ITCSS 架构
│       │   ├── main.scss        # 主入口（使用 @layer）
│       │   ├── 01-settings/     # Settings - 变量和配置
│       │   ├── 02-tools/        # Tools - Mixins 和 Functions
│       │   ├── 03-generic/      # Generic - 低优先级 Reset
│       │   ├── 04-elements/     # Elements - HTML 元素样式
│       │   ├── 05-objects/      # Objects - 布局抽象
│       │   ├── 06-components/   # Components - UI 组件
│       │   ├── 07-utilities/    # Utilities - 高优先级工具类
│       │   └── user/            # 用户主题覆盖
│       │
│       └── notes/               # 内容目录
│
└── dist/                        # 构建输出
```

### 数据级联顺序

Eleventy 数据按照以下顺序合并（后面覆盖前面）：

```
1. src/site/_data/meta.js
   └─ 环境变量、主题、构建日期

2. src/site/_data/dynamics.js
   └─ 扫描用户组件/插槽

3. src/site/_data/eleventyComputed.js
   ├─ graph: (data) => getGraph(data)
   ├─ filetree: (data) => getFileTree(data)
   └─ userComputed: (data) => userComputed(data)

4. src/site/notes/notes.11tydata.js
   └─ 笔记级:
      ├─ layout: "index.njk" 或 "note.njk"
      ├─ permalink: "/" 或 "/notes/slug/"
      └─ settings: 从 frontmatter 和 env 合并
```

### ITCSS + CSS @layer 架构

样式按特定性从低到高组织：

```scss
@layer tokens { }          /* CSS 变量 (01-settings)  */
@layer generic { }         /* Reset (03-generic)        */
@layer elements { }        /* HTML 元素 (04-elements)    */
@layer objects { }         /* 布局抽象 (05-objects)      */
@layer components { }      /* UI 组件 (06-components)    */
@layer utilities { }       /* 高优先级覆盖 (07-utilities)*/
@layer theme.legacy { }    /* 用户主题（所有中最低）     */
@layer force-override { }  /* 强制覆盖（最高优先级）      */
```

---

## 核心模块

### 1. 常量系统 (constants.js)

**文件**: `src/helpers/constants.js`

所有魔法数字的唯一来源，使用 CONSTANT_CASE。

```javascript
// 断点常量
export const BREAKPOINT_DESKTOP = 1400;
export const BREAKPOINT_TABLET = 1024;
export const BREAKPOINT_MOBILE = 768;

// LocalStorage 键名
export const STORAGE_KEY_NAV_OPEN = 'dg-nav-open';
export const STORAGE_KEY_FOLDER_STATE = 'dg-folder-';
export const STORAGE_KEY_GRAPH_DEPTH = 'dg-graph-depth';

// 侧边栏配置
export const SIDEBAR_MIN_WIDTH = 180;
export const SIDEBAR_DEFAULT_WIDTH = 280;
export const SIDEBAR_COLLAPSE_WIDTH = 48;
```

### 2. 链接解析系统

**文件**: `src/helpers/getAnchorAttributes.js`

带缓存的笔记链接解析系统：

- **缓存**: `frontMatterCache = new Map()`
- **搜索路径**: 按优先级搜索笔记目录
- **错误处理**: `LinkResolutionError` 类

```javascript
// 使用示例
getAnchorAttributes(filePath, linkTitle);
// 返回: { attributes, innerHTML }
```

### 3. 图谱构建系统

**文件**: `src/helpers/linkUtils.js`

并行处理笔记链接，构建知识图谱：

```javascript
// 图谱数据结构
{
  homeAlias: "/",
  nodes: {
    [url]: {
      id: number,
      title: string,
      url: string,
      group: string,           // 父文件夹
      outBound: string[],       // 出站链接
      neighbors: string[],      // 双向邻居
      backLinks: string[],      // 入站链接
      noteIcon: string,
      hide: boolean,
      size: number
    }
  },
  links: [
    { source: nodeId, target: nodeId }
  ]
}
```

### 4. 文件树系统

**文件**: `src/helpers/filetreeUtils.js`

构建嵌套文件树结构，支持排序：

**排序优先级**:
1. 置顶笔记 (`pinned: true`)
2. 文件夹在文件之前
3. 数字前缀排序 (`01-`, `02-`)
4. 字母顺序

### 5. 状态管理

**文件**: `src/site/_includes/scripts/app-state.js`

`StorageManager` 类提供安全的 localStorage 访问：

```javascript
class StorageManager {
  static get(key, defaultValue = null): any
  static set(key, value): void
  static remove(key): void
}

appState: {
  getNavOpen(): boolean
  setNavOpen(isOpen: boolean): void
  getFolderOpen(folderPath: string): boolean
  setFolderOpen(folderPath: string, isOpen: boolean): void
  getGraphDepth(): number
  setGraphDepth(depth: number): void
}
```

---

## 开发工作流

### npm 脚本

```json
{
  // 开发
  "dev": "nodemon --watch src/site/notes --exec \"npm run start\"",
  "start": "npm-run-all build:sass --parallel watch:*",
  "watch:sass": "sass --watch src/site/styles/main.scss:dist/styles/main.css",
  "watch:eleventy": "cross-env ELEVENTY_ENV=dev eleventy --serve",

  // 构建
  "build": "npm-run-all get-theme build:*",
  "build:sass": "sass src/site/styles/main.scss:dist/styles/main.css --style compressed",
  "build:eleventy": "cross-env ELEVENTY_ENV=prod NODE_OPTIONS=--max-old-space-size=4096 eleventy",

  // 测试
  "test": "jest",
  "test:playwright": "playwright test"
}
```

### 开发模式流程

```
npm run dev
  ↓
nodemon 监视 src/site/notes
  ↓ (变更时)
npm run start
  ↓
  ├─ build:sass (一次)
  └─ 并行:
      ├─ watch:sass (sass --watch)
      └─ watch:eleventy (eleventy --serve)
```

### 缓存策略

#### 构建时 (Node.js)

| 缓存 | 位置 | 用途 |
|------|------|------|
| `frontMatterCache` | getAnchorAttributes.js | 记忆化 frontmatter 读取 |
| `fileCache` | fileSystemUtils.js | 记忆化文件内容 |
| `existenceCache` | fileSystemUtils.js | 记忆化文件存在性检查 |
| `imageStatsCache` | eleventy-transforms.js | 记忆化图片处理 |

#### 客户端 (浏览器)

| 存储 | 键名 | 用途 |
|------|------|------|
| localStorage | `dg-nav-open` | 导航切换状态 |
| localStorage | `dg-folder-${path}` | 文件夹展开状态 |
| localStorage | `dg-graph-depth` | 图谱可视化深度 |
| localStorage | `dg-search-index` | 搜索索引缓存 |
| localStorage | `dg-sidebar-left-width` | 左侧边栏宽度 |
| localStorage | `dg-sidebar-right-width` | 右侧边栏宽度 |

---

## 扩展指南

### 1. 添加新的功能开关

1. **`.env`** - 添加默认值
2. **`src/helpers/constants.js`** - 添加到 `ALL_NOTE_SETTINGS` 数组
3. **`src/site/_data/meta.js`** - 从环境变量读取
4. **`src/site/notes/notes.11tydata.js`** - 笔记级设置合并

### 2. 添加自定义组件插槽

在 `src/site/_includes/components/user/{namespace}/{slot}/` 中创建 `.njk` 文件：

```
src/site/_includes/components/user/
├── index/
│   ├── head/
│   ├── header/
│   ├── beforeContent/
│   ├── afterContent/
│   └── footer/
├── notes/
│   ├── head/
│   ├── header/
│   ├── beforeContent/
│   ├── afterContent/
│   └── footer/
├── common/
│   ├── head/
│   ├── header/
│   ├── beforeContent/
│   ├── afterContent/
│   └── footer/
├── filetree/
│   ├── beforeTitle/
│   └── afterTitle/
└── sidebar/
    ├── top/
    └── bottom/
```

### 3. 用户自定义钩子

#### Markdown 插件钩子

**文件**: `src/helpers/userSetup.js`

```javascript
export function userMarkdownSetup(md) {
  // 添加你的自定义 markdown-it 插件
  md.use(myPlugin);
}
```

#### Eleventy 配置钩子

```javascript
export function userEleventySetup(eleventyConfig) {
  // 添加你的自定义配置
  eleventyConfig.addFilter('myFilter', ...);
}
```

#### 计算数据钩子

**文件**: `src/helpers/userUtils.js`

```javascript
export function userComputed(data) {
  return {
    // 添加你的自定义数据
    myCustomData: '...'
  };
}
```

### 4. Frontmatter 选项

笔记级设置（覆盖 .env）：

```yaml
---
title: Note Title
tags: [note, gardenEntry]  # gardenEntry = 首页
permalink: /custom/path/
noteIcon: 📚

# 功能开关
dgHomeLink: false
dgShowBacklinks: false
dgShowLocalGraph: false
dgShowInlineTitle: false
dgShowFileTree: false
dgEnableSearch: false
dgShowToc: false
dgLinkPreview: false
dgShowTags: false

# 显示控制
hide: false          # 从文件树隐藏
hideInGraph: false   # 从图谱可视化隐藏
pinned: false        # 在文件树置顶

# 时间戳
created: 2024-01-01
updated: 2024-01-02
---
```

---

## 调试与故障排除

### 常见问题

#### Q: 样式不生效？

**检查清单**:
1. 确认样式在正确的 ITCSS layer 中
2. 检查选择器特异性是否足够
3. 使用浏览器 DevTools 检查哪个 layer 获胜
4. 必要时使用 `@layer utilities` 或 `!important`（仅 utilities）

#### Q: CSS/JavaScript 布局冲突？

**问题根源**: `resizable-sidebar.js` 会在运行时覆盖 CSS Grid 变量：

```javascript
// resizable-sidebar.js 会设置:
root.style.setProperty('--grid-column-left', '280px');
// 这会覆盖 CSS 中定义的 fr 单位
```

**调试步骤**:
1. 打开 DevTools → Elements → 检查 `<html>` 的 style 属性
2. 如果看到 `--grid-column-left: 280px` 等内联样式，说明 JS 正在覆盖
3. 检查 Application → Local Storage，删除侧边栏相关键

**解决方案**:
- 清除浏览器 LocalStorage 中的侧边栏相关键
- 或者修改 `resizable-sidebar.js`，注释掉 `applyState()` 中设置宽度的代码

#### Q: 左侧栏在小屏幕上消失？

**检查断点**:
- `filetree.njk` 中的 Alpine.js: `x-init="isDesktop = (window.innerWidth>=1400)"`
- `_sidebar.scss` 中的响应式样式: `@include respond-below('lg') { display: none; }`
- `_grid.scss` 中的响应式布局切换

**建议**: 统一使用 `1024px` 作为移动端/桌面端断点。

#### Q: 链接解析找不到笔记？

**检查**:
1. 笔记有正确的 `permalink` frontmatter 吗？
2. 路径相对于 `src/site/notes/` 正确吗？
3. 查看 `getAnchorAttributes.js` 的缓存行为

### 已知问题

| 问题 | 优先级 | 状态 | 说明 |
|------|--------|------|------|
| CSS/JS 布局冲突 | 高 | 已知 | resizable-sidebar.js 覆盖 CSS 变量 |
| 响应式断点不一致 | 中 | 已知 | 1400px vs 1024px |
| 布局文件重复 | 低 | 待优化 | index.njk 和 note.njk 有重复代码 |
| !important 滥用 | 低 | 待优化 | 多个 CSS 文件中使用 !important |

---

## 参考资料

### 关键文件速查表

| 路径 | 职责 |
|------|------|
| `eleventy.config.js` | 构建配置、插件、过滤器、转换 |
| `.env` | 环境变量和功能标志 |
| `src/helpers/constants.js` | 常量的单一数据源 |
| `src/helpers/markdown-plugins.js` | Markdown-It 设置和自定义 |
| `src/helpers/getAnchorAttributes.js` | 带 frontmatter 缓存的链接解析 |
| `src/helpers/linkUtils.js` | 图谱构建和链接提取 |
| `src/helpers/filetreeUtils.js` | 文件树生成和排序 |
| `src/site/_data/meta.js` | 环境 → 模板数据 |
| `src/site/_data/dynamics.js` | 组件/插槽自动发现 |
| `src/site/_data/eleventyComputed.js` | 图谱、文件树计算 |
| `src/site/notes/notes.11tydata.js` | 笔记级布局、permalink、设置 |
| `src/site/_includes/layouts/note.njk` | 笔记页面模板 |
| `src/site/_includes/layouts/index.njk` | 首页模板 |
| `src/site/_includes/components/sidebar.njk` | 右侧边栏（反向链接、目录、图谱） |
| `src/site/_includes/components/filetree.njk` | 左侧导航文件树 |
| `src/site/_includes/scripts/resizable-sidebar.js` | ⚠️ 可拖动侧边栏（会覆盖 CSS 变量） |
| `src/site/_includes/scripts/app-state.js` | StorageManager & appState |
| `src/site/styles/main.scss` | ITCSS layer 编排 |
| `src/site/styles/01-settings/_variables.scss` | 设计令牌（CSS 自定义属性） |

### 外部资源

- [Eleventy 文档](https://www.11ty.dev/docs/)
- [ITCSS 架构](https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture/)
- [CSS @layer 规范](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer)
- [Alpine.js 文档](https://alpinejs.dev/)
- [markdown-it 文档](https://markdown-it.github.io/)

---

## 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| **v3.0** | 2026-04-01 | 重构文档结构，添加架构设计章节，优化快速开始指南 |
| **v2.1** | 2026-03-30 | 添加 CSS/JavaScript 交互问题调试指南 |
| **v2.0** | 2026-03-29 | 初始完整文档版本 |

---

**文档维护者**: Ansatz Team
**最后审查**: 2026-04-01
