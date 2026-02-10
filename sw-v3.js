// Focus Champion - Service Worker v3.0
// Coordinated with app-v3-final.js

const CACHE_NAME = 'focus-champion-v3';
const urlsToCache = [
  '/My-timer/',
  '/My-timer/index.html',
  '/My-timer/app-v3-final.js',
  '/My-timer/manifest.json',
  '/My-timer/icon-192.png',
  '/My-timer/icon-512.png'
];

// Install service worker and cache files
self.addEventListener('install', event => {
  console.log('Service Worker v3: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker v3: Caching files');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.log('Service Worker v3: Cache failed', err);
      })
  );
  self.skipWaiting();
});

// Fetch from cache first, then network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
      .catch(err => {
        console.log('Service Worker v3: Fetch failed', err);
      })
  );
});

// Clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker v3: Activating...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker v3: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Handle messages from app
self.addEventListener('message', event => {
  console.log('Service Worker v3: Message received', event.data);
  
  if (event.data && event.data.type === 'TIMER_COMPLETE') {
    console.log('Service Worker v3: Timer completed');
    
    // Show notification

self.registration.showNotification('🎉 Focus Session Complete!', {
  body: 'Great work! Time to take a break.',
  icon: '/My-timer/icon-192.png',
  requireInteraction: true,
  // لرزش ممتد و قوی برای متوجه شدن در سایر برنامه‌ها
  vibrate: [1000, 500, 1000, 500, 1000, 500, 1000], 
  tag: 'focus-complete'
});

      data: { 
        type: 'timer-complete',
        timestamp: Date.now()
      },
      actions: [
        { action: 'view', title: 'View App' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    });
  }
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  console.log('Service Worker v3: Notification clicked', event.action);
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // Try to focus existing window
        for (let client of clientList) {
          if (client.url.includes('/My-timer/') && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window if none found
        if (clients.openWindow) {
          return clients.openWindow('/My-timer/');
        }
      })
  );
});

console.log('Service Worker v3.0 loaded and ready');
