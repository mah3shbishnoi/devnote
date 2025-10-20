/**
 * Global Document Full-Text Search Modal (Cmd/Ctrl + P)
 */

import { state } from '../../core/state.js';
import { EVENTS } from '../../core/events.js';
import { getIcon } from '../../utils/icons.js';
import { escapeHtml } from '../../utils/dom.js';

export class SearchModalComponent {
  constructor() {
    this.overlay = null;
    this.input = null;
    this.resultsList = null;
    this.selectedIndex = 0;
    this.results = [];

    this.init();
  }

  init() {
    state.on(EVENTS.OPEN_SEARCH_MODAL, () => this.open());
  }

  open() {
    if (!this.overlay) {
      this.createModal();
    }
    this.overlay.classList.remove('hidden');
    this.input.value = '';
    this.selectedIndex = 0;
    this.search('');
    this.input.focus();
  }

  close() {
    if (this.overlay) {
      this.overlay.classList.add('hidden');
    }
  }

  createModal() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
    this.overlay.id = 'search-modal-overlay';

    this.overlay.innerHTML = `
      <div class="palette-card" role="dialog" aria-modal="true">
        <div class="palette-input-wrapper">
          <span class="palette-search-icon">${getIcon('search')}</span>
          <input type="text" class="palette-input" placeholder="Search document titles or contents..." autocomplete="off" />
          <span class="palette-badge">ESC to close</span>
        </div>
        <div class="palette-results-list" id="search-results"></div>
        <div class="palette-footer">
          <div class="palette-footer-item">
            <kbd>↑</kbd><kbd>↓</kbd> <span>Navigate</span>
          </div>
          <div class="palette-footer-item">
            <kbd>↵</kbd> <span>Open</span>
          </div>
          <div class="palette-footer-item">
            <kbd>ESC</kbd> <span>Dismiss</span>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.overlay);

    this.input = this.overlay.querySelector('.palette-input');
    this.resultsList = this.overlay.querySelector('#search-results');

    this.overlay.onclick = (e) => {
      if (e.target === this.overlay) this.close();
    };

    let debounceTimer = null;
    this.input.oninput = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        this.selectedIndex = 0;
        this.search(this.input.value);
      }, 100);
    };

    this.input.onkeydown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (this.results.length > 0) {
          this.selectedIndex = (this.selectedIndex + 1) % this.results.length;
          this.renderResults();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (this.results.length > 0) {
          this.selectedIndex = (this.selectedIndex - 1 + this.results.length) % this.results.length;
          this.renderResults();
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (this.results[this.selectedIndex]) {
          const res = this.results[this.selectedIndex];
          this.close();
          state.openDocInTab(res.doc.id);
        }
      } else if (e.key === 'Escape') {
        this.close();
      }
    };
  }

  search(query) {
    const q = query.toLowerCase().trim();
    const docs = state.documents;

    if (!q) {
      // Show recently modified docs
      this.results = docs.slice(0, 10).map(doc => ({
        doc,
        matchType: 'recent',
        snippet: ''
      }));
    } else {
      const matched = [];

      for (const doc of docs) {
        const titleMatch = doc.title.toLowerCase().includes(q);
        const content = doc.content || '';
        const contentLower = content.toLowerCase();
        const contentMatchIndex = contentLower.indexOf(q);

        if (titleMatch || contentMatchIndex !== -1) {
          let snippet = '';
          if (contentMatchIndex !== -1) {
            const start = Math.max(0, contentMatchIndex - 40);
            const end = Math.min(content.length, contentMatchIndex + q.length + 60);
            const rawSnippet = content.substring(start, end).replace(/\n/g, ' ');
            snippet = (start > 0 ? '…' : '') + rawSnippet + (end < content.length ? '…' : '');
          }

          matched.push({
            doc,
            matchType: titleMatch ? 'title' : 'content',
            snippet
          });
        }
      }

      this.results = matched;
    }

    this.renderResults();
  }

  renderResults() {
    this.resultsList.innerHTML = '';

    if (this.results.length === 0) {
      this.resultsList.innerHTML = `
        <div class="palette-empty">No documents match your search.</div>
      `;
      return;
    }

    this.results.forEach((item, idx) => {
      const isSelected = idx === this.selectedIndex;
      const el = document.createElement('div');
      el.className = `palette-item search-result-item ${isSelected ? 'palette-item-selected' : ''}`;

      const folder = item.doc.folderId ? state.getFolder(item.doc.folderId)?.name : 'Root';

      el.innerHTML = `
        <div class="search-item-header">
          <div class="flex-row-center gap-xs">
            <span class="palette-item-icon">${getIcon('file')}</span>
            <span class="palette-item-title">${escapeHtml(item.doc.title)}</span>
          </div>
          <span class="search-folder-badge">${escapeHtml(folder)}</span>
        </div>
        ${item.snippet ? `<div class="search-snippet">${escapeHtml(item.snippet)}</div>` : ''}
      `;

      el.onclick = () => {
        this.close();
        state.openDocInTab(item.doc.id);
      };

      this.resultsList.appendChild(el);
    });

    const activeItem = this.resultsList.querySelector('.palette-item-selected');
    if (activeItem) {
      activeItem.scrollIntoView({ block: 'nearest' });
    }
  }
}
