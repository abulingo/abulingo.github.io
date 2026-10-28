/* ============================================================
   Abulingo — service worker de la WEB (modo sin internet)
   ------------------------------------------------------------
   Solo lo registra abu-offline.js, y solo para cuentas Super Pro.
   Es el mismo de la APK (abulingo_app/web_extra/sw-offline.js),
   cambiando lo que allá venía dentro del paquete:

   · Páginas del sitio (html, js, css): primero la red; sin red, la
     copia guardada en la caché "abu-paginas-v1".
   · Supabase REST (GET): primero la red; sin red, la copia local de
     las tablas (IndexedDB "abu-offline"), evaluando el filtro de
     PostgREST (eq, ilike, in, or, order, range, count...).
   · Supabase REST (POST/PATCH/DELETE): se aplica a la copia local; si
     no hay red se guarda en la cola y abu-offline.js la envía cuando
     vuelve internet.
   · Audios, imágenes, fuentes y librerías de CDN: de la caché primero.
   ============================================================ */
const SUPA = 'https://eylwewhqeaaqkgcxhgyv.supabase.co';
const CACHE_MEDIA = 'abu-media-v1';
const CACHE_API = 'abu-api-v1';
const CACHE_PAGINAS = 'abu-paginas-v1';
const TIMEOUT_RED = 7000;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

/* ---------------- IndexedDB ---------------- */
let dbPromesa = null;
function db() {
  if (dbPromesa) return dbPromesa;
  dbPromesa = new Promise((res, rej) => {
    const r = indexedDB.open('abu-offline', 1);
    r.onupgradeneeded = () => {
      const d = r.result;
      if (!d.objectStoreNames.contains('tablas')) d.createObjectStore('tablas');
      if (!d.objectStoreNames.contains('cola')) d.createObjectStore('cola', { autoIncrement: true });
      if (!d.objectStoreNames.contains('meta')) d.createObjectStore('meta');
    };
    r.onsuccess = () => res(r.result);
    r.onerror = () => { dbPromesa = null; rej(r.error); };
  });
  return dbPromesa;
}
async function idbGet(store, key) {
  const d = await db();
  return new Promise((res, rej) => {
    const q = d.transaction(store).objectStore(store).get(key);
    q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error);
  });
}
async function idbPut(store, key, val) {
  const d = await db();
  return new Promise((res, rej) => {
    const t = d.transaction(store, 'readwrite');
    if (key === undefined) t.objectStore(store).add(val); else t.objectStore(store).put(val, key);
    t.oncomplete = () => res(); t.onerror = () => rej(t.error);
  });
}

// Las tablas se leen enteras una vez y quedan en memoria mientras el SW vive.
const memTablas = new Map();
async function leerTabla(nombre) {
  if (memTablas.has(nombre)) return memTablas.get(nombre);
  const filas = await idbGet('tablas', nombre).catch(() => undefined);
  if (filas !== undefined) memTablas.set(nombre, filas);
  return filas; // undefined = esa tabla no se descargó
}
const pendientesGuardar = new Map();
function guardarTabla(nombre, filas) {
  memTablas.set(nombre, filas);
  clearTimeout(pendientesGuardar.get(nombre));
  pendientesGuardar.set(nombre, setTimeout(() => idbPut('tablas', nombre, filas).catch(() => {}), 300));
}

/* ---------------- Utilidades ---------------- */
function conTiempo(promesa, ms) {
  return new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error('timeout')), ms);
    promesa.then((v) => { clearTimeout(t); res(v); }, (e) => { clearTimeout(t); rej(e); });
  });
}
function json(cuerpo, status = 200, extra = {}) {
  return new Response(cuerpo === null ? null : JSON.stringify(cuerpo), {
    status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'X-Abu-Offline': '1', ...extra }
  });
}

/* ---------------- Evaluador de PostgREST ---------------- */
// Divide por comas de primer nivel (respeta paréntesis y comillas).
function dividir(s) {
  const out = []; let nivel = 0, comillas = false, cur = '';
  for (const ch of s) {
    if (ch === '"') comillas = !comillas;
    if (!comillas && ch === '(') nivel++;
    if (!comillas && ch === ')') nivel--;
    if (ch === ',' && nivel === 0 && !comillas) { out.push(cur); cur = ''; } else cur += ch;
  }
  if (cur !== '') out.push(cur);
  return out;
}
function quitarComillas(v) { return (v.length >= 2 && v[0] === '"' && v[v.length - 1] === '"') ? v.slice(1, -1) : v; }
function valorDe(fila, col) {
  // Soporta rutas JSON: flujo->a->>b
  const partes = col.split(/->>?/);
  let v = fila ? fila[partes[0]] : undefined;
  for (let i = 1; i < partes.length; i++) {
    if (v && typeof v === 'string') { try { v = JSON.parse(v); } catch { v = undefined; } }
    v = (v && typeof v === 'object') ? v[quitarComillas(partes[i])] : undefined;
  }
  return v;
}
function comparar(a, b) {
  const na = Number(a), nb = Number(b);
  if (a !== null && a !== '' && b !== '' && !isNaN(na) && !isNaN(nb) && typeof a !== 'boolean') return na - nb;
  return String(a).localeCompare(String(b));
}
function patron(p, flags) {
  const esc = p.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/[%*]/g, '.*').replace(/_/g, '.');
  return new RegExp('^' + esc + '$', flags);
}
function parseLista(v) {
  // in.(a,b,"c d")  ·  cs.{a,b}
  const dentro = v.replace(/^[({]/, '').replace(/[)}]$/, '');
  return dividir(dentro).map(x => quitarComillas(x.trim()));
}
function contiene(actual, buscado) {
  if (Array.isArray(buscado)) return Array.isArray(actual) && buscado.every(b => actual.some(a => String(a) === String(b)));
  if (buscado && typeof buscado === 'object') {
    if (!actual || typeof actual !== 'object') return false;
    return Object.keys(buscado).every(k => contiene(actual[k], buscado[k]) || JSON.stringify(actual[k]) === JSON.stringify(buscado[k]));
  }
  return String(actual) === String(buscado);
}
function cumple(fila, col, expr) {
  let neg = false;
  if (expr.startsWith('not.')) { neg = true; expr = expr.slice(4); }
  const i = expr.indexOf('.');
  const op = i < 0 ? expr : expr.slice(0, i);
  const val = i < 0 ? '' : expr.slice(i + 1);
  const a = valorDe(fila, col);
  let r = true;
  switch (op) {
    case 'eq': r = a !== null && a !== undefined && String(a) === quitarComillas(val); break;
    case 'neq': r = a !== null && a !== undefined && String(a) !== quitarComillas(val); break;
    case 'gt': r = a !== null && a !== undefined && comparar(a, val) > 0; break;
    case 'gte': r = a !== null && a !== undefined && comparar(a, val) >= 0; break;
    case 'lt': r = a !== null && a !== undefined && comparar(a, val) < 0; break;
    case 'lte': r = a !== null && a !== undefined && comparar(a, val) <= 0; break;
    case 'like': r = a !== null && a !== undefined && patron(quitarComillas(val)).test(String(a)); break;
    case 'ilike': r = a !== null && a !== undefined && patron(quitarComillas(val), 'i').test(String(a)); break;
    case 'in': r = parseLista(val).includes(String(a)); break;
    case 'is':
      if (val === 'null') r = a === null || a === undefined;
      else if (val === 'true') r = a === true;
      else if (val === 'false') r = a === false;
      else r = true;
      break;
    case 'cs': {
      let b;
      try { b = JSON.parse(val); } catch { b = parseLista(val); }
      let act = a;
      if (typeof act === 'string') { try { act = JSON.parse(act); } catch {} }
      r = contiene(act, b);
      break;
    }
    default: r = true; // operadores que no usamos: no filtran
  }
  return neg ? !r : r;
}
// or=(a.eq.1,and(b.gt.2,c.is.null))
function cumpleLogico(fila, tipo, cuerpo) {
  const items = dividir(cuerpo.replace(/^\(/, '').replace(/\)$/, ''));
  const evalItem = (it) => {
    it = it.trim();
    const m = it.match(/^(not\.)?(and|or)\((.*)\)$/);
    if (m) { const r = cumpleLogico(fila, m[2], '(' + m[3] + ')'); return m[1] ? !r : r; }
    const p = it.indexOf('.');
    return cumple(fila, it.slice(0, p), it.slice(p + 1));
  };
  return tipo === 'or' ? items.some(evalItem) : items.every(evalItem);
}

const RESERVADOS = new Set(['select', 'order', 'limit', 'offset', 'on_conflict', 'columns']);

function filtrar(filas, params) {
  const filtros = [];
  for (const [k, v] of params) {
    if (RESERVADOS.has(k)) continue;
    if (k === 'or' || k === 'and') filtros.push(f => cumpleLogico(f, k, v));
    else if (k === 'not.or' || k === 'not.and') filtros.push(f => !cumpleLogico(f, k.slice(4), v));
    else filtros.push(f => cumple(f, k, v));
  }
  return filtros.length ? filas.filter(f => filtros.every(fn => fn(f))) : filas.slice();
}
function ordenar(filas, order) {
  if (!order) return filas;
  const claves = dividir(order).map(o => {
    const p = o.split('.');
    return { col: p[0], desc: p.includes('desc'), nullsFirst: p.includes('nullsfirst') ? true : (p.includes('nullslast') ? false : null) };
  });
  return filas.sort((x, y) => {
    for (const c of claves) {
      const a = valorDe(x, c.col), b = valorDe(y, c.col);
      const an = a === null || a === undefined, bn = b === null || b === undefined;
      if (an || bn) {
        if (an && bn) continue;
        const nf = c.nullsFirst === null ? c.desc : c.nullsFirst; // PostgREST: nulls last en asc, first en desc
        return (an ? -1 : 1) * (nf ? 1 : -1);
      }
      const r = comparar(a, b);
      if (r) return c.desc ? -r : r;
    }
    return 0;
  });
}
function proyectar(filas, select) {
  if (!select || select.trim() === '*') return filas;
  const cols = dividir(select).map(s => s.trim()).filter(Boolean);
  if (cols.includes('*')) return filas;
  return filas.map(f => {
    const o = {};
    cols.forEach(c => {
      if (c.includes('(')) { const n = c.split(/[(:!]/)[0]; o[n] = null; return; } // relaciones: no las tenemos
      let alias = null, col = c;
      const dp = c.indexOf(':'); if (dp > 0 && c[dp + 1] !== ':') { alias = c.slice(0, dp); col = c.slice(dp + 1); }
      col = col.split('::')[0];
      const nombre = alias || col.split(/->>?/).pop();
      o[nombre] = valorDe(f, col);
    });
    return o;
  });
}

async function responderLocal(req, url, tabla) {
  const filas = await leerTabla(tabla);
  if (filas === undefined) {
    // Tabla no descargada: última respuesta guardada para esta misma URL.
    const c = await caches.open(CACHE_API);
    const r = await c.match(url.href);
    if (r) return r;
    if (req.headers.get('Accept')?.includes('vnd.pgrst.object')) return json({ code: 'PGRST116', message: 'Sin conexión', details: 'offline' }, 406);
    return json([], 200, { 'Content-Range': '*/0' });
  }
  const params = [...url.searchParams.entries()];
  let res = ordenar(filtrar(filas, params), url.searchParams.get('order'));
  const total = res.length;
  let offset = parseInt(url.searchParams.get('offset') || '0', 10) || 0;
  let limit = url.searchParams.has('limit') ? parseInt(url.searchParams.get('limit'), 10) : null;
  const rango = req.headers.get('Range');
  if (rango && /^\d+-\d+$/.test(rango)) { const [a, b] = rango.split('-').map(Number); offset = a; limit = b - a + 1; }
  res = res.slice(offset, limit === null ? undefined : offset + limit);
  const datos = proyectar(res, url.searchParams.get('select'));
  const hdr = { 'Content-Range': datos.length ? `${offset}-${offset + datos.length - 1}/${total}` : `*/${total}` };

  if (req.method === 'HEAD') return new Response(null, { status: 200, headers: { ...hdr, 'X-Abu-Offline': '1' } });
  if (req.headers.get('Accept')?.includes('vnd.pgrst.object')) {
    if (datos.length !== 1) return json({ code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned', details: `The result contains ${datos.length} rows` }, 406);
    return json(datos[0], 200, hdr);
  }
  return json(datos, 200, hdr);
}

/* Aplica una escritura a la copia local. Devuelve las filas afectadas. */
async function aplicarLocal(metodo, url, cuerpo, prefer) {
  const tabla = url.pathname.split('/rest/v1/')[1];
  let filas = await leerTabla(tabla);
  if (filas === undefined) filas = [];
  let afectadas = [];
  const params = [...url.searchParams.entries()];
  if (metodo === 'POST') {
    const nuevas = Array.isArray(cuerpo) ? cuerpo : [cuerpo];
    const upsert = /resolution=(merge|ignore)-duplicates/.test(prefer || '');
    const ignorar = /resolution=ignore-duplicates/.test(prefer || '');
    const claves = (url.searchParams.get('on_conflict') || 'id').split(',').map(s => s.trim());
    for (const n of nuevas) {
      const fila = { ...n };
      if (fila.id === undefined && !upsert) fila.id = 'local-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
      if (!fila.created_at) fila.created_at = new Date().toISOString();
      const i = upsert ? filas.findIndex(f => claves.every(k => f[k] !== undefined && String(f[k]) === String(fila[k]))) : -1;
      if (i >= 0) { if (!ignorar) filas[i] = { ...filas[i], ...n }; afectadas.push(filas[i]); }
      else { filas.push(fila); afectadas.push(fila); }
    }
  } else if (metodo === 'PATCH') {
    const objetivo = new Set(filtrar(filas, params));
    filas = filas.map(f => objetivo.has(f) ? (afectadas.push({ ...f, ...cuerpo }), { ...f, ...cuerpo }) : f);
  } else if (metodo === 'DELETE') {
    const borrar = new Set(filtrar(filas, params));
    afectadas = [...borrar];
    filas = filas.filter(f => !borrar.has(f));
  }
  guardarTabla(tabla, filas);
  return afectadas;
}

/* Las respuestas buenas de la red alimentan la copia local
   (solo si piden todas las columnas, para no guardar filas a medias). */
async function refrescarDesdeRed(tabla, url, datos) {
  const sel = url.searchParams.get('select');
  if (sel && sel.trim() !== '*') return;
  const filas = await leerTabla(tabla);
  if (filas === undefined) return;
  const lista = Array.isArray(datos) ? datos : (datos ? [datos] : []);
  if (!lista.length || lista.some(f => !f || f.id === undefined)) return;
  const porId = new Map(filas.map((f, i) => [String(f.id), i]));
  let cambio = false;
  lista.forEach(f => {
    const i = porId.get(String(f.id));
    if (i === undefined) { filas.push(f); cambio = true; }
    else if (JSON.stringify(filas[i]) !== JSON.stringify(f)) { filas[i] = f; cambio = true; }
  });
  if (cambio) guardarTabla(tabla, filas);
}

async function manejarRest(req, url) {
  const tabla = url.pathname.split('/rest/v1/')[1];
  if (tabla.startsWith('rpc/')) {
    try { return await fetch(req); } catch { return json({ message: 'Sin conexión' }, 503); }
  }
  if (req.method === 'GET' || req.method === 'HEAD') {
    try {
      const r = await conTiempo(fetch(req.clone()), TIMEOUT_RED);
      if (r.status === 401 || r.status >= 500) throw new Error('red ' + r.status);
      if (r.ok && req.method === 'GET') {
        const copia = r.clone();
        caches.open(CACHE_API).then(c => c.put(url.href, copia.clone())).catch(() => {});
        copia.json().then(d => refrescarDesdeRed(tabla, url, d)).catch(() => {});
      }
      return r;
    } catch {
      return responderLocal(req, url, tabla);
    }
  }

  // Escrituras
  const texto = await req.clone().text();
  let cuerpo = null; try { cuerpo = texto ? JSON.parse(texto) : null; } catch {}
  const prefer = req.headers.get('Prefer') || '';
  try {
    const r = await conTiempo(fetch(req.clone()), TIMEOUT_RED);
    if (r.status === 401 || r.status >= 500) throw new Error('red ' + r.status);
    if (r.ok) aplicarLocal(req.method, url, cuerpo, prefer).catch(() => {});
    return r;
  } catch {
    const afectadas = await aplicarLocal(req.method, url, cuerpo, prefer);
    await idbPut('cola', undefined, {
      metodo: req.method, url: url.href, cuerpo: texto,
      prefer, accept: req.headers.get('Accept') || '', creado: Date.now()
    });
    avisarClientes({ tipo: 'cola' });
    if (/return=representation/.test(prefer)) {
      if (req.headers.get('Accept')?.includes('vnd.pgrst.object')) return json(afectadas[0] || null, 201);
      return json(afectadas, 201);
    }
    return new Response(null, { status: req.method === 'POST' ? 201 : 204, headers: { 'X-Abu-Offline': '1' } });
  }
}

/* ---------------- Sesión ---------------- */
async function manejarAuth(req, url) {
  if (url.pathname.endsWith('/auth/v1/user') && req.method === 'GET') {
    try {
      const r = await conTiempo(fetch(req.clone()), TIMEOUT_RED);
      if (r.ok) r.clone().json().then(u => idbPut('meta', 'usuario', u)).catch(() => {});
      return r;
    } catch {
      const u = await idbGet('meta', 'usuario').catch(() => null);
      return u ? json(u) : json({ message: 'Sin conexión' }, 503);
    }
  }
  if (url.pathname.endsWith('/auth/v1/token') && url.searchParams.get('grant_type') === 'refresh_token') {
    const texto = await req.clone().text();
    try {
      const r = await conTiempo(fetch(req.clone()), TIMEOUT_RED);
      if (r.ok) r.clone().json().then(s => { idbPut('meta', 'sesion', s); if (s.user) idbPut('meta', 'usuario', s.user); }).catch(() => {});
      return r;
    } catch {
      // Sin red: sesión prestada con el último token, para no sacarte al login.
      const s = await idbGet('meta', 'sesion').catch(() => null);
      const u = (await idbGet('meta', 'usuario').catch(() => null)) || s?.user;
      if (!s || !u) return Response.error();
      let refresh = s.refresh_token;
      try { refresh = JSON.parse(texto).refresh_token || refresh; } catch {}
      const expira = 120; // corto: en cuanto vuelva internet se renueva de verdad
      return json({ ...s, refresh_token: refresh, user: u, expires_in: expira, expires_at: Math.floor(Date.now() / 1000) + expira });
    }
  }
  if (url.pathname.endsWith('/auth/v1/token')) {
    // Login con contraseña: guardamos la sesión para poder prestarla luego.
    const r = await fetch(req);
    if (r.ok) r.clone().json().then(s => { idbPut('meta', 'sesion', s); if (s.user) idbPut('meta', 'usuario', s.user); }).catch(() => {});
    return r;
  }
  return fetch(req);
}

/* ---------------- Medios y CDN ---------------- */
async function cacheMedio(req) {
  const c = await caches.open(CACHE_MEDIA);
  const hit = await c.match(req.url, { ignoreVary: true, ignoreSearch: false });
  if (hit) return hit;
  try {
    const r = await fetch(req);
    if (r.ok || r.type === 'opaque') c.put(req.url, r.clone()).catch(() => {});
    return r;
  } catch (e) {
    // Rangos de audio/video: intenta sin la parte de la consulta
    const sinQ = await c.match(req.url.split('?')[0], { ignoreVary: true });
    if (sinQ) return sinQ;
    throw e;
  }
}

// Páginas propias: siempre la versión más nueva si hay red (así los
// cambios publicados llegan al instante); sin red, la última guardada.
async function manejarPagina(req) {
  const c = await caches.open(CACHE_PAGINAS);
  try {
    const r = await conTiempo(fetch(req), TIMEOUT_RED);
    if (r.ok) c.put(req.url.split('#')[0], r.clone()).catch(() => {});
    return r;
  } catch (e) {
    const hit = await c.match(req, { ignoreSearch: true, ignoreVary: true });
    if (hit) return hit;
    if (req.mode === 'navigate') {
      const inicio = await c.match('/abulingo.html', { ignoreSearch: true });
      if (inicio) return inicio;
    }
    throw e;
  }
}

function avisarClientes(msg) {
  self.clients.matchAll().then(cs => cs.forEach(c => c.postMessage(msg))).catch(() => {});
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  let url;
  try { url = new URL(req.url); } catch { return; }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  if (url.origin === SUPA) {
    if (url.pathname.startsWith('/rest/v1/')) return e.respondWith(manejarRest(req, url));
    if (url.pathname.startsWith('/auth/v1/')) return e.respondWith(manejarAuth(req, url));
    if (url.pathname.startsWith('/storage/v1/object/') && req.method === 'GET') return e.respondWith(cacheMedio(req));
    if (url.pathname.startsWith('/functions/v1/')) {
      return e.respondWith(fetch(req).catch(() => json({ error: 'Sin conexión', offline: true }, 503)));
    }
    return;
  }
  if (url.origin === self.location.origin) {
    if (req.method === 'GET') e.respondWith(manejarPagina(req));
    return;
  }
  if (req.method !== 'GET') return;
  if (/youtube\.com|youtu\.be|googlevideo/.test(url.hostname)) return;
  e.respondWith(cacheMedio(req));
});

/* Envía la cola de cambios hechos sin internet. El token lo pasa la
   página (el SW no puede leer localStorage). Las peticiones que hace el
   propio SW no vuelven a pasar por su evento fetch. */
let enviando = false;
async function enviarCola(token, anon) {
  if (enviando) return 0;
  enviando = true;
  let enviados = 0;
  try {
    const d = await db();
    const items = await new Promise((res, rej) => {
      const out = []; const t = d.transaction('cola'); const c = t.objectStore('cola').openCursor();
      c.onsuccess = () => { const cur = c.result; if (cur) { out.push({ k: cur.key, v: cur.value }); cur.continue(); } };
      t.oncomplete = () => res(out); t.onerror = () => rej(t.error);
    });
    for (const { k, v } of items) {
      let r;
      try {
        r = await fetch(v.url, {
          method: v.metodo,
          headers: { apikey: anon, Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', Prefer: v.prefer || '', Accept: v.accept || 'application/json' },
          body: v.cuerpo || undefined
        });
      } catch { break; }
      if (r.status === 401 || r.status >= 500) break;
      if (!r.ok) console.warn('[sw] cambio descartado por el servidor', r.status, v.url);
      await new Promise((res) => { const t = d.transaction('cola', 'readwrite'); t.objectStore('cola').delete(k); t.oncomplete = res; t.onerror = res; });
      enviados++;
    }
  } catch (e) { console.warn('[sw] cola', e); }
  enviando = false;
  return enviados;
}

self.addEventListener('message', (e) => {
  if (e.data?.tipo === 'recargarTablas') memTablas.clear();
  if (e.data?.tipo === 'enviarCola') {
    e.waitUntil(enviarCola(e.data.token, e.data.anon).then(n => { if (e.source) e.source.postMessage({ tipo: 'colaEnviada', n }); }));
  }
});
