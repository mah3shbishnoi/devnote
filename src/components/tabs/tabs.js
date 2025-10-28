/**
 * Document Tabs Bar Component
 */

import { state } from '../../core/state.js';
import { EVENTS } from '../../core/events.js';
import { getIcon } from '../../utils/icons.js';
import { getAltKeyLabel } from '../../core/shortcuts.js';

export class TabsComponent {
  constructor(element) {
    this.element = element;
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
  }

  bindEvents() {
    state.on(EVENTS.TAB_OPENED, () => this.render());
    state.on(EVENTS.TAB_CLOSED, () => this.render());
    state.on(EVENTS.ACTIVE_DOC_CHANGED, () => this.render());
    state.on(EVENTS.DOC_RENAMED, () => this.render());
    state.on(EVENTS.DOC_UPDATED, () => this.updateDirtyIndicators());
    state.on(EVENTS.DOC_SAVED, () => this.updateDirtyIndicators());
  }

  render() {
    this.element.innerHTML = '';

    const list = document.createElement('div');
    list.className = 'tabs-list';

    for (const docId of state.openDocIds) {
      const doc = state.getDocument(docId);
      if (!doc) continue;

      const isActive = state.activeDocId === docId;
      const isDirty = state.unsavedDocIds.has(docId);

      const tab = document.createElement('div');
      tab.className = `tab-item ${isActive ? 'tab-item-active' : ''}`;
      tab.dataset.docId = docId;

      tab.innerHTML = `
        <span class="tab-icon">${getIcon('file')}</span>
        <span class="tab-title">${doc.title}</span>
        <span class="tab-dirty-indicator ${isDirty ? 'is-dirty' : ''}"></span>
        <button class="tab-close-btn" title="Close Tab" aria-label="Close Tab">
          ${getIcon('x')}
        </button>
      `;

      tab.onclick = (e) => {
        if (e.target.closest('.tab-close-btn')) return;
        state.setActiveDoc(docId);
      };

      const closeBtn = tab.querySelector('.tab-close-btn');
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        state.closeTab(docId);
      };

      tab.onauxclick = (e) => {
        if (e.button === 1) {
          e.preventDefault();
          state.closeTab(docId);
        }
      };

      list.appendChild(tab);
    }

    const newTabBtn = document.createElement('button');
    const altMod = getAltKeyLabel();
    newTabBtn.className = 'tab-new-btn';
    newTabBtn.title = `New Document (${altMod}+N)`;
    newTabBtn.innerHTML = getIcon('plus');
    newTabBtn.onclick = () => {
      state.createNewDocument({ title: 'untitled.md' });
    };

    this.element.appendChild(list);
    this.element.appendChild(newTabBtn);
  }

  updateDirtyIndicators() {
    const tabs = this.element.querySelectorAll('.tab-item');
    tabs.forEach(tab => {
      const docId = tab.dataset.docId;
      const indicator = tab.querySelector('.tab-dirty-indicator');
      if (indicator) {
        if (state.unsavedDocIds.has(docId)) {
          indicator.classList.add('is-dirty');
        } else {
          indicator.classList.remove('is-dirty');
        }
      }
    });
  }
}
