/**
 * @fileoverview 应用状态管理工具
 * 提供 LocalStorage 封装和状态管理
 */

import {
  STORAGE_KEY_NAV_OPEN,
  STORAGE_KEY_FOLDER_STATE,
  STORAGE_KEY_GRAPH_DEPTH,
  STORAGE_KEY_SEARCH_INDEX,
  GRAPH_DEPTH_DEFAULT,
} from '../constants.js';

/**
 * LocalStorage 封装类
 * 提供安全的存储访问
 */
export class StorageManager {
  /**
   * 从 LocalStorage 读取值
   * @param {string} key - 存储键名
   * @param {*} defaultValue - 默认值
   * @returns {*} 存储的值或默认值
   */
  static get(key, defaultValue = null) {
    try {
      const value = localStorage.getItem(key);
      if (value === null) {
        return defaultValue;
      }
      return JSON.parse(value);
    } catch (e) {
      console.warn(`Failed to read from localStorage (${key}):`, e);
      return defaultValue;
    }
  }

  /**
   * 保存值到 LocalStorage
   * @param {string} key - 存储键名
   * @param {*} value - 要存储的值
   */
  static set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`Failed to write to localStorage (${key}):`, e);
    }
  }

  /**
   * 从 LocalStorage 删除值
   * @param {string} key - 存储键名
   */
  static remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`Failed to remove from localStorage (${key}):`, e);
    }
  }
}

/**
 * 应用状态管理
 * 使用 StorageManager 持久化状态
 */
export const appState = {
  /**
   * 获取导航栏开关状态
   * @returns {boolean} 导航栏是否打开
   */
  getNavOpen() {
    return StorageManager.get(STORAGE_KEY_NAV_OPEN, true);
  },

  /**
   * 保存导航栏开关状态
   * @param {boolean} isOpen - 导航栏是否打开
   */
  setNavOpen(isOpen) {
    StorageManager.set(STORAGE_KEY_NAV_OPEN, isOpen);
  },

  /**
   * 切换导航栏开关状态
   * @returns {boolean} 新的状态
   */
  toggleNavOpen() {
    const newState = !this.getNavOpen();
    this.setNavOpen(newState);
    return newState;
  },

  /**
   * 获取文件夹展开状态
   * @param {string} folderPath - 文件夹路径
   * @returns {boolean} 文件夹是否展开
   */
  getFolderOpen(folderPath) {
    return StorageManager.get(STORAGE_KEY_FOLDER_STATE + folderPath, false);
  },

  /**
   * 保存文件夹展开状态
   * @param {string} folderPath - 文件夹路径
   * @param {boolean} isOpen - 文件夹是否展开
   */
  setFolderOpen(folderPath, isOpen) {
    StorageManager.set(STORAGE_KEY_FOLDER_STATE + folderPath, isOpen);
  },

  /**
   * 获取图谱深度
   * @returns {number} 图谱深度
   */
  getGraphDepth() {
    return StorageManager.get(STORAGE_KEY_GRAPH_DEPTH, GRAPH_DEPTH_DEFAULT);
  },

  /**
   * 保存图谱深度
   * @param {number} depth - 图谱深度
   */
  setGraphDepth(depth) {
    StorageManager.set(STORAGE_KEY_GRAPH_DEPTH, depth);
  },

  /**
   * 获取搜索索引缓存
   * @returns {*} 搜索索引或 null
   */
  getSearchIndex() {
    return StorageManager.get(STORAGE_KEY_SEARCH_INDEX, null);
  },

  /**
   * 保存搜索索引缓存
   * @param {*} index - 搜索索引
   */
  setSearchIndex(index) {
    StorageManager.set(STORAGE_KEY_SEARCH_INDEX, index);
  },
};

export default appState;
