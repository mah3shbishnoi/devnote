/**
 * Markdown Formatting Toolbar Component
 */

import { state } from '../../core/state.js';
import { EVENTS } from '../../core/events.js';
import { getIcon } from '../../utils/icons.js';

export class EditorToolbarComponent {
  constructor(element, textarea) {
    this.element = element;
    this.textarea = textarea;
    this.init();
  }

  setTextarea(textarea) {
    this.textarea = textarea;
  }

  init() {
    this.element.innerHTML = `
      <div class="editor-toolbar-group">
        <button class="toolbar-btn" data-action="h1" title="Heading 1">${getIcon('heading')}<span class="toolbar-btn-sub">1</span></button>
        <button class="toolbar-btn" data-action="h2" title="Heading 2">${getIcon('heading')}<span class="toolbar-btn-sub">2</span></button>
        <button class="toolbar-btn" data-action="h3" title="Heading 3">${getIcon('heading')}<span class="toolbar-btn-sub">3</span></button>
      </div>

      <div class="toolbar-divider"></div>

      <div class="editor-toolbar-group">
        <button class="toolbar-btn" data-action="bold" title="Bold (⌘B)">${getIcon('bold')}</button>
        <button class="toolbar-btn" data-action="italic" title="Italic (⌘I)">${getIcon('italic')}</button>
        <button class="toolbar-btn" data-action="quote" title="Blockquote">${getIcon('quote')}</button>
      </div>

      <div class="toolbar-divider"></div>

      <div class="editor-toolbar-group">
        <button class="toolbar-btn" data-action="code" title="Inline Code">${getIcon('code')}</button>
        <button class="toolbar-btn" data-action="codeblock" title="Code Block">${getIcon('layers')}</button>
        <button class="toolbar-btn" data-action="bullet" title="Unordered List">${getIcon('list')}</button>
        <button class="toolbar-btn" data-action="task" title="Checklist / Task List">${getIcon('checkSquare')}</button>
        <button class="toolbar-btn" data-action="table" title="Insert Table">${getIcon('table')}</button>
      </div>
    `;

    this.element.querySelectorAll('.toolbar-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const action = btn.dataset.action;
        this.executeFormat(action);
      };
    });

    state.on(EVENTS.FORMAT_ACTION, ({ action }) => {
      this.executeFormat(action);
    });
  }

  executeFormat(action) {
    if (!this.textarea) return;

    const start = this.textarea.selectionStart;
    const end = this.textarea.selectionEnd;
    const text = this.textarea.value;
    const selectedText = text.substring(start, end);

    let replacement = '';
    let cursorOffset = 0;

    switch (action) {
      case 'h1':
        replacement = `# ${selectedText || 'Heading 1'}`;
        cursorOffset = replacement.length;
        break;
      case 'h2':
        replacement = `## ${selectedText || 'Heading 2'}`;
        cursorOffset = replacement.length;
        break;
      case 'h3':
        replacement = `### ${selectedText || 'Heading 3'}`;
        cursorOffset = replacement.length;
        break;
      case 'bold':
        replacement = `**${selectedText || 'bold text'}**`;
        cursorOffset = selectedText ? replacement.length : 2 + 'bold text'.length;
        break;
      case 'italic':
        replacement = `*${selectedText || 'italic text'}*`;
        cursorOffset = selectedText ? replacement.length : 1 + 'italic text'.length;
        break;
      case 'quote':
        replacement = `> ${selectedText || 'Blockquote'}\n`;
        cursorOffset = replacement.length;
        break;
      case 'code':
        replacement = `\`${selectedText || 'code'}\``;
        cursorOffset = selectedText ? replacement.length : 1 + 'code'.length;
        break;
      case 'codeblock':
        replacement = `\`\`\`bash\n${selectedText || '# your command here'}\n\`\`\`\n`;
        cursorOffset = replacement.length;
        break;
      case 'bullet':
        replacement = `- ${selectedText || 'List item'}\n`;
        cursorOffset = replacement.length;
        break;
      case 'task':
        replacement = `- [ ] ${selectedText || 'Task item'}\n`;
        cursorOffset = replacement.length;
        break;
      case 'table':
        replacement = `\n| Header 1 | Header 2 | Header 3 |\n| :--- | :--- | :--- |\n| Value 1 | Value 2 | Value 3 |\n`;
        cursorOffset = replacement.length;
        break;
      default:
        return;
    }

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    this.textarea.value = newContent;
    this.textarea.selectionStart = start + cursorOffset;
    this.textarea.selectionEnd = start + cursorOffset;
    this.textarea.focus();

    if (state.activeDocId) {
      state.updateDocContent(state.activeDocId, newContent);
    }
  }
}
