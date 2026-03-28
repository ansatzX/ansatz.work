# 📊 Graph View 和 Backlinks 组件说明

## ✅ 组件已集成

你的项目中已经完整实现了两个核心组件：

### 1. **Graph View（图谱视图）**

#### 功能特性：
- ✅ 展示页面间的内链关系
- ✅ 可调节深度（1-3层）
- ✅ 交互式力导向图（使用 force-graph 库）
- ✅ 支持全屏模式
- ✅ 支持查看全局图谱
- ✅ 节点悬停高亮相关连接
- ✅ 点击节点跳转页面

#### 技术实现：
- **数据源**: `/graph.json` - 自动生成的图谱数据
- **可视化库**: Force Graph (https://github.com/vasturiano/force-graph)
- **组件文件**: `src/site/_includes/components/graphScript.njk`
- **样式文件**: `src/site/styles/components/_graph.scss`

#### 使用方式：
在右侧侧边栏自动显示（如果设置中启用）

#### 控制选项：
- **Depth滑块**: 控制显示的层级深度（1-3）
- **全屏按钮**: 放大图谱查看
- **全局图谱**: 查看整个网站的所有连接关系

### 2. **Backlinks（反向链接）**

#### 功能特性：
- ✅ 显示引用当前页面的所有其他页面
- ✅ 自动生成，基于图谱数据
- ✅ 卡片式展示，带图标
- ✅ 悬停效果和动画
- ✅ 可滚动列表（最大高度400px）

#### 技术实现：
- **数据源**: 自动从 `graph.json` 提取
- **组件文件**: `src/site/_includes/components/sidebar.njk`
- **样式文件**: `src/site/styles/components/_backlinks.scss`

#### 使用方式：
在右侧侧边栏Graph View下方自动显示

## 📁 文件结构

```
src/site/
├── graph.njk                          # 生成 graph.json
├── _includes/
│   └── components/
│       ├── graphScript.njk            # Graph View 组件
│       └── sidebar.njk                # 包含 Backlinks
└── styles/
    └── components/
        ├── _graph.scss                # Graph 样式
        └── _backlinks.scss            # Backlinks 样式
```

## 🎨 样式特点

### Graph View 样式
- 浅色背景，适合白底黑字主题
- 蓝色强调色（#0066cc）
- 悬停时节点高亮
- 平滑过渡动画
- 响应式设计，移动端适配

### Backlinks 样式
- 卡片式设计
- 左侧蓝色边框标记
- 悬停时微动效果
- 可滚动列表

## ⚙️ 配置选项

在 `.env` 文件中控制：

```bash
# 是否显示图谱
dgShowLocalGraph=true

# 是否显示反向链接
dgShowBacklinks=true

# 是否显示目录
dgShowToc=true
```

## 🚀 新增样式已应用

刚刚为这两个组件创建了新的样式文件：
- ✅ `_graph.scss` - 图谱视图样式
- ✅ `_backlinks.scss` - 反向链接样式

已集成到新的样式系统中，构建后生效。

## 📊 数据流程

1. **构建时**: Eleventy 分析所有 Markdown 文件中的内链
2. **生成**: `graph.json` 包含所有节点和连接
3. **前端**: JavaScript 获取数据并渲染图谱
4. **交互**: 用户可以探索页面间的关系

## 🎯 效果

- **白底黑字主题**: Graph 和 Backlinks 都已适配新主题
- **动态布局**: 随窗口大小自适应
- **流畅交互**: 平滑的动画和过渡效果

---

现在运行 `npm run build` 后，所有功能都会以新的样式系统呈现！
