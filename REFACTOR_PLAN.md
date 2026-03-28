# 项目重构方案

## 现状问题

### 1. 样式系统混乱
- `obsidian-base.scss` 302KB - 单一文件过大
- 多个主题文件互相覆盖 (obsidian-base, digital-garden-base, minimalist-theme, custom-style)
- 大量使用 `!important` 强制覆盖
- 总计 11,893 行样式代码

### 2. 架构问题
- 布局系统不统一
- 样式优先级混乱
- 缺乏设计系统

### 3. 构建产物
- dist: 5.9MB
- node_modules: 175MB

## 重构方案：渐进式三阶段

---

## 阶段一：样式系统重构（优先级：高）

### 目标
建立清晰的样式架构，减少 70% 的样式代码量

### 步骤

#### 1.1 创建设计令牌系统
**新建文件：** `src/site/styles/tokens/_variables.scss`

```scss
// 设计令牌 - 单一数据源
:root {
  // 主题：浅色
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f5f5f5;
  --color-text-primary: #1a1a1a;
  --color-text-secondary: #6b6b6b;
  --color-accent: #0066cc;

  // 布局
  --content-max-width: 960px;
  --sidebar-width: 280px;
  --spacing-unit: 1rem;

  // 字体
  --font-family-base: "SF Pro Display", -apple-system, "PingFang SC", sans-serif;
  --font-size-base: 1.15rem;
  --line-height-base: 1.8;
}
```

#### 1.2 重构布局系统
**新建文件：** `src/site/styles/layout/_grid.scss`

```scss
// 统一的网格布局系统
.app-layout {
  display: grid;
  grid-template-columns: var(--sidebar-width) 1fr var(--sidebar-width);
  gap: 1.5rem;
  min-height: 100vh;
  padding: 1.5rem 2vw;

  @media (max-width: 1400px) {
    grid-template-columns: 1fr var(--sidebar-width);
  }

  @media (max-width: 1100px) {
    display: flex;
    flex-direction: column;
  }
}

.content-main {
  max-width: var(--content-max-width);
  padding: 2.5rem 2rem;
}

.sidebar {
  width: 100%;
  max-width: var(--sidebar-width);
}
```

#### 1.3 组件化样式
**新建目录结构：**
```
src/site/styles/
├── tokens/
│   ├── _variables.scss      # 设计令牌
│   └── _breakpoints.scss    # 响应式断点
├── base/
│   ├── _reset.scss          # 基础重置
│   └── _typography.scss     # 排版
├── layout/
│   ├── _grid.scss           # 网格布局
│   └── _sidebar.scss        # 侧边栏
├── components/
│   ├── _buttons.scss        # 按钮
│   ├── _cards.scss          # 卡片
│   ├── _code.scss           # 代码块
│   └── _callouts.scss       # 提示框
└── main.scss                # 主入口
```

#### 1.4 主样式文件
**新建文件：** `src/site/styles/main.scss`

```scss
// 设计令牌
@import 'tokens/variables';
@import 'tokens/breakpoints';

// 基础样式
@import 'base/reset';
@import 'base/typography';

// 布局
@import 'layout/grid';
@import 'layout/sidebar';

// 组件
@import 'components/buttons';
@import 'components/cards';
@import 'components/code';
@import 'components/callouts';
```

### 预期收益
- ✅ 样式代码量减少 70% (从 11,893 行降至 ~3,500 行)
- ✅ 构建产物减小 50%
- ✅ 可维护性提升 200%
- ✅ 无需 `!important` 覆盖

---

## 阶段二：模板系统重构（优先级：中）

### 目标
简化模板结构，提高可读性

### 步骤

#### 2.1 统一布局模板
**重构文件：** `src/site/_includes/layouts/base.njk`

```nunjucks
<!DOCTYPE html>
<html lang="{{ meta.mainLanguage }}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ title or page.fileSlug }}</title>
  <link rel="stylesheet" href="/styles/main.css">
</head>
<body class="theme-{{ meta.baseTheme }}">
  <div class="app-layout">
    <aside class="sidebar sidebar-left">
      {% include "components/navigation.njk" %}
    </aside>

    <main class="content-main">
      {{ content | safe }}
    </main>

    <aside class="sidebar sidebar-right">
      {% include "components/toc.njk" %}
      {% include "components/backlinks.njk" %}
    </aside>
  </div>
</body>
</html>
```

#### 2.2 组件化拆分
- 拆分大型组件为独立文件
- 统一命名规范
- 移除冗余模板

### 预期收益
- ✅ 模板文件减少 40%
- ✅ 渲染性能提升 30%

---

## 阶段三：构建优化（优先级：低）

### 目标
优化构建流程和产物

### 步骤

#### 3.1 依赖清理
- 审计未使用的依赖
- 移除重复功能包
- 升级关键依赖

#### 3.2 构建优化
- CSS 压缩和提取
- 图片优化自动化
- 缓存策略优化

### 预期收益
- ✅ node_modules 减少 30%
- ✅ 构建速度提升 50%
- ✅ dist 产物减少 40%

---

## 执行计划

### 第 1 周：阶段一（样式重构）
- [ ] 创建设计令牌系统
- [ ] 重构布局系统
- [ ] 组件化拆分
- [ ] 删除旧样式文件

### 第 2 周：阶段二（模板重构）
- [ ] 统一布局模板
- [ ] 组件化拆分
- [ ] 清理冗余模板

### 第 3 周：阶段三（构建优化）
- [ ] 依赖审计
- [ ] 构建流程优化
- [ ] 性能测试

---

## 风险评估

### 低风险
- ✅ 样式重构：向后兼容，可渐进迁移
- ✅ 组件拆分：不影响现有功能

### 中风险
- ⚠️ 模板重构：需要全面测试
- ⚠️ 依赖更新：可能引入破坏性变更

### 缓解措施
1. 保留旧文件备份
2. 渐进式迁移
3. 完整的测试覆盖
4. 版本控制回滚机制

---

## 成功指标

- [ ] 样式代码 < 4,000 行
- [ ] 构建产物 < 3MB
- [ ] Lighthouse 性能分数 > 90
- [ ] 无样式冲突
- [ ] 内容可选择

---

## 立即行动

建议从**阶段一.1.1**开始：创建设计令牌系统

这是最高优先级、最低风险、最大收益的改进。
