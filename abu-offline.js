/* ============================================================
   Abulingo — "Guardar todo en este navegador" (solo Super Pro)
   ------------------------------------------------------------
   abulingo.html llama a AbuOffline.iniciar(esSuperPro) cuando ya
   conoce el plan de la cuenta:
   · Super Pro → registra el service worker (sw-offline.js) y agrega
     al menú "Usar sin internet", que descarga tablas, páginas,
     imágenes, audios y videos. Desde entonces los medios salen de la
     caché del navegador (no se vuelven a pedir a Supabase) y lo hecho
     sin conexión se sincroniza solo.
   · Otro plan → no hay botón; y si el navegador tenía una descarga
     de antes (p. ej. bajó de plan), se borra todo.
   Es la versión web de abulingo_app/web_extra/abu-app.js.
   ============================================================ */
(function () {
  if (window.AbuOffline) return;
  const SUPA = 'https://eylwewhqeaaqkgcxhgyv.supabase.co';
  const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5bHdld2hxZWFhcWtnY3hoZ3l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzMzAxODgsImV4cCI6MjA5OTkwNjE4OH0.Ji8huj-ny2VcMT5UQSjOuwUKz4k23quNS0fLk-gZr7A';
  const CACHE_MEDIA = 'abu-media-v1';
  const CACHE_PAGINAS = 'abu-paginas-v1';
  const CACHES = [CACHE_MEDIA, CACHE_PAGINAS, 'abu-api-v1'];

  function abrirDB() {
    return new Promise((res, rej) => {
      const r = indexedDB.open('abu-offline', 1);
      r.onupgradeneeded = () => {
        const d = r.result;
        if (!d.objectStoreNames.contains('tablas')) d.createObjectStore('tablas');
        if (!d.objectStoreNames.contains('cola')) d.createObjectStore('cola', { autoIncrement: true });
        if (!d.objectStoreNames.contains('meta')) d.createObjectStore('meta');
      };
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    });
  }
  async function idb(store, modo, fn) {
    const d = await abrirDB();
    return new Promise((res, rej) => {
      const t = d.transaction(store, modo); const s = t.objectStore(store);
      let out; const q = fn(s); if (q) q.onsuccess = () => { out = q.result; };
      t.oncomplete = () => res(out); t.onerror = () => rej(t.error);
    });
  }

  function sesion() {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (/^sb-.*-auth-token$/.test(k)) {
          const v = JSON.parse(localStorage.getItem(k));
          return v && (v.access_token ? v : v.currentSession);
        }
      }
    } catch {}
    return null;
  }

  /* ---------------- Enviar lo pendiente ---------------- */
  // El envío lo hace el SW; aquí solo se le pasa el token vigente.
  let esperaCola = null;
  function enviarCola() {
    if (!navigator.onLine || !navigator.serviceWorker || !navigator.serviceWorker.controller) return Promise.resolve(0);
    const s = sesion(); if (!s || !s.access_token) return Promise.resolve(0);
    if (esperaCola) return esperaCola.p;
    let fin; const p = new Promise(r => { fin = r; });
    esperaCola = { p, fin };
    navigator.serviceWorker.controller.postMessage({ tipo: 'enviarCola', token: s.access_token, anon: ANON });
    setTimeout(() => { if (esperaCola && esperaCola.p === p) { esperaCola = null; fin(0); } }, 60000);
    return p;
  }
  /* ---------------- Descarga para usar sin internet ---------------- */
  const TABLAS = [
    'palabras', 'frases', 'practica_textos', 'practica_videos', 'practica_frases', 'practica_escucha',
    'conversaciones', 'conversaciones_pronunciacion', 'conversaciones_pronunciacion_lineas',
    'textos_listening', 'grupos_ingles', 'anuncios_diarios', 'equipos', 'ranking_publico',
    'profiles', 'mazo', 'mazo_flujo', 'progreso_apps', 'listening_progreso', 'user_word_progress',
    'frases_puntuaciones', 'conversaciones_puntuaciones', 'uso_ia'
  ];
  const ESTATICOS = [
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.1/dist/umd/supabase.min.js',
    'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js',
    'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Work+Sans:wght@400;600;800&display=swap',
    'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Work+Sans:wght@400;600&display=swap',
    'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600;800&family=Space+Grotesk:wght@500;700&family=Work+Sans:wght@400;600;800&display=swap',
    'https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-940.mp3',
    'https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3',
    'https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3'
  ];
  const ES_MEDIO = /\.(mp3|wav|ogg|oga|m4a|aac|opus|png|jpe?g|gif|webp|svg|avif|mp4|webm)(\?|#|$)/i;

  function recogerURLs(valor, set) {
    if (!valor) return;
    if (typeof valor === 'string') {
      const t = valor.trim();
      if (/^https?:\/\/\S+$/.test(t) && !/youtube\.com|youtu\.be/.test(t) && (ES_MEDIO.test(t) || t.includes('/storage/v1/object/'))) {
        try { set.add(new URL(t).href); } catch {}
      } else if (t[0] === '{' || t[0] === '[') {
        try { recogerURLs(JSON.parse(t), set); } catch {}
      }
      return;
    }
    if (Array.isArray(valor)) { valor.forEach(v => recogerURLs(v, set)); return; }
    if (typeof valor === 'object') Object.values(valor).forEach(v => recogerURLs(v, set));
  }

  async function bajarTabla(nombre, token, alAvanzar) {
    const filas = []; const paso = 1000;
    for (let desde = 0; ; desde += paso) {
      const r = await fetch(`${SUPA}/rest/v1/${nombre}?select=*`, {
        headers: { apikey: ANON, Authorization: 'Bearer ' + token, 'Range-Unit': 'items', Range: `${desde}-${desde + paso - 1}` }
      });
      if (!r.ok) { if (desde === 0) return null; break; }
      const lote = await r.json();
      filas.push(...lote);
      alAvanzar && alAvanzar(filas.length);
      if (lote.length < paso) break;
    }
    return filas;
  }

  // Páginas del sitio: cada una y sus <script src> / <link href> propios.
  const PAGINAS = ['abulingo.html', 'listening.html', 'pronunciacion.html', 'gramatica.html', 'fonetica.html',
    'mundo_ingles.html', 'juego2.html', 'juego3.html', 'juego4.html', 'juego5.html', 'verificar.html'];
  async function guardarPaginas() {
    const cache = await caches.open(CACHE_PAGINAS);
    const extra = new Set(['/logo_abulingo.png', '/favicon.svg', '/icono.png']);
    await Promise.all(PAGINAS.map(async (p) => {
      const url = new URL(p, location.origin).href;
      try {
        const r = await fetch(url, { cache: 'no-cache' });
        if (!r.ok) return;
        const html = await r.clone().text();
        await cache.put(url, r);
        for (const m of html.matchAll(/<(?:script|link)[^>]+(?:src|href)=["']([^"'#]+)["']/g)) {
          const u = new URL(m[1], url);
          if (u.origin === location.origin && /\.(js|css|png|svg|webp|json)$/.test(u.pathname)) extra.add(u.pathname);
          else if (u.origin !== location.origin && /cdn|fonts\.googleapis|unpkg|cloudflare/.test(u.hostname) && !ESTATICOS.includes(u.href)) ESTATICOS.push(u.href);
        }
      } catch {}
    }));
    await Promise.all([...extra].map(async (p) => {
      try { const r = await fetch(p, { cache: 'no-cache' }); if (r.ok) await cache.put(new URL(p, location.origin).href, r); } catch {}
    }));
  }

  async function guardarEnCache(cache, url) {
    const ya = await cache.match(url, { ignoreVary: true });
    if (ya) return 0;
    let r = null;
    try { r = await fetch(url, { mode: 'cors', credentials: 'omit' }); } catch {}
    if (!r || !r.ok) { try { r = await fetch(url, { mode: 'no-cors', credentials: 'omit' }); } catch { r = null; } }
    if (!r || !(r.ok || r.type === 'opaque')) return -1;
    let tam = 0;
    try { tam = r.type === 'opaque' ? 0 : parseInt(r.headers.get('Content-Length') || '0', 10); } catch {}
    await cache.put(url, r.clone());
    // Hojas de estilo: también sus fuentes
    if (r.type !== 'opaque' && /\.css|fonts\.googleapis/.test(url)) {
      const css = await r.text().catch(() => '');
      const urls = [...css.matchAll(/url\(([^)]+)\)/g)].map(m => m[1].replace(/['"]/g, '')).filter(u => !u.startsWith('data:'));
      for (const u of urls) { try { await guardarEnCache(cache, new URL(u, url).href); } catch {} }
    }
    return tam;
  }

  let descargando = false;
  async function descargarTodo(ui) {
    if (descargando) return;
    if (!navigator.onLine) { ui.estado('⚠️ Necesitas internet para descargar. Conéctate e inténtalo otra vez.'); return; }
    const s = sesion();
    if (!s || !s.access_token) { ui.estado('⚠️ Primero inicia sesión.'); return; }
    descargando = true; ui.ocupado(true);
    try {
      // 0) Primero se envía lo pendiente, para no pisarlo con lo del servidor.
      await enviarCola();
      // 1) Tablas
      const urls = new Set();
      const resumen = {};
      for (let i = 0; i < TABLAS.length; i++) {
        const t = TABLAS[i];
        ui.estado(`📚 Descargando datos: ${t} (${i + 1}/${TABLAS.length})`, (i / TABLAS.length) * 30);
        const filas = await bajarTabla(t, s.access_token, (n) => ui.estado(`📚 Descargando datos: ${t} · ${n} filas`, (i / TABLAS.length) * 30));
        if (filas === null) continue; // sin permiso o no existe
        await idb('tablas', 'readwrite', st => { st.put(filas, t); });
        resumen[t] = filas.length;
        recogerURLs(filas, urls);
      }
      if (navigator.serviceWorker && navigator.serviceWorker.controller) navigator.serviceWorker.controller.postMessage({ tipo: 'recargarTablas' });

      // 2) Las páginas del sitio y sus scripts, para abrirlas sin red
      ui.estado('📄 Guardando las páginas de Abulingo…', 30);
      await guardarPaginas();

      // 3) Imágenes, audios, videos y librerías
      const lista = [...ESTATICOS, ...urls];
      const cache = await caches.open(CACHE_MEDIA);
      let hechos = 0, fallos = 0, bytes = 0, idx = 0;
      const trabajador = async () => {
        while (idx < lista.length) {
          const u = lista[idx++];
          const r = await guardarEnCache(cache, u).catch(() => -1);
          if (r < 0) fallos++; else bytes += r;
          hechos++;
          if (hechos % 5 === 0 || hechos === lista.length) {
            ui.estado(`🎧 Audios e imágenes: ${hechos}/${lista.length}${bytes ? ` · ${(bytes / 1048576).toFixed(1)} MB` : ''}`, 30 + (hechos / lista.length) * 70);
          }
        }
      };
      await Promise.all(Array.from({ length: 6 }, trabajador));

      const info = { fecha: new Date().toISOString(), tablas: resumen, medios: lista.length - fallos, fallos };
      await idb('meta', 'readwrite', st => { st.put(info, 'descarga'); });
      try { localStorage.setItem('abu-descarga', JSON.stringify(info)); } catch {}
      const totalFilas = Object.values(resumen).reduce((a, b) => a + b, 0);
      ui.estado(`✅ Listo: ${totalFilas} registros y ${lista.length - fallos} archivos guardados en este navegador.${fallos ? ` (${fallos} archivos no se pudieron bajar)` : ''} Ya puedes usar Abulingo sin internet.`, 100);
    } catch (e) {
      console.error('[abu-app] descarga', e);
      ui.estado('❌ La descarga se interrumpió: ' + (e && e.message ? e.message : e) + '. Puedes reintentar: continúa donde quedó.');
    }
    descargando = false; ui.ocupado(false);
  }

  /* ---------------- Interfaz ---------------- */
  function infoDescarga() { try { return JSON.parse(localStorage.getItem('abu-descarga') || 'null'); } catch { return null; } }

  function abrirPanel() {
    if (document.getElementById('abu-panel')) return;
    const info = infoDescarga();
    const el = document.createElement('div');
    el.id = 'abu-panel';
    el.innerHTML = `
      <div style="position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;font-family:'Work Sans',system-ui,sans-serif">
        <div style="background:#fff;border-radius:20px;max-width:420px;width:100%;padding:20px;box-shadow:0 20px 50px rgba(0,0,0,.3);text-align:center">
          <div style="font-size:40px">📥</div>
          <h3 style="font-weight:800;font-size:20px;color:#1e293b;margin:4px 0 6px">Usar sin internet</h3>
          <p style="font-size:14px;color:#64748b;margin:0 0 12px">Guarda en este navegador todas las imágenes, audios y videos (y las palabras y frases): así Abulingo ya no los vuelve a pedir a internet y también funciona sin conexión. Tu avance se guarda y se sincroniza solo cuando vuelva internet.</p>
          <p style="font-size:12px;color:#94a3b8;margin:0 0 12px">${info ? `Última descarga: ${new Date(info.fecha).toLocaleString()}` : 'Aún no has descargado nada.'}</p>
          <div style="height:10px;background:#f1f5f9;border-radius:99px;overflow:hidden;margin-bottom:8px"><div id="abu-barra" style="height:100%;width:0;background:linear-gradient(90deg,#FF7A00,#fbbf24);transition:width .3s"></div></div>
          <p id="abu-estado" style="font-size:13px;font-weight:700;color:#475569;min-height:36px;margin:0 0 12px"></p>
          <button id="abu-bajar" style="width:100%;background:#FF7A00;color:#fff;font-weight:800;border:0;border-radius:14px;padding:13px;font-size:16px;margin-bottom:8px">${info ? '🔄 Actualizar descarga' : '📥 Descargar todo'}</button>
          <button id="abu-cerrar" style="width:100%;background:#f1f5f9;color:#64748b;font-weight:700;border:0;border-radius:14px;padding:11px;font-size:14px">Cerrar</button>
        </div>
      </div>`;
    document.body.appendChild(el);
    const ui = {
      estado(t, pct) { const e = document.getElementById('abu-estado'); if (e) e.textContent = t; if (pct != null) { const b = document.getElementById('abu-barra'); if (b) b.style.width = Math.min(100, pct) + '%'; } },
      ocupado(v) { const b = document.getElementById('abu-bajar'); if (b) { b.disabled = v; b.style.opacity = v ? .5 : 1; } }
    };
    document.getElementById('abu-bajar').onclick = () => descargarTodo(ui);
    document.getElementById('abu-cerrar').onclick = () => { if (!descargando) el.remove(); else ui.estado('⏳ Espera a que termine la descarga…'); };
  }

  let chip = null;
  function actualizarChip() {
    if (!document.body) return;
    if (!chip) {
      chip = document.createElement('div');
      chip.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:10px;z-index:99998;background:#334155;color:#fff;font:700 12px system-ui,sans-serif;padding:6px 12px;border-radius:99px;box-shadow:0 4px 12px rgba(0,0,0,.25);pointer-events:none';
      chip.textContent = '📴 Sin internet · tu avance se guarda en este navegador';
      document.body.appendChild(chip);
    }
    chip.style.display = navigator.onLine ? 'none' : 'block';
  }
  function mostrarAviso(t) {
    if (!document.body) return;
    const a = document.createElement('div');
    a.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);top:14px;z-index:99999;background:#16a34a;color:#fff;font:700 13px system-ui,sans-serif;padding:8px 14px;border-radius:12px;box-shadow:0 6px 16px rgba(0,0,0,.25)';
    a.textContent = t; document.body.appendChild(a);
    setTimeout(() => a.remove(), 3500);
  }

  function agregarAlMenu() {
    const salir = document.getElementById('logout-btn');
    if (!salir || document.getElementById('abu-menu-offline')) return;
    const b = document.createElement('button');
    b.id = 'abu-menu-offline';
    b.className = 'w-full text-left flex items-center px-4 py-2 text-slate-700 hover:bg-orange-50';
    b.innerHTML = '<i class="fas fa-download fa-fw w-6 text-[#FF7A00]"></i><span>Usar sin internet</span><span class="ml-auto text-[10px] font-black text-[#FF7A00]">' + (infoDescarga() ? 'listo ✓' : 'descargar') + '</span>';
    b.onclick = (e) => { e.stopPropagation(); abrirPanel(); };
    salir.parentElement.insertBefore(b, salir);
  }


  // Borra todo lo descargado y quita el service worker.
  async function desactivar() {
    try {
      const regs = navigator.serviceWorker ? await navigator.serviceWorker.getRegistrations() : [];
      await Promise.all(regs.filter(r => /sw-offline\.js/.test((r.active || r.installing || r.waiting)?.scriptURL || '')).map(r => r.unregister()));
      await Promise.all(CACHES.map(c => caches.delete(c)));
      indexedDB.deleteDatabase('abu-offline');
      localStorage.removeItem('abu-descarga');
    } catch (e) { console.warn('[abu-offline] desactivar', e); }
  }

  let activo = false;
  async function iniciar(permitido) {
    if (!('serviceWorker' in navigator) || !window.caches || !window.indexedDB) return;
    if (!permitido) {
      document.getElementById('abu-menu-offline')?.remove();
      if (localStorage.getItem('abu-offline-on')) { localStorage.removeItem('abu-offline-on'); await desactivar(); }
      return;
    }
    if (activo) return;
    activo = true;
    localStorage.setItem('abu-offline-on', '1');
    try { await navigator.serviceWorker.register('/sw-offline.js', { scope: '/' }); }
    catch (e) { console.warn('[abu-offline] no se pudo registrar el service worker', e); }
    window.addEventListener('online', () => { actualizarChip(); setTimeout(enviarCola, 1500); });
    window.addEventListener('offline', actualizarChip);
    setInterval(enviarCola, 60000);
    navigator.serviceWorker.addEventListener('message', (e) => {
      if (!e.data) return;
      if (e.data.tipo === 'cola') setTimeout(enviarCola, 3000);
      if (e.data.tipo === 'colaEnviada') {
        if (e.data.n) mostrarAviso(`☁️ Se sincronizaron ${e.data.n} cambio(s) hechos sin internet`);
        if (esperaCola) { const f = esperaCola.fin; esperaCola = null; f(e.data.n); }
      }
    });
    actualizarChip();
    agregarAlMenu();
    setTimeout(enviarCola, 4000);
  }

  window.AbuOffline = { iniciar, abrir: () => abrirPanel() };
})();
