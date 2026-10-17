/* ============================================================================
   JUEGO 5 · ABU ISLAND  (juego5.html)
   ----------------------------------------------------------------------------
   Una isla isométrica que la persona construye. Cada edificio tiene su nombre
   en inglés y produce monedas con el tiempo (también sin jugar, con tope).

   · Al recoger, a veces sale una PREGUNTA BONUS de vocabulario (x3).
   · Vecinos que pasean y dicen frases en inglés (tócalos: traducción).
   · Pedidos de los vecinos: rondas de 5 palabras con premio grande.
   · Ruleta diaria, ganancias mientras no estabas (x2 respondiendo).
   · Niveles: desbloquean edificios y agrandan la isla.
   · Decoraciones: +3% de producción cada una (máx. +60%).
   · Mejorar edificios (x1.6 producción) y venderlos (50%).
   · Avance en progreso_apps con app = 'juego5'.
============================================================================ */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const azar = (a, b) => a + Math.random() * (b - a);
  const elegir = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const barajar = (arr) => { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; };
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const hoy = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
  const fmt = (n) => { n = Math.floor(n); return n >= 1e6 ? (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + 'M' : n >= 1e4 ? (n / 1e3).toFixed(n >= 1e5 ? 0 : 1) + 'k' : n.toLocaleString('es'); };
  const primerSignificado = (es) => String(es || '').split(/[,;]/)[0].replace(/\(.*?\)/g, '').trim();
  const NIVELES = ['A1', 'A2', 'B1', 'B2', 'C1'];

  /* ---------------- Catálogo ----------------
     p = monedas por minuto · cap = minutos que acumula · n = nivel de la isla */
  const CATALOGO = [
    { id: 'house', e: '🏠', es: 'casa', c: 40, p: 4, cap: 60, n: 1 },
    { id: 'farm', e: '🌾', es: 'granja', c: 80, p: 0, cap: 1, n: 1, granja: true },
    { id: 'tree', e: '🌳', es: 'árbol', c: 15, deco: true, n: 1 },
    { id: 'flower', e: '🌷', es: 'flor', c: 8, deco: true, n: 1 },
    { id: 'bakery', e: '🥖', es: 'panadería', c: 260, p: 7, cap: 120, n: 2 },
    { id: 'store', e: '🏪', es: 'tienda', c: 420, p: 10, cap: 120, n: 2 },
    { id: 'palm tree', e: '🌴', es: 'palmera', c: 30, deco: true, n: 2 },
    { id: 'school', e: '🏫', es: 'escuela', c: 650, p: 14, cap: 150, n: 3 },
    { id: 'fountain', e: '⛲', es: 'fuente', c: 180, deco: true, n: 3 },
    { id: 'library', e: '📚', es: 'biblioteca', c: 900, p: 19, cap: 150, n: 4 },
    { id: 'hospital', e: '🏥', es: 'hospital', c: 1200, p: 24, cap: 180, n: 4 },
    { id: 'sunflower', e: '🌻', es: 'girasol', c: 60, deco: true, n: 4 },
    { id: 'bank', e: '🏦', es: 'banco', c: 1800, p: 34, cap: 180, n: 5 },
    { id: 'hotel', e: '🏨', es: 'hotel', c: 2600, p: 46, cap: 210, n: 5 },
    { id: 'pine tree', e: '🌲', es: 'pino', c: 90, deco: true, n: 5 },
    { id: 'church', e: '⛪', es: 'iglesia', c: 3600, p: 60, cap: 240, n: 6 },
    { id: 'ferris wheel', e: '🎡', es: 'rueda de la fortuna', c: 5000, p: 80, cap: 240, n: 6 },
    { id: 'circus', e: '🎪', es: 'circo', c: 6800, p: 104, cap: 240, n: 7 },
    { id: 'factory', e: '🏭', es: 'fábrica', c: 9000, p: 135, cap: 300, n: 7 },
    { id: 'statue', e: '🗽', es: 'estatua', c: 1500, deco: true, n: 7 },
    { id: 'castle', e: '🏰', es: 'castillo', c: 14000, p: 200, cap: 300, n: 8 },
    { id: 'stadium', e: '🏟️', es: 'estadio', c: 20000, p: 280, cap: 360, n: 9 },
    { id: 'tower', e: '🗼', es: 'torre', c: 30000, p: 400, cap: 360, n: 10 },
    { id: 'volcano', e: '🌋', es: 'volcán', c: 5000, deco: true, n: 10 },
    { id: 'rocket', e: '🚀', es: 'cohete', c: 50000, p: 650, cap: 480, n: 12 }
  ];
  const CAT = Object.fromEntries(CATALOGO.map((b) => [b.id, b]));

  const VECINOS = [
    { e: '👩‍🌾', n: 'Emma' }, { e: '👨‍🍳', n: 'Jack' }, { e: '👩‍🏫', n: 'Olivia' }, { e: '🧑‍🎨', n: 'Liam' },
    { e: '👵', n: 'Grandma Rose' }, { e: '👨‍🚒', n: 'Mike' }, { e: '👩‍⚕️', n: 'Dr. Sarah' }, { e: '🧒', n: 'Noah' },
    { e: '👨‍💼', n: 'Mr. Brown' }, { e: '👩‍🎤', n: 'Mia' }
  ];
  const FRASES = [
    ['Good morning!', '¡Buenos días!'], ['How are you?', '¿Cómo estás?'], ['Nice to meet you!', '¡Mucho gusto!'],
    ['What a beautiful day!', '¡Qué día tan bonito!'], ['I love this island!', '¡Me encanta esta isla!'],
    ["Let's go to the beach.", 'Vamos a la playa.'], ["I'm hungry.", 'Tengo hambre.'], ['See you later!', '¡Nos vemos luego!'],
    ['Thank you so much!', '¡Muchas gracias!'], ['Where is the bakery?', '¿Dónde está la panadería?'],
    ['I need some coffee.', 'Necesito un café.'], ['Have a nice day!', '¡Que tengas un buen día!'],
    ["It's sunny today.", 'Hoy está soleado.'], ['Can you help me?', '¿Me puedes ayudar?'], ['I like your hat!', '¡Me gusta tu sombrero!'],
    ["I'm so tired.", 'Estoy muy cansado.'], ["What's your name?", '¿Cómo te llamas?'], ["Let's build a school!", '¡Construyamos una escuela!'],
    ['I want to learn English.', 'Quiero aprender inglés.'], ['The flowers smell great.', 'Las flores huelen muy bien.'],
    ["Don't forget your umbrella.", 'No olvides tu paraguas.'], ["I'm going to the store.", 'Voy a la tienda.'],
    ['This is my favorite place.', 'Este es mi lugar favorito.'], ['Are you ready?', '¿Estás listo?'], ['Good night!', '¡Buenas noches!']
  ];

  /* ---------------- Estado ---------------- */
  const NUEVO = () => ({
    v: 3, monedas: 60, gemas: 5, xp: 0, nivel: 1, nivelIngles: 'A1', sonido: true,
    mapa: { '-1,1': { t: 'tree', l: 1 }, '2,-1': { t: 'flower', l: 1 } },
    ruleta: null, boost: 0, pedidos: [], vistas: {}, frases: {}, construidos: {},
    mision: 0, base: {}, st: { recogido: 0, bonus: 0, pedidos: 0, cofres: 0, mejoras: 0, deletreos: 0, ruleta: 0, frases: 0, cosechas: 0, entregas: 0 },
    granero: {}, antojos: {}, amistad: {},
    visto: Date.now(), racha: { dia: null, n: 0 }, preguntas: 0, aciertos: 0
  });
  let S = NUEVO();
  let guardarT = null;
  function guardar() {
    S.visto = Date.now();
    clearTimeout(guardarT);
    guardarT = setTimeout(() => {
      try { localStorage.setItem('abu-juego5', JSON.stringify(S)); } catch { }
      try { window.AbuProgreso && AbuProgreso.guardar(S); } catch { }
    }, 400);
  }
  window.addEventListener('pagehide', () => { S.visto = Date.now(); try { localStorage.setItem('abu-juego5', JSON.stringify(S)); window.AbuProgreso && AbuProgreso.guardar(S); AbuProgreso.guardarYa(); } catch { } });

  const xpParaNivel = (n) => Math.round(80 * Math.pow(n, 1.55));
  const radioIsla = () => Math.min(8, 2 + Math.floor((S.nivel + 1) / 2));
  const enIsla = (x, y) => Math.abs(x) + Math.abs(y) <= radioIsla() + 1 && Math.hypot(x, y) <= radioIsla() + 0.6;
  const decoraciones = () => Object.values(S.mapa).filter((b) => CAT[b.t] && CAT[b.t].deco).length;
  const bonoDeco = () => Math.min(0.6, decoraciones() * 0.03);
  const boostActivo = () => S.boost > Date.now();
  function prodMin(b) { const c = CAT[b.t]; if (!c || c.deco || c.granja) return 0; return c.p * Math.pow(1.6, (b.l || 1) - 1) * (1 + bonoDeco()) * (boostActivo() ? 2 : 1); }
  function capMin(b) { const c = CAT[b.t]; return c.cap * (1 + ((b.l || 1) - 1) * 0.25); }
  function acumulado(b, ahora = Date.now()) {
    if (!CAT[b.t] || CAT[b.t].deco || CAT[b.t].granja) return 0;
    const min = Math.min(capMin(b), Math.max(0, (ahora - (b.u || ahora)) / 60000));
    return min * prodMin(b);
  }
  function costoMejora(b) { return Math.round(CAT[b.t].c * 1.2 * Math.pow(2.1, (b.l || 1) - 1)); }

  /* ---------------- Sonido ---------------- */
  let ac = null;
  function actx() { if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch { } } if (ac && ac.state === 'suspended') ac.resume(); return ac; }
  function tono(f, d, tipo = 'sine', v = 0.18, desliz = 0, ret = 0) {
    if (!S.sonido || !actx()) return;
    const t = ac.currentTime + ret, o = ac.createOscillator(), g = ac.createGain();
    o.type = tipo; o.frequency.setValueAtTime(f, t); if (desliz) o.frequency.exponentialRampToValueAtTime(Math.max(40, f + desliz), t + d);
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + d + 0.02);
  }
  const SFX = {
    moneda: (k = 0) => { tono(1200 + k * 40, 0.06, 'square', 0.05); tono(1600 + k * 40, 0.1, 'square', 0.05, 0, 0.05); },
    construir: () => { tono(180, 0.15, 'triangle', 0.25, -60); tono(260, 0.12, 'triangle', 0.18, 0, 0.1); [523, 659, 784].forEach((f, i) => tono(f, 0.2, 'sine', 0.12, 0, 0.2 + i * 0.07)); },
    bien: () => [523, 659, 784, 1047].forEach((f, i) => tono(f, 0.22, 'triangle', 0.15, 0, i * 0.07)),
    mal: () => { tono(200, 0.3, 'sawtooth', 0.12, -80); },
    nivel: () => [392, 523, 659, 784, 1047, 1319].forEach((f, i) => tono(f, 0.35, 'triangle', 0.14, 0, i * 0.09)),
    tick: () => tono(900, 0.03, 'square', 0.05),
    pop: () => tono(600, 0.08, 'sine', 0.15, 400)
  };

  /* ---------------- Voz ---------------- */
  let audioAct = null;
  function decirPalabra(p) {
    try { if (audioAct) audioAct.pause(); } catch { }
    if (p && p.audio) { audioAct = new Audio(p.audio); audioAct.play().catch(() => voz(p.en)); } else if (p) voz(p.en);
  }
  function voz(t) { try { const u = new SpeechSynthesisUtterance(t); u.lang = 'en-US'; u.rate = 0.92; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch { } }

  /* ---------------- Palabras ---------------- */
  const RESPALDO = [['apple', 'manzana'], ['dog', 'perro'], ['house', 'casa'], ['book', 'libro'], ['water', 'agua'], ['school', 'escuela'], ['friend', 'amigo'],
    ['happy', 'feliz'], ['red', 'rojo'], ['bread', 'pan'], ['milk', 'leche'], ['tree', 'árbol'], ['flower', 'flor'], ['beach', 'playa'], ['money', 'dinero'],
    ['city', 'ciudad'], ['car', 'carro'], ['sun', 'sol'], ['rain', 'lluvia'], ['teacher', 'profesor']].map(([en, es], i) => ({ id: 'r' + i, en, es, esCorto: es }));
  let palabras = [];
  async function cargarPalabras() {
    const db = window.AbuProgreso && AbuProgreso.db;
    try {
      if (!db) throw new Error('sin db');
      const { data, error } = await db.from('palabras').select('id,ingles,espanol,imagen,audio').eq('nivel', S.nivelIngles).limit(1000);
      if (error) throw error;
      const vistos = new Set();
      const l = (data || []).filter((p) => p.ingles && p.espanol && p.ingles.length <= 18 && !vistos.has(p.ingles.toLowerCase()) && vistos.add(p.ingles.toLowerCase()))
        .map((p) => ({ id: p.id, en: p.ingles.trim(), es: p.espanol.trim(), esCorto: primerSignificado(p.espanol), img: p.imagen, audio: p.audio }));
      palabras = l.length >= 10 ? l : RESPALDO;
    } catch { palabras = RESPALDO; }
  }
  function peso(p) { const v = S.vistas[p.id]; if (!v) return 1.4; return Math.max(0.2, 1 + v.f * 1.8 - Math.min(v.ok, 6) * 0.15); }
  let recientes = [];
  function escoger() {
    const c = palabras.filter((p) => !recientes.includes(p.id));
    let r = Math.random() * c.reduce((s, p) => s + peso(p), 0);
    for (const p of c) { r -= peso(p); if (r <= 0) { recientes.push(p.id); if (recientes.length > 10) recientes.shift(); return p; } }
    return c[0] || palabras[0];
  }
  function crearPregunta() {
    const p = escoger();
    const tipos = ['es', 'es', 'en'];
    if (p.img) tipos.push('img', 'img');
    if (p.audio || 'speechSynthesis' in window) tipos.push('audio');
    const tipo = elegir(tipos);
    const otras = barajar(palabras.filter((o) => o.id !== p.id && o.esCorto.toLowerCase() !== p.esCorto.toLowerCase() && o.en.toLowerCase() !== p.en.toLowerCase())).slice(0, 3);
    const ops = barajar([p, ...otras]);
    return { p, tipo, ops };
  }
  function marcar(p, ok) { const v = S.vistas[p.id] || (S.vistas[p.id] = { ok: 0, f: 0 }); if (ok) { v.ok++; v.f = Math.max(0, v.f - 0.5); S.aciertos++; } else v.f++; S.preguntas++; }

  /* Pregunta en un modal. Devuelve una promesa con true/false. */
  function preguntar(titulo, sub, progreso) {
    return new Promise((res) => {
      const q = crearPregunta();
      const verEs = q.tipo === 'en';
      let cuerpo = '';
      if (q.tipo === 'img') cuerpo = `<img src="${esc(q.p.img)}" alt="">`;
      else if (q.tipo === 'audio') cuerpo = `<button class="oir" data-oir>🔊</button><p class="sub" style="margin:6px 0 0">¿Qué palabra oyes?</p>`;
      else if (q.tipo === 'en') cuerpo = `<div class="es">${esc(q.p.en)}</div><button class="oir" data-oir style="width:46px;height:46px;font-size:20px;margin-top:4px">🔊</button><p class="sub" style="margin:4px 0 0">¿Qué significa?</p>`;
      else cuerpo = `<div class="es">${esc(q.p.esCorto)}</div><p class="sub" style="margin:2px 0 0">${q.p.es !== q.p.esCorto ? esc(q.p.es) : '¿Cómo se dice en inglés?'}</p>`;
      const v = abrirModal(`
        <h2>${esc(titulo)}</h2><p class="sub">${esc(sub)}</p>
        ${progreso ? `<div class="barraP"><b style="width:${progreso}%"></b></div>` : ''}
        <div class="pregunta">${cuerpo}</div>
        <div class="opciones">${q.ops.map((o, i) => `<button class="op" data-i="${i}">${esc(verEs ? o.esCorto : o.en)}</button>`).join('')}</div>`, false);
      if (q.tipo === 'audio') setTimeout(() => decirPalabra(q.p), 200);
      v.querySelectorAll('[data-oir]').forEach((b) => (b.onclick = () => decirPalabra(q.p)));
      let listo = false;
      v.querySelectorAll('.op').forEach((b) => (b.onclick = () => {
        if (listo) return; listo = true;
        const o = q.ops[+b.dataset.i], ok = o === q.p;
        marcar(q.p, ok);
        b.classList.add(ok ? 'bien' : 'mal');
        if (!ok) v.querySelectorAll('.op').forEach((x) => { if (q.ops[+x.dataset.i] === q.p) x.classList.add('bien'); });
        ok ? SFX.bien() : SFX.mal();
        decirPalabra(q.p);
        const nota = document.createElement('p'); nota.className = 'sub'; nota.style.marginTop = '10px';
        nota.innerHTML = `<b>${esc(q.p.en)}</b> = ${esc(q.p.es)}`; v.querySelector('.modal').appendChild(nota);
        setTimeout(() => { cerrarModal(v); res(ok); }, ok ? 1100 : 2200);
      }));
    });
  }

  /* ---------------- Modales y avisos ---------------- */
  function abrirModal(html, cerrable = true) {
    const v = document.createElement('div'); v.className = 'velo';
    v.innerHTML = `<div class="modal">${html}</div>`;
    if (cerrable) v.addEventListener('click', (e) => { if (e.target === v) cerrarModal(v); });
    document.body.appendChild(v); return v;
  }
  function cerrarModal(v) { v && v.remove(); }
  let toastT = null;
  function toast(t) { const el = $('toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2300); }

  /* Confeti */
  const cf = $('confeti'), cfx = cf.getContext('2d'); let confeti = [];
  function lanzarConfeti(n = 120) {
    cf.width = innerWidth; cf.height = innerHeight;
    for (let i = 0; i < n; i++) confeti.push({ x: innerWidth / 2 + azar(-60, 60), y: innerHeight * 0.4, vx: azar(-9, 9), vy: azar(-16, -4), r: azar(4, 8), c: elegir(['#ffc61a', '#ef4444', '#22c55e', '#0ea5e9', '#8b5cf6', '#ec4899']), a: azar(0, 6), va: azar(-0.3, 0.3), t: 0 });
  }
  function pasoConfeti() {
    if (!confeti.length) return;
    cfx.clearRect(0, 0, cf.width, cf.height);
    confeti = confeti.filter((p) => (p.t += 1) < 180);
    for (const p of confeti) { p.vy += 0.35; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.a += p.va; cfx.save(); cfx.translate(p.x, p.y); cfx.rotate(p.a); cfx.fillStyle = p.c; cfx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); cfx.restore(); }
    if (!confeti.length) cfx.clearRect(0, 0, cf.width, cf.height);
  }

  /* ---------------- HUD ---------------- */
  let monedasMostradas = 0;
  function hud(animar) {
    $('hNivel').textContent = S.nivel;
    $('hXp').style.width = Math.min(100, (S.xp / xpParaNivel(S.nivel)) * 100) + '%';
    $('hGemas').textContent = fmt(S.gemas);
    if (animar) { $('pMonedas').classList.remove('pop'); void $('pMonedas').offsetWidth; $('pMonedas').classList.add('pop'); }
    const listos = S.pedidos.filter((p) => !p.espera || p.espera < Date.now()).length;
    $('nPedidos').textContent = listos; $('nPedidos').classList.toggle('oculto', !listos);
    $('nRuleta').classList.toggle('oculto', S.ruleta === hoy());
  }
  function ganar(monedas, xp = 0, gemas = 0) {
    S.monedas += monedas; S.gemas += gemas;
    if (xp) ganarXP(xp);
    hud(true); guardar();
  }
  function ganarXP(xp) {
    S.xp += xp;
    while (S.xp >= xpParaNivel(S.nivel)) { S.xp -= xpParaNivel(S.nivel); S.nivel++; setTimeout(subirNivel, 500); }
    hud();
  }
  function subirNivel() {
    setTimeout(revisarMision, 800);
    SFX.nivel(); lanzarConfeti(160); S.gemas += 3; hud(); guardar(); centrar();
    const nuevos = CATALOGO.filter((b) => b.n === S.nivel);
    const v = abrirModal(`<div class="grande">🎉</div><h2>¡Nivel ${S.nivel}!</h2><p class="sub">Tu isla creció 🏝️ y ganaste 3 💎</p>
      ${nuevos.length ? `<p class="sub" style="margin-bottom:4px">Nuevos edificios:</p><div class="chips">${nuevos.map((b) => `<span class="chip">${b.e} ${esc(b.id)} · ${esc(b.es)}</span>`).join('')}</div>` : ''}
      <button class="btn">¡Genial!</button>`);
    v.querySelector('.btn').onclick = () => cerrarModal(v);
    nuevos.forEach((b) => setTimeout(() => voz(b.id), 600));
  }

  /* ---------------- Lienzo / cámara ---------------- */
  const cv = $('mundo'), cx = cv.getContext('2d');
  let W = 0, H = 0, DPR = 1;
  const cam = { x: 0, y: 0, z: 1 };
  const TW = 84, TH = 42;
  function medir() { DPR = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; cv.width = W * DPR; cv.height = H * DPR; cx.setTransform(DPR, 0, 0, DPR, 0, 0); }
  addEventListener('resize', medir); medir();
  function centrar() { cam.x = W / 2; cam.y = H * 0.44; cam.z = Math.max(0.5, Math.min(1.2, Math.min(W * 1.5, H * 2) / ((radioIsla() * 2 + 1) * TW))); }
  const aPantalla = (gx, gy) => ({ x: cam.x + (gx - gy) * (TW / 2) * cam.z, y: cam.y + (gx + gy) * (TH / 2) * cam.z });
  function aMapa(px, py) {
    const a = (px - cam.x) / ((TW / 2) * cam.z), b = (py - cam.y) / ((TH / 2) * cam.z);
    return { x: Math.round((a + b) / 2), y: Math.round((b - a) / 2) };
  }

  /* ---------------- Vecinos ---------------- */
  let vecinos = [];
  function casillasLibres() {
    const R = radioIsla(), l = [];
    for (let x = -R - 1; x <= R + 1; x++) for (let y = -R - 1; y <= R + 1; y++) if (enIsla(x, y) && !S.mapa[x + ',' + y]) l.push({ x, y });
    return l;
  }
  function ajustarVecinos() {
    setTimeout(revisarAntojos, 0);
    const casas = Object.values(S.mapa).filter((b) => b.t === 'house' || b.t === 'hotel').length;
    const n = Math.min(VECINOS.length, 1 + casas);
    while (vecinos.length < n) {
      const l = casillasLibres(); const c = l.length ? elegir(l) : { x: 0, y: 0 };
      vecinos.push({ ...VECINOS[vecinos.length], x: c.x, y: c.y, tx: c.x, ty: c.y, globo: null, gT: azar(2, 8) });
    }
  }
  function moverVecinos(dt) {
    for (const v of vecinos) {
      const d = Math.hypot(v.tx - v.x, v.ty - v.y);
      if (d < 0.05) {
        if (Math.random() < dt * 0.6) {
          const op = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([a, b]) => ({ x: Math.round(v.x) + a, y: Math.round(v.y) + b }))
            .filter((c) => enIsla(c.x, c.y) && !S.mapa[c.x + ',' + c.y]);
          if (op.length) { const c = elegir(op); v.tx = c.x; v.ty = c.y; }
        }
      } else { const s = Math.min(d, dt * 0.9); v.x += (v.tx - v.x) / d * s; v.y += (v.ty - v.y) / d * s; }
      v.gT -= dt;
      if (v.globo) { v.globo.t -= dt; if (v.globo.t <= 0) v.globo = null; }
      else if (v.gT <= 0 && !(S.antojos[v.n] && S.antojos[v.n].c)) { const f = elegir(FRASES); v.globo = { en: f[0], es: f[1], t: 4.5 }; v.gT = azar(7, 16); }
    }
  }

  /* ---------------- Efectos en el mundo ---------------- */
  let flotantes = [], monedasV = [], polvo = [];
  function flotar(x, y, t, color = '#fff', tam = 22) { flotantes.push({ x, y, t, color, tam, v: 1.3 }); }
  function lluviaMonedas(x, y, cuanto) {
    const n = Math.min(14, 3 + Math.floor(Math.log2(cuanto + 1)));
    for (let i = 0; i < n; i++) monedasV.push({ x, y, vx: azar(-180, 180), vy: azar(-380, -160), t: 0, k: i });
  }
  function nube(x, y) { for (let i = 0; i < 18; i++) polvo.push({ x, y, vx: azar(-90, 90), vy: azar(-70, 10), r: azar(6, 14), v: 0.8 }); }

  /* ---------------- Dibujo ---------------- */
  let tiempo = 0, ultimo = performance.now();
  let seleccion = null;   // id del catálogo en modo construir
  let hover = null;
  function dibujar() {
    const c = cx;
    // Mar
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#6fd3f7'); g.addColorStop(1, '#1d8fd1');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 2;
    for (let i = 0; i < 18; i++) {
      const y = ((i * 97 + tiempo * 14) % (H + 40)) - 20, x = (i * 173) % W;
      c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 14, y - 6, x + 28, y); c.stroke();
    }
    const R = radioIsla() + 1;
    const casillas = [];
    for (let x = -R; x <= R; x++) for (let y = -R; y <= R; y++) if (enIsla(x, y)) casillas.push({ x, y });
    casillas.sort((a, b) => a.x + a.y - (b.x + b.y));
    const hw = (TW / 2) * cam.z, hh = (TH / 2) * cam.z, grosor = 14 * cam.z;
    // Borde de espuma
    for (const t of casillas) {
      const p = aPantalla(t.x, t.y);
      c.fillStyle = 'rgba(255,255,255,.5)';
      c.beginPath(); c.moveTo(p.x, p.y - hh - 5); c.lineTo(p.x + hw + 8, p.y); c.lineTo(p.x, p.y + hh + grosor + 6 + Math.sin(tiempo * 2 + t.x) * 2); c.lineTo(p.x - hw - 8, p.y); c.fill();
    }
    // Suelo
    for (const t of casillas) {
      const p = aPantalla(t.x, t.y);
      const borde = !enIsla(t.x + 1, t.y) || !enIsla(t.x, t.y + 1) || !enIsla(t.x - 1, t.y) || !enIsla(t.x, t.y - 1);
      const arena = borde || (Math.abs(t.x) + Math.abs(t.y) > radioIsla() + 0.5);
      // costados
      c.fillStyle = arena ? '#c9a46a' : '#7a5a35';
      c.beginPath(); c.moveTo(p.x - hw, p.y); c.lineTo(p.x, p.y + hh); c.lineTo(p.x, p.y + hh + grosor); c.lineTo(p.x - hw, p.y + grosor); c.fill();
      c.fillStyle = arena ? '#b08b52' : '#5f4428';
      c.beginPath(); c.moveTo(p.x + hw, p.y); c.lineTo(p.x, p.y + hh); c.lineTo(p.x, p.y + hh + grosor); c.lineTo(p.x + hw, p.y + grosor); c.fill();
      // cara
      c.fillStyle = arena ? '#f4dca0' : ((t.x + t.y) % 2 ? '#7ed957' : '#74cf4e');
      if (hover && hover.x === t.x && hover.y === t.y && seleccion) c.fillStyle = S.mapa[t.x + ',' + t.y] ? '#fca5a5' : '#bbf7d0';
      c.beginPath(); c.moveTo(p.x, p.y - hh); c.lineTo(p.x + hw, p.y); c.lineTo(p.x, p.y + hh); c.lineTo(p.x - hw, p.y); c.closePath(); c.fill();
      if (seleccion && !S.mapa[t.x + ',' + t.y]) { c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 1.5; c.stroke(); }
    }
    // Objetos ordenados por profundidad (edificios + vecinos)
    const cosas = [];
    for (const k in S.mapa) { const [x, y] = k.split(',').map(Number); cosas.push({ tipo: 'b', x, y, b: S.mapa[k] }); }
    for (const v of vecinos) cosas.push({ tipo: 'v', x: v.x, y: v.y, v });
    cosas.sort((a, b) => a.x + a.y - (b.x + b.y));
    const ahora = Date.now();
    for (const o of cosas) {
      const p = aPantalla(o.x, o.y);
      if (o.tipo === 'b') {
        const cat = CAT[o.b.t]; if (!cat) continue;
        const salta = o.b.anim ? Math.max(0, o.b.anim) : 0;
        if (o.b.anim) o.b.anim -= 0.04;
        const tam = (cat.deco ? 40 : 54) * cam.z * (1 + salta * 0.4);
        c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(p.x, p.y + 2, hw * 0.55, hh * 0.5, 0, 0, 7); c.fill();
        c.font = `${tam}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
        c.fillStyle = '#000';
        c.fillText(cat.e, p.x, p.y + hh * 0.35 - salta * 18);
        // Nivel del edificio
        if ((o.b.l || 1) > 1) { c.font = `900 ${11 * cam.z + 2}px system-ui`; c.fillStyle = '#ffc61a'; c.strokeStyle = '#7c2d12'; c.lineWidth = 3; const s = '★'.repeat(Math.min(5, o.b.l - 1)); c.strokeText(s, p.x, p.y - tam * 0.95); c.fillText(s, p.x, p.y - tam * 0.95); }
        // Etiqueta en inglés
        if (cam.z > 0.45) {
          c.font = `800 ${Math.round(11 * cam.z + 2)}px system-ui`; const w = c.measureText(cat.id).width + 10;
          c.fillStyle = 'rgba(255,255,255,.88)'; redondo(c, p.x - w / 2, p.y + hh * 0.45, w, 15 * cam.z + 3, 7); c.fill();
          c.fillStyle = '#334155'; c.textBaseline = 'middle'; c.fillText(cat.id, p.x, p.y + hh * 0.45 + (15 * cam.z + 3) / 2 + 0.5);
        }
        if (cat.granja) dibujarCultivo(c, o.b, p, tam);
        // Monedas listas
        else if (!cat.deco) {
          const a = acumulado(o.b, ahora), lleno = a >= prodMin(o.b) * capMin(o.b) * 0.999;
          if (a >= Math.max(1, prodMin(o.b))) {
            const by = p.y - tam * 1.05 - 6 + Math.sin(tiempo * 4 + o.x) * 4;
            c.fillStyle = lleno ? '#ef4444' : '#fff'; c.beginPath(); c.arc(p.x, by, 15 * cam.z + 5, 0, 7); c.fill();
            c.strokeStyle = lleno ? '#7f1d1d' : '#fbbf24'; c.lineWidth = 2.5; c.stroke();
            c.font = `${15 * cam.z + 6}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`; c.textBaseline = 'middle'; c.fillStyle = '#000'; c.fillText('🪙', p.x, by + 1);
          }
        }
      } else {
        const v = o.v, tam = 30 * cam.z, rebote = Math.abs(Math.sin(tiempo * 8 + v.x * 3)) * 3 * cam.z;
        c.fillStyle = 'rgba(0,0,0,.15)'; c.beginPath(); c.ellipse(p.x, p.y + 2, 9 * cam.z, 4 * cam.z, 0, 0, 7); c.fill();
        c.font = `${tam}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
        c.fillStyle = '#000'; c.fillText(v.e, p.x, p.y - rebote);
        if (v.globo) {
          c.font = `800 ${Math.round(12 * cam.z + 3)}px system-ui`; const w = c.measureText(v.globo.en).width + 16, h = 16 * cam.z + 12;
          const gx = p.x - w / 2, gy = p.y - tam - h - 6;
          c.globalAlpha = Math.min(1, v.globo.t * 2);
          c.fillStyle = '#fff'; redondo(c, gx, gy, w, h, 10); c.fill();
          c.beginPath(); c.moveTo(p.x - 5, gy + h - 1); c.lineTo(p.x + 5, gy + h - 1); c.lineTo(p.x, gy + h + 7); c.fill();
          c.fillStyle = '#1e293b'; c.textBaseline = 'middle'; c.fillText(v.globo.en, p.x, gy + h / 2 + 0.5); c.globalAlpha = 1;
        }
        dibujarAntojo(c, v, p, tam);
      }
    }
    dibujarCofres(c);
    // Polvo de construcción
    for (let i = polvo.length - 1; i >= 0; i--) { const d = polvo[i]; d.v -= 0.016; if (d.v <= 0) { polvo.splice(i, 1); continue; } d.x += d.vx * 0.016; d.y += d.vy * 0.016; c.fillStyle = `rgba(255,255,255,${d.v})`; c.beginPath(); c.arc(d.x, d.y, d.r * (1.4 - d.v * 0.5), 0, 7); c.fill(); }
    // Monedas volando al marcador
    const destino = $('pMonedas').getBoundingClientRect();
    for (let i = monedasV.length - 1; i >= 0; i--) {
      const m = monedasV[i]; m.t += 0.016;
      if (m.t < 0.4) { m.vy += 900 * 0.016; m.x += m.vx * 0.016; m.y += m.vy * 0.016; }
      else { const tx = destino.left + 18, ty = destino.top + 16; m.x += (tx - m.x) * 0.2; m.y += (ty - m.y) * 0.2; if (Math.hypot(tx - m.x, ty - m.y) < 14) { monedasV.splice(i, 1); SFX.moneda(m.k); continue; } }
      c.font = '22px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#000'; c.fillText('🪙', m.x, m.y);
    }
    // Textos flotantes
    for (let i = flotantes.length - 1; i >= 0; i--) {
      const f = flotantes[i]; f.v -= 0.016; if (f.v <= 0) { flotantes.splice(i, 1); continue; }
      c.globalAlpha = Math.min(1, f.v * 2); c.font = `1000 ${f.tam}px system-ui`; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.lineWidth = 5; c.strokeStyle = 'rgba(0,0,0,.5)'; const y = f.y - (1.3 - f.v) * 60; c.strokeText(f.t, f.x, y); c.fillStyle = f.color; c.fillText(f.t, f.x, y); c.globalAlpha = 1;
    }
    if (boostActivo()) {
      c.font = '900 13px system-ui'; c.textAlign = 'center'; c.fillStyle = '#fff'; c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = 4;
      const s = `⚡ Producción x2 · ${Math.ceil((S.boost - Date.now()) / 60000)} min`; c.strokeText(s, W / 2, H - 92); c.fillText(s, W / 2, H - 92);
    }
    dibujarFlecha(c);
  }
  function redondo(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

  let monAnim = 0;
  function bucle(t) {
    const dt = Math.min(0.05, (t - ultimo) / 1000); ultimo = t; tiempo += dt;
    moverVecinos(dt); moverCofres(dt);
    dibujar(); pasoConfeti();
    // Contador de monedas animado
    const dif = S.monedas - monedasMostradas;
    if (Math.abs(dif) > 0.5) { monedasMostradas += dif * Math.min(1, dt * 6); $('hMonedas').textContent = fmt(monedasMostradas); }
    else if (monAnim !== S.monedas) { monedasMostradas = S.monedas; monAnim = S.monedas; $('hMonedas').textContent = fmt(S.monedas); }
    requestAnimationFrame(bucle);
  }

  /* ---------------- Interacción ---------------- */
  const punteros = new Map(); let arrastre = null, pellizco = null, movido = false;
  cv.addEventListener('pointerdown', (e) => {
    actx(); cv.setPointerCapture(e.pointerId);
    punteros.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (punteros.size === 1) { arrastre = { x: e.clientX, y: e.clientY, cx: cam.x, cy: cam.y }; movido = false; }
    if (punteros.size === 2) { const [a, b] = [...punteros.values()]; pellizco = { d: Math.hypot(a.x - b.x, a.y - b.y), z: cam.z }; movido = true; }
  });
  cv.addEventListener('pointermove', (e) => {
    if (!punteros.has(e.pointerId)) { if (seleccion && e.pointerType === 'mouse') hover = aMapa(e.clientX, e.clientY); return; }
    punteros.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pellizco && punteros.size === 2) { const [a, b] = [...punteros.values()]; zoomEn((a.x + b.x) / 2, (a.y + b.y) / 2, pellizco.z * Math.hypot(a.x - b.x, a.y - b.y) / pellizco.d); return; }
    if (arrastre) {
      const dx = e.clientX - arrastre.x, dy = e.clientY - arrastre.y;
      if (Math.hypot(dx, dy) > 8) movido = true;
      if (movido) { cam.x = arrastre.cx + dx; cam.y = arrastre.cy + dy; }
    }
    if (seleccion) hover = aMapa(e.clientX, e.clientY);
  });
  const soltar = (e) => {
    punteros.delete(e.pointerId);
    if (punteros.size < 2) pellizco = null;
    if (punteros.size === 0) { if (!movido) tocar(e.clientX, e.clientY); arrastre = null; }
  };
  cv.addEventListener('pointerup', soltar); cv.addEventListener('pointercancel', (e) => { punteros.delete(e.pointerId); arrastre = null; pellizco = null; });
  cv.addEventListener('wheel', (e) => { e.preventDefault(); zoomEn(e.clientX, e.clientY, cam.z * (e.deltaY < 0 ? 1.1 : 0.9)); }, { passive: false });
  function zoomEn(px, py, z) { z = Math.max(0.28, Math.min(2.2, z)); const k = z / cam.z; cam.x = px - (px - cam.x) * k; cam.y = py - (py - cam.y) * k; cam.z = z; }

  function tocar(px, py) {
    // ¿Un vecino?
    for (const v of vecinos) {
      const p = aPantalla(v.x, v.y);
      if (Math.hypot(p.x - px, p.y - 14 * cam.z - py) < 22 * cam.z + 6) {
        if (S.antojos[v.n] && S.antojos[v.n].c) { S.st.frases++; atenderVecino(v); revisarMision(); return; }
        const f = v.globo || (() => { const r = elegir(FRASES); return { en: r[0], es: r[1] }; })();
        v.globo = { ...f, t: 4.5 };
        voz(f.en); toast(`${v.n}: "${f.en}" = ${f.es}`);
        if (!S.frases[f.en]) { S.frases[f.en] = 1; ganar(5, 4); flotar(p.x, p.y - 40 * cam.z, '+4 XP', '#c4b5fd', 18); }
        S.st.frases++; revisarMision();
        return;
      }
    }
    for (const c of cofres) {
      const p = aPantalla(c.x, c.y);
      if (Math.hypot(p.x - px, p.y - 20 * cam.z - py) < 30 * cam.z + 8) { abrirCofre(c); return; }
    }
    const t = aMapa(px, py), k = t.x + ',' + t.y;
    if (!enIsla(t.x, t.y)) { if (seleccion) toast('🌊 Eso es agua: construye dentro de la isla'); return; }
    const b = S.mapa[k];
    if (seleccion) {
      if (b) { abrirEdificio(t.x, t.y); return; }
      construir(t.x, t.y, seleccion); return;
    }
    if (b) b.t === 'farm' ? granja(t.x, t.y) : recoger(t.x, t.y);
  }

  let construyendo = false;
  async function construir(x, y, id, sinDeletrear) {
    const cat = CAT[id];
    if (construyendo) return;
    if (S.nivel < cat.n) { toast(`🔒 Se desbloquea en el nivel ${cat.n}`); return; }
    if (S.monedas < cat.c) { toast(`Te faltan ${fmt(cat.c - S.monedas)} 🪙`); SFX.mal(); return; }
    if (!sinDeletrear) {
      construyendo = true;
      const ok = await deletrear(cat);
      construyendo = false;
      if (!ok || S.mapa[x + ',' + y] || S.monedas < cat.c) return;
      S.st.deletreos++;
    }
    S.monedas -= cat.c;
    S.mapa[x + ',' + y] = { t: id, l: 1, u: Date.now(), anim: 1 };
    S.construidos[id] = (S.construidos[id] || 0) + 1;
    const p = aPantalla(x, y);
    nube(p.x, p.y); SFX.construir(); voz(id);
    flotar(p.x, p.y - 60 * cam.z, `${id} = ${cat.es}`, '#fff', 18);
    ganarXP(cat.deco ? 3 : Math.max(8, Math.round(Math.sqrt(cat.c) * 1.2)));
    ajustarVecinos(); hud(true); pintarTienda(); guardar(); revisarMision();
  }

  /* Deletrear el nombre del edificio tocando las letras en orden. */
  function deletrear(cat) {
    return new Promise((res) => {
      const pal = cat.id.toUpperCase();
      const letras = pal.replace(/ /g, '').split('');
      const extras = barajar('AEIOURSTLNMCDP'.split('').filter((l) => !letras.includes(l))).slice(0, letras.length > 6 ? 3 : 2);
      const fichas = barajar([...letras, ...extras]).map((l, i) => ({ l, i, usada: false }));
      let idx = 0, errores = 0;
      const v = abrirModal(`<div class="grande">${cat.e}</div><h2>¡Deletrea para construir!</h2>
        <p class="sub">${esc(cat.es)} en inglés es… <button class="oir" data-oir style="width:40px;height:40px;font-size:18px;vertical-align:middle">🔊</button></p>
        <div class="huecos" id="huecos"></div><div class="letras" id="letras"></div>
        <button class="btn gris" data-cancel style="margin-top:14px">Cancelar</button>`, false);
      const pintar = () => {
        let k = 0;
        v.querySelector('#huecos').innerHTML = pal.split('').map((c) => c === ' ' ? '<i class="esp"></i>' : `<b class="${k < idx ? 'lleno' : ''}">${k++ < idx ? c : ''}</b>`).join('');
        v.querySelector('#letras').innerHTML = fichas.map((f) => `<button class="letra ${f.usada ? 'usada' : ''} ${errores >= 3 && !f.usada && f.l === letras[idx] ? 'pista' : ''}" data-i="${f.i}">${f.l}</button>`).join('');
      };
      pintar(); setTimeout(() => voz(cat.id), 250);
      v.querySelector('[data-oir]').onclick = () => voz(cat.id);
      v.querySelector('[data-cancel]').onclick = () => { cerrarModal(v); res(false); };
      v.querySelector('#letras').addEventListener('click', (e) => {
        const b = e.target.closest('.letra'); if (!b) return;
        const f = fichas.find((x) => x.i === +b.dataset.i); if (!f || f.usada || idx >= letras.length) return;
        if (f.l === letras[idx]) {
          f.usada = true; idx++; tono(523 * Math.pow(2, [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24][Math.min(idx, 10)] / 12), 0.12, 'triangle', 0.18);
          pintar();
          if (idx >= letras.length) {
            SFX.bien(); voz(cat.id);
            v.querySelector('h2').textContent = errores ? '¡Bien hecho!' : '¡Perfecto! ✨';
            setTimeout(() => { cerrarModal(v); res(true); }, 800);
          }
        } else { errores++; SFX.mal(); b.classList.add('mal'); setTimeout(() => pintar(), 350); }
      });
    });
  }

  async function recoger(x, y) {
    const b = S.mapa[x + ',' + y], cat = CAT[b.t], p = aPantalla(x, y);
    if (cat.deco) { b.anim = 0.6; voz(cat.id); toast(`${cat.e} ${cat.id} = ${cat.es} · +3% producción`); return; }
    let a = acumulado(b);
    if (a < Math.max(1, prodMin(b))) {
      const falta = Math.ceil((Math.max(1, prodMin(b)) - a) / prodMin(b) * 60);
      b.anim = 0.4; voz(cat.id); toast(`${cat.e} ${cat.id} (${cat.es}) · listo en ${falta} s · ${fmt(prodMin(b))} 🪙/min`); return;
    }
    b.u = Date.now(); b.anim = 0.8;
    // Combo: recoger seguido suma +15% por edificio
    const ahora = Date.now();
    comboRec = ahora - ultimoRec < 3000 ? comboRec + 1 : 1; ultimoRec = ahora;
    // Pregunta bonus: ~1 de cada 3 recogidas (más si la misión la pide)
    let mult = 1 + (comboRec - 1) * 0.15;
    if (comboRec > 1) { flotar(p.x, p.y - 110 * cam.z, `COMBO x${comboRec}`, comboRec >= 5 ? '#f472b6' : '#a78bfa', 22 + Math.min(comboRec, 8) * 2); tono(500 + comboRec * 60, 0.1, 'triangle', 0.12); }
    const pideBonus = misionActual().tipo === 'bonus';
    if (palabras.length >= 4 && Math.random() < (pideBonus ? 0.75 : 0.33)) {
      const ok = await preguntar('⭐ ¡Pregunta bonus!', `Acierta y recoges x3 (${fmt(a * 3)} 🪙)`);
      mult *= ok ? 3 : 1;
      if (ok) { S.st.bonus++; ganarXP(12); flotar(p.x, p.y - 90 * cam.z, '¡x3!', '#ffc61a', 30); }
      comboRec = 0;
    }
    a = Math.floor(a * mult);
    lluviaMonedas(p.x, p.y - 40 * cam.z, a);
    flotar(p.x, p.y - 60 * cam.z, '+' + fmt(a), '#ffe066', 24);
    S.monedas += a; S.st.recogido += a; ganarXP(Math.max(1, Math.round(Math.sqrt(a) / 2)));
    hud(true); guardar(); revisarMision();
  }
  let comboRec = 0, ultimoRec = 0;

  function abrirEdificio(x, y) {
    const k = x + ',' + y, b = S.mapa[k], cat = CAT[b.t];
    const venta = Math.floor(cat.c * 0.5);
    const mej = cat.deco ? null : costoMejora(b);
    const v = abrirModal(`<div class="grande">${cat.e}</div><h2>${esc(cat.id)} <button class="oir" data-oir style="width:40px;height:40px;font-size:18px;vertical-align:middle">🔊</button></h2>
      <p class="sub">${esc(cat.es)}${cat.granja ? ` · nivel ${b.l || 1} · cosecha ${cosechaPor(b)} por siembra` : cat.deco ? ' · decoración (+3% producción)' : ` · nivel ${b.l || 1} · ${fmt(prodMin(b))} 🪙/min`}</p>
      ${mej ? `<button class="btn morado" data-mej ${S.monedas < mej || (b.l || 1) >= 6 ? 'disabled style="opacity:.5"' : ''}>⬆️ Mejorar (${(b.l || 1) >= 6 ? 'máximo' : fmt(mej) + ' 🪙'})</button>` : ''}
      <button class="btn gris" data-vender>🗑️ Vender (+${fmt(venta)} 🪙)</button>
      <button class="btn" data-ok>Cerrar</button>`);
    v.querySelector('[data-oir]').onclick = () => voz(cat.id);
    v.querySelector('[data-ok]').onclick = () => cerrarModal(v);
    v.querySelector('[data-vender]').onclick = () => { delete S.mapa[k]; S.monedas += venta; const p = aPantalla(x, y); nube(p.x, p.y); SFX.pop(); cerrarModal(v); hud(true); guardar(); };
    const bm = v.querySelector('[data-mej]');
    if (bm) bm.onclick = () => {
      if (S.monedas < mej || (b.l || 1) >= 6) return;
      const listo = acumulado(b); S.monedas += Math.floor(listo); b.u = Date.now();
      S.monedas -= mej; b.l = (b.l || 1) + 1; b.anim = 1; S.st.mejoras++; setTimeout(revisarMision, 300); SFX.nivel(); ganarXP(Math.round(Math.sqrt(mej)));
      const p = aPantalla(x, y); nube(p.x, p.y); flotar(p.x, p.y - 70 * cam.z, '⬆️ ¡Mejorado!', '#c4b5fd', 22);
      cerrarModal(v); hud(true); guardar();
    };
  }

  /* ---------------- Granja: sembrar, cosechar y ayudar a los vecinos ----------------
     La granja (farm) no da monedas: se siembra un cultivo, crece y se cosecha
     al granero. Los vecinos piden cosechas (globo ❗): se escucha lo que piden
     en inglés, se adivina qué y cuánto, y al entregar pagan bien y sube la
     amistad ❤️ (cada 3 corazones regalan gemas). Sembrar y cosechar actúa en
     todas las granjas a la vez, para que no sea repetitivo. */
  const CULTIVOS = [
    { id: 'wheat', uno: 'a bag of wheat', pl: 'bags of wheat', e: '🌾', es: 'trigo', esPl: 'bolsas de trigo', s: 30, v: 6, n: 1 },
    { id: 'carrot', uno: 'a carrot', pl: 'carrots', e: '🥕', es: 'zanahoria', esPl: 'zanahorias', s: 60, v: 9, n: 1 },
    { id: 'tomato', uno: 'a tomato', pl: 'tomatoes', e: '🍅', es: 'tomate', esPl: 'tomates', s: 120, v: 15, n: 2 },
    { id: 'corn', uno: 'an ear of corn', pl: 'ears of corn', e: '🌽', es: 'maíz', esPl: 'mazorcas de maíz', s: 180, v: 20, n: 2 },
    { id: 'potato', uno: 'a potato', pl: 'potatoes', e: '🥔', es: 'papa', esPl: 'papas', s: 300, v: 28, n: 3 },
    { id: 'strawberry', uno: 'a strawberry', pl: 'strawberries', e: '🍓', es: 'fresa', esPl: 'fresas', s: 480, v: 40, n: 4 },
    { id: 'pumpkin', uno: 'a pumpkin', pl: 'pumpkins', e: '🎃', es: 'calabaza', esPl: 'calabazas', s: 900, v: 65, n: 5 },
    { id: 'grapes', uno: 'a bunch of grapes', pl: 'bunches of grapes', e: '🍇', es: 'uvas', esPl: 'racimos de uvas', s: 1500, v: 95, n: 6 }
  ];
  const CUL = Object.fromEntries(CULTIVOS.map((c) => [c.id, c]));
  const NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
  const cultivosAbiertos = () => CULTIVOS.filter((c) => c.n <= S.nivel);
  const granjas = () => Object.entries(S.mapa).filter(([, b]) => b.t === 'farm');
  const listo = (b) => b.cr && b.cr.fin <= Date.now();
  const cosechaPor = (b) => 2 + ((b.l || 1) - 1);
  const mmss = (s) => (s >= 60 ? `${Math.floor(s / 60)}:${String(Math.ceil(s % 60)).padStart(2, '0')} min` : `${Math.ceil(s)} s`);
  const queCosa = (c, n) => (n === 1 ? c.uno : `${NUM[n]} ${c.pl}`);
  const FRASES_ANTOJO = [
    (c, n) => [`Hi! Can I have ${queCosa(c, n)}, please?`, `¡Hola! ¿Me das ${n} ${n === 1 ? c.es : c.esPl}, por favor?`],
    (c, n) => [`I'm cooking dinner. I need ${queCosa(c, n)}.`, `Estoy cocinando la cena. Necesito ${n} ${n === 1 ? c.es : c.esPl}.`],
    (c, n) => [`Could you bring me ${queCosa(c, n)}?`, `¿Me podrías traer ${n} ${n === 1 ? c.es : c.esPl}?`],
    (c, n) => [`My kids are hungry! I want ${queCosa(c, n)}.`, `¡Mis hijos tienen hambre! Quiero ${n} ${n === 1 ? c.es : c.esPl}.`],
    (c, n) => [`I'd like ${queCosa(c, n)} for my party.`, `Quisiera ${n} ${n === 1 ? c.es : c.esPl} para mi fiesta.`],
    (c, n) => [`Do you have ${queCosa(c, n)}? I'll pay you well!`, `¿Tienes ${n} ${n === 1 ? c.es : c.esPl}? ¡Te pago bien!`]
  ];
  function nuevoAntojo() {
    const ab = cultivosAbiertos(), c = elegir(ab.length > 2 ? ab.slice(-4) : ab);
    const n = Math.max(1, Math.min(8, Math.round(azar(1, 2 + granjas().length * 1.2))));
    const [en, es] = elegir(FRASES_ANTOJO)(c, n);
    return { c: c.id, n, en, es, premio: Math.round(c.v * n * (2.5 + S.nivel * 0.4)), xp: 6 + n * 3 };
  }
  // Reparte pedidos de cosecha entre los vecinos que están en la isla
  function revisarAntojos() {
    if (!granjas().length) return;
    const ahora = Date.now(), max = 2 + Math.floor(S.nivel / 2);
    let activos = vecinos.filter((v) => S.antojos[v.n] && S.antojos[v.n].c).length;
    for (const v of barajar([...vecinos])) {
      if (activos >= max) break;
      const a = S.antojos[v.n];
      if (a && (a.c || (a.espera || 0) > ahora)) continue;
      S.antojos[v.n] = nuevoAntojo(); activos++;
    }
  }
  function sembrar(id) {
    const c = CUL[id]; let n = 0;
    for (const [, b] of granjas()) if (!b.cr) { b.cr = { c: id, fin: Date.now() + c.s * 1000 }; b.anim = 0.6; n++; }
    voz(c.id); SFX.pop();
    toast(`🌱 Sembraste ${c.e} ${c.id} (${c.es}) en ${n} ${n === 1 ? 'granja' : 'granjas'} · listo en ${mmss(c.s)}`);
    for (const [k, b] of granjas()) if (b.cr && b.cr.c === id) { const [x, y] = k.split(',').map(Number); const p = aPantalla(x, y); flotar(p.x, p.y - 50 * cam.z, '🌱', '#bbf7d0', 22); }
    guardar();
  }
  function cosecharTodo() {
    const total = {};
    for (const [k, b] of granjas()) {
      if (!listo(b)) continue;
      const c = CUL[b.cr.c], q = cosechaPor(b);
      S.granero[c.id] = (S.granero[c.id] || 0) + q; total[c.id] = (total[c.id] || 0) + q;
      const [x, y] = k.split(',').map(Number), p = aPantalla(x, y);
      flotar(p.x, p.y - 60 * cam.z, `+${q} ${c.e}`, '#fff', 24); nube(p.x, p.y);
      b.cr = null; b.anim = 0.8;
    }
    const tipos = Object.keys(total); if (!tipos.length) return 0;
    const n = tipos.reduce((s, k) => s + total[k], 0);
    S.st.cosechas = (S.st.cosechas || 0) + n;
    SFX.bien(); ganarXP(2 + n);
    const c = CUL[tipos[0]]; voz(total[c.id] === 1 ? c.uno : `${NUM[Math.min(8, total[c.id])] || total[c.id]} ${c.pl}`);
    toast(`🧺 Cosechaste ${tipos.map((k) => `${total[k]} ${CUL[k].e} ${total[k] === 1 ? CUL[k].id : CUL[k].pl}`).join(' · ')}`);
    revisarAntojos(); hud(true); guardar(); revisarMision();
    return n;
  }
  function graneroHTML() {
    const l = CULTIVOS.filter((c) => S.granero[c.id]);
    return l.length ? `<div class="chips">${l.map((c) => `<span class="chip">${c.e} ${S.granero[c.id]}</span>`).join('')}</div>` : '<p class="sub">Tu granero está vacío</p>';
  }
  function pedidosDeCultivo(id) { return vecinos.filter((v) => S.antojos[v.n] && S.antojos[v.n].c === id).map((v) => v.n); }
  async function granja(x, y) {
    const b = S.mapa[x + ',' + y];
    if (granjas().some(([, g]) => listo(g))) { cosecharTodo(); return; }
    if (b.cr) {
      const c = CUL[b.cr.c], falta = (b.cr.fin - Date.now()) / 1000;
      const v = abrirModal(`<div class="grande">${c.e}</div><h2>${esc(c.id)} <button class="oir" data-oir style="width:40px;height:40px;font-size:18px;vertical-align:middle">🔊</button></h2>
        <p class="sub">${esc(c.es)} · está creciendo, listo en <b>${mmss(falta)}</b></p>
        <button class="btn morado" data-ya>⚡ ¡Que crezca ya! (acierta una palabra)</button><button class="btn gris" data-ok>Esperar</button>`);
      v.querySelector('[data-oir]').onclick = () => voz(c.id);
      v.querySelector('[data-ok]').onclick = () => cerrarModal(v);
      v.querySelector('[data-ya]').onclick = async () => {
        cerrarModal(v);
        if (palabras.length < 4 || await preguntar('⚡ Abono mágico', `Acierta y tus ${c.pl} crecen al instante`)) {
          for (const [, g] of granjas()) if (g.cr && g.cr.c === c.id) g.cr.fin = Date.now();
          S.st.bonus++; cosecharTodo();
        } else toast('🌱 Sigue creciendo… ¡prueba otra vez luego!');
      };
      return;
    }
    const pedidos = Object.fromEntries(CULTIVOS.map((c) => [c.id, pedidosDeCultivo(c.id)]));
    const vacias = granjas().filter(([, g]) => !g.cr).length;
    const v = abrirModal(`<h2>🌱 ¿Qué quieres sembrar?</h2><p class="sub">Se siembra en tus ${vacias} ${vacias === 1 ? 'granja vacía' : 'granjas vacías'}. Cada una da ${cosechaPor(b)}.</p>
      ${graneroHTML()}
      <div class="cultivos">${CULTIVOS.map((c) => {
        const ab = c.n <= S.nivel, p = pedidos[c.id];
        return `<button class="cultivo ${ab ? '' : 'bloq'}" data-c="${c.id}">${p.length ? '<i>❗</i>' : ''}<span>${ab ? c.e : '🔒'}</span><b>${ab ? esc(c.id) : 'Nivel ' + c.n}</b><small>${ab ? `${esc(c.es)} · ${mmss(c.s)}` : '&nbsp;'}</small></button>`;
      }).join('')}</div>
      <button class="btn gris" data-ok>Cerrar</button>`);
    v.querySelector('[data-ok]').onclick = () => cerrarModal(v);
    v.querySelectorAll('.cultivo').forEach((bt) => (bt.onclick = () => {
      const c = CUL[bt.dataset.c];
      if (c.n > S.nivel) { toast(`🔒 ${c.e} se desbloquea en el nivel ${c.n}`); return; }
      cerrarModal(v); sembrar(c.id);
    }));
  }
  // Un vecino con globo ❗: escuchar el pedido, adivinarlo y entregarlo.
  function atenderVecino(v) {
    const a = S.antojos[v.n], c = CUL[a.c];
    const tiene = S.granero[c.id] || 0;
    const amigos = S.amistad[v.n] || 0;
    const corazones = '❤️'.repeat(amigos % 3) + '🤍'.repeat(3 - (amigos % 3));
    let ops = null;
    if (!a.visto) {
      // Opciones: lo correcto, otra cantidad, otro cultivo y otro cultivo con otra cantidad
      const otros = barajar(cultivosAbiertos().filter((x) => x.id !== c.id)), n2 = a.n === 1 ? 2 : a.n - 1;
      const c2 = otros[0] || CULTIVOS[(CULTIVOS.indexOf(c) + 1) % CULTIVOS.length], c3 = otros[1] || c2;
      ops = barajar([[c, a.n], [c, n2 === a.n ? a.n + 1 : n2], [c2, a.n], [c3, n2 === a.n ? a.n + 1 : a.n + 1]]);
    }
    const md = abrirModal(`<div class="grande">${v.e}</div><h2>${esc(v.n)}</h2><p class="sub">Amistad ${corazones} · cada 3 ❤️ te regala 💎</p>
      <button class="oir" data-oir>🔊</button>
      <div id="aTxt">${a.visto ? `<p class="frase">“${esc(a.en)}”</p><p class="sub">${esc(a.es)}</p>` : '<p class="sub" style="margin-top:6px"><b>Escucha</b> y elige qué te pide (si aciertas sin leer: premio x1.5)</p>'}</div>
      ${ops ? `<div class="opciones" id="aOps">${ops.map(([oc, on], i) => `<button class="op" data-i="${i}">${on} ${oc.e} ${esc(on === 1 ? oc.id : oc.pl)}</button>`).join('')}</div>
        <button class="btn gris" data-leer style="margin-top:8px">👀 No entiendo, ver el texto</button>` : ''}
      <div id="aEntrega"></div><button class="btn gris" data-ok>Ahora no</button>`);
    const oir = () => voz(a.en);
    md.querySelector('[data-oir]').onclick = oir; setTimeout(oir, 250);
    md.querySelector('[data-ok]').onclick = () => cerrarModal(md);
    const mostrarEntrega = () => {
      const ya = S.granero[c.id] || 0, premio = Math.round(a.premio * (a.oido ? 1.5 : 1));
      md.querySelector('#aEntrega').innerHTML = `<p class="sub" style="margin-top:8px">Necesita <b>${a.n} ${c.e}</b> · tienes <b>${ya} ${c.e}</b></p>` + (ya >= a.n
        ? `<button class="btn" data-dar>🤝 Entregar · 🪙 ${fmt(premio)}${a.oido ? ' (x1.5 👂)' : ''}</button>`
        : `<p class="sub">🌱 Siembra <b>${esc(c.id)}</b> (${esc(c.es)}) en tu granja y vuelve.</p>${granjas().length ? '<button class="btn morado" data-ir>🌾 Ir a sembrar</button>' : '<p class="sub">Primero construye una granja (farm) 🔨</p>'}`);
      const d = md.querySelector('[data-dar]');
      if (d) d.onclick = () => { cerrarModal(md); entregar(v, premio); };
      const ir = md.querySelector('[data-ir]');
      if (ir) ir.onclick = () => {
        cerrarModal(md);
        const libre = granjas().find(([, g]) => !g.cr);
        if (libre) sembrar(c.id); else toast('⏳ Tus granjas están ocupadas: cosecha primero');
      };
    };
    const revelar = () => { a.visto = true; md.querySelector('#aTxt').innerHTML = `<p class="frase">“${esc(a.en)}”</p><p class="sub">${esc(a.es)}</p>`; guardar(); };
    if (ops) {
      md.querySelector('[data-leer]').onclick = (e) => { e.target.remove(); md.querySelector('#aOps').remove(); revelar(); mostrarEntrega(); };
      md.querySelectorAll('#aOps .op').forEach((bt) => (bt.onclick = () => {
        if (a.visto) return;
        const [oc, on] = ops[+bt.dataset.i], ok = oc === c && on === a.n;
        bt.classList.add(ok ? 'bien' : 'mal');
        if (!ok) md.querySelectorAll('#aOps .op').forEach((x) => { const [xc, xn] = ops[+x.dataset.i]; if (xc === c && xn === a.n) x.classList.add('bien'); });
        ok ? SFX.bien() : SFX.mal();
        a.oido = ok; md.querySelector('[data-leer]')?.remove(); revelar();
        if (ok) flotar(W / 2, H * 0.3, '👂 ¡Lo entendiste! x1.5', '#bbf7d0', 22);
        mostrarEntrega();
      }));
    } else mostrarEntrega();
  }
  function entregar(v, premio) {
    const a = S.antojos[v.n], c = CUL[a.c];
    S.granero[c.id] -= a.n;
    S.amistad[v.n] = (S.amistad[v.n] || 0) + 1;
    const regalo = S.amistad[v.n] % 3 === 0;
    S.antojos[v.n] = { espera: Date.now() + azar(30, 90) * 1000 };
    S.st.entregas = (S.st.entregas || 0) + 1;
    const p = aPantalla(v.x, v.y);
    lluviaMonedas(p.x, p.y - 30 * cam.z, premio); flotar(p.x, p.y - 60 * cam.z, '❤️ Thank you!', '#fecdd3', 24);
    v.globo = { en: elegir(['Thank you so much!', 'You are the best!', 'Thanks a lot, friend!', 'Wow, thank you!']), es: '¡Gracias!', t: 3.5 };
    voz(v.globo.en);
    ganar(premio, a.xp, regalo ? 3 : 0);
    if (regalo) { lanzarConfeti(); SFX.nivel(); setTimeout(() => toast(`🎁 ${v.n} es tu gran amigo: ¡te regala 💎 3!`), 700); }
    revisarAntojos(); guardar(); revisarMision();
  }
  function dibujarCultivo(c, b, p, tam) {
    const hw = (TW / 2) * cam.z, emo = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
    c.textAlign = 'center'; c.fillStyle = '#000';
    if (b.cr) {
      const cu = CUL[b.cr.c], ok = listo(b), t = ok ? 1 : 1 - Math.max(0, b.cr.fin - Date.now()) / (cu.s * 1000);
      c.font = `${(ok ? 20 : 12 + t * 6) * cam.z}px ${emo}`; c.textBaseline = 'middle';
      for (const [dx, dy] of [[-0.42, 0.05], [0, 0.22], [0.42, 0.05], [0, -0.14]]) c.fillText(ok || t > 0.5 ? cu.e : '🌱', p.x + dx * hw, p.y + dy * hw - (ok ? Math.abs(Math.sin(tiempo * 5 + dx * 9)) * 4 : 0));
      if (!ok) { // barrita de crecimiento
        const w = 44 * cam.z, y = p.y - tam * 0.95;
        c.fillStyle = 'rgba(0,0,0,.35)'; redondo(c, p.x - w / 2, y, w, 7 * cam.z + 2, 4); c.fill();
        c.fillStyle = '#4ade80'; redondo(c, p.x - w / 2, y, Math.max(6, w * t), 7 * cam.z + 2, 4); c.fill();
      }
    }
    if (!b.cr || listo(b)) { // globo: vacía → sembrar, lista → cosechar
      const by = p.y - tam * 1.05 - 6 + Math.sin(tiempo * 4 + p.x) * 4;
      c.fillStyle = b.cr ? '#22c55e' : '#fff'; c.beginPath(); c.arc(p.x, by, 15 * cam.z + 5, 0, 7); c.fill();
      c.strokeStyle = b.cr ? '#14532d' : '#86efac'; c.lineWidth = 2.5; c.stroke();
      c.font = `${15 * cam.z + 6}px ${emo}`; c.textBaseline = 'middle'; c.fillStyle = '#000'; c.fillText(b.cr ? '🧺' : '🌱', p.x, by + 1);
    }
  }
  function dibujarAntojo(c, v, p, tam) {
    const a = S.antojos[v.n]; if (!a || !a.c || v.globo) return;
    const cu = CUL[a.c], r = 15 * cam.z + 7, by = p.y - tam - r - 6 + Math.sin(tiempo * 5 + v.x) * 3;
    c.fillStyle = '#fff'; c.beginPath(); c.arc(p.x, by, r, 0, 7); c.fill(); c.strokeStyle = '#f59e0b'; c.lineWidth = 3; c.stroke();
    c.beginPath(); c.moveTo(p.x - 5, by + r - 2); c.lineTo(p.x + 5, by + r - 2); c.lineTo(p.x, by + r + 7); c.fillStyle = '#fff'; c.fill();
    c.font = `${15 * cam.z + 7}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#000';
    c.fillText(cu.e, p.x, by + 1);
    c.font = `1000 ${12 * cam.z + 6}px system-ui`; c.fillStyle = '#ef4444'; c.strokeStyle = '#fff'; c.lineWidth = 3;
    const s = 1 + Math.abs(Math.sin(tiempo * 6)) * 0.25; c.save(); c.translate(p.x + r * 0.9, by - r * 0.8); c.scale(s, s); c.strokeText('!', 0, 0); c.fillText('!', 0, 0); c.restore();
  }

  /* ---------------- Misiones (historia guiada por Abu 🦜) ----------------
     Secuencia fija por capítulos; al terminarla, misiones infinitas.
     Las de estadística cuentan desde que empieza la misión (S.base). */
  const CAPITULOS = ['Llegada a la isla', 'El pueblo crece', 'Escuela y cultura', 'La gran ciudad', 'La isla de las maravillas'];
  const M = (cap, tipo, obj, n, t, abu, m, g = 0) => ({ cap, tipo, obj, n, t, abu, m, g });
  const HISTORIA = [
    M(0, 'construir', 'house', 1, 'Construye una casa (house)', '¡Hola! Soy Abu 🦜. Esta isla es tuya. Empecemos con una casa: toca 🔨 Construir.', 40, 1),
    M(0, 'recoger', null, 15, 'Recoge 15 monedas', 'Tu casa produce monedas 🪙. Cuando veas la moneda encima, ¡tócala!', 30),
    M(0, 'construir', 'farm', 1, 'Construye una granja (farm)', 'En la granja siembras comida 🥕 que tus vecinos te van a pedir. ¡Deletréala para construirla!', 60),
    M(0, 'cosechas', null, 4, 'Cosecha 4 cultivos 🧺', 'Toca la granja 🌱 y elige qué sembrar. Cuando salga 🧺, ¡tócala para cosechar!', 50),
    M(0, 'entregas', null, 1, 'Ayuda a un vecino ❗', '¿Ves el globo ❗ sobre un vecino? Tócalo, escucha qué te pide en inglés y entrégaselo.', 80, 2),
    M(0, 'frases', null, 2, 'Habla con 2 vecinos', 'Tus vecinos hablan inglés. Tócalos para escucharlos.', 40, 1),
    M(0, 'bonus', null, 1, 'Acierta 1 pregunta bonus', 'Al recoger, a veces sale una pregunta. ¡Si aciertas, x3!', 80),
    M(0, 'construir', 'tree', 2, 'Planta 2 árboles (tree)', 'Las decoraciones suben la producción +3% cada una.', 50),
    M(0, 'cofres', null, 1, 'Abre un cofre 🎁', '¡Mira! A veces aparecen cofres en la isla. Tócalos.', 60, 2),
    M(0, 'nivel', null, 2, 'Llega al nivel 2', 'Recoge y construye para ganar XP ⭐.', 100, 2),
    M(1, 'construir', 'bakery', 1, 'Construye una panadería (bakery)', '¡Capítulo 2! Los vecinos quieren pan 🥖.', 150),
    M(1, 'pedidos', null, 1, 'Completa 1 pedido 📜', 'Ayuda a un vecino con sus palabras. Pagan muy bien.', 150, 2),
    M(1, 'construir', 'farm', 2, 'Ten 2 granjas 🌾', 'Con más granjas cosechas el doble… y los vecinos piden más.', 150),
    M(1, 'entregas', null, 4, 'Ayuda a 4 vecinos ❗', 'Cada 3 ❤️ de amistad, el vecino te regala 💎.', 250, 2),
    M(1, 'construir', 'house', 3, 'Ten 3 casas', 'Más casas = más vecinos en tu isla.', 150),
    M(1, 'construir', 'store', 1, 'Construye una tienda (store)', 'Una tienda para el pueblo 🏪.', 250),
    M(1, 'recoger', null, 800, 'Recoge 800 monedas', 'Tip: recoge varios edificios seguidos para hacer COMBO.', 250),
    M(1, 'mejoras', null, 1, 'Mejora un edificio ⬆️', 'En 🔨 Construir, toca un edificio tuyo para mejorarlo.', 300, 2),
    M(1, 'ruleta', null, 1, 'Gira la ruleta 🎡', 'Cada día tienes un giro gratis.', 150),
    M(1, 'nivel', null, 3, 'Llega al nivel 3', '¡Ya casi tienes un pueblo de verdad!', 300, 3),
    M(2, 'construir', 'school', 1, 'Construye una escuela (school)', '¡Capítulo 3! Los niños necesitan una escuela 🏫.', 500),
    M(2, 'bonus', null, 5, 'Acierta 5 preguntas bonus', 'Cada palabra que aciertas te hace más fuerte en inglés 💪.', 500),
    M(2, 'construir', 'fountain', 1, 'Construye una fuente (fountain)', 'Una fuente en la plaza ⛲.', 300),
    M(2, 'pedidos', null, 3, 'Completa 3 pedidos', 'Los vecinos confían en ti.', 600, 3),
    M(2, 'entregas', null, 6, 'Ayuda a 6 vecinos ❗', 'Escucha bien: si entiendes sin leer, pagan x1.5 👂.', 700, 3),
    M(2, 'construir', 'library', 1, 'Construye una biblioteca (library)', 'Para leer en inglés 📚.', 800),
    M(2, 'cofres', null, 4, 'Abre 4 cofres', '¡Busca los cofres en la isla!', 600, 3),
    M(2, 'nivel', null, 5, 'Llega al nivel 5', 'Tu isla está creciendo mucho 🏝️.', 1000, 5),
    M(3, 'construir', 'hospital', 1, 'Construye un hospital', '¡Capítulo 4! Una ciudad necesita un hospital 🏥.', 1200),
    M(3, 'construir', 'bank', 1, 'Construye un banco (bank)', 'Para guardar tanto dinero 🏦.', 1600),
    M(3, 'mejoras', null, 4, 'Haz 4 mejoras', 'Los edificios mejorados producen x1.6.', 2000, 3),
    M(3, 'construir', 'hotel', 1, 'Construye un hotel', 'Llegan turistas a la isla 🏨.', 2500),
    M(3, 'pedidos', null, 6, 'Completa 6 pedidos', '¡Eres el héroe de la isla!', 3000, 5),
    M(3, 'nivel', null, 7, 'Llega al nivel 7', 'Se vienen edificios increíbles…', 4000, 5),
    M(4, 'construir', 'ferris wheel', 1, 'Construye una rueda de la fortuna (ferris wheel)', '¡Capítulo 5! Hora de divertirse 🎡.', 5000),
    M(4, 'construir', 'circus', 1, 'Construye un circo (circus)', '¡Llegó el circo! 🎪', 7000),
    M(4, 'construir', 'castle', 1, 'Construye un castillo (castle)', 'Tu propio castillo 🏰.', 12000, 8),
    M(4, 'construir', 'stadium', 1, 'Construye un estadio (stadium)', '¡Partido de fútbol esta noche! 🏟️', 18000),
    M(4, 'construir', 'tower', 1, 'Construye una torre (tower)', 'La isla se ve desde lejos 🗼.', 25000),
    M(4, 'construir', 'rocket', 1, 'Construye un cohete (rocket)', '¡La meta final: viajar al espacio! 🚀', 60000, 20)
  ];
  function misionActual() {
    if (S.mision < HISTORIA.length) return HISTORIA[S.mision];
    // Infinitas: rotan entre varios tipos, cada vez más grandes
    const k = S.mision - HISTORIA.length, tipos = ['recoger', 'entregas', 'pedidos', 'cosechas', 'bonus', 'cofres', 'mejoras'];
    const tipo = tipos[k % tipos.length], esc_ = 1 + Math.floor(k / tipos.length);
    const n = { recoger: 20000 * esc_, entregas: 4 + esc_ * 2, cosechas: 20 + esc_ * 10, pedidos: 2 + esc_, bonus: 4 + esc_ * 2, cofres: 3 + esc_, mejoras: 2 + esc_ }[tipo];
    const t = { recoger: `Recoge ${fmt(n)} monedas`, entregas: `Ayuda a ${n} vecinos ❗`, cosechas: `Cosecha ${n} cultivos 🧺`, pedidos: `Completa ${n} pedidos`, bonus: `Acierta ${n} preguntas bonus`, cofres: `Abre ${n} cofres`, mejoras: `Haz ${n} mejoras` }[tipo];
    return M(5, tipo, null, n, t, '¡Eres un maestro de la isla! Sigue así 🌟', 5000 * esc_, 3 + esc_);
  }
  function progresoMision(m) {
    if (m.tipo === 'construir') return Object.values(S.mapa).filter((b) => b.t === m.obj).length;
    if (m.tipo === 'nivel') return S.nivel;
    const k = clave(m.tipo);
    return (S.st[k] || 0) - (S.base[k] || 0);
  }
  const clave = (tipo) => (tipo === 'recoger' ? 'recogido' : tipo);
  function iniciarMision() { const m = misionActual(); if (m.tipo !== 'construir' && m.tipo !== 'nivel') { const k = clave(m.tipo); S.base[k] = S.st[k] || 0; } }
  let avisadaLista = -1;
  function revisarMision() {
    const m = misionActual(), prog = Math.max(0, Math.min(m.n, progresoMision(m))), lista = prog >= m.n;
    const cap = m.cap < CAPITULOS.length ? `Capítulo ${m.cap + 1}: ${CAPITULOS[m.cap]}` : 'Misiones de maestro';
    const enCap = HISTORIA.filter((h) => h.cap === m.cap), pos = enCap.indexOf(m) + 1;
    $('mCap').textContent = cap + (pos ? ` · ${pos}/${enCap.length}` : '');
    $('mTxt').textContent = m.t;
    $('mBar').style.width = (prog / m.n) * 100 + '%';
    $('mNum').textContent = `${fmt(prog)}/${fmt(m.n)}`;
    $('mPremio').textContent = `Premio: 🪙 ${fmt(m.m)}${m.g ? ` · 💎 ${m.g}` : ''}`;
    $('mision').classList.toggle('lista', lista);
    $('mReclamar').classList.toggle('oculto', !lista);
    if (lista && avisadaLista !== S.mision) { avisadaLista = S.mision; SFX.pop(); tono(880, 0.15, 'triangle', 0.15, 0, 0.1); }
  }
  function reclamarMision() {
    const m = misionActual(); if (progresoMision(m) < m.n) return;
    S.mision++; iniciarMision();
    const finCap = misionActual().cap !== m.cap;
    ganar(m.m, 20 + m.cap * 15, m.g + (finCap ? 5 : 0));
    lanzarConfeti(140); SFX.nivel();
    const r = $('mision').getBoundingClientRect(); lluviaMonedas(r.left + r.width / 2, r.top + r.height / 2, m.m);
    const sig = misionActual();
    const v = abrirModal(`<div class="grande">${finCap ? '🏆' : '✅'}</div><h2>${finCap ? `¡Capítulo ${m.cap + 1} completado!` : '¡Misión cumplida!'}</h2>
      <div class="chips"><span class="chip">🪙 +${fmt(m.m)}</span>${m.g || finCap ? `<span class="chip">💎 +${m.g + (finCap ? 5 : 0)}</span>` : ''}</div>
      <div class="abu"><span>🦜</span><p>${esc(sig.abu)}</p></div>
      <p class="sub" style="margin-top:8px">Siguiente: <b>${esc(sig.t)}</b></p><button class="btn">¡Vamos!</button>`);
    v.querySelector('.btn').onclick = () => { cerrarModal(v); revisarMision(); };
    if (finCap) setTimeout(() => lanzarConfeti(200), 400);
    guardar(); revisarMision();
  }
  $('mReclamar').onclick = (e) => { e.stopPropagation(); reclamarMision(); };
  $('mision').onclick = () => {
    const m = misionActual();
    if (progresoMision(m) >= m.n) { reclamarMision(); return; }
    const v = abrirModal(`<div class="abu"><span>🦜</span><p>${esc(m.abu)}</p></div><h2 style="margin-top:10px">${esc(m.t)}</h2>
      <p class="sub">Progreso: ${fmt(Math.max(0, Math.min(m.n, progresoMision(m))))}/${fmt(m.n)} · premio 🪙 ${fmt(m.m)}${m.g ? ` y 💎 ${m.g}` : ''}</p><button class="btn">¡Entendido!</button>`);
    v.querySelector('.btn').onclick = () => cerrarModal(v);
  };

  /* Flecha guía: señala qué tocar según la misión */
  function objetivoFlecha() {
    if (document.querySelector('.velo')) return null;
    const m = misionActual();
    if (progresoMision(m) >= m.n) return null; // la tarjeta ya parpadea en verde
    if (m.tipo === 'construir') {
      if (!seleccion) return { el: $('bConstruir') };
      if (seleccion !== m.obj) { const b = document.querySelector(`.prod[data-id="${m.obj}"]`); return b ? { el: b } : null; }
      return null;
    }
    if (m.tipo === 'cosechas' || m.tipo === 'entregas') {
      const pv = m.tipo === 'entregas' && vecinos.find((v) => S.antojos[v.n] && S.antojos[v.n].c && (S.granero[S.antojos[v.n].c] || 0) >= S.antojos[v.n].n);
      if (pv) { const p = aPantalla(pv.x, pv.y); return { x: p.x, y: p.y - 80 * cam.z }; }
      const g = granjas().find(([, b]) => !b.cr || listo(b)) || (m.tipo === 'entregas' && !granjas().length ? null : null);
      if (g) { const [x, y] = g[0].split(',').map(Number), p = aPantalla(x, y); return { x: p.x, y: p.y - 95 * cam.z }; }
      if (!granjas().length) return seleccion ? null : { el: $('bConstruir') };
      return null;
    }
    if (m.tipo === 'pedidos') return { el: $('bPedidos') };
    if (m.tipo === 'ruleta') return { el: $('bRuleta') };
    if (m.tipo === 'cofres' && cofres.length) { const p = aPantalla(cofres[0].x, cofres[0].y); return { x: p.x, y: p.y - 46 * cam.z }; }
    if (m.tipo === 'frases' && vecinos.length) { const p = aPantalla(vecinos[0].x, vecinos[0].y); return { x: p.x, y: p.y - 40 * cam.z }; }
    if (m.tipo === 'recoger' || m.tipo === 'bonus' || m.tipo === 'nivel') {
      const ahora = Date.now();
      for (const k in S.mapa) { const b = S.mapa[k]; if (CAT[b.t] && !CAT[b.t].deco && acumulado(b, ahora) >= Math.max(1, prodMin(b))) { const [x, y] = k.split(',').map(Number); const p = aPantalla(x, y); return { x: p.x, y: p.y - 95 * cam.z }; } }
    }
    return null;
  }
  function dibujarFlecha(c) {
    const o = objetivoFlecha(); if (!o) return;
    let x = o.x, y = o.y;
    if (o.el) { const r = o.el.getBoundingClientRect(); if (!r.width) return; x = r.left + r.width / 2; y = r.top - 6; if (y < 60) y = r.bottom + 46; }
    const b = Math.sin(tiempo * 7) * 7;
    c.save(); c.translate(x, y - 18 - b);
    c.fillStyle = '#ff3d7f'; c.strokeStyle = '#fff'; c.lineWidth = 4;
    c.beginPath(); c.moveTo(0, 16); c.lineTo(-15, -2); c.lineTo(-6, -2); c.lineTo(-6, -22); c.lineTo(6, -22); c.lineTo(6, -2); c.lineTo(15, -2); c.closePath();
    c.stroke(); c.fill(); c.restore();
  }

  /* Cofres sorpresa en la isla */
  let cofres = [], cofreT = 12;
  function moverCofres(dt) {
    cofreT -= dt;
    if (cofreT <= 0) {
      cofreT = (misionActual().tipo === 'cofres' ? azar(8, 16) : azar(35, 75));
      if (cofres.length < 2) { const l = casillasLibres(); if (l.length) { const c = elegir(l); cofres.push({ ...c, t: 0, raro: Math.random() < 0.15 }); tono(1200, 0.2, 'sine', 0.1, 600); } }
    }
    cofres.forEach((c) => (c.t += dt));
  }
  async function abrirCofre(c) {
    cofres = cofres.filter((x) => x !== c);
    const ok = palabras.length >= 4 ? await preguntar(c.raro ? '💜 ¡Cofre raro!' : '🎁 ¡Cofre!', 'Acierta para abrirlo con todo su premio') : true;
    const base = (40 + S.nivel * 35) * (c.raro ? 4 : 1);
    const mon = Math.round(base * (ok ? azar(1.5, 3) : 0.4)), gem = ok ? (c.raro ? 3 : Math.random() < 0.35 ? 1 : 0) : 0;
    const p = aPantalla(c.x, c.y); lluviaMonedas(p.x, p.y - 20, mon); flotar(p.x, p.y - 50 * cam.z, '+' + fmt(mon) + (gem ? ` 💎${gem}` : ''), '#fde047', 24);
    S.st.cofres++; ganar(mon, ok ? 10 : 2, gem); if (ok) SFX.nivel();
    revisarMision();
  }
  function dibujarCofres(c) {
    for (const k of cofres) {
      const p = aPantalla(k.x, k.y), sal = Math.abs(Math.sin(k.t * 3)) * 8 * cam.z, ent = Math.min(1, k.t * 3);
      c.save(); c.globalAlpha = 0.35 + 0.25 * Math.sin(k.t * 5);
      c.fillStyle = k.raro ? '#c084fc' : '#fde047'; c.beginPath(); c.ellipse(p.x, p.y, 26 * cam.z, 13 * cam.z, 0, 0, 7); c.fill(); c.restore();
      c.font = `${36 * cam.z * ent}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillStyle = '#000';
      c.fillText(k.raro ? '💎' : '🎁', p.x, p.y - sal);
      for (let i = 0; i < 3; i++) { const a = k.t * 2 + i * 2.1; c.fillStyle = '#fff'; c.globalAlpha = 0.5 + 0.5 * Math.sin(k.t * 6 + i); c.beginPath(); c.arc(p.x + Math.cos(a) * 22 * cam.z, p.y - 22 * cam.z + Math.sin(a) * 12 * cam.z, 2.2, 0, 7); c.fill(); c.globalAlpha = 1; }
    }
  }

  /* ---------------- Tienda ---------------- */
  function pintarTienda() {
    const mm = misionActual(), objetivo = mm.tipo === 'construir' ? mm.obj : null;
    $('tienda').innerHTML = [...CATALOGO].sort((a, b) => (b.id === objetivo) - (a.id === objetivo)).map((b) => {
      const bloq = S.nivel < b.n, caro = S.monedas < b.c;
      return `<button class="prod ${seleccion === b.id ? 'sel' : ''} ${bloq ? 'bloq' : ''}" data-id="${esc(b.id)}">
        <div class="e">${b.e}</div><b>${esc(b.id)}</b><span>${esc(b.es)}</span>
        <em style="color:${caro ? '#ef4444' : '#16a34a'}">🪙 ${fmt(b.c)}</em>
        <span>${b.deco ? '+3% producción' : `${fmt(b.p)}/min`}</span>
        ${bloq ? `<div class="cand">🔒 Nivel ${b.n}</div>` : ''}${b.id === objetivo ? '<div class="obj">🎯 Misión</div>' : ''}</button>`;
    }).join('');
  }
  $('tienda').addEventListener('click', (e) => {
    const b = e.target.closest('.prod'); if (!b) return;
    const cat = CAT[b.dataset.id];
    if (S.nivel < cat.n) { toast(`🔒 Llega al nivel ${cat.n} para construir ${cat.id}`); return; }
    seleccion = cat.id; SFX.tick(); voz(cat.id); pintarTienda();
    toast(`${cat.e} ${cat.id} = ${cat.es} · toca la isla para construir`);
  });
  function modoConstruir(si) {
    const mm = misionActual();
    seleccion = si ? (seleccion || (mm.tipo === 'construir' && S.nivel >= CAT[mm.obj].n ? mm.obj : 'house')) : null; hover = null;
    $('construir').classList.toggle('oculto', !si); $('bConstruir').classList.toggle('activo', si);
    $('mision').classList.toggle('oculto', si);
    if (si) { pintarTienda(); $('tienda').scrollLeft = 0; }
  }
  $('bConstruir').onclick = () => modoConstruir(!seleccion);
  $('cerrarConstruir').onclick = () => modoConstruir(false);

  /* ---------------- Pedidos ---------------- */
  const PLANTILLAS = [
    (v) => `${v.n} quiere preparar una fiesta 🎉`, (v) => `${v.n} necesita ayuda con su tarea 📚`, (v) => `${v.n} va de viaje a Nueva York ✈️`,
    (v) => `${v.n} escribe una carta en inglés ✉️`, (v) => `${v.n} quiere abrir un café ☕`, (v) => `${v.n} prepara una presentación 🎤`
  ];
  function nuevoPedido() {
    const v = elegir(VECINOS), n = elegir([3, 4, 5, 5, 6]);
    return { id: Math.random().toString(36).slice(2), e: v.e, txt: elegir(PLANTILLAS)(v), n, monedas: Math.round((60 + S.nivel * 45) * n), gemas: n >= 5 ? elegir([1, 2, 2, 3]) : (Math.random() < 0.4 ? 1 : 0), xp: 10 * n, espera: 0 };
  }
  function asegurarPedidos() { while (S.pedidos.length < 3) S.pedidos.push(nuevoPedido()); }
  function abrirPedidos() {
    asegurarPedidos();
    const v = abrirModal(`<h2>📜 Pedidos de los vecinos</h2><p class="sub">Responde sus palabras en inglés y gana premios grandes</p><div id="lp"></div><button class="btn gris" data-ok>Cerrar</button>`);
    const pintar = () => {
      v.querySelector('#lp').innerHTML = S.pedidos.map((p, i) => {
        const espera = p.espera && p.espera > Date.now();
        return `<div class="pedido"><div class="cara">${p.e}</div><div><b>${esc(p.txt)}</b><span>${p.n} palabras · 🪙 ${fmt(p.monedas)}${p.gemas ? ` · 💎 ${p.gemas}` : ''} · ⭐ ${p.xp}</span></div>
          <button data-i="${i}" ${espera ? 'disabled' : ''}>${espera ? `⏳ ${Math.ceil((p.espera - Date.now()) / 60000)} min` : '¡Ayudar!'}</button></div>`;
      }).join('');
    };
    pintar();
    v.querySelector('[data-ok]').onclick = () => cerrarModal(v);
    v.querySelector('#lp').addEventListener('click', async (e) => {
      const b = e.target.closest('button[data-i]'); if (!b || b.disabled) return;
      const i = +b.dataset.i, p = S.pedidos[i];
      cerrarModal(v);
      let bien = 0;
      for (let k = 0; k < p.n; k++) { if (await preguntar(`${p.e} Pedido`, `Palabra ${k + 1} de ${p.n} · aciertos: ${bien}`, (k / p.n) * 100)) bien++; }
      const k = bien / p.n;
      const mon = Math.round(p.monedas * (0.25 + 0.75 * k)), gem = k >= 0.8 ? p.gemas : 0;
      ganar(mon, Math.round(p.xp * (0.5 + k)), gem);
      if (k === 1) { lanzarConfeti(); SFX.nivel(); }
      S.pedidos[i] = { ...nuevoPedido(), espera: Date.now() + 4 * 60000 };
      S.st.pedidos++; revisarMision();
      hud(); guardar();
      const r = abrirModal(`<div class="grande">${k === 1 ? '🏆' : k >= 0.6 ? '😊' : '💪'}</div><h2>${k === 1 ? '¡Perfecto!' : '¡Pedido entregado!'}</h2>
        <p class="sub">${bien} de ${p.n} correctas</p><div class="chips"><span class="chip">🪙 +${fmt(mon)}</span>${gem ? `<span class="chip">💎 +${gem}</span>` : ''}</div><button class="btn">Seguir</button>`);
      r.querySelector('.btn').onclick = () => cerrarModal(r);
    });
  }
  $('bPedidos').onclick = abrirPedidos;

  /* ---------------- Ruleta ---------------- */
  const PREMIOS = [
    { t: '🪙 x1', f: () => ganar(150 + S.nivel * 80), c: '#fde68a' }, { t: '💎 3', f: () => ganar(0, 0, 3), c: '#bae6fd' },
    { t: '🪙 x3', f: () => ganar((150 + S.nivel * 80) * 3), c: '#fcd34d' }, { t: '⚡ x2', f: () => { S.boost = Math.max(Date.now(), S.boost) + 30 * 60000; }, c: '#ddd6fe' },
    { t: '⭐ XP', f: () => ganarXP(40 + S.nivel * 15), c: '#fbcfe8' }, { t: '💎 8', f: () => ganar(0, 0, 8), c: '#7dd3fc' },
    { t: '🪙 x1', f: () => ganar(150 + S.nivel * 80), c: '#fde68a' }, { t: '🎁 x10', f: () => ganar((150 + S.nivel * 80) * 10, 0, 5), c: '#f97316' }
  ];
  const PESOS = [22, 14, 14, 12, 16, 6, 14, 2];
  function abrirRuleta() {
    const gratis = S.ruleta !== hoy();
    const v = abrirModal(`<h2>🎡 Ruleta diaria</h2><p class="sub">${gratis ? '¡Tienes un giro gratis hoy!' : 'Giro extra por 5 💎'}</p>
      <div id="ruleta"><canvas width="520" height="520"></canvas></div>
      <button class="btn naranja" data-girar>${gratis ? '¡GIRAR!' : 'Girar (5 💎)'}</button><button class="btn gris" data-ok>Cerrar</button>`);
    const cvr = v.querySelector('#ruleta canvas'), r = cvr.getContext('2d'), n = PREMIOS.length;
    PREMIOS.forEach((p, i) => {
      const a0 = (i / n) * Math.PI * 2 - Math.PI / 2, a1 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2;
      r.fillStyle = p.c; r.beginPath(); r.moveTo(260, 260); r.arc(260, 260, 250, a0, a1); r.closePath(); r.fill();
      r.strokeStyle = '#fff'; r.lineWidth = 6; r.stroke();
      r.save(); r.translate(260, 260); r.rotate((a0 + a1) / 2); r.textAlign = 'right'; r.textBaseline = 'middle'; r.font = '900 34px system-ui'; r.fillStyle = '#1f2937'; r.fillText(p.t, 232, 0); r.restore();
    });
    r.fillStyle = '#fff'; r.beginPath(); r.arc(260, 260, 34, 0, 7); r.fill(); r.font = '40px sans-serif'; r.textAlign = 'center'; r.textBaseline = 'middle'; r.fillText('🏝️', 260, 262);
    let girando = false, giro = 0;
    v.querySelector('[data-ok]').onclick = () => { if (!girando) cerrarModal(v); };
    v.querySelector('[data-girar]').onclick = (e) => {
      if (girando) return;
      if (S.ruleta === hoy()) { if (S.gemas < 5) { toast('Necesitas 5 💎'); return; } S.gemas -= 5; }
      S.ruleta = hoy(); girando = true; S.st.ruleta++; hud(); guardar(); setTimeout(revisarMision, 4300);
      let k = Math.random() * PESOS.reduce((a, b) => a + b), idx = 0;
      for (; idx < n; idx++) { k -= PESOS[idx]; if (k <= 0) break; }
      idx = Math.min(idx, n - 1);
      giro += 360 * 6 + (360 - (idx + 0.5) * (360 / n)) - (giro % 360);
      cvr.style.transform = `rotate(${giro}deg)`;
      const tic = setInterval(SFX.tick, 120);
      setTimeout(() => {
        clearInterval(tic); girando = false; PREMIOS[idx].f(); SFX.nivel(); lanzarConfeti(); hud(true); guardar();
        toast('🎁 ¡Ganaste ' + PREMIOS[idx].t + '!');
        e.target.textContent = 'Girar otra vez (5 💎)';
        v.querySelector('.sub').textContent = 'Giro extra por 5 💎';
      }, 4100);
    };
  }
  $('bRuleta').onclick = abrirRuleta;

  /* ---------------- Diccionario ---------------- */
  function abrirDicc() {
    const aprendidas = palabras.filter((p) => S.vistas[p.id] && S.vistas[p.id].ok > 0);
    const v = abrirModal(`<h2>📖 Mis palabras</h2>
      <div class="chips"><span class="chip">🏗️ ${Object.keys(S.construidos).length}/${CATALOGO.length} edificios</span><span class="chip">✅ ${aprendidas.length} palabras</span><span class="chip">💬 ${Object.keys(S.frases).length}/${FRASES.length} frases</span></div>
      <p class="sub" style="margin-top:8px">Edificios de tu isla (toca para oír)</p>
      <div class="dicc">${CATALOGO.map((b) => `<button class="${S.construidos[b.id] ? '' : 'no'}" data-en="${esc(b.id)}"><div class="e">${b.e}</div><b>${esc(b.id)}</b><span>${S.construidos[b.id] ? esc(b.es) : '???'}</span></button>`).join('')}</div>
      ${aprendidas.length ? `<p class="sub" style="margin-top:12px">Palabras que ya acertaste</p><div class="chips">${aprendidas.slice(0, 80).map((p) => `<span class="chip" data-en="${esc(p.en)}">${esc(p.en)} · ${esc(p.esCorto)}</span>`).join('')}</div>` : ''}
      <button class="btn gris" data-ok>Cerrar</button>`);
    v.querySelector('[data-ok]').onclick = () => cerrarModal(v);
    v.addEventListener('click', (e) => { const b = e.target.closest('[data-en]'); if (b) voz(b.dataset.en); });
  }
  $('bDicc').onclick = abrirDicc;

  /* ---------------- Más ---------------- */
  $('bMas').onclick = () => {
    const v = abrirModal(`<h2>⚙️ Opciones</h2>
      <p class="sub">Nivel de las palabras</p>
      <div class="chips">${NIVELES.map((n) => `<button class="chip" data-n="${n}" style="${n === S.nivelIngles ? 'background:#FF7A00;color:#fff' : ''}">${n}</button>`).join('')}</div>
      <button class="btn gris" data-son>${S.sonido ? '🔊 Sonido: sí' : '🔇 Sonido: no'}</button>
      <button class="btn gris" data-centro>🎯 Centrar la isla</button>
      <button class="btn gris" data-ayuda>❓ Cómo se juega</button>
      <button class="btn" data-ok>Cerrar</button>`);
    v.querySelector('[data-ok]').onclick = () => cerrarModal(v);
    v.querySelector('[data-son]').onclick = (e) => { S.sonido = !S.sonido; e.target.textContent = S.sonido ? '🔊 Sonido: sí' : '🔇 Sonido: no'; guardar(); };
    v.querySelector('[data-centro]').onclick = () => { centrar(); cerrarModal(v); };
    v.querySelector('[data-ayuda]').onclick = () => { cerrarModal(v); ayuda(); };
    v.querySelectorAll('[data-n]').forEach((b) => (b.onclick = async () => { S.nivelIngles = b.dataset.n; guardar(); cerrarModal(v); toast('Cargando palabras ' + S.nivelIngles + '…'); await cargarPalabras(); toast('✅ Palabras de nivel ' + S.nivelIngles); }));
  };
  function introAbu() {
    const v = abrirModal(`<div class="grande">🏝️</div><h2>¡Bienvenido a tu isla!</h2>
      <div class="abu"><span>🦜</span><p>Soy <b>Abu</b>. Esta isla está casi vacía… ¡y tú la vas a convertir en una ciudad increíble!
      Cada edificio se construye <b>deletreando su nombre en inglés</b>. Te iré dando misiones, ¡y cada una tiene premio!</p></div>
      <button class="btn">¡Empezar la aventura! 🚀</button>`, false);
    v.querySelector('.btn').onclick = () => { cerrarModal(v); revisarMision(); };
  }
  function ayuda() {
    const v = abrirModal(`<div class="grande">🏝️</div><h2>Abu Island</h2>
      <p class="sub" style="text-align:left">
      🦜 Sigue las <b>misiones de Abu</b> (arriba): cada una tiene premio y te lleva al siguiente capítulo.<br><br>
      🔨 <b>Construye</b> edificios deletreando su nombre en inglés. Producen monedas 🪙, también cuando no estás jugando.<br><br>
      ⚡ Recoge varios edificios seguidos para hacer <b>COMBO</b>. 🎁 Toca los <b>cofres</b> que aparecen en la isla.<br><br>
      🪙 <b>Toca un edificio</b> para recoger. A veces sale una <b>pregunta bonus</b>: si aciertas, ¡x3!<br><br>
      🧑 <b>Toca a los vecinos</b>: dicen frases en inglés y te muestran qué significan.<br><br>
      📜 <b>Pedidos</b>: responde palabras para ganar muchas monedas y gemas 💎.<br><br>
      🌳 Las <b>decoraciones</b> suben la producción. ⬆️ Mejora tus edificios tocándolos en modo construir.<br><br>
      🎡 Gira la <b>ruleta</b> gratis cada día. Sube de nivel para agrandar tu isla y desbloquear edificios.</p>
      <button class="btn">¡A construir!</button>`);
    v.querySelector('.btn').onclick = () => cerrarModal(v);
  }

  /* ---------------- Bienvenida (ganancias offline) ---------------- */
  function bienvenida() {
    const fuera = Date.now() - (S.visto || Date.now());
    const total = Object.values(S.mapa).reduce((s, b) => s + acumulado(b), 0);
    // Racha
    const d = hoy();
    if (S.racha.dia !== d) {
      const ay = new Date(Date.now() - 864e5); const ayer = `${ay.getFullYear()}-${ay.getMonth() + 1}-${ay.getDate()}`;
      S.racha = { dia: d, n: S.racha.dia === ayer ? S.racha.n + 1 : 1 };
      const premio = Math.min(7, S.racha.n);
      S.gemas += premio; guardar();
      if (fuera < 60000 * 3 || total < 5) {
        const v = abrirModal(`<div class="grande">🔥</div><h2>¡Racha de ${S.racha.n} día${S.racha.n === 1 ? '' : 's'}!</h2><p class="sub">Premio diario: ${premio} 💎</p><button class="btn">¡Vamos!</button>`);
        v.querySelector('.btn').onclick = () => cerrarModal(v); hud(); return;
      }
    }
    if (fuera < 60000 * 3 || total < 5) return;
    const horas = fuera / 3600000;
    const v = abrirModal(`<div class="grande">🏝️</div><h2>¡Bienvenido de vuelta!</h2>
      <p class="sub">Mientras no estabas (${horas >= 1 ? Math.floor(horas) + ' h' : Math.round(fuera / 60000) + ' min'}) tu isla produjo:</p>
      <div style="font-size:38px;font-weight:1000;color:#d97706">🪙 ${fmt(total)}</div>
      <p class="sub">🔥 Racha: ${S.racha.n} día${S.racha.n === 1 ? '' : 's'}</p>
      <button class="btn morado" data-x2>✨ Duplicar: acierta 3 palabras</button>
      <button class="btn" data-ok>Recoger</button>`, false);
    const recogerTodo = (mult) => {
      let suma = 0; const ahora = Date.now();
      for (const k in S.mapa) { const b = S.mapa[k]; const a = acumulado(b, ahora); if (a > 0) { suma += a; b.u = ahora; } }
      suma = Math.floor(suma * mult);
      S.monedas += suma; lluviaMonedas(W / 2, H / 2, suma); ganarXP(Math.round(Math.sqrt(suma)));
      hud(true); guardar();
    };
    v.querySelector('[data-ok]').onclick = () => { cerrarModal(v); recogerTodo(1); };
    v.querySelector('[data-x2]').onclick = async () => {
      cerrarModal(v); let bien = 0;
      for (let k = 0; k < 3; k++) if (await preguntar('✨ Duplicar ganancias', `Pregunta ${k + 1} de 3`, (k / 3) * 100)) bien++;
      const mult = bien === 3 ? 2 : 1 + bien * 0.25;
      recogerTodo(mult); if (bien === 3) { lanzarConfeti(); SFX.nivel(); }
      toast(bien === 3 ? '✨ ¡Ganancias x2!' : `Acertaste ${bien}/3: x${mult}`);
    };
  }

  /* ---------------- Arranque ---------------- */
  (async function iniciar() {
    try { const l = JSON.parse(localStorage.getItem('abu-juego5')); if (l && l.mapa) S = Object.assign(NUEVO(), l); } catch { }
    let primeraVez = !localStorage.getItem('abu-juego5');
    try {
      const r = window.AbuProgreso ? await AbuProgreso.iniciar({ app: 'juego5', redirigir: false }) : null;
      if (r && r.datos && r.datos.mapa && (r.datos._t || 0) >= (S._t || 0)) { S = Object.assign(NUEVO(), r.datos); primeraVez = false; }
      if (r && r.user && primeraVez) {
        const { data } = await r.db.from('profiles').select('flujo').eq('id', r.user.id).maybeSingle();
        const n = data && data.flujo && data.flujo.currentNivel; if (NIVELES.includes(n)) S.nivelIngles = n;
      }
    } catch (e) { console.warn('[isla] sin sesión', e); }
    if (!S.st) S.st = { recogido: 0, bonus: 0, pedidos: 0, cofres: 0, mejoras: 0, deletreos: 0, ruleta: 0, frases: 0 };
    if (S.mision === undefined) { S.mision = 0; S.base = {}; }
    S.granero = S.granero || {}; S.antojos = S.antojos || {}; S.amistad = S.amistad || {};
    if ((S.v || 2) < 3) {   // v3 metió 5 misiones de granja en la historia: corre el índice
      const i = S.mision; S.mision = i < 3 ? i : i < 10 ? i + 2 : i < 20 ? i + 4 : i + 5; S.v = 3;
      for (const [, b] of Object.entries(S.mapa)) if (b.t === 'farm') delete b.u;
    }
    centrar(); ajustarVecinos(); asegurarPedidos(); hud(); revisarMision();
    monedasMostradas = S.monedas; $('hMonedas').textContent = fmt(S.monedas);
    await cargarPalabras();
    if (primeraVez) { introAbu(); guardar(); } else bienvenida();
    revisarAntojos();
    setInterval(() => { hud(); revisarAntojos(); }, 15000);
  })();
  requestAnimationFrame(bucle);

  window.__isla = { get S() { return S; }, granja, sembrar, cosecharTodo, atenderVecino, revisarAntojos, get vecinos() { return vecinos; }, recoger, construir, reclamarMision, get cofres() { return cofres; }, abrirCofre, abrirPedidos, abrirRuleta, ganar, aPantalla, get palabras() { return palabras; } };
})();
