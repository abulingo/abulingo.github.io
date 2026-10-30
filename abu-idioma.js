/* ============================================================
   Abulingo — idioma que aprende la persona (inglés o español)
   ------------------------------------------------------------
   Se carga PRIMERO en cada página (sin defer), antes de Supabase.

   · AbuIdioma.actual(): 'en' (aprende inglés, por defecto: así quedan
     todas las cuentas de antes) o 'es' (aprende español). Se guarda en
     los metadatos de la cuenta (user_metadata.idioma).
   · Si aprende ESPAÑOL, las tablas "palabras" y "frases" llegan al
     revés: lo que la app muestra como idioma a aprender (ingles /
     fraseingles) pasa a ser el español, el significado pasa a ser el
     inglés y el audio es el de español (bucket audios_es, voz de mujer
     o de hombre según el id). Las imágenes son las mismas.
   · La voz del navegador (speechSynthesis) habla en español.
   ============================================================ */
(function () {
  if (window.AbuIdioma) return;
  const SUPA = 'https://eylwewhqeaaqkgcxhgyv.supabase.co';
  const AUDIOS_ES = SUPA + '/storage/v1/object/public/audios_es/';

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
  function actual() {
    try { const f = localStorage.getItem('abu-idioma-forzado'); if (f === 'es' || f === 'en') return f; } catch {}
    return sesion()?.user?.user_metadata?.idioma === 'es' ? 'es' : 'en';
  }
  const ES = actual() === 'es';

  // Voz alterna por id: unas palabras con voz de mujer y otras de hombre.
  const voz = (id) => (Number(id) % 2 ? 'm' : 'f');
  const audioEs = (tabla, id) => `${AUDIOS_ES}${tabla}/${id}_${voz(id)}.mp3`;

  function palabraAlReves(w) {
    if (!w || typeof w !== 'object' || w.ingles === undefined || w.espanol === undefined || w.__es) return w;
    const en = w.ingles;
    w.ingles = w.espanol; w.espanol = en;
    if ('audio' in w && w.id != null) w.audio = audioEs('palabras', w.id);
    if ('fonetica' in w) w.fonetica = '';
    if ('mnemotecnica' in w) w.mnemotecnica = null;
    w.__es = true;
    return w;
  }
  function fraseAlReves(f) {
    if (!f || typeof f !== 'object' || f.fraseingles === undefined || f['fraseespañol'] === undefined || f.__es) return f;
    const en = f.fraseingles;
    f.fraseingles = f['fraseespañol']; f['fraseespañol'] = en;
    if ('audio_url' in f && f.id != null) f.audio_url = audioEs('frases', f.id);
    f.__es = true;
    return f;
  }
  const TABLAS = { palabras: palabraAlReves, frases: fraseAlReves };

  /* ---- Avance separado por idioma ----
     profiles.flujo es el avance de inglés (como siempre) y el de español
     va dentro, en flujo.__es. Para la app es transparente:
       · aprende español → al leer el perfil recibe flujo.__es como "flujo",
         y al guardarlo se mete de nuevo en __es sin tocar el de inglés.
       · aprende inglés → al guardar se conserva el __es que ya hubiera.   */
  const CLAVE_ES = '__es';
  let flujoGuardado = null; // último flujo COMPLETO (inglés + __es) visto del servidor
  const fetchOriginal = window.fetch.bind(window);
  const esJSON = (r) => (r.headers.get('content-type') || '').includes('json');
  const responder = (r, cuerpo) => {
    const h = new Headers(r.headers); h.delete('content-length'); h.delete('content-encoding');
    return new Response(JSON.stringify(cuerpo), { status: r.status, statusText: r.statusText, headers: h });
  };
  const filasDe = (d) => (Array.isArray(d) ? d : (d ? [d] : []));
  const mapear = (d, fn) => (Array.isArray(d) ? d.map(fn) : fn(d));

  function flujoParaApp(fila) {
    if (!fila || typeof fila !== 'object' || !('flujo' in fila)) return fila;
    const completo = fila.flujo && typeof fila.flujo === 'object' ? fila.flujo : null;
    if (completo) flujoGuardado = completo;
    if (ES) fila.flujo = completo && completo[CLAVE_ES] ? completo[CLAVE_ES] : null;
    return fila;
  }
  // Antes de guardar se lee el flujo actual del servidor (con las mismas
  // credenciales de la petición), para no pisar la parte del otro idioma
  // aunque haya otra pestaña abierta con datos viejos.
  async function flujoCompletoActual(uid, cabeceras) {
    try {
      const h = new Headers();
      ['apikey', 'authorization'].forEach(k => { const v = cabeceras.get(k); if (v) h.set(k, v); });
      const r = await fetchOriginal(`${SUPA}/rest/v1/profiles?select=flujo&id=eq.${encodeURIComponent(uid)}`, { headers: h });
      if (r.ok) { const d = await r.json(); flujoGuardado = (d && d[0] && d[0].flujo) || {}; }
    } catch {}
    return flujoGuardado || {};
  }

  async function flujoParaServidor(cuerpo, uid, cabeceras) {
    const filas = filasDe(cuerpo);
    if (!filas.some(f => f && typeof f === 'object' && f.flujo && typeof f.flujo === 'object')) return null;
    const previo = await flujoCompletoActual(uid, cabeceras);
    const nuevo = mapear(cuerpo, (f) => {
      if (!f || typeof f !== 'object' || !f.flujo || typeof f.flujo !== 'object') return f;
      let completo;
      if (ES) completo = { ...previo, [CLAVE_ES]: f.flujo };
      else completo = (previo[CLAVE_ES] && !f.flujo[CLAVE_ES]) ? { ...f.flujo, [CLAVE_ES]: previo[CLAVE_ES] } : f.flujo;
      flujoGuardado = completo;
      return { ...f, flujo: completo };
    });
    return nuevo;
  }

  window.fetch = async function (input, init) {
    let url;
    try { url = new URL(typeof input === 'string' ? input : input.url, location.href); } catch { return fetchOriginal(input, init); }
    const m = url.origin === SUPA && url.pathname.match(/^\/rest\/v1\/(palabras|frases|profiles|user_word_progress)$/);
    if (!m) return fetchOriginal(input, init);
    // Avance antiguo (solo de inglés): quien aprende español no lo importa.
    if (m[1] === 'user_word_progress') {
      if (ES) return new Response('[]', { status: 200, headers: { 'Content-Type': 'application/json', 'Content-Range': '*/0' } });
      return fetchOriginal(input, init);
    }
    const tabla = m[1];
    const metodo = (init?.method || (typeof input === 'object' && input.method) || 'GET').toUpperCase();

    // Escrituras del perfil con flujo: mezclar con el del otro idioma.
    if (tabla === 'profiles' && (metodo === 'PATCH' || metodo === 'POST') && init && typeof init.body === 'string') {
      try {
        const uid = (url.searchParams.get('id') || '').replace(/^eq\./, '') || sesion()?.user?.id;
        const nuevo = await flujoParaServidor(JSON.parse(init.body), uid, new Headers(init.headers || {}));
        if (nuevo) init = { ...init, body: JSON.stringify(nuevo) };
      } catch {}
    }
    const r = await fetchOriginal(input, init);
    if (!r.ok || !esJSON(r)) return r;
    try {
      if (tabla === 'profiles') {
        const datos = await r.clone().json();
        if (!filasDe(datos).some(f => f && typeof f === 'object' && 'flujo' in f)) return r;
        return responder(r, mapear(datos, flujoParaApp));
      }
      if (!ES || metodo !== 'GET') return r;
      const datos = await r.clone().json();
      return responder(r, mapear(datos, TABLAS[tabla]));
    } catch { return r; }
  };

  if (ES) {
    // Respaldo local del avance (abulingo_flujo_<uid>): uno por idioma.
    try {
      const get = Storage.prototype.getItem, set = Storage.prototype.setItem, del = Storage.prototype.removeItem;
      const k = (key) => (typeof key === 'string' && key.startsWith('abulingo_flujo_') ? key + '_es' : key);
      Storage.prototype.getItem = function (key) { return get.call(this, k(key)); };
      Storage.prototype.setItem = function (key, v) { return set.call(this, k(key), v); };
      Storage.prototype.removeItem = function (key) { return del.call(this, k(key)); };
    } catch {}

    // Voz del navegador en español (todo lo que se lee en voz alta es el idioma que se aprende).
    if (window.speechSynthesis) {
      const hablar = window.speechSynthesis.speak.bind(window.speechSynthesis);
      window.speechSynthesis.speak = function (u) {
        try {
          u.lang = 'es-US';
          const vs = window.speechSynthesis.getVoices();
          u.voice = vs.find(v => /es[-_](US|MX|CO|419)/i.test(v.lang)) || vs.find(v => /^es/i.test(v.lang)) || null;
        } catch {}
        return hablar(u);
      };
    }
    document.documentElement.setAttribute('data-aprende', 'es');
    // La fonética guardada es la del inglés: no aplica a quien aprende español.
    const css = document.createElement('style');
    css.textContent = '#btn-show-phonetic,#txt-phonetic{display:none!important}';
    document.head.appendChild(css);
    document.documentElement.lang = 'en';
    iniciarTraductor();
  }

  /* ---- Interfaz en inglés (solo para quien aprende español) ----
     i18n-en.json: texto de la interfaz en español → inglés. Se cambia cada
     texto que aparece en pantalla (y placeholder/title/aria-label, y los
     prompt/confirm/alert). Las frases largas se reemplazan dentro del
     texto; las de una sola palabra solo si el texto es exactamente esa
     palabra, para no traducir por error el vocabulario que se estudia.
     Para excluir algo: data-no-tr en el elemento o un ancestro.        */
  function iniciarTraductor() {
    let dic = null, patron = null;
    const NO = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'CODE', 'PRE']);
    const traducir = (t) => {
      if (!dic || !t || !/[A-Za-zÁÉÍÓÚáéíóúñÑ¿¡]/.test(t)) return t;
      const lim = t.trim();
      if (dic.has(lim)) return t.replace(lim, dic.get(lim));
      return patron ? t.replace(patron, (m) => dic.get(m) ?? m) : t;
    };
    const ATR = ['placeholder', 'title', 'aria-label'];
    function nodo(n) {
      if (n.nodeType === 3) {
        const p = n.parentElement;
        if (!p || NO.has(p.tagName) || p.closest('[data-no-tr]')) return;
        const v = traducir(n.nodeValue);
        if (v !== n.nodeValue) n.nodeValue = v;
      } else if (n.nodeType === 1) {
        if (NO.has(n.tagName) || n.hasAttribute('data-no-tr')) return;
        for (const a of ATR) { const v = n.getAttribute(a); if (v) { const t = traducir(v); if (t !== v) n.setAttribute(a, t); } }
        if (n.tagName === 'INPUT' && /^(button|submit)$/i.test(n.type) && n.value) n.value = traducir(n.value);
        for (const h of n.childNodes) nodo(h);
      }
    }
    const obs = new MutationObserver((ms) => {
      for (const m of ms) {
        if (m.type === 'characterData') nodo(m.target);
        else if (m.type === 'attributes') nodo(m.target.nodeType === 1 ? m.target : m.target.parentElement);
        else m.addedNodes.forEach(nodo);
      }
    });
    const escapar = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    fetch('i18n-en.json').then(r => r.json()).then(j => {
      dic = new Map(Object.entries(j));
      const largas = [...dic.keys()].filter(k => /\s/.test(k.trim()) && k.trim().length >= 4).sort((a, b) => b.length - a.length);
      if (largas.length) patron = new RegExp('(?<![\\p{L}])(?:' + largas.map(escapar).join('|') + ')(?![\\p{L}])', 'gu');
      const arrancar = () => {
        document.title = traducir(document.title);
        nodo(document.body);
        obs.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATR });
      };
      if (document.body) arrancar(); else document.addEventListener('DOMContentLoaded', arrancar);
    }).catch(() => {});
    for (const f of ['alert', 'confirm', 'prompt']) {
      const orig = window[f].bind(window);
      window[f] = (msg, ...r) => orig(traducir(String(msg ?? '')), ...r);
    }
  }

  // Cambia el idioma de la cuenta y recarga.
  async function cambiar(nuevo, dbClient) {
    nuevo = nuevo === 'es' ? 'es' : 'en';
    try { localStorage.removeItem('abu-idioma-forzado'); } catch {}
    if (dbClient) {
      const { error } = await dbClient.auth.updateUser({ data: { idioma: nuevo } });
      if (error) throw error;
    }
    location.reload();
  }

  window.AbuIdioma = { actual: () => (ES ? 'es' : 'en'), aprendeEspanol: ES, cambiar, palabraAlReves, fraseAlReves };
})();
