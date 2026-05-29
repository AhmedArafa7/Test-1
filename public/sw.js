self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.');
  let data = { title: 'بيتولوجي | Baytology', body: 'تنبيه جديد من بيتولوجي!' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'بيتولوجي | Baytology', body: event.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    dir: 'rtl',
    vibrate: [100, 50, 100],
    data: data
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click Received.');
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});
