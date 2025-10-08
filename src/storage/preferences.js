/**
 * LocalStorage preferences manager for UI state
 * Manages theme, viewMode, sidebar collapse, and opened tabs
 */

const PREF_KEYS = {
  THEME: 'devnote_theme',
  VIEW_MODE: 'devnote_view_mode',
  SIDEBAR_COLLAPSED: 'devnote_sidebar_collapsed',
  ACTIVE_DOC_ID: 'devnote_active_doc_id',
  OPEN_DOC_IDS: 'devnote_open_doc_ids'
};

export function getStoredTheme() {
  const stored = localStorage.getItem(PREF_KEYS.THEME);
  if (stored === 'dark' || stored === 'light') return stored;
  // Respect system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  return 'dark';
}

export function setStoredTheme(theme) {
  localStorage.setItem(PREF_KEYS.THEME, theme);
}

export function getStoredViewMode() {
  const stored = localStorage.getItem(PREF_KEYS.VIEW_MODE);
  return (stored === 'editor' || stored === 'preview' || stored === 'split') ? stored : 'split';
}

export function setStoredViewMode(mode) {
  localStorage.setItem(PREF_KEYS.VIEW_MODE, mode);
}

export function getStoredSidebarCollapsed() {
  return localStorage.getItem(PREF_KEYS.SIDEBAR_COLLAPSED) === 'true';
}

export function setStoredSidebarCollapsed(collapsed) {
  localStorage.setItem(PREF_KEYS.SIDEBAR_COLLAPSED, String(collapsed));
}

export function getStoredActiveDocId() {
  return localStorage.getItem(PREF_KEYS.ACTIVE_DOC_ID) || null;
}

export function setStoredActiveDocId(id) {
  if (id) {
    localStorage.setItem(PREF_KEYS.ACTIVE_DOC_ID, id);
  } else {
    localStorage.removeItem(PREF_KEYS.ACTIVE_DOC_ID);
  }
}

export function getStoredOpenDocIds() {
  try {
    const raw = localStorage.getItem(PREF_KEYS.OPEN_DOC_IDS);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function setStoredOpenDocIds(ids) {
  localStorage.setItem(PREF_KEYS.OPEN_DOC_IDS, JSON.stringify(ids));
}
