// Service Worker for Focus Timer Pro - Optimized v3
const CACHE_NAME = 'focus-timer-v3';
const urlsToCache = [
  '/My-timer/',
  '/My-timer/index.html',
  '/My-timer/app.js',
  '/My-timer/manifest.json'
  
self.addEventListener('message', event => {
    if (event.data.type === 'TIMER_STARTED') {
        const endTime = event.data.endTime;
        
        const checkTimer = setInterval(() => {
            if (Date.now() >= endTime) {
                self.registration.showNotification('زمان تمرکز به پایان رسید!', {
                    body: 'آمار شما با موفقیت ثبت شد.',
                    icon: '/My-timer/icon-192.png',
                    vibrate: [1000, 500, 1000], // لرزش قوی برای متوجه شدن در جیب
                    requireInteraction: true, // اعلان تا باز نشود باقی می‌ماند
                    tag: 'focus-timer',
                    renotify: true
                });
                clearInterval(checkTimer);
            }
        }, 1000);
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
