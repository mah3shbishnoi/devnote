/**
 * Markdown Source Editor Component with Line Gutter
 */

import { state } from '../../core/state.js';
import { EVENTS } from '../../core/events.js';
import { getIcon } from '../../utils/icons.js';
import { EditorToolbarComponent } from './toolbar.js';

export class EditorComponent {
  constructor(element) {
    this.element = element;
    this.textarea = null;
    this.gutter = null;
    this.toolbar = null;
    this.isProgrammaticUpdate = false;

    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
  }

  bindEvents() {
    state.on(EVENTS.ACTIVE_DOC_CHANGED, () => {
      this.loadActiveDocument();
    });

    state.on(EVENTS.DOC_RENAMED, ({ doc }) => {
      if (state.activeDocId === doc.id) {
        const titleInput = this.element.querySelector('#editor-doc-title');
        if (titleInput && titleInput.value !== doc.title) {
          titleInput.value = doc.title;
        }
      }
    });

    // If doc was modified from elsewhere (e.g. interactive checklist click in preview)
    state.on(EVENTS.DOC_UPDATED, ({ id, content }) => {
      if (id === state.activeDocId && this.textarea && this.textarea.value !== content) {
        this.isProgrammaticUpdate = true;
        const selStart = this.textarea.selectionStart;
        const selEnd = this.textarea.selectionEnd;
        this.textarea.value = content;
        this.textarea.selectionStart = selStart;
        this.textarea.selectionEnd = selEnd;
        this.updateLineNumbers();
        this.isProgrammaticUpdate = false;
      }
    });
  }

  render() {
    const activeDoc = state.getActiveDoc();

    if (!activeDoc) {
      this.element.innerHTML = `
        <div class="editor-empty-state">
          <div class="empty-state-content">
            <span class="empty-icon">${getIcon('file')}</span>
            <h3 class="empty-title">No Document Selected</h3>
            <p class="empty-desc">Select a document from the sidebar or create a new file to start writing.</p>
            <button class="btn btn-primary" id="empty-create-btn">
              ${getIcon('plus')} New Document
            </button>
          </div>
        </div>
      `;

      const createBtn = this.element.querySelector('#empty-create-btn');
      if (createBtn) {
        createBtn.onclick = () => state.createNewDocument({ title: 'untitled.md' });
      }
      return;
    }

    this.element.innerHTML = `
      <div class="editor-header">
        <div class="editor-title-container">
          <span class="editor-doc-icon">${getIcon('file')}</span>
          <input type="text" id="editor-doc-title" class="editor-title-input" value="${activeDoc.title}" spellcheck="false" />
        </div>
        <div class="editor-toolbar-container" id="editor-toolbar"></div>
      </div>

      <div class="editor-pane-body">
        <div class="editor-gutter" id="editor-gutter"></div>
        <textarea
          id="markdown-editor-textarea"
          class="editor-textarea"
          placeholder="Type Markdown documentation here..."
          spellcheck="false"
          wrap="off"
        ></textarea>
      </div>
    `;

    this.textarea = this.element.querySelector('#markdown-editor-textarea');
    this.gutter = this.element.querySelector('#editor-gutter');
    const toolbarContainer = this.element.querySelector('#editor-toolbar');

    this.toolbar = new EditorToolbarComponent(toolbarContainer, this.textarea);

    this.textarea.value = activeDoc.content || '';
    this.updateLineNumbers();
    this.bindEditorInteractions();
  }

  loadActiveDocument() {
    const activeDoc = state.getActiveDoc();
    if (!activeDoc) {
      this.render();
      return;
    }

    // If editor shell is already rendered, just update inputs
    const titleInput = this.element.querySelector('#editor-doc-title');
    if (!this.textarea || !titleInput) {
      this.render();
      return;
    }

    titleInput.value = activeDoc.title;
    this.textarea.value = activeDoc.content || '';
    this.updateLineNumbers();
    this.updateCursorPosition();
  }

  bindEditorInteractions() {
    const titleInput = this.element.querySelector('#editor-doc-title');

    // Title rename on blur or Enter
    if (titleInput) {
      titleInput.onblur = () => {
        if (state.activeDocId && titleInput.value.trim() && titleInput.value !== state.getActiveDoc()?.title) {
          state.renameDocument(state.activeDocId, titleInput.value);
        }
      };

      titleInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
          titleInput.blur();
        }
      };
    }

    this.textarea.oninput = () => {
      if (this.isProgrammaticUpdate) return;
      this.updateLineNumbers();
      this.updateCursorPosition();
      if (state.activeDocId) {
        state.updateDocContent(state.activeDocId, this.textarea.value);
      }
    };

    // Synchronize scrolling between textarea and gutter
    this.textarea.onscroll = () => {
      if (this.gutter) {
        this.gutter.scrollTop = this.textarea.scrollTop;
      }
    };

    this.textarea.onkeyup = () => this.updateCursorPosition();
    this.textarea.onclick = () => this.updateCursorPosition();

    // Custom tab indentation & auto pairs
    this.textarea.onkeydown = (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = this.textarea.selectionStart;
        const end = this.textarea.selectionEnd;
        const value = this.textarea.value;

        if (e.shiftKey) {
          // Outdent lines
          const lineStart = value.lastIndexOf('\n', start - 1) + 1;
          const lineEnd = value.indexOf('\n', end);
          const effectiveEnd = lineEnd === -1 ? value.length : lineEnd;
          const currentText = value.substring(lineStart, effectiveEnd);

          const lines = currentText.split('\n');
          const unindentedLines = lines.map(line => {
            if (line.startsWith('  ')) return line.substring(2);
            if (line.startsWith('\t')) return line.substring(1);
            if (line.startsWith(' ')) return line.substring(1);
            return line;
          });

          const replacement = unindentedLines.join('\n');
          this.textarea.value = value.substring(0, lineStart) + replacement + value.substring(effectiveEnd);
          this.textarea.selectionStart = Math.max(0, start - 2);
          this.textarea.selectionEnd = start + (replacement.length - currentText.length);
        } else {
          // Indent 2 spaces
          if (start === end) {
            this.textarea.value = value.substring(0, start) + '  ' + value.substring(end);
            this.textarea.selectionStart = this.textarea.selectionEnd = start + 2;
          } else {
            // Indent selected block of lines
            const lineStart = value.lastIndexOf('\n', start - 1) + 1;
            const lineEnd = value.indexOf('\n', end);
            const effectiveEnd = lineEnd === -1 ? value.length : lineEnd;
            const currentText = value.substring(lineStart, effectiveEnd);

            const lines = currentText.split('\n');
            const indented = lines.map(l => '  ' + l).join('\n');
            this.textarea.value = value.substring(0, lineStart) + indented + value.substring(effectiveEnd);
            this.textarea.selectionStart = start + 2;
            this.textarea.selectionEnd = end + (lines.length * 2);
          }
        }

        this.updateLineNumbers();
        if (state.activeDocId) {
          state.updateDocContent(state.activeDocId, this.textarea.value);
        }
      }
    };
  }

  updateLineNumbers() {
    if (!this.gutter || !this.textarea) return;
    const lines = this.textarea.value.split('\n');
    const lineCount = lines.length;

    let html = '';
    for (let i = 1; i <= lineCount; i++) {
      html += `<div class="gutter-line">${i}</div>`;
    }
    this.gutter.innerHTML = html;
    this.gutter.scrollTop = this.textarea.scrollTop;
  }

  updateCursorPosition() {
    if (!this.textarea) return;
    const pos = this.textarea.selectionStart;
    const val = this.textarea.value;
    const lines = val.substring(0, pos).split('\n');
    const currentLine = lines.length;
    const currentCol = lines[lines.length - 1].length + 1;

    state.setCursorInfo(currentLine, currentCol);
  }
}
