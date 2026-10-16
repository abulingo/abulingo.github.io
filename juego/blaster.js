/* ============================================================================
   JUEGO 4 · WORD BLASTER  (juego4.html)
   ----------------------------------------------------------------------------
   Arcade espacial: caen asteroides con palabras en inglés y arriba sale la
   pista (significado en español, imagen o audio). Hay que tocar la correcta.

   · Combo → multiplicador; combo x10 = FEVER (todo vale doble).
   · 8 preguntas por ola; al terminar, una carta de mejora (roguelite).
   · Cada 4 olas, JEFE: deletrear la palabra tocando las letras en orden.
   · Monedas → cofres → naves (común, rara, épica, legendaria).
   · Las palabras falladas pesan más y vuelven antes (repaso espaciado
     sencillo dentro del juego, en datos.vistas).
   · Avance en progreso_apps con app = 'juego4' (abu-progreso.js).
============================================================================ */
(function () {
  'use strict';

  /* ---------------- Utilidades ---------------- */
  const $ = (id) => document.getElementById(id);
  const azar = (a, b) => a + Math.random() * (b - a);
  const elegir = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const barajar = (arr) => { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; };
  const hoy = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
  const ayer = () => { const d = new Date(Date.now() - 864e5); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const primerSignificado = (es) => String(es || '').split(/[,;]/)[0].replace(/\(.*?\)/g, '').trim();

  const NIVELES = ['A1', 'A2', 'B1', 'B2', 'C1'];
  const PREGUNTAS_POR_OLA = 8;
  const PRECIO_COFRE = 120;

  /* Palabras de respaldo si no hay conexión ni sesión */
  const RESPALDO = [
    ['apple', 'manzana'], ['dog', 'perro'], ['cat', 'gato'], ['house', 'casa'], ['car', 'carro'], ['book', 'libro'], ['water', 'agua'],
    ['sun', 'sol'], ['moon', 'luna'], ['tree', 'árbol'], ['friend', 'amigo'], ['happy', 'feliz'], ['sad', 'triste'], ['big', 'grande'],
    ['small', 'pequeño'], ['run', 'correr'], ['eat', 'comer'], ['sleep', 'dormir'], ['school', 'escuela'], ['teacher', 'profesor'],
    ['red', 'rojo'], ['blue', 'azul'], ['green', 'verde'], ['bread', 'pan'], ['milk', 'leche'], ['fish', 'pez'], ['bird', 'pájaro'],
    ['door', 'puerta'], ['window', 'ventana'], ['city', 'ciudad'], ['money', 'dinero'], ['time', 'tiempo'], ['love', 'amor'], ['work', 'trabajo']
  ].map(([en, es], i) => ({ id: 'r' + i, en, es, esCorto: es, img: null, audio: null }));

  /* ---------------- Naves ---------------- */
  const RAREZAS = {
    comun: { n: 'COMÚN', c: '#9be7ff', p: 60 },
    rara: { n: 'RARA', c: '#39ff88', p: 28 },
    epica: { n: 'ÉPICA', c: '#c77dff', p: 10 },
    legendaria: { n: 'LEGENDARIA', c: '#ffd23f', p: 2 }
  };
  const NAVES = [
    { id: 'clasica', n: 'Clásica', r: 'comun', c1: '#00e5ff', c2: '#2979ff', forma: 0 },
    { id: 'menta', n: 'Menta', r: 'comun', c1: '#64ffda', c2: '#00bfa5', forma: 1 },
    { id: 'coral', n: 'Coral', r: 'comun', c1: '#ff8a80', c2: '#ff5252', forma: 0 },
    { id: 'limon', n: 'Limón', r: 'comun', c1: '#eeff41', c2: '#aeea00', forma: 2 },
    { id: 'rayo', n: 'Rayo', r: 'rara', c1: '#ffea00', c2: '#ff6d00', forma: 2 },
    { id: 'fantasma', n: 'Fantasma', r: 'rara', c1: '#e0e0ff', c2: '#7c4dff', forma: 1 },
    { id: 'toxica', n: 'Tóxica', r: 'rara', c1: '#39ff88', c2: '#00c853', forma: 3 },
    { id: 'nebula', n: 'Nébula', r: 'epica', c1: '#ff2bd6', c2: '#7c4dff', forma: 3, estela: true },
    { id: 'magma', n: 'Magma', r: 'epica', c1: '#ffab40', c2: '#d50000', forma: 2, estela: true },
    { id: 'aurora', n: 'Aurora', r: 'epica', c1: '#18ffff', c2: '#ff2bd6', forma: 1, estela: true },
    { id: 'dorada', n: 'Abu Dorada', r: 'legendaria', c1: '#fff59d', c2: '#ffb300', forma: 3, estela: true, arcoiris: false },
    { id: 'arcoiris', n: 'Arcoíris', r: 'legendaria', c1: '#fff', c2: '#ff2bd6', forma: 0, estela: true, arcoiris: true }
  ];

  /* ---------------- Mejoras (cartas) ---------------- */
  const MEJORAS = [
    { id: 'vida', i: '❤️', n: '+1 corazón', d: 'Recupera un corazón (máx. 5)', r: 'comun' },
    { id: 'lento', i: '🐢', n: 'Gravedad baja', d: 'Los asteroides caen 12% más lento', r: 'rara' },
    { id: 'iman', i: '🧲', n: 'Imán de monedas', d: '+50% monedas en la partida', r: 'rara' },
    { id: 'blindado', i: '🔰', n: 'Combo blindado', d: 'El primer fallo de cada ola no rompe el combo', r: 'epica' },
    { id: 'menos', i: '🎯', n: 'Mira láser', d: 'Un asteroide menos por pregunta', r: 'epica' },
    { id: 'pBomba', i: '💣', n: '+2 bombas', d: 'Borran las respuestas incorrectas', r: 'comun' },
    { id: 'pEscudo', i: '🛡️', n: '+2 escudos', d: 'Bloquean un fallo', r: 'comun' },
    { id: 'pLento', i: '⏳', n: '+2 cámaras lentas', d: 'Todo va a la mitad por 6 s', r: 'comun' },
    { id: 'puntos', i: '💎', n: 'Puntos x1.5', d: 'Toda la partida suma 50% más', r: 'legendaria' }
  ];

  const MISIONES = [
    { tipo: 'combo', meta: 15, t: 'Consigue un combo x15' },
    { tipo: 'aciertos', meta: 40, t: 'Acierta 40 palabras hoy' },
    { tipo: 'jefe', meta: 1, t: 'Vence a un jefe' },
    { tipo: 'ola', meta: 6, t: 'Llega a la ola 6' },
    { tipo: 'fever', meta: 2, t: 'Entra 2 veces en FEVER' },
    { tipo: 'audio', meta: 10, t: 'Acierta 10 palabras solo con el audio' }
  ];

  /* ---------------- Estado persistente ---------------- */
  let datos = {
    v: 1, record: 0, monedas: 0, xp: 0, naves: ['clasica'], nave: 'clasica', nivel: 'A1',
    racha: { dia: null, n: 0 }, mision: null, vistas: {}, partidas: 0, sonido: true, voz: true
  };
  function guardar() { try { window.AbuProgreso && AbuProgreso.guardar(datos); } catch { /* sin sesión */ } try { localStorage.setItem('abu-juego4', JSON.stringify(datos)); } catch { } }
  const nivelXP = (xp) => Math.floor(Math.sqrt(xp / 120)) + 1;

  /* ---------------- Sonido (sintetizado, sin archivos) ---------------- */
  let ac = null, master = null;
  function audioCtx() {
    if (!ac) {
      try { ac = new (window.AudioContext || window.webkitAudioContext)(); master = ac.createGain(); master.gain.value = 0.5; master.connect(ac.destination); } catch { ac = null; }
    }
    if (ac && ac.state === 'suspended') ac.resume();
    return ac;
  }
  function tono(f, dur, tipo = 'sine', vol = 0.25, deslizar = 0, retraso = 0) {
    if (!datos.sonido || !audioCtx()) return;
    const t = ac.currentTime + retraso;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = tipo; o.frequency.setValueAtTime(f, t);
    if (deslizar) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + deslizar), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
  }
  function ruido(dur, vol = 0.3, corte = 1800) {
    if (!datos.sonido || !audioCtx()) return;
    const n = Math.floor(ac.sampleRate * dur), b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = b; f.type = 'lowpass'; f.frequency.value = corte; g.gain.value = vol;
    s.connect(f); f.connect(g); g.connect(master); s.start();
  }
  const ESCALA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
  const SFX = {
    disparo: () => tono(880, 0.12, 'square', 0.08, -600),
    acierto: (c) => { const base = 392 * Math.pow(2, ESCALA[Math.min(c, ESCALA.length - 1)] / 12); tono(base, 0.14, 'triangle', 0.22); tono(base * 1.5, 0.18, 'triangle', 0.16, 0, 0.06); tono(base * 2, 0.25, 'sine', 0.12, 0, 0.12); },
    boom: () => { ruido(0.35, 0.35, 900); tono(120, 0.3, 'sine', 0.3, -80); },
    error: () => { tono(160, 0.3, 'sawtooth', 0.18, -60); tono(110, 0.35, 'square', 0.1, -40, 0.05); },
    moneda: () => { tono(1320, 0.07, 'square', 0.07); tono(1760, 0.12, 'square', 0.07, 0, 0.06); },
    fever: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tono(f, 0.35, 'sawtooth', 0.09, 0, i * 0.06)),
    ola: () => [392, 523, 659, 784].forEach((f, i) => tono(f, 0.3, 'triangle', 0.18, 0, i * 0.09)),
    poder: () => { tono(440, 0.3, 'sine', 0.2, 880); },
    jefe: () => { tono(70, 0.9, 'sawtooth', 0.22, 40); tono(105, 0.9, 'sawtooth', 0.14, 50, 0.1); },
    letra: (i) => tono(523 * Math.pow(2, ESCALA[i % ESCALA.length] / 12), 0.12, 'triangle', 0.2),
    cofre: () => { for (let i = 0; i < 10; i++) tono(300 + i * 90, 0.1, 'square', 0.05, 0, i * 0.07); },
    premio: (r) => { const n = { comun: 3, rara: 4, epica: 5, legendaria: 7 }[r] || 3; for (let i = 0; i < n; i++) tono(523 * Math.pow(2, ESCALA[i * 2 % ESCALA.length] / 12), 0.4, 'triangle', 0.18, 0, i * 0.1); }
  };

  /* Música de fondo: arpegio que se acelera con la ola y el FEVER */
  let musicaT = 0, musicaPaso = 0;
  const ACORDES = [[0, 4, 7, 12], [-3, 0, 4, 9], [-7, -3, 0, 5], [-5, -1, 2, 7]];
  function musica(dt) {
    if (!datos.sonido || estado !== 'jugando' || !ac) return;
    const bpm = 112 + Math.min(ola, 12) * 4 + (fever ? 30 : 0);
    musicaT -= dt;
    if (musicaT > 0) return;
    musicaT = 60 / bpm / 2;
    const acorde = ACORDES[Math.floor(musicaPaso / 8) % ACORDES.length];
    const nota = acorde[musicaPaso % 4] + (musicaPaso % 8 >= 4 ? 12 : 0);
    tono(220 * Math.pow(2, nota / 12), 0.16, 'triangle', fever ? 0.05 : 0.035);
    if (musicaPaso % 4 === 0) tono(55 * Math.pow(2, acorde[0] / 12), 0.25, 'sine', 0.12);
    if (musicaPaso % 2 === 1) ruido(0.03, 0.03, 6000);
    musicaPaso++;
  }

  /* ---------------- Voz ---------------- */
  let audioActual = null;
  function decir(p) {
    if (!datos.voz || !p) return;
    try { if (audioActual) audioActual.pause(); } catch { }
    if (p.audio) {
      audioActual = new Audio(p.audio);
      audioActual.play().catch(() => voz(p.en));
    } else voz(p.en);
  }
  function voz(texto) {
    try {
      const u = new SpeechSynthesisUtterance(texto); u.lang = 'en-US'; u.rate = 0.9;
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    } catch { }
  }

  /* ---------------- Lienzo ---------------- */
  const cv = $('lienzo'), cx = cv.getContext('2d');
  let W = 0, H = 0, DPR = 1;
  function medir() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * DPR; cv.height = H * DPR; cx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener('resize', medir); medir();

  const estrellas = Array.from({ length: 140 }, () => ({ x: Math.random(), y: Math.random(), z: azar(0.2, 1), t: Math.random() * 6 }));

  /* ---------------- Estado de la partida ---------------- */
  let estado = 'menu';     // menu | jugando | mejora | pausa | fin
  let palabras = [];       // banco del nivel
  let ola = 1, preguntaN = 0, puntos = 0, vidas = 3, combo = 0, comboMax = 0, fever = false, feverVeces = 0;
  let aciertos = 0, total = 0, monedasPartida = 0, aciertosAudio = 0, jefesVencidos = 0;
  let falladas = new Map(), aprendidas = new Map();
  let mods = {};           // mejoras de la partida
  let poderes = { lento: 1, bomba: 1, escudo: 0 };
  let escudoActivo = false, lentoHasta = 0, blindajeUsado = false;
  let asteroides = [], particulas = [], textos = [], laseres = [], monedasVuelo = [], anillos = [];
  let objetivo = null, modo = 'es', esperando = 0, sacudir = 0, flash = 0, flashColor = '#fff';
  let naveX = 0.5, naveObjX = 0.5, naveInclina = 0;
  let jefe = null;         // { palabra, letras:[], idx, hp, tiempo, max }
  let tiempo = 0;

  /* ---------------- Datos de palabras ---------------- */
  async function cargarPalabras(nivel) {
    const db = window.AbuProgreso && AbuProgreso.db;
    if (!db) return RESPALDO;
    try {
      const { data, error } = await db.from('palabras').select('id,ingles,espanol,imagen,audio,nivel').eq('nivel', nivel).limit(1000);
      if (error) throw error;
      let lista = (data || []).filter((p) => p.ingles && p.espanol && p.ingles.length <= 16)
        .map((p) => ({ id: p.id, en: p.ingles.trim(), es: p.espanol.trim(), esCorto: primerSignificado(p.espanol), img: p.imagen, audio: p.audio }));
      // Sin duplicados de inglés
      const vistos = new Set(); lista = lista.filter((p) => { const k = p.en.toLowerCase(); if (vistos.has(k)) return false; vistos.add(k); return true; });
      return lista.length >= 12 ? lista : RESPALDO;
    } catch (e) { console.warn('[blaster] sin palabras:', e); return RESPALDO; }
  }

  /* Peso de cada palabra: las falladas vuelven antes, las dominadas menos */
  function peso(p) {
    const v = datos.vistas[p.id];
    if (!v) return 1.4;                     // nueva: algo de prioridad
    return Math.max(0.25, 1 + v.f * 1.6 - Math.min(v.ok, 6) * 0.15);
  }
  let recientes = [];
  function escogerObjetivo() {
    const candidatos = palabras.filter((p) => !recientes.includes(p.id));
    const tot = candidatos.reduce((s, p) => s + peso(p), 0);
    let r = Math.random() * tot;
    for (const p of candidatos) { r -= peso(p); if (r <= 0) return p; }
    return candidatos[0] || palabras[0];
  }
  function distractores(obj, n) {
    const largo = obj.en.length;
    const pool = palabras.filter((p) => p.id !== obj.id && p.esCorto.toLowerCase() !== obj.esCorto.toLowerCase() && p.en.toLowerCase() !== obj.en.toLowerCase());
    // Mezcla: la mitad de largo parecido (más difícil), el resto al azar
    const parecidas = barajar(pool.filter((p) => Math.abs(p.en.length - largo) <= 2 || p.en[0] === obj.en[0]));
    const out = [];
    for (const p of [...parecidas.slice(0, Math.ceil(n / 2)), ...barajar(pool)]) { if (out.length >= n) break; if (!out.includes(p)) out.push(p); }
    return out;
  }

  /* ---------------- Asteroides ---------------- */
  const LINEA = () => H - 104;                     // si la correcta cruza esta línea, se pierde
  function techo() { const r = $('pista').getBoundingClientRect(); return r.bottom > 0 ? r.bottom : 120; }
  function velocidadBase() {
    const segundos = Math.max(4, 8.5 - (ola - 1) * 0.5);
    return (LINEA() - techo()) / segundos * (mods.lento ? 0.88 : 1);
  }
  function nuevaPregunta() {
    if (estado !== 'jugando' || jefe) return;
    if (preguntaN >= PREGUNTAS_POR_OLA) { terminarOla(); return; }
    preguntaN++;
    objetivo = escogerObjetivo();
    recientes.push(objetivo.id); if (recientes.length > Math.min(8, palabras.length - 5)) recientes.shift();
    // Modo de la pista: español al principio; imagen y audio aparecen con las olas
    const modos = ['es', 'es'];
    if (objetivo.img && ola >= 1) modos.push('img', 'img');
    if (ola >= 2) modos.push('audio');
    modo = elegir(modos);
    const n = Math.max(2, Math.min(5, 3 + Math.floor((ola - 1) / 2)) - (mods.menos ? 1 : 0));
    const opciones = barajar([objetivo, ...distractores(objetivo, n - 1)]);
    asteroides = [];
    mostrarPista();
    const carril = W / opciones.length, arriba = techo();
    cx.font = '800 17px system-ui, sans-serif';
    opciones.forEach((p, i) => {
      const ancho = cx.measureText(p.en).width;
      const r = Math.max(36, Math.min(carril / 2 - 4, ancho / 2 + 16));
      const x = Math.max(r + 4, Math.min(W - r - 4, carril * (i + 0.5) + azar(-carril * 0.12, carril * 0.12)));
      asteroides.push({
        p, x, y: arriba + r * 0.3 - azar(0, 70), r, rot: azar(0, 6.28), vr: azar(-0.6, 0.6),
        v: velocidadBase() * azar(0.85, 1.15), correcto: p === objetivo, vivo: true, fade: 1,
        forma: Array.from({ length: 11 }, () => azar(0.84, 1.08)), hue: Math.floor(azar(180, 320))
      });
    });
    if (modo === 'audio') setTimeout(() => decir(objetivo), 250);
    total++;
  }
  function mostrarPista() {
    $('pista').classList.remove('oculto');
    const img = $('pImg');
    $('pAudio').classList.toggle('oculto', false);
    if (modo === 'img') {
      img.src = objetivo.img; img.classList.remove('oculto');
      $('pModo').textContent = '¿Qué es esto?'; $('pTexto').textContent = ''; $('pExtra').textContent = 'Dispara a la palabra en inglés';
    } else if (modo === 'audio') {
      img.classList.add('oculto');
      $('pModo').textContent = 'Escucha 🎧'; $('pTexto').textContent = '¿Qué palabra oyes?'; $('pExtra').textContent = 'Toca 🔊 para repetir';
    } else {
      img.classList.add('oculto');
      $('pModo').textContent = 'Dispara a…'; $('pTexto').textContent = objetivo.esCorto;
      $('pExtra').textContent = objetivo.es !== objetivo.esCorto ? objetivo.es : '';
    }
  }

  /* ---------------- Acciones ---------------- */
  function marcar(p, ok) {
    const v = datos.vistas[p.id] || (datos.vistas[p.id] = { ok: 0, f: 0 });
    if (ok) { v.ok++; if (v.f > 0) v.f = Math.max(0, v.f - 0.5); } else v.f++;
  }
  function multiplicador() { return Math.min(8, 1 + Math.floor(combo / 3)) * (fever ? 2 : 1) * (mods.puntos ? 1.5 : 1); }

  function disparar(a) {
    if (!a.vivo || esperando > 0) return;
    audioCtx();
    naveObjX = a.x / W;
    laseres.push({ x1: naveX * W, y1: H - 78, x2: a.x, y2: a.y, vida: 0.18, color: a.correcto ? '#39ff88' : '#ff4d6d' });
    SFX.disparo();
    if (a.correcto) acertar(a); else fallar(a);
  }

  function acertar(a) {
    combo++; comboMax = Math.max(comboMax, combo); aciertos++;
    if (modo === 'audio') aciertosAudio++;
    marcar(a.p, true);
    if (!aprendidas.has(a.p.id)) aprendidas.set(a.p.id, a.p);
    const ganado = Math.round(100 * multiplicador() * (1 + Math.max(0, a.y) / H * 0.5)); // más puntos si lo das arriba
    puntos += ganado;
    explotar(a.x, a.y, a.r, true);
    texto(a.x, a.y - a.r, '+' + ganado, fever ? '#ff2bd6' : '#ffd23f', 26);
    texto(a.x, a.y + 6, a.p.en, '#fff', 20, 1.1);
    SFX.acierto(combo); SFX.boom();
    decir(a.p);
    // Monedas
    const nMon = 1 + (Math.random() < 0.35 ? 1 : 0) + (fever ? 1 : 0);
    for (let i = 0; i < nMon; i++) monedasVuelo.push({ x: a.x + azar(-20, 20), y: a.y + azar(-20, 20), vx: azar(-120, 120), vy: azar(-260, -120), t: 0 });
    // Poderes por combo
    if (combo === 5 || combo === 15 || combo === 30 || (combo > 30 && combo % 20 === 0)) darPoder();
    if (combo === 10 || (combo > 10 && combo % 25 === 0)) entrarFever();
    comboUI();
    // Las demás se desintegran
    asteroides.forEach((o) => { if (o !== a && o.vivo) { o.vivo = false; o.morir = 0.35; } });
    a.vivo = false; a.fade = 0;
    sacudir = Math.max(sacudir, 6);
    esperando = 0.45;
    actualizarHUD();
  }

  function fallar(a, porPasar) {
    marcar(objetivo, false);
    falladas.set(objetivo.id, objetivo);
    if (a && !porPasar) { a.vivo = false; a.fade = 0; explotar(a.x, a.y, a.r, false); }
    const correcto = asteroides.find((o) => o.correcto);
    if (correcto) { anillos.push({ x: correcto.x, y: Math.max(60, correcto.y), r: correcto.r, t: 0 }); texto(correcto.x, Math.max(90, correcto.y) - correcto.r - 8, '✓ ' + objetivo.en, '#39ff88', 22, 1.6); }
    SFX.error();
    if (escudoActivo) {
      escudoActivo = false; texto(W / 2, H - 140, '🛡️ ¡Bloqueado!', '#00e5ff', 26);
    } else {
      vidas--; sacudir = 16; flash = 0.35; flashColor = '#ff4d6d';
      if (navigator.vibrate) try { navigator.vibrate(120); } catch { }
    }
    if (mods.blindado && !blindajeUsado) { blindajeUsado = true; texto(W / 2, H * 0.45, '🔰 Combo protegido', '#c77dff', 22); }
    else { combo = 0; if (fever) salirFever(); }
    comboUI();
    decir(objetivo);
    asteroides.forEach((o) => { if (o.vivo) { o.vivo = false; o.morir = 0.6; } });
    esperando = 1.25;
    actualizarHUD();
    if (vidas <= 0) setTimeout(finPartida, 900);
  }

  function entrarFever() {
    if (fever) { feverVeces++; return; }
    fever = true; feverVeces++;
    $('fever').classList.add('on'); $('pista').classList.add('fever');
    banner('FEVER!', 'todo vale doble'); SFX.fever();
  }
  function salirFever() { fever = false; $('fever').classList.remove('on'); $('pista').classList.remove('fever'); }

  function darPoder() {
    const k = elegir(['lento', 'bomba', 'escudo']);
    poderes[k]++;
    texto(W / 2, H - 150, { lento: '🐢', bomba: '💣', escudo: '🛡️' }[k] + ' +1', '#ffd23f', 26);
    SFX.poder(); actualizarPoderes();
  }
  function usarPoder(k) {
    if (estado !== 'jugando' || !poderes[k]) return;
    if (k === 'bomba') {
      if (jefe || esperando > 0) return;
      const malas = asteroides.filter((o) => o.vivo && !o.correcto);
      if (!malas.length) return;
      malas.forEach((o) => { o.vivo = false; o.fade = 0; explotar(o.x, o.y, o.r, true, '#ffab40'); });
      sacudir = 14; SFX.boom();
    } else if (k === 'lento') {
      lentoHasta = tiempo + 6; banner('SLOW-MO', '6 segundos');
    } else if (k === 'escudo') {
      if (escudoActivo) return; escudoActivo = true;
    }
    poderes[k]--; SFX.poder(); actualizarPoderes();
  }

  /* ---------------- Jefe: deletrear ---------------- */
  function iniciarJefe() {
    const opciones = palabras.filter((p) => /^[a-z]{3,9}$/i.test(p.en));
    const pal = opciones.length ? opciones.reduce((m, p) => (peso(p) > peso(m) && Math.random() < 0.7 ? p : m), elegir(opciones)) : elegir(palabras);
    const letras = pal.en.toUpperCase().split('');
    const extras = 'AEIOURSTLNMDCP'.split('').filter((l) => !letras.includes(l));
    const todas = barajar([...letras.map((l, i) => ({ l, i })), ...barajar(extras).slice(0, 2).map((l) => ({ l, i: -1 }))]);
    jefe = {
      p: pal, letras: todas.map((o, k) => ({ ...o, ang: (k / todas.length) * Math.PI * 2, rad: 0, vivo: true, r: 26 })),
      idx: 0, hecho: '', tiempo: 14 + letras.length * 2.2, max: 14 + letras.length * 2.2, entrada: 1.2, golpe: 0
    };
    objetivo = pal; modo = 'jefe';
    asteroides = [];
    $('pista').classList.remove('oculto');
    $('pImg').classList.toggle('oculto', !pal.img); if (pal.img) $('pImg').src = pal.img;
    $('pModo').textContent = '👾 JEFE · Deletrea'; $('pTexto').textContent = pal.esCorto; $('pExtra').textContent = '_ '.repeat(letras.length).trim();
    banner('¡JEFE!', 'deletrea la palabra'); SFX.jefe();
    setTimeout(() => decir(pal), 700);
  }
  function tocarLetra(L) {
    const j = jefe; if (!j || j.entrada > 0) return;
    const esperada = j.p.en.toUpperCase()[j.idx];
    if (L.l === esperada) {
      L.vivo = false; j.idx++; j.hecho += L.l;
      SFX.letra(j.idx); explotar(L.x, L.y, 22, true, '#00e5ff');
      $('pExtra').textContent = j.p.en.toUpperCase().split('').map((c, i) => (i < j.idx ? c : '_')).join(' ');
      puntos += 60 * multiplicador(); j.golpe = 0.25;
      if (j.idx >= j.p.en.length) ganarJefe();
      actualizarHUD();
    } else {
      SFX.error(); L.temblor = 0.4; j.tiempo -= 2.5; sacudir = 10;
      texto(L.x, L.y - 30, '-2 s', '#ff4d6d', 20);
    }
  }
  function ganarJefe() {
    const j = jefe;
    const bonus = Math.round(400 * j.p.en.length * (mods.puntos ? 1.5 : 1));
    puntos += bonus; jefesVencidos++; combo += 3; comboMax = Math.max(comboMax, combo);
    marcar(j.p, true); aprendidas.set(j.p.id, j.p);
    for (let i = 0; i < 14; i++) monedasVuelo.push({ x: W / 2 + azar(-60, 60), y: H * 0.4 + azar(-60, 60), vx: azar(-260, 260), vy: azar(-420, -160), t: 0 });
    for (let k = 0; k < 5; k++) setTimeout(() => explotar(W / 2 + azar(-90, 90), H * 0.4 + azar(-90, 90), 50, true, elegir(['#ff2bd6', '#00e5ff', '#ffd23f'])), k * 120);
    banner('¡JEFE VENCIDO!', '+' + bonus); SFX.ola(); sacudir = 22; flash = 0.4; flashColor = '#fff';
    decir(j.p);
    jefe = null; comboUI();
    setTimeout(terminarOla, 1400);
  }
  function perderJefe() {
    const j = jefe; jefe = null;
    marcar(j.p, false); falladas.set(j.p.id, j.p);
    vidas--; sacudir = 20; flash = 0.4; flashColor = '#ff4d6d'; SFX.error();
    banner('El jefe escapó', j.p.en.toUpperCase());
    decir(j.p); actualizarHUD();
    if (vidas <= 0) { setTimeout(finPartida, 1200); return; }
    setTimeout(terminarOla, 1600);
  }

  /* ---------------- Olas y mejoras ---------------- */
  function terminarOla() {
    if (estado !== 'jugando') return;
    asteroides = []; esperando = 0; jefe = null;
    SFX.ola();
    estado = 'mejora';
    $('mOla').textContent = ola;
    const posibles = barajar(MEJORAS.filter((m) => !(m.id === 'vida' && vidas >= 5) && !(['lento', 'iman', 'blindado', 'menos', 'puntos'].includes(m.id) && mods[m.id])));
    // Rareza: la legendaria sale poco
    const cartas = [];
    for (const m of posibles) { if (cartas.length >= 3) break; if (m.r === 'legendaria' && Math.random() > 0.25) continue; cartas.push(m); }
    $('mCartas').innerHTML = cartas.map((m) => `<button class="carta" data-m="${m.id}" style="--c:${RAREZAS[m.r].c}"><em>${RAREZAS[m.r].n}</em><i>${m.i}</i><b>${m.n}</b><small>${m.d}</small></button>`).join('');
    $('sMejora').classList.remove('oculto');
    $('pista').classList.add('oculto');
  }
  $('mCartas').addEventListener('click', (e) => {
    const b = e.target.closest('.carta'); if (!b) return;
    const id = b.dataset.m;
    if (id === 'vida') vidas = Math.min(5, vidas + 1);
    else if (id === 'pBomba') poderes.bomba += 2;
    else if (id === 'pEscudo') poderes.escudo += 2;
    else if (id === 'pLento') poderes.lento += 2;
    else mods[id] = true;
    SFX.poder();
    $('sMejora').classList.add('oculto');
    ola++; preguntaN = 0; blindajeUsado = false;
    estado = 'jugando';
    actualizarHUD(); actualizarPoderes();
    if (ola % 4 === 0) iniciarJefe();
    else { banner('OLA ' + ola, ola % 4 === 3 ? 'el jefe se acerca…' : ''); esperando = 0.7; }
  });

  /* ---------------- Efectos ---------------- */
  function explotar(x, y, r, bien, color) {
    const n = bien ? 34 : 18;
    for (let i = 0; i < n; i++) {
      const ang = azar(0, Math.PI * 2), v = azar(80, bien ? 520 : 300);
      particulas.push({ x, y, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v, vida: azar(0.4, 0.9), max: 0.9, tam: azar(2, 5),
        color: color || (bien ? elegir(['#39ff88', '#00e5ff', '#ffd23f', '#fff']) : elegir(['#ff4d6d', '#ff8a80', '#999'])) });
    }
    anillos.push({ x, y, r: r * 0.6, t: 0, color: color || (bien ? '#39ff88' : '#ff4d6d') });
  }
  function texto(x, y, t, color, tam = 22, vida = 0.9) { textos.push({ x, y, t, color, tam, vida, max: vida }); }
  let bannerT = null;
  function banner(t, sub) {
    const b = $('banner'); b.innerHTML = esc(t) + (sub ? `<small>${esc(sub)}</small>` : '');
    b.classList.add('show'); clearTimeout(bannerT); bannerT = setTimeout(() => b.classList.remove('show'), 1300);
  }
  let toastT = null;
  function toast(t) { const el = $('toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2200); }

  function comboUI() {
    const el = $('combo');
    if (combo < 2) { el.classList.remove('show'); return; }
    const m = multiplicador();
    el.textContent = `COMBO ${combo} · x${m % 1 ? m.toFixed(1) : m}`;
    el.style.color = fever ? '#ff2bd6' : combo >= 10 ? '#ffd23f' : combo >= 5 ? '#39ff88' : '#00e5ff';
    el.classList.add('show', 'pop'); setTimeout(() => el.classList.remove('pop'), 120);
  }
  function actualizarHUD() {
    $('hVidas').textContent = vidas > 0 ? '❤️'.repeat(vidas) : '💀';
    $('hOla').textContent = 'Ola ' + ola;
    $('hPuntos').textContent = Math.round(puntos).toLocaleString('es');
  }
  function actualizarPoderes() {
    [['pwLento', 'lento'], ['pwBomba', 'bomba'], ['pwEscudo', 'escudo']].forEach(([id, k]) => {
      const b = $(id); b.querySelector('b').textContent = poderes[k]; b.disabled = !poderes[k];
    });
    $('pwEscudo').style.boxShadow = escudoActivo ? '0 0 18px #00e5ff' : '';
  }

  /* ---------------- Dibujo de la nave ---------------- */
  function dibujarNave(c, x, y, s, nave, inclina = 0, t = 0) {
    c.save(); c.translate(x, y); c.rotate(inclina); c.scale(s, s);
    const g = c.createLinearGradient(0, -30, 0, 30);
    if (nave.arcoiris) { const h = (t * 120) % 360; g.addColorStop(0, `hsl(${h},100%,70%)`); g.addColorStop(1, `hsl(${(h + 120) % 360},100%,55%)`); }
    else { g.addColorStop(0, nave.c1); g.addColorStop(1, nave.c2); }
    c.shadowColor = nave.c1; c.shadowBlur = 18;
    c.fillStyle = g; c.beginPath();
    if (nave.forma === 0) { c.moveTo(0, -32); c.lineTo(22, 18); c.lineTo(8, 12); c.lineTo(0, 22); c.lineTo(-8, 12); c.lineTo(-22, 18); }
    else if (nave.forma === 1) { c.moveTo(0, -30); c.quadraticCurveTo(26, -4, 24, 20); c.lineTo(0, 10); c.lineTo(-24, 20); c.quadraticCurveTo(-26, -4, 0, -30); }
    else if (nave.forma === 2) { c.moveTo(0, -34); c.lineTo(10, -6); c.lineTo(28, 6); c.lineTo(10, 14); c.lineTo(0, 24); c.lineTo(-10, 14); c.lineTo(-28, 6); c.lineTo(-10, -6); }
    else { c.moveTo(0, -30); c.lineTo(14, -10); c.lineTo(30, 0); c.lineTo(16, 10); c.lineTo(20, 24); c.lineTo(0, 14); c.lineTo(-20, 24); c.lineTo(-16, 10); c.lineTo(-30, 0); c.lineTo(-14, -10); }
    c.closePath(); c.fill();
    c.shadowBlur = 0; c.fillStyle = 'rgba(255,255,255,.85)';
    c.beginPath(); c.ellipse(0, -8, 5, 9, 0, 0, Math.PI * 2); c.fill();
    // Fuego
    const fl = 10 + Math.sin(t * 40) * 4;
    const fg = c.createLinearGradient(0, 16, 0, 16 + fl * 2);
    fg.addColorStop(0, '#fff'); fg.addColorStop(0.3, nave.c1); fg.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = fg; c.beginPath(); c.moveTo(-7, 16); c.lineTo(0, 16 + fl * 2); c.lineTo(7, 16); c.fill();
    c.restore();
  }
  const naveActual = () => NAVES.find((n) => n.id === datos.nave) || NAVES[0];

  /* ---------------- Bucle ---------------- */
  let ultimo = performance.now();
  const estela = [];
  function bucle(ahora) {
    let dt = Math.min(0.05, (ahora - ultimo) / 1000); ultimo = ahora;
    tiempo += dt;
    const lento = tiempo < lentoHasta ? 0.5 : 1;
    if (estado === 'jugando') actualizar(dt, lento);
    else if (estado === 'menu') { naveObjX = 0.5 + Math.sin(tiempo * 0.8) * 0.25; }
    dibujar(dt);
    musica(dt);
    requestAnimationFrame(bucle);
  }

  function actualizar(dt, lento) {
    if (esperando > 0) { esperando -= dt; if (esperando <= 0 && !jefe && vidas > 0) nuevaPregunta(); }
    const sdt = dt * lento;
    for (const a of asteroides) {
      if (a.vivo) {
        a.y += a.v * sdt; a.rot += a.vr * sdt;
        if (a.correcto && a.y > LINEA()) { a.vivo = false; fallar(null, true); break; }
      } else if (a.morir) { a.morir -= dt; a.fade = Math.max(0, a.morir / 0.6); a.y += a.v * sdt * 0.3; }
    }
    if (jefe) {
      const j = jefe;
      if (j.entrada > 0) j.entrada -= dt;
      else j.tiempo -= sdt;
      j.golpe = Math.max(0, j.golpe - dt);
      const cxj = W / 2, cyj = H * 0.46, R = Math.min(W, H) * 0.3;
      j.letras.forEach((L, k) => {
        L.rad += (R - L.rad) * Math.min(1, dt * 3);
        L.ang += sdt * (0.25 + (j.idx * 0.04));
        L.x = cxj + Math.cos(L.ang) * L.rad * 1.05; L.y = cyj + Math.sin(L.ang) * L.rad * 0.8;
        if (L.temblor) { L.temblor -= dt; L.x += azar(-4, 4); }
      });
      if (j.tiempo <= 0) perderJefe();
    }
    naveX += (naveObjX - naveX) * Math.min(1, dt * 10);
    naveInclina = (naveObjX - naveX) * 3;
  }

  function dibujar(dt) {
    const c = cx;
    c.save();
    if (sacudir > 0) { c.translate(azar(-sacudir, sacudir), azar(-sacudir, sacudir)); sacudir = Math.max(0, sacudir - dt * 60); }
    // Fondo
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, fever ? '#2a0838' : '#0b0620'); g.addColorStop(1, fever ? '#081a3a' : '#120a35');
    c.fillStyle = g; c.fillRect(-20, -20, W + 40, H + 40);
    // Nebulosa
    const ng = c.createRadialGradient(W * 0.7, H * 0.3, 10, W * 0.7, H * 0.3, Math.max(W, H) * 0.6);
    ng.addColorStop(0, fever ? 'rgba(255,43,214,.22)' : 'rgba(124,77,255,.16)'); ng.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = ng; c.fillRect(0, 0, W, H);
    // Estrellas
    const vel = estado === 'jugando' ? (fever ? 520 : 120 + ola * 18) : 40;
    for (const s of estrellas) {
      s.y += (vel * s.z * dt) / H; if (s.y > 1) { s.y = 0; s.x = Math.random(); }
      const brillo = 0.4 + 0.6 * Math.abs(Math.sin(tiempo * 2 + s.t));
      c.fillStyle = `rgba(255,255,255,${brillo * s.z})`;
      const largo = estado === 'jugando' && fever ? 10 * s.z : 0;
      c.fillRect(s.x * W, s.y * H, 1.6 * s.z + 0.4, 1.6 * s.z + 0.4 + largo);
    }

    // Asteroides
    for (const a of asteroides) {
      if (!a.vivo && a.fade <= 0) continue;
      c.save(); c.globalAlpha = a.vivo ? 1 : a.fade; c.translate(a.x, a.y);
      c.save(); c.rotate(a.rot);
      const rg = c.createRadialGradient(-a.r * 0.3, -a.r * 0.3, a.r * 0.1, 0, 0, a.r);
      rg.addColorStop(0, `hsl(${a.hue},60%,46%)`); rg.addColorStop(1, `hsl(${a.hue},55%,18%)`);
      c.fillStyle = rg; c.shadowColor = `hsl(${a.hue},100%,60%)`; c.shadowBlur = 16;
      c.beginPath();
      a.forma.forEach((k, i) => { const an = (i / a.forma.length) * Math.PI * 2; const px = Math.cos(an) * a.r * k, py = Math.sin(an) * a.r * k; i ? c.lineTo(px, py) : c.moveTo(px, py); });
      c.closePath(); c.fill();
      c.shadowBlur = 0; c.strokeStyle = `hsla(${a.hue},100%,75%,.6)`; c.lineWidth = 2; c.stroke();
      c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.arc(a.r * 0.35, a.r * 0.2, a.r * 0.16, 0, 7); c.arc(-a.r * 0.3, a.r * 0.38, a.r * 0.1, 0, 7); c.fill();
      c.restore();
      c.font = '800 17px system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.lineWidth = 4; c.strokeStyle = 'rgba(0,0,0,.65)'; c.strokeText(a.p.en, 0, 1); c.fillStyle = '#fff'; c.fillText(a.p.en, 0, 1);
      // Aviso cuando la correcta está por pasar
      if (a.vivo && a.correcto && a.y > LINEA() - (LINEA() - techo()) * 0.3) { c.strokeStyle = `rgba(255,77,109,${0.5 + 0.5 * Math.sin(tiempo * 18)})`; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, a.r + 8, 0, 7); c.stroke(); }
      c.restore();
    }

    // Jefe
    if (jefe) dibujarJefe(c, dt);

    // Línea de peligro
    if (estado === 'jugando' && !jefe) {
      c.strokeStyle = 'rgba(255,77,109,.35)'; c.setLineDash([8, 10]); c.lineWidth = 2;
      c.beginPath(); c.moveTo(0, LINEA()); c.lineTo(W, LINEA()); c.stroke(); c.setLineDash([]);
    }

    // Láseres
    for (let i = laseres.length - 1; i >= 0; i--) {
      const l = laseres[i]; l.vida -= dt; if (l.vida <= 0) { laseres.splice(i, 1); continue; }
      c.save(); c.globalAlpha = l.vida / 0.18; c.strokeStyle = l.color; c.shadowColor = l.color; c.shadowBlur = 20;
      c.lineWidth = 6; c.beginPath(); c.moveTo(l.x1, l.y1); c.lineTo(l.x2, l.y2); c.stroke();
      c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke(); c.restore();
    }

    // Anillos
    for (let i = anillos.length - 1; i >= 0; i--) {
      const a = anillos[i]; a.t += dt; if (a.t > 0.5) { anillos.splice(i, 1); continue; }
      c.strokeStyle = a.color || '#39ff88'; c.globalAlpha = 1 - a.t / 0.5; c.lineWidth = 4;
      c.beginPath(); c.arc(a.x, a.y, a.r + a.t * 180, 0, 7); c.stroke(); c.globalAlpha = 1;
    }

    // Partículas
    c.globalCompositeOperation = 'lighter';
    for (let i = particulas.length - 1; i >= 0; i--) {
      const p = particulas[i]; p.vida -= dt; if (p.vida <= 0) { particulas.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.96; p.vy *= 0.96;
      c.globalAlpha = p.vida / p.max; c.fillStyle = p.color;
      c.beginPath(); c.arc(p.x, p.y, p.tam, 0, 7); c.fill();
    }
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;

    // Monedas volando al marcador
    for (let i = monedasVuelo.length - 1; i >= 0; i--) {
      const m = monedasVuelo[i]; m.t += dt;
      if (m.t < 0.45) { m.vy += 900 * dt; m.x += m.vx * dt; m.y += m.vy * dt; }
      else { const tx = W - 60, ty = 26; m.x += (tx - m.x) * Math.min(1, dt * 9); m.y += (ty - m.y) * Math.min(1, dt * 9); if (Math.hypot(tx - m.x, ty - m.y) < 18) { monedasVuelo.splice(i, 1); monedasPartida += mods.iman ? 1.5 : 1; SFX.moneda(); continue; } }
      c.save(); c.translate(m.x, m.y); c.scale(Math.abs(Math.cos(m.t * 10)) * 0.8 + 0.2, 1);
      c.fillStyle = '#ffd23f'; c.shadowColor = '#ffd23f'; c.shadowBlur = 10; c.beginPath(); c.arc(0, 0, 7, 0, 7); c.fill();
      c.fillStyle = '#ff9f1c'; c.beginPath(); c.arc(0, 0, 4, 0, 7); c.fill(); c.restore();
    }

    // Nave
    if (estado !== 'menu' || true) {
      const nave = naveActual(), nx = naveX * W, ny = H - (estado === 'menu' ? H * 0.2 : 46);
      if (nave.estela) { estela.push({ x: nx, y: ny + 20, t: 0 }); if (estela.length > 26) estela.shift(); }
      estela.forEach((e, i) => { e.t += dt; e.y += 120 * dt; c.globalAlpha = (i / estela.length) * 0.5; c.fillStyle = nave.c1; c.beginPath(); c.arc(e.x, e.y, 4 * (i / estela.length) + 1, 0, 7); c.fill(); });
      c.globalAlpha = 1;
      dibujarNave(c, nx, ny, estado === 'menu' ? 1.6 : 1.1, nave, naveInclina, tiempo);
      if (escudoActivo) { c.strokeStyle = `rgba(0,229,255,${0.6 + 0.3 * Math.sin(tiempo * 8)})`; c.lineWidth = 3; c.beginPath(); c.arc(nx, ny, 40, 0, 7); c.stroke(); }
    }

    // Textos flotantes
    c.textAlign = 'center'; c.textBaseline = 'middle';
    for (let i = textos.length - 1; i >= 0; i--) {
      const t = textos[i]; t.vida -= dt; if (t.vida <= 0) { textos.splice(i, 1); continue; }
      const k = t.vida / t.max, esc = 1 + (1 - k) * 0.2 + (k > 0.85 ? (k - 0.85) * 3 : 0);
      c.save(); c.globalAlpha = Math.min(1, k * 2); c.translate(t.x, t.y - (1 - k) * 50); c.scale(esc, esc);
      c.font = `900 ${t.tam}px system-ui, sans-serif`; c.lineWidth = 5; c.strokeStyle = 'rgba(0,0,0,.6)'; c.strokeText(t.t, 0, 0);
      c.fillStyle = t.color; c.fillText(t.t, 0, 0); c.restore();
    }

    // Cámara lenta
    if (tiempo < lentoHasta) { c.fillStyle = 'rgba(0,229,255,.07)'; c.fillRect(0, 0, W, H); }
    c.restore();
    if (flash > 0) { c.fillStyle = flashColor; c.globalAlpha = flash; c.fillRect(0, 0, W, H); c.globalAlpha = 1; flash = Math.max(0, flash - dt * 1.6); }
  }

  function dibujarJefe(c) {
    const j = jefe, x = W / 2, y = H * 0.46;
    const ent = Math.max(0, j.entrada);
    // Cuerpo del jefe
    c.save(); c.translate(x, y - ent * 200); const s = 1 + Math.sin(tiempo * 3) * 0.04 + j.golpe;
    c.scale(s, s);
    c.shadowColor = '#ff2bd6'; c.shadowBlur = 30;
    const bg = c.createRadialGradient(0, -10, 6, 0, 0, 62);
    bg.addColorStop(0, '#ff8af0'); bg.addColorStop(1, '#5a0f7a');
    c.fillStyle = bg; c.beginPath(); c.ellipse(0, 0, 66, 46, 0, 0, Math.PI * 2); c.fill();
    c.shadowBlur = 0; c.fillStyle = '#fff';
    const parpadeo = Math.sin(tiempo * 2.3) > 0.97 ? 0.15 : 1;
    [-22, 22].forEach((ox) => { c.beginPath(); c.ellipse(ox, -6, 12, 14 * parpadeo, 0, 0, 7); c.fill(); });
    c.fillStyle = '#1b0f3a'; [-22, 22].forEach((ox) => { c.beginPath(); c.arc(ox + Math.sin(tiempo) * 3, -4, 6 * parpadeo, 0, 7); c.fill(); });
    c.strokeStyle = '#1b0f3a'; c.lineWidth = 4; c.beginPath(); c.arc(0, 18, 14, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke();
    for (let k = -3; k <= 3; k++) { c.fillStyle = '#ff2bd6'; c.beginPath(); c.arc(k * 18, 40 + Math.sin(tiempo * 4 + k) * 4, 6, 0, 7); c.fill(); }
    c.restore();
    // Barra de tiempo
    const ancho = Math.min(W - 40, 360), bx = (W - ancho) / 2, by = H - 100;
    c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(bx, by, ancho, 10);
    const k = Math.max(0, j.tiempo / j.max);
    c.fillStyle = k > 0.35 ? '#39ff88' : '#ff4d6d'; c.shadowColor = c.fillStyle; c.shadowBlur = 12;
    c.fillRect(bx, by, ancho * k, 10); c.shadowBlur = 0;
    c.font = '800 13px system-ui'; c.fillStyle = '#fff'; c.textAlign = 'center'; c.fillText(`⏱ ${Math.ceil(Math.max(0, j.tiempo))} s`, W / 2, by - 10);
    // Letras
    for (const L of j.letras) {
      if (!L.vivo || L.x === undefined) continue;
      c.save(); c.translate(L.x, L.y);
      c.shadowColor = '#00e5ff'; c.shadowBlur = 14; c.fillStyle = 'rgba(20,12,48,.95)'; c.strokeStyle = '#00e5ff'; c.lineWidth = 3;
      c.beginPath(); c.arc(0, 0, L.r, 0, 7); c.fill(); c.stroke(); c.shadowBlur = 0;
      c.fillStyle = '#fff'; c.font = '900 24px system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(L.l, 0, 1);
      c.restore();
    }
  }

  /* ---------------- Entrada ---------------- */
  cv.addEventListener('pointerdown', (e) => {
    audioCtx();
    if (estado !== 'jugando') return;
    const x = e.clientX, y = e.clientY;
    if (jefe) {
      let mejor = null, d0 = 1e9;
      for (const L of jefe.letras) { if (!L.vivo) continue; const d = Math.hypot(L.x - x, L.y - y); if (d < L.r + 14 && d < d0) { d0 = d; mejor = L; } }
      if (mejor) { laseres.push({ x1: naveX * W, y1: H - 78, x2: mejor.x, y2: mejor.y, vida: 0.15, color: '#00e5ff' }); naveObjX = mejor.x / W; SFX.disparo(); tocarLetra(mejor); }
      return;
    }
    let mejor = null, d0 = 1e9;
    for (const a of asteroides) { if (!a.vivo) continue; const d = Math.hypot(a.x - x, a.y - y); if (d < a.r + 12 && d < d0) { d0 = d; mejor = a; } }
    if (mejor) disparar(mejor); else naveObjX = x / W;
  });
  $('pAudio').addEventListener('click', () => objetivo && decir(objetivo));
  $('pwLento').addEventListener('click', () => usarPoder('lento'));
  $('pwBomba').addEventListener('click', () => usarPoder('bomba'));
  $('pwEscudo').addEventListener('click', () => usarPoder('escudo'));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'p') { if (estado === 'jugando') pausar(); else if (estado === 'pausa') seguir(); }
    const n = parseInt(e.key, 10);
    if (estado === 'jugando' && !jefe && n >= 1 && n <= 5) { const vivos = asteroides.filter((a) => a.vivo).sort((a, b) => a.x - b.x); if (vivos[n - 1]) disparar(vivos[n - 1]); }
  });

  /* ---------------- Pantallas ---------------- */
  const pantallas = ['sInicio', 'sMejora', 'sPausa', 'sFin', 'sHangar', 'sCofre', 'sComo'];
  function mostrar(id) { pantallas.forEach((p) => $(p).classList.toggle('oculto', p !== id)); }
  function enJuego(si) { ['hud', 'poderes'].forEach((id) => $(id).classList.toggle('oculto', !si)); if (!si) $('pista').classList.add('oculto'); }

  function asegurarDia() {
    const d = hoy();
    if (!datos.mision || datos.mision.dia !== d) {
      const m = MISIONES[Math.floor(Math.random() * MISIONES.length)];
      datos.mision = { dia: d, tipo: m.tipo, meta: m.meta, t: m.t, prog: 0, hecha: false };
    }
  }
  function pintarInicio() {
    asegurarDia();
    $('iRecord').textContent = datos.record.toLocaleString('es');
    $('iMonedas').textContent = Math.floor(datos.monedas);
    $('iNivel').textContent = nivelXP(datos.xp);
    $('iRacha').textContent = datos.racha.dia === hoy() || datos.racha.dia === ayer() ? datos.racha.n : 0;
    $('iCofrePrecio').textContent = `(${PRECIO_COFRE} 🪙)`;
    $('iNiveles').innerHTML = NIVELES.map((n) => `<button data-n="${n}" class="${n === datos.nivel ? 'sel' : ''}">${n}</button>`).join('');
    const m = datos.mision;
    $('iMision').innerHTML = `🎯 Misión del día: ${esc(m.t)} ${m.hecha ? '✅' : `<b style="float:right">+150 🪙</b>`}<div class="barra"><i style="width:${Math.min(100, (m.prog / m.meta) * 100)}%"></i></div>`;
  }
  $('iNiveles').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; datos.nivel = b.dataset.n; guardar(); pintarInicio(); });

  async function empezar() {
    audioCtx();
    $('btnJugar').disabled = true; $('btnJugar').textContent = 'Cargando palabras…';
    if (!palabras.length || palabras._nivel !== datos.nivel) { palabras = await cargarPalabras(datos.nivel); palabras._nivel = datos.nivel; }
    $('btnJugar').disabled = false; $('btnJugar').textContent = '▶ JUGAR';
    // Precarga de imágenes (las primeras)
    palabras.slice(0, 60).forEach((p) => { if (p.img) { const i = new Image(); i.src = p.img; } });
    ola = 1; preguntaN = 0; puntos = 0; vidas = 3; combo = 0; comboMax = 0; fever = false; feverVeces = 0;
    aciertos = 0; total = 0; monedasPartida = 0; aciertosAudio = 0; jefesVencidos = 0;
    falladas = new Map(); aprendidas = new Map(); mods = {}; poderes = { lento: 1, bomba: 1, escudo: 1 };
    escudoActivo = false; lentoHasta = 0; blindajeUsado = false; jefe = null; recientes = [];
    asteroides = []; particulas = []; textos = []; monedasVuelo = [];
    salirFever();
    mostrar(null); enJuego(true); actualizarHUD(); actualizarPoderes(); comboUI();
    estado = 'jugando';
    banner('OLA 1', '¡a disparar!');
    esperando = 0.9;
  }

  function pausar() { if (estado !== 'jugando') return; estado = 'pausa'; mostrar('sPausa'); }
  function seguir() { estado = 'jugando'; mostrar(null); }

  function finPartida() {
    if (estado === 'fin') return;
    estado = 'fin'; salirFever(); jefe = null; enJuego(false); asteroides = []; $('combo').classList.remove('show');
    monedasPartida += monedasVuelo.length; monedasVuelo = [];
    const monedas = Math.floor(monedasPartida + puntos / 400);
    const xp = Math.round(puntos / 10 + aciertos * 5);
    const nivelAntes = nivelXP(datos.xp);
    const record = puntos > datos.record;
    datos.monedas += monedas; datos.xp += xp; datos.partidas++;
    if (record) datos.record = Math.round(puntos);
    // Racha diaria
    const d = hoy();
    if (datos.racha.dia !== d) { datos.racha = { dia: d, n: datos.racha.dia === ayer() ? datos.racha.n + 1 : 1 }; }
    // Misión
    asegurarDia();
    const m = datos.mision; let misionHecha = false;
    if (!m.hecha) {
      const val = { combo: comboMax, aciertos: m.prog + aciertos, jefe: m.prog + jefesVencidos, ola, fever: m.prog + feverVeces, audio: m.prog + aciertosAudio }[m.tipo];
      m.prog = m.tipo === 'combo' || m.tipo === 'ola' ? Math.max(m.prog, val) : val;
      if (m.prog >= m.meta) { m.hecha = true; datos.monedas += 150; misionHecha = true; }
    }
    const nivelDespues = nivelXP(datos.xp);
    if (nivelDespues > nivelAntes) datos.monedas += 50 * (nivelDespues - nivelAntes);
    guardar();

    $('fPuntos').textContent = '0';
    $('fRecord').innerHTML = record ? '<span class="record">🏆 ¡NUEVO RÉCORD!</span>' : `<span class="sub">Récord: ${datos.record.toLocaleString('es')}</span>`;
    $('fAciertos').textContent = aciertos; $('fTotal').textContent = total; $('fCombo').textContent = comboMax; $('fOla').textContent = ola;
    $('fPremios').innerHTML = `<span class="chip">🪙 +${monedas}</span><span class="chip">⭐ +${xp} XP</span>` +
      (nivelDespues > nivelAntes ? `<span class="chip" style="color:#ffd23f">🎉 ¡Nivel ${nivelDespues}! +${50 * (nivelDespues - nivelAntes)} 🪙</span>` : '') +
      (misionHecha ? '<span class="chip" style="color:#39ff88">🎯 Misión cumplida +150 🪙</span>' : '') +
      (datos.monedas >= PRECIO_COFRE ? '<span class="chip" style="color:#ffd23f">🎁 ¡Puedes abrir un cofre!</span>' : '');
    const item = (p) => `<div class="item">${p.img ? `<img src="${esc(p.img)}" alt="">` : ''}<div><b>${esc(p.en)}</b><span>${esc(p.es)}</span></div><button data-id="${esc(p.id)}">🔊</button></div>`;
    const fall = [...falladas.values()];
    const nuevas = [...aprendidas.values()].filter((p) => !falladas.has(p.id)).slice(0, 12);
    $('fLista').innerHTML = (fall.length ? `<h4>❌ Repasa estas (volverán pronto)</h4>${fall.map(item).join('')}` : '') +
      (nuevas.length ? `<h4>✅ Acertaste</h4>${nuevas.map(item).join('')}` : '');
    $('fLista').classList.toggle('oculto', !fall.length && !nuevas.length);
    mostrar('sFin');
    // Cuenta animada de los puntos
    const meta = Math.round(puntos), t0 = performance.now();
    (function sube(t) { const k = Math.min(1, (t - t0) / 1100); $('fPuntos').textContent = Math.round(meta * (1 - Math.pow(1 - k, 3))).toLocaleString('es'); if (k < 1) requestAnimationFrame(sube); else if (record) SFX.fever(); })(t0);
  }
  $('fLista').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-id]'); if (!b) return;
    const p = palabras.find((x) => String(x.id) === b.dataset.id); if (p) { const v = datos.voz; datos.voz = true; decir(p); datos.voz = v; }
  });

  /* Hangar */
  function miniNave(nave) {
    const c = document.createElement('canvas'); c.width = 120; c.height = 120;
    const k = c.getContext('2d'); dibujarNave(k, 60, 56, 1.4, nave, 0, 0.3);
    return c;
  }
  function pintarHangar() {
    const cont = $('hNaves'); cont.innerHTML = '';
    NAVES.forEach((n) => {
      const tiene = datos.naves.includes(n.id);
      const b = document.createElement('button');
      b.className = 'nave' + (tiene ? '' : ' bloq') + (datos.nave === n.id ? ' sel' : '');
      b.style.setProperty('--c', RAREZAS[n.r].c);
      b.appendChild(miniNave(n));
      const s = document.createElement('small'); s.textContent = tiene ? n.n : RAREZAS[n.r].n; s.style.color = RAREZAS[n.r].c; b.appendChild(s);
      b.onclick = () => { if (!tiene) { toast('🎁 Sale en los cofres'); return; } datos.nave = n.id; guardar(); pintarHangar(); SFX.poder(); };
      cont.appendChild(b);
    });
  }

  /* Cofres */
  let cofreListo = false;
  function abrirCofre() {
    if (datos.monedas < PRECIO_COFRE) { toast(`Necesitas ${PRECIO_COFRE} 🪙 (tienes ${Math.floor(datos.monedas)})`); return; }
    datos.monedas -= PRECIO_COFRE; guardar();
    mostrar('sCofre');
    const anim = $('cofreAnim'); anim.textContent = '🎁'; anim.className = 'tiembla';
    $('cRareza').textContent = 'Abriendo…'; $('cRareza').style.color = '#fff'; $('cTexto').textContent = ''; $('btnCofreOk').classList.add('oculto');
    SFX.cofre();
    cofreListo = false;
    setTimeout(() => {
      // Rareza
      let r = Math.random() * 100, rar = 'comun';
      for (const k of ['legendaria', 'epica', 'rara', 'comun']) { const acc = { legendaria: 2, epica: 12, rara: 40, comun: 100 }[k]; if (r < acc) { rar = k; break; } }
      const candidatas = NAVES.filter((n) => n.r === rar);
      const nueva = elegir(candidatas);
      anim.className = 'abre';
      $('cRareza').textContent = RAREZAS[rar].n; $('cRareza').style.color = RAREZAS[rar].c;
      if (!datos.naves.includes(nueva.id)) {
        datos.naves.push(nueva.id); datos.nave = nueva.id;
        anim.textContent = ''; anim.appendChild(miniNave(nueva)); anim.firstChild.style.cssText = 'position:static;width:150px;height:150px';
        $('cTexto').innerHTML = `¡Nueva nave: <b>${esc(nueva.n)}</b>! Ya la tienes equipada.`;
      } else {
        const reemb = { comun: 40, rara: 80, epica: 160, legendaria: 400 }[rar];
        datos.monedas += reemb; anim.textContent = '🪙';
        $('cTexto').textContent = `Repetida (${nueva.n}): te devolvemos ${reemb} monedas.`;
      }
      SFX.premio(rar); guardar();
      for (let i = 0; i < 40; i++) particulas.push({ x: W / 2, y: H * 0.35, vx: azar(-500, 500), vy: azar(-500, 300), vida: azar(0.6, 1.4), max: 1.4, tam: azar(2, 6), color: RAREZAS[rar].c });
      $('btnCofreOk').classList.remove('oculto'); cofreListo = true;
    }, 1400);
  }

  $('btnJugar').onclick = empezar;
  $('btnOtra').onclick = empezar;
  $('btnMenu').onclick = () => { estado = 'menu'; pintarInicio(); mostrar('sInicio'); };
  $('btnPausa').onclick = pausar;
  $('btnSeguir').onclick = seguir;
  $('btnSalir').onclick = () => { mostrar(null); finPartida(); };
  $('btnSonido').onclick = () => { datos.sonido = !datos.sonido; $('btnSonido').textContent = '🔊 Sonido: ' + (datos.sonido ? 'sí' : 'no'); guardar(); };
  $('btnVoz').onclick = () => { datos.voz = !datos.voz; $('btnVoz').textContent = '🗣️ Leer palabras: ' + (datos.voz ? 'sí' : 'no'); guardar(); };
  $('btnHangar').onclick = () => { pintarHangar(); mostrar('sHangar'); };
  $('btnHangarOk').onclick = () => { pintarInicio(); mostrar('sInicio'); };
  $('btnCofre').onclick = abrirCofre;
  $('btnCofreOk').onclick = () => { if (!cofreListo) return; pintarInicio(); mostrar('sInicio'); };
  $('btnComo').onclick = () => mostrar('sComo');
  $('btnComoOk').onclick = () => mostrar('sInicio');
  document.addEventListener('visibilitychange', () => { if (document.hidden) pausar(); });

  /* ---------------- Arranque ---------------- */
  (async function iniciar() {
    try { const local = JSON.parse(localStorage.getItem('abu-juego4')); if (local) datos = Object.assign(datos, local); } catch { }
    try {
      const r = window.AbuProgreso ? await AbuProgreso.iniciar({ app: 'juego4', redirigir: false }) : null;
      if (r && r.datos) datos = Object.assign(datos, r.datos);
      // Nivel inicial: el del perfil si es la primera vez
      if (r && r.user && !datos.partidas) {
        const { data } = await r.db.from('profiles').select('flujo').eq('id', r.user.id).maybeSingle();
        const n = data && data.flujo && data.flujo.currentNivel;
        if (NIVELES.includes(n)) datos.nivel = n;
      }
    } catch (e) { console.warn('[blaster] sin sesión:', e); }
    $('btnSonido').textContent = '🔊 Sonido: ' + (datos.sonido ? 'sí' : 'no');
    $('btnVoz').textContent = '🗣️ Leer palabras: ' + (datos.voz ? 'sí' : 'no');
    pintarInicio();
    if (!datos.partidas) mostrar('sComo');
    // Precarga en segundo plano
    cargarPalabras(datos.nivel).then((l) => { if (!palabras.length) { palabras = l; palabras._nivel = datos.nivel; } });
  })();
  requestAnimationFrame(bucle);

  // Para pruebas automáticas
  window.__blaster = { get estado() { return estado; }, get asteroides() { return asteroides; }, get jefe() { return jefe; }, get puntos() { return puntos; }, get vidas() { return vidas; }, get ola() { return ola; }, disparar, tocarLetra, terminarOla, fin: finPartida };
})();
