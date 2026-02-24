self.addEventListener('push', function (event) {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'Notifikasi PPDB', body: 'Ada pembaruan status pendaftaran.' };
  }

  const title = data.title || 'Notifikasi PPDB';
  const options = {
    body: data.body || 'Ada pembaruan status pendaftaran.',
    icon: '/favicon.ico',
    data: data.data || {},
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const url = event.notification.data && event.notification.data.url;
  if (url) {
    event.waitUntil(clients.openWindow(url));
  }
});
