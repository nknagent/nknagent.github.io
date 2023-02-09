// Registering Service Worker
self.addEventListener('install', function (event) {
  //   console.log('Service Worker: Installing Service Worker ...', event);
  event.waitUntil(
    caches.open('static').then(function (cache) {
      return cache.addAll(['/index.html', '/static/js/bundle.js']);
    }),
  );
});

// Activating
self.addEventListener('activate', function (event) {
  //   console.log('Service Worker: Activating Service Worker ....', event);
  return self.clients.claim();
});

// Fetching
self.addEventListener('fetch', function (event) {
  //   event.respondWith(
  //     caches.match(event.request).then(function (response) {
  //       if (response) {
  //         return response;
  //       } else {
  //         return fetch(event.request).then(function (res) {
  //           return caches.open('dynamic').then(function (cache) {
  //             cache.put(event.request.url, res.clone());
  //             return res;
  //           });
  //         });
  //       }
  //     }),
  //   );
});

// Push Notifications
self.addEventListener('push', function (event) {
  console.log('Push Notification received', event);
  var data = { title: 'New!', content: 'Something new happened!', openUrl: '/' };
  if (event.data) {
    data = JSON.parse(event.data.text());
  }
  var options = {
    body: data.content,
    icon: '/images/icons/app-icon-96x96.png',
    badge: '/images/icons/app-icon-96x96.png',
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification Click
self.addEventListener('notificationclick', function (event) {
  var notification = event.notification;
  var action = event.action;
  console.log(notification);
  if (action === 'confirm') {
    console.log('Confirm was chosen');
    notification.close();
  } else {
    console.log(action);
    event.waitUntil(
      clients.matchAll().then(function (clis) {
        var client = clis.find(function (c) {
          return c.visibilityState === 'visible';
        });
        if (client !== undefined) {
          client.navigate(notification.data.openUrl);
          client.focus();
        } else {
          clients.openWindow(notification.data.openUrl);
        }
        notification.close();
      }),
    );
  }
});

// Syncing
self.addEventListener('sync', function (event) {
  console.log('Background syncing', event);
  if (event.tag === 'sync-new-posts') {
    console.log('Syncing new Posts');
    event.waitUntil(
      readAllData('sync-posts').then(function (data) {
        for (var dt of data) {
          var postData = new FormData();
          postData.append('id', dt.id);
          postData.append('title', dt.title);
          postData.append('location', dt.location);
          postData.append('rawLocationLat', dt.rawLocation.lat);
          postData.append('rawLocationLng', dt.rawLocation.lng);
          postData.append('file', dt.picture, dt.id + '.png');
          fetch('https://us-central1-pwagram-8f6b1.cloudfunctions.net/storePostData', {
            method: 'POST',
            body: postData,
          })
            .then(function (res) {
              console.log('Sent data', res);
              if (res.ok) {
                res.json().then(function (resData) {
                  deleteItemFromData('sync-posts', resData.id);
                });
              }
            })
            .catch(function (err) {
              console.log('Error while sending data', err);
            });
        }
      }),
    );
  }
});

// Background Sync
self.addEventListener('sync', function (event) {
  console.log('[Service Worker] Background syncing', event);
  if (event.tag === 'sync-new-posts') {
    console.log('[Service Worker] Syncing new Posts');
    event.waitUntil(
      readAllData('sync-posts').then(function (data) {
        for (var dt of data) {
          var postData = new FormData();
          postData.append('id', dt.id);
          postData.append('title', dt.title);
          postData.append('location', dt.location);
          postData.append('rawLocationLat', dt.rawLocation.lat);
          postData.append('rawLocationLng', dt.rawLocation.lng);
          postData.append('file', dt.picture, dt.id + '.png');
          fetch('https://us-central1-pwagram-8f6b1.cloudfunctions.net/storePostData', {
            method: 'POST',
            body: postData,
          })
            .then(function (res) {
              console.log('Sent data', res);
              if (res.ok) {
                res.json().then(function (resData) {
                  deleteItemFromData('sync-posts', resData.id);
                });
              }
            })
            .catch(function (err) {
              console.log('Error while sending data', err);
            });
        }
      }),
    );
  }
});
