const CACHE="placar-rotina-v26";
const ASSETS=["./","./index.html","./manifest.webmanifest","./icons/icon-192.png","./icons/icon-512.png","./icons/apple-touch-icon.png"];
self.addEventListener("install",e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())); });
self.addEventListener("activate",e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET") return;
  var url=new URL(e.request.url);
  if(url.origin!==location.origin) return; // deixa Firebase e CDNs passarem direto
  // Pagina (HTML): SEMPRE tenta a versao nova primeiro; cache so como reserva offline.
  var isHTML = e.request.mode==="navigate" || url.pathname.endsWith("/") || url.pathname.endsWith("index.html");
  if(isHTML){
    e.respondWith(
      fetch(e.request).then(resp=>{
        try{ const c=resp.clone(); caches.open(CACHE).then(cc=>cc.put("./index.html",c)); }catch(_){}
        return resp;
      }).catch(()=> caches.match("./index.html").then(r=> r || caches.match("./")))
    );
    return;
  }
  // Demais arquivos (icones, manifest): cache primeiro, rede como reserva.
  e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request).then(resp=>{
    try{ const c=resp.clone(); caches.open(CACHE).then(cc=>cc.put(e.request,c)); }catch(_){}
    return resp;
  }).catch(()=> caches.match("./index.html"))));
});
