/**
 * Global Keyboard Shortcuts Manager
 * Handles hotkeys across the workspace and modal dispatching
 */

import { state } from './state.js';
import { EVENTS } from './events.js';

export function isMac() {
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
}

export function getModKeyLabel() {
  return isMac() ? '⌘' : 'Ctrl';
}

export function getAltKeyLabel() {
  return isMac() ? '⌥' : 'Alt';
}

export function initKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    const isMeta = isMac() ? e.metaKey : e.ctrlKey;

    // Escape closes overlays
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.modal-overlay:not(.hidden)');
      const contextMenu = document.querySelector('.context-menu');
      if (contextMenu) {
        contextMenu.remove();
        return;
      }
      if (activeModal) {
        activeModal.classList.add('hidden');
        return;
      }
    }

    // Question mark (?) for shortcuts cheat sheet if not typing in editor
    if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const activeEl = document.activeElement;
      const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable);
      if (!isInput) {
        e.preventDefault();
        state.emit(EVENTS.OPEN_SHORTCUTS_MODAL);
        return;
      }
    }

    // Cmd/Ctrl + K -> Command Palette
    if (isMeta && e.key.toLowerCase() === 'k' && !e.shiftKey) {
      e.preventDefault();
      state.emit(EVENTS.OPEN_COMMAND_PALETTE);
      return;
    }

    // Cmd/Ctrl + P or Cmd/Ctrl + Shift + P
    if (isMeta && e.key.toLowerCase() === 'p') {
      e.preventDefault();
      if (e.shiftKey) {
        // Alternative Command Palette
        state.emit(EVENTS.OPEN_COMMAND_PALETTE);
      } else {
        // Quick File Search
        state.emit(EVENTS.OPEN_SEARCH_MODAL);
      }
      return;
    }

    // Cmd/Ctrl + S -> Force Save
    if (isMeta && e.key.toLowerCase() === 's') {
      e.preventDefault();
      if (state.activeDocId) {
        state.saveDoc(state.activeDocId);
        state.emit(EVENTS.TOAST, { message: 'Document saved to storage', type: 'success' });
      }
      return;
    }

    // Alt + N (Option + N on Mac) -> New Document
    if (e.altKey && e.key.toLowerCase() === 'n' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
      e.preventDefault();
      state.createNewDocument({ title: 'untitled.md' });
      return;
    }

    // Cmd/Ctrl + B -> Bold (if inside editor)
    if (isMeta && e.key.toLowerCase() === 'b') {
      const editorTextarea = document.getElementById('markdown-editor-textarea');
      if (document.activeElement === editorTextarea) {
        e.preventDefault();
        state.emit(EVENTS.FORMAT_ACTION, { action: 'bold' });
        return;
      }
    }

    // Cmd/Ctrl + I -> Italic (if inside editor)
    if (isMeta && e.key.toLowerCase() === 'i') {
      const editorTextarea = document.getElementById('markdown-editor-textarea');
      if (document.activeElement === editorTextarea) {
        e.preventDefault();
        state.emit(EVENTS.FORMAT_ACTION, { action: 'italic' });
        return;
      }
    }

    // Cmd/Ctrl + \ -> Toggle Sidebar
    if (isMeta && e.key === '\\') {
      e.preventDefault();
      state.toggleSidebar();
      return;
    }
  });
}
