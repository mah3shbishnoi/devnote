/**
 * Keyboard Shortcuts Reference Modal Component
 */

import { state } from '../../core/state.js';
import { EVENTS } from '../../core/events.js';
import { getIcon } from '../../utils/icons.js';
import { getModKeyLabel } from '../../core/shortcuts.js';

export function initShortcutsModal() {
  state.on(EVENTS.OPEN_SHORTCUTS_MODAL, () => {
    openShortcutsModal();
  });
}

export function openShortcutsModal() {
  let overlay = document.getElementById('shortcuts-modal-overlay');
  const mod = getModKeyLabel();

  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'shortcuts-modal-overlay';
    overlay.className = 'modal-overlay';

    overlay.innerHTML = `
      <div class="modal-card modal-card-md" role="dialog" aria-modal="true" aria-labelledby="shortcuts-title">
        <div class="modal-header">
          <div class="flex-row-center gap-sm">
            <span class="text-muted">${getIcon('helpCircle')}</span>
            <h3 id="shortcuts-title" class="modal-title">Keyboard Shortcuts</h3>
          </div>
          <button class="btn-icon modal-close-btn" aria-label="Close">${getIcon('x')}</button>
        </div>
        <div class="modal-body modal-scrollable">
          <div class="shortcuts-grid">
            <div class="shortcut-group">
              <h4 class="shortcut-group-title">Navigation & Commands</h4>
              <div class="shortcut-row">
                <span class="shortcut-label">Command Palette</span>
                <div class="shortcut-keys"><kbd>${mod}</kbd><kbd>K</kbd></div>
              </div>
              <div class="shortcut-row">
                <span class="shortcut-label">Quick File Search</span>
                <div class="shortcut-keys"><kbd>${mod}</kbd><kbd>P</kbd></div>
              </div>
              <div class="shortcut-row">
                <span class="shortcut-label">Toggle Sidebar</span>
                <div class="shortcut-keys"><kbd>${mod}</kbd><kbd>\\</kbd></div>
              </div>
              <div class="shortcut-row">
                <span class="shortcut-label">Keyboard Shortcuts Cheat Sheet</span>
                <div class="shortcut-keys"><kbd>?</kbd></div>
              </div>
              <div class="shortcut-row">
                <span class="shortcut-label">Dismiss Modal / Palette</span>
                <div class="shortcut-keys"><kbd>Esc</kbd></div>
              </div>
            </div>

            <div class="shortcut-group">
              <h4 class="shortcut-group-title">Document Management</h4>
              <div class="shortcut-row">
                <span class="shortcut-label">New Document</span>
                <div class="shortcut-keys"><kbd>${mod}</kbd><kbd>N</kbd></div>
              </div>
              <div class="shortcut-row">
                <span class="shortcut-label">Save Document</span>
                <div class="shortcut-keys"><kbd>${mod}</kbd><kbd>S</kbd></div>
              </div>
            </div>

            <div class="shortcut-group">
              <h4 class="shortcut-group-title">Editor Formatting</h4>
              <div class="shortcut-row">
                <span class="shortcut-label">Toggle Bold Selection</span>
                <div class="shortcut-keys"><kbd>${mod}</kbd><kbd>B</kbd></div>
              </div>
              <div class="shortcut-row">
                <span class="shortcut-label">Toggle Italic Selection</span>
                <div class="shortcut-keys"><kbd>${mod}</kbd><kbd>I</kbd></div>
              </div>
              <div class="shortcut-row">
                <span class="shortcut-label">Indent / Tab Spacing (2 spaces)</span>
                <div class="shortcut-keys"><kbd>Tab</kbd></div>
              </div>
              <div class="shortcut-row">
                <span class="shortcut-label">Outdent Lines</span>
                <div class="shortcut-keys"><kbd>Shift</kbd><kbd>Tab</kbd></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const closeButtons = overlay.querySelectorAll('.modal-close-btn');
    closeButtons.forEach(btn => {
      btn.onclick = () => overlay.classList.add('hidden');
    });

    overlay.onclick = (e) => {
      if (e.target === overlay) overlay.classList.add('hidden');
    };
  }

  overlay.classList.remove('hidden');
}
