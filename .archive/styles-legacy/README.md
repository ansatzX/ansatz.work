# 归档样式文件

这些文件已从项目中移除，保留作为历史参考。

## 归档日期
2026-03-28

## 归档原因
- 项目已完成样式系统重构
- 使用统一的变量系统和Grid布局
- 这些文件不再被引用

## 文件说明
- `obsidian-base.scss` - Obsidian主题基础样式（10,629行）
- `digital-garden-base.scss` - Digital Garden基础样式（900行）
- `style.scss` - 旧版主样式文件（220行）
- `custom-style.scss` - 用户自定义样式（已迁移至 `_memos.scss`）

## 重构成果

### 变量系统统一
- 所有变量定义在 `src/site/styles/tokens/_variables.scss`
- 移除重复变量定义
- 统一命名规范

### Grid布局统一
- 使用CSS变量控制Grid
- 统一响应式断点
- 使用标准mixin

### !important清理
- 减少90%的使用（96处 → <10处）
- 使用CSS层管理优先级
- 提高可维护性

### 组件架构优化
- 修复sidebar双重嵌套
- 统一布局模板
- 规范化组件结构

## 恢复方法
如需恢复，请参考重构文档：`/Users/ansatz/.claude/plans/humble-forging-sphinx.md`
