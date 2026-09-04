/* ══════════════════════════════════════════════════════════════════════
   ABU ANALÍTICA — recoge todo lo que el navegador puede saber del visitante
   y lo envía a la Edge Function "analitica", que le añade IP, país, ciudad
   e ISP (eso el navegador NO lo puede ver por sí solo).

   API pública:
     AbuTrack.clic('nombre_boton', { extra })   → registra un clic
     AbuTrack.vista('nombre_seccion')           → registra una vista interna
     AbuTrack.datos()                           → devuelve lo recolectado
   Cualquier elemento con  data-track="nombre"  se registra solo al pulsarlo.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var FN = 'https://eylwewhqeaaqkgcxhgyv.supabase.co/functions/v1/analitica';

  var t0 = Date.now();
  var visitId = null;
  var clics = 0;
  var scrollMax = 0;
  var cerrado = false;

  /* ── utilidades ─────────────────────────────────────────────────── */
  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }
  function ls(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; }
  }
  function ss(k, v) {
    try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; }
  }

  /* ── identidad anónima y de sesión ───────────────────────────────── */
  var visitorId = ls('abu_vid');
  var esPrimera = !visitorId;
  if (!visitorId) { visitorId = uuid(); ls('abu_vid', visitorId); ls('abu_v1', new Date().toISOString()); }
  var previas = parseInt(ls('abu_vcount') || '0', 10);
  ls('abu_vcount', String(previas + 1));

  var sessionId = ss('abu_sid');
  if (!sessionId) { sessionId = uuid(); ss('abu_sid', sessionId); }

  /* ── usuario logueado (se lee del token de Supabase) ─────────────── */
  function usuario() {
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (/^sb-.*-auth-token$/.test(k)) {
          var j = JSON.parse(localStorage.getItem(k));
          var u = j && (j.user || (j.currentSession && j.currentSession.user));
          if (u) return { id: u.id, email: u.email || null };
        }
      }
    } catch (e) {}
    return { id: null, email: null };
  }

  /* ── navegador, motor y sistema operativo ────────────────────────── */
  function parseUA(ua) {
    var r = { navegador: null, navegador_version: null, motor: null, so: null, so_version: null };
    var m;
    if ((m = ua.match(/Edg[A-Z]?\/([\d.]+)/)))            { r.navegador = 'Edge';    r.navegador_version = m[1]; }
    else if ((m = ua.match(/OPR\/([\d.]+)/)))             { r.navegador = 'Opera';   r.navegador_version = m[1]; }
    else if ((m = ua.match(/SamsungBrowser\/([\d.]+)/)))  { r.navegador = 'Samsung Internet'; r.navegador_version = m[1]; }
    else if ((m = ua.match(/Firefox\/([\d.]+)/)))         { r.navegador = 'Firefox'; r.navegador_version = m[1]; }
    else if ((m = ua.match(/Chrome\/([\d.]+)/)))          { r.navegador = 'Chrome';  r.navegador_version = m[1]; }
    else if ((m = ua.match(/Version\/([\d.]+).*Safari/))) { r.navegador = 'Safari';  r.navegador_version = m[1]; }

    if (/Firefox/.test(ua)) r.motor = 'Gecko';
    else if (/AppleWebKit/.test(ua)) r.motor = /Chrome|Chromium|Edg|OPR/.test(ua) ? 'Blink' : 'WebKit';

    if ((m = ua.match(/Windows NT ([\d.]+)/))) {
      r.so = 'Windows';
      r.so_version = { '10.0': '10/11', '6.3': '8.1', '6.2': '8', '6.1': '7' }[m[1]] || m[1];
    } else if ((m = ua.match(/Android ([\d.]+)/)))            { r.so = 'Android'; r.so_version = m[1]; }
    else if ((m = ua.match(/iPhone OS ([\d_]+)/)))            { r.so = 'iOS';     r.so_version = m[1].replace(/_/g, '.'); }
    else if ((m = ua.match(/iPad;.*OS ([\d_]+)/)))            { r.so = 'iPadOS';  r.so_version = m[1].replace(/_/g, '.'); }
    else if ((m = ua.match(/Mac OS X ([\d_.]+)/)))            { r.so = 'macOS';   r.so_version = m[1].replace(/_/g, '.'); }
    else if (/CrOS/.test(ua))                                 { r.so = 'ChromeOS'; }
    else if (/Linux/.test(ua))                                { r.so = 'Linux'; }
    return r;
  }

  function tipoDispositivo(ua) {
    var tablet = /iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua) ||
      (window.innerWidth >= 768 && window.innerWidth <= 1024 && 'ontouchstart' in window);
    var movil = !tablet && /Mobi|Android|iPhone|iPod|Windows Phone|BlackBerry|Opera Mini/i.test(ua);
    return movil ? 'mobile' : (tablet ? 'tablet' : 'desktop');
  }

  /* ── de dónde llega el visitante ─────────────────────────────────── */
  function canalDe(ref, utmMedium, utmSource, clickId) {
    if (clickId || /cpc|ppc|paid/i.test(utmMedium || '')) return 'campaña_pago';
    if (utmSource || utmMedium) return 'campaña';
    if (!ref) return 'directo';
    var d = ref.replace(/^https?:\/\//, '').split('/')[0].toLowerCase();
    if (/google|bing|yahoo|duckduckgo|ecosia|yandex|brave/.test(d)) return 'organico';
    if (/facebook|instagram|twitter|x\.com|tiktok|youtube|linkedin|whatsapp|t\.me|telegram|reddit|pinterest/.test(d)) return 'social';
    if (d.indexOf(location.hostname) === 0) return 'interno';
    return 'referido';
  }

  /* ── recolección completa ────────────────────────────────────────── */
  var cacheDatos = null;
  async function recolectar() {
    var nav = navigator, scr = window.screen || {};
    var q = new URLSearchParams(location.search);
    var conn = nav.connection || nav.mozConnection || nav.webkitConnection || {};
    var ua = nav.userAgent || '';
    var info = parseUA(ua);
    var u = usuario();
    var ref = document.referrer || null;
    var clickId = q.get('gclid') || q.get('fbclid') || q.get('ttclid') || q.get('msclkid') || null;

    /* Marca y modelo reales del móvil (Chrome/Android, Client Hints) */
    var marca = null, modelo = null, arq = null, plataforma = nav.platform || null, soVer = null;
    try {
      if (nav.userAgentData) {
        var hi = await nav.userAgentData.getHighEntropyValues(
          ['platform', 'platformVersion', 'architecture', 'model', 'uaFullVersion', 'fullVersionList']);
        modelo = hi.model || null;
        arq = hi.architecture || null;
        plataforma = hi.platform || plataforma;
        soVer = hi.platformVersion || null;
        var marcas = (nav.userAgentData.brands || []).map(function (b) { return b.brand; })
          .filter(function (b) { return !/Not.?A.?Brand/i.test(b); });
        marca = marcas.join(', ') || null;
      }
    } catch (e) {}

    /* Batería */
    var bateria = null, cargando = null;
    try {
      if (nav.getBattery) { var b = await nav.getBattery(); bateria = Math.round(b.level * 100); cargando = b.charging; }
    } catch (e) {}

    /* Tiempo real de carga */
    var carga = null;
    try {
      var n = performance.getEntriesByType('navigation')[0];
      if (n) carga = Math.round(n.domContentLoadedEventEnd || n.duration);
    } catch (e) {}

    var d = {
      // origen
      path: location.pathname,
      url_completa: location.href,
      titulo: document.title,
      hash: location.hash || null,
      query_string: location.search || null,
      referrer: ref,
      referrer_dominio: ref ? ref.replace(/^https?:\/\//, '').split('/')[0] : null,
      utm_source: q.get('utm_source'), utm_medium: q.get('utm_medium'),
      utm_campaign: q.get('utm_campaign'), utm_term: q.get('utm_term'),
      utm_content: q.get('utm_content'), click_id: clickId,
      canal: canalDe(ref, q.get('utm_medium'), q.get('utm_source'), clickId),

      // identidad
      visitor_id: visitorId, session_id: sessionId,
      user_id: u.id, email: u.email,
      es_primera_visita: esPrimera, visitas_previas: previas,

      // navegador y sistema
      user_agent: ua,
      navegador: info.navegador, navegador_version: info.navegador_version,
      motor: info.motor, so: info.so, so_version: soVer || info.so_version,
      plataforma: plataforma, arquitectura: arq,
      marca_dispositivo: marca, modelo_dispositivo: modelo,
      device_type: tipoDispositivo(ua),
      idioma: nav.language || null,
      idiomas: nav.languages ? Array.prototype.slice.call(nav.languages) : null,
      zona_horaria: (Intl.DateTimeFormat().resolvedOptions() || {}).timeZone || null,
      offset_utc: -new Date().getTimezoneOffset() / 60,
      es_pwa: window.matchMedia && window.matchMedia('(display-mode: standalone)').matches,

      // pantalla y hardware
      screen_width: scr.width || null, screen_height: scr.height || null,
      viewport_width: window.innerWidth, viewport_height: window.innerHeight,
      pixel_ratio: window.devicePixelRatio || null,
      profundidad_color: scr.colorDepth || null,
      orientacion: (scr.orientation && scr.orientation.type) ||
                   (window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'),
      touch_points: nav.maxTouchPoints || 0,
      cpu_nucleos: nav.hardwareConcurrency || null,
      memoria_gb: nav.deviceMemory || null,
      bateria: bateria, cargando: cargando,

      // conexión
      conexion_tipo: conn.effectiveType || null,
      conexion_downlink: conn.downlink || null,
      conexion_rtt: conn.rtt || null,
      ahorro_datos: conn.saveData === undefined ? null : conn.saveData,

      carga_ms: carga,
      extra: {
        cookies: nav.cookieEnabled,
        dnt: nav.doNotTrack || null,
        pantalla_disponible: (scr.availWidth || 0) + 'x' + (scr.availHeight || 0),
        hora_local: new Date().toString(),
        pdf: nav.pdfViewerEnabled === undefined ? null : nav.pdfViewerEnabled,
        webdriver: nav.webdriver || false
      }
    };
    cacheDatos = d;
    return d;
  }

  /* ── envío ───────────────────────────────────────────────────────── */
  function enviar(payload, alSalir) {
    var cuerpo = JSON.stringify(payload);
    try {
      return fetch(FN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: cuerpo,
        keepalive: !!alSalir
      }).then(function (r) { return r.json(); }).catch(function () { return null; });
    } catch (e) {
      if (navigator.sendBeacon) navigator.sendBeacon(FN, new Blob([cuerpo], { type: 'application/json' }));
      return Promise.resolve(null);
    }
  }

  /* ── registro de la visita ───────────────────────────────────────── */
  var listaEspera = [];
  async function iniciar() {
    var d = await recolectar();
    d.tipo = 'visita';
    var r = await enviar(d);
    if (r && r.visit_id) {
      visitId = r.visit_id;
      listaEspera.forEach(function (p) { p.visit_id = visitId; enviar(p); });
      listaEspera = [];
    }
  }

  /* ── clics ───────────────────────────────────────────────────────── */
  function clic(nombre, extra) {
    var u = usuario();
    var p = {
      tipo: 'clic',
      button_name: nombre,
      visit_id: visitId,
      visitor_id: visitorId,
      session_id: sessionId,
      user_id: u.id,
      path: location.pathname,
      device_type: cacheDatos ? cacheDatos.device_type : tipoDispositivo(navigator.userAgent),
      segundos: Math.round((Date.now() - t0) / 1000),
      texto: (extra && extra.texto) || null,
      destino: (extra && extra.destino) || null,
      extra: extra || {}
    };
    if (!visitId) { listaEspera.push(p); return; }   // espera a tener el id de la visita
    enviar(p);
  }

  // Cualquier elemento con data-track="nombre" se registra solo
  document.addEventListener('click', function (e) {
    clics++;
    var el = e.target && e.target.closest ? e.target.closest('[data-track]') : null;
    if (!el) return;
    clic(el.getAttribute('data-track'), {
      texto: (el.innerText || '').trim().slice(0, 80),
      destino: el.getAttribute('href') || null
    });
  }, true);

  // Scroll máximo
  window.addEventListener('scroll', function () {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (h > 0) scrollMax = Math.max(scrollMax, Math.min(100, Math.round((window.scrollY / h) * 100)));
  }, { passive: true });

  // Al salir: duración, scroll y número de clics
  function cerrar() {
    if (cerrado || !visitId) return;
    cerrado = true;
    enviar({ tipo: 'cierre', visit_id: visitId, duracion_ms: Date.now() - t0, scroll_max: scrollMax, clics: clics }, true);
  }
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') cerrar(); });
  window.addEventListener('pagehide', cerrar);

  window.AbuTrack = {
    clic: clic,
    vista: function (nombre) { clic('vista_' + nombre, { texto: nombre }); },
    datos: function () { return cacheDatos; },
    visitId: function () { return visitId; }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
