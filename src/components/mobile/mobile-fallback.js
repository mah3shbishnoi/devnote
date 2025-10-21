/**
 * Minimal Mobile Fallback Notice
 * Respects desktop-first strategy while ensuring mobile screens remain clean and functional
 */

import { getIcon } from '../../utils/icons.js';
import { state } from '../../core/state.js';

export function initMobileFallback() {
  const isMobile = window.innerWidth <= 640;
  if (!isMobile) return;

  const dismissed = sessionStorage.getItem('devnote_mobile_fallback_dismissed') === 'true';
  if (dismissed) return;

  const fallbackEl = document.createElement('div');
  fallbackEl.className = 'mobile-fallback-banner';
  fallbackEl.innerHTML = `
    <div class="mobile-fallback-card">
      <div class="mobile-fallback-header">
        <div class="flex-row-center gap-xs">
          <span class="text-accent">${getIcon('code')}</span>
          <strong>DevNote is Desktop-First</strong>
        </div>
        <button class="btn-icon btn-icon-xs" id="mobile-fallback-dismiss" aria-label="Dismiss">${getIcon('x')}</button>
      </div>
      <p class="mobile-fallback-text">
        DevNote is an engineering documentation IDE built for desktop & laptop workstations. You can preview documents below, or open on a larger screen for the full multi-pane workspace.
      </p>
      <div class="mobile-fallback-actions">
        <button class="btn btn-xs btn-primary" id="mobile-fallback-continue">Continue in Mobile View</button>
      </div>
    </div>
  `;

  document.body.prepend(fallbackEl);

  const dismiss = () => {
    sessionStorage.setItem('devnote_mobile_fallback_dismissed', 'true');
    fallbackEl.remove();
  };

  fallbackEl.querySelector('#mobile-fallback-dismiss').onclick = dismiss;
  fallbackEl.querySelector('#mobile-fallback-continue').onclick = () => {
    // Switch to preview mode for comfortable reading on small device
    state.setViewMode('preview');
    dismiss();
  };
}
