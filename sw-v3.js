// Focus Champion - Service Worker v5.0
const CACHE_NAME = 'focus-champion-v5';
const urlsToCache = [
  '/My-timer/',
  '/My-timer/index.html',
  '/My-timer/manifest.json',
  '/My-timer/icon-192.png',
  '/My-timer/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.log('SW Cache error:', err))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request)
        .then(response => response || caches.match('/My-timer/index.html'))
      )
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'TIMER_COMPLETE') {
    self.registration.showNotification('🎉 Focus Session Complete!', {
      body: 'Great work! Time to take a break.',
      icon: '/My-timer/icon-192.png',
      badge: '/My-timer/icon-192.png',
      requireInteraction: true,
      vibrate: [400, 200, 400, 200, 400],
      tag: 'focus-complete',
      actions: [
        { action: 'view', title: 'Open App' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    });
  }
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        for (let client of clientList) {
          if (client.url.includes('/My-timer/') && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) return clients.openWindow('/My-timer/');
      })
  );
});
