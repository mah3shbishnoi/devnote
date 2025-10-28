/**
 * Command Palette Component (Cmd/Ctrl + K)
 */

import { state } from '../../core/state.js';
import { EVENTS } from '../../core/events.js';
import { getIcon } from '../../utils/icons.js';
import { getModKeyLabel } from '../../core/shortcuts.js';
import { exportDocument, exportDocumentsAsZip, smartExport } from '../../utils/export.js';
import { selectAndReadMarkdownFile } from '../../utils/import.js';
import { promptDialog, confirmDialog, moveDocDialog } from '../dialogs/dialogs.js';
import { getUniqueDocTitle, getUniqueFolderName, validateDocTitle, validateFolderName } from '../../utils/naming.js';

export class CommandPaletteComponent {
  constructor() {
    this.overlay = null;
    this.input = null;
    this.resultsList = null;
    this.selectedIndex = 0;
    this.filteredCommands = [];

    this.init();
  }

  init() {
    state.on(EVENTS.OPEN_COMMAND_PALETTE, () => this.open());
  }

  getCommands() {
    const mod = getModKeyLabel();
    const activeDoc = state.getActiveDoc();

    return [
      {
        id: 'new-doc',
        title: 'New Document',
        category: 'Document',
        icon: 'filePlus',
        shortcut: `${mod}+N`,
        action: async () => {
          const defaultName = getUniqueDocTitle('untitled.md', null, state.documents);
          const title = await promptDialog({
            title: 'New Document',
            defaultValue: defaultName,
            confirmText: 'Create',
            validate: (val) => validateDocTitle(val, null, state.documents)
          });
          if (title) state.createNewDocument({ title });
        }
      },
      {
        id: 'new-folder',
        title: 'New Folder',
        category: 'Folder',
        icon: 'folderPlus',
        shortcut: '',
        action: async () => {
          const defaultName = getUniqueFolderName('New Folder', null, state.folders);
          const name = await promptDialog({
            title: 'New Folder',
            defaultValue: defaultName,
            confirmText: 'Create',
            validate: (val) => validateFolderName(val, null, state.folders)
          });
          if (name) state.createNewFolder({ name });
        }
      },
      {
        id: 'search-docs',
        title: 'Search Documents & Content',
        category: 'Navigation',
        icon: 'search',
        shortcut: `${mod}+P`,
        action: () => state.emit(EVENTS.OPEN_SEARCH_MODAL)
      },
      {
        id: 'save-doc',
        title: 'Save Active Document',
        category: 'Document',
        icon: 'check',
        shortcut: `${mod}+S`,
        action: () => {
          if (state.activeDocId) {
            state.saveDoc(state.activeDocId);
            state.emit(EVENTS.TOAST, { message: 'Saved to storage', type: 'success' });
          }
        }
      },
      {
        id: 'rename-active',
        title: 'Rename Current Document',
        category: 'Document',
        icon: 'edit',
        shortcut: '',
        action: async () => {
          if (!activeDoc) return;
          const newName = await promptDialog({
            title: 'Rename Document',
            defaultValue: activeDoc.title,
            confirmText: 'Rename',
            validate: (val) => validateDocTitle(val, activeDoc.folderId, state.documents, activeDoc.id)
          });
          if (newName && newName !== activeDoc.title) {
            state.renameDocument(activeDoc.id, newName);
          }
        }
      },
      {
        id: 'move-active',
        title: 'Move Current Document',
        category: 'Document',
        icon: 'move',
        shortcut: '',
        action: async () => {
          if (!activeDoc) return;
          const targetFolder = await moveDocDialog(activeDoc.id);
          if (targetFolder !== undefined && targetFolder !== activeDoc.folderId) {
            state.moveDocument(activeDoc.id, targetFolder);
          }
        }
      },
      {
        id: 'duplicate-active',
        title: 'Duplicate Current Document',
        category: 'Document',
        icon: 'copy',
        shortcut: '',
        action: () => {
          if (activeDoc) state.duplicateDocument(activeDoc.id);
        }
      },
      {
        id: 'delete-active',
        title: 'Delete Current Document',
        category: 'Document',
        icon: 'trash',
        shortcut: '',
        action: async () => {
          if (!activeDoc) return;
          const confirmed = await confirmDialog({
            title: 'Delete Document',
            message: `Are you sure you want to permanently delete "${activeDoc.title}"?`,
            confirmText: 'Delete',
            isDanger: true
          });
          if (confirmed) {
            state.deleteDocument(activeDoc.id);
          }
        }
      },
      {
        id: 'export-active',
        title: 'Export Current Document as .md',
        category: 'File',
        icon: 'download',
        shortcut: '',
        action: () => {
          if (activeDoc) exportDocument(activeDoc);
        }
      },
      {
        id: 'export-workspace-zip',
        title: 'Export Workspace Documents (.zip)',
        category: 'File',
        icon: 'download',
        shortcut: '',
        action: () => exportDocumentsAsZip(state.documents, state.folders, 'devnote-workspace.zip')
      },
      {
        id: 'import-file',
        title: 'Import Text or Code File',
        category: 'File',
        icon: 'upload',
        shortcut: '',
        action: async () => {
          try {
            const file = await selectAndReadMarkdownFile();
            if (file) {
              const newDoc = await state.createNewDocument({
                title: file.name,
                content: file.content,
                notify: false
              });
              state.emit(EVENTS.TOAST, { message: `Imported "${newDoc.title}" successfully`, type: 'success' });
            }
          } catch (err) {
            state.emit(EVENTS.TOAST, { message: err?.message || 'Failed to import file', type: 'error' });
          }
        }
      },
      {
        id: 'toggle-split',
        title: 'View: Split Editor & Preview',
        category: 'View',
        icon: 'columns',
        shortcut: '',
        action: () => state.setViewMode('split')
      },
      {
        id: 'toggle-editor',
        title: 'View: Editor Only (Focus)',
        category: 'View',
        icon: 'code',
        shortcut: '',
        action: () => state.setViewMode('editor')
      },
      {
        id: 'toggle-preview',
        title: 'View: Preview Only (Reading)',
        category: 'View',
        icon: 'eye',
        shortcut: '',
        action: () => state.setViewMode('preview')
      },
      {
        id: 'toggle-sidebar',
        title: 'Toggle Sidebar Visibility',
        category: 'View',
        icon: 'sidebar',
        shortcut: `${mod}+\\`,
        action: () => state.toggleSidebar()
      },
      {
        id: 'toggle-theme',
        title: `Switch to ${state.theme === 'dark' ? 'Light' : 'Dark'} Mode`,
        category: 'Theme',
        icon: state.theme === 'dark' ? 'sun' : 'moon',
        shortcut: '',
        action: () => state.toggleTheme()
      },
      {
        id: 'shortcuts-help',
        title: 'Show Keyboard Shortcuts Reference',
        category: 'Help',
        icon: 'helpCircle',
        shortcut: '?',
        action: () => state.emit(EVENTS.OPEN_SHORTCUTS_MODAL)
      }
    ];
  }

  open() {
    if (!this.overlay) {
      this.createModal();
    }
    this.overlay.classList.remove('hidden');
    this.input.value = '';
    this.selectedIndex = 0;
    this.filterCommands('');
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
    this.overlay.id = 'command-palette-overlay';

    this.overlay.innerHTML = `
      <div class="palette-card" role="dialog" aria-modal="true">
        <div class="palette-input-wrapper">
          <span class="palette-search-icon">${getIcon('search')}</span>
          <input type="text" class="palette-input" placeholder="Type a command or search..." autocomplete="off" />
        </div>
        <div class="palette-results-list" id="palette-results"></div>
        <div class="palette-footer">
          <div class="palette-footer-item">
            <kbd>↑</kbd><kbd>↓</kbd> <span>Navigate</span>
          </div>
          <div class="palette-footer-item">
            <kbd>↵</kbd> <span>Select</span>
          </div>
          <div class="palette-footer-item">
            <kbd>ESC</kbd> <span>Dismiss</span>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.overlay);

    this.input = this.overlay.querySelector('.palette-input');
    this.resultsList = this.overlay.querySelector('#palette-results');

    this.overlay.onclick = (e) => {
      if (e.target === this.overlay) this.close();
    };

    this.input.oninput = () => {
      this.selectedIndex = 0;
      this.filterCommands(this.input.value);
    };

    this.input.onkeydown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (this.filteredCommands.length > 0) {
          this.selectedIndex = (this.selectedIndex + 1) % this.filteredCommands.length;
          this.renderResults();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (this.filteredCommands.length > 0) {
          this.selectedIndex = (this.selectedIndex - 1 + this.filteredCommands.length) % this.filteredCommands.length;
          this.renderResults();
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (this.filteredCommands[this.selectedIndex]) {
          const cmd = this.filteredCommands[this.selectedIndex];
          this.close();
          cmd.action();
        }
      } else if (e.key === 'Escape') {
        this.close();
      }
    };
  }

  filterCommands(query) {
    const q = query.toLowerCase().trim();
    const all = this.getCommands();

    if (!q) {
      this.filteredCommands = all;
    } else {
      this.filteredCommands = all.filter(cmd =>
        cmd.title.toLowerCase().includes(q) ||
        cmd.category.toLowerCase().includes(q)
      );
    }

    this.renderResults();
  }

  renderResults() {
    this.resultsList.innerHTML = '';

    if (this.filteredCommands.length === 0) {
      this.resultsList.innerHTML = `
        <div class="palette-empty">No matching commands found.</div>
      `;
      return;
    }

    this.filteredCommands.forEach((cmd, idx) => {
      const isSelected = idx === this.selectedIndex;
      const item = document.createElement('div');
      item.className = `palette-item ${isSelected ? 'palette-item-selected' : ''}`;

      item.innerHTML = `
        <div class="palette-item-left">
          <span class="palette-item-icon">${getIcon(cmd.icon || 'command')}</span>
          <span class="palette-item-title">${cmd.title}</span>
          <span class="palette-item-category">${cmd.category}</span>
        </div>
        <div class="palette-item-right">
          ${cmd.shortcut ? `<span class="palette-item-shortcut">${cmd.shortcut}</span>` : ''}
        </div>
      `;

      item.onclick = () => {
        this.close();
        cmd.action();
      };

      this.resultsList.appendChild(item);
    });

    const activeItem = this.resultsList.querySelector('.palette-item-selected');
    if (activeItem) {
      activeItem.scrollIntoView({ block: 'nearest' });
    }
  }
}
