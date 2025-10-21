/**
 * DevNote Application Main Entry Point
 */

// Stylesheets
import './styles/tokens.css';
import './styles/typography.css';
import './styles/layout.css';
import './styles/navbar.css';
import './styles/sidebar.css';
import './styles/tabs.css';
import './styles/editor.css';
import './styles/preview.css';
import './styles/modals.css';
import './styles/toast.css';
import './styles/statusbar.css';
import './styles/mobile.css';

// Core State & Services
import { state } from './core/state.js';
import { EVENTS } from './core/events.js';
import { initKeyboardShortcuts } from './core/shortcuts.js';

// Components
import { NavbarComponent } from './components/navbar/navbar.js';
import { SidebarComponent } from './components/sidebar/sidebar.js';
import { TabsComponent } from './components/tabs/tabs.js';
import { EditorComponent } from './components/editor/editor.js';
import { PreviewComponent } from './components/preview/preview.js';
import { CommandPaletteComponent } from './components/palette/palette.js';
import { SearchModalComponent } from './components/search/search-modal.js';
import { StatusBarComponent } from './components/statusbar/statusbar.js';
import { initToastSystem } from './components/toast/toast.js';
import { initShortcutsModal } from './components/dialogs/shortcuts-modal.js';
import { initMobileFallback } from './components/mobile/mobile-fallback.js';

async function bootstrapApp() {
  try {
    // 1. Initialize IndexedDB & Central State
    await state.init();

    // 2. Initialize Overlay Services
    initToastSystem();
    initKeyboardShortcuts();
    initShortcutsModal();

    // 3. Mount UI Components
    const navbarEl = document.getElementById('app-navbar');
    const sidebarEl = document.getElementById('app-sidebar');
    const tabsEl = document.getElementById('workspace-tabs');
    const editorEl = document.getElementById('pane-editor');
    const previewEl = document.getElementById('pane-preview');
    const statusbarEl = document.getElementById('app-statusbar');
    const panesContainer = document.getElementById('workspace-panes');

    new NavbarComponent(navbarEl);
    new SidebarComponent(sidebarEl);
    new TabsComponent(tabsEl);
    new EditorComponent(editorEl);
    new PreviewComponent(previewEl);
    new StatusBarComponent(statusbarEl);
    new CommandPaletteComponent();
    new SearchModalComponent();

    // 4. Synchronize View Mode
    const updatePanesViewMode = () => {
      panesContainer.dataset.view = state.viewMode;
    };
    updatePanesViewMode();
    state.on(EVENTS.VIEW_MODE_CHANGED, updatePanesViewMode);

    // 5. Initialize Mobile Fallback Banner
    initMobileFallback();

    console.info('DevNote workspace initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize DevNote workspace:', err);
  }
}

// Start application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapApp);
} else {
  bootstrapApp();
}
