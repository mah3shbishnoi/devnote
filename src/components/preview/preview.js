/**
 * Markdown Documentation Preview Pane Component
 */

import { state } from '../../core/state.js';
import { EVENTS } from '../../core/events.js';
import { getIcon } from '../../utils/icons.js';
import { renderMarkdownToHtml } from './markdown.js';

export class PreviewComponent {
  constructor(element) {
    this.element = element;
    this.previewBody = null;
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
  }

  bindEvents() {
    state.on(EVENTS.ACTIVE_DOC_CHANGED, () => this.updatePreview());
    state.on(EVENTS.DOC_UPDATED, ({ id }) => {
      if (id === state.activeDocId) {
        this.updatePreview();
      }
    });
  }

  render() {
    const activeDoc = state.getActiveDoc();

    if (!activeDoc) {
      this.element.innerHTML = `
        <div class="preview-empty-state">
          <div class="empty-state-content">
            <span class="empty-icon">${getIcon('eye')}</span>
            <h3 class="empty-title">Preview Inactive</h3>
            <p class="empty-desc">Open a documentation file to see the formatted output.</p>
          </div>
        </div>
      `;
      return;
    }

    this.element.innerHTML = `
      <div class="preview-header">
        <div class="preview-title-row">
          <span class="preview-badge">DOCS PREVIEW</span>
          <span class="preview-doc-title">${activeDoc.title}</span>
        </div>
      </div>
      <div class="preview-pane-body markdown-rendered" id="preview-body"></div>
    `;

    this.previewBody = this.element.querySelector('#preview-body');
    this.updatePreview();
    this.bindInteractiveHandlers();
  }

  updatePreview() {
    const activeDoc = state.getActiveDoc();
    if (!activeDoc) {
      this.render();
      return;
    }

    if (!this.previewBody) {
      this.render();
      return;
    }

    const titleEl = this.element.querySelector('.preview-doc-title');
    if (titleEl) {
      titleEl.textContent = activeDoc.title;
    }

    const html = renderMarkdownToHtml(activeDoc.content || '');
    this.previewBody.innerHTML = html;
  }

  bindInteractiveHandlers() {
    this.element.addEventListener('click', async (e) => {
      // 1. Copy Code Block Handler
      const copyBtn = e.target.closest('.code-copy-btn');
      if (copyBtn) {
        const rawCode = decodeURIComponent(copyBtn.dataset.code || '');
        try {
          await navigator.clipboard.writeText(rawCode);
          const textSpan = copyBtn.querySelector('.copy-text');
          const originalText = textSpan.textContent;
          textSpan.textContent = 'Copied!';
          copyBtn.classList.add('copy-success');

          setTimeout(() => {
            textSpan.textContent = originalText;
            copyBtn.classList.remove('copy-success');
          }, 2000);
        } catch (err) {
          console.error('Failed to copy to clipboard:', err);
        }
        return;
      }

      // 2. Interactive Task List Checkbox Click
      const taskCheckbox = e.target.closest('.task-checkbox');
      if (taskCheckbox) {
        const activeDoc = state.getActiveDoc();
        if (!activeDoc) return;

        const taskIndex = parseInt(taskCheckbox.dataset.taskIndex, 10);
        if (isNaN(taskIndex)) return;

        this.toggleMarkdownCheckbox(activeDoc, taskIndex, taskCheckbox.checked);
      }
    });
  }

  toggleMarkdownCheckbox(doc, taskIndex, isChecked) {
    const lines = doc.content.split('\n');
    let currentIndex = 0;
    let modified = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const taskMatch = line.match(/^(\s*[-*+]\s+\[)( |x|X)(\]\s+.*)$/);
      if (taskMatch) {
        if (currentIndex === taskIndex) {
          const newStatus = isChecked ? 'x' : ' ';
          lines[i] = `${taskMatch[1]}${newStatus}${taskMatch[3]}`;
          modified = true;
          break;
        }
        currentIndex++;
      }
    }

    if (modified) {
      const updatedContent = lines.join('\n');
      state.updateDocContent(doc.id, updatedContent, true);
    }
  }
}
