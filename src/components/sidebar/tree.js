/**
 * Hierarchical File Explorer Tree Component
 */

import { state } from '../../core/state.js';
import { EVENTS } from '../../core/events.js';
import { getIcon } from '../../utils/icons.js';
import { showDocumentContextMenu, showFolderContextMenu } from './context-menu.js';
import { promptDialog } from '../dialogs/dialogs.js';
import { getUniqueDocTitle, validateDocTitle } from '../../utils/naming.js';

export class FileTreeComponent {
  constructor(container) {
    this.container = container;
    this.collapsedFolders = new Set();
    this.filterQuery = '';

    this.bindEvents();
  }

  bindEvents() {
    state.on(EVENTS.DOC_CREATED, () => this.render());
    state.on(EVENTS.DOC_DELETED, () => this.render());
    state.on(EVENTS.DOC_RENAMED, () => this.render());
    state.on(EVENTS.DOC_MOVED, () => this.render());
    state.on(EVENTS.FOLDER_CREATED, () => this.render());
    state.on(EVENTS.FOLDER_RENAMED, () => this.render());
    state.on(EVENTS.FOLDER_DELETED, () => this.render());
    state.on(EVENTS.ACTIVE_DOC_CHANGED, () => this.updateActiveSelection());
  }

  setFilter(query) {
    this.filterQuery = (query || '').toLowerCase().trim();
    this.render();
  }

  toggleFolder(folderId) {
    if (this.collapsedFolders.has(folderId)) {
      this.collapsedFolders.delete(folderId);
    } else {
      this.collapsedFolders.add(folderId);
    }
    this.render();
  }

  expandAll() {
    this.collapsedFolders.clear();
    this.render();
  }

  collapseAll() {
    for (const folder of state.folders) {
      this.collapsedFolders.add(folder.id);
    }
    this.render();
  }

  render() {
    this.container.innerHTML = '';

    const rootDocs = state.documents.filter(d => !d.folderId);
    const rootFolders = state.folders.filter(f => !f.parentId);

    const hasNoItems = state.documents.length === 0 && state.folders.length === 0;

    if (hasNoItems) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'tree-empty-state';
      emptyDiv.innerHTML = `
        <span class="text-muted text-xs">Workspace is empty</span>
        <button class="btn btn-xs btn-secondary mt-xs" id="tree-create-first-doc">Create a Document</button>
      `;
      this.container.appendChild(emptyDiv);

      emptyDiv.querySelector('#tree-create-first-doc').onclick = () => {
        state.createNewDocument({ title: 'README.md' });
      };
      return;
    }

    const fragment = document.createDocumentFragment();

    // 1. Render Folders
    for (const folder of rootFolders) {
      const folderEl = this.renderFolderNode(folder);
      if (folderEl) fragment.appendChild(folderEl);
    }

    // 2. Render Root Documents
    for (const doc of rootDocs) {
      if (this.filterQuery && !doc.title.toLowerCase().includes(this.filterQuery)) {
        continue;
      }
      const docEl = this.renderDocNode(doc);
      fragment.appendChild(docEl);
    }

    this.container.appendChild(fragment);
    this.updateActiveSelection();
  }

  renderFolderNode(folder, level = 0) {
    const isCollapsed = this.collapsedFolders.has(folder.id);
    const childDocs = state.documents.filter(d => d.folderId === folder.id);
    const childFolders = state.folders.filter(f => f.parentId === folder.id);

    // If filtering, check if any descendant matches
    if (this.filterQuery) {
      const hasMatchingDoc = childDocs.some(d => d.title.toLowerCase().includes(this.filterQuery));
      const hasMatchingFolder = folder.name.toLowerCase().includes(this.filterQuery);
      if (!hasMatchingDoc && !hasMatchingFolder) {
        return null;
      }
    }

    const folderWrapper = document.createElement('div');
    folderWrapper.className = 'tree-folder-group';
    folderWrapper.dataset.folderId = folder.id;

    const row = document.createElement('div');
    row.className = 'tree-item tree-folder-row';
    row.style.paddingLeft = `${12 + level * 14}px`;
    row.dataset.folderId = folder.id;

    row.innerHTML = `
      <span class="tree-chevron ${isCollapsed ? '' : 'tree-chevron-expanded'}">${getIcon('chevronRight')}</span>
      <span class="tree-icon">${isCollapsed ? getIcon('folder') : getIcon('folderOpen')}</span>
      <span class="tree-label">${folder.name}</span>
      <span class="tree-badge">${childDocs.length}</span>
      <div class="tree-actions">
        <button class="tree-action-btn action-add-doc" title="New Document in Folder">${getIcon('filePlus')}</button>
        <button class="tree-action-btn action-menu" title="Folder Menu">${getIcon('moreHorizontal')}</button>
      </div>
    `;

    row.onclick = (e) => {
      if (e.target.closest('.tree-action-btn')) return;
      this.toggleFolder(folder.id);
    };

    row.oncontextmenu = (e) => {
      e.preventDefault();
      showFolderContextMenu(folder.id, e.clientX, e.clientY);
    };

    const addDocBtn = row.querySelector('.action-add-doc');
    addDocBtn.onclick = async (e) => {
      e.stopPropagation();
      const defaultName = getUniqueDocTitle('untitled.md', folder.id, state.documents);
      const title = await promptDialog({
        title: 'New Document',
        defaultValue: defaultName,
        confirmText: 'Create',
        validate: (val) => validateDocTitle(val, folder.id, state.documents)
      });
      if (title) {
        state.createNewDocument({ title, folderId: folder.id });
      }
    };

    const menuBtn = row.querySelector('.action-menu');
    menuBtn.onclick = (e) => {
      e.stopPropagation();
      const rect = menuBtn.getBoundingClientRect();
      showFolderContextMenu(folder.id, rect.left, rect.bottom + 4);
    };

    folderWrapper.appendChild(row);

    // Sub-items (if not collapsed)
    if (!isCollapsed) {
      const childrenContainer = document.createElement('div');
      childrenContainer.className = 'tree-folder-children';

      // Child subfolders
      for (const subfolder of childFolders) {
        const subfolderEl = this.renderFolderNode(subfolder, level + 1);
        if (subfolderEl) childrenContainer.appendChild(subfolderEl);
      }

      // Child documents
      for (const doc of childDocs) {
        if (this.filterQuery && !doc.title.toLowerCase().includes(this.filterQuery)) {
          continue;
        }
        const docEl = this.renderDocNode(doc, level + 1);
        childrenContainer.appendChild(docEl);
      }

      folderWrapper.appendChild(childrenContainer);
    }

    return folderWrapper;
  }

  renderDocNode(doc, level = 0) {
    const row = document.createElement('div');
    row.className = 'tree-item tree-doc-row';
    row.style.paddingLeft = `${16 + level * 14}px`;
    row.dataset.docId = doc.id;

    if (state.activeDocId === doc.id) {
      row.classList.add('tree-item-active');
    }

    row.innerHTML = `
      <span class="tree-icon tree-doc-icon">${getIcon('file')}</span>
      <span class="tree-label">${doc.title}</span>
      <div class="tree-actions">
        <button class="tree-action-btn action-menu" title="Document Menu">${getIcon('moreHorizontal')}</button>
      </div>
    `;

    row.onclick = (e) => {
      if (e.target.closest('.tree-action-btn')) return;
      state.openDocInTab(doc.id);
    };

    row.oncontextmenu = (e) => {
      e.preventDefault();
      showDocumentContextMenu(doc.id, e.clientX, e.clientY);
    };

    const menuBtn = row.querySelector('.action-menu');
    menuBtn.onclick = (e) => {
      e.stopPropagation();
      const rect = menuBtn.getBoundingClientRect();
      showDocumentContextMenu(doc.id, rect.left, rect.bottom + 4);
    };

    return row;
  }

  updateActiveSelection() {
    const allDocRows = this.container.querySelectorAll('.tree-doc-row');
    allDocRows.forEach(row => {
      if (row.dataset.docId === state.activeDocId) {
        row.classList.add('tree-item-active');
      } else {
        row.classList.remove('tree-item-active');
      }
    });
  }
}
