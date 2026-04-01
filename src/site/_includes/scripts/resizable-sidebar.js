/**
 * @fileoverview 可拖动侧边栏
 * 支持左右两边收起，使用 CSS 类方式控制布局
 */

/**
 * 侧边栏配置常量
 */
const SIDEBAR_MIN_WIDTH = 180;
const SIDEBAR_DEFAULT_WIDTH = 280;
const SIDEBAR_RIGHT_DEFAULT_WIDTH = 380;
const STORAGE_KEY_SIDEBAR_LEFT_WIDTH = 'dg-sidebar-left-width';
const STORAGE_KEY_SIDEBAR_RIGHT_WIDTH = 'dg-sidebar-right-width';
const STORAGE_KEY_SIDEBAR_LEFT_COLLAPSED = 'dg-sidebar-left-collapsed';
const STORAGE_KEY_SIDEBAR_RIGHT_COLLAPSED = 'dg-sidebar-right-collapsed';
const STORAGE_KEY_LAYOUT_VERSION = 'dg-sidebar-layout-version';
const CURRENT_LAYOUT_VERSION = '2';

/**
 * 侧边栏配置
 */
const CONFIG = {
  minWidth: SIDEBAR_MIN_WIDTH,
  maxWidth: 400,
  collapseThreshold: 50,
  storageKey: 'sidebar-cssclass-v1',
};

/**
 * 侧边栏状态
 */
const state = {
  dragging: null,
  startX: 0,
  startWidth: {left: SIDEBAR_DEFAULT_WIDTH, right: SIDEBAR_DEFAULT_WIDTH},
  currentWidth: {left: SIDEBAR_DEFAULT_WIDTH, right: SIDEBAR_DEFAULT_WIDTH},
  collapsed: {left: false, right: false},
};

/**
 * DOM 元素引用
 */
const dom = {
  leftSidebar: null,
  rightSidebar: null,
  appLayout: null,
};

/**
 * 清理旧元素
 */
function cleanup() {
  document.querySelectorAll(
      '.drag-handle, .toggle-btn, .handle-left, .handle-right, ' +
      '.btn-left, .btn-right, .resize-handle, .sidebar-toggle-btn',
  ).forEach((el) => el.remove());
}

/**
 * 加载保存的状态
 */
function loadState() {
  try {
    // 检查布局版本，如果是旧版本则清除旧数据
    const storedVersion = localStorage.getItem(STORAGE_KEY_LAYOUT_VERSION);
    if (storedVersion !== CURRENT_LAYOUT_VERSION) {
      // 清除旧的 localStorage 数据
      localStorage.removeItem(STORAGE_KEY_SIDEBAR_LEFT_WIDTH);
      localStorage.removeItem(STORAGE_KEY_SIDEBAR_RIGHT_WIDTH);
      localStorage.removeItem(STORAGE_KEY_SIDEBAR_LEFT_COLLAPSED);
      localStorage.removeItem(STORAGE_KEY_SIDEBAR_RIGHT_COLLAPSED);
      // 移除旧版本的 storage key
      localStorage.removeItem('sidebar-cssclass-v1');
      // 设置新版本
      localStorage.setItem(STORAGE_KEY_LAYOUT_VERSION, CURRENT_LAYOUT_VERSION);
      // 使用默认值
      state.currentWidth.left = SIDEBAR_DEFAULT_WIDTH;
      state.currentWidth.right = SIDEBAR_RIGHT_DEFAULT_WIDTH;
      return;
    }

    // 尝试从新的常量键名加载
    const leftWidth = localStorage.getItem(STORAGE_KEY_SIDEBAR_LEFT_WIDTH);
    const rightWidth = localStorage.getItem(STORAGE_KEY_SIDEBAR_RIGHT_WIDTH);
    const leftCollapsed = localStorage.getItem(STORAGE_KEY_SIDEBAR_LEFT_COLLAPSED);
    const rightCollapsed = localStorage.getItem(STORAGE_KEY_SIDEBAR_RIGHT_COLLAPSED);

    if (leftWidth !== null) {
      state.currentWidth.left = parseInt(leftWidth, 10);
    } else {
      state.currentWidth.left = SIDEBAR_DEFAULT_WIDTH;
    }
    if (rightWidth !== null) {
      state.currentWidth.right = parseInt(rightWidth, 10);
    } else {
      state.currentWidth.right = SIDEBAR_RIGHT_DEFAULT_WIDTH;
    }
    if (leftCollapsed !== null) {
      state.collapsed.left = leftCollapsed === 'true';
    }
    if (rightCollapsed !== null) {
      state.collapsed.right = rightCollapsed === 'true';
    }
  } catch (e) {
    // 静默失败，使用默认值
  }
}

/**
 * 保存状态
 */
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY_SIDEBAR_LEFT_WIDTH, state.currentWidth.left.toString());
    localStorage.setItem(STORAGE_KEY_SIDEBAR_RIGHT_WIDTH, state.currentWidth.right.toString());
    localStorage.setItem(STORAGE_KEY_SIDEBAR_LEFT_COLLAPSED, state.collapsed.left.toString());
    localStorage.setItem(STORAGE_KEY_SIDEBAR_RIGHT_COLLAPSED, state.collapsed.right.toString());
  } catch (e) {
    // 静默失败
  }
}

/**
 * 应用状态 - 使用 CSS 类方式
 */
function applyState() {
  const root = document.documentElement;

  // 设置侧边栏宽度变量（专门用于像素宽度）
  if (dom.leftSidebar) {
    if (!state.collapsed.left) {
      root.style.setProperty('--sidebar-left-width', state.currentWidth.left + 'px');
    } else {
      root.style.removeProperty('--sidebar-left-width');
    }
  }
  if (dom.rightSidebar) {
    if (!state.collapsed.right) {
      root.style.setProperty('--sidebar-right-width', state.currentWidth.right + 'px');
    } else {
      root.style.removeProperty('--sidebar-right-width');
    }
  }

  // 添加/移除 CSS 类
  dom.appLayout.classList.toggle('sidebar-left-collapsed', state.collapsed.left);
  dom.appLayout.classList.toggle('sidebar-right-collapsed', state.collapsed.right);

  // 侧边栏自身的类
  if (dom.leftSidebar) {
    dom.leftSidebar.classList.toggle('sidebar-collapsed', state.collapsed.left);
  }
  if (dom.rightSidebar) {
    dom.rightSidebar.classList.toggle('sidebar-collapsed', state.collapsed.right);
  }

  updateButtonIcons();
}

/**
 * 创建拖动手柄
 */
function createHandles() {
  if (dom.leftSidebar) {
    const handle = document.createElement('div');
    handle.className = 'drag-handle handle-left';
    handle.addEventListener('mousedown', (e) => startDrag(e, 'left'));
    dom.appLayout.insertBefore(handle, dom.leftSidebar.nextSibling);
  }

  if (dom.rightSidebar) {
    const handle = document.createElement('div');
    handle.className = 'drag-handle handle-right';
    handle.addEventListener('mousedown', (e) => startDrag(e, 'right'));
    dom.appLayout.insertBefore(handle, dom.rightSidebar);
  }
}

/**
 * 创建切换按钮
 */
function createButtons() {
  if (dom.leftSidebar) {
    const btn = document.createElement('button');
    btn.className = 'toggle-btn btn-left';
    btn.innerHTML = '‹';
    btn.title = 'Toggle left sidebar';
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggle('left');
    });
    dom.leftSidebar.appendChild(btn);
  }

  if (dom.rightSidebar) {
    const btn = document.createElement('button');
    btn.className = 'toggle-btn btn-right';
    btn.innerHTML = '›';
    btn.title = 'Toggle right sidebar';
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggle('right');
    });
    dom.rightSidebar.appendChild(btn);
  }
}

/**
 * 更新按钮图标
 */
function updateButtonIcons() {
  if (dom.leftSidebar) {
    const btn = dom.leftSidebar.querySelector('.btn-left');
    if (btn) {
      btn.innerHTML = state.collapsed.left ? '›' : '‹';
    }
  }
  if (dom.rightSidebar) {
    const btn = dom.rightSidebar.querySelector('.btn-right');
    if (btn) {
      btn.innerHTML = state.collapsed.right ? '‹' : '›';
    }
  }
}

/**
 * 开始拖动
 * @param {MouseEvent} e - 鼠标事件
 * @param {string} side - 侧边栏位置 ('left' 或 'right')
 */
function startDrag(e, side) {
  e.preventDefault();
  e.stopPropagation();
  state.dragging = side;
  state.startX = e.clientX;
  state.startWidth[side] = state.currentWidth[side];
  document.body.classList.add('dragging');
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
}

/**
 * 拖动中
 * @param {MouseEvent} e - 鼠标事件
 */
function onDrag(e) {
  if (!state.dragging) {
    return;
  }

  let delta = e.clientX - state.startX;
  if (state.dragging === 'right') {
    delta = -delta;
  }

  const newWidth = state.startWidth[state.dragging] + delta;

  if (newWidth < CONFIG.collapseThreshold) {
    if (!state.collapsed[state.dragging]) {
      state.collapsed[state.dragging] = true;
      applyState();
      saveState();
    }
  } else {
    if (state.collapsed[state.dragging]) {
      state.collapsed[state.dragging] = false;
    }
    state.currentWidth[state.dragging] = Math.max(
        CONFIG.minWidth,
        Math.min(CONFIG.maxWidth, newWidth),
    );
    applyState();
  }
}

/**
 * 停止拖动
 */
function stopDrag() {
  if (!state.dragging) {
    return;
  }
  state.dragging = null;
  document.body.classList.remove('dragging');
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
  saveState();
}

/**
 * 切换侧边栏
 * @param {string} side - 侧边栏位置 ('left' 或 'right')
 */
function toggle(side) {
  state.collapsed[side] = !state.collapsed[side];
  applyState();
  saveState();
}

/**
 * 初始化
 */
function init() {
  dom.leftSidebar = document.querySelector('.sidebar-left');
  dom.rightSidebar = document.querySelector('.sidebar-right');
  dom.appLayout = document.querySelector('.app-layout');

  if (!dom.appLayout) {
    return;
  }

  // 获取初始宽度
  if (dom.leftSidebar) {
    state.startWidth.left = state.currentWidth.left =
      dom.leftSidebar.offsetWidth || SIDEBAR_DEFAULT_WIDTH;
  }
  if (dom.rightSidebar) {
    state.startWidth.right = state.currentWidth.right =
      dom.rightSidebar.offsetWidth || SIDEBAR_RIGHT_DEFAULT_WIDTH;
  }

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
}

// 启动
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
