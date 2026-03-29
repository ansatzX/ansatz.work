# Ansatz Digital Garden - 开发者指南

> **版本**: 2.0
> **最后更新**: 2026-03-29
> **代码风格**: Google JavaScript Style Guide
> **架构风格**: ITCSS (Inverted Triangle CSS)

---

## 目录

1. [项目概述](#项目概述)
2. [快速开始](#快速开始)
3. [目录结构](#目录结构)
4. [配置系统](#配置系统)
5. [Helper API 文档](#helper-api-文档)
6. [模板与布局系统](#模板与布局系统)
7. [组件系统](#组件系统)
8. [数据流程](#数据流程)
9. [样式架构 (ITCSS)](#样式架构-itcss)
10. [JavaScript 架构](#javascript-架构)
11. [构建与开发工作流](#构建与开发工作流)
12. [扩展点与自定义](#扩展点与自定义)
13. [常见问题](#常见问题)

---

## 项目概述

### 什么是 Ansatz Digital Garden？

Ansatz Digital Garden 是一个基于 **Eleventy (11ty)** 的静态站点生成器，专门用于构建个人数字花园（Digital Garden）。

### 核心特性

- ✅ **文件树导航**：支持嵌套文件夹、笔记图标、持久化状态
- ✅ **双向链接图谱**：可视化笔记之间的关系
- ✅ **全文搜索**：FlexSearch 支持，支持键盘快捷键
- ✅ **反向链接**：自动显示哪些笔记引用了当前笔记
- ✅ **目录生成**：自动从标题生成目录
- ✅ **悬停预览**：内部链接悬停显示预览
- ✅ **标签系统**：支持标签搜索和筛选
- ✅ **响应式设计**：移动端优化
- ✅ **主题切换**：浅色/深色主题支持
- ✅ **用户可扩展**：插槽系统、Hook 系统

### 技术栈

| 层级 | 技术 |
|------|------|
| 静态生成 | Eleventy v3.1.5 (ESM) |
| 模板引擎 | Nunjucks (.njk) |
| Markdown | markdown-it (自定义配置) |
| 样式 | SCSS + ITCSS 架构 + CSS @layer |
| 交互 | Alpine.js v3 |
| 图标 | Lucide Icons |
| 图谱 | Force graph (D3-based) |
| 搜索 | FlexSearch |
| 数学公式 | MathJax v3 |

---

## 快速开始

### 环境要求

- Node.js v18+
- npm v9+

### 安装依赖

```bash
npm install
```

### 配置环境变量

复制 `.env.example` 到 `.env`（如果不存在）：

```bash
# .env - 所有配置都是可选的
SITE_NAME_HEADER=ansatz
SITE_MAIN_LANGUAGE=en
SITE_BASE_URL=https://ansatz.work

# 功能开关
dgShowBacklinks=true
dgShowLocalGraph=true
dgShowFileTree=true
dgEnableSearch=true
dgShowToc=true
```

### 开发模式

```bash
npm run dev
# 访问: http://localhost:8087
```

### 生产构建

```bash
npm run build
# 输出: dist/
```

---

## 目录结构

```
ansatz.work/
├── src/
│   ├── helpers/                    # Eleventy 工具和过滤器
│   │   ├── constants.js             # ✅ 常量定义（单一数据源）
│   │   ├── utils.js                 # Markdown/标题工具
│   │   ├── eleventy-filters.js      # Nunjucks 模板过滤器
│   │   ├── eleventy-transforms.js   # HTML 转换
│   │   ├── linkUtils.js             # 图谱和链接提取
│   │   ├── filetreeUtils.js         # 文件树生成
│   │   ├── getAnchorAttributes.js   # 链接解析（带缓存）
│   │   ├── markdown-plugins.js      # Markdown-It 配置
│   │   ├── userSetup.js             # 用户自定义钩子
│   │   ├── userUtils.js             # 用户计算数据钩子
│   │   ├── fileSystemUtils.js       # 文件系统操作（带缓存）
│   │   ├── tikz-plugin.js           # (已禁用) TikZ 支持
│   │   └── __tests__/               # Jest 单元测试
│   │
│   └── site/
│       ├── _data/                    # Eleventy 数据级联
│       │   ├── meta.js              # 环境和主题配置
│       │   ├── dynamics.js          # 动态组件/插槽发现
│       │   └── eleventyComputed.js  # 图谱、文件树计算
│       │
│       ├── _includes/
│       │   ├── layouts/
│       │   │   ├── index.njk        # 首页布局
│       │   │   └── note.njk         # 笔记页面布局
│       │   │
│       │   ├── components/
│       │   │   ├── sidebar.njk       # 右侧边栏（反向链接、目录、图谱）
│       │   │   ├── filetree.njk      # 文件树导航
│       │   │   ├── navbar.njk        # 简单导航
│       │   │   ├── pageheader.njk    # HTML head 元数据
│       │   │   ├── searchContainer.njk
│       │   │   ├── searchButton.njk
│       │   │   ├── searchScript.njk
│       │   │   ├── graphScript.njk
│       │   │   ├── calloutScript.njk
│       │   │   ├── linkPreview.njk
│       │   │   ├── lucideIcons.njk
│       │   │   └── user/             # 用户扩展插槽
│       │   │       ├── index/
│       │   │       ├── notes/
│       │   │       ├── common/
│       │   │       ├── filetree/
│       │   │       └── sidebar/
│       │   │
│       │   └── scripts/
│       │       └── app-state.js       # ✅ StorageManager & appState
│       │
│       ├── notes/                    # 内容目录
│       │   ├── notes.11tydata.js    # 笔记级数据和设置
│       │   ├── notes.json            # 标签模板默认值
│       │   ├── blogs/
│       │   ├── slides/
│       │   └── README.md
│       │
│       ├── styles/                   # ✅ ITCSS 架构
│       │   ├── main.scss             # 主入口（使用 @layer）
│       │   ├── 01-settings/          # Settings - 变量和配置
│       │   │   ├── _variables.scss   # 设计令牌
│       │   │   ├── _aliases.scss     # 向后兼容别名
│       │   │   ├── _breakpoints.scss # 响应式断点
│       │   │   └── _themes.scss      # 深色/浅色主题
│       │   ├── 02-tools/             # Tools - Mixins 和 Functions
│       │   ├── 03-generic/           # Generic - 低优先级 Reset
│       │   ├── 04-elements/          # Elements - HTML 元素样式
│       │   ├── 05-objects/           # Objects - 布局抽象
│       │   ├── 06-components/        # Components - UI 组件
│       │   ├── 07-utilities/         # Utilities - 高优先级工具类
│       │   └── user/                 # 用户主题覆盖
│       │
│       ├── img/                      # 图片（直接复制）
│       └── *.njk                     # 页面模板
│
├── eleventy.config.js                # Eleventy 配置
├── package.json                       # 依赖和脚本
├── .env                              # 环境变量
└── dist/                             # 构建输出
```

---

## 配置系统

### 1. 环境变量 (.env)

所有配置都是可选的，有合理的默认值。

#### 站点标识

| 变量 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `SITE_NAME_HEADER` | string | `ansatz` | 站点标题 |
| `SITE_MAIN_LANGUAGE` | string | `en` | HTML lang 属性 |
| `SITE_BASE_URL` | string | - | 规范 URL（用于 Sitemap） |

#### 时间戳

| 变量 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `SHOW_CREATED_TIMESTAMP` | boolean | `false` | 显示创建日期 |
| `SHOW_UPDATED_TIMESTAMP` | boolean | `false` | 显示更新日期 |
| `TIMESTAMP_FORMAT` | string | `MMM dd, yyyy h:mm a` | 日期格式 |

#### 笔记图标

| 变量 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `NOTE_ICON_DEFAULT` | string | - | 默认图标 emoji |
| `NOTE_ICON_TITLE` | boolean | `false` | 在标题中显示图标 |
| `NOTE_ICON_FILETREE` | boolean | `false` | 在文件树中显示图标 |
| `NOTE_ICON_INTERNAL_LINKS` | boolean | `false` | 在内部链接中显示图标 |
| `NOTE_ICON_BACK_LINKS` | boolean | `false` | 在反向链接中显示图标 |

#### 样式

| 变量 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `STYLE_SETTINGS_CSS` | string | - | 额外 CSS body class 标志 |
| `STYLE_SETTINGS_BODY_CLASSES` | string | - | 额外 body classes |
| `BASE_THEME` | string | `light` | `light` 或 `dark` |

#### 功能开关

所有功能开关都是 `boolean` 类型，默认为 `true`：

| 变量 | 说明 |
|------|------|
| `dgHomeLink` | 显示首页链接 |
| `dgPassFrontmatter` | 传递 frontmatter |
| `dgShowBacklinks` | 显示反向链接区域 |
| `dgShowLocalGraph` | 显示本地图谱 |
| `dgShowInlineTitle` | 在笔记中显示标题 |
| `dgShowFileTree` | 显示文件树导航 |
| `dgEnableSearch` | 启用搜索功能 |
| `dgShowToc` | 显示目录 |
| `dgLinkPreview` | 启用链接预览 |
| `dgShowTags` | 显示标签 |

#### 构建

| 变量 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `USE_FULL_RESOLUTION_IMAGES` | boolean | `false` | 跳过图片优化 |

### 2. Eleventy 配置 (eleventy.config.js)

**关键配置项：**

```javascript
// 输入/输出
input: "src/site"
output: "dist"

// 数据目录
data: "_data"

// 模板格式
templateFormats: ["njk", "md", "11ty.js"]
htmlTemplateEngine: "njk"
markdownTemplateEngine: false  // 使用自定义 markdown-it

// 插件
- eleventy-plugin-gen-favicons    // 生成 favicons
- eleventy-plugin-nesting-toc     // 从标题生成目录
- @11ty/eleventy-plugin-rss       // RSS feed

// 直接复制的文件
src/site/img → /img
src/site/scripts → /scripts
src/site/styles/_theme.*.css → /styles
dist/img/tikz → /img/tikz
```

---

## Helper API 文档

### 1. constants.js

**文件**: `src/helpers/constants.js`

**用途**: 单一数据源，所有魔法数字的唯一来源。

#### 笔记设置常量

```javascript
import { ALL_NOTE_SETTINGS } from './constants.js';

ALL_NOTE_SETTINGS = [
  "dgHomeLink", "dgPassFrontmatter", "dgShowBacklinks",
  "dgShowLocalGraph", "dgShowInlineTitle", "dgShowFileTree",
  "dgEnableSearch", "dgShowToc", "dgLinkPreview", "dgShowTags",
  "dgNoteIcon", "dgCreatedDate", "dgUpdatedDate"
];
```

#### 断点常量

```javascript
import {
  BREAKPOINT_DESKTOP,   // 1400
  BREAKPOINT_TABLET,    // 1024
  BREAKPOINT_MOBILE     // 768
} from './constants.js';

// 使用示例
if (window.innerWidth >= BREAKPOINT_DESKTOP) {
  // 桌面端逻辑
}
```

#### LocalStorage 键名

```javascript
import {
  STORAGE_KEY_NAV_OPEN,       // 'dg-nav-open'
  STORAGE_KEY_FOLDER_STATE,    // 'dg-folder-'
  STORAGE_KEY_GRAPH_DEPTH,     // 'dg-graph-depth'
  STORAGE_KEY_SEARCH_INDEX     // 'dg-search-index'
} from './constants.js';

// 使用示例
localStorage.setItem(STORAGE_KEY_NAV_OPEN, 'true');
```

#### 图谱配置

```javascript
import {
  GRAPH_DEPTH_MIN,     // 1
  GRAPH_DEPTH_MAX,     // 3
  GRAPH_DEPTH_DEFAULT  // 1
} from './constants.js';
```

#### 动画配置

```javascript
import {
  TRANSITION_DURATION_FAST,   // 200
  TRANSITION_DURATION_BASE,   // 300
  TRANSITION_DURATION_SLOW    // 500
} from './constants.js';
```

### 2. utils.js

**文件**: `src/helpers/utils.js`

#### headerToId(heading: string): string

将标题文本转换为 slug 格式的锚点 ID。

```javascript
import { headerToId } from './utils.js';

headerToId('Hello World!');  // 'hello-world'
headerToId('2.1 引言');      // '21-引言'
```

使用 `@sindresorhus/slugify` 库。

#### namedHeadingsFilter(md: MarkdownIt): void

Markdown-it 插件，为所有标题添加唯一 ID。

```javascript
import { namedHeadingsFilter } from './utils.js';

const md = require('markdown-it')();
namedHeadingsFilter(md);
```

处理重复标题的冲突：`heading` → `heading-1` → `heading-2`

### 3. eleventy-filters.js

**文件**: `src/helpers/eleventy-filters.js`

#### isoDate(date: Date): string

将日期格式化为 ISO 字符串。

```njk
{{ date | isoDate }}
```

#### link(str: string): string

将 Wiki 链接 `[[Link|Title]]` 转换为 HTML 锚点标签。

```njk
{{ content | link }}
```

输入：`[[Introduction|介绍]]`

输出：`<a href="/introduction/" data-note-icon="...">介绍</a>`

#### taggify(str: string): string

将 `#tags` 转换为可交互的标签链接。

```njk
{{ content | taggify }}
```

输入：`#physics #quantum`

输出：`<a class="tag" onclick="toggleTagSearch(this)">#physics</a>`

#### searchableTags(str: string): string

将标签提取为带引号的逗号分隔字符串（用于搜索索引）。

#### hideDataview(str: string): string

移除 Dataview 语法：`(key:: value)` → `value`

```njk
{{ content | hideDataview }}
```

#### dateToZulu(date: Date|string): string

将日期格式化为带时区的 ISO 字符串。

#### jsonify(variable: any): string

安全的 JSON 字符串化（处理循环引用）。

#### validJson(variable: string|string[]): string

转义反斜杠以用于 JSON。

### 4. eleventy-transforms.js

**文件**: `src/helpers/eleventy-transforms.js`

**转换顺序**:
1. `dataview-js-links` - 转换 data-href 链接
2. `callout-block` - 转换 blockquote 为 callout
3. `picture` - 图片优化（异步）
4. `table` - 为表格添加包装器
5. `htmlMinifier` - 压缩 HTML（仅生产环境）

#### 图片优化配置

```javascript
IMAGE_OPTIONS = {
  widths: [500, 700],
  formats: ["webp", "jpeg"],
  outputDir: "./dist/img/optimized",
  urlPath: "/img/optimized"
};
```

**缓存**: `imageStatsCache` (Map) 防止重复处理。

#### Callout 格式

```markdown
> [!type|metadata]+ Title
> Content
```

- `type`: `info`, `warning`, `note` 等
- `metadata`: 可选 CSS 类
- `+`: 可折叠，默认展开
- `-`: 可折叠，默认收起

### 5. linkUtils.js

**文件**: `src/helpers/linkUtils.js`

#### 正则表达式

```javascript
wikiLinkRegex = /\[\[(.*?\|.*?)\]\]/g      // [[Link|Title]]
internalLinkRegex = /href="\/(.*?)"/g      // href="/note"
```

#### extractLinks(content: string): string[]

从 HTML 中提取 `[[links]]` 和 `/links`。

- 移除 `.md` 扩展名
- 移除 `#anchor` 锚点
- 修剪空白字符

```javascript
import { extractLinks } from './linkUtils.js';

extractLinks('<a href="/note.md#section">Note</a>');
// 返回: ['note']
```

#### getGraph(data: EleventyData): Promise&lt;Graph&gt;

从笔记集合构建节点和链接。

- 使用 `Promise.all()` 并行处理
- 返回图谱数据结构

```javascript
import { getGraph } from './linkUtils.js';

const graph = await getGraph(data);
// graph: { homeAlias, nodes, links }
```

**图谱数据结构**:

```javascript
{
  homeAlias: "/",                    // 首页 URL
  nodes: {
    [url]: {
      id: number,                    // 唯一 ID
      title: string,                 // 笔记标题
      url: string,                   // 笔记 URL
      group: string,                 // 父文件夹（深度 >= 3）
      home: boolean,                 // 是否为首页
      outBound: string[],            // 出站链接
      neighbors: string[],           // 双向邻居 URL
      backLinks: string[],           // 入站链接 URL
      noteIcon: string,              // 笔记图标
      hide: boolean,                 // 是否隐藏
      size: number                   // 邻居数量
    }
  },
  links: [
    { source: nodeId, target: nodeId }
  ]
}
```

### 6. filetreeUtils.js

**文件**: `src/helpers/filetreeUtils.js`

#### getFileTree(data: EleventyData): FileTree

从笔记构建嵌套树结构。

**排序顺序**:
1. 置顶笔记 (`pinned: true`)
2. 文件夹在文件之前
3. 数字前缀排序 (`01-`, `02-`)
4. 字母顺序

```javascript
import { getFileTree } from './filetreeUtils.js';

const filetree = getFileTree(data);
```

#### sortTree(unsorted: Object): Object

递归排序树节点。

#### getPermalinkMeta(note, key): [Meta, PathParts]

从 frontmatter 或 filePathStem 提取：
- `permalink`
- `name`
- `noteIcon`
- `hide`
- `pinned`

返回路径部分用于嵌套。

#### assignNested(obj, keyPath, value): void

改变对象以在 keyPath 设置值，按需创建中间文件夹。

**文件树数据结构**:

```javascript
{
  [folderName]: {
    isFolder: true,
    [subFolderName]: { ... },
    [noteName.md]: {
      isNote: true,
      permalink: string,
      name: string,
      noteIcon: string,
      hide: boolean,
      pinned: boolean
    }
  }
}
```

### 7. getAnchorAttributes.js

**文件**: `src/helpers/getAnchorAttributes.js`

#### 错误类

```javascript
class LinkResolutionError extends Error {
  filePath: string;
  cause: Error;
}
```

#### 缓存

```javascript
frontMatterCache = new Map()  // fullPath → {data, exists}
```

#### 搜索路径（优先级）

```javascript
NOTES_DIRS = [
  "./src/helpers/__tests__/fixtures/notes/",
  "./src/site/notes/"
]
```

#### getCachedFrontMatter(fullPath): {data, exists}

带记忆化读取，返回 `{data: frontmatter, exists: boolean}`

#### getAnchorAttributes(filePath, linkTitle): {attributes, innerHTML}

解析笔记链接，检查 frontmatter 的 permalink。

处理 `#anchor-links`。

**返回**:
```javascript
{
  attributes: {
    class: string,
    target: string,
    'data-note-icon': string,
    href: string
  },
  innerHTML: string  // 链接文本
}
```

#### getAnchorLink(filePath, linkTitle): string

包装 getAnchorAttributes，返回完整的 `<a>` HTML。

### 8. markdown-plugins.js

**文件**: `src/helpers/markdown-plugins.js`

#### tagRegex

```javascript
/(^|\s|>)(#[^\s!@#$%^&*()=+\.,\[{\]};:'"?><]+)(?![^<]*>)/g
```

#### createMarkdownIt(): MarkdownIt

配置并返回 markdown-it 实例，包含：

**标准插件**:
- `markdown-it-anchor` - 标题锚点
- `markdown-it-mark` - `==highlight==`
- `markdown-it-footnote` - 脚注
- `markdown-it-mathjax3` - TeX: `$...$`, `$$...$$`
- `markdown-it-attrs` - 内联属性
- `markdown-it-task-checkbox` - 任务列表
- `markdown-it-plantuml` - PlantUML

**自定义插件**:
- `namedHeadingsFilter` - 唯一标题 ID
- `userMarkdownSetup` - 用户自定义钩子

**自定义 Fence 渲染器**:
- `mermaid` → `<pre class="mermaid">`
- `transclusion` → `<div class="transclusion">`
- `ad-*` → `<div class="callout" data-callout="*">`

**自定义图片渲染器**:
- `image.png|meta|width` - 解析宽度

**自定义链接渲染器**:
- 外部链接添加 `target="_blank"`

### 9. userSetup.js

**文件**: `src/helpers/userSetup.js`

#### userMarkdownSetup(md: MarkdownIt): void

**钩子**: 添加自定义 markdown-it 插件。

在标准插件之后调用。

```javascript
export function userMarkdownSetup(md) {
  // 添加你的自定义插件
  md.use(myPlugin);
}
```

#### userEleventySetup(eleventyConfig): void

**钩子**: 添加自定义过滤器、转换、插件。

在返回配置之前调用。

```javascript
export function userEleventySetup(eleventyConfig) {
  // 添加你的自定义配置
  eleventyConfig.addFilter('myFilter', ...);
}
```

### 10. userUtils.js

**文件**: `src/helpers/userUtils.js`

#### userComputed(data: EleventyData): Object

**钩子**: 添加自定义计算属性。

返回值合并到模板上下文中。

```javascript
export function userComputed(data) {
  return {
    // 添加你的自定义数据
    myCustomData: '...'
  };
}
```

默认返回 `{}`。

### 11. fileSystemUtils.js

**文件**: `src/helpers/fileSystemUtils.js`

#### 缓存

```javascript
fileCache = new Map()       // path → content (utf8)
existenceCache = new Map()  // path → boolean
```

#### memoizedReadFile(fullPath): string|null

返回内容或 `null`（如果 ENOENT）。

其他错误抛出。

#### exists(fullPath): boolean

带缓存检查文件存在性。

---

## 模板与布局系统

### 1. 布局选择 (notes.11tydata.js)

**文件**: `src/site/notes/notes.11tydata.js`

```javascript
eleventyComputed: {
  layout: (data) => {
    if (data.tags.includes("gardenEntry"))
      return "layouts/index.njk"  // 首页
    return "layouts/note.njk"       // 其他所有页面
  },

  permalink: (data) => {
    if (data.tags.includes("gardenEntry"))
      return "/"
    return data.permalink || "notes/{{page.fileSlug|slugify}}/"
  },

  settings: (data) => {
    // 合并笔记级 frontmatter 和环境变量
    // 笔记设置优先，然后环境=true（除非笔记=false）
  }
}
```

### 2. note.njk 布局结构

**文件**: `src/site/_includes/layouts/note.njk`

```html
<!DOCTYPE html>
<html lang="{{ meta.mainLanguage }}">
<head>
  <title>{{ title or page.fileSlug }}</title>
  {% include "components/pageheader.njk" %}
  <!-- dynamics.common.head + dynamics.notes.head 插槽 -->
</head>

<body class="theme-{{meta.baseTheme}} {{meta.bodyClasses}}">
  {% include "components/notegrowthhistory.njk" %}

  <div x-data="{ navOpen: true }" class="app-layout">
    <!-- 导航切换按钮 -->
    <button class="nav-toggle-button" @click="navOpen = !navOpen">

    <!-- 左侧边栏 -->
    <aside class="sidebar sidebar-left">
      {% if not settings.dgShowFileTree %}
        {% include "components/navbar.njk" %}
      {% else %}
        {% include "components/filetree.njk" %}
      {% endif %}
    </aside>

    <!-- 主内容区 -->
    <main class="content-main cm-s-obsidian markdown-rendered">
      {% if settings.dgEnableSearch %}
        {% include "components/searchContainer.njk" %}
      {% endif %}

      <header>
        {% if settings.dgShowInlineTitle %}
          <h1 data-note-icon="...">{{ title }}</h1>
        {% endif %}

        <div class="header-meta">
          {% if settings.dgShowTags and tags %}
            <div class="header-tags">...</div>
          {% endif %}
          {% if timestamp settings %}
            <div class="timestamps">
              <!-- 创建/更新日期 -->
            </div>
          {% endif %}
        </div>
      </header>

      <!-- dynamics.common.beforeContent + dynamics.notes.beforeContent -->

      {{ content | hideDataview | taggify | link | safe }}

      <!-- dynamics.common.afterContent + dynamics.notes.afterContent -->

      {% if settings.dgLinkPreview %}
        {% include "components/linkPreview.njk" %}
      {% endif %}

      <!-- dynamics.notes.footer -->
    </main>

    <!-- 右侧边栏（条件渲染） -->
    {% if settings.dgShowBacklinks or
          settings.dgShowLocalGraph or
          settings.dgShowToc %}
      <aside class="sidebar-right">
        {% include "components/sidebar.njk" %}
      </aside>
    {% endif %}
  </div>

  {% include "components/references.njk" %}
  {% include "components/timestamps.njk" %}
  <!-- dynamics.common.footer -->
  {% include "components/lucideIcons.njk" %}
</body>
</html>
```

### 3. index.njk 布局（首页）

与 note.njk 类似，但：
- 使用 `dynamics.index.*` 插槽而非 `dynamics.notes.*`
- main 上没有 `cm-s-obsidian markdown-rendered` 类
- header 中没有时间戳

### 4. 组件插槽系统 (dynamics.js)

**在构建时通过扫描 `_includes/components/user/` 发现**:

```javascript
dynamics: {
  index: {
    head: [...njk paths],
    header: [...],
    beforeContent: [...],
    afterContent: [...],
    footer: [...]
  },
  notes: {
    head: [...],
    header: [...],
    beforeContent: [...],
    afterContent: [...],
    footer: [...]
  },
  common: {
    head: [...],
    header: [...],
    beforeContent: [...],
    afterContent: [...],
    footer: [...]
  },
  filetree: {
    beforeTitle: [...],
    afterTitle: [...]
  },
  sidebar: {
    top: [...],
    bottom: [...]
  },
  styles: ["/styles/user/*.css"]
}
```

---

## 组件系统

### 1. sidebar.njk（右侧边栏）

**文件**: `src/site/_includes/components/sidebar.njk`

```
┌─────────────────────────┐
│ dynamics.sidebar.top    │ (插槽)
├─────────────────────────┤
│ Local Graph             │ (如果 dgShowLocalGraph)
│  └─ graphScript.njk     │
├─────────────────────────┤
│ Table of Contents       │ (如果 dgShowToc)
│  └─ (content|toc)       │
├─────────────────────────┤
│ Backlinks               │ (如果 dgShowBacklinks)
│  └─ backlink-card[]     │
├─────────────────────────┤
│ dynamics.sidebar.bottom │ (插槽)
└─────────────────────────┘
```

### 2. filetree.njk（左侧边栏）

**文件**: `src/site/_includes/components/filetree.njk`

**功能**:
- 响应式（1400px 断点切换桌面/移动端）
- 移动端：全屏覆盖 + hamburger
- 桌面端：持久化侧边栏
- 递归文件夹渲染 + Alpine.js 持久化
- 头像 + 站点名称 header
- 搜索按钮（如果 dgEnableSearch）

**递归菜单宏**:

```
menuItem(fileOrFolderName, fileOrFolder, step, currentPath):
  if isNote and not hide:
    渲染 .notelink 和 permalink
  elif isFolder:
    渲染 .folder 和 chevron
    x-data="{isOpen: $persist(false).as(currentPath)}"
    打开时递归渲染子项
```

### 3. 关键组件列表

| 组件 | 用途 |
|------|------|
| pageheader.njk | HTML `<head>` 元数据、样式、脚本 |
| navbar.njk | filetree 的简单替代方案 |
| filetreeNavbar.njk | 移动端 filetree header |
| searchContainer.njk | 搜索 UI 容器 |
| searchButton.njk | 搜索触发按钮 |
| searchScript.njk | 搜索功能 |
| graphScript.njk | 图谱可视化 |
| calloutScript.njk | Callout 交互 |
| linkPreview.njk | 内部链接悬停预览 |
| references.njk | (存根) |
| timestamps.njk | (存根) |
| notegrowthhistory.njk | (存根) |
| lucideIcons.njk | 图标加载器（替换 `data-lucide`） |

---

## 数据流程

### 1. 数据级联顺序

```
1. src/site/_data/meta.js
   └─ 环境变量、主题、构建日期
   └─ 返回: meta 对象

2. src/site/_data/dynamics.js
   └─ 扫描用户组件/插槽
   └─ 返回: dynamics 对象

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

### 2. 图谱数据结构

参见: [linkUtils.js getGraph](#getgraphdata-eleventydata-promisegraph)

### 3. 文件树数据结构

参见: [filetreeUtils.js getFileTree](#getfiletreedata-eleventydata-filetree)

---

## 样式架构 (ITCSS)

### 1. Layer 顺序（特异性从低到高）

```scss
@layer tokens { }          /* CSS 变量 (01-settings) */
@layer generic { }         /* Reset (03-generic) */
@layer elements { }        /* HTML 元素 (04-elements) */
@layer objects { }         /* 布局抽象 (05-objects) */
@layer components { }      /* UI 组件 (06-components) */
@layer utilities { }       /* 高优先级覆盖 (07-utilities) */
@layer theme.legacy { }    /* 用户主题（所有中最低） */
```

### 2. 设计令牌 (01-settings/_variables.scss)

#### 颜色系统

```css
--color-bg-primary: #ffffff
--color-bg-secondary: #f8f8f8
--color-bg-surface: rgba(245, 245, 245, 0.8)
--color-text-primary: #1a1a1a
--color-text-secondary: #666666
--color-text-muted: #999999
--color-accent: #0066cc
--color-accent-hover: #0052a3
--color-accent-light: rgba(0, 102, 204, 0.1)
--color-border: rgba(0, 0, 0, 0.08)
```

#### 布局

```css
--content-max-width: 960px
--sidebar-width: 280px
--page-padding: 2rem
--gap: 1.5rem
--grid-column-left: 0.8fr
--grid-column-main: 3.5fr
--grid-column-right: 0.8fr
```

#### 排版

```css
--font-family-base: "SF Pro Display", -apple-system, ...
--font-family-mono: "SF Mono", Monaco, ...
--font-size-xs: 0.75rem (12px) 到 --font-size-4xl: 2.5rem (40px)
--line-height-tight: 1.3 到 --line-height-relaxed: 1.8
--font-weight-normal: 400 到 --font-weight-bold: 700
```

#### 间距

```css
--spacing-xs: 0.25rem (4px) 到 --spacing-2xl: 3rem (48px)
```

#### 边框圆角

```css
--radius-sm: 4px 到 --radius-full: 9999px
```

#### 阴影

```css
--shadow-sm: 0 1px 2px rgba(...) 到 --shadow-xl: 0 20px 25px rgba(...)
--shadow-glass: 0 20px 40px rgba(...), inset ...
```

#### 过渡

```css
--transition-fast: 150ms ease
--transition-base: 250ms ease
--transition-slow: 350ms ease
```

#### Z-Index

```css
--z-dropdown: 100
--z-sticky: 200
--z-modal: 300
--z-tooltip: 400
```

#### 深色主题覆盖

```scss
[data-theme="dark"] {
  --color-bg-primary: #0a0a0a
  --color-text-primary: #f5f5f5
  /* 等等... */
}
```

### 3. ITCSS Layer 内容

| Layer | 文件 | 用途 |
|-------|------|------|
| 01-settings | _variables.scss, _aliases.scss, _breakpoints.scss, _themes.scss | CSS 自定义属性，无选择器 |
| 02-tools | _mixins.scss, _functions.scss | 可重用 SCSS 逻辑，无输出 |
| 03-generic | _reset.scss | 低优先级 Reset |
| 04-elements | _typography.scss | 纯 HTML 元素 |
| 05-objects | _grid.scss, _wrapper.scss, _container.scss | 布局抽象 (OOCSS) |
| 06-components | _sidebar.scss, _filetree.scss, _search.scss, _graph.scss, _backlinks.scss, _callouts.scss, _buttons.scss, _cards.scss, _code.scss, _memos.scss, _collapsible-nav.scss | 完整 UI 组件 |
| 07-utilities | _display.scss, _spacing.scss, _helpers.scss | 高优先级覆盖，!important 可以 |
| theme.legacy | user/minimalist-theme.scss | 用户覆盖 |

---

## JavaScript 架构

### 1. 状态管理 (app-state.js)

**文件**: `src/site/_includes/scripts/app-state.js`

#### StorageManager 类

```javascript
class StorageManager {
  static get(key, defaultValue = null): any
    // 安全地从 localStorage 读取
    // 自动 JSON.parse，错误处理

  static set(key, value): void
    // 安全地写入 localStorage
    // 自动 JSON.stringify，错误处理

  static remove(key): void
    // 安全地从 localStorage 删除
}
```

#### appState 对象

```javascript
appState: {
  // 导航状态
  getNavOpen(): boolean
  setNavOpen(isOpen: boolean): void
  toggleNavOpen(): boolean

  // 文件夹状态
  getFolderOpen(folderPath: string): boolean
  setFolderOpen(folderPath: string, isOpen: boolean): void

  // 图谱深度
  getGraphDepth(): number
  setGraphDepth(depth: number): void

  // 搜索索引缓存
  getSearchIndex(): any
  setSearchIndex(index: any): void
}
```

### 2. 缓存策略

#### 构建时 (Node)

- `frontMatterCache` (getAnchorAttributes.js) - 记忆化 frontmatter 读取
- `fileCache` (fileSystemUtils.js) - 记忆化文件内容
- `existenceCache` (fileSystemUtils.js) - 记忆化文件存在性检查
- `imageStatsCache` (eleventy-transforms.js) - 记忆化图片处理

#### 客户端 (浏览器)

- `StorageManager` 包装带 JSON 安全的 localStorage
- Alpine.js `$persist()` 用于文件夹打开状态（按文件夹路径）
- LocalStorage 键（来自 constants.js）:
  - `dg-nav-open` - 导航切换状态
  - `dg-folder-${path}` - 文件夹状态
  - `dg-graph-depth` - 图谱可视化深度
  - `dg-search-index` - 搜索索引缓存

### 3. 构建时数据处理

#### 图谱并行处理

```javascript
// Eleventy v3 异步模板读取
await Promise.all(notes.map(async (note) => {
  const templateContent = await v.template.read(v.inputPath)
  // 提取链接，构建节点
}))
```

### 4. 代码风格指南

- **文件命名**: kebab-case (filetree-utils.js，不是 fileTreeUtils.js)
- **常量**: CONSTANT_CASE (全大写，下划线分隔)
- **变量/方法**: lowerCamelCase
- **类**: UpperCamelCase (PascalCase)
- **注释**: 带类型注解的 JSDoc
- **引号**: 字符串用双引号，属性用单引号

---

## 构建与开发工作流

### 1. npm 脚本

```json
{
  "start": "npm-run-all build:sass --parallel watch:*",
  "watch:sass": "sass --watch src/site/styles/main.scss:dist/styles/main.css",
  "watch:eleventy": "cross-env ELEVENTY_ENV=dev eleventy --serve",

  "build": "npm-run-all get-theme build:*",
  "get-theme": "node src/site/get-theme.js",
  "build:sass": "sass src/site/styles/main.scss:dist/styles/main.css --style compressed",
  "build:eleventy": "cross-env ELEVENTY_ENV=prod NODE_OPTIONS=--max-old-space-size=4096 eleventy",

  "dev": "nodemon --watch src/site/notes --exec \"npm run start\"",
  "serve": "concurrently \"npm run dev\" \"node app.js\"",

  "test": "jest",
  "test:watch": "jest --watch",
  "test:playwright": "playwright test",
  "test:sitemap": "playwright test tests/sitemap.spec.js",
  "validate:sitemap": "node scripts/validate-sitemap.js"
}
```

### 2. 开发模式

```bash
npm run dev
  → nodemon 监视 src/site/notes
  → 变更时: npm run start
    → build:sass (一次)
    → 并行:
      • watch:sass (sass --watch)
      • watch:eleventy (eleventy --serve)
```

### 3. 生产构建

```bash
npm run build
  → get-theme (node src/site/get-theme.js)
  → build:sass (压缩)
  → build:eleventy (ELEVENTY_ENV=prod)
    → htmlMinifier 转换激活
```

---

## 扩展点与自定义

### 1. 用户自定义钩子

| 文件 | 导出 | 用途 |
|------|--------|------|
| `src/helpers/userSetup.js` | `userMarkdownSetup(md)` | 添加 markdown-it 插件 |
| `src/helpers/userSetup.js` | `userEleventySetup(config)` | 添加过滤器/转换/插件 |
| `src/helpers/userUtils.js` | `userComputed(data)` | 添加模板数据 |
| `src/site/_includes/components/user/*/` | (任意 .njk 文件) | 在插槽注入组件 |
| `src/site/styles/user/` | `minimalist-theme.scss` | 主题覆盖 |

### 2. Frontmatter 选项

笔记级设置（覆盖 .env）:

```yaml
---
title: Note Title
tags: [note, gardenEntry]  # gardenEntry = 首页
permalink: /custom/path/
noteIcon: 📚
dgHomeLink: false
dgPassFrontmatter: false
dgShowBacklinks: false
dgShowLocalGraph: false
dgShowInlineTitle: false
dgShowFileTree: false
dgEnableSearch: false
dgShowToc: false
dgLinkPreview: false
dgShowTags: false
hide: false          # 从文件树隐藏
hideInGraph: false   # 从图谱可视化隐藏
pinned: false        # 在文件树置顶
created: 2024-01-01
updated: 2024-01-02
---
```

---

## 常见问题

### Q: 如何添加新的功能开关？

A: 在以下位置添加：
1. `.env` - 默认值
2. `src/helpers/constants.js` - `ALL_NOTE_SETTINGS` 数组
3. `src/site/_data/meta.js` - 从环境变量读取
4. `src/site/notes/notes.11tydata.js` - 笔记级设置合并

### Q: 如何添加自定义组件插槽？

A: 在 `src/site/_includes/components/user/{namespace}/{slot}/` 中创建 `.njk` 文件。
`dynamics.js` 会在构建时自动发现。

### Q: 样式不生效？如何调试？

A: 检查：
1. 你的样式在正确的 ITCSS layer 中吗？
2. 选择器特异性是否足够？
3. 使用浏览器 DevTools 检查哪个 layer 获胜
4. 必要时使用 `@layer utilities` 或 `!important`（仅 utilities）

### Q: 链接解析找不到笔记？

A: 检查：
1. 笔记有正确的 `permalink` frontmatter 吗？
2. 路径相对于 `src/site/notes/` 正确吗？
3. 查看 `getAnchorAttributes.js` 的缓存行为

---

## 关键文件速查表

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
| `src/site/_includes/scripts/app-state.js` | StorageManager & appState |
| `src/site/styles/main.scss` | ITCSS layer 编排 |
| `src/site/styles/01-settings/_variables.scss` | 设计令牌（CSS 自定义属性） |
| `src/helpers/userSetup.js` | 用户自定义钩子 |
| `src/helpers/userUtils.js` | 用户计算数据钩子 |
| `src/site/_includes/components/user/` | 用户组件插槽 |
| `src/site/styles/user/` | 用户主题覆盖 |

---

## 总结

这是一个完整的、生产就绪的 Eleventy 数字花园，具有：

- ✅ **清晰的关注点分离** (helpers, data, templates, styles)
- ✅ **多级健壮缓存**
- ✅ **周到的可扩展性** (用户钩子、组件插槽)
- ✅ **现代 CSS 架构** (ITCSS + @layer)
- ✅ **类型安全的常量** (无魔法数字)
- ✅ **完全向后兼容** (重构无破坏性变更)

---

**文档版本**: 2.0
**最后更新**: 2026-03-29
**维护者**: Ansatz Team
