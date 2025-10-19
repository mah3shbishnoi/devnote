/**
 * Workspace Bottom Status Bar Component
 */

import { state } from '../../core/state.js';
import { EVENTS } from '../../core/events.js';
import { calculateDocumentStats } from '../../utils/stats.js';

export class StatusBarComponent {
  constructor(element) {
    this.element = element;
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
  }

  bindEvents() {
    state.on(EVENTS.ACTIVE_DOC_CHANGED, () => this.update());
    state.on(EVENTS.DOC_UPDATED, () => this.update());
    state.on(EVENTS.DOC_SAVED, () => this.update());
    state.on(EVENTS.CURSOR_POSITION_CHANGED, () => this.updateCursor());
  }

  render() {
    this.element.innerHTML = `
      <div class="statusbar-left">
        <div class="statusbar-item statusbar-engine" title="Client-Side IndexedDB Storage">
          <span class="status-indicator"></span>
          <span>IndexedDB Local</span>
        </div>
        <div class="statusbar-separator"></div>
        <div class="statusbar-item" id="status-cursor">Ln 1, Col 1</div>
      </div>

      <div class="statusbar-right">
        <div class="statusbar-item" id="status-stats">0 words • 0 chars • 0 min read</div>
        <div class="statusbar-separator"></div>
        <div class="statusbar-item" id="status-sync">Synced</div>
      </div>
    `;

    this.update();
  }

  update() {
    const doc = state.getActiveDoc();
    const statsEl = this.element.querySelector('#status-stats');
    const syncEl = this.element.querySelector('#status-sync');

    if (!doc) {
      if (statsEl) statsEl.textContent = 'No document selected';
      if (syncEl) syncEl.textContent = 'Idle';
      return;
    }

    const stats = calculateDocumentStats(doc.content || '');
    if (statsEl) {
      statsEl.textContent = `${stats.words} words • ${stats.characters} chars • ${stats.readingTime}`;
    }

    if (syncEl) {
      const isDirty = state.unsavedDocIds.has(doc.id);
      if (isDirty) {
        syncEl.innerHTML = '<span class="text-warning">Saving…</span>';
      } else {
        syncEl.innerHTML = '<span class="text-success">Saved</span>';
      }
    }
  }

  updateCursor() {
    const cursorEl = this.element.querySelector('#status-cursor');
    if (cursorEl) {
      cursorEl.textContent = `Ln ${state.cursorInfo.line}, Col ${state.cursorInfo.col}`;
    }
  }
}
