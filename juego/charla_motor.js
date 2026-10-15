'use strict';
/* ============================================================================
   ENGLISH TALK (JUEGO 3) · MOTOR
   ----------------------------------------------------------------------------
   Una calle que solo va hacia la derecha (como English Street). Cada día hay
   3 escenas: tu vecino, tu amiga en el café, el profesor en el colegio...
   Al llegar a cada persona se CONVERSA: ella dice algo y tú respondes con la
   frase clave (eligiéndola, ordenándola, completándola o diciéndola con el
   micrófono). Así se aprenden las 300+ frases más útiles del inglés americano.

   Usa los dibujos de English Street (CalleDib) y las personas de motor_base.
   Avance en Supabase con AbuProgreso (app 'juego3') + copia local.
============================================================================ */
(() => {
  const C = Charla, D = CalleDib;
  const g = ctx;
  const $ = id => document.getElementById(id);
  const barajar = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const elegirUno = a => a[Math.floor(Math.random() * a.length)];
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const escHTML = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const espera = ms => new Promise(r => setTimeout(r, ms));

  /* ======================================================================
     FRASES
  ====================================================================== */
  const ESC = {};
  const FRASES = [];          // { k, esc, i, en, es, npcEn, npcEs }
  C.ESCENAS.forEach(e => {
    ESC[e.id] = e;
    e.frases = e.dialogo.map((d, i) => {
      const f = { k: e.id + ':' + i, esc: e.id, i, npcEn: d[0], npcEs: d[1], en: d[2], es: d[3] };
      FRASES.push(f);
      return f;
    });
  });
  const IDS = C.ESCENAS.map(e => e.id);

  /* ======================================================================
     ESTADO
  ====================================================================== */
  let progreso = null, nombreJugador = 'friend';
  function normalizar(d) {
    const p = d && typeof d === 'object' ? d : {};
    return {
      v: 1, dia: p.dia || 1, ruta: Array.isArray(p.ruta) ? p.ruta : null, paso: p.paso || 0,
      frases: p.frases || {}, escenas: p.escenas || {}, xp: p.xp || 0,
      racha: p.racha || { dias: 0, ultima: null },
      stats: Object.assign({ habladas: 0, aciertos: 0, errores: 0, mejorCombo: 0 }, p.stats || {}),
      avatar: p.avatar || { seed: Gen.randomSeed(), sexo: Math.random() < 0.5 ? 'f' : 'm' },
      lento: !!p.lento, mudo: !!p.mudo, traduccion: p.traduccion !== false, fin: !!p.fin
    };
  }
  function guardar() { if (window.AbuProgreso && progreso) AbuProgreso.guardar(progreso); }
  const vista = f => !!progreso.frases[f.k];
  const dominada = f => { const e = progreso.frases[f.k]; return e && e[0] >= 2 && e[0] > e[1]; };
  const totalVistas = () => FRASES.filter(vista).length;
  function marcar(f, ok) {
    const e = progreso.frases[f.k] || (progreso.frases[f.k] = [0, 0, progreso.dia]);
    if (ok) e[0]++; else e[1]++;
  }
  const nivel = xp => Math.floor(Math.sqrt(xp / 40)) + 1;
  const xpNivel = n => 40 * (n - 1) * (n - 1);

  /* ======================================================================
     VOZ
  ====================================================================== */
  let ultimaVoz = { txt: '', tono: 1 };
  function hablar(texto, tono = 1, rate) {
    ultimaVoz = { txt: texto, tono };
    return new Promise(res => {
      if (!Voice.ok || !texto) { res(); return; }
      try { speechSynthesis.cancel(); } catch { /* nada */ }
      const u = new SpeechSynthesisUtterance(texto.replace(/[^\p{L}\p{N}\s.,!?'’:;-]/gu, ''));
      u.lang = 'en-US'; if (Voice.voice) u.voice = Voice.voice;
      u.rate = rate || (progreso && progreso.lento ? 0.62 : 0.9); u.pitch = tono;
      let hecho = false; const fin = () => { if (!hecho) { hecho = true; res(); } };
      u.onend = fin; u.onerror = fin; setTimeout(fin, 1500 + texto.length * 90);
      speechSynthesis.speak(u);
    });
  }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  function escucharVoz() {
    return new Promise(res => {
      if (!SR) { res(null); return; }
      let r; try { r = new SR(); } catch { res(null); return; }
      try { speechSynthesis.cancel(); } catch { /* nada */ }
      r.lang = 'en-US'; r.interimResults = false; r.maxAlternatives = 5;
      let listo = false;
      r.onresult = e => { listo = true; res([...e.results[0]].map(a => a.transcript)); };
      r.onerror = ev => { if (!listo) { listo = true; res(ev.error === 'not-allowed' || ev.error === 'service-not-allowed' ? null : []); } };
      r.onend = () => { if (!listo) { listo = true; res([]); } };
      try { r.start(); } catch { res(null); }
    });
  }
  const NUMS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
  function normalizarFrase(s) {
    return ' ' + s.toLowerCase().replace(/[’`]/g, "'")
      .replace(/\bi'm\b/g, 'i am').replace(/\b(it|that|what|there|he|she|let|here)'s\b/g, '$1 is').replace(/'re\b/g, ' are').replace(/'ll\b/g, ' will')
      .replace(/won't\b/g, 'will not').replace(/can't\b/g, 'cannot').replace(/n't\b/g, ' not').replace(/'ve\b/g, ' have').replace(/'d\b/g, ' would')
      .replace(/\bcan not\b/g, 'cannot').replace(/\b(\d+)\b/g, (m, n) => NUMS[+n] || m).replace(/[^a-z\s']/g, ' ').replace(/\s+/g, ' ') + ' ';
  }
  function lev(a, b) {
    const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
    let prev = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) {
      const cur = [i];
      for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[n];
  }
  function parecido(dichos, objetivo) {
    const obj = normalizarFrase(objetivo).trim().split(' ').filter(Boolean);
    if (!obj.length) return 0;
    let mejor = 0;
    (dichos || []).forEach(d => {
      const tok = normalizarFrase(d).trim().split(' ');
      const ok = obj.filter(o => tok.some(t => t === o || (o.length > 3 && lev(t, o) <= 1) || (o.length > 6 && lev(t, o) <= 2))).length;
      mejor = Math.max(mejor, ok / obj.length);
    });
    return mejor;
  }

  /* ======================================================================
     EL MUNDO DE CADA DÍA
  ====================================================================== */
  const SEP = 1250, X0 = 760, PARADA = 270;
  let mundo = null, actual = null, modo = 'intro';
  const jugador = { x: -120, h: null, mov: false, objetivo: null, globo: null, celebra: 0 };
  const teclas = { izq: false, der: false };
  let particulas = [], textos = [], ahora = 0;
  let combo = 0, erroresEnc = 0;

  function puntajeRepaso(e) {
    return e.frases.reduce((s, f) => { const r = progreso.frases[f.k]; return s + (r ? r[1] * 2 - r[0] * 0.5 : 0); }, 0);
  }
  function armarRuta() {
    const nuevas = IDS.filter(id => !progreso.escenas[id]);
    let ruta = nuevas.slice(0, C.POR_DIA);
    if (ruta.length < C.POR_DIA) {
      // Ya se jugaron todas: vuelven las que más cuestan
      const resto = IDS.filter(id => !ruta.includes(id)).sort((a, b) => puntajeRepaso(ESC[b]) - puntajeRepaso(ESC[a]) || Math.random() - 0.5);
      ruta = ruta.concat(resto.slice(0, C.POR_DIA - ruta.length));
    }
    return ruta;
  }
  function crearNPC(e, semilla) {
    const R = Gen.makeRand(semilla);
    const n = e.npc;
    const ap = aspecto(R, n.sexo, n.edad, n.rol);
    const h = makeHuman(semilla, ['de pie', 'saludo', 'brazos arriba', 'manos en cintura'], ap);
    return { h, acc: MundoDatos.ROPA[n.rol] && MundoDatos.ROPA[n.rol].acc, habla: 0, celebra: 0, globo: null };
  }
  function crearJugador() {
    const R = Gen.makeRand('yo:' + progreso.avatar.seed);
    const ap = aspecto(R, progreso.avatar.sexo, 'joven', 'person');
    jugador.h = makeHuman('yo:' + progreso.avatar.seed, ['de pie', 'saludo', 'brazos arriba', 'manos en cintura'], ap);
  }
  function crearMundo() {
    const semilla = progreso.avatar.seed + ':talk' + progreso.dia;
    const R = Gen.makeRand(semilla);
    const est = progreso.ruta.map((id, i) => {
      const e = ESC[id], x = X0 + i * SEP, fondo = D.ESC[e.escena] || D.ESC.casa;
      const ch = Object.assign({ toldo: [e.color, '#ffffff'], letrero: '', telon: e.color }, e.ch || {});
      return { i, x, e, ch, fondo, npc: crearNPC(e, 'talk:' + id + ':' + progreso.avatar.seed), npcX: x + (fondo.npc || 90), npcY: fondo.npcY || 0, hecho: i < progreso.paso };
    });
    const decor = [];
    const tramos = [[-420, X0 - PARADA - 120]];
    est.forEach((s, i) => tramos.push([s.x + 300, (est[i + 1] ? est[i + 1].x - PARADA - 120 : s.x + 300 + 760)]));
    tramos.forEach(([a, b]) => {
      for (let x = a + 60; x < b - 40; x += 150 + R() * 120) decor.push({ x, tipo: R() < 0.55 ? 'arbol' : 'farola' });
    });
    mundo = { semilla, est, decor, finX: est[est.length - 1].x + 900 };
  }
  const estSiguiente = () => mundo.est.find(s => !s.hecho);
  function limiteDerecho() { const s = estSiguiente(); return s ? s.x - PARADA : mundo.finX; }

  /* ======================================================================
     CÁMARA Y PANTALLA
  ====================================================================== */
  let W = 0, H = 0, DPR = 1;
  const cam = { x: 0, k: 1, suelo: 0, listo: false };
  function medir() {
    W = innerWidth; H = innerHeight; DPR = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
  }
  addEventListener('resize', medir);
  const acostado = matchMedia('(max-height: 520px) and (orientation: landscape)');
  function objetivoCamara() {
    const dlg = $('dlg');
    const abierto = !dlg.classList.contains('oculto');
    const lateral = abierto && acostado.matches ? dlg.offsetWidth + 16 : 0;
    const dlgH = abierto && !lateral ? dlg.offsetHeight : 0;
    const abajo = modo === 'caminar' ? Math.max(lateral ? 70 : 96, H * 0.16) : Math.max(dlgH + 18, H * 0.1);
    const suelo = H - abajo;
    const anchoUtil = W - lateral;
    const ancho = modo === 'encuentro' ? (anchoUtil < 500 ? 460 : 560) : (anchoUtil < 640 ? 520 : 820);
    const k = clamp(Math.min(anchoUtil / ancho, (suelo - (lateral ? 20 : 70)) / 340), 0.3, 2.3);
    let x = jugador.x + (W / k) * 0.16;
    if (modo === 'encuentro' && actual) x = (jugador.x + actual.npcX) / 2 + lateral / 2 / k;
    return { x, k, suelo };
  }
  function moverCamara(dt) {
    const o = objetivoCamara();
    if (!cam.listo) { Object.assign(cam, o); cam.listo = true; return; }
    const f = Math.min(1, dt * 4);
    cam.x += (o.x - cam.x) * f; cam.k += (o.k - cam.k) * f; cam.suelo += (o.suelo - cam.suelo) * f;
  }
  const aMundo = (px, py) => ({ x: cam.x + (px - W / 2) / cam.k, y: (py - cam.suelo) / cam.k });

  /* ======================================================================
     DIBUJO
  ====================================================================== */
  function avanceDia() {
    if (!mundo) return 0;
    const a = mundo.est[0].x - PARADA - 200, b = mundo.finX;
    return clamp((jugador.x - a) / (b - a), 0, 0.8);   // nunca llega a la noche
  }
  function capa(par, esc, fn) {
    const k = cam.k * esc;
    g.setTransform(DPR * k, 0, 0, DPR * k, DPR * (W / 2 - cam.x * par * k), DPR * (cam.suelo - 8 * cam.k));
    fn(cam.x * par - W / 2 / k - 300, cam.x * par + W / 2 / k + 300);
  }
  function dibujar(t) {
    g.setTransform(DPR, 0, 0, DPR, 0, 0);
    const p = avanceDia();
    D.cielo(g, W, H, p);
    D.sol(g, W * (0.12 + 0.76 * p), H * (0.2 - Math.sin(p * Math.PI) * 0.1), 26, p);
    D.nubes(g, W, H, cam.x, t, mundo ? mundo.semilla : 'x');
    if (!mundo) return;
    capa(0.18, 0.9, (a, b) => D.lejos(g, a, b, mundo.semilla, p));
    capa(0.5, 0.92, (a, b) => D.edificios(g, a, b, mundo.semilla, p));
    g.setTransform(DPR * cam.k, 0, 0, DPR * cam.k, DPR * (W / 2 - cam.x * cam.k), DPR * cam.suelo);
    const x0 = cam.x - W / 2 / cam.k - 80, x1 = cam.x + W / 2 / cam.k + 80;
    D.calle(g, x0, x1, H / cam.k);
    casa(-260, t, false);
    casa(mundo.finX + 60, t, true);
    mundo.decor.forEach(d => { if (d.x > x0 - 200 && d.x < x1 + 200) { if (d.tipo === 'arbol') D.arbol(g, d.x, -2, Gen.makeRand(mundo.semilla + d.x), t); else D.farola(g, d.x, -2, false); } });
    mundo.est.forEach(s => { if (s.x + 420 > x0 && s.x - 420 < x1) estacion(s, t); });
    dibujarJugador(t);
    particulas.forEach(q => { g.globalAlpha = clamp(q.vida / q.max, 0, 1); Obj.circle(g, q.x, q.y, q.r, q.c); });
    g.globalAlpha = 1;
    textos.forEach(q => {
      g.globalAlpha = clamp(q.vida / 0.4, 0, 1);
      g.font = `900 ${q.tam}px system-ui, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.lineWidth = q.tam / 5; g.strokeStyle = 'rgba(0,0,0,.45)'; g.strokeText(q.txt, q.x, q.y); g.fillStyle = q.c; g.fillText(q.txt, q.x, q.y);
    });
    g.globalAlpha = 1;
    if (modo === 'caminar') flecha(t);
  }
  function casa(x, t, fin) {
    Obj.rect(g, x - 110, -190, 220, 190, '#ffe0b2'); Obj.poly(g, [[x - 126, -190], [x, -262], [x + 126, -190]], '#e65100');
    Obj.rr(g, x - 24, -100, 48, 100, 4, '#6d4c41'); Obj.circle(g, x + 14, -50, 3, '#ffd54f');
    D.letrero(g, x, -222, 110, 30, 'HOME', '#fff8e1', '#e65100');
    if (fin) { g.globalAlpha = 0.5 + Math.sin(t * 3) * 0.3; Obj.circle(g, x, -140, 20, '#fff59d'); g.globalAlpha = 1; Obj.text(g, '⭐', x, -140, 18, '#f9a825'); }
  }
  function flecha(t) {
    const lim = limiteDerecho();
    if (lim - jugador.x < 60 && estSiguiente()) return;
    const x = jugador.x + 70 + Math.sin(t * 5) * 6;
    Obj.poly(g, [[x, -150], [x + 22, -138], [x, -126]], 'rgba(255,122,0,.9)');
  }
  function estacion(s, t) {
    s.fondo.atras(g, s.x, t, s.ch);
    const n = s.npc, h = n.h;
    let an = { pose: 'de pie' };
    if (n.celebra > 0) an = { pose: 'brazos arriba', lift: Math.abs(Math.sin(t * 7)) * 14 };
    else if (n.habla > 0 || s.hecho) { an = { pose: 'saludo' }; if (h.poses.saludo) h.poses.saludo.p.phase = t * 3; }
    drawHuman(g, h, s.npcX, s.npcY - (an.lift || 0), { pose: an.pose });
    if (n.acc) D.accesorio(g, n.acc, s.npcX, s.npcY - (an.lift || 0) - h.alto * 1.02, h.alto);
    s.fondo.frente(g, s.x, t, s.ch);
    // letrero con el nombre de la escena
    if (actual !== s) D.letrero(g, s.x - 40, -300, 230, 30, s.e.titulo.en.toUpperCase().slice(0, 26), '#ffffff', s.e.color);
    if (s.hecho) Obj.text(g, '✅', s.npcX, s.npcY - h.alto * 1.25 - 26, 22, '#43a047');
    else if (actual !== s && s === estSiguiente()) {
      const y = s.npcY - h.alto * 1.2 - 36 + Math.sin(t * 4) * 5;
      Obj.circle(g, s.npcX, y, 16, '#ff7a00'); Obj.text(g, '💬', s.npcX, y + 1, 16, '#fff');
    }
    if (n.globo && n.globo.hasta > ahora) globo(s.npcX, s.npcY - h.alto * 1.12 - 30, n.globo.txt, '#ffffff');
  }
  function globo(x, y, txt, c) {
    g.font = '800 15px system-ui, sans-serif';
    const w = Math.min(300, g.measureText(txt).width + 22), hh = 30;
    // El globo no se sale de la pantalla (la punta sigue apuntando a quien habla)
    const vl = cam.x - W / 2 / cam.k, vr = cam.x + W / 2 / cam.k;
    const cx = clamp(x, vl + w / 2 + 6, Math.max(vl + w / 2 + 6, vr - w / 2 - 6));
    Obj.rr(g, cx - w / 2, y - hh, w, hh, 12, c);
    Obj.poly(g, [[x - 8, y - 1], [x + 8, y - 1], [x + 2, y + 10]], c);
    g.fillStyle = '#263238'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, cx, y - hh / 2, w - 12);
  }
  function dibujarJugador(t) {
    const h = jugador.h; if (!h) return;
    const celebra = jugador.celebra > ahora;
    const habla = jugador.globo && jugador.globo.hasta > ahora;
    if (habla && h.poses.saludo) h.poses.saludo.p.phase = t * 3;
    drawHuman(g, h, jugador.x, 0, { moving: jugador.mov, pose: celebra ? 'brazos arriba' : (habla ? 'saludo' : 'de pie'), lift: celebra ? Math.abs(Math.sin(t * 7)) * 12 : 0 });
    if (habla) globo(jugador.x, -h.alto * 1.12 - 20, jugador.globo.txt, '#fff3e0');
    else if (modo === 'caminar' && !jugador.mov && jugador.x < 30 && progreso.paso === 0) globo(jugador.x, -h.alto * 1.12 - 20, '▶  ¡Camina!', '#fff3e0');
  }

  /* ======================================================================
     PREMIOS
  ====================================================================== */
  function chispas(x, y, n = 14) {
    for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = 80 + Math.random() * 160; particulas.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, r: 3 + Math.random() * 3, c: elegirUno(['#ffd600', '#ff7043', '#66bb6a', '#42a5f5', '#ec407a']), vida: 0.9, max: 0.9 }); }
  }
  function confeti() {
    const s = actual || { x: jugador.x };
    for (let i = 0; i < 70; i++) particulas.push({ x: s.x - 260 + Math.random() * 520, y: -420 - Math.random() * 120, vx: (Math.random() - 0.5) * 60, vy: 60 + Math.random() * 120, r: 3 + Math.random() * 3, c: elegirUno(['#ffd600', '#ff7043', '#66bb6a', '#42a5f5', '#ec407a', '#ab47bc']), vida: 2.6, max: 2.6, sinGrav: true });
  }
  function flotante(txt, x, y, c = '#ffd600', tam = 20) { textos.push({ txt, x, y, c, tam, vida: 1.3 }); }
  function ganarXP(n) {
    const antes = nivel(progreso.xp);
    progreso.xp += n;
    flotante('+' + n + ' XP', jugador.x, -jugador.h.alto * 1.3 - 40);
    if (nivel(progreso.xp) > antes) { Sfx.level(); banner(`🎉 ¡Nivel ${nivel(progreso.xp)}!`, 'Level up!'); }
    hud();
  }
  function acierto() {
    combo++;
    progreso.stats.aciertos++; progreso.stats.mejorCombo = Math.max(progreso.stats.mejorCombo, combo);
    Sfx.collect(combo); Sfx.ok();
    chispas(jugador.x, -jugador.h.alto, 12);
    ganarXP(5 + Math.min(combo - 1, 10));
    mostrarCombo();
  }
  function fallo() { combo = 0; erroresEnc++; progreso.stats.errores++; Sfx.bad(); mostrarCombo(); }
  let bannerT = 0;
  function banner(txt, sub) {
    const b = $('banner'); b.innerHTML = `${escHTML(txt)}${sub ? `<small>${escHTML(sub)}</small>` : ''}`; b.classList.add('show');
    clearTimeout(bannerT); bannerT = setTimeout(() => b.classList.remove('show'), 2200);
  }
  let toastT = 0;
  function toast(txt) { const el = $('toast'); el.textContent = txt; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2200); }
  function mostrarCombo() { const el = $('combo'); el.textContent = combo >= 3 ? `🔥 Combo x${combo}` : ''; el.classList.toggle('show', combo >= 3); }

  /* ======================================================================
     HUD
  ====================================================================== */
  function hud() {
    if (!progreso) return;
    const n = nivel(progreso.xp), a = xpNivel(n), b = xpNivel(n + 1);
    $('hLvl').textContent = 'Lv ' + n;
    $('hXp').style.width = clamp((progreso.xp - a) / (b - a) * 100, 0, 100) + '%';
    $('hPal').textContent = `${totalVistas()}/${FRASES.length}`;
    $('hEst').textContent = Object.values(progreso.escenas).reduce((s, v) => s + v, 0);
    $('hRacha').textContent = progreso.racha.dias;
    $('hDia').textContent = 'Día ' + progreso.dia;
    $('hRuta').innerHTML = (progreso.ruta || []).map((id, i) => `<span class="${i < progreso.paso ? 'ok' : (i === progreso.paso ? 'cur' : '')}" title="${escHTML(ESC[id].titulo.es)}">${ESC[id].npc.emoji}</span>`).join('');
    $('btnTrad').classList.toggle('off', !progreso.traduccion);
    $('btnLento').classList.toggle('off', !progreso.lento);
    $('btnMudo').textContent = progreso.mudo ? '🔇' : '🔊';
    document.body.classList.toggle('sin-es', !progreso.traduccion);
  }

  /* ======================================================================
     CUADRO DE DIÁLOGO
  ====================================================================== */
  let turno = 0;   // cada pantalla nueva invalida los botones de la anterior
  function limpiar() {
    turno++;
    $('dOps').innerHTML = ''; $('dOps').className = ''; $('dPista').textContent = '';
    $('dMic').classList.add('oculto'); $('dSig').classList.add('oculto'); $('dSaltar').classList.add('oculto');
    $('dOido').textContent = ''; $('dFrase').classList.add('oculto'); $('dEn').className = '';
    return turno;
  }
  function cabecera(s) {
    $('dlg').style.setProperty('--c', s.e.color);
    $('dEmoji').textContent = s.e.npc.emoji;
    $('dNombre').textContent = s.e.npc.nombre;
    $('dTitulo').textContent = `${s.e.lugar} · ${s.e.titulo.es}`;
  }
  function pasos(i, total) {
    $('dPasos').innerHTML = Array.from({ length: total }, (_, k) => `<i class="${k < i ? 'on' : ''}"></i>`).join('');
  }
  // La otra persona habla
  async function dice(s, en, es, opts = {}) {
    limpiar();
    $('dQuien').textContent = s.e.npc.nombre + ':';
    $('dEn').textContent = en; $('dEs').textContent = es || '';
    s.npc.habla = 2.2; s.npc.globo = { txt: en.length > 34 ? en.slice(0, 32) + '…' : en, hasta: ahora + 3 };
    await hablar(en, s.e.npc.tono || 1);
    if (opts.esperar) await continuar(opts.boton || 'Continuar ▶');
  }
  function continuar(txt = 'Continuar ▶') {
    const t = turno;
    return new Promise(res => {
      const b = $('dSig'); b.textContent = txt; b.classList.remove('oculto');
      b.onclick = () => { if (t !== turno) return; b.classList.add('oculto'); res(); };
    });
  }
  // Tú dices la frase: globo sobre tu personaje y se oye
  async function digo(f) {
    jugador.globo = { txt: f.en.length > 36 ? f.en.slice(0, 34) + '…' : f.en, hasta: ahora + 3.2 };
    await hablar(f.en, 1.08);
  }

  /* ---------- Ejercicios ---------- */
  function opciones(lista, render, correcta) {
    const t = turno;
    return new Promise(res => {
      const cont = $('dOps');
      cont.innerHTML = lista.map((o, i) => `<button class="op" data-i="${i}"><span class="n">${i + 1}</span><span class="t">${render(o)}</span></button>`).join('');
      let fallos = 0;
      cont.querySelectorAll('.op').forEach(b => {
        b.onclick = () => {
          if (t !== turno) return;
          const o = lista[+b.dataset.i];
          if (o === correcta) {
            b.classList.add('bien');
            cont.querySelectorAll('.op').forEach(x => { x.onclick = null; });
            res(fallos === 0);
          } else {
            b.classList.add('mal'); b.onclick = null; fallos++;
            if (fallos === 1) fallo();
            if (typeof o === 'object' && o.en) hablar(o.en, 1);
          }
        };
      });
    });
  }
  const distractores = (f, n) => barajar(FRASES.filter(x => x.esc !== f.esc && Math.abs(x.en.length - f.en.length) < 22)).slice(0, n);

  // 1) Elegir la respuesta correcta en la conversación
  async function retoElegir(f) {
    $('dPista').textContent = '💬 ¿Qué respondes?';
    const ops = barajar([f, ...distractores(f, 2)]);
    return opciones(ops, o => `<b>${escHTML(o.en)}</b><small>${escHTML(o.es)}</small>`, f);
  }
  // 2) Ordenar las palabras de la frase
  function retoOrdenar(f) {
    const t = turno;
    const palabras = f.en.split(' ');
    $('dPista').textContent = `🧩 Ordena tu respuesta: “${f.es}”`;
    $('dOps').className = 'fichas';
    $('dOps').innerHTML = `<div class="armado"></div><div class="banco">${barajar(palabras.map((p, i) => ({ p, i }))).map(o => `<button class="ficha" data-i="${o.i}">${escHTML(o.p)}</button>`).join('')}</div>`;
    const armado = $('dOps').querySelector('.armado');
    let pos = 0, fallos = 0;
    return new Promise(res => {
      $('dOps').querySelectorAll('.ficha').forEach(b => {
        b.onclick = () => {
          if (t !== turno || b.classList.contains('puesta')) return;
          // se acepta cualquier ficha con la misma palabra que toca ahora
          if (palabras[+b.dataset.i] === palabras[pos]) {
            b.classList.add('puesta'); Sfx.touch();
            armado.insertAdjacentHTML('beforeend', `<span>${escHTML(palabras[pos])}</span>`);
            pos++;
            if (pos === palabras.length) res(fallos === 0);
          } else {
            b.classList.remove('mal'); void b.offsetWidth; b.classList.add('mal');
            fallos++; if (fallos === 1) fallo();
          }
        };
      });
    });
  }
  // 3) Completar la palabra que falta
  async function retoHueco(f) {
    const toks = f.en.split(' ');
    const cand = toks.map((w, i) => ({ w: w.replace(/[^A-Za-z']/g, ''), i })).filter(o => o.w.length > 2);
    const el = cand.sort((a, b) => b.w.length - a.w.length)[Math.floor(Math.random() * Math.min(2, cand.length))];
    if (!el) return retoElegir(f);
    const hueco = toks.map((w, i) => i === el.i ? w.replace(el.w, '____') : w).join(' ');
    $('dPista').innerHTML = `✏️ Completa tu respuesta:<br><b style="font-size:17px;color:#1565c0">${escHTML(hueco)}</b>`;
    const otras = barajar([...new Set(FRASES.flatMap(x => x.en.split(' ').map(w => w.replace(/[^A-Za-z']/g, '')))
      .filter(w => w.length > 2 && w.toLowerCase() !== el.w.toLowerCase()))]).slice(0, 2);
    const ops = barajar([el.w, ...otras]);
    $('dOps').className = 'iconos';
    return opciones(ops, o => `<b>${escHTML(o)}</b>`, el.w);
  }
  // 4) ¿Cómo se dice? (del español al inglés)
  async function retoTraducir(f) {
    $('dPista').textContent = `🇪🇸 ¿Cómo se dice “${f.es}”?`;
    const ops = barajar([f, ...distractores(f, 2)]);
    return opciones(ops, o => `<b>${escHTML(o.en)}</b>`, f);
  }
  // 5) Decirla con el micrófono
  function retoDecir(f) {
    const t = turno;
    return new Promise(res => {
      $('dPista').innerHTML = `🎤 Dila en voz alta: <b>${escHTML(f.en)}</b>`;
      const mic = $('dMic'); mic.textContent = SR ? '🎤 Decir' : '✅ Ya lo dije'; mic.classList.remove('oculto');
      const sal = $('dSaltar'); sal.textContent = 'Saltar ⏭'; sal.classList.remove('oculto');
      sal.onclick = () => { if (t !== turno) return; res(null); };
      let intentos = 0;
      mic.onclick = async () => {
        if (t !== turno) return;
        if (!SR) { progreso.stats.habladas++; res(true); return; }
        mic.classList.add('escuchando'); mic.textContent = '👂 Te escucho…';
        const dichos = await escucharVoz();
        if (t !== turno) return;
        mic.classList.remove('escuchando'); mic.textContent = '🎤 Otra vez';
        if (dichos === null) { $('dOido').textContent = 'No hay permiso de micrófono. Toca Saltar.'; return; }
        const p = parecido(dichos, f.en);
        $('dOido').textContent = dichos.length ? `Oí: “${dichos[0]}”` : 'No te escuché bien.';
        if (p >= 0.7) { progreso.stats.habladas++; res(true); }
        else if (++intentos >= 3) { $('dOido').textContent += ' · ¡Buen intento!'; res(false); }
        else hablar(f.en, 1, 0.75);
      };
    });
  }

  // Tarjeta de frase nueva
  async function ensenar(s, f) {
    limpiar();
    $('dQuien').textContent = 'Tú respondes:';
    $('dFrase').classList.remove('oculto');
    $('dFrase').innerHTML = `<span class="ico">💬</span><div><b>${escHTML(f.en)}</b><small>${escHTML(f.es)}</small></div><span class="chip">Frase nueva</span>`;
    $('dEn').textContent = ''; $('dEs').textContent = '';
    $('dFrase').onclick = () => hablar(f.en, 1.08, 0.75);
    await hablar(f.en, 1.08);
    await continuar('¡Entendido! ▶');
  }

  /* ======================================================================
     ENCUENTRO (una conversación completa)
  ====================================================================== */
  const TIPOS = ['elegir', 'ordenar', 'hueco', 'elegir', 'traducir'];
  async function encuentro(s) {
    actual = s; modo = 'encuentro'; erroresEnc = 0;
    $('controles').classList.add('oculto');
    $('dlg').classList.remove('oculto');
    cabecera(s);
    banner(s.e.titulo.es, s.e.titulo.en);
    const repaso = [];
    const total = s.e.frases.length;
    for (let i = 0; i < total; i++) {
      const f = s.e.frases[i];
      pasos(i, total);
      await dice(s, f.npcEn, f.npcEs);
      const nueva = !vista(f);
      if (nueva) await ensenar(s, f);
      // Tu turno: el NPC acaba de hablar; la línea queda visible arriba
      limpiar();
      $('dQuien').textContent = s.e.npc.nombre + ':';
      $('dEn').textContent = f.npcEn; $('dEs').textContent = f.npcEs;
      let tipo = TIPOS[(i + progreso.dia) % TIPOS.length];
      if (tipo === 'ordenar' && f.en.split(' ').length > 9) tipo = 'elegir';
      if (nueva && tipo === 'traducir') tipo = 'elegir';
      const ok = tipo === 'ordenar' ? await retoOrdenar(f) : tipo === 'hueco' ? await retoHueco(f) : tipo === 'traducir' ? await retoTraducir(f) : await retoElegir(f);
      marcar(f, ok);
      if (ok) acierto(); else repaso.push(f);
      await digo(f);
      // Cada tres frases, una para decir en voz alta
      if (i % 3 === 2) {
        limpiar();
        $('dQuien').textContent = '🎤 Tu turno de hablar';
        $('dEn').textContent = f.en; $('dEs').textContent = f.es;
        const r = await retoDecir(f);
        if (r) { acierto(); flotante('🎤 ¡Bien dicho!', jugador.x, -jugador.h.alto * 1.4 - 60, '#fff', 18); }
      }
      guardar();
    }
    // Repaso de las que fallaste
    for (const f of repaso) {
      limpiar();
      $('dQuien').textContent = '🔁 Repaso';
      $('dEn').textContent = ''; $('dEs').textContent = '';
      const ok = await retoTraducir(f);
      marcar(f, ok);
      if (ok) acierto();
      await digo(f);
    }
    pasos(total, total);
    // Fin de la escena
    const estrellas = erroresEnc === 0 ? 3 : erroresEnc <= 3 ? 2 : 1;
    progreso.escenas[s.e.id] = Math.max(progreso.escenas[s.e.id] || 0, estrellas);
    s.hecho = true; s.npc.celebra = 2.5; jugador.celebra = ahora + 2.5;
    progreso.paso++;
    ganarXP(20 + estrellas * 10);
    Sfx.mission(); confeti();
    limpiar();
    $('dQuien').textContent = '';
    $('dEn').innerHTML = `${'⭐'.repeat(estrellas)}${'☆'.repeat(3 - estrellas)} <span style="font-size:15px">¡Conversación terminada!</span>`;
    $('dEs').textContent = `Aprendiste ${total} frases de “${s.e.titulo.es}”.`;
    guardar(); hud();
    await hablar('Great talking to you!', s.e.npc.tono || 1);
    await continuar('Seguir caminando ▶');
    $('dlg').classList.add('oculto');
    actual = null; modo = 'caminar';
    $('controles').classList.remove('oculto');
    if (!estSiguiente()) toast('🏠 ¡Vuelve a casa! Camina hasta la casa ⭐');
  }

  /* ======================================================================
     FIN DEL DÍA
  ====================================================================== */
  function finDia() {
    modo = 'resumen';
    $('controles').classList.add('oculto');
    $('resTitulo').textContent = `¡Día ${progreso.dia} completado!`;
    const est = progreso.ruta.reduce((a, id) => a + (progreso.escenas[id] || 0), 0);
    $('resStats').innerHTML = [['💬', totalVistas(), 'frases aprendidas'], ['⭐', est, 'estrellas hoy'], ['🔥', progreso.racha.dias, 'días seguidos'], ['🎤', progreso.stats.habladas, 'frases dichas']]
      .map(([i, n, t]) => `<div><span>${i}</span><b>${n}</b><small>${t}</small></div>`).join('');
    $('resumen').classList.remove('oculto');
    Sfx.mission();
    if (IDS.every(id => progreso.escenas[id]) && !progreso.fin) { progreso.fin = true; guardar(); setTimeout(() => $('final').classList.remove('oculto'), 600); }
  }
  function nuevoDia() {
    progreso.dia++; progreso.paso = 0; progreso.ruta = armarRuta();
    actualizarRacha(); guardar();
    crearMundo(); jugador.x = -120; cam.listo = false;
    $('resumen').classList.add('oculto');
    modo = 'caminar'; $('controles').classList.remove('oculto');
    hud();
  }
  function actualizarRacha() {
    const hoy = new Date().toISOString().slice(0, 10);
    const r = progreso.racha;
    if (r.ultima === hoy) return;
    const ayer = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    r.dias = r.ultima === ayer ? r.dias + 1 : 1; r.ultima = hoy;
  }
  $('btnDia').onclick = nuevoDia;
  $('btnFinal').onclick = () => $('final').classList.add('oculto');

  /* ======================================================================
     BUCLE
  ====================================================================== */
  let tAnt = performance.now();
  function frame(tt) {
    const dt = Math.min(0.05, (tt - tAnt) / 1000); tAnt = tt; ahora += dt;
    if (W !== innerWidth || H !== innerHeight) medir();
    actualizar(dt);
    dibujar(ahora);
    requestAnimationFrame(frame);
  }
  function actualizar(dt) {
    if (mundo && modo === 'caminar') {
      let v = 0;
      if (teclas.der) v = 1; else if (teclas.izq) v = -1;
      else if (jugador.objetivo !== null) { const d = jugador.objetivo - jugador.x; if (Math.abs(d) < 6) jugador.objetivo = null; else v = Math.sign(d); }
      const lim = limiteDerecho();
      const nx = clamp(jugador.x + v * 260 * dt, -180, lim);
      jugador.mov = Math.abs(nx - jugador.x) > 0.01;
      if (jugador.mov) jugador.h.walkP.phase += dt * 10;
      jugador.x = nx;
      if (v > 0 && nx >= lim - 0.5) {
        teclas.der = false; jugador.objetivo = null; jugador.mov = false;
        const s = estSiguiente();
        if (s) encuentro(s); else finDia();
      }
    } else jugador.mov = false;
    moverCamara(dt);
    if (mundo) mundo.est.forEach(s => { const n = s.npc; if (n.habla > 0) n.habla -= dt; if (n.celebra > 0) n.celebra -= dt; });
    particulas.forEach(q => { q.vida -= dt; q.x += q.vx * dt; q.y += q.vy * dt; if (!q.sinGrav) q.vy += 420 * dt; });
    particulas = particulas.filter(q => q.vida > 0);
    textos.forEach(q => { q.vida -= dt; q.y -= 40 * dt; });
    textos = textos.filter(q => q.vida > 0);
  }

  /* ======================================================================
     ENTRADA
  ====================================================================== */
  canvas.addEventListener('pointerdown', e => {
    if (modo !== 'caminar') return;
    const p = aMundo(e.clientX, e.clientY);
    jugador.objetivo = p.x;
  });
  function botonMantener(id, tecla) {
    const b = $(id);
    const on = e => { e.preventDefault(); teclas[tecla] = true; b.classList.add('on'); };
    const off = () => { teclas[tecla] = false; b.classList.remove('on'); };
    b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointerleave', off); b.addEventListener('pointercancel', off);
  }
  botonMantener('btnDer', 'der'); botonMantener('btnIzq', 'izq');
  addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'd') teclas.der = true;
    if (e.key === 'ArrowLeft' || e.key === 'a') teclas.izq = true;
    if (/^[1-4]$/.test(e.key)) { const b = $('dOps').querySelectorAll('.op')[+e.key - 1]; if (b) b.click(); }
    if (e.key === 'Enter' && !$('dSig').classList.contains('oculto')) $('dSig').click();
    if (e.key === 'r' || e.key === 'R') hablar(ultimaVoz.txt, ultimaVoz.tono);
  });
  addEventListener('keyup', e => {
    if (e.key === 'ArrowRight' || e.key === 'd') teclas.der = false;
    if (e.key === 'ArrowLeft' || e.key === 'a') teclas.izq = false;
  });
  $('dOir').onclick = () => hablar(ultimaVoz.txt, ultimaVoz.tono);
  $('dEn').onclick = () => { if ($('dEn').textContent) hablar($('dEn').textContent.replace(/[⭐☆]/g, ''), actual ? actual.e.npc.tono || 1 : 1); };
  $('btnTrad').onclick = () => { progreso.traduccion = !progreso.traduccion; hud(); guardar(); };
  $('btnLento').onclick = () => { progreso.lento = !progreso.lento; settings.slow = progreso.lento; hud(); guardar(); toast(progreso.lento ? '🐢 Voz lenta' : '🐇 Voz normal'); };
  $('btnMudo').onclick = () => { progreso.mudo = !progreso.mudo; settings.mute = progreso.mudo; hud(); guardar(); };
  $('btnAyuda').onclick = () => $('intro').classList.remove('oculto');
  $('btnAlbum').onclick = abrirAlbum;
  $('btnAlbumCerrar').onclick = () => $('album').classList.add('oculto');

  /* ---------- Álbum de frases ---------- */
  function abrirAlbum() {
    $('albStats').innerHTML = [['💬', totalVistas(), 'frases vistas'], ['🏅', FRASES.filter(f => progreso.frases[f.k] && dominada(f)).length, 'dominadas'], ['🎤', progreso.stats.habladas, 'dichas'], ['📅', progreso.dia, 'día']]
      .map(([i, n, t]) => `<div><span>${i}</span><b>${n}</b><small>${t}</small></div>`).join('');
    $('albEscenas').innerHTML = C.ESCENAS.map(e => {
      const vs = e.frases.filter(vista).length;
      const est = progreso.escenas[e.id] || 0;
      const lista = e.frases.map(f => vista(f)
        ? `<li class="${dominada(f) ? 'ok' : ''}" data-en="${escHTML(f.en)}"><b>${escHTML(f.en)}</b><small>${escHTML(f.es)}</small></li>`
        : '<li class="no"><b>???</b></li>').join('');
      return `<details><summary>${e.npc.emoji} <b>${escHTML(e.titulo.es)}</b> <small>${'⭐'.repeat(est)}</small><i>${vs}/${e.frases.length}</i></summary><ul class="frases">${lista}</ul></details>`;
    }).join('');
    $('album').classList.remove('oculto');
  }
  $('albEscenas').addEventListener('click', e => { const li = e.target.closest('li[data-en]'); if (li) hablar(li.dataset.en, 1.08); });

  // Vista previa del personaje
  function dibujarPrevia() {
    const c = $('previa'), gg = c.getContext('2d'), r = Math.min(devicePixelRatio || 1, 2);
    c.width = 120 * r; c.height = 150 * r;
    gg.setTransform(r * 1.15, 0, 0, r * 1.15, 60 * r, 140 * r);
    gg.clearRect(-100, -200, 300, 300);
    if (jugador.h) drawHuman(gg, jugador.h, 0, 0, { pose: 'saludo' });
  }
  $('btnOtro').onclick = () => { progreso.avatar.seed = Gen.randomSeed(); crearJugador(); dibujarPrevia(); guardar(); };
  $('btnSexo').onclick = () => { progreso.avatar.sexo = progreso.avatar.sexo === 'f' ? 'm' : 'f'; crearJugador(); dibujarPrevia(); guardar(); };
  $('btnJugar').onclick = () => {
    $('intro').classList.add('oculto');
    if (modo === 'intro') {
      started = true;
      modo = 'caminar';
      $('controles').classList.remove('oculto');
      actualizarRacha(); guardar(); hud();
      hablar(progreso.paso === 0 ? `Hi, ${nombreJugador}! Let's talk!` : `Welcome back, ${nombreJugador}!`, 1.1);
    }
  };

  /* ======================================================================
     ARRANQUE
  ====================================================================== */
  async function iniciar() {
    medir();
    requestAnimationFrame(frame);
    let datos = null;
    try {
      const r = await AbuProgreso.iniciar({ app: 'juego3' });
      if (!r) return;
      datos = r.datos;
      const meta = (r.user && r.user.user_metadata) || {};
      const n = (meta.full_name || meta.name || meta.nombre || (r.user && r.user.email ? r.user.email.split('@')[0] : '') || '').trim().split(/[\s._-]/)[0];
      if (n) nombreJugador = cap(n.toLowerCase());
    } catch (e) { console.warn('[English Talk] no se pudo cargar el avance:', e); }
    progreso = normalizar(datos);
    settings.slow = progreso.lento; settings.mute = progreso.mudo;
    if (!progreso.ruta || !progreso.ruta.every(id => ESC[id])) { progreso.ruta = armarRuta(); progreso.paso = 0; }
    crearJugador();
    crearMundo();
    const s = estSiguiente();
    jugador.x = progreso.paso === 0 ? -120 : (s ? s.x - PARADA - 260 : mundo.finX - 300);
    hud(); dibujarPrevia();
    $('cargando').style.display = 'none';
    if (progreso.paso > 0 || totalVistas() > 0) $('btnJugar').textContent = `▶ Seguir · Día ${progreso.dia}`;
  }
  if (/[?&]debug\b/.test(location.search)) {
    window.__talk = { get modo() { return modo; }, get progreso() { return progreso; }, get actual() { return actual; }, FRASES };
  }
  iniciar();
})();
