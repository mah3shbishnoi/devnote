/**
 * Top Navigation Bar Component
 */

import { state } from '../../core/state.js';
import { EVENTS } from '../../core/events.js';
import { getIcon } from '../../utils/icons.js';
import { getModKeyLabel } from '../../core/shortcuts.js';

export class NavbarComponent {
  constructor(element) {
    this.element = element;
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
    this.bindControls();
  }

  bindEvents() {
    state.on(EVENTS.ACTIVE_DOC_CHANGED, () => this.updateBreadcrumbs());
    state.on(EVENTS.DOC_RENAMED, () => this.updateBreadcrumbs());
    state.on(EVENTS.DOC_MOVED, () => this.updateBreadcrumbs());
    state.on(EVENTS.THEME_CHANGED, () => this.updateThemeButton());
    state.on(EVENTS.VIEW_MODE_CHANGED, () => this.updateViewModeButtons());
  }

  render() {
    const mod = getModKeyLabel();

    this.element.innerHTML = `
      <div class="navbar-left">
        <button class="btn-icon" id="navbar-sidebar-toggle" title="Toggle Sidebar (${mod}+\\)">
          ${getIcon('sidebar')}
        </button>

        <div class="navbar-brand">
          <span class="brand-icon">${getIcon('code')}</span>
          <span class="brand-text">DevNote</span>
        </div>

        <div class="navbar-breadcrumbs" id="navbar-breadcrumbs">
          <span class="breadcrumb-item breadcrumb-workspace">Workspace</span>
        </div>
      </div>

      <div class="navbar-center">
        <button class="navbar-search-btn" id="navbar-search-trigger" title="Search Documents (${mod}+P)">
          <span class="search-btn-icon">${getIcon('search')}</span>
          <span class="search-btn-text">Search documents...</span>
          <kbd class="navbar-kbd">${mod}P</kbd>
        </button>
      </div>

      <div class="navbar-right">
        <!-- View Mode Switcher -->
        <div class="view-mode-group">
          <button class="btn-icon btn-mode ${state.viewMode === 'editor' ? 'btn-mode-active' : ''}" data-mode="editor" title="Editor Only">
            ${getIcon('code')}
          </button>
          <button class="btn-icon btn-mode ${state.viewMode === 'split' ? 'btn-mode-active' : ''}" data-mode="split" title="Split View">
            ${getIcon('columns')}
          </button>
          <button class="btn-icon btn-mode ${state.viewMode === 'preview' ? 'btn-mode-active' : ''}" data-mode="preview" title="Preview Only">
            ${getIcon('eye')}
          </button>
        </div>

        <div class="navbar-separator"></div>

        <button class="btn-icon" id="navbar-palette-trigger" title="Command Palette (${mod}+K)">
          ${getIcon('command')}
        </button>

        <button class="btn-icon" id="navbar-theme-toggle" title="Toggle Theme">
          ${getIcon(state.theme === 'dark' ? 'sun' : 'moon')}
        </button>

        <button class="btn-icon" id="navbar-help-trigger" title="Keyboard Shortcuts (?)">
          ${getIcon('helpCircle')}
        </button>
      </div>
    `;

    this.updateBreadcrumbs();
  }

  bindControls() {
    // Sidebar toggle
    this.element.querySelector('#navbar-sidebar-toggle').onclick = () => {
      state.toggleSidebar();
    };

    // Search trigger
    this.element.querySelector('#navbar-search-trigger').onclick = () => {
      state.emit(EVENTS.OPEN_SEARCH_MODAL);
    };

    // Command palette trigger
    this.element.querySelector('#navbar-palette-trigger').onclick = () => {
      state.emit(EVENTS.OPEN_COMMAND_PALETTE);
    };

    // Theme toggle
    this.element.querySelector('#navbar-theme-toggle').onclick = () => {
      state.toggleTheme();
    };

    // Shortcuts help
    this.element.querySelector('#navbar-help-trigger').onclick = () => {
      state.emit(EVENTS.OPEN_SHORTCUTS_MODAL);
    };

    // View mode switchers
    this.element.querySelectorAll('.btn-mode').forEach(btn => {
      btn.onclick = () => {
        state.setViewMode(btn.dataset.mode);
      };
    });
  }

  updateBreadcrumbs() {
    const breadcrumbs = this.element.querySelector('#navbar-breadcrumbs');
    if (!breadcrumbs) return;

    const doc = state.getActiveDoc();
    if (!doc) {
      breadcrumbs.innerHTML = `
        <span class="breadcrumb-item breadcrumb-workspace">Workspace</span>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-item text-muted">No document</span>
      `;
      return;
    }

    const folder = doc.folderId ? state.getFolder(doc.folderId) : null;

    let html = `<span class="breadcrumb-item breadcrumb-workspace">Workspace</span>`;
    if (folder) {
      html += `
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-item breadcrumb-folder">${folder.name}</span>
      `;
    }
    html += `
      <span class="breadcrumb-separator">/</span>
      <span class="breadcrumb-item breadcrumb-active-doc">${doc.title}</span>
    `;

    breadcrumbs.innerHTML = html;
  }

  updateThemeButton() {
    const btn = this.element.querySelector('#navbar-theme-toggle');
    if (btn) {
      btn.innerHTML = getIcon(state.theme === 'dark' ? 'sun' : 'moon');
    }
  }

  updateViewModeButtons() {
    this.element.querySelectorAll('.btn-mode').forEach(btn => {
      if (btn.dataset.mode === state.viewMode) {
        btn.classList.add('btn-mode-active');
      } else {
        btn.classList.remove('btn-mode-active');
      }
    });
  }
}
