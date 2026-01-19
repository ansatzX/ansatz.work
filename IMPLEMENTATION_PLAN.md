# 实现计划

基于 https://dg-docs.ole.dev/ 文档，对照当前代码实现状态。

## 实现状态对照表

### ✅ 已实现的功能

| 功能 | 实现方式 |
|------|----------|
| **全局设置** | `.env` 环境变量 (`src/site/_data/meta.js`) |
| 主题选择 | ✅ `get-theme.js` 下载并缓存主题 CSS |
| 站点名称 | ✅ `SITE_NAME_HEADER` |
| Favicon | ✅ `eleventy-plugin-gen-favicons` 自动生成 |
| 搜索功能 | ✅ `dgEnableSearch` (前端搜索) |
| 显示文件树 | ✅ `dgShowFileTree` |
| 显示本地图谱 | ✅ `dgShowLocalGraph` |
| 显示反向链接 | ✅ `dgShowBacklinks` |
| 显示目录 (TOC) | ✅ `dgShowToc` |
| 链接预览 | ✅ `dgLinkPreview` |
| 显示标签 | ✅ `dgShowTags` |
| 内联标题 | ✅ `dgShowInlineTitle` |
| Home 链接 | ✅ `dgHomeLink` |
| Note 图标 | ✅ `NOTE_ICON_*` 全局设置 |
| 时间戳显示 | ✅ `SHOW_*_TIMESTAMP` + `TIMESTAMP_FORMAT` |
| 传递 frontmatter | ✅ `dgPassFrontmatter` |
| 自定义组件 | ✅ `src/site/_includes/components/user/` |
| 自定义样式 | ✅ `src/site/styles/user/` |

---

### ⚠️ 部分缺失/不一致的功能

| 功能 | 文档 | 实现情况 | 位置 |
|------|------|----------|------|
| `dg-permalink` | 自定义 URL | ❌ 未实现 | - |
| `dg-path` | 自定义文件路径 | ⚠️ 部分实现（仅代码读取） | `linkUtils.js:88` |
| `dg-pinned` | 固定到文件夹顶部 | ⚠️ 部分实现（仅读取 `pinned`） | `filetreeUtils.js:85-87` |
| `dg-hide` | 从文件树隐藏 | ✅ 实现（读取 `hide`） | `filetreeUtils.js:82-84` |
| `dg-hide-in-graph` | 从图中隐藏 | ✅ 实现（读取 `hideInGraph`） | `linkUtils.js:58` |
| `dg-metatags` | 社交媒体标签 | ❌ 未实现 | - |
| `dg-content-classes` | 自定义 body 类 | ❌ 未实现 | - |
| `dg-note-icon` | Note 图标 | ⚠️ 部分实现（仅读取 `noteIcon` frontmatter） | - |
| 时间戳值 | frontmatter 字段 | ⚠️ 使用文件系统日期 | - |
| CSS Settings Plugin 导入 | ❌ 未实现 | - |

---

### 📝 发现的不一致

1. **dgHome vs dgShowFileTree**：文档和源码混用不同的变量名
2. **dgHome vs dgShowLocalGraph**：同样的问题
3. **dg-path** 实现**：代码读取了 `dg-path`，但前端/UI 未使用此功能
4. **dg-pinned** 实现**：代码读取了 `pinned`，但前端 UI 未体现固定/置顶功能

---

## 待实现功能清单

### 优先级 1：文档中明确存在但未实现

- [ ] `dg-metatags` - 社交媒体标签（Open Graph, Twitter 图片等）
- [ ] `dg-content-classes` - 自定义 body CSS 类
- [ ] CSS Settings Plugin 导入 - 从 Obsidian 插件导入样式设置

### 优先级 2：功能改进

- [ ] `dg-note-icon` per-note 设置（优先级高于全局 `NOTE_ICON_DEFAULT`）
- [ ] 时间戳值 - 支持 frontmatter 中的自定义日期字段
- [ ] `dg-path` - 验证前端是否实际使用此功能

### 优先级 3：文档一致性

- [ ] 统一 `dgHome` / `dgShowFileTree` 命名（或添加文档说明差异）
- [ ] 统一 `dgHome` / `dgShowLocalGraph` 命名（或添加文档说明差异）
