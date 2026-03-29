/**
 * 可拖动侧边栏 - 使用原来的CSS类方式
 * 支持左右两边收起
 */

(function() {
  'use strict';

  // 配置
  const CONFIG = {
    minWidth: 200,
    maxWidth: 400,
    storageKey: 'sidebar-cssclass-v1'
  };

  // 状态
  let dragging = null;
  let startX = 0;
  let startWidth = { left: 280, right: 280 };
  let currentWidth = { left: 280, right: 280 };
  let collapsed = { left: false, right: false };

  // DOM
  let leftSidebar, rightSidebar, appLayout;

  /**
   * 初始化
   */
  function init() {
    leftSidebar = document.querySelector('.sidebar-left');
    rightSidebar = document.querySelector('.sidebar-right');
    appLayout = document.querySelector('.app-layout');

    if (!appLayout) return;

    // 获取初始宽度
    if (leftSidebar) startWidth.left = currentWidth.left = leftSidebar.offsetWidth || 280;
    if (rightSidebar) startWidth.right = currentWidth.right = rightSidebar.offsetWidth || 280;

    // 加载保存的状态
    loadState();

    // 清理旧元素
    cleanup();

    // 创建拖动手柄
    createHandles();

    // 创建切换按钮
    createButtons();

    // 应用状态
    applyState();

    console.log('[Sidebar] Ready');
  }

  /**
   * 清理旧元素
   */
  function cleanup() {
    document.querySelectorAll('.drag-handle, .toggle-btn, .handle-left, .handle-right, .btn-left, .btn-right, .resize-handle, .sidebar-toggle-btn').forEach(el => el.remove());
  }

  /**
   * 加载状态
   */
  function loadState() {
    try {
      const saved = localStorage.getItem(CONFIG.storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.widths) currentWidth = Object.assign(currentWidth, data.widths);
        if (data.collapsed) collapsed = Object.assign(collapsed, data.collapsed);
      }
    } catch (e) {
      console.warn('[Sidebar] Load failed:', e);
    }
  }

  /**
   * 保存状态
   */
  function saveState() {
    try {
      localStorage.setItem(CONFIG.storageKey, JSON.stringify({
        widths: currentWidth,
        collapsed: collapsed
      }));
    } catch (e) {
      console.warn('[Sidebar] Save failed:', e);
    }
  }

  /**
   * 应用状态 - 使用CSS类方式
   */
  function applyState() {
    const root = document.documentElement;

    // 先设置宽度
    if (leftSidebar && !collapsed.left) {
      root.style.setProperty('--grid-column-left', currentWidth.left + 'px');
    }
    if (rightSidebar && !collapsed.right) {
      root.style.setProperty('--grid-column-right', currentWidth.right + 'px');
    }

    // 添加/移除CSS类
    appLayout.classList.toggle('sidebar-left-collapsed', collapsed.left);
    appLayout.classList.toggle('sidebar-right-collapsed', collapsed.right);

    // 侧边栏自身的类
    if (leftSidebar) {
      leftSidebar.classList.toggle('sidebar-collapsed', collapsed.left);
    }
    if (rightSidebar) {
      rightSidebar.classList.toggle('sidebar-collapsed', collapsed.right);
    }

    updateButtonIcons();
  }

  /**
   * 创建拖动手柄
   */
  function createHandles() {
    if (leftSidebar) {
      const h = document.createElement('div');
      h.className = 'drag-handle handle-left';
      h.addEventListener('mousedown', e => startDrag(e, 'left'));
      appLayout.insertBefore(h, leftSidebar.nextSibling);
    }

    if (rightSidebar) {
      const h = document.createElement('div');
      h.className = 'drag-handle handle-right';
      h.addEventListener('mousedown', e => startDrag(e, 'right'));
      appLayout.insertBefore(h, rightSidebar);
    }
  }

  /**
   * 创建切换按钮
   */
  function createButtons() {
    if (leftSidebar) {
      const btn = document.createElement('button');
      btn.className = 'toggle-btn btn-left';
      btn.innerHTML = '‹';
      btn.title = 'Toggle left sidebar';
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggle('left');
      });
      leftSidebar.appendChild(btn);
    }

    if (rightSidebar) {
      const btn = document.createElement('button');
      btn.className = 'toggle-btn btn-right';
      btn.innerHTML = '›';
      btn.title = 'Toggle right sidebar';
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggle('right');
      });
      rightSidebar.appendChild(btn);
    }
  }

  /**
   * 更新按钮图标
   */
  function updateButtonIcons() {
    if (leftSidebar) {
      const btn = leftSidebar.querySelector('.btn-left');
      if (btn) btn.innerHTML = collapsed.left ? '›' : '‹';
    }
    if (rightSidebar) {
      const btn = rightSidebar.querySelector('.btn-right');
      if (btn) btn.innerHTML = collapsed.right ? '‹' : '›';
    }
  }

  /**
   * 开始拖动
   */
  function startDrag(e, side) {
    e.preventDefault();
    e.stopPropagation();
    dragging = side;
    startX = e.clientX;
    startWidth[side] = currentWidth[side];
    document.body.classList.add('dragging');
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);
  }

  /**
   * 拖动中
   */
  function onDrag(e) {
    if (!dragging) return;

    let delta = e.clientX - startX;
    if (dragging === 'right') delta = -delta;

    const newWidth = startWidth[dragging] + delta;

    if (newWidth < 50) {
      if (!collapsed[dragging]) {
        collapsed[dragging] = true;
        applyState();
        saveState();
      }
    } else {
      if (collapsed[dragging]) {
        collapsed[dragging] = false;
      }
      currentWidth[dragging] = Math.max(CONFIG.minWidth, Math.min(CONFIG.maxWidth, newWidth));
      applyState();
    }
  }

  /**
   * 停止拖动
   */
  function stopDrag() {
    if (!dragging) return;
    dragging = null;
    document.body.classList.remove('dragging');
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
    saveState();
  }

  /**
   * 切换侧边栏
   */
  function toggle(side) {
    collapsed[side] = !collapsed[side];
    applyState();
    saveState();
  }

  // 添加样式 - 关键是CSS类
  const style = document.createElement('style');
  style.textContent = `
    /* 拖动手柄 */
    .drag-handle {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 6px;
      cursor: col-resize;
      z-index: 100;
      transition: background 0.15s;
    }
    .drag-handle:hover, .drag-handle:active {
      background: var(--color-accent);
    }
    .handle-left { right: -3px; }
    .handle-right { left: -3px; }

    /* 侧边栏定位 */
    .sidebar-left, .sidebar-right {
      position: relative;
    }

    /* 收起状态 - 侧边栏自身 */
    .sidebar-collapsed {
      overflow: visible !important;
    }
    .sidebar-collapsed > *:not(.toggle-btn) {
      opacity: 0;
      pointer-events: none;
      visibility: hidden;
      position: absolute;
    }

    /* 切换按钮 */
    .toggle-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 32px;
      height: 48px;
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border);
      cursor: pointer;
      z-index: 101;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: bold;
      color: var(--color-text-primary);
      transition: all 0.15s;
      padding: 0;
      line-height: 1;
      user-select: none;
    }
    .toggle-btn:hover {
      background: var(--color-accent);
      color: var(--color-text-inverse);
      border-color: var(--color-accent);
    }
    .btn-left {
      right: 0;
      border-radius: var(--radius-md) 0 0 var(--radius-md);
      border-right: none;
    }
    .btn-right {
      left: 0;
      border-radius: 0 var(--radius-md) var(--radius-md) 0;
      border-left: none;
    }

    /* 收起时按钮在外面 */
    .sidebar-collapsed.sidebar-left .btn-left {
      right: -32px;
      border-radius: 0 var(--radius-md) var(--radius-md) 0;
      border: 1px solid var(--color-border);
      border-left: none;
    }
    .sidebar-collapsed.sidebar-right .btn-right {
      left: -32px;
      border-radius: var(--radius-md) 0 0 var(--radius-md);
      border: 1px solid var(--color-border);
      border-right: none;
    }

    /* 关键：使用CSS类控制grid布局 - 类似原来的nav-collapsed */
    .app-layout.sidebar-left-collapsed {
      grid-template-columns: 0fr var(--grid-column-main) var(--grid-column-right) !important;
    }
    .app-layout.sidebar-right-collapsed {
      grid-template-columns: var(--grid-column-left) var(--grid-column-main) 0fr !important;
    }
    .app-layout.sidebar-left-collapsed.sidebar-right-collapsed {
      grid-template-columns: 0fr var(--grid-column-main) 0fr !important;
    }

    /* 拖动时光标 */
    .dragging, .dragging * {
      cursor: col-resize !important;
      user-select: none !important;
    }
  `;
  document.head.appendChild(style);

  // 启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
