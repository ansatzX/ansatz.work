# Graph组件优化计划

## 问题分析

对比 edav-garden 仓库，发现当前graph组件存在以下问题：

### 1. **颜色硬编码问题**
```javascript
// 当前实现（硬编码）
const color = "#0A84FF";  // Apple Blue
const mutedColor = "rgba(255, 255, 255, 0.4)";
const nodeGlow = "#FFFFFF";

// edav-garden实现（CSS变量）
const color = getCssVar("--graph-main");
const mutedColor = getCssVar("--graph-muted");
```

**问题**：
- 颜色值硬编码，无法适配主题切换
- 与我们的CSS变量系统不兼容
- Glow效果在浅色主题下可能过于突兀

### 2. **视觉风格不统一**
- 当前使用白色glow效果和shadow blur
- edav-garden更简洁，直接使用主题色
- 我们的设计系统偏向minimalist风格，glow效果过于花哨

### 3. **尺寸和布局**
- edav-garden: 320px x 320px（更紧凑）
- 当前: 280px min-height（稍大）
- graph标题样式不一致

### 4. **全屏图谱样式**
- edav-garden使用更小的圆角（5px）
- 边框使用主题accent色
- 我们使用更大的圆角和shadow

---

## 优化方案

### 阶段1：添加Graph相关CSS变量（优先级：高）

**修改文件**：`src/site/styles/tokens/_variables.scss`

```scss
// ========== Graph颜色变量 ==========
--color-graph-main: var(--color-accent);
--color-graph-muted: var(--color-text-muted);
--color-graph-node: var(--color-text-primary);
--color-graph-link: rgba(0, 0, 0, 0.1);
```

**理由**：遵循单一数据源原则，让graph颜色跟随主题系统

---

### 阶段2：重构Graph渲染逻辑（优先级：高）

**修改文件**：`src/site/_includes/components/graphScript.njk`

#### 2.1 使用CSS变量替代硬编码
```javascript
// 修改前
const color = "#0A84FF";
const mutedColor = "rgba(255, 255, 255, 0.4)";
const nodeGlow = "#FFFFFF";

// 修改后
const color = getCssVar("--color-graph-main").trim() || "#0066cc";
const mutedColor = getCssVar("--color-graph-muted").trim() || "#999999";
const nodeColor = getCssVar("--color-graph-node").trim() || "#1a1a1a";
```

#### 2.2 简化节点渲染（移除glow效果）
```javascript
// 移除shadow和glow，保持简洁
ctx.beginPath();
ctx.arc(node.x, node.y, nodeR, 0, 2 * Math.PI, false);
if (hoverNode == null) {
    ctx.fillStyle = color;  // 直接使用主题色
} else {
    if (node == hoverNode || highlightNodes.has(node.url)) {
        ctx.fillStyle = color;
    } else {
        ctx.fillStyle = mutedColor;
    }
}
ctx.fill();
```

#### 2.3 优化链接颜色
```javascript
.linkColor((link) => {
    if (hoverNode == null) {
        return "rgba(0, 0, 0, 0.1)";  // 更淡的链接颜色
    }
    if (link.source.id == hoverNode.id || link.target.id == hoverNode.id) {
        return color;
    } else {
        return mutedColor;
    }
})
```

**理由**：
- 借鉴edav-garden的简洁风格
- 移除glow效果以适配我们的minimalist设计
- 使用CSS变量确保主题切换兼容

---

### 阶段3：优化Graph样式（优先级：中）

**修改文件**：`src/site/styles/components/_graph.scss`

#### 3.1 调整尺寸
```scss
.graph {
  width: 100%;
  min-height: 320px;  // 与edav-garden对齐
  background: var(--color-bg-secondary);  // 使用次要背景色
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

#link-graph {
  width: 100%;
  min-height: 280px;  // 调整为280px
}
```

#### 3.2 简化标题样式
```scss
.graph-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  // 移除额外的背景和padding，保持简洁
}

.graph-title-container {
  display: flex;
  justify-content: space-between;  // 改为space-between
  align-items: center;  // 垂直居中
  margin-bottom: var(--spacing-md);
}
```

#### 3.3 优化全屏图谱
```scss
.graph-fs {
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%);
  width: calc(100vw - 100px) !important;
  height: calc(100vh - 100px) !important;
  z-index: 9999 !important;
  background: var(--color-bg-primary);
  border: 2px solid var(--color-accent);  // 使用accent边框
  border-radius: var(--radius-lg);  // 使用统一圆角
  box-shadow: var(--shadow-xl);  // 添加阴影

  .graph-title {
    display: none;  // 全屏时隐藏标题（edav-garden做法）
  }

  #graph-controls {
    margin-top: var(--spacing-md);
  }
}
```

**理由**：
- 统一尺寸标准
- 简化视觉风格
- 保持与设计系统一致

---

### 阶段4：优化控制按钮样式（优先级：低）

**修改文件**：`src/site/styles/components/_graph.scss`

```scss
.ctrl-right {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;

  span {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;   // 固定大小
    height: 28px;
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
    cursor: pointer;

    &:hover {
      background-color: var(--color-bg-overlay);

      i {
        color: var(--color-accent);
      }
    }

    i {
      width: 16px;
      height: 16px;
      color: var(--color-text-secondary);
    }
  }
}
```

**理由**：提升按钮交互体验，保持视觉一致性

---

### 阶段5：优化depth滑块样式（优先级：低）

**修改文件**：`src/site/styles/components/_graph.scss`

```scss
.depth-control {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);

  label {
    font-size: var(--font-size-xs);  // 更小的标签
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-medium);
  }

  .slider {
    input[type="range"] {
      width: 80px;
      height: 4px;
      cursor: pointer;
      -webkit-appearance: none;
      background: var(--color-border);
      border-radius: var(--radius-sm);

      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 12px;
        height: 12px;
        background: var(--color-accent);
        border-radius: 50%;
        cursor: pointer;
      }
    }
  }

  #depth-display {
    min-width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-inverse);
    background-color: var(--color-accent);
    border-radius: var(--radius-sm);
  }
}
```

**理由**：提升滑块视觉效果和可用性

---

## 关键差异对比

| 方面 | 当前实现 | edav-garden | 优化方向 |
|------|----------|-------------|----------|
| **颜色系统** | 硬编码 | CSS变量 | ✅ 使用CSS变量 |
| **节点效果** | Glow + Shadow | 简洁填充 | ✅ 移除glow |
| **链接颜色** | 白色半透明 | 黑色半透明 | ✅ 调整为黑色 |
| **尺寸** | 280px | 320px | ✅ 调整为320px |
| **标题样式** | 独立样式块 | 简洁文本 | ✅ 简化样式 |
| **全屏样式** | 大圆角 | 小圆角 | ⚠️ 保持大圆角（符合我们的设计） |

---

## 设计原则

**借鉴**：
- ✅ CSS变量系统
- ✅ 简洁节点渲染（无glow）
- ✅ 统一的尺寸标准
- ✅ 链接颜色逻辑

**保持**：
- ✅ 我们的设计令牌系统
- ✅ 大圆角风格（radius-lg）
- ✅ 现有的控制按钮布局
- ✅ Alpine.js x-teleport实现

---

## 实施步骤

**阶段1** (15分钟) → **阶段2** (30分钟) → **阶段3** (20分钟) → **阶段4** (10分钟) → **阶段5** (10分钟)

**总计**：85分钟

---

## 测试验证

### 功能测试
- [ ] Graph正常渲染
- [ ] 节点点击跳转正常
- [ ] Depth滑块工作正常
- [ ] 全屏切换正常
- [ ] 全局图谱正常打开

### 视觉测试
- [ ] 节点颜色跟随主题
- [ ] 链接颜色适当
- [ ] 无glow效果干扰
- [ ] 标题样式简洁
- [ ] 按钮交互流畅

### 兼容性测试
- [ ] 浅色主题正常
- [ ] 深色主题正常（如支持）
- [ ] 响应式布局正常

---

## 成功标准

1. ✅ 移除所有硬编码颜色值
2. ✅ 节点渲染简洁无glow
3. ✅ 尺寸符合标准（320px）
4. ✅ 样式跟随主题系统
5. ✅ 保持所有功能正常工作
