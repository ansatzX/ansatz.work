/**
 * @fileoverview Draggable sidebar with collapse support.
 * Uses CSS class toggling for grid layout state transitions.
 */

const SIDEBAR_MIN_WIDTH = 180;
const SIDEBAR_DEFAULT_WIDTH = 280;
const SIDEBAR_RIGHT_DEFAULT_WIDTH = 380;
const STORAGE_KEY_SIDEBAR_LEFT_WIDTH = "dg-sidebar-left-width";
const STORAGE_KEY_SIDEBAR_RIGHT_WIDTH = "dg-sidebar-right-width";
const STORAGE_KEY_SIDEBAR_LEFT_COLLAPSED = "dg-sidebar-left-collapsed";
const STORAGE_KEY_SIDEBAR_RIGHT_COLLAPSED = "dg-sidebar-right-collapsed";
const STORAGE_KEY_LAYOUT_VERSION = "dg-sidebar-layout-version";
const CURRENT_LAYOUT_VERSION = "2";

const CONFIG = {
  minWidth: SIDEBAR_MIN_WIDTH,
  maxWidth: 400,
  collapseThreshold: 50,
};

const state = {
  dragging: null,
  startX: 0,
  startWidth: { left: SIDEBAR_DEFAULT_WIDTH, right: SIDEBAR_RIGHT_DEFAULT_WIDTH },
  currentWidth: { left: SIDEBAR_DEFAULT_WIDTH, right: SIDEBAR_RIGHT_DEFAULT_WIDTH },
  collapsed: { left: false, right: false },
  rafId: null,
  pendingDelta: null,
};

const dom = {
  leftSidebar: null,
  rightSidebar: null,
  appLayout: null,
};

function cleanup() {
  document
    .querySelectorAll(
      ".drag-handle, .toggle-btn, .handle-left, .handle-right, " +
        ".btn-left, .btn-right, .resize-handle, .sidebar-toggle-btn",
    )
    .forEach((el) => el.remove());
}

function loadState() {
  try {
    const storedVersion = localStorage.getItem(STORAGE_KEY_LAYOUT_VERSION);
    if (storedVersion !== CURRENT_LAYOUT_VERSION) {
      localStorage.removeItem(STORAGE_KEY_SIDEBAR_LEFT_WIDTH);
      localStorage.removeItem(STORAGE_KEY_SIDEBAR_RIGHT_WIDTH);
      localStorage.removeItem(STORAGE_KEY_SIDEBAR_LEFT_COLLAPSED);
      localStorage.removeItem(STORAGE_KEY_SIDEBAR_RIGHT_COLLAPSED);
      localStorage.removeItem("sidebar-cssclass-v1");
      localStorage.setItem(STORAGE_KEY_LAYOUT_VERSION, CURRENT_LAYOUT_VERSION);
      state.currentWidth.left = SIDEBAR_DEFAULT_WIDTH;
      state.currentWidth.right = SIDEBAR_RIGHT_DEFAULT_WIDTH;
      return;
    }

    const loadSidebar = (side, widthKey, collapsedKey, defaultWidth) => {
      const width = localStorage.getItem(widthKey);
      const collapsed = localStorage.getItem(collapsedKey);
      state.currentWidth[side] = width !== null ? parseInt(width, 10) : defaultWidth;
      if (collapsed !== null) {
        state.collapsed[side] = collapsed === "true";
      }
    };

    loadSidebar("left", STORAGE_KEY_SIDEBAR_LEFT_WIDTH, STORAGE_KEY_SIDEBAR_LEFT_COLLAPSED, SIDEBAR_DEFAULT_WIDTH);
    loadSidebar("right", STORAGE_KEY_SIDEBAR_RIGHT_WIDTH, STORAGE_KEY_SIDEBAR_RIGHT_COLLAPSED, SIDEBAR_RIGHT_DEFAULT_WIDTH);
  } catch (_) {
    /* silent */
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY_SIDEBAR_LEFT_WIDTH, state.currentWidth.left.toString());
    localStorage.setItem(STORAGE_KEY_SIDEBAR_RIGHT_WIDTH, state.currentWidth.right.toString());
    localStorage.setItem(STORAGE_KEY_SIDEBAR_LEFT_COLLAPSED, state.collapsed.left.toString());
    localStorage.setItem(STORAGE_KEY_SIDEBAR_RIGHT_COLLAPSED, state.collapsed.right.toString());
  } catch (_) {
    /* silent */
  }
}

function applyState() {
  const root = document.documentElement;

  const applySidebarWidth = (sidebar, side) => {
    if (!sidebar) return;
    const cssVar = `--sidebar-${side}-width`;
    if (!state.collapsed[side]) {
      root.style.setProperty(cssVar, state.currentWidth[side] + "px");
    } else {
      root.style.removeProperty(cssVar);
    }
    sidebar.classList.toggle("sidebar-collapsed", state.collapsed[side]);
  };

  applySidebarWidth(dom.leftSidebar, "left");
  applySidebarWidth(dom.rightSidebar, "right");

  dom.appLayout.classList.toggle("sidebar-left-collapsed", state.collapsed.left);
  dom.appLayout.classList.toggle("sidebar-right-collapsed", state.collapsed.right);

  updateButtonIcons();
}

function createHandles() {
  if (dom.leftSidebar) {
    const handle = document.createElement("div");
    handle.className = "drag-handle handle-left";
    handle.addEventListener("mousedown", (e) => startDrag(e, "left"));
    handle.addEventListener("touchstart", (e) => startDrag(e, "left", e.touches[0].clientX), { passive: false });
    dom.appLayout.insertBefore(handle, dom.leftSidebar.nextSibling);
  }

  if (dom.rightSidebar) {
    const handle = document.createElement("div");
    handle.className = "drag-handle handle-right";
    handle.addEventListener("mousedown", (e) => startDrag(e, "right"));
    handle.addEventListener("touchstart", (e) => startDrag(e, "right", e.touches[0].clientX), { passive: false });
    dom.appLayout.insertBefore(handle, dom.rightSidebar);
  }
}

function createButtons() {
  if (dom.leftSidebar) {
    const btn = document.createElement("button");
    btn.className = "toggle-btn btn-left";
    btn.textContent = "\u2039";
    btn.title = "Toggle left sidebar";
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggle("left");
    });
    dom.leftSidebar.appendChild(btn);
  }

  if (dom.rightSidebar) {
    const btn = document.createElement("button");
    btn.className = "toggle-btn btn-right";
    btn.textContent = "\u203A";
    btn.title = "Toggle right sidebar";
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggle("right");
    });
    dom.rightSidebar.appendChild(btn);
  }
}

function updateButtonIcons() {
  if (dom.leftSidebar) {
    const btn = dom.leftSidebar.querySelector(".btn-left");
    if (btn) btn.textContent = state.collapsed.left ? "\u203A" : "\u2039";
  }
  if (dom.rightSidebar) {
    const btn = dom.rightSidebar.querySelector(".btn-right");
    if (btn) btn.textContent = state.collapsed.right ? "\u2039" : "\u203A";
  }
}

function startDrag(e, side, clientX) {
  e.preventDefault();
  state.dragging = side;
  state.startX = clientX;
  state.startWidth[side] = state.currentWidth[side];
  document.body.classList.add("dragging");
  document.addEventListener("mousemove", onDrag);
  document.addEventListener("mouseup", stopDrag);
  document.addEventListener("touchmove", onDragTouch, { passive: false });
  document.addEventListener("touchend", stopDrag);
}

function onDrag(e) {
  if (!state.dragging) return;
  scheduleDragUpdate(e.clientX);
}

function onDragTouch(e) {
  if (!state.dragging) return;
  e.preventDefault();
  scheduleDragUpdate(e.touches[0].clientX);
}

function scheduleDragUpdate(clientX) {
  let delta = clientX - state.startX;
  if (state.dragging === "right") delta = -delta;

  state.pendingDelta = delta;

  if (state.rafId === null) {
    state.rafId = requestAnimationFrame(() => {
      state.rafId = null;
      applyDragDelta(state.pendingDelta);
    });
  }
}

function applyDragDelta(delta) {
  const side = state.dragging;
  if (!side) return;

  const newWidth = state.startWidth[side] + delta;

  if (newWidth < CONFIG.collapseThreshold) {
    if (!state.collapsed[side]) {
      state.collapsed[side] = true;
      applyState();
      saveState();
    }
  } else {
    if (state.collapsed[side]) {
      state.collapsed[side] = false;
    }
    state.currentWidth[side] = Math.max(CONFIG.minWidth, Math.min(CONFIG.maxWidth, newWidth));
    applyState();
  }
}

function stopDrag() {
  if (!state.dragging) return;
  state.dragging = null;
  if (state.rafId !== null) {
    cancelAnimationFrame(state.rafId);
    state.rafId = null;
  }
  document.body.classList.remove("dragging");
  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", stopDrag);
  document.removeEventListener("touchmove", onDragTouch);
  document.removeEventListener("touchend", stopDrag);
  saveState();
}

function toggle(side) {
  state.collapsed[side] = !state.collapsed[side];
  applyState();
  saveState();
}

function init() {
  dom.leftSidebar = document.querySelector(".sidebar-left");
  dom.rightSidebar = document.querySelector(".sidebar-right");
  dom.appLayout = document.querySelector(".app-layout");

  if (!dom.appLayout) return;

  if (dom.leftSidebar) {
    state.startWidth.left = state.currentWidth.left =
      dom.leftSidebar.offsetWidth || SIDEBAR_DEFAULT_WIDTH;
  }
  if (dom.rightSidebar) {
    state.startWidth.right = state.currentWidth.right =
      dom.rightSidebar.offsetWidth || SIDEBAR_RIGHT_DEFAULT_WIDTH;
  }

  loadState();
  cleanup();
  createHandles();
  createButtons();
  applyState();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
