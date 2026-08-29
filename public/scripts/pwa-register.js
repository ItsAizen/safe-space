(function() {
  'use strict';

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('[SW] Registered:', registration.scope);

          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[SW] New version available');
                  showUpdateBanner();
                }
              });
            }
          });
        })
        .catch((err) => {
          console.warn('[SW] Registration failed:', err);
        });

      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
    });
  }

  function showUpdateBanner() {
    if (document.getElementById('sw-update-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'sw-update-banner';
    banner.style.cssText = `
      position: fixed;
      bottom: 80px;
      left: 16px;
      right: 16px;
      max-width: 430px;
      margin: 0 auto;
      background: var(--color-bg-elevated, #0d0f15);
      border: 1px solid var(--color-border, rgba(255,255,255,0.08));
      border-radius: 1rem;
      padding: 1rem;
      box-shadow: var(--shadow-glass-lg, 0 8px 48px rgba(0,0,0,0.25));
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      animation: slideUp 400ms cubic-bezier(0.34,1.56,0.64,1);
      font-family: inherit;
    `;

    banner.innerHTML = `
      <span style="color: var(--color-text, #fafafa); font-size: 0.9375rem;">نسخه جدید موجود است</span>
      <button id="sw-update-btn" style="
        background: linear-gradient(135deg, var(--color-accent, #10b981), var(--color-accent-strong, #34d399));
        color: #030407;
        border: none;
        border-radius: 0.75rem;
        padding: 0.5rem 1rem;
        font-family: inherit;
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
      ">به‌روزرسانی</button>
    `;

    document.body.appendChild(banner);

    document.getElementById('sw-update-btn')?.addEventListener('click', () => {
      navigator.serviceWorker.ready.then((reg) => {
        if (reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      });
    });
  }

  let deferredPrompt: BeforeInstallPromptEvent | null = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    showInstallButton();
  });

  function showInstallButton() {
    if (document.getElementById('pwa-install-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'pwa-install-btn';
    btn.textContent = 'نصب اپلیکیشن';
    btn.style.cssText = `
      position: fixed;
      bottom: 80px;
      left: 16px;
      right: 16px;
      max-width: 430px;
      margin: 0 auto;
      background: linear-gradient(135deg, var(--color-accent, #10b981), var(--color-accent-strong, #34d399));
      color: #030407;
      border: none;
      border-radius: 1rem;
      padding: 1rem;
      font-family: inherit;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      z-index: 1000;
      box-shadow: 0 4px 24px rgba(16, 185, 129, 0.4);
      animation: slideUp 400ms cubic-bezier(0.34,1.56,0.64,1);
    `;

    btn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('[PWA] User accepted install');
      }
      deferredPrompt = null;
      btn.remove();
    });

    document.body.appendChild(btn);
  }

  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App installed');
    const btn = document.getElementById('pwa-install-btn');
    if (btn) btn.remove();
  });
})();

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}