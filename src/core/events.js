/**
 * Application Event Names Constants
 */

export const EVENTS = {
  // Document Events
  DOC_LOADED: 'doc:loaded',
  DOC_UPDATED: 'doc:updated',
  DOC_SAVED: 'doc:saved',
  DOC_CREATED: 'doc:created',
  DOC_DELETED: 'doc:deleted',
  DOC_RENAMED: 'doc:renamed',
  DOC_MOVED: 'doc:moved',

  // Folder Events
  FOLDER_CREATED: 'folder:created',
  FOLDER_RENAMED: 'folder:renamed',
  FOLDER_DELETED: 'folder:deleted',

  // Navigation & Tabs
  TAB_OPENED: 'tab:opened',
  TAB_CLOSED: 'tab:closed',
  ACTIVE_DOC_CHANGED: 'doc:active_changed',

  // UI State
  THEME_CHANGED: 'ui:theme_changed',
  VIEW_MODE_CHANGED: 'ui:view_mode_changed',
  SIDEBAR_TOGGLED: 'ui:sidebar_toggled',

  // Overlays
  OPEN_COMMAND_PALETTE: 'ui:open_command_palette',
  OPEN_SEARCH_MODAL: 'ui:open_search_modal',
  OPEN_SHORTCUTS_MODAL: 'ui:open_shortcuts_modal',

  // Editor
  CURSOR_POSITION_CHANGED: 'editor:cursor_changed',
  FORMAT_ACTION: 'editor:format_action',

  // Notifications
  TOAST: 'notification:toast'
};
