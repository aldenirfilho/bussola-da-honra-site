'use strict';
importScripts('pwa-assets.js');
const base = new URL('./', self.location.href);
const publicUrls = new Set(HONRA_FILES.map(path => new URL(path, base).href));
function publicKey(url) {
  const parsed = new URL(url);parsed.search = '';parsed.hash = '';
  if (parsed.origin !== base.origin || !parsed.pathname.startsWith(base.pathname)) return null;
  if (parsed.pathname === base.pathname) parsed.pathname += 'index.html';
  if (['index', 'aplicativo', 'mapa', 'agentes'].some(name => parsed.pathname === base.pathname + name)) parsed.pathname += '.html';
  return publicUrls.has(parsed.href) ? parsed.href : null;
}
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(HONRA_CACHE);
    for (const path of HONRA_FILES) {
      const url = new URL(path,base);
      const response = await fetch(url, { cache: 'reload' });
      if (!response.ok) throw Error('Arquivo público indisponível: '+path);
      // Remove redirect metadata so canonical .html redirects also work offline.
      await cache.put(url, new Response(await response.arrayBuffer(), { status: response.status, statusText: response.statusText, headers: response.headers }));
    }
  })());
  // Do not skipWaiting: replacing an open exercise could discard a personal draft.
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith('honra-public-') && name !== HONRA_CACHE).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const key = publicKey(event.request.url);
  if (!key) return; // External links, APIs and payment destinations are never cached.
  event.respondWith((async () => {
    try { const response = await fetch(event.request);if (response.ok) return response; }
    catch { /* Reopen the preinstalled public edition when offline. */ }
    const cached = await (await caches.open(HONRA_CACHE)).match(key);
    return cached || new Response('Conteúdo indisponível sem internet. Reconecte para preparar esta edição.', { status: 503, headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
  })());
});
