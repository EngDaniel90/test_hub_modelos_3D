self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('p84-hub-v2').then(cache => cache.addAll([
      './',
      './index.html',
      './styles.css',
      './scripts.js',
      './links.json',
      './images/'
    ]))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});