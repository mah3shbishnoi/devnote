/**
 * Markdown Rendering Pipeline using Marked and Prism.js
 */

import { marked } from 'marked';
import Prism from 'prismjs';

// Pre-import common Prism languages
import 'prismjs/components/prism-javascript.js';
import 'prismjs/components/prism-typescript.js';
import 'prismjs/components/prism-bash.js';
import 'prismjs/components/prism-json.js';
import 'prismjs/components/prism-yaml.js';
import 'prismjs/components/prism-css.js';
import 'prismjs/components/prism-markdown.js';
import 'prismjs/components/prism-python.js';
import 'prismjs/components/prism-sql.js';
import 'prismjs/components/prism-docker.js';

import { getIcon } from '../../utils/icons.js';
import { escapeHtml } from '../../utils/dom.js';

// Configure marked options
marked.setOptions({
  gfm: true,
  breaks: false,
  pedantic: false
});

export function renderMarkdownToHtml(markdown = '') {
  if (!markdown) return '';

  let taskItemCounter = 0;

  // Custom renderer extension
  const renderer = {
    code({ text, lang }) {
      const language = (lang || 'text').toLowerCase();
      let highlighted = '';

      if (Prism.languages[language]) {
        try {
          highlighted = Prism.highlight(text, Prism.languages[language], language);
        } catch (e) {
          highlighted = escapeHtml(text);
        }
      } else {
        highlighted = escapeHtml(text);
      }

      return `
        <div class="code-block-wrapper">
          <div class="code-block-header">
            <span class="code-lang-tag">${escapeHtml(language)}</span>
            <button class="code-copy-btn" title="Copy code" data-code="${encodeURIComponent(text)}">
              ${getIcon('copy')}
              <span class="copy-text">Copy</span>
            </button>
          </div>
          <pre class="language-${escapeHtml(language)}"><code class="language-${escapeHtml(language)}">${highlighted}</code></pre>
        </div>
      `;
    },

    table(token) {
      // Wrap table in a responsive overflow container
      let header = '';
      let body = '';

      for (let i = 0; i < token.header.length; i++) {
        const cell = token.header[i];
        header += `<th align="${cell.align || 'left'}">${marked.parseInline(cell.text)}</th>`;
      }

      for (let i = 0; i < token.rows.length; i++) {
        const row = token.rows[i];
        let rowHtml = '';
        for (let j = 0; j < row.length; j++) {
          const cell = row[j];
          rowHtml += `<td align="${cell.align || 'left'}">${marked.parseInline(cell.text)}</td>`;
        }
        body += `<tr>${rowHtml}</tr>`;
      }

      return `
        <div class="table-container">
          <table class="markdown-table">
            <thead><tr>${header}</tr></thead>
            <tbody>${body}</tbody>
          </table>
        </div>
      `;
    },

    link({ href, title, text }) {
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
      return `<a href="${escapeHtml(href)}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`;
    },

    listitem(item) {
      if (item.task) {
        const index = taskItemCounter++;
        const checked = item.checked ? 'checked' : '';
        return `
          <li class="task-list-item">
            <input type="checkbox" class="task-checkbox" data-task-index="${index}" ${checked} />
            <span class="task-text">${marked.parseInline(item.text)}</span>
          </li>
        `;
      }
      return `<li>${marked.parseInline(item.text)}</li>`;
    }
  };

  marked.use({ renderer });

  try {
    return marked.parse(markdown);
  } catch (err) {
    console.error('Marked parsing error:', err);
    return `<div class="render-error">Error rendering markdown: ${escapeHtml(err.message)}</div>`;
  }
}
