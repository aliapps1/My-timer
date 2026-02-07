// Service Worker for Focus Timer Pro - Optimized v3
const CACHE_NAME = 'focus-timer-v3';
const urlsToCache = [
  '/My-timer/',
  '/My-timer/index.html',
  '/My-timer/app.js',
  '/My-timer/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// این بخش مسئول زنده نگه داشتن تایمر در پس‌زمینه است
self.addEventListener('message', event => {
  if (event.data.type === 'START_TIMER') {
    const endTime = event.data.endTime;
    
    // ایجاد یک حلقه انتظار در پس‌زمینه
    const checkTimer = () => {
      const now = Date.now();
      if (now >= endTime) {
        showFinishedNotification();
      } else {
        // هر ۵ ثانیه چک کن که زمان تمام شده یا نه
        setTimeout(checkTimer, 5000);
      }
    };
    checkTimer();
  }
});

function showFinishedNotification() {
  self.registration.showNotification('🎉 زمان به پایان رسید!', {
    body: 'تایمر شما با موفقیت تمام شد. برای مشاهده آمار کلیک کنید.',
    icon: '/My-timer/icon-192.png',
    vibrate: [500, 110, 500, 110, 450, 110, 200, 110, 170, 40, 450, 110, 200, 110, 170, 40],
    requireInteraction: true, // تا وقتی کاربر کلیک نکند پیام حذف نمی‌شود
    tag: 'timer-done'
  });
}

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      if (windowClients.length > 0) return windowClients[0].focus();
      return clients.openWindow('/My-timer/');
    })
  );
});
