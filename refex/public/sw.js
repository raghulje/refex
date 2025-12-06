// Service Worker for Offline PWA Support
const CACHE_NAME = 'refex-trip-pwa-v2';
const OFFLINE_PAGES = [
  '/',
  '/app',
  '/app/trip',
  '/app/trip/list',
  '/app/trip/new',
  '/app/project',
  '/app/project/list',
  '/app/item',
  '/app/item/list',
  '/app/supplier',
  '/app/supplier/list',
  '/app/vehicle',
  '/app/vehicle/list',
  '/app/sales-order',
  '/app/sales-order/list',
  '/app/purchase-order',
  '/app/purchase-order/list'
];

// Cache ERPNext core assets
const CORE_ASSETS = [
  '/assets/frappe/css/desk.css',
  '/assets/frappe/js/frappe.min.js',
  '/assets/frappe/js/desk.min.js'
];

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching offline pages and core assets');
      // Cache pages (may fail for some, that's OK)
      return Promise.allSettled([
        cache.addAll(OFFLINE_PAGES),
        cache.addAll(CORE_ASSETS)
      ]).then(() => {
        console.log('[SW] Initial cache complete');
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip external URLs
  if (!url.origin.includes(self.location.origin)) {
    return;
  }

  // Handle file uploads offline
  if (request.method === 'POST' && url.pathname.includes('/api/method/upload_file')) {
    event.respondWith(handleOfflineFileUpload(request));
    return;
  }

  // Skip non-GET requests (except handled above)
  if (request.method !== 'GET') {
    return;
  }

  // API requests - try network first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response
          const responseClone = response.clone();
          // Cache successful responses
          if (response.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Network failed, try cache
          return caches.match(request).then((response) => {
            if (response) {
              return response;
            }
            // Return offline response for API calls
            return new Response(
              JSON.stringify({ 
                message: 'Offline - Data will sync when connection is restored',
                offline: true 
              }),
              {
                headers: { 'Content-Type': 'application/json' }
              }
            );
          });
        })
    );
    return;
  }

  // Static assets and pages - cache first, network fallback
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(request).then((response) => {
        // Don't cache if not a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        // Clone the response
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
        return response;
      });
    })
  );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  if (event.tag === 'sync-trip-data') {
    event.waitUntil(syncTripData());
  }
});

// Message handler for manual sync
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'SYNC_DATA') {
    event.waitUntil(syncTripData());
  }
});

// Sync function
async function syncTripData() {
  try {
    // This will be called by the main app's sync manager
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({ type: 'SYNC_REQUEST' });
    });
  } catch (error) {
    console.error('[SW] Sync error:', error);
  }
}

// Handle offline file uploads
async function handleOfflineFileUpload(request) {
  try {
    // Try to upload first
    const response = await fetch(request);
    if (response.ok) {
      return response;
    }
    throw new Error('Upload failed');
  } catch (error) {
    // If offline, store file for later sync
    const formData = await request.clone().formData();
    const file = formData.get('file');
    
    if (file) {
      // Store file in IndexedDB via message to client
      const clients = await self.clients.matchAll();
      clients.forEach((client) => {
        client.postMessage({ 
          type: 'STORE_OFFLINE_FILE',
          file: {
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: file.lastModified
          },
          formData: Object.fromEntries(formData)
        });
      });
      
      // Return success response (file will sync later)
      return new Response(
        JSON.stringify({ 
          message: {
            file_url: `offline://${Date.now()}-${file.name}`,
            file_name: file.name
          },
          offline: true
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    return new Response(
      JSON.stringify({ message: 'Upload failed - offline' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

