/**
 * File Explorer Sidebar Component
 */

import { state } from '../../core/state.js';
import { EVENTS } from '../../core/events.js';
import { getIcon } from '../../utils/icons.js';
import { FileTreeComponent } from './tree.js';
import { promptDialog } from '../dialogs/dialogs.js';
import { selectAndReadMarkdownFile } from '../../utils/import.js';
import { smartExport } from '../../utils/export.js';

export class SidebarComponent {
  constructor(element) {
    this.element = element;
    this.allExpanded = true;
    this.init();
  }

  init() {
    this.element.innerHTML = `
      <div class="sidebar-header">
        <div class="sidebar-title-row">
          <div class="flex-row-center gap-xs">
            <span class="sidebar-workspace-label">WORKSPACE</span>
          </div>
          <div class="sidebar-header-actions">
            <button class="btn-icon btn-icon-xs" id="sidebar-new-doc-btn" title="New Document (⌘N)">
              ${getIcon('filePlus')}
            </button>
            <button class="btn-icon btn-icon-xs" id="sidebar-new-folder-btn" title="New Folder">
              ${getIcon('folderPlus')}
            </button>
            <button class="btn-icon btn-icon-xs" id="sidebar-toggle-expand-btn" title="Collapse / Expand All">
              ${getIcon('collapse')}
            </button>
          </div>
        </div>

        <div class="sidebar-filter-wrapper">
          <span class="sidebar-filter-icon">${getIcon('search')}</span>
          <input type="text" id="sidebar-filter-input" class="sidebar-filter-input" placeholder="Filter files..." />
          <button class="btn-icon btn-icon-xs hidden" id="sidebar-filter-clear" title="Clear filter">
            ${getIcon('x')}
          </button>
        </div>
      </div>

      <div class="sidebar-tree-container" id="sidebar-tree"></div>

      <div class="sidebar-footer">
        <button class="sidebar-footer-btn" id="sidebar-import-btn" title="Import Markdown File">
          <span class="icon-sm">${getIcon('upload')}</span>
          <span>Import .md</span>
        </button>
        <button class="sidebar-footer-btn" id="sidebar-export-all-btn" title="Export Markdown (.md / .zip)">
          <span class="icon-sm">${getIcon('download')}</span>
          <span>Export</span>
        </button>
      </div>
    `;

    const treeContainer = this.element.querySelector('#sidebar-tree');
    this.tree = new FileTreeComponent(treeContainer);
    this.tree.render();

    this.bindControls();
    this.bindState();
  }

  bindControls() {
    this.element.querySelector('#sidebar-new-doc-btn').onclick = async () => {
      const title = await promptDialog({
        title: 'New Document',
        defaultValue: 'untitled.md',
        confirmText: 'Create'
      });
      if (title) {
        state.createNewDocument({ title });
      }
    };

    this.element.querySelector('#sidebar-new-folder-btn').onclick = async () => {
      const name = await promptDialog({
        title: 'New Folder',
        defaultValue: 'New Folder',
        confirmText: 'Create Folder'
      });
      if (name) {
        state.createNewFolder({ name });
      }
    };

    const toggleExpandBtn = this.element.querySelector('#sidebar-toggle-expand-btn');
    toggleExpandBtn.onclick = () => {
      if (this.allExpanded) {
        this.tree.collapseAll();
        toggleExpandBtn.innerHTML = getIcon('expand');
        toggleExpandBtn.title = 'Expand All';
        this.allExpanded = false;
      } else {
        this.tree.expandAll();
        toggleExpandBtn.innerHTML = getIcon('collapse');
        toggleExpandBtn.title = 'Collapse All';
        this.allExpanded = true;
      }
    };

    const filterInput = this.element.querySelector('#sidebar-filter-input');
    const filterClear = this.element.querySelector('#sidebar-filter-clear');

    filterInput.oninput = () => {
      const val = filterInput.value;
      if (val) {
        filterClear.classList.remove('hidden');
      } else {
        filterClear.classList.add('hidden');
      }
      this.tree.setFilter(val);
    };

    filterClear.onclick = () => {
      filterInput.value = '';
      filterClear.classList.add('hidden');
      this.tree.setFilter('');
      filterInput.focus();
    };

    this.element.querySelector('#sidebar-import-btn').onclick = async () => {
      try {
        const file = await selectAndReadMarkdownFile();
        if (file) {
          const newDoc = await state.createNewDocument({
            title: file.name,
            content: file.content
          });
          state.emit(EVENTS.TOAST, { message: `Imported "${file.name}" successfully`, type: 'success' });
        }
      } catch (err) {
        state.emit(EVENTS.TOAST, { message: 'Failed to import file', type: 'error' });
      }
    };

    this.element.querySelector('#sidebar-export-all-btn').onclick = async () => {
      try {
        const result = await smartExport(state);
        if (result?.type === 'single') {
          state.emit(EVENTS.TOAST, { message: `Exported "${result.name}" (.md)`, type: 'success' });
        } else if (result?.type === 'zip') {
          state.emit(EVENTS.TOAST, { message: `Exported ${result.count} documents (.zip)`, type: 'success' });
        } else {
          state.emit(EVENTS.TOAST, { message: 'No documents to export', type: 'info' });
        }
      } catch (err) {
        console.error('Export failed:', err);
        state.emit(EVENTS.TOAST, { message: 'Failed to export documents', type: 'error' });
      }
    };
  }

  bindState() {
    state.on(EVENTS.SIDEBAR_TOGGLED, ({ collapsed }) => {
      if (collapsed) {
        this.element.classList.add('sidebar-collapsed');
      } else {
        this.element.classList.remove('sidebar-collapsed');
      }
    });

    if (state.sidebarCollapsed) {
      this.element.classList.add('sidebar-collapsed');
    }
  }
}
