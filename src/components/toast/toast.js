/**
 * Developer Workspace Toast Notification Service
 */

import { state } from '../../core/state.js';
import { EVENTS } from '../../core/events.js';
import { getIcon } from '../../utils/icons.js';

let toastContainer = null;

export function initToastSystem() {
  toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  state.on(EVENTS.TOAST, ({ message, type = 'info', duration = 3000 }) => {
    showToast(message, type, duration);
  });
}

export function showToast(message, type = 'info', duration = 3000) {
  if (!toastContainer) return;

  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;

  const iconName = type === 'success' ? 'check' : type === 'error' ? 'alertCircle' : 'helpCircle';
  const iconHtml = getIcon(iconName);

  toast.innerHTML = `
    <span class="toast-icon">${iconHtml}</span>
    <span class="toast-message">${message}</span>
  `;

  toastContainer.appendChild(toast);

  // Trigger entrance animation
  requestAnimationFrame(() => {
    toast.classList.add('toast-visible');
  });

  // Auto-dismiss
  setTimeout(() => {
    toast.classList.remove('toast-visible');
    toast.classList.add('toast-exit');
    setTimeout(() => {
      if (toast.parentElement) {
        toast.parentElement.removeChild(toast);
      }
    }, 250);
  }, duration);
}
