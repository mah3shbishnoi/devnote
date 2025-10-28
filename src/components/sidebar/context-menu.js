/**
 * File Explorer Context Menu Component
 */

import { state } from '../../core/state.js';
import { getIcon } from '../../utils/icons.js';
import { exportDocument, exportDocumentsAsZip } from '../../utils/export.js';
import { promptDialog, confirmDialog, moveDocDialog } from '../dialogs/dialogs.js';
import { getUniqueDocTitle, validateDocTitle, validateFolderName } from '../../utils/naming.js';

let activeMenu = null;

export function closeContextMenu() {
  if (activeMenu) {
    activeMenu.remove();
    activeMenu = null;
  }
}

// Global click listener to close menu
window.addEventListener('click', (e) => {
  if (activeMenu && !activeMenu.contains(e.target)) {
    closeContextMenu();
  }
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeContextMenu();
  }
});

export function showDocumentContextMenu(docId, x, y) {
  closeContextMenu();
  const doc = state.getDocument(docId);
  if (!doc) return;

  const menu = document.createElement('div');
  menu.className = 'context-menu';
  menu.style.left = `${Math.min(x, window.innerWidth - 200)}px`;
  menu.style.top = `${Math.min(y, window.innerHeight - 220)}px`;

  menu.innerHTML = `
    <div class="context-menu-item" data-action="rename">
      <span class="context-icon">${getIcon('edit')}</span>
      <span>Rename Document</span>
    </div>
    <div class="context-menu-item" data-action="duplicate">
      <span class="context-icon">${getIcon('copy')}</span>
      <span>Duplicate</span>
    </div>
    <div class="context-menu-item" data-action="move">
      <span class="context-icon">${getIcon('move')}</span>
      <span>Move to...</span>
    </div>
    <div class="context-menu-item" data-action="export">
      <span class="context-icon">${getIcon('download')}</span>
      <span>Export as .md</span>
    </div>
    <div class="context-menu-divider"></div>
    <div class="context-menu-item text-danger" data-action="delete">
      <span class="context-icon">${getIcon('trash')}</span>
      <span>Delete</span>
    </div>
  `;

  document.body.appendChild(menu);
  activeMenu = menu;

  menu.querySelectorAll('.context-menu-item').forEach(item => {
    item.addEventListener('click', async (e) => {
      e.stopPropagation();
      const action = item.dataset.action;
      closeContextMenu();

      if (action === 'rename') {
        const newName = await promptDialog({
          title: 'Rename Document',
          defaultValue: doc.title,
          confirmText: 'Rename',
          validate: (val) => validateDocTitle(val, doc.folderId, state.documents, docId)
        });
        if (newName && newName !== doc.title) {
          state.renameDocument(docId, newName);
        }
      } else if (action === 'duplicate') {
        state.duplicateDocument(docId);
      } else if (action === 'move') {
        const targetFolder = await moveDocDialog(docId);
        if (targetFolder !== undefined && targetFolder !== doc.folderId) {
          state.moveDocument(docId, targetFolder);
        }
      } else if (action === 'export') {
        exportDocument(doc);
      } else if (action === 'delete') {
        const confirmed = await confirmDialog({
          title: 'Delete Document',
          message: `Are you sure you want to permanently delete "${doc.title}"?`,
          confirmText: 'Delete',
          isDanger: true
        });
        if (confirmed) {
          state.deleteDocument(docId);
        }
      }
    });
  });
}

export function showFolderContextMenu(folderId, x, y) {
  closeContextMenu();
  const folder = state.getFolder(folderId);
  if (!folder) return;

  const menu = document.createElement('div');
  menu.className = 'context-menu';
  menu.style.left = `${Math.min(x, window.innerWidth - 200)}px`;
  menu.style.top = `${Math.min(y, window.innerHeight - 200)}px`;

  menu.innerHTML = `
    <div class="context-menu-item" data-action="new-doc">
      <span class="context-icon">${getIcon('filePlus')}</span>
      <span>New Document in Folder</span>
    </div>
    <div class="context-menu-item" data-action="rename">
      <span class="context-icon">${getIcon('edit')}</span>
      <span>Rename Folder</span>
    </div>
    <div class="context-menu-item" data-action="export-folder">
      <span class="context-icon">${getIcon('download')}</span>
      <span>Export Folder as .zip</span>
    </div>
    <div class="context-menu-divider"></div>
    <div class="context-menu-item text-danger" data-action="delete">
      <span class="context-icon">${getIcon('trash')}</span>
      <span>Delete Folder</span>
    </div>
  `;

  document.body.appendChild(menu);
  activeMenu = menu;

  menu.querySelectorAll('.context-menu-item').forEach(item => {
    item.addEventListener('click', async (e) => {
      e.stopPropagation();
      const action = item.dataset.action;
      closeContextMenu();

      if (action === 'new-doc') {
        const defaultName = getUniqueDocTitle('untitled.md', folderId, state.documents);
        const title = await promptDialog({
          title: 'New Document',
          defaultValue: defaultName,
          confirmText: 'Create',
          validate: (val) => validateDocTitle(val, folderId, state.documents)
        });
        if (title) {
          state.createNewDocument({ title, folderId });
        }
      } else if (action === 'rename') {
        const newName = await promptDialog({
          title: 'Rename Folder',
          defaultValue: folder.name,
          confirmText: 'Rename',
          validate: (val) => validateFolderName(val, folder.parentId, state.folders, folderId)
        });
        if (newName && newName !== folder.name) {
          state.renameFolder(folderId, newName);
        }
      } else if (action === 'export-folder') {
        const folderIds = new Set([folderId]);
        function collectChildren(parent) {
          for (const f of state.folders) {
            if (f.parentId === parent && !folderIds.has(f.id)) {
              folderIds.add(f.id);
              collectChildren(f.id);
            }
          }
        }
        collectChildren(folderId);
        const docs = state.documents.filter(d => folderIds.has(d.folderId));
        const subfolders = state.folders.filter(f => folderIds.has(f.id));
        const safeName = (folder.name || 'folder').toLowerCase().replace(/[^a-z0-9_-]/g, '-');
        await exportDocumentsAsZip(docs, subfolders, `${safeName}.zip`);
      } else if (action === 'delete') {
        const confirmed = await confirmDialog({
          title: 'Delete Folder',
          message: `Are you sure you want to delete folder "${folder.name}" and all documents inside it?`,
          confirmText: 'Delete Folder',
          isDanger: true
        });
        if (confirmed) {
          state.deleteFolder(folderId);
        }
      }
    });
  });
}
