/* ============================================================================
   AVANCE DE LAS APPS SUELTAS EN SUPABASE  ·  abu-progreso.js
   ----------------------------------------------------------------------------
   mundo_ingles.html (el juego), fonetica.html y listening.html guardan todo
   su avance en la tabla `progreso_apps` (una fila por usuario y app, con el
   JSON completo en `datos`). RLS: cada quien solo lee y escribe lo suyo.

   Además se guarda una copia en localStorage para no perder nada si se cae
   la conexión; al abrir la app gana la copia más reciente (campo `_t`).

   USO:
     const r = await AbuProgreso.iniciar({ app: 'fonetica' });
     // r = { db, user, datos }  (datos = null si nunca ha jugado)
     AbuProgreso.guardar(datos);      // guarda local ya y en la nube en unos segundos
     AbuProgreso.guardarYa();         // fuerza la subida (al salir de la página)
============================================================================ */
(function () {
  'use strict';

  const SUPABASE_URL = 'https://eylwewhqeaaqkgcxhgyv.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5bHdld2hxZWFhcWtnY3hoZ3l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzMzAxODgsImV4cCI6MjA5OTkwNjE4OH0.Ji8huj-ny2VcMT5UQSjOuwUKz4k23quNS0fLk-gZr7A';
  const ESPERA_MS = 4000;

  let db = null, user = null, app = null, token = null;
  let pendiente = null, timer = null, subiendo = false;

  const claveLocal = () => `abu-progreso:${app}:${user ? user.id : 'anon'}`;

  function leerLocal() {
    try { return JSON.parse(localStorage.getItem(claveLocal())) || null; } catch { return null; }
  }
  function escribirLocal(datos) {
    try { localStorage.setItem(claveLocal(), JSON.stringify(datos)); } catch { /* sin almacenamiento */ }
  }

  async function iniciar(opts) {
    app = opts.app;
    db = opts.dbClient || db || window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: { session } } = await db.auth.getSession();
    if (!session) {
      if (opts.redirigir !== false) window.location.href = 'index.html';
      return null;
    }
    user = session.user;
    token = session.access_token;
    db.auth.onAuthStateChange((_ev, s) => { if (s) token = s.access_token; });

    const local = leerLocal();
    let remoto = null;
    try {
      const { data, error } = await db.from('progreso_apps').select('datos')
        .eq('user_id', user.id).eq('app', app).maybeSingle();
      if (error) console.warn('[progreso] no se pudo leer:', error.message);
      else if (data) remoto = data.datos;
    } catch (e) { console.warn('[progreso] sin conexión:', e); }

    let datos = remoto;
    if (local && (!remoto || (local._t || 0) > (remoto._t || 0))) {
      datos = local;
      pendiente = local;          // la copia local es más nueva: se sube
      programar();
    }
    return { db, user, datos };
  }

  function programar() {
    clearTimeout(timer);
    timer = setTimeout(subir, ESPERA_MS);
  }

  async function subir() {
    if (!pendiente || !user || subiendo) return;
    const datos = pendiente;
    pendiente = null;
    subiendo = true;
    try {
      const { error } = await db.from('progreso_apps').upsert(
        { user_id: user.id, app, datos, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,app' });
      if (error) { console.warn('[progreso] no se pudo guardar:', error.message); pendiente = pendiente || datos; programar(); }
    } catch (e) {
      pendiente = pendiente || datos;
      programar();
    } finally { subiendo = false; }
  }

  function guardar(datos) {
    if (!user) return;
    datos._t = Date.now();
    escribirLocal(datos);
    pendiente = datos;
    programar();
  }

  /* Al cerrar la pestaña no da tiempo a esperar una promesa: se manda con
     fetch keepalive directo a PostgREST (el navegador lo termina aunque la
     página ya no exista). */
  function guardarYa() {
    clearTimeout(timer);
    if (!pendiente || !user || !token) return;
    const datos = pendiente;
    pendiente = null;
    try {
      fetch(`${SUPABASE_URL}/rest/v1/progreso_apps?on_conflict=user_id,app`, {
        method: 'POST',
        keepalive: true,
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates,return=minimal'
        },
        body: JSON.stringify({ user_id: user.id, app, datos, updated_at: new Date().toISOString() })
      }).catch(() => { pendiente = pendiente || datos; });
    } catch { pendiente = pendiente || datos; }
  }

  window.addEventListener('pagehide', guardarYa);
  document.addEventListener('visibilitychange', () => { if (document.hidden) guardarYa(); });

  window.AbuProgreso = { iniciar, guardar, guardarYa, get usuario() { return user; }, get db() { return db; } };
})();
