/**
 * Developer Dialogs: Confirmation, Input Prompt, and Document Move
 */

import { state } from '../../core/state.js';
import { getIcon } from '../../utils/icons.js';

let modalRoot = null;

function ensureModalRoot() {
  if (!modalRoot) {
    modalRoot = document.getElementById('modal-root');
    if (!modalRoot) {
      modalRoot = document.createElement('div');
      modalRoot.id = 'modal-root';
      document.body.appendChild(modalRoot);
    }
  }
  return modalRoot;
}

export function confirmDialog({ title = 'Confirm Action', message = 'Are you sure?', confirmText = 'Confirm', isDanger = false }) {
  return new Promise((resolve) => {
    const root = ensureModalRoot();
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    overlay.innerHTML = `
      <div class="modal-card modal-card-sm" role="dialog" aria-modal="true" aria-labelledby="modal-dialog-title">
        <div class="modal-header">
          <h3 id="modal-dialog-title" class="modal-title">${title}</h3>
          <button class="btn-icon modal-close-btn" aria-label="Close">${getIcon('x')}</button>
        </div>
        <div class="modal-body">
          <p class="modal-message">${message}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary modal-cancel-btn">Cancel</button>
          <button class="btn ${isDanger ? 'btn-danger' : 'btn-primary'} modal-confirm-btn">${confirmText}</button>
        </div>
      </div>
    `;

    root.appendChild(overlay);

    const confirmBtn = overlay.querySelector('.modal-confirm-btn');
    const cancelBtn = overlay.querySelector('.modal-cancel-btn');
    const closeBtn = overlay.querySelector('.modal-close-btn');

    confirmBtn.focus();

    function cleanup(result) {
      overlay.classList.add('modal-fade-out');
      setTimeout(() => {
        if (overlay.parentElement) overlay.parentElement.removeChild(overlay);
        resolve(result);
      }, 150);
    }

    confirmBtn.onclick = () => cleanup(true);
    cancelBtn.onclick = () => cleanup(false);
    closeBtn.onclick = () => cleanup(false);

    overlay.onclick = (e) => {
      if (e.target === overlay) cleanup(false);
    };

    const handleKey = (e) => {
      if (e.key === 'Escape') {
        cleanup(false);
        window.removeEventListener('keydown', handleKey);
      }
    };
    window.addEventListener('keydown', handleKey);
  });
}

export function promptDialog({
  title = 'Input Required',
  message = '',
  defaultValue = '',
  placeholder = '',
  confirmText = 'Save',
  validate = null
}) {
  return new Promise((resolve) => {
    const root = ensureModalRoot();
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    overlay.innerHTML = `
      <div class="modal-card modal-card-sm" role="dialog" aria-modal="true" aria-labelledby="modal-prompt-title">
        <div class="modal-header">
          <h3 id="modal-prompt-title" class="modal-title">${title}</h3>
          <button class="btn-icon modal-close-btn" aria-label="Close">${getIcon('x')}</button>
        </div>
        <div class="modal-body">
          ${message ? `<p class="modal-message">${message}</p>` : ''}
          <input type="text" class="input modal-text-input" value="${defaultValue}" placeholder="${placeholder}" />
          <div class="modal-input-error" style="display: none;"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary modal-cancel-btn">Cancel</button>
          <button class="btn btn-primary modal-confirm-btn">${confirmText}</button>
        </div>
      </div>
    `;

    root.appendChild(overlay);

    const input = overlay.querySelector('.modal-text-input');
    const errorEl = overlay.querySelector('.modal-input-error');
    const confirmBtn = overlay.querySelector('.modal-confirm-btn');
    const cancelBtn = overlay.querySelector('.modal-cancel-btn');
    const closeBtn = overlay.querySelector('.modal-close-btn');

    const checkValidity = (val) => {
      if (typeof validate === 'function') {
        const error = validate(val);
        if (error) {
          errorEl.textContent = error;
          errorEl.style.display = 'block';
          input.classList.add('input-invalid');
          confirmBtn.disabled = true;
          confirmBtn.style.opacity = '0.5';
          confirmBtn.style.cursor = 'not-allowed';
          return false;
        }
      }
      errorEl.textContent = '';
      errorEl.style.display = 'none';
      input.classList.remove('input-invalid');
      confirmBtn.disabled = false;
      confirmBtn.style.opacity = '1';
      confirmBtn.style.cursor = 'pointer';
      return true;
    };

    input.focus();
    input.select();
    checkValidity(input.value.trim());

    input.oninput = () => {
      checkValidity(input.value.trim());
    };

    function cleanup(value) {
      overlay.classList.add('modal-fade-out');
      setTimeout(() => {
        if (overlay.parentElement) overlay.parentElement.removeChild(overlay);
        resolve(value);
      }, 150);
    }

    const handleConfirm = () => {
      const val = input.value.trim();
      if (!checkValidity(val)) return;
      cleanup(val);
    };

    confirmBtn.onclick = handleConfirm;
    cancelBtn.onclick = () => cleanup(null);
    closeBtn.onclick = () => cleanup(null);

    input.onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirm();
      } else if (e.key === 'Escape') {
        cleanup(null);
      }
    };

    overlay.onclick = (e) => {
      if (e.target === overlay) cleanup(null);
    };
  });
}

export function moveDocDialog(docId) {
  const doc = state.getDocument(docId);
  if (!doc) return;

  return new Promise((resolve) => {
    const root = ensureModalRoot();
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const folders = state.folders;
    const currentFolderId = doc.folderId;

    let folderOptions = `
      <option value="" ${currentFolderId === null ? 'selected' : ''}>/ Root Workspace</option>
    `;

    for (const folder of folders) {
      const isSelected = currentFolderId === folder.id ? 'selected' : '';
      folderOptions += `<option value="${folder.id}" ${isSelected}>📁 ${folder.name}</option>`;
    }

    overlay.innerHTML = `
      <div class="modal-card modal-card-sm" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3 class="modal-title">Move "${doc.title}"</h3>
          <button class="btn-icon modal-close-btn">${getIcon('x')}</button>
        </div>
        <div class="modal-body">
          <label class="modal-label">Select destination folder:</label>
          <select class="select modal-folder-select">${folderOptions}</select>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary modal-cancel-btn">Cancel</button>
          <button class="btn btn-primary modal-confirm-btn">Move Document</button>
        </div>
      </div>
    `;

    root.appendChild(overlay);

    const select = overlay.querySelector('.modal-folder-select');
    const confirmBtn = overlay.querySelector('.modal-confirm-btn');
    const cancelBtn = overlay.querySelector('.modal-cancel-btn');
    const closeBtn = overlay.querySelector('.modal-close-btn');

    select.focus();

    function cleanup(targetFolderId) {
      overlay.classList.add('modal-fade-out');
      setTimeout(() => {
        if (overlay.parentElement) overlay.parentElement.removeChild(overlay);
        resolve(targetFolderId);
      }, 150);
    }

    confirmBtn.onclick = () => {
      const target = select.value === '' ? null : select.value;
      cleanup(target);
    };
    cancelBtn.onclick = () => cleanup(undefined);
    closeBtn.onclick = () => cleanup(undefined);

    overlay.onclick = (e) => {
      if (e.target === overlay) cleanup(undefined);
    };
  });
}
