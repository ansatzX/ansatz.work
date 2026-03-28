# Markdown渲染质量优化计划

## 问题分析

参考 edav-garden 仓库对比当前实现，发现以下关键问题：

### 1. **排版可读性不足**
- **基础字号**：当前 `16px` (1rem) vs edav-garden `19.2px` (1.2rem)
- **行高**：当前 `1.6-1.8` vs edav-garden `1.5`（更紧凑流畅）
- **字体选择**：当前使用 sans-serif，edav-garden 使用 **Merriweather**（专为屏幕阅读设计的衬线字体）

### 2. **Callout（提示框）类型单一**
- 当前仅有4种类型：info/warning/error/success
- edav-garden有更丰富的类型：
  - `garden` - 种植/成长主题
  - `rmk` - 重要提醒
  - `ex` - 示例
  - `tip` - 提示
  - `qn` - 问题
  - `oth` - 其他
  - `meta` - 元数据（隐藏）
- 缺少图标支持（edav-garden使用lucide图标）

### 3. **内容区域布局**
- 当前 `max-width: 960px`，edav-garden `900px`（更适合阅读）
- 缺少大屏优化（edav-garden在宽屏添加右侧padding）
- 缺少note-gallery布局支持

### 4. **标题层次感不足**
- h2下边框装饰不够精致
- 标题间距和字重可以优化
- 缺少标题颜色变量系统

### 5. **代码块样式**
- 缺少mermaid图表优化
- 代码块padding和圆角可以更精致
- 缺少代码块的标题和复制按钮样式

### 6. **任务列表样式简单**
- 缺少自定义任务列表标记
- 缺少alternate checkbox支持（edav-garden支持emoji标记）

---

## 优化方案

### 阶段1：字体和基础排版（优先级：高）
**目标**：提升长文阅读体验

#### 1.1 引入Merriweather字体
```scss
// 在 minimalist-theme.scss 添加
@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap');
```

#### 1.2 优化基础字号和行高
```scss
// minimalist-theme.scss
.content-main {
  font-family: 'Merriweather', var(--font-family-base);
  font-size: var(--font-size-lg);  // 18px
  line-height: 1.6;  // 稍微调整，介于当前和参考之间
  max-width: 900px;  // 缩窄以提升阅读舒适度
}
```

#### 1.3 优化标题层次
```scss
// _typography.scss
h1 {
  font-size: var(--font-size-4xl);
  letter-spacing: -0.02em;
  margin-bottom: var(--spacing-xl);
  font-weight: var(--font-weight-bold);
}

h2 {
  font-size: var(--font-size-3xl);
  margin-top: var(--spacing-2xl);
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid var(--color-accent);  // 加粗装饰线
}

h3 {
  font-size: var(--font-size-2xl);
  margin-top: var(--spacing-xl);
  margin-bottom: var(--spacing-md);
  color: var(--color-text-secondary);  // 层次区分
}
```

**风险**：低 - 仅调整数值和字体

---

### 阶段2：Callout系统增强（优先级：高）
**目标**：提供更丰富的提示类型和更好的视觉效果

#### 2.1 扩展Callout类型
```scss
// _callouts.scss
.callout {
  padding: var(--spacing-md);
  margin: var(--spacing-md) 0;
  border-radius: var(--radius-lg);  // 更大的圆角
  border-left: 4px solid;
  background-color: rgba(var(--callout-color), 0.1);

  .callout-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-weight: var(--font-weight-bold);  // 更重的字重
    font-size: var(--font-size-base);  // 标题字号
    margin-bottom: var(--spacing-sm);
  }
}

// 新增类型
.callout[data-callout="garden"] {
  --callout-color: 68, 207, 110;
  border-left-color: rgb(var(--callout-color));
  .callout-title::before { content: "🌱 "; }
}

.callout[data-callout="tip"] {
  --callout-color: 0, 209, 178;
  border-left-color: rgb(var(--callout-color));
  .callout-title::before { content: "💡 "; }
}

.callout[data-callout="example"],
.callout[data-callout="ex"] {
  --callout-color: 79, 165, 79;
  border-left-color: rgb(var(--callout-color));
  .callout-title::before { content: "📗 "; }
}

.callout[data-callout="remark"],
.callout[data-callout="rmk"] {
  --callout-color: 219, 1, 1;
  border-left-color: rgb(var(--callout-color));
  .callout-title::before { content: "❗️ "; }
}

.callout[data-callout="question"],
.callout[data-callout="qn"] {
  --callout-color: 251, 146, 76;
  border-left-color: rgb(var(--callout-color));
  .callout-title::before { content: "❓ "; }
}
```

#### 2.2 添加图标支持
```scss
// 使用 lucide 图标
.callout-title .callout-icon {
  width: 20px;
  height: 20px;
}
```

**风险**：低 - 向后兼容现有callout类型

---

### 阶段3：代码块优化（优先级：中）
**目标**：提升代码展示质量

#### 3.1 优化代码块样式
```scss
// _code.scss
pre {
  padding: var(--spacing-lg);  // 增加padding
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);  // 更大圆角
  font-size: var(--font-size-sm);
  line-height: 1.6;

  // 添加滚动条样式
  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: var(--radius-sm);
  }
}
```

#### 3.2 Mermaid图表优化
```scss
pre.mermaid {
  background: var(--color-bg-primary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg);
  text-align: center;
}
```

**风险**：低 - 样式优化

---

### 阶段4：内容区域布局优化（优先级：中）
**目标**：优化不同屏幕下的阅读体验

#### 4.1 响应式内容宽度
```scss
// minimalist-theme.scss
.content-main {
  max-width: 900px;

  @media (min-width: 1500px) {
    &.note-gallery {
      max-width: 1200px;  // 支持gallery布局
    }
  }
}
```

#### 4.2 大屏右侧留白
```scss
@media (min-width: 1200px) {
  .content-main {
    padding-right: 90px;  // 给右侧sidebar留出视觉呼吸空间
  }
}
```

**风险**：低 - 响应式优化

---

### 阶段5：任务列表和细节优化（优先级：低）
**目标**：提升交互细节体验

#### 5.1 任务列表增强
```scss
// _typography.scss
ul.task-list {
  list-style: none;
  padding-left: 0;

  li {
    position: relative;
    padding-left: 1.5rem;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0.5rem;
      width: 1rem;
      height: 1rem;
      border: 2px solid var(--color-accent);
      border-radius: var(--radius-sm);
    }
  }
}
```

#### 5.2 链接下划线优化
```scss
a {
  color: var(--color-accent);
  text-decoration: underline;
  text-decoration-thickness: 1px;  // 更细的下划线
  text-underline-offset: 3px;  // 更大的偏移
  transition: all var(--transition-fast);

  &:hover {
    text-decoration-thickness: 2px;
  }
}
```

**风险**：低 - 细节优化

---

## 关键文件清单

### 需要修改
1. `src/site/styles/base/_typography.scss` - 基础排版优化
2. `src/site/styles/components/_callouts.scss` - Callout类型扩展
3. `src/site/styles/components/_code.scss` - 代码块优化
4. `src/site/styles/user/minimalist-theme.scss` - 字体引入和内容区布局

### 无需修改
- `src/site/styles/tokens/_variables.scss` - 变量系统已完备

---

## 实施顺序

**阶段1** (2-3小时) → **阶段2** (1-2小时) → **阶段3** (1小时) → **阶段4** (0.5小时) → **阶段5** (1小时)

**总计**：5.5-7.5小时

---

## 验证方法

### 每阶段完成后
```bash
npm run build
npm run serve
```

### 测试检查项
- [ ] 长文阅读舒适度（对比优化前后）
- [ ] 所有callout类型正确渲染
- [ ] 代码块样式美观
- [ ] 响应式布局正常
- [ ] 任务列表样式正确

### 最终对比
- 优化前截图 vs 优化后截图
- 与 edav-garden 视觉对比（保持我们的设计系统）

---

## 设计原则

**"借鉴不照搬"**：
- ✅ 借鉴：字体选择、字号、行高、callout类型丰富度
- ✅ 借鉴：内容宽度、响应式优化思路
- ❌ 不照搬：保持我们的CSS变量系统和组件架构
- ❌ 不照搬：保持我们的@layer系统和模块化结构
- ❌ 不照搬：保持我们的命名规范和代码风格

---

## 成功标准

| 指标 | 当前 | 目标 | 参考 |
|------|------|------|------|
| 基础字号 | 16px | 18px | edav: 19.2px |
| 内容宽度 | 960px | 900px | edav: 900px |
| Callout类型 | 4种 | 8种+ | edav: 6种+ |
| 字体 | sans-serif | Merriweather | edav: Merriweather |
| 行高 | 1.6-1.8 | 1.6 | edav: 1.5 |

---

## 注意事项

1. **字体加载**：Merriweather需要从Google Fonts加载，确保网络可达
2. **向后兼容**：保持现有callout类型名称可用（info/warning/error/success）
3. **性能影响**：字体加载可能影响首屏渲染，考虑font-display: swap
4. **中文支持**：Merriweather不支持中文，需保留fallback到中文字体
