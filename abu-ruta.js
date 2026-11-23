/* ============================================================================
   abu-ruta.js · botón «🗺️ Seguir mi ruta» en las herramientas
   ----------------------------------------------------------------------------
   La ruta continua de abulingo.html manda a Listening, Pronunciación,
   Gramática o al examen con ?ruta=1. Aquí se recuerda eso (sessionStorage)
   y se pinta un botón flotante para volver a la ruta cuando termines.
   abulingo.html borra la marca al volver. Las páginas pueden llamar a
   AbuRuta.listo() al terminar algo para resaltar el botón.
============================================================================ */
(function () {
  'use strict';
  let activa = false;
  try {
    if (new URLSearchParams(location.search).get('ruta')) sessionStorage.setItem('abu-ruta', '1');
    activa = sessionStorage.getItem('abu-ruta') === '1';
  } catch { activa = false; }

  let boton = null;
  function pintar() {
    if (!activa || boton || !document.body) return;
    const css = document.createElement('style');
    css.textContent = `
      #abu-ruta-btn { position: fixed; right: 14px; bottom: calc(14px + env(safe-area-inset-bottom, 0px)); z-index: 70;
        display: flex; align-items: center; gap: 8px; padding: 11px 16px; border-radius: 999px; border: 0;
        background: #FF7A00; color: #fff; font: 900 14px 'Work Sans', system-ui, sans-serif; text-decoration: none;
        box-shadow: 0 6px 18px rgba(255,122,0,.45); }
      #abu-ruta-btn.listo { background: #16a34a; box-shadow: 0 6px 18px rgba(22,163,74,.45); animation: abuRutaPulso 1.2s ease-in-out 3; }
      @keyframes abuRutaPulso { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }
      @media (prefers-reduced-motion: reduce) { #abu-ruta-btn.listo { animation: none; } }`;
    document.head.appendChild(css);
    boton = document.createElement('a');
    boton.id = 'abu-ruta-btn';
    boton.href = 'abulingo.html?ruta=1';
    boton.innerHTML = '<span>🗺️</span><span>Seguir mi ruta</span>';
    document.body.appendChild(boton);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pintar); else pintar();

  window.AbuRuta = {
    get activa() { return activa; },
    listo() {
      if (!activa) return;
      pintar();
      if (!boton) return;
      boton.classList.add('listo');
      boton.innerHTML = '<span>✅</span><span>¡Listo! Seguir mi ruta</span>';
    }
  };
})();
