// 웃음이 넘치는 교실 - 오프라인용 서비스 워커
const VER = 'classroom-v34';
const CORE = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './forms/absence.pdf', './forms/parent-opinion.pdf'];
const CDN = ['cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VER).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VER).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // 같은 사이트: 인터넷이 되면 항상 최신 버전, 안 되면 저장해 둔 버전
  if (url.origin === location.origin){
    e.respondWith(fetch(req.url, {cache: 'no-cache', credentials: 'same-origin'}).then(res => {
      if (res.ok){ const cp = res.clone(); caches.open(VER).then(c => c.put(req, cp)); }
      return res;
    }).catch(() => caches.match(req, {ignoreSearch: true}).then(r => r || caches.match('./index.html'))));
    return;
  }
  // 글꼴·PDF 도구: 한 번 받으면 저장해 두고 사용
  if (CDN.includes(url.hostname)){
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      const cp = res.clone(); caches.open(VER).then(c => c.put(req, cp)); return res;
    })));
  }
  // 날씨·급식 같은 실시간 정보는 저장하지 않음
});
