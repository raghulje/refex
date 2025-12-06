/**
 * PWA Initialization Script
 * Registers service worker and sets up offline support
 */

(function() {
  'use strict';

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        // Service worker should be in public root, accessible as /assets/refex/sw.js
        const registration = await navigator.serviceWorker.register('/assets/refex/sw.js', {
          scope: '/'
        });
        console.log('[PWA] Service Worker registered:', registration.scope);

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              if (confirm('New version available. Reload to update?')) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            }
          });
        });

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'SYNC_REQUEST') {
            if (window.OfflineSyncManager) {
              window.OfflineSyncManager.startSync();
            }
          }
        });

      } catch (error) {
        console.error('[PWA] Service Worker registration failed:', error);
      }
    });
  }

  // Install PWA prompt
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install button
    showInstallButton();
  });

  function showInstallButton() {
    // Add install button to navbar if not exists
    if ($('.pwa-install-btn').length === 0) {
      const installBtn = $(`
        <button class="btn btn-sm btn-primary pwa-install-btn" style="margin: 5px;">
          <i class="fa fa-download"></i> Install App
        </button>
      `);

      installBtn.on('click', async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          console.log('[PWA] User choice:', outcome);
          deferredPrompt = null;
          installBtn.remove();
        }
      });

      // Add to navbar (adjust selector based on your navbar structure)
      $('.navbar-nav').append(installBtn);
    }
  }

  // Initialize offline support when Frappe is ready
  if (typeof frappe !== 'undefined') {
    frappe.ready(() => {
      // Initialize offline DB
      if (window.OfflineDB && !window.offlineDBInitialized) {
        window.OfflineDB.init().then(() => {
          window.offlineDBInitialized = true;
          console.log('[PWA] Offline DB initialized');

          // Preload reference data if online
          if (navigator.onLine && window.OfflineSyncManager) {
            window.OfflineSyncManager.preloadReferenceData();
          }
        });
      }
    });
  } else {
    // Wait for Frappe
    document.addEventListener('DOMContentLoaded', () => {
      const checkFrappe = setInterval(() => {
        if (typeof frappe !== 'undefined') {
          clearInterval(checkFrappe);
          frappe.ready(() => {
            if (window.OfflineDB && !window.offlineDBInitialized) {
              window.OfflineDB.init().then(() => {
                window.offlineDBInitialized = true;
                if (navigator.onLine && window.OfflineSyncManager) {
                  window.OfflineSyncManager.preloadReferenceData();
                }
              });
            }
          });
        }
      }, 100);
    });
  }

  // Load offline support scripts
  const scripts = [
    '/assets/refex/js/offline-db.js',
    '/assets/refex/js/offline-sync.js',
    '/assets/refex/js/offline-files.js',
    '/assets/refex/js/offline-listview.js'
  ];

  scripts.forEach(src => {
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    document.head.appendChild(script);
  });

  // Background sync registration
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready.then((registration) => {
      // Register background sync
      registration.sync.register('sync-trip-data').catch((err) => {
        console.log('[PWA] Background sync registration failed:', err);
      });
    });
  }

  console.log('[PWA] Initialization complete');
})();

