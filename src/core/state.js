/**
 * Centralized Application State Management & Event Bus for DevNote
 */

import { EVENTS } from './events.js';
import * as db from '../storage/db.js';
import * as prefs from '../storage/preferences.js';

class StateStore {
  constructor() {
    this.events = new Map();
    this.documents = [];
    this.folders = [];
    this.activeDocId = null;
    this.openDocIds = [];
    this.unsavedDocIds = new Set();
    this.theme = prefs.getStoredTheme();
    this.viewMode = prefs.getStoredViewMode();
    this.sidebarCollapsed = prefs.getStoredSidebarCollapsed();
    this.cursorInfo = { line: 1, col: 1 };
    this.autoSaveTimeouts = new Map();
  }

  // Event bus methods
  on(event, listener) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event).add(listener);
    return () => this.off(event, listener);
  }

  off(event, listener) {
    if (this.events.has(event)) {
      this.events.get(event).delete(listener);
    }
  }

  emit(event, data) {
    if (this.events.has(event)) {
      for (const listener of this.events.get(event)) {
        try {
          listener(data);
        } catch (err) {
          console.error(`Error in event listener for ${event}:`, err);
        }
      }
    }
  }

  // Initialization
  async init() {
    this.folders = await db.getAllFolders();
    this.documents = await db.getAllDocuments();

    // Restore open tabs from preferences or default to first documents
    const savedTabs = prefs.getStoredOpenDocIds();
    if (Array.isArray(savedTabs) && savedTabs.length > 0) {
      // Keep only tabs that still exist in DB
      this.openDocIds = savedTabs.filter(id => this.documents.some(d => d.id === id));
    }

    // If no valid open tabs, open README or first document
    if (this.openDocIds.length === 0 && this.documents.length > 0) {
      const readme = this.documents.find(d => d.title.toLowerCase().includes('readme'));
      const initialDoc = readme || this.documents[0];
      this.openDocIds = [initialDoc.id];
    }

    // Restore active doc
    const savedActive = prefs.getStoredActiveDocId();
    if (savedActive && this.openDocIds.includes(savedActive)) {
      this.activeDocId = savedActive;
    } else {
      this.activeDocId = this.openDocIds[0] || null;
    }

    prefs.setStoredActiveDocId(this.activeDocId);
    prefs.setStoredOpenDocIds(this.openDocIds);

    // Apply initial theme to document body
    document.documentElement.dataset.theme = this.theme;

    return this;
  }

  // Document Getters
  getActiveDoc() {
    if (!this.activeDocId) return null;
    return this.documents.find(d => d.id === this.activeDocId) || null;
  }

  getDocument(id) {
    return this.documents.find(d => d.id === id) || null;
  }

  getFolder(id) {
    return this.folders.find(f => f.id === id) || null;
  }

  // Document Operations
  async setActiveDoc(id) {
    if (this.activeDocId === id) return;

    if (id && !this.openDocIds.includes(id)) {
      this.openDocIds.push(id);
      prefs.setStoredOpenDocIds(this.openDocIds);
      this.emit(EVENTS.TAB_OPENED, { id });
    }

    this.activeDocId = id;
    prefs.setStoredActiveDocId(id);
    const doc = this.getActiveDoc();
    this.emit(EVENTS.ACTIVE_DOC_CHANGED, { id, doc });
  }

  async openDocInTab(id) {
    if (!id) return;
    if (!this.openDocIds.includes(id)) {
      this.openDocIds.push(id);
      prefs.setStoredOpenDocIds(this.openDocIds);
      this.emit(EVENTS.TAB_OPENED, { id });
    }
    await this.setActiveDoc(id);
  }

  closeTab(id) {
    const idx = this.openDocIds.indexOf(id);
    if (idx === -1) return;

    this.openDocIds.splice(idx, 1);
    prefs.setStoredOpenDocIds(this.openDocIds);
    this.emit(EVENTS.TAB_CLOSED, { id });

    // If closed tab was active, activate next adjacent tab
    if (this.activeDocId === id) {
      if (this.openDocIds.length > 0) {
        const nextId = this.openDocIds[Math.min(idx, this.openDocIds.length - 1)];
        this.setActiveDoc(nextId);
      } else {
        this.setActiveDoc(null);
      }
    }
  }

  closeAllTabs() {
    this.openDocIds = [];
    prefs.setStoredOpenDocIds([]);
    this.setActiveDoc(null);
    this.emit(EVENTS.TAB_CLOSED, { all: true });
  }

  closeOtherTabs(keepId) {
    this.openDocIds = [keepId];
    prefs.setStoredOpenDocIds(this.openDocIds);
    this.setActiveDoc(keepId);
    this.emit(EVENTS.TAB_CLOSED, { keepId });
  }

  // Update content with auto-save debouncing
  updateDocContent(id, newContent, immediate = false) {
    const doc = this.getDocument(id);
    if (!doc) return;

    if (doc.content === newContent) return;

    doc.content = newContent;
    this.unsavedDocIds.add(id);

    this.emit(EVENTS.DOC_UPDATED, { doc, id, content: newContent });

    // Cancel existing debounce timer
    if (this.autoSaveTimeouts.has(id)) {
      clearTimeout(this.autoSaveTimeouts.get(id));
    }

    if (immediate) {
      this.saveDoc(id);
    } else {
      const timer = setTimeout(() => {
        this.saveDoc(id);
      }, 600); // 600ms debounce
      this.autoSaveTimeouts.set(id, timer);
    }
  }

  async saveDoc(id) {
    const doc = this.getDocument(id);
    if (!doc) return;

    try {
      const saved = await db.saveDocument(doc);
      // Update in memory array with new updatedAt
      doc.updatedAt = saved.updatedAt;
      this.unsavedDocIds.delete(id);
      this.emit(EVENTS.DOC_SAVED, { doc });
    } catch (err) {
      console.error('Failed to save document:', err);
      this.emit(EVENTS.TOAST, { message: 'Failed to save document to storage', type: 'error' });
    }
  }

  async createNewDocument({ title = 'untitled.md', folderId = null, content = '' }) {
    try {
      const newDoc = await db.createDocument({ title, folderId, content });
      this.documents.push(newDoc);
      this.emit(EVENTS.DOC_CREATED, { doc: newDoc });
      await this.openDocInTab(newDoc.id);
      this.emit(EVENTS.TOAST, { message: `Created "${newDoc.title}"`, type: 'success' });
      return newDoc;
    } catch (err) {
      console.error('Failed to create document:', err);
      this.emit(EVENTS.TOAST, { message: 'Could not create document', type: 'error' });
      throw err;
    }
  }

  async renameDocument(id, newTitle) {
    const doc = this.getDocument(id);
    if (!doc) return;

    const trimmed = newTitle.trim();
    if (!trimmed) return;
    const finalTitle = trimmed.endsWith('.md') ? trimmed : `${trimmed}.md`;

    doc.title = finalTitle;
    await db.saveDocument(doc);
    this.emit(EVENTS.DOC_RENAMED, { doc, id, title: finalTitle });
    this.emit(EVENTS.TOAST, { message: `Renamed to "${finalTitle}"`, type: 'info' });
  }

  async deleteDocument(id) {
    const doc = this.getDocument(id);
    if (!doc) return;

    try {
      await db.deleteDocument(id);
      this.documents = this.documents.filter(d => d.id !== id);
      this.closeTab(id);
      this.emit(EVENTS.DOC_DELETED, { id, title: doc.title });
      this.emit(EVENTS.TOAST, { message: `Deleted "${doc.title}"`, type: 'info' });
    } catch (err) {
      console.error('Failed to delete document:', err);
      this.emit(EVENTS.TOAST, { message: 'Could not delete document', type: 'error' });
    }
  }

  async duplicateDocument(id) {
    const original = this.getDocument(id);
    if (!original) return;

    const baseName = original.title.replace(/\.md$/, '');
    const newTitle = `${baseName}-copy.md`;

    return await this.createNewDocument({
      title: newTitle,
      folderId: original.folderId,
      content: original.content
    });
  }

  async moveDocument(id, targetFolderId) {
    const doc = this.getDocument(id);
    if (!doc) return;

    doc.folderId = targetFolderId;
    await db.saveDocument(doc);
    this.emit(EVENTS.DOC_MOVED, { doc, id, folderId: targetFolderId });
    const targetFolder = targetFolderId ? this.getFolder(targetFolderId)?.name : 'Root Workspace';
    this.emit(EVENTS.TOAST, { message: `Moved "${doc.title}" to ${targetFolder}`, type: 'info' });
  }

  // Folder Operations
  async createNewFolder({ name = 'New Folder', parentId = null }) {
    try {
      const newFolder = await db.createFolder({ name, parentId });
      this.folders.push(newFolder);
      this.emit(EVENTS.FOLDER_CREATED, { folder: newFolder });
      this.emit(EVENTS.TOAST, { message: `Created folder "${newFolder.name}"`, type: 'success' });
      return newFolder;
    } catch (err) {
      console.error('Failed to create folder:', err);
      this.emit(EVENTS.TOAST, { message: 'Could not create folder', type: 'error' });
      throw err;
    }
  }

  async renameFolder(id, newName) {
    const folder = this.getFolder(id);
    if (!folder) return;

    const trimmed = newName.trim();
    if (!trimmed) return;

    folder.name = trimmed;
    await db.updateFolder(id, { name: trimmed });
    this.emit(EVENTS.FOLDER_RENAMED, { folder, id, name: trimmed });
    this.emit(EVENTS.TOAST, { message: `Renamed folder to "${trimmed}"`, type: 'info' });
  }

  async deleteFolder(id) {
    const folder = this.getFolder(id);
    if (!folder) return;

    try {
      const result = await db.deleteFolderAndContents(id);
      this.folders = this.folders.filter(f => !result.deletedFolders.includes(f.id));
      this.documents = this.documents.filter(d => !result.deletedDocs.includes(d.id));

      for (const docId of result.deletedDocs) {
        this.closeTab(docId);
      }

      this.emit(EVENTS.FOLDER_DELETED, { id, name: folder.name, result });
      this.emit(EVENTS.TOAST, { message: `Deleted folder "${folder.name}"`, type: 'info' });
    } catch (err) {
      console.error('Failed to delete folder:', err);
      this.emit(EVENTS.TOAST, { message: 'Could not delete folder', type: 'error' });
    }
  }

  // UI Preference Setters
  setTheme(theme) {
    this.theme = theme;
    prefs.setStoredTheme(theme);
    document.documentElement.dataset.theme = theme;
    this.emit(EVENTS.THEME_CHANGED, { theme });
  }

  toggleTheme() {
    const nextTheme = this.theme === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
    this.emit(EVENTS.TOAST, { message: `Switched to ${nextTheme} theme`, type: 'info' });
  }

  setViewMode(mode) {
    if (!['split', 'editor', 'preview'].includes(mode)) return;
    this.viewMode = mode;
    prefs.setStoredViewMode(mode);
    this.emit(EVENTS.VIEW_MODE_CHANGED, { mode });
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    prefs.setStoredSidebarCollapsed(this.sidebarCollapsed);
    this.emit(EVENTS.SIDEBAR_TOGGLED, { collapsed: this.sidebarCollapsed });
  }

  setCursorInfo(line, col) {
    this.cursorInfo = { line, col };
    this.emit(EVENTS.CURSOR_POSITION_CHANGED, this.cursorInfo);
  }
}

export const state = new StateStore();
