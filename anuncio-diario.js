/* ============================================================================
   ANUNCIO DIARIO DE ABULINGO  ·  anuncio-diario.js
   ----------------------------------------------------------------------------
   Modal que se abre UNA VEZ AL DÍA en abulingo.html, gramatica.html y
   pronunciacion.html. Sirve para publicidad, invitaciones al club, avisos de
   clases, promociones de planes, etc.

   Qué controla la nube y qué controla el navegador:
     · Si el anuncio está ACTIVO, qué dice, a qué páginas y a qué planes va
       dirigido y entre qué fechas se muestra → tabla `anuncios_diarios`.
     · Que solo se vea UNA VEZ AL DÍA → localStorage del navegador
       (clave por usuario + id del anuncio). Si el usuario entra otra vez el
       mismo día, no se le repite; al día siguiente vuelve a verlo.

   SQL de la tabla (ejecútalo una sola vez en Supabase → SQL Editor):

     create table if not exists public.anuncios_diarios (
       id            bigint generated always as identity primary key,
       activo        boolean     not null default true,
       titulo        text        not null,
       mensaje       text,
       icono         text        default '📣',
       imagen_url    text,
       boton_texto   text,
       boton_url     text,
       boton2_texto  text,
       boton2_url    text,
       paginas       text[]      not null default array['abulingo','gramatica','pronunciacion'],
       planes        text[],                  -- null = todos los planes
       prioridad     int         not null default 0,
       inicia_en     timestamptz not null default now(),
       termina_en    timestamptz,
       created_at    timestamptz not null default now()
     );

     alter table public.anuncios_diarios enable row level security;

     create policy "anuncios visibles para usuarios autenticados"
       on public.anuncios_diarios for select
       to authenticated using (activo = true);

   Ejemplo de anuncio:

     insert into public.anuncios_diarios (titulo, mensaje, icono, boton_texto, boton_url)
     values ('Clases en vivo esta semana',
             'Cupos limitados para la clase de conversación del sábado. ¡Aparta el tuyo!',
             '🎤', 'Quiero mi cupo', 'https://wa.me/593000000000');

   Uso desde cada página (después de cargar el perfil):

     AbuAnuncio.mostrarSiToca({
       dbClient, userId: currentUser.id,
       pagina: 'pronunciacion',            // 'abulingo' | 'gramatica' | 'pronunciacion'
       plan: userProfile.plan || 'gratis'
     });

   Para probarlo sin esperar al día siguiente, en la consola del navegador:
     AbuAnuncio.reiniciar()      → borra el "ya lo vi hoy"
     AbuAnuncio.probar()         → fuerza el modal con un anuncio de ejemplo
============================================================================ */
(function () {
  'use strict';

  var TABLA = 'anuncios_diarios';
  var PREFIJO = 'abu_anuncio_';

  var hoy = function () { return new Date().toISOString().slice(0, 10); };

  var esc = function (s) {
    return (s == null ? '' : String(s))
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  // Solo se aceptan enlaces http(s) o mailto/whatsapp: nada de javascript:
  var urlSegura = function (u) {
    if (!u) return null;
    var s = String(u).trim();
    return /^(https?:\/\/|mailto:|tel:)/i.test(s) ? s : null;
  };

  /* ---------- "ya lo vi hoy" ---------- */
  function clave(userId, anuncioId) { return PREFIJO + (userId || 'anon') + '_' + anuncioId; }

  function yaVistoHoy(userId, anuncioId) {
    try { return localStorage.getItem(clave(userId, anuncioId)) === hoy(); }
    catch (e) { return false; }
  }

  function marcarVisto(userId, anuncioId) {
    try { localStorage.setItem(clave(userId, anuncioId), hoy()); } catch (e) { /* modo privado */ }
  }

  function reiniciar() {
    try {
      Object.keys(localStorage)
        .filter(function (k) { return k.indexOf(PREFIJO) === 0; })
        .forEach(function (k) { localStorage.removeItem(k); });
      console.log('[AbuAnuncio] listo: el anuncio se volverá a mostrar.');
    } catch (e) { /* nada */ }
  }

  /* ---------- Estilos (se inyectan una sola vez) ---------- */
  function inyectarEstilos() {
    if (document.getElementById('abu-anuncio-css')) return;
    var st = document.createElement('style');
    st.id = 'abu-anuncio-css';
    st.textContent = [
      '#abu-anuncio-root{position:fixed;inset:0;z-index:400;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(15,23,42,.6);backdrop-filter:blur(4px);overflow-y:auto;}',
      '#abu-anuncio-root .abu-an-card{background:#fff;border-radius:24px;border:2px solid #e2e8f0;box-shadow:0 10px 0 #cbd5e1,0 14px 30px rgba(0,0,0,.22);max-width:26rem;width:100%;position:relative;overflow:hidden;animation:abuAnPop .28s ease-out both;font-family:"Work Sans",system-ui,sans-serif;max-height:92vh;display:flex;flex-direction:column;}',
      '@keyframes abuAnPop{from{transform:scale(.92);opacity:0}to{transform:scale(1);opacity:1}}',
      '#abu-anuncio-root .abu-an-x{position:absolute;top:10px;right:12px;width:32px;height:32px;border:none;border-radius:9999px;background:rgba(255,255,255,.9);color:#64748b;font-size:20px;line-height:1;cursor:pointer;z-index:2;box-shadow:0 2px 6px rgba(0,0,0,.15);}',
      '#abu-anuncio-root .abu-an-img{width:100%;max-height:190px;object-fit:cover;display:block;background:#f1f5f9;}',
      '#abu-anuncio-root .abu-an-body{padding:22px 22px 18px;text-align:center;overflow-y:auto;}',
      '#abu-anuncio-root .abu-an-icon{font-size:44px;line-height:1;margin-bottom:8px;}',
      '#abu-anuncio-root .abu-an-title{font-family:"Space Grotesk",system-ui,sans-serif;font-weight:700;font-size:22px;color:#1e293b;margin:0 0 8px;}',
      '#abu-anuncio-root .abu-an-msg{color:#64748b;font-size:15px;line-height:1.45;margin:0 0 18px;white-space:pre-wrap;}',
      '#abu-anuncio-root .abu-an-slot{margin:0 0 16px;}',
      '#abu-anuncio-root .abu-an-btn{display:block;width:100%;padding:13px 16px;border-radius:14px;border:none;border-bottom:6px solid rgba(0,0,0,.2);font-weight:700;font-size:16px;cursor:pointer;text-decoration:none;margin-bottom:10px;transition:all .1s;}',
      '#abu-anuncio-root .abu-an-btn:active{transform:translateY(6px);border-bottom-width:0;}',
      '#abu-anuncio-root .abu-an-btn.primario{background:#FF7A00;color:#fff;}',
      '#abu-anuncio-root .abu-an-btn.secundario{background:#f1f5f9;color:#475569;}',
      '#abu-anuncio-root .abu-an-cerrar{background:none;border:none;color:#94a3b8;font-size:13px;font-weight:700;cursor:pointer;padding:6px;}'
    ].join('\n');
    document.head.appendChild(st);
  }

  /* ---------- Pintar el modal ---------- */
  function cerrar() {
    var r = document.getElementById('abu-anuncio-root');
    if (r) r.remove();
    document.removeEventListener('keydown', onEsc);
  }
  function onEsc(e) { if (e.key === 'Escape') cerrar(); }

  function pintar(anuncio, userId) {
    inyectarEstilos();
    cerrar();

    var root = document.createElement('div');
    root.id = 'abu-anuncio-root';

    var img = urlSegura(anuncio.imagen_url);
    var u1 = urlSegura(anuncio.boton_url);
    var u2 = urlSegura(anuncio.boton2_url);

    root.innerHTML =
      '<div class="abu-an-card" role="dialog" aria-modal="true">' +
        '<button class="abu-an-x" aria-label="Cerrar">&times;</button>' +
        (img ? '<img class="abu-an-img" src="' + esc(img) + '" alt="">' : '') +
        '<div class="abu-an-body">' +
          (!img && anuncio.icono ? '<div class="abu-an-icon">' + esc(anuncio.icono) + '</div>' : '') +
          '<h2 class="abu-an-title">' + esc(anuncio.titulo) + '</h2>' +
          (anuncio.mensaje ? '<p class="abu-an-msg">' + esc(anuncio.mensaje) + '</p>' : '') +
          /* ESPACIO LIBRE PARA PUBLICIDAD / INVITACIONES:
             cualquier HTML que pongas en `anuncio.html_extra` (o el que
             inyectes tú desde fuera con AbuAnuncio.slot()) se pinta aquí. */
          '<div class="abu-an-slot" id="abu-anuncio-slot"></div>' +
          (u1 && anuncio.boton_texto
            ? '<a class="abu-an-btn primario" href="' + esc(u1) + '" target="_blank" rel="noopener">' + esc(anuncio.boton_texto) + '</a>'
            : '') +
          (u2 && anuncio.boton2_texto
            ? '<a class="abu-an-btn secundario" href="' + esc(u2) + '" target="_blank" rel="noopener">' + esc(anuncio.boton2_texto) + '</a>'
            : '') +
          '<button class="abu-an-cerrar">Ahora no</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(root);

    // El slot admite HTML crudo a propósito (banners, iframes de video…).
    // Solo lo llena el administrador desde la tabla, nunca un usuario.
    if (anuncio.html_extra) {
      var slot = document.getElementById('abu-anuncio-slot');
      if (slot) slot.innerHTML = anuncio.html_extra;
    }

    root.querySelector('.abu-an-x').onclick = cerrar;
    root.querySelector('.abu-an-cerrar').onclick = cerrar;
    root.addEventListener('click', function (e) { if (e.target === root) cerrar(); });
    document.addEventListener('keydown', onEsc);

    if (anuncio.id != null) marcarVisto(userId, anuncio.id);
  }

  /* ---------- Traer el anuncio vigente de Supabase ---------- */
  async function traerAnuncio(dbClient, pagina, plan) {
    var ahora = new Date().toISOString();
    var q = dbClient.from(TABLA)
      .select('id,titulo,mensaje,icono,imagen_url,boton_texto,boton_url,boton2_texto,boton2_url,paginas,planes,prioridad,inicia_en,termina_en')
      .eq('activo', true)
      .lte('inicia_en', ahora)
      .order('prioridad', { ascending: false })
      .order('id', { ascending: false })
      .limit(10);

    var res = await q;
    if (res.error) { console.warn('[AbuAnuncio] no se pudo leer', TABLA + ':', res.error.message); return null; }

    var lista = (res.data || []).filter(function (a) {
      if (a.termina_en && new Date(a.termina_en).getTime() < Date.now()) return false;
      if (Array.isArray(a.paginas) && a.paginas.length && pagina && a.paginas.indexOf(pagina) === -1) return false;
      if (Array.isArray(a.planes) && a.planes.length && plan && a.planes.indexOf(plan) === -1) return false;
      return true;
    });
    return lista[0] || null;
  }

  /* ---------- API pública ---------- */
  async function mostrarSiToca(opciones) {
    opciones = opciones || {};
    var dbClient = opciones.dbClient, userId = opciones.userId;
    if (!dbClient) { console.warn('[AbuAnuncio] falta dbClient'); return false; }
    try {
      var anuncio = await traerAnuncio(dbClient, opciones.pagina, opciones.plan);
      if (!anuncio) return false;
      if (!opciones.forzar && yaVistoHoy(userId, anuncio.id)) return false;
      // Pequeño respiro para no chocar con la pantalla de carga de la página.
      setTimeout(function () { pintar(anuncio, userId); }, opciones.retraso == null ? 900 : opciones.retraso);
      return true;
    } catch (e) {
      console.warn('[AbuAnuncio]', e && e.message ? e.message : e);
      return false;
    }
  }

  function probar(anuncio) {
    pintar(Object.assign({
      id: 'demo', icono: '📣', titulo: 'Anuncio de prueba',
      mensaje: 'Así se verá el aviso diario. Este espacio también admite una imagen y hasta dos botones.',
      boton_texto: 'Ver más', boton_url: 'https://abulingo.com'
    }, anuncio || {}), 'demo');
  }

  function slot(html) {
    var s = document.getElementById('abu-anuncio-slot');
    if (s) s.innerHTML = html;
  }

  window.AbuAnuncio = {
    mostrarSiToca: mostrarSiToca,
    mostrar: pintar,
    cerrar: cerrar,
    reiniciar: reiniciar,
    probar: probar,
    slot: slot
  };
})();
