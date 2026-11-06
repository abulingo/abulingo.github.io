/* ============================================================================
   MENÚ DE PERFIL COMPARTIDO DE ABULINGO  ·  abu-menu.js
   ----------------------------------------------------------------------------
   Antes, el menú de la foto de perfil solo funcionaba de verdad en
   abulingo.html: desde gramatica.html y pronunciacion.html cada opción
   redirigía con ?menu=… y te sacaba de donde ibas. Este archivo mete TODOS
   esos modales en un solo sitio para que funcionen igual en las tres
   páginas, sin salir de la página actual:

     · Ranking Global          · Certificados
     · Ranking de Equipo       · Mazo (panel + práctica rápida)
     · Progreso nivel (NUEVO: vista unificada de las 5 áreas)
     · Soporte                 · Solicitar Tutor      · Misión del día

   USO (después de cargar perfil y flujo):

     AbuMenu.init({
       dbClient, currentUser, userProfile, flujo,
       showModal, closeModal, showToast, escapeHTML,
       guardarFlujo: updateUserFlow,        // opcional
       confetti: triggerConfetti,           // opcional
       mazoPracticar: abrirMazoRapido,      // opcional (abulingo usa el suyo)
       pagina: 'pronunciacion'
     });
     AbuMenu.bind();          // engancha [data-menu], la foto y el logout
     AbuMenu.refreshBadges(); // pinta "2 listos 🎓" y "31 palabras"

   El HTML del desplegable debe ser el mismo de abulingo.html (mismos ids y
   mismos data-menu). Ver el bloque #profile-menu-dropdown.
============================================================================ */
(function () {
  'use strict';

  /* ---------- Configuración (se puede sobrescribir desde init) ---------- */
  const CFG = {
    ABULINGO_URL: 'https://abulingo.github.io/',
    CERT_WHATSAPP_URL: 'https://wa.me/573163748711',
    WHATSAPP_COMUNIDAD_URL: 'https://chat.whatsapp.com/FItyG5Nyj0FJmjtk9Fjpvx',
    NIVELES_FIJOS: ['A1', 'A2', 'B1', 'B2', 'C1'],
    MISION_PALABRAS_DIA: 30,
    MISION_FRASES_DIA: 5,
    MISION_RECOMPENSA_LINGOTS: 2,
    DOMINAR_SUBS_TOTAL: 32,
    // Respaldo de cuántos temas de gramática tiene cada nivel (ya fusionados).
    // gramatica.html publica los reales en flujo.gram.totales al abrirse.
    GRAM_TOTALES: { A1: 50, A2: 24, B1: 53, B2: 75 }
  };

  let ctx = null;   // { dbClient, currentUser, userProfile, flujo, ... }

  const esc = (s) => (ctx?.escapeHTML ? ctx.escapeHTML(s) : String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'));
  const toast = (m, ms) => { if (ctx?.showToast) ctx.showToast(m, ms); };
  const modal = (o) => ctx.showModal(o);
  const cerrar = () => ctx.closeModal();
  const confeti = () => {
    if (ctx?.confetti) return ctx.confetti();
    if (window.confetti) confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#FF7A00', '#3b82f6', '#fbbf24'] });
  };
  const guardarFlujo = async () => { if (ctx?.guardarFlujo) await ctx.guardarFlujo(); };

  const spinnerHTML = () => '<div class="w-10 h-10 border-4 border-[#FF7A00] border-t-transparent rounded-full animate-spin mx-auto my-6"></div>';
  const barraHTML = (p, color) =>
    `<div class="h-2 rounded-full bg-slate-100 overflow-hidden"><div class="h-full rounded-full" style="width:${p}%; background:${color};"></div></div>`;
  const pct = (h, t) => (t > 0 ? Math.round((h / t) * 100) : 0);
  const primerNombre = (n, alt) => ((n || '').toString().trim().split(/\s+/)[0] || alt || 'Estudiante');

  /* ============================================================
     RANKING GLOBAL
  ============================================================ */
  function rankingListHTML(rows) {
    if (!rows.length) return '<p class="text-slate-400 text-center py-4">Todavía no hay nadie en el ranking. 🐣</p>';
    const medallas = ['🥇', '🥈', '🥉'];
    return '<div class="space-y-2">' + rows.map((r, i) => {
      const yo = r.id === ctx.currentUser.id;
      return `<div class="flex items-center gap-3 px-3 py-2 rounded-xl ${yo ? 'bg-orange-50 border-2 border-orange-200' : 'bg-slate-50'}">
        <span class="w-8 text-center font-black ${i < 3 ? 'text-xl' : 'text-slate-400'}">${medallas[i] || (i + 1)}</span>
        <span class="flex-1 font-bold text-slate-700 truncate">${esc(primerNombre(r.full_name))}${yo ? ' <span class="text-[10px] text-[#FF7A00] font-black">(TÚ)</span>' : ''}</span>
        <span class="font-black text-slate-600 shrink-0"><i class="fas fa-star text-yellow-400 mr-1"></i>${r.points || 0}</span>
      </div>`;
    }).join('') + '</div>';
  }

  async function openRankingGlobal() {
    modal({ icon: '🌍', title: 'Ranking Global', size: 'lg', body: `<div id="rk-body" class="text-left">${spinnerHTML()}</div>`, actions: [] });
    const { data, error } = await ctx.dbClient.from('ranking_publico')
      .select('id, full_name, points, nivel').order('points', { ascending: false }).limit(20);
    const el = document.getElementById('rk-body');
    if (!el) return;
    if (error) {
      el.innerHTML = `<p class="text-red-500 font-bold text-center">No se pudo leer el ranking.</p>
        <p class="text-slate-400 text-xs text-center mt-2">${esc(error.message)}</p>`;
      return;
    }
    el.innerHTML = '<p class="text-xs text-slate-400 text-center mb-3">Los 20 mejores por puntos ⭐</p>' + rankingListHTML(data || []);
  }

  /* ============================================================
     RANKING DE EQUIPO
  ============================================================ */
  const soloDigitos = (t) => (t || '').toString().replace(/\D/g, '');

  async function openRankingEquipo() {
    modal({ icon: '🛡️', title: 'Ranking de Equipo', size: 'lg', body: `<div id="eq-body" class="text-left">${spinnerHTML()}</div>`, actions: [] });
    const el = document.getElementById('eq-body');
    if (!el) return;
    if (!ctx.userProfile.equipo_id) return renderEquipoSetup(el);

    const { data: eq } = await ctx.dbClient.from('equipos')
      .select('id, nombre_equipo, codigo, creador_id').eq('id', ctx.userProfile.equipo_id).maybeSingle();
    const { data: miembros, error } = await ctx.dbClient.from('ranking_publico')
      .select('id, full_name, points').eq('equipo_id', ctx.userProfile.equipo_id)
      .order('points', { ascending: false }).limit(50);

    if (error) { el.innerHTML = `<p class="text-red-500 font-bold text-center">No se pudo leer tu equipo.</p><p class="text-slate-400 text-xs text-center mt-2">${esc(error.message)}</p>`; return; }

    const soyCreador = !!(eq && eq.creador_id === ctx.currentUser.id);
    const totalPts = (miembros || []).reduce((a, m) => a + (m.points || 0), 0);

    el.innerHTML = `
      <div class="text-center mb-3">
        <span class="bg-orange-100 text-[#FF7A00] font-black px-4 py-1.5 rounded-full inline-block">🛡️ ${esc(eq?.nombre_equipo || 'Mi equipo')}</span>
        <p class="text-xs text-slate-400 mt-2">${(miembros || []).length} integrante(s) · <b>${totalPts}</b> puntos en total ⭐</p>
      </div>
      ${eq?.codigo ? `
        <div class="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-3 mb-4 text-center">
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Código para invitar</p>
          <div class="font-black text-3xl tracking-[0.35em] text-[#FF7A00] my-1.5 pl-[0.35em]">${esc(eq.codigo)}</div>
          <div class="flex flex-wrap gap-2 justify-center">
            <button id="eq-copiar" class="text-xs font-bold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-[#FF7A00] hover:text-[#FF7A00] transition"><i class="fas fa-copy mr-1"></i>Copiar</button>
            <button id="eq-compartir" class="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#FF7A00] text-white hover:opacity-90 transition"><i class="fas fa-share-nodes mr-1"></i>Invitar</button>
            ${soyCreador ? '<button id="eq-regenerar" class="text-xs font-bold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 transition"><i class="fas fa-rotate mr-1"></i>Cambiar</button>' : ''}
          </div>
          <p class="text-[10px] text-slate-400 mt-2">Solo quien tenga este código puede entrar.</p>
        </div>` : ''}
      ${rankingListHTML(miembros || [])}
      <button id="eq-salir" class="mt-4 w-full text-center text-xs font-bold text-slate-400 hover:text-red-500 transition">Salir del equipo</button>`;

    const codigo = eq?.codigo || '';
    const copiar = async () => {
      try { await navigator.clipboard.writeText(codigo); toast('📋 Código copiado: ' + codigo); }
      catch { toast('Tu código es: <b>' + codigo + '</b>', 4000); }
    };
    document.getElementById('eq-copiar')?.addEventListener('click', copiar);
    document.getElementById('eq-compartir')?.addEventListener('click', async () => {
      const texto = `¡Únete a mi equipo "${eq?.nombre_equipo || ''}" en Abulingo! 🛡️\n\n` +
        `1. Entra a ${CFG.ABULINGO_URL}\n2. Abre "Ranking de Equipo" en tu perfil\n3. Escribe este código: ${codigo}\n\n¡Te espero para aprender inglés juntos! 🔥`;
      if (navigator.share) { try { await navigator.share({ title: 'Abulingo', text: texto, url: CFG.ABULINGO_URL }); return; } catch { /* canceló */ } }
      try { await navigator.clipboard.writeText(texto); toast('📋 Invitación copiada. ¡Pégala en WhatsApp!'); } catch { copiar(); }
    });
    document.getElementById('eq-regenerar')?.addEventListener('click', async (e) => {
      e.target.disabled = true;
      const { data, error: e3 } = await ctx.dbClient.rpc('regenerar_codigo_equipo');
      if (e3) return toast('⚠️ ' + e3.message);
      toast('🔄 Código nuevo: <b>' + data + '</b>. El anterior ya no sirve.', 4000);
      openRankingEquipo();
    });
    document.getElementById('eq-salir')?.addEventListener('click', async () => {
      const { error: e2 } = await ctx.dbClient.from('profiles').update({ equipo_id: null }).eq('id', ctx.currentUser.id);
      if (e2) { toast('⚠️ No se pudo salir: ' + e2.message); return; }
      ctx.userProfile.equipo_id = null;
      toast('👋 Saliste del equipo.');
      openRankingEquipo();
    });
  }

  function renderEquipoSetup(el) {
    el.innerHTML = `
      <p class="text-slate-500 text-sm text-center mb-4">Compite con tus amigos: sumen puntos juntos y vean quién va adelante. 🏆</p>
      <div class="bg-orange-50 border-2 border-orange-200 rounded-xl p-3 mb-3">
        <p class="font-bold text-slate-700 text-sm mb-2 text-center">¿Te pasaron un código?</p>
        <div class="flex gap-2">
          <input id="eq-codigo" type="text" inputmode="numeric" maxlength="7" placeholder="······" autocomplete="off"
            class="flex-1 min-w-0 bg-white border-2 border-slate-200 rounded-xl px-3 py-2 text-center font-black text-xl tracking-[0.3em] text-slate-700 focus:outline-none focus:border-[#FF7A00]">
          <button id="eq-unirme" class="btn-juice bg-[#FF7A00] text-white font-bold px-4 py-2 rounded-xl shrink-0">Unirme</button>
        </div>
        <p class="text-[10px] text-slate-400 text-center mt-1.5">6 dígitos, sin espacios</p>
      </div>
      <div class="flex items-center gap-2 my-3">
        <div class="flex-1 h-px bg-slate-200"></div><span class="text-[10px] font-bold text-slate-300 uppercase">o</span><div class="flex-1 h-px bg-slate-200"></div>
      </div>
      <div class="bg-slate-50 border border-slate-200 rounded-xl p-3">
        <p class="font-bold text-slate-700 text-sm mb-2 text-center">Crea tu equipo</p>
        <div class="flex gap-2">
          <input id="eq-nombre" type="text" maxlength="40" placeholder="Nombre del equipo..."
            class="flex-1 min-w-0 bg-white border-2 border-slate-200 rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-[#FF7A00]">
          <button id="eq-crear" class="btn-juice bg-slate-800 text-white font-bold px-4 py-2 rounded-xl shrink-0">Crear</button>
        </div>
        <p class="text-[10px] text-slate-400 text-center mt-1.5">Recibirás un código para invitar a quien quieras</p>
      </div>
      <p id="eq-error" class="text-red-500 text-xs font-bold mt-3 hidden text-center"></p>`;

    const setErr = (m) => { const p = document.getElementById('eq-error'); if (p) { p.innerHTML = m; p.classList.remove('hidden'); } };
    const inputCod = document.getElementById('eq-codigo');
    const btnUnir = document.getElementById('eq-unirme');
    const unir = async () => {
      const codigo = soloDigitos(inputCod?.value);
      if (codigo.length !== 6) return setErr('El código son 6 dígitos. Revísalo con quien te invitó.');
      btnUnir.disabled = true;
      const { data, error } = await ctx.dbClient.rpc('unirse_por_codigo', { p_codigo: codigo });
      btnUnir.disabled = false;
      if (error) return setErr(esc(error.message));
      const fila = Array.isArray(data) ? data[0] : data;
      if (!fila) return setErr('Ese código no corresponde a ningún equipo.');
      ctx.userProfile.equipo_id = fila.equipo_id;
      confeti();
      toast(`🛡️ ¡Bienvenido a ${esc(fila.nombre_equipo)}!`);
      openRankingEquipo();
    };
    btnUnir?.addEventListener('click', unir);
    inputCod?.addEventListener('keypress', (e) => { if (e.key === 'Enter') unir(); });

    document.getElementById('eq-crear')?.addEventListener('click', async (e) => {
      const nombre = (document.getElementById('eq-nombre')?.value || '').trim();
      if (!nombre) return setErr('Escribe un nombre para el equipo.');
      e.target.disabled = true;
      const { data: nuevo, error } = await ctx.dbClient.from('equipos')
        .insert({ nombre_equipo: nombre, creador_id: ctx.currentUser.id })
        .select('id, nombre_equipo, codigo').single();
      e.target.disabled = false;
      if (error || !nuevo) return setErr('No se pudo crear el equipo: ' + esc(error?.message || 'error desconocido'));
      const { error: e2 } = await ctx.dbClient.from('profiles').update({ equipo_id: nuevo.id }).eq('id', ctx.currentUser.id);
      if (e2) return setErr('Equipo creado, pero no pudimos unirte: ' + esc(e2.message));
      ctx.userProfile.equipo_id = nuevo.id;
      confeti();
      toast(`🛡️ Equipo creado · código <b>${nuevo.codigo}</b>`, 4000);
      openRankingEquipo();
    });
  }

  /* ============================================================
     PROGRESO NIVEL — vista unificada de las 5 áreas
     ------------------------------------------------------------
       🃏 Palabras       → flujo.srs[id].learned    / palabras del nivel
       💬 Frases         → flujo.frasesDominadas    / frases del nivel
       🎭 Conversaciones → calificación de 5 ★      / conversaciones del nivel
       📘 Gramática      → temas con 3 ★            / temas del nivel
       🏆 Dominar        → subsecciones completas   / 32
  ============================================================ */
  const AREAS = [
    { key: 'palabras',       icon: '🃏', label: 'Palabras',       color: '#3b82f6' },
    { key: 'frases',         icon: '💬', label: 'Frases',         color: '#FF7A00' },
    { key: 'conversaciones', icon: '🎭', label: 'Conversaciones', color: '#a855f7' },
    { key: 'gramatica',      icon: '📘', label: 'Gramática',      color: '#0ea5e9' },
    { key: 'dominar',        icon: '🏆', label: 'Dominar',        color: '#22c55e' }
  ];

  function progGramatica(nivel) {
    const topics = ctx.flujo?.gram?.niveles?.[nivel]?.topics || {};
    const dominados = Object.values(topics).filter(t => (t?.stars || 0) >= 3).length;
    const total = (ctx.flujo?.gram?.totales && ctx.flujo.gram.totales[nivel]) || CFG.GRAM_TOTALES[nivel] || 0;
    return { hecho: total ? Math.min(dominados, total) : dominados, total };
  }

  function progDominar(nivel) {
    const subs = ctx.flujo?.dominar?.[nivel]?.subs || {};
    let hecho = 0;
    for (let i = 1; i <= CFG.DOMINAR_SUBS_TOTAL; i++) if (subs[i]?.completed) hecho++;
    return { hecho, total: CFG.DOMINAR_SUBS_TOTAL };
  }

  async function openProgresoNivel() {
    modal({ icon: '📈', title: 'Progreso por nivel', size: 'lg', body: `<div id="pg-body" class="text-left">${spinnerHTML()}</div>`, actions: [] });
    renderProgresoUnificado();
  }

  async function renderProgresoUnificado() {
    const cont = document.getElementById('pg-body');
    if (!cont || !ctx.flujo) return;
    const N = CFG.NIVELES_FIJOS;
    const db = ctx.dbClient;
    const dominadaIds = Object.keys(ctx.flujo.frasesDominadas || {});

    const cuenta = async (tabla, col, valor) => {
      const { count } = await db.from(tabla).select('id', { count: 'exact', head: true }).eq(col, valor);
      return count || 0;
    };

    let idsPalabras = [], totFrases = [], frasesDom = [], totConv = [], conv5 = [];
    try {
      [idsPalabras, totFrases, frasesDom, totConv, conv5] = await Promise.all([
        Promise.all(N.map(async n => {
          let { data } = await db.from('palabras').select('id').eq('nivel', n).range(0, 9999);
          if (!(data || []).length) ({ data } = await db.from('palabras').select('id').ilike('nivel', n).range(0, 9999));
          return (data || []).map(r => String(r.id));
        })),
        Promise.all(N.map(n => cuenta('frases', 'nivel', n))),
        dominadaIds.length ? db.from('frases').select('id,nivel').in('id', dominadaIds).then(({ data }) => data || []) : Promise.resolve([]),
        Promise.all(N.map(n => cuenta('conversaciones_pronunciacion', 'nivel_ingles', n))),
        db.from('conversaciones_puntuaciones').select('conversacion_id,puntaje').eq('user_id', ctx.currentUser.id).eq('puntaje', 5).then(({ data }) => data || [])
      ]);
    } catch (e) {
      console.warn('[AbuMenu] progreso:', e?.message || e);
    }
    if (!document.getElementById('pg-body')) return;

    const frasesPorNivel = {};
    frasesDom.forEach(f => { frasesPorNivel[f.nivel] = (frasesPorNivel[f.nivel] || 0) + 1; });

    const convPorNivel = {};
    if (conv5.length) {
      const { data: convs } = await db.from('conversaciones_pronunciacion')
        .select('id,nivel_ingles').in('id', conv5.map(p => p.conversacion_id));
      (convs || []).forEach(c => { convPorNivel[c.nivel_ingles] = (convPorNivel[c.nivel_ingles] || 0) + 1; });
    }

    // Conversaciones que el propio usuario creó en "Crear conversación".
    const creadasPorNivel = {};
    (Array.isArray(ctx.flujo.convCreadas) ? ctx.flujo.convCreadas : []).forEach(c => {
      const b = creadasPorNivel[c.nivel] || (creadasPorNivel[c.nivel] = { total: 0, dom: 0 });
      b.total++;
      const v = Object.values((ctx.flujo.convCreadasPuntajes || {})[c.id] || {}).map(Number).filter(Boolean);
      if (v.length && Math.round(v.reduce((a, x) => a + x, 0) / v.length) === 5) b.dom++;
    });

    const datos = N.map((n, i) => {
      const ids = idsPalabras[i] || [];
      const areas = {
        palabras: { hecho: ids.filter(id => ctx.flujo.srs?.[id]?.learned).length, total: ids.length },
        frases: { hecho: frasesPorNivel[n] || 0, total: totFrases[i] || 0 },
        conversaciones: { hecho: convPorNivel[n] || 0, total: totConv[i] || 0 },
        gramatica: progGramatica(n),
        dominar: progDominar(n)
      };
      const hecho = AREAS.reduce((s, a) => s + areas[a.key].hecho, 0);
      const total = AREAS.reduce((s, a) => s + areas[a.key].total, 0);
      return { nivel: n, areas, hecho, total, pct: pct(hecho, total), creadas: creadasPorNivel[n] || null };
    });

    const glob = {};
    AREAS.forEach(a => {
      glob[a.key] = datos.reduce((acc, d) => ({ hecho: acc.hecho + d.areas[a.key].hecho, total: acc.total + d.areas[a.key].total }), { hecho: 0, total: 0 });
    });
    const gh = AREAS.reduce((s, a) => s + glob[a.key].hecho, 0);
    const gt = AREAS.reduce((s, a) => s + glob[a.key].total, 0);
    const gp = pct(gh, gt);

    const filaArea = (a, d) => `
      <div class="mb-2.5">
        <div class="flex items-baseline gap-1.5 mb-1">
          <span class="text-sm">${a.icon}</span>
          <span class="text-[11px] font-black uppercase tracking-wide text-slate-500 flex-1">${a.label}</span>
          <span class="text-[11px] font-black text-slate-700">${d.hecho}<span class="text-slate-300"> / ${d.total || '—'}</span></span>
          <span class="text-[11px] font-black w-9 text-right" style="color:${a.color}">${pct(d.hecho, d.total)}%</span>
        </div>
        ${barraHTML(pct(d.hecho, d.total), a.color)}
      </div>`;

    cont.innerHTML = `
      <div class="bg-gradient-to-br from-[#FF7A00] to-orange-600 text-white rounded-2xl p-4 mb-4 text-center">
        <p class="text-[10px] font-black uppercase tracking-widest text-orange-100">Dominado en todo Abulingo</p>
        <p class="font-heading font-black text-4xl leading-tight">${gp}%</p>
        <p class="text-xs font-bold text-orange-100">${gh} de ${gt} elementos · te falta ${100 - gp}%</p>
        <div class="h-2.5 rounded-full bg-white/25 overflow-hidden mt-3"><div class="h-full rounded-full bg-white" style="width:${gp}%"></div></div>
      </div>
      <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 text-center">Total dominado por área</p>
      <div class="grid grid-cols-5 gap-1.5 mb-5">
        ${AREAS.map(a => `
          <div class="bg-slate-50 border border-slate-200 rounded-xl py-2 px-1 text-center">
            <div class="text-base leading-none mb-1">${a.icon}</div>
            <div class="font-heading font-black text-sm text-slate-700 leading-none">${glob[a.key].hecho}</div>
            <div class="text-[9px] font-bold text-slate-400 leading-tight">de ${glob[a.key].total || '—'}</div>
            <div class="text-[10px] font-black mt-0.5" style="color:${a.color}">${pct(glob[a.key].hecho, glob[a.key].total)}%</div>
          </div>`).join('')}
      </div>
      ${datos.map(d => `
        <div class="border-2 border-slate-100 rounded-2xl p-3.5 mb-3">
          <div class="flex items-center gap-2 mb-3">
            <span class="w-10 h-10 rounded-xl bg-[#FF7A00] text-white font-heading font-black flex items-center justify-center shrink-0">${d.nivel}</span>
            <div class="flex-1 min-w-0">
              <p class="text-[11px] font-black uppercase tracking-wide text-slate-400">Nivel ${d.nivel}</p>
              <p class="text-xs font-bold text-slate-500">${d.hecho} de ${d.total || '—'} dominados</p>
            </div>
            <span class="font-heading font-black text-2xl text-slate-800 shrink-0">${d.pct}<span class="text-sm text-slate-300">%</span></span>
          </div>
          ${barraHTML(d.pct, '#FF7A00')}
          <div class="mt-3">${AREAS.map(a => filaArea(a, d.areas[a.key])).join('')}</div>
          ${d.creadas ? `<p class="text-[11px] text-slate-400 border-t border-slate-100 pt-2 mt-1">✨ Además creaste <b class="text-slate-600">${d.creadas.total}</b> conversación${d.creadas.total === 1 ? '' : 'es'} aquí (<b class="text-slate-600">${d.creadas.dom}</b> con 5 estrellas). No cuentan en el porcentaje.</p>` : ''}
        </div>`).join('')}
      <p class="text-[11px] text-slate-400 text-center leading-snug">
        Una palabra cuenta como dominada al graduarla en las tarjetas · una frase, al marcarla con ✅ ·
        una conversación, al llegar a 5 ★ · un tema de gramática, al sacar 3 ★ · y una subsección de “Dominar”, al completarla.
      </p>`;
  }

  /* ============================================================
     CERTIFICADOS
  ============================================================ */
  let certDisponibles = 0;

  async function getCertProgreso(nivel) {
    let { data } = await ctx.dbClient.from('palabras').select('id').eq('nivel', nivel).range(0, 9999);
    if (!(data || []).length) ({ data } = await ctx.dbClient.from('palabras').select('id').ilike('nivel', nivel).range(0, 9999));
    const ids = (data || []).map(r => String(r.id));
    const total = ids.length;
    const dominadas = ids.filter(id => ctx.flujo.srs?.[id]?.learned).length;
    return { nivel, total, dominadas, faltan: Math.max(0, total - dominadas), pct: pct(dominadas, total), listo: total > 0 && dominadas >= total };
  }

  function certWhatsAppURL(nivel) {
    const texto = `¡Hola Abulingo! 🎓\n\nYa dominé todas las palabras del nivel ${nivel} y quisiera solicitar mi certificado.\n\n` +
      `Nombre: ${(ctx.userProfile?.full_name || '').trim() || '(escribe aquí tu nombre)'}\n` +
      `Correo: ${(ctx.currentUser?.email || '').trim() || '(escribe aquí tu correo)'}\nNivel: ${nivel}\n\n¡Gracias!`;
    return `${CFG.CERT_WHATSAPP_URL}?text=${encodeURIComponent(texto)}`;
  }

  async function openCertificados() {
    modal({ icon: '🎓', title: 'Certificados', size: 'lg', body: `<div id="cert-body" class="text-left">${spinnerHTML()}</div>`, actions: [] });
    const el = document.getElementById('cert-body');
    if (!el) return;
    const datos = (await Promise.all(CFG.NIVELES_FIJOS.map(n => getCertProgreso(n)))).filter(d => d.total > 0);
    if (!document.getElementById('cert-body')) return;
    certDisponibles = datos.filter(d => d.listo).length;
    actualizarBadgeCertificados();

    if (!datos.length) { el.innerHTML = '<p class="text-slate-400 text-center py-4">Todavía no hay palabras cargadas para ningún nivel. 📭</p>'; return; }

    el.innerHTML = `
      <p class="text-slate-500 text-sm text-center mb-4">Cuando tengas <b>todas las palabras de un nivel dominadas</b> 🏅 recibes tu <b>certificado de Abulingo</b> de ese nivel.</p>
      ${datos.map(d => `
        <div class="rounded-2xl border-2 ${d.listo ? 'border-green-300 bg-green-50' : 'border-slate-200 bg-white'} p-4 mb-3">
          <div class="flex items-center justify-between mb-1.5">
            <span class="font-heading font-black text-lg text-slate-800">Nivel ${esc(d.nivel)}</span>
            ${d.listo ? '<span class="bg-green-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide">🎓 Disponible</span>'
                      : `<span class="text-xs font-black text-slate-400">${d.pct}%</span>`}
          </div>
          ${barraHTML(d.pct, d.listo ? 'linear-gradient(90deg,#16a34a,#4ade80)' : 'linear-gradient(90deg,#FF7A00,#fb923c)')}
          <p class="text-sm mt-2 text-slate-500">
            ${d.listo ? `Dominaste las <b class="text-green-600">${d.total}</b> palabras del nivel. ¡Tu certificado te espera! 🎉`
                      : `Dominadas <b class="text-slate-700">${d.dominadas}</b> de <b class="text-slate-700">${d.total}</b> · <b class="text-[#FF7A00]">te faltan ${d.faltan} palabra${d.faltan === 1 ? '' : 's'}</b>.`}
          </p>
          ${d.listo ? `<button class="cert-ask btn-juice bg-green-500 text-white font-bold py-2.5 rounded-xl w-full mt-3" data-nivel="${esc(d.nivel)}">Pedir certificado 📜</button>`
                    : '<button class="w-full mt-3 py-2.5 rounded-xl font-bold bg-slate-100 text-slate-400 cursor-not-allowed" disabled>🔒 Pedir certificado</button>'}
        </div>`).join('')}`;

    el.querySelectorAll('.cert-ask').forEach(b => {
      b.onclick = () => { confeti(); window.open(certWhatsAppURL(b.dataset.nivel), '_blank', 'noopener'); };
    });
  }

  function actualizarBadgeCertificados() {
    const c = document.getElementById('cert-menu-count');
    if (c) c.textContent = certDisponibles ? `${certDisponibles} listo${certDisponibles === 1 ? '' : 's'} 🎓` : '';
  }

  /* ============================================================
     SOPORTE
  ============================================================ */
  function openSoporte() {
    modal({
      icon: '🎧', title: 'Soporte', size: 'lg',
      body: `<div class="text-left">
          <p class="text-slate-500 text-sm mb-3 text-center">Cuéntanos tu problema o sugerencia y te responderemos pronto. 💬</p>
          <textarea id="sp-msg" rows="4" placeholder="Escribe tu mensaje..." class="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-[#FF7A00]"></textarea>
          <p id="sp-error" class="text-red-500 text-xs font-bold mt-2 hidden text-center"></p>
        </div>`,
      actions: [{
        label: 'Enviar mensaje 📨',
        onClick: async () => {
          const mensaje = (document.getElementById('sp-msg')?.value || '').trim();
          const errEl = document.getElementById('sp-error');
          const setErr = (m) => { if (errEl) { errEl.textContent = m; errEl.classList.remove('hidden'); } };
          if (!mensaje) return setErr('Escribe un mensaje antes de enviar.');
          const { error } = await ctx.dbClient.from('soporte').insert({ user_id: ctx.currentUser.id, email: ctx.currentUser.email || '', mensaje });
          if (error) return setErr('No se pudo enviar: ' + error.message);
          cerrar(); confeti();
          toast('📨 Mensaje enviado. ¡Gracias por escribirnos!');
        }
      }]
    });
  }

  /* ============================================================
     SOLICITAR TUTOR (solo Super Pro)
  ============================================================ */
  function openSolicitarTutor() {
    if ((ctx.userProfile?.plan || 'gratis') !== 'super_pro') {
      return modal({
        icon: '🔒', title: 'Función Super Pro',
        body: 'Solicitar una sesión con un tutor humano es una función del plan <b>Super Pro</b>.',
        actions: [{ label: 'Entendido', onClick: cerrar }]
      });
    }
    const hoy = new Date().toISOString().slice(0, 10);
    modal({
      icon: '🧑‍🏫', title: 'Solicitar Tutor',
      body: `<div class="text-left space-y-3">
          <div><label class="text-[11px] font-black text-slate-400 uppercase">Fecha</label>
            <input id="st-fecha" type="date" min="${hoy}" class="w-full mt-1 bg-white border-2 border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#FF7A00] text-slate-700 font-medium"></div>
          <div><label class="text-[11px] font-black text-slate-400 uppercase">Hora</label>
            <input id="st-hora" type="time" class="w-full mt-1 bg-white border-2 border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#FF7A00] text-slate-700 font-medium"></div>
          <div><label class="text-[11px] font-black text-slate-400 uppercase">Temas a tratar</label>
            <textarea id="st-temas" rows="3" placeholder="Ej: reforzar pasado simple, practicar conversación..." class="w-full mt-1 bg-white border-2 border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#FF7A00] text-slate-700 font-medium"></textarea></div>
        </div>`,
      actions: [
        { label: 'Enviar solicitud 👉', onClick: enviarSolicitudTutor },
        { label: 'Cancelar', style: 'bg-slate-100 text-slate-500', onClick: cerrar }
      ]
    });
  }

  async function enviarSolicitudTutor() {
    const fecha = document.getElementById('st-fecha')?.value;
    const hora = document.getElementById('st-hora')?.value;
    const temas = (document.getElementById('st-temas')?.value || '').trim();
    if (!fecha || !hora) return toast('⚠️ Elige fecha y hora.');
    const { error } = await ctx.dbClient.from('solicitudes_tutor').insert({ user_id: ctx.currentUser.id, fecha, hora, temas: temas || null });
    if (error) { console.warn('[solicitar-tutor]', error.message); toast('⚠️ No se pudo enviar la solicitud.'); return; }
    cerrar(); confeti();
    modal({ icon: '✅', title: '¡Solicitud enviada!', body: 'Te contactaremos para confirmar tu sesión con el tutor. 🧑‍🏫', actions: [{ label: 'Listo', onClick: cerrar }] });
  }

  /* ============================================================
     MISIÓN DEL DÍA
  ============================================================ */
  function actualizarMisionUI() {
    const d = ctx?.flujo?.daily;
    if (!d) return;
    const p = Math.min(d.misionPalabras || 0, CFG.MISION_PALABRAS_DIA);
    const f = Math.min(d.misionFrases || 0, CFG.MISION_FRASES_DIA);
    const tp = document.getElementById('mision-palabras-txt');
    const tf = document.getElementById('mision-frases-txt');
    if (tp) tp.textContent = `${p}/${CFG.MISION_PALABRAS_DIA} palabras`;
    if (tf) tf.textContent = `${f}/${CFG.MISION_FRASES_DIA} frases`;
    const w = document.getElementById('mision-dia-widget');
    if (w) w.classList.toggle('border-green-300', !!d.misionCumplida);
  }

  function abrirMisionDia() {
    const d = ctx?.flujo?.daily || {};
    const p = d.misionPalabras || 0, f = d.misionFrases || 0;
    modal({
      icon: '🎯', title: 'Misión del día',
      body: `Cada día, si estudias <b>${CFG.MISION_PALABRAS_DIA} palabras nuevas</b> y <b>${CFG.MISION_FRASES_DIA} frases nuevas</b> (en Pronunciación), ganas <b>${CFG.MISION_RECOMPENSA_LINGOTS} 💎 lingots</b> de regalo.<br><br>
        📚 Palabras nuevas hoy: <b>${p}/${CFG.MISION_PALABRAS_DIA}</b><br>
        🎙️ Frases nuevas hoy: <b>${f}/${CFG.MISION_FRASES_DIA}</b><br><br>
        ${d.misionCumplida ? '✅ ¡Ya la cumpliste hoy! Vuelve mañana por más.' : 'Se reinicia cada medianoche. ¡Tú puedes! 💪'}`,
      actions: [{ label: 'Entendido', onClick: cerrar }]
    });
  }

  /* ============================================================
     MAZO — panel + práctica rápida autocontenida
  ============================================================ */
  let mazoCount = 0;

  async function cargarMazo() {
    const { data: filas, error } = await ctx.dbClient.from('mazo')
      .select('id, ingles, espanol, word_id').eq('user_id', ctx.currentUser.id).order('created_at', { ascending: true });
    if (error) { console.warn('[mazo]', error.message); return { error, filas: [], words: [] }; }
    const ids = (filas || []).filter(f => f.word_id).map(f => f.word_id);
    let words = [];
    if (ids.length) {
      const { data } = await ctx.dbClient.from('palabras').select('*').in('id', ids);
      words = data || [];
    }
    const orden = new Map((filas || []).map((f, k) => [(f.ingles || '').toLowerCase(), k]));
    words.sort((a, b) => (orden.get((a.ingles || '').toLowerCase()) ?? 999) - (orden.get((b.ingles || '').toLowerCase()) ?? 999));
    return { filas: filas || [], words };
  }

  async function refreshMazoBadge() {
    if (!ctx?.currentUser) return 0;
    const { count } = await ctx.dbClient.from('mazo').select('id', { count: 'exact', head: true }).eq('user_id', ctx.currentUser.id);
    mazoCount = count || 0;
    const m = document.getElementById('mazo-menu-count');
    if (m) m.textContent = mazoCount ? `${mazoCount} palabras` : '';
    return mazoCount;
  }

  async function openMazo() {
    modal({ icon: '🃏', title: 'Mi Mazo', size: 'lg', body: `<div id="mz-body" class="text-left">${spinnerHTML()}</div>`, actions: [] });
    const el = document.getElementById('mz-body');
    if (!el) return;
    const { words } = await cargarMazo();
    if (!document.getElementById('mz-body')) return;
    const tiene = words.length > 0;

    el.innerHTML = `
      ${tiene ? `
        <div class="bg-orange-50 border-2 border-orange-200 rounded-xl p-3 mb-3">
          <div class="flex items-center justify-between mb-2">
            <p class="font-bold text-slate-700 text-sm">Tu mazo · <b>${words.length}</b> palabra(s)</p>
            <button id="mz-vaciar" class="text-[10px] font-bold text-slate-400 hover:text-red-500 transition">Vaciar</button>
          </div>
          <div class="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto mb-3">
            ${words.map(w => `<span class="text-[11px] font-bold px-2 py-1 rounded-full bg-white border border-slate-200 text-slate-500 flex items-center gap-1">${esc(w.ingles)}<button class="mz-del text-slate-300 hover:text-red-500" data-w="${esc(w.ingles)}" title="Quitar">&times;</button></span>`).join('')}
          </div>
          <button id="mz-practicar" class="btn-juice bg-[#FF7A00] text-white font-bold py-2.5 rounded-xl w-full">🎯 Practicar mi mazo</button>
        </div>` : '<p class="text-slate-400 text-center py-4">Tu mazo está vacío. Añade palabras desde el buscador o carga un Excel en abulingo.html. 🃏</p>'}`;

    document.getElementById('mz-practicar')?.addEventListener('click', () => {
      if (ctx.mazoPracticar) { cerrar(); return ctx.mazoPracticar(); }
      practicarMazo(words);
    });
    document.getElementById('mz-vaciar')?.addEventListener('click', () => {
      modal({
        icon: '🗑️', title: '¿Vaciar el mazo?',
        body: `Se borran las <b>${words.length}</b> palabras guardadas. Tu progreso de memoria no se pierde.`,
        actions: [
          { label: 'Sí, vaciar', style: 'bg-red-500 text-white', onClick: async () => {
              await ctx.dbClient.from('mazo').delete().eq('user_id', ctx.currentUser.id);
              await refreshMazoBadge(); toast('🗑️ Mazo vacío.'); openMazo();
            } },
          { label: 'Cancelar', style: 'bg-slate-100 text-slate-500', onClick: () => openMazo() }
        ]
      });
    });
    el.querySelectorAll('.mz-del').forEach(b => {
      b.onclick = async () => {
        await ctx.dbClient.from('mazo').delete().eq('user_id', ctx.currentUser.id).ilike('ingles', b.dataset.w);
        await refreshMazoBadge();
        toast(`Quitada: ${esc(b.dataset.w)}`, 1500);
        openMazo();
      };
    });
  }

  /* Práctica rápida (tarjetas) para gramatica.html y pronunciacion.html,
     que no tienen el motor de tarjetas de abulingo.html. No toca el SRS:
     es solo un repaso libre. */
  function practicarMazo(words) {
    if (!words.length) return toast('🃏 Tu mazo está vacío.');
    const barajado = [...words].sort(() => Math.random() - 0.5);
    let i = 0, sabidas = 0;

    const hablar = (t) => {
      if (!window.speechSynthesis) return;
      const u = new SpeechSynthesisUtterance(t);
      u.lang = 'en-US'; u.rate = 0.95;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    };

    const paso = () => {
      if (i >= barajado.length) {
        return modal({
          icon: '🎉', title: 'Repaso terminado',
          body: `Repasaste <b>${barajado.length}</b> palabra(s) y dijiste que ya sabías <b>${sabidas}</b>.`,
          actions: [
            { label: 'Repasar de nuevo', onClick: () => practicarMazo(words) },
            { label: 'Cerrar', style: 'bg-slate-100 text-slate-500', onClick: cerrar }
          ]
        });
      }
      const w = barajado[i];
      modal({
        icon: '🃏', title: `${i + 1} / ${barajado.length}`,
        body: `<div class="text-center">
            <p class="font-heading font-black text-3xl text-[#FF7A00]">${esc(w.ingles)}</p>
            ${w.fonetica ? `<p class="font-mono text-slate-400 text-sm mt-1">/${esc(w.fonetica)}/</p>` : ''}
            <button id="mzp-audio" class="mt-3 text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600"><i class="fas fa-volume-up mr-1"></i>Escuchar</button>
            <p id="mzp-es" class="hidden mt-4 text-lg font-bold text-slate-700">${esc(w.espanol || '')}</p>
          </div>`,
        actions: [
          { label: 'Ver significado 👀', onClick: () => {
              document.getElementById('mzp-es')?.classList.remove('hidden');
              document.querySelector('.modal-action[data-idx="0"]')?.classList.add('hidden');
              document.querySelector('.modal-action[data-idx="1"]')?.classList.remove('hidden');
              document.querySelector('.modal-action[data-idx="2"]')?.classList.remove('hidden');
            } },
          { label: 'Ya la sé ✅', style: 'bg-green-500 text-white hidden', onClick: () => { sabidas++; i++; paso(); } },
          { label: 'Repasarla otra vez 🔁', style: 'bg-slate-100 text-slate-500 hidden', onClick: () => { barajado.push(w); i++; paso(); } }
        ]
      });
      document.getElementById('mzp-audio')?.addEventListener('click', () => {
        if (w.audio) new Audio(w.audio).play().catch(() => hablar(w.ingles));
        else hablar(w.ingles);
      });
    };
    paso();
  }

  /* ============================================================
     API pública
  ============================================================ */
  const ACCIONES = {
    'ranking-global': openRankingGlobal,
    'ranking-equipo': openRankingEquipo,
    'progreso-nivel': openProgresoNivel,
    'certificados': openCertificados,
    'mazo': () => (ctx.pagina && ctx.pagina !== 'abulingo') ? abrirEnAbulingo('mazo') : openMazo(),
    'soporte': openSoporte,
    'solicitar-tutor': openSolicitarTutor,
    'mision': abrirMisionDia,
    'idioma': openIdioma,
    'racha': abrirRacha
  };

  const PAGINAS_MENU = {
    palabras: 'abulingo.html',
    club: 'abulingo.html?menu=club',
    juego: 'mundo_ingles.html',
    juego2: 'juego2.html',
    juego3: 'juego3.html',
    juego4: 'juego4.html',
    juego5: 'juego5.html',
    fonetica: 'fonetica.html'
  };

  function abrir(nombre) {
    if (PAGINAS_MENU[nombre]) { window.location.href = PAGINAS_MENU[nombre]; return; }
    const fn = ACCIONES[nombre];
    if (!fn) { console.warn('[AbuMenu] opción desconocida:', nombre); return; }
    fn();
  }


  /* ---------- Racha (imagen para compartir), idioma y barra de arriba ----------
     Copiado de abulingo.html para que funcione igual en todas las páginas. */
  const RACHA_W = 1080, RACHA_H = 1350;
  let rachaArchivo = null;      // File del PNG ya generado
  let rachaURL = null;          // object URL de la vista previa

  function cargarImagenSegura(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);   // si falta el archivo, se dibuja un sustituto
      img.src = src;
    });
  }

  function rectRedondo(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // Llama dibujada a mano en vez del emoji 🔥: en canvas los emojis
  // dependen de la fuente del sistema y en varios Android salen como
  // un cuadrito vacío.
  function dibujarLlama(ctx, cx, cy, h) {
    const dibujo = (alto, relleno) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy - alto * 0.55);
      ctx.bezierCurveTo(cx + alto * 0.30, cy - alto * 0.28, cx + alto * 0.42, cy + alto * 0.05, cx + alto * 0.30, cy + alto * 0.26);
      ctx.bezierCurveTo(cx + alto * 0.20, cy + alto * 0.45, cx - alto * 0.20, cy + alto * 0.45, cx - alto * 0.30, cy + alto * 0.26);
      ctx.bezierCurveTo(cx - alto * 0.42, cy + alto * 0.05, cx - alto * 0.24, cy - alto * 0.16, cx - alto * 0.10, cy - alto * 0.30);
      ctx.bezierCurveTo(cx - alto * 0.06, cy - alto * 0.16, cx - alto * 0.02, cy - alto * 0.30, cx, cy - alto * 0.55);
      ctx.closePath();
      ctx.fillStyle = relleno;
      ctx.fill();
    };
    const fuera = ctx.createLinearGradient(cx, cy - h * 0.55, cx, cy + h * 0.45);
    fuera.addColorStop(0, '#FFB347');
    fuera.addColorStop(0.5, '#FF7A00');
    fuera.addColorStop(1, '#E2452B');
    dibujo(h, fuera);
    ctx.save();
    ctx.translate(0, h * 0.14);
    dibujo(h * 0.52, '#FFD166');
    ctx.restore();
  }

  // Destello de 4 puntas (los emojis en canvas fallan en varios Android).
  function dibujarDestello(ctx, x, y, r, color) {
    ctx.beginPath();
    ctx.moveTo(x, y - r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.quadraticCurveTo(x, y, x, y + r);
    ctx.quadraticCurveTo(x, y, x - r, y);
    ctx.quadraticCurveTo(x, y, x, y - r);
    ctx.fillStyle = color;
    ctx.fill();
  }

  // Escribe el texto reduciendo el tamaño hasta que quepa en `max` px.
  function textoAjustado(ctx, texto, x, y, max, peso, tam, familia) {
    let t = tam;
    do { ctx.font = `${peso} ${t}px ${familia}`; t -= 2; } while (ctx.measureText(texto).width > max && t > 12);
    ctx.fillText(texto, x, y);
  }

  async function dibujarTarjetaRacha() {
    const dias   = ctx.flujo?.racha?.days || 0;
    const mejor  = Math.max(ctx.flujo?.racha?.best || 0, dias);
    const nivel  = ctx.flujo?.currentNivel || 'A1';
    const nombreCrudo = primerNombreR(ctx.userProfile?.full_name, '');
    const nombre = nombreCrudo ? nombreCrudo.charAt(0).toUpperCase() + nombreCrudo.slice(1) : '';
    const nuevoRecord = dias >= 2 && dias >= mejor;

    const TITULO = '"Space Grotesk", system-ui, sans-serif';
    const CUERPO = '"Work Sans", system-ui, sans-serif';

    const canvas = document.createElement('canvas');
    canvas.width = RACHA_W; canvas.height = RACHA_H;
    const c2d = canvas.getContext('2d');
    const cx = RACHA_W / 2;
    const conEspaciado = (px, fn) => { const prev = c2d.letterSpacing; if ('letterSpacing' in c2d) c2d.letterSpacing = px; fn(); if ('letterSpacing' in c2d) c2d.letterSpacing = prev; };

    // Pesos que la página no usa todavía no están descargados: se piden antes de dibujar.
    try {
      await Promise.all([
        document.fonts.load(`700 100px ${TITULO}`), document.fonts.load(`800 40px ${CUERPO}`),
        document.fonts.load(`600 40px ${CUERPO}`), document.fonts.load(`400 40px ${CUERPO}`)
      ]);
    } catch { /* navegador sin la API */ }

    // ---- Fondo: degradado, luces y trama de puntos ----
    const fondo = c2d.createLinearGradient(0, 0, RACHA_W, RACHA_H);
    fondo.addColorStop(0, '#1152B8');
    fondo.addColorStop(0.55, '#0A3478');
    fondo.addColorStop(1, '#04173A');
    c2d.fillStyle = fondo;
    c2d.fillRect(0, 0, RACHA_W, RACHA_H);

    const luz = (x, y, r, color) => {
      const g = c2d.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
      c2d.fillStyle = g; c2d.fillRect(x - r, y - r, r * 2, r * 2);
    };
    luz(960, 90, 380, 'rgba(96,165,250,0.30)');
    luz(80, 1260, 420, 'rgba(255,122,0,0.18)');
    luz(cx, 440, 460, 'rgba(255,122,0,0.40)');

    c2d.fillStyle = 'rgba(255,255,255,0.05)';
    for (let y = 18; y < RACHA_H; y += 36) for (let x = 18; x < RACHA_W; x += 36) { c2d.beginPath(); c2d.arc(x, y, 2, 0, Math.PI * 2); c2d.fill(); }

    // ---- Cabecera: pastilla con ícono + logotipo ----
    const icono = await cargarImagenSegura('icono.png');
    c2d.font = `700 52px ${TITULO}`;
    const anchoLogo = c2d.measureText('Abulingo.').width;
    const ico = 80, pillW = 18 + ico + 20 + anchoLogo + 34, pillH = 108;
    const pillX = cx - pillW / 2, pillY = 62;
    rectRedondo(c2d, pillX, pillY, pillW, pillH, pillH / 2);
    c2d.fillStyle = 'rgba(255,255,255,0.10)'; c2d.fill();
    c2d.lineWidth = 2; c2d.strokeStyle = 'rgba(255,255,255,0.18)'; c2d.stroke();

    const icoCx = pillX + 14 + ico / 2, icoCy = pillY + pillH / 2;
    c2d.save();
    c2d.beginPath(); c2d.arc(icoCx, icoCy, ico / 2, 0, Math.PI * 2);
    c2d.fillStyle = '#FFFFFF'; c2d.fill();
    if (icono) {
      c2d.clip();
      const lado = Math.min(icono.width, icono.height) || 1;
      c2d.drawImage(icono, (icono.width - lado) / 2, (icono.height - lado) / 2, lado, lado, icoCx - ico / 2, icoCy - ico / 2, ico, ico);
    } else {
      c2d.fillStyle = '#0D47A1'; c2d.font = `700 46px ${TITULO}`; c2d.textAlign = 'center';
      c2d.fillText('A', icoCx, icoCy + 16);
    }
    c2d.restore();

    c2d.textAlign = 'left'; c2d.textBaseline = 'alphabetic';
    c2d.font = `700 52px ${TITULO}`;
    const logoX = icoCx + ico / 2 + 20, logoY = icoCy + 18;
    c2d.fillStyle = '#FFFFFF'; c2d.fillText('Abulingo', logoX, logoY);
    c2d.fillStyle = '#FF7A00'; c2d.fillText('.', logoX + c2d.measureText('Abulingo').width, logoY);

    // ---- Anillo luminoso con la llama ----
    const anilloY = 446, anilloR = 172;
    c2d.beginPath(); c2d.arc(cx, anilloY, anilloR, 0, Math.PI * 2);
    c2d.fillStyle = 'rgba(255,255,255,0.06)'; c2d.fill();
    const aro = c2d.createLinearGradient(cx - anilloR, anilloY - anilloR, cx + anilloR, anilloY + anilloR);
    aro.addColorStop(0, '#FFD166'); aro.addColorStop(0.5, '#FF7A00'); aro.addColorStop(1, '#E2452B');
    c2d.save();
    c2d.shadowColor = 'rgba(255,122,0,0.85)'; c2d.shadowBlur = 50;
    c2d.lineWidth = 12; c2d.strokeStyle = aro; c2d.stroke();
    c2d.restore();

    c2d.save();
    c2d.shadowColor = 'rgba(255,90,0,0.7)'; c2d.shadowBlur = 40;
    dibujarLlama(c2d, cx, anilloY + 12, 250);
    c2d.restore();

    [[268, 300, 22], [820, 280, 16], [846, 560, 26], [240, 590, 14], [700, 216, 10], [372, 196, 9]]
      .forEach(([x, y, r]) => dibujarDestello(c2d, x, y, r, 'rgba(255,209,102,0.9)'));

    // ---- Número y etiqueta ----
    c2d.textAlign = 'center';
    const tamNum = dias > 999 ? 170 : dias > 99 ? 210 : 250;
    c2d.font = `700 ${tamNum}px ${TITULO}`;
    const num = c2d.createLinearGradient(0, 836 - tamNum * 0.75, 0, 836);
    num.addColorStop(0, '#FFFFFF'); num.addColorStop(1, '#FFE0B8');
    c2d.save();
    c2d.shadowColor = 'rgba(0,0,0,0.35)'; c2d.shadowBlur = 30; c2d.shadowOffsetY = 10;
    c2d.fillStyle = num;
    c2d.fillText(String(dias), cx, 836);
    c2d.restore();

    const etiqueta = dias === 1 ? 'DÍA DE RACHA' : 'DÍAS DE RACHA';
    c2d.font = `800 36px ${CUERPO}`;
    let anchoEtiqueta = 0;
    conEspaciado('6px', () => { anchoEtiqueta = c2d.measureText(etiqueta).width; });
    const etW = anchoEtiqueta + 76, etH = 68, etY = 868;
    rectRedondo(c2d, cx - etW / 2, etY, etW, etH, etH / 2);
    const pillNar = c2d.createLinearGradient(cx - etW / 2, 0, cx + etW / 2, 0);
    pillNar.addColorStop(0, '#FF8A1F'); pillNar.addColorStop(1, '#F25C05');
    c2d.save(); c2d.shadowColor = 'rgba(242,92,5,0.45)'; c2d.shadowBlur = 24; c2d.shadowOffsetY = 6;
    c2d.fillStyle = pillNar; c2d.fill(); c2d.restore();
    c2d.fillStyle = '#FFFFFF';
    conEspaciado('6px', () => c2d.fillText(etiqueta, cx + 3, etY + 47));

    // ---- Frase ----
    const frase = dias > 0
      ? (nombre ? `${nombre} lleva ${dias} día${dias === 1 ? '' : 's'} aprendiendo inglés sin parar` : `¡${dias} día${dias === 1 ? '' : 's'} seguidos aprendiendo inglés!`)
      : 'Hoy empieza mi racha de inglés';
    c2d.fillStyle = 'rgba(255,255,255,0.90)';
    textoAjustado(c2d, frase, cx, 1006, 920, 600, 38, CUERPO);

    // ---- Tarjeta: semana actual + récord y nivel ----
    const cardX = 80, cardY = 1046, cardW = RACHA_W - 160, cardH = 176;
    rectRedondo(c2d, cardX, cardY, cardW, cardH, 34);
    c2d.fillStyle = 'rgba(255,255,255,0.09)'; c2d.fill();
    c2d.lineWidth = 2; c2d.strokeStyle = 'rgba(255,255,255,0.16)'; c2d.stroke();

    // Días de esta semana (lunes a domingo) que forman parte de la racha.
    const dia0 = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
    const hoy = dia0(new Date());
    const lunes = new Date(hoy); lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
    const ultimo = ctx.flujo?.racha?.last ? dia0(`${ctx.flujo.racha.last}T12:00:00`) : null;
    const letras = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    const semX0 = cardX + 44, paso = 66, circY = cardY + 68, circR = 24;
    letras.forEach((l, i) => {
      const d = new Date(lunes); d.setDate(lunes.getDate() + i);
      const enRacha = !!ultimo && dias > 0 && d <= ultimo && (ultimo - d) / 86400000 < dias;
      const esHoy = d.getTime() === hoy.getTime();
      const x = semX0 + circR + i * paso;
      c2d.beginPath(); c2d.arc(x, circY, circR, 0, Math.PI * 2);
      if (enRacha) {
        const g = c2d.createLinearGradient(x, circY - circR, x, circY + circR);
        g.addColorStop(0, '#FFB347'); g.addColorStop(1, '#F25C05');
        c2d.fillStyle = g; c2d.fill();
        c2d.beginPath();
        c2d.moveTo(x - 10, circY + 1); c2d.lineTo(x - 3, circY + 8); c2d.lineTo(x + 11, circY - 7);
        c2d.lineWidth = 5; c2d.lineCap = 'round'; c2d.lineJoin = 'round'; c2d.strokeStyle = '#FFFFFF'; c2d.stroke();
      } else {
        c2d.fillStyle = 'rgba(255,255,255,0.10)'; c2d.fill();
      }
      if (esHoy) { c2d.beginPath(); c2d.arc(x, circY, circR + 7, 0, Math.PI * 2); c2d.lineWidth = 3; c2d.strokeStyle = '#FFD166'; c2d.stroke(); }
      c2d.fillStyle = esHoy ? '#FFD166' : 'rgba(255,255,255,0.60)';
      c2d.font = `${esHoy ? 800 : 600} 24px ${CUERPO}`;
      c2d.fillText(l, x, cardY + 138);
    });

    // Separador y datos a la derecha
    const sepX = semX0 + 7 * paso + 4;
    c2d.fillStyle = 'rgba(255,255,255,0.16)';
    c2d.fillRect(sepX, cardY + 30, 2, cardH - 60);
    const datos = [
      [nuevoRecord ? '¡NUEVO RÉCORD!' : 'RÉCORD', `${mejor} día${mejor === 1 ? '' : 's'}`, nuevoRecord ? '#FFD166' : 'rgba(255,255,255,0.60)'],
      ['NIVEL', nivel, 'rgba(255,255,255,0.60)']
    ];
    const colX = (sepX + cardX + cardW) / 2;
    datos.forEach(([titulo, valor, color], i) => {
      const y = cardY + 44 + i * 76;
      c2d.fillStyle = color;
      c2d.font = `800 18px ${CUERPO}`;
      conEspaciado('2px', () => c2d.fillText(titulo, colX, y));
      c2d.fillStyle = '#FFFFFF';
      c2d.font = `700 36px ${TITULO}`;
      c2d.fillText(valor, colX, y + 40);
    });

    // ---- Pie: llamada a la acción ----
    c2d.font = `600 32px ${CUERPO}`;
    const pre = 'Aprende inglés conmigo en ';
    const anchoPre = c2d.measureText(pre).width;
    c2d.font = `800 32px ${CUERPO}`;
    const anchoUrl = c2d.measureText('abulingo.github.io').width;
    const pieW = anchoPre + anchoUrl + 70, pieH = 72, pieY = 1250;
    rectRedondo(c2d, cx - pieW / 2, pieY, pieW, pieH, pieH / 2);
    c2d.fillStyle = '#FFFFFF'; c2d.fill();
    c2d.textAlign = 'left';
    const pieX = cx - (anchoPre + anchoUrl) / 2;
    c2d.fillStyle = '#334155'; c2d.font = `600 32px ${CUERPO}`;
    c2d.fillText(pre, pieX, pieY + 47);
    c2d.fillStyle = '#F26A00'; c2d.font = `800 32px ${CUERPO}`;
    c2d.fillText('abulingo.github.io', pieX + anchoPre, pieY + 47);

    const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
    return { blob, dias };
  }

  function descargarRacha() {
    if (!rachaURL || !rachaArchivo) return;
    const a = document.createElement('a');
    a.href = rachaURL;
    a.download = rachaArchivo.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    ctx.showToast('📥 Imagen descargada. ¡Compártela donde quieras!', 3000);
  }

  async function compartirRachaArchivo(dias) {
    if (!rachaArchivo) return;
    const texto = dias > 0
      ? `Llevo ${dias} día${dias === 1 ? '' : 's'} seguidos aprendiendo inglés con Abulingo 🔥`
      : 'Hoy empiezo mi racha de inglés con Abulingo 🔥';
    try {
      if (navigator.canShare && navigator.canShare({ files: [rachaArchivo] })) {
        await navigator.share({ files: [rachaArchivo], title: 'Mi racha en Abulingo', text: texto });
        return;
      }
    } catch (err) {
      // "AbortError" = el usuario cerró la hoja de compartir: no es un fallo.
      if (err?.name === 'AbortError') return;
      console.warn('[racha] compartir:', err?.message || err);
    }
    descargarRacha();   // navegador sin compartir archivos (escritorio, Firefox…)
  }

  async function abrirCompartirRacha() {
    ctx.showModal({
      icon: '🔥', title: 'Preparando tu imagen…',
      body: '<div class="w-10 h-10 border-4 border-[#FF7A00] border-t-transparent rounded-full animate-spin mx-auto my-4"></div>',
      dismissable: true, actions: []
    });

    let datos = null;
    try { datos = await dibujarTarjetaRacha(); } catch (err) { console.warn('[racha] imagen:', err); }
    if (!datos?.blob) {
      return ctx.showModal({
        icon: '😕', title: 'No se pudo crear la imagen',
        body: 'Vuelve a intentarlo en un momento.',
        actions: [{ label: 'Cerrar', onClick: ctx.closeModal }]
      });
    }

    if (rachaURL) URL.revokeObjectURL(rachaURL);
    rachaArchivo = new File([datos.blob], `racha-abulingo-${datos.dias}-dias.png`, { type: 'image/png' });
    rachaURL = URL.createObjectURL(datos.blob);

    const puedeCompartir = !!(navigator.canShare && navigator.canShare({ files: [rachaArchivo] }));
    ctx.showModal({
      icon: '', title: 'Tu racha, lista para presumir',
      body: `<img src="${rachaURL}" alt="Mi racha en Abulingo" class="w-full rounded-2xl shadow-lg">`,
      actions: [
        ...(puedeCompartir ? [{ label: 'Compartir 🔥', onClick: () => compartirRachaArchivo(datos.dias) }] : []),
        { label: 'Descargar imagen', style: puedeCompartir ? 'bg-slate-100 text-slate-600' : 'bg-[#FF7A00] text-white', onClick: descargarRacha },
        { label: 'Cerrar', style: 'bg-white border-2 border-slate-200 text-slate-500', onClick: ctx.closeModal }
      ]
    });
  }

  function primerNombreR(nombre, porDefecto) {
    const limpio = (nombre || '').toString().replace(/\s+/g, ' ').trim();
    return limpio ? limpio.split(' ')[0] : porDefecto;
  }
  // 🔥 Racha: modal con ánimo y botón para compartir la imagen.
  function abrirRacha() {
    const dias = ctx.flujo?.racha?.days || 0;
    const animos = [
      '¡Cada día cuenta! Tu cerebro fija mejor el inglés cuando practicas seguido.',
      'Una racha larga es la mejor señal de que el hábito ya se está formando. ¡No la rompas!',
      'Constancia > cantidad. Con unos minutos al día vas a llegar lejos.',
      '¡Vas muy bien! Sigue así y pronto ni lo vas a pensar, será parte de tu rutina.'
    ];
    ctx.showModal({
      icon: '🔥', title: dias > 0 ? `¡Llevas ${dias} día${dias === 1 ? '' : 's'} de racha!` : 'Empieza tu racha hoy',
      body: dias > 0 ? animos[Math.floor(Math.random() * animos.length)] : 'Estudia hoy para encender tu racha diaria. 🔥',
      actions: [
        { label: '<i class="fas fa-share-nodes mr-2"></i>Compartir racha', onClick: abrirCompartirRacha },
        { label: '¡Seguir así! 💪', style: 'bg-white border-2 border-slate-200 text-slate-500', onClick: ctx.closeModal }
      ]
    });
  }
  // 🌎 Idioma que aprende la persona (igual que en abulingo.html).
  function openIdioma() {
    const es = !!window.AbuIdioma?.aprendeEspanol;
    const opcion = (v, bandera, nombre, sub) => `
      <button class="idioma-elegir btn-juice w-full flex items-center gap-3 p-3 rounded-xl border-2 mb-2 text-left" data-v="${v}"
        style="border-color:${(v === 'es') === es ? '#FF7A00' : '#e2e8f0'};background:${(v === 'es') === es ? '#fff7ed' : '#fff'}">
        <span class="text-3xl">${bandera}</span>
        <span><b class="block text-slate-700">${nombre}</b><span class="text-xs text-slate-400">${sub}</span></span>
        ${(v === 'es') === es ? '<i class="fas fa-check ml-auto text-[#FF7A00]"></i>' : ''}
      </button>`;
    ctx.showModal({
      icon: '🌎', title: 'Idioma que aprendo · Language I learn', size: 'md',
      body: `<div class="text-left">
        ${opcion('en', '🇺🇸', 'Inglés · English', 'Aprendo inglés (hablo español)')}
        ${opcion('es', '🇪🇸', 'Español · Spanish', 'I learn Spanish (I speak English)')}
        <p class="text-[11px] text-slate-400 text-center mt-2">Tu avance de cada idioma se guarda por separado en las palabras que estudies.</p>
      </div>`,
      actions: []
    });
    document.querySelectorAll('.idioma-elegir').forEach(b => b.onclick = async () => {
      if ((b.dataset.v === 'es') === es) return ctx.closeModal();
      b.disabled = true;
      try { await window.AbuIdioma.cambiar(b.dataset.v, ctx.dbClient); }
      catch (err) { b.disabled = false; ctx.showToast('⚠️ ' + err.message); }
    });
  }
  // Barra de arriba (puntos, racha, nivel) en las páginas que la tienen.
  function pintarHUD() {
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    if (ctx.userProfile) set('user-points-display', ctx.userProfile.points || 0);
    if (ctx.flujo) set('streak-days', ctx.flujo.racha?.days || 0);
    const idi = document.getElementById('idioma-menu-actual');
    if (idi && !idi.textContent) idi.textContent = window.AbuIdioma?.aprendeEspanol ? '🇪🇸 Spanish' : '🇺🇸 Inglés';
    const hud = document.getElementById('hud-nivel-label');
    if (hud) hud.textContent = ctx.flujo?.currentNivel || ctx.userProfile?.nivel || 'A1';
  }

  /* El Mazo de abulingo.html (completo: no dominadas por nivel, Excel,
     phrasal verbs y práctica) se abre aquí mismo, encima de la página,
     en un iframe que solo muestra su ventana. Si se empieza a practicar,
     se sigue en abulingo.html (la práctica usa la pantalla principal). */
  function abrirEnAbulingo(menu) {
    if (document.getElementById('abu-menu-frame')) return;
    const f = document.createElement('iframe');
    f.id = 'abu-menu-frame';
    f.src = `abulingo.html?embed=1&menu=${encodeURIComponent(menu)}`;
    f.allow = 'microphone; autoplay';
    f.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;border:0;z-index:300;background:transparent;color-scheme:normal';
    document.body.appendChild(f);
  }
  window.addEventListener('message', (e) => {
    if (e.origin !== location.origin) return;
    if (e.data?.abuEmbed === 'cerrar') document.getElementById('abu-menu-frame')?.remove();
    if (e.data?.abuEmbed === 'ir' && /^abulingo\.html/.test(e.data.url || '')) location.href = e.data.url;
  });

  function init(nuevoCtx) {
    ctx = Object.assign({}, nuevoCtx);
    if (nuevoCtx.config) Object.assign(CFG, nuevoCtx.config);
    return AbuMenuAPI;
  }

  // Deja el flujo/perfil frescos si la página los reemplaza después de init.
  function actualizarCtx(parcial) { Object.assign(ctx, parcial); }

  function bind(opciones) {
    const op = opciones || {};
    const btn = document.getElementById('profile-menu-button');
    const drop = document.getElementById('profile-menu-dropdown');
    // Algunas páginas ya abren/cierran el desplegable por su cuenta; en ese
    // caso se pasa { perfil: false } para no enganchar dos veces (si no, un
    // clic abriría y cerraría el menú al mismo tiempo).
    if (btn && drop && op.perfil !== false) {
      btn.addEventListener('click', (e) => { e.stopPropagation(); drop.classList.toggle('hidden'); });
      document.addEventListener('click', (e) => {
        if (!drop.classList.contains('hidden') && !drop.contains(e.target) && !btn.contains(e.target)) drop.classList.add('hidden');
      });
    }
    document.querySelectorAll('[data-menu]').forEach(b => {
      b.onclick = () => {
        drop?.classList.add('hidden');
        // Estas opciones son páginas aparte (o, el Club, un modal que vive
        // solo en abulingo.html): se navega en vez de abrir un modal aquí.
        const destino = PAGINAS_MENU[b.dataset.menu];
        if (destino) {
          if (!location.pathname.endsWith('/' + destino.split('?')[0])) window.location.href = destino;
          return;
        }
        abrir(b.dataset.menu);
      };
    });
    document.getElementById('mision-dia-widget')?.addEventListener('click', () => {
      drop?.classList.add('hidden');
      abrirMisionDia();
    });
    // Racha y nivel de la barra de arriba (en abulingo.html ya los engancha la página).
    const racha = document.getElementById('streak-widget');
    if (racha && !racha.dataset.abuMenu && ctx.pagina !== 'abulingo') { racha.dataset.abuMenu = '1'; racha.addEventListener('click', abrirRacha); }
    document.getElementById('hud-nivel-btn')?.addEventListener('click', openProgresoNivel);
    pintarHUD();
    const wa = document.getElementById('whatsapp-comunidad-link');
    if (wa) wa.href = CFG.WHATSAPP_COMUNIDAD_URL;
    actualizarMisionUI();
  }

  async function refreshBadges() {
    actualizarMisionUI();
    pintarHUD();
    await refreshMazoBadge();
    // Los certificados se cuentan solo cuando se abre el modal: contar las
    // palabras de los 4 niveles al arrancar sería un gasto innecesario.
  }

  const AbuMenuAPI = {
    init, bind, abrir, actualizarCtx, refreshBadges,
    actualizarMisionUI, abrirMisionDia,
    progresoNivel: openProgresoNivel,
    rankingGlobal: openRankingGlobal,
    rankingEquipo: openRankingEquipo,
    certificados: openCertificados,
    mazo: openMazo,
    soporte: openSoporte,
    solicitarTutor: openSolicitarTutor,
    refreshMazoBadge,
    racha: abrirRacha, compartirRacha: abrirCompartirRacha, idioma: openIdioma, pintarHUD
  };

  window.AbuMenu = AbuMenuAPI;
})();
