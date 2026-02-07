// Service Worker for Focus Timer Pro
const CACHE_NAME = 'focus-timer-v2';
const urlsToCache = [
  '/My-timer/',
  '/My-timer/index.html',
  '/My-timer/app.js',
  '/My-timer/manifest.json',
  '/My-timer/icon-192.png',
  '/My-timer/icon-512.png'
];

// Install service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cache opened');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Fetch from cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Update service worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// CRITICAL: Check for completed timers periodically
setInterval(() => {
  const isRunning = self.registration && checkTimerStatus();
  if (isRunning) {
    console.log('Service Worker: Checking timer in background');
  }
}, 5000); // Check every 5 seconds

function checkTimerStatus() {
  // This will be called by the main app
  return false;
}

// Handle messages from main app
self.addEventListener('message', event => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'CHECK_TIMER') {
    const endTime = event.data.endTime;
    const now = Date.now();
    
    if (now >= endTime) {
      console.log('Service Worker: Timer completed!');
      // Show notification and play sound
      self.registration.showNotification('🎉 Focus Session Complete!', {
        body: 'Timer finished! Tap to see your progress.',
        icon: '/My-timer/icon-192.png',
        badge: '/My-timer/icon-72.png',
        requireInteraction: true,
        vibrate: [400, 200, 400, 200, 400, 200, 400, 200, 400],
        tag: 'focus-complete',
        data: { 
          type: 'timer-complete',
          url: '/My-timer/'
        },
        actions: [
          { action: 'view', title: 'View App' },
          { action: 'dismiss', title: 'Dismiss' }
        ]
      });
      
      // Notify the app
      event.ports[0].postMessage({ completed: true });
    } else {
      event.ports[0].postMessage({ completed: false, remaining: Math.round((endTime - now) / 1000) });
    }
  }
  
  if (event.data && event.data.type === 'TIMER_COMPLETE') {
    // Show notification
    self.registration.showNotification('🎉 Focus Session Complete!', {
      body: 'Great work! Time to take a break.',
      icon: '/My-timer/icon-192.png',
      badge: '/My-timer/icon-72.png',
      requireInteraction: true,
      vibrate: [400, 200, 400, 200, 400, 200, 400, 200, 400],
      tag: 'focus-complete',
      data: { 
        type: 'timer-complete',
        duration: event.data.duration
      }
    });
  }
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event.action);
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // Check if app is already open
        for (let client of clientList) {
          if (client.url.includes('/My-timer/') && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window if not
        if (clients.openWindow) {
          return clients.openWindow('/My-timer/');
        }
      })
  );
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', event => {
  if (event.tag === 'check-timer') {
    event.waitUntil(checkAndNotifyTimer());
  }
});

async function checkAndNotifyTimer() {
  // This will check timer status in background
  console.log('Periodic sync: Checking timer');
}

console.log('Service Worker v2 loaded');
