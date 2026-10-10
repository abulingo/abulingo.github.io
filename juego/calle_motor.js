'use strict';

/* ============================================================================
   ENGLISH STREET (Juego 2)  ·  juego/calle_motor.js
   ----------------------------------------------------------------------------
   Una calle que se recorre solo de izquierda a derecha. Cada día aparecen
   6 personajes (Calle.PERSONAJES); al llegar a cada uno empieza un encuentro:
   saludo → palabras nuevas → retos con esas palabras → frase para decir en
   voz alta → despedida. Los retos dependen del personaje y del tipo de
   palabra: pasarle cosas arrastrándolas, contar, tocar partes del cuerpo,
   transformar a Pip, adivinar lo que hace el mimo, poner cosas encima o
   debajo de la mesa, completar frases, escuchar y elegir…

   Usa de motor_base.js: canvas, ctx, $, Voice, Sfx, settings, started,
   makeHuman, aspecto, drawHuman y ACCESORIOS. Guarda el avance en
   progreso_apps con app = 'juego2'.
============================================================================ */
(() => {
  const C = Calle, D = CalleDib;
  const g = ctx;
  const PERS = C.PERSONAJES;
  const CLAVES = Object.keys(PERS);
  CLAVES.forEach(k => { PERS[k].clave = k; });

  const elegirUno = a => a[Math.floor(Math.random() * a.length)];
  const barajar = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const espera = ms => new Promise(r => setTimeout(r, ms));
  const escHTML = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const hoy = () => new Date().toISOString().slice(0, 10);

  /* ======================================================================
     PALABRAS: quién enseña cada una
  ====================================================================== */
  const DUENO = {};
  const POOL = Object.fromEntries(CLAVES.map(k => [k, []]));
  PALABRAS.words.forEach(w => {
    let k = CLAVES.find(c => PERS[c].solo && PERS[c].temas.includes(w.theme) && PERS[c].solo.includes(w.en));
    if (!k) k = C.DUENO_TEMA[w.theme];
    DUENO[w.id] = k;
    POOL[k].push(w);
  });
  // Si un personaje enseña dos temas (casa y preposiciones, deportes y adverbios…), se intercalan
  CLAVES.forEach(k => {
    const temas = [...new Set(POOL[k].map(w => w.theme))];
    if (temas.length < 2) return;
    const pos = new Map();
    temas.forEach(t => { const l = POOL[k].filter(w => w.theme === t); l.forEach((w, i) => pos.set(w, (i + 0.5) / l.length)); });
    POOL[k].sort((a, b) => pos.get(a) - pos.get(b));
  });
  const PORID = PALABRAS.byId;
  const PAL_EN = Object.fromEntries(PALABRAS.words.map(w => [w.en, w]));

  /* ---------- Gramática mínima para armar frases ---------- */
  const PLURAL_EN = new Set(['people', 'children', 'feet', 'teeth', 'clothes', 'jeans', 'pants', 'shorts', 'glasses', 'earrings', 'scissors', 'pajamas',
    'grapes', 'fries', 'beans', 'shoes', 'boots', 'socks', 'gloves', 'stairs', 'parents', 'grandparents', 'leaves', 'flowers', 'windows', 'ducks']);
  const NO_PLURAL = /(bus|gas|news|chess|tennis|glass|class|dress|address|lettuce|bus stop|swimming)$/;
  const esPluralEn = w => PLURAL_EN.has(w.en) || (w.t === 'n' && /[^s]s$/.test(w.en) && !NO_PLURAL.test(w.en));
  const anEn = s => /^(hour|honest)/i.test(s) ? 'an' : /^(uni|use|usu|eu|one|once)/i.test(s) ? 'a' : /^[aeiou]/i.test(s) ? 'an' : 'a';
  const conArt = w => (w.t === 'u' || esPluralEn(w) || w.t !== 'n') ? w.en : `${anEn(w.en)} ${w.en}`;
  const esCorto = w => w.es.split(' / ')[0].replace(/\s*\(.*?\)\s*/g, ' ').replace(/^(el|la|los|las) /, '').trim();
  const FEM = new Set(['mano', 'foto', 'moto', 'radio', 'llave', 'llaves', 'leche', 'carne', 'sal', 'miel', 'nariz', 'piel', 'sangre', 'fiebre', 'tos',
    'flor', 'flores', 'calle', 'nube', 'gente', 'noche', 'tarde', 'clase', 'mujer', 'madre', 'ciudad', 'torre', 'fuente', 'parte', 'nieve', 'imagen',
    'frase', 'pared', 'sartén', 'luz', 'red', 'nuez', 'mente', 'muerte', 'suerte', 'piel', 'sed', 'tarjeta', 'ley', 'cárcel', 'miel', 'leche', 'pijama']);
  const MASC = new Set(['día', 'mapa', 'problema', 'idioma', 'sofá', 'planeta', 'tema', 'programa', 'clima', 'sistema', 'sol', 'papá', 'tranvía', 'cometa']);
  const generoEs = es => { const p = es.split(' ')[0].toLowerCase(); if (MASC.has(p)) return 'm'; if (FEM.has(p) || /(a|as|ión|iones|dad|dades|tad|tud|umbre)$/.test(p)) return 'f'; return 'm'; };
  const esPluralEs = w => esPluralEn(w) && /s$/.test(esCorto(w).split(' ')[0]);
  const artEs = (w, def = true) => {
    const f = generoEs(esCorto(w)) === 'f', pl = esPluralEs(w);
    if (def) return pl ? (f ? 'las' : 'los') : (f ? 'la' : 'el');
    return pl ? (f ? 'unas' : 'unos') : (f ? 'una' : 'un');
  };
  const loEs = w => { const f = generoEs(esCorto(w)) === 'f', pl = esPluralEs(w); return pl ? (f ? 'las' : 'los') : (f ? 'la' : 'lo'); };
  function rellenar(T, w, extra = {}) {
    const r = s => s.replace(/\{w\}/g, w.en).replace(/\{es\}/g, esCorto(w)).replace(/\{el\}/g, artEs(w)).replace(/\{un\}/g, artEs(w, false))
      .replace(/\{lo\}/g, loEs(w)).replace(/\{(\w+)\}/g, (m, k) => extra[k] !== undefined ? extra[k] : m);
    return { en: r(T.en), es: r(T.es) };
  }
  const conNombre = T => ({ en: T.en.replace(/\{nombre\}/g, nombreJugador).replace(/\{saludo\}/g, saludoHora().en), es: T.es.replace(/\{nombre\}/g, nombreJugador).replace(/\{saludoEs\}/g, saludoHora().es) });

  /* ======================================================================
     CÓMO SE VE CADA PALABRA
  ====================================================================== */
  const ESTADO_OBJ = { noche: false, hora: 10, min: 0, clima: 'sunny' };
  const TABLEROS = new Set(['daysBoard', 'monthsBoard', 'seasonsBoard', 'dayPartsBoard', 'clockBoard', 'faceChart', 'bodyChart', 'insideChart', 'signpostA',
    'signpostB', 'turnSign', 'podium', 'subjectsBoard', 'shapesBoard', 'schoolBoard', 'dollhouse', 'mannequinWinter', 'mannequinCasual', 'paintCan']);
  const OBJ_DE = {};
  Object.values(MundoDatos.ESCENAS).forEach(e => (e.items || []).forEach(it => {
    if (!it.palabra || !it.obj || !Obj.O[it.obj] || TABLEROS.has(it.obj)) return;
    [].concat(it.palabra).join(',').split(',').forEach(p => { if (p && !OBJ_DE[p]) OBJ_DE[p] = it.obj; });
  }));
  Object.assign(OBJ_DE, { 'T-shirt': 'tshirt', size: 'sizeTag', price: 'priceTag', dog: 'dogObj', cat: 'catObj', flower: 'flowerPot' });
  function objDe(w) {
    if (OBJ_DE[w.en]) return OBJ_DE[w.en];
    const c = w.en.replace(/[ -](\w)/g, (_, a) => a.toUpperCase());
    return Obj.O[c] && !TABLEROS.has(c) ? c : null;
  }
  const COLOR_HEX = { red: '#e53935', blue: '#1e88e5', green: '#43a047', yellow: '#fdd835', orange: '#fb8c00', purple: '#8e24aa', pink: '#f06292',
    brown: '#795548', black: '#212121', white: '#fafafa', gray: '#9e9e9e', gold: '#d4af37', silver: '#c0c0c0', light: '#90caf9', dark: '#0d47a1' };
  const FORMAS = new Set(['circle', 'triangle', 'line']);
  const A = Animales;
  const ANIMALES = {
    dog: [70, 50, (g, x, y, t) => A.dog(g, x - 6, y, '#a1887f', t, 'stand')], cat: [46, 32, (g, x, y, t) => A.cat(g, x - 6, y, '#ff9800', t)],
    duck: [40, 34, (g, x, y, t) => A.duck(g, x, y, t)], chicken: [40, 40, (g, x, y, t) => A.chicken(g, x, y, t)],
    cow: [96, 70, (g, x, y, t) => A.quad(g, x - 10, y, t, 1, 'cow')], horse: [96, 84, (g, x, y, t) => A.quad(g, x - 10, y, t, 1, 'horse')],
    pig: [72, 44, (g, x, y, t) => A.quad(g, x - 6, y, t, 1, 'pig')], sheep: [74, 56, (g, x, y, t) => A.quad(g, x - 6, y, t, 1, 'sheep')],
    bird: [36, 30, (g, x, y, t) => A.bird(g, x, y - 14, t)]
  };
  const PERSONAS = new Set(Object.keys(MundoDatos.ROLES));
  const HUMANOS = new Map();
  function humanoRol(rol) {
    if (HUMANOS.has(rol)) return HUMANOS.get(rol);
    const info = MundoDatos.ROLES[rol] || ['n'];
    const semilla = 'rol:' + rol + ':' + (progreso ? progreso.avatar.seed : '');
    const R = Gen.makeRand(semilla);
    let sexo = info[0]; if (sexo === 'n') sexo = R.chance(0.5) ? 'f' : 'm';
    const h = makeHuman(semilla, ['de pie', 'saludo'], aspecto(R, sexo, info[3] || 'adulto', rol));
    h.acc = MundoDatos.ROPA[rol] && MundoDatos.ROPA[rol].acc;
    HUMANOS.set(rol, h);
    return h;
  }
  function dibujarPersonaRol(g, rol, x, y, t) {
    const h = humanoRol(rol);
    drawHuman(g, h, x, y, { pose: 'de pie' });
    if (h.acc) D.accesorio(g, h.acc, x, y - h.alto * 1.02, h.alto);
  }
  const VIS = new Map();
  function visual(w) {
    if (VIS.has(w.id)) return VIS.get(w.id);
    let v;
    const o = objDe(w);
    if (w.theme === 'colors' && COLOR_HEX[w.en]) { const c = COLOR_HEX[w.en]; v = { w: 36, h: 60, d: (g, x, y) => D.bote(g, x, y, c, w.en === 'gold' || w.en === 'silver') }; }
    else if (FORMAS.has(w.en)) v = { w: 54, h: 54, d: (g, x, y) => D.forma(g, x, y, w.en) };
    else if (w.t === 'm' && w.value) v = { w: 62, h: 56, d: (g, x, y) => D.numero(g, x, y, w.value) };
    else if (ANIMALES[w.en]) { const a = ANIMALES[w.en]; v = { w: a[0], h: a[1], d: a[2] }; }
    else if (o) { const ob = Obj.O[o]; v = { w: ob.w, h: ob.h, d: (g, x, y, t) => Obj.draw(g, o, x, y, t, ESTADO_OBJ) }; }
    else if (PERSONAS.has(w.en)) v = { w: 44, h: 108, d: (g, x, y, t) => dibujarPersonaRol(g, w.en, x, y, t) };
    else v = { w: 56, h: 58, d: (g, x, y, t) => D.tarjeta(g, x, y, w.icon || '❓', t) };
    v.dibujable = !!(o || ANIMALES[w.en] || COLOR_HEX[w.en] || FORMAS.has(w.en) || PERSONAS.has(w.en));
    VIS.set(w.id, v);
    return v;
  }
  // Foto enmarcada de una persona (la abuela)
  function visualFoto(w) {
    const rol = PERSONAS.has(w.en) ? w.en : null;
    return { w: 74, h: 100, dibujable: true, d: (g, x, y, t) => D.marco(g, x, y - 6, 62, 84, gg => {
      if (rol) { gg.save(); gg.translate(x, y + 18); gg.scale(0.78, 0.78); dibujarPersonaRol(gg, rol, 0, 0, t); gg.restore(); }
      else Obj.emoji(gg, w.icon || '📷', x, y - 48, 34);
    }) };
  }
  const escalaPara = (v, max, maxH) => clamp(Math.min(max / v.w, (maxH || max * 1.2) / v.h), 0.3, 1.6);

  /* ======================================================================
     ESTADO
  ====================================================================== */
  let W = 0, H = 0, DPR = 1;
  let progreso = null, nombreJugador = 'Alex';
  let modo = 'intro';            // intro · caminar · encuentro · resumen
  let mundo = null;              // { semilla, est: [], decor: [], burbujas: [], finX }
  let actual = null;             // estación del encuentro en curso
  let items = [];
  let tarea = null;              // reto de canvas activo (entrega, toca, contar, pon, cuerpo, parte)
  let vitrina = null;            // lo que se muestra en grande: { tipo: 'pip'|'cuerpo'|'reloj'|'pizarra'|'clima'|'parte'|'mimo', … }
  let particulas = [], textos = [];
  let combo = 0, mejorCombo = 0, erroresEnc = 0;
  let hoyNuevas = 0, hoyEstrellas = 0;
  const cam = { x: 0, k: 1, suelo: 400, listo: false };
  const jugador = { x: 0, h: null, mov: false, objetivo: null, accion: null };
  const teclas = {};
  let pip = D.pipEstado(null), pipObj = D.pipEstado(null);
  let ahora = 0;

  function baseProgreso() {
    return { v: 1, dia: 1, ruta: null, paso: 0, palabras: {}, xp: 0, visitas: {}, ultimaVisita: {}, estrellas: {}, racha: { ultima: null, dias: 0 },
      stats: { aciertos: 0, errores: 0, habladas: 0, encuentros: 0, mejorCombo: 0 }, avatar: { seed: Gen.randomSeed(), sexo: Math.random() < 0.5 ? 'f' : 'm' },
      traduccion: true, lento: false, mudo: false, fin: false };
  }
  function normalizar(s) {
    const b = baseProgreso(); s = s || {};
    const p = { ...b, ...s, stats: { ...b.stats, ...(s.stats || {}) }, racha: { ...b.racha, ...(s.racha || {}) }, avatar: { ...b.avatar, ...(s.avatar || {}) } };
    Object.keys(p.palabras).forEach(id => { if (!PORID[id]) delete p.palabras[id]; });
    return p;
  }
  function guardar() {
    if (!progreso) return;
    settings.slow = progreso.lento; settings.mute = progreso.mudo;
    if (window.AbuProgreso) AbuProgreso.guardar(progreso);
  }
  const vista = w => !!progreso.palabras[w.id];
  const totalVistas = () => Object.keys(progreso.palabras).length;
  const nivel = xp => Math.floor(Math.sqrt(xp / 40)) + 1;
  const xpNivel = n => (n - 1) * (n - 1) * 40;

  /* ======================================================================
     VOZ: hablar (texto a voz) y escuchar (reconocimiento)
  ====================================================================== */
  let ultimaVoz = { txt: '', tono: 1 };
  function hablar(texto, tono = 1, rate) {
    ultimaVoz = { txt: texto, tono };
    return new Promise(res => {
      if (!Voice.ok || !texto) { res(); return; }
      try { speechSynthesis.cancel(); } catch { /* nada */ }
      const u = new SpeechSynthesisUtterance(texto.replace(/[_]{2,}/g, ' blank ').replace(/[^\p{L}\p{N}\s.,!?'’:;-]/gu, ''));
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
  const NUMS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen',
    'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
  function normalizarFrase(s) {
    return ' ' + s.toLowerCase().replace(/[’`]/g, "'")
      .replace(/\bi'm\b/g, 'i am').replace(/\b(it|that|what|there|he|she|let)'s\b/g, '$1 is').replace(/'re\b/g, ' are').replace(/'ll\b/g, ' will')
      .replace(/n't\b/g, ' not').replace(/'ve\b/g, ' have').replace(/'d\b/g, ' would').replace(/\bcan not\b/g, 'cannot')
      .replace(/\b(\d+)\b/g, (m, n) => NUMS[+n] || m).replace(/[^a-z\s']/g, ' ').replace(/\s+/g, ' ') + ' ';
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
  // 0..1: cuántas palabras de la frase objetivo se oyeron (con tolerancia a errores pequeños)
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
  const SEP = 1200, X0 = 760, PARADA = 270;
  function pendientes(k) { return POOL[k].filter(w => !vista(w)).length; }
  function armarRuta() {
    if (progreso.dia === 1 && !totalVistas()) return C.PRIMER_DIA.slice();
    const conNuevas = CLAVES.filter(k => pendientes(k) > 0);
    const puntaje = k => {
      const dias = progreso.dia - (progreso.ultimaVisita[k] || 0);
      return (pendientes(k) > 0 ? 3 : 0) + Math.min(dias, 6) + Math.random() * 1.5 + (progreso.visitas[k] ? 0 : 4);
    };
    let ruta = [];
    if (conNuevas.includes('vecina')) ruta.push('vecina');
    const resto = (conNuevas.length >= C.POR_DIA ? conNuevas : CLAVES).filter(k => !ruta.includes(k));
    resto.sort((a, b) => puntaje(b) - puntaje(a));
    ruta = ruta.concat(resto.slice(0, C.POR_DIA - ruta.length));
    // Si ya casi no quedan palabras nuevas, se completa con personajes para repasar
    if (ruta.length < C.POR_DIA) ruta = ruta.concat(barajar(CLAVES.filter(k => !ruta.includes(k))).slice(0, C.POR_DIA - ruta.length));
    return [ruta[0]].concat(barajar(ruta.slice(1)));
  }
  function crearNPC(ch, semilla) {
    const R = Gen.makeRand(semilla);
    const rol = ch.ropa ? '__' : ch.rol;
    const ap = aspecto(R, ch.sexo, ch.edad, rol, { ropa: ch.ropa });
    if (ch.ropa && ch.ropa.glasses) ap.glasses = ch.ropa.glasses;
    const h = makeHuman(semilla, ['de pie', 'saludo', 'brazos arriba', 'manos en cintura'], ap);
    return { h, acc: ch.acc || (MundoDatos.ROPA[ch.rol] && MundoDatos.ROPA[ch.rol].acc), habla: 0, globo: null, celebra: 0, accion: null };
  }
  function crearMundo() {
    const semilla = progreso.avatar.seed + ':dia' + progreso.dia;
    const R = Gen.makeRand(semilla);
    const est = progreso.ruta.map((k, i) => {
      const ch = PERS[k], x = X0 + i * SEP;
      const e = D.ESC[ch.escena];
      return { i, x, ch, esc: e, npc: crearNPC(ch, 'npc:' + k + ':' + progreso.avatar.seed), npcX: x + e.npc, npcY: e.npcY || 0, hecho: i < progreso.paso };
    });
    // Adornos entre encuentros: árboles, farolas y cosas que se pueden tocar para oír su nombre
    const COSAS = [['bench2', 'bench'], ['trashCan', 'trash can'], ['flowerBedObj', 'flower'], ['catObj', 'cat'], ['dogObj', 'dog'],
      ['newsStand', 'news'], ['icecreamCart', 'ice cream'], ['birdhouse', 'bird'], ['busScheduleObj', 'schedule'], ['hydrant', null], ['balloon', null]];
    const decor = [];
    const tramos = [[-420, X0 - PARADA - 120]];
    est.forEach((s, i) => tramos.push([s.x + 300, (est[i + 1] ? est[i + 1].x - PARADA - 120 : s.x + 300 + 760)]));
    tramos.forEach(([a, b]) => {
      for (let x = a + 40; x < b - 40; x += R.range(150, 230)) {
        const r = R();
        if (r < 0.32) decor.push({ tipo: 'arbol', x, R: Gen.makeRand(semilla + x) });
        else if (r < 0.48) decor.push({ tipo: 'farola', x });
        else { const [obj, pal] = R.pick(COSAS); decor.push({ tipo: 'obj', x, obj, w: pal && PAL_EN[pal] }); }
      }
    });
    const finX = est[est.length - 1].x + 300 + 820;
    const burbujas = [];
    mundo = { semilla, est, decor, burbujas, finX };
    ponerBurbujas();
  }
  // Burbujas de repaso flotando entre un encuentro y el siguiente
  function ponerBurbujas() {
    mundo.burbujas = [];
    const vistas = PALABRAS.words.filter(vista);
    if (vistas.length < 3) return;
    const orden = vistas.slice().sort((a, b) => {
      const pa = progreso.palabras[a.id], pb = progreso.palabras[b.id];
      return (pb[1] - pb[0] * 0.5) - (pa[1] - pa[0] * 0.5) + (Math.random() - 0.5) * 2;
    });
    let i = 0;
    mundo.est.forEach((s, k) => {
      if (k < progreso.paso - 1) return;
      const a = s.x + 360, b = (mundo.est[k + 1] ? mundo.est[k + 1].x - PARADA - 140 : mundo.finX - 200);
      for (let n = 0; n < 2 && i < orden.length; n++, i++) mundo.burbujas.push({ w: orden[i], x: a + (b - a) * (n + 0.5) / 2, y: -150 - n * 40, fase: Math.random() * 6, rota: 0 });
    });
  }
  function crearJugador() {
    const R = Gen.makeRand('yo:' + progreso.avatar.seed);
    const ap = aspecto(R, progreso.avatar.sexo, 'joven', 'person');
    jugador.h = makeHuman('yo:' + progreso.avatar.seed, ['de pie', 'saludo', 'brazos arriba', 'manos en cintura'], ap);
  }
  const estSiguiente = () => mundo.est.find(s => !s.hecho);
  function limiteDerecho() { const s = estSiguiente(); return s ? s.x - PARADA : mundo.finX; }

  /* ======================================================================
     CÁMARA Y PANTALLA
  ====================================================================== */
  function medir() {
    W = innerWidth; H = innerHeight; DPR = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
  }
  addEventListener('resize', medir);
  const acostado = matchMedia('(max-height: 520px) and (orientation: landscape)');
  function objetivoCamara() {
    const dlg = $('dlg');
    const abierto = !dlg.classList.contains('oculto');
    // Con el celular acostado el diálogo ocupa la derecha: la escena se centra en lo que queda
    const lateral = abierto && acostado.matches ? dlg.offsetWidth + 16 : 0;
    const dlgH = abierto && !lateral ? dlg.offsetHeight : 0;
    const abajo = modo === 'caminar' ? Math.max(lateral ? 70 : 96, H * 0.16) : Math.max(dlgH + 18, H * 0.1);
    const suelo = H - abajo;
    const anchoUtil = W - lateral;
    const ancho = modo === 'encuentro' ? (anchoUtil < 500 ? 450 : anchoUtil < 640 ? 500 : 640) : (anchoUtil < 640 ? 520 : 820);
    const k = clamp(Math.min(anchoUtil / ancho, (suelo - (lateral ? 20 : 70)) / 330), 0.3, 2.3);
    let x = jugador.x + (W / k) * 0.16;
    if (modo === 'encuentro' && actual) x = actual.x - 70 + lateral / 2 / k;
    return { x, k, suelo };
  }
  function moverCamara(dt) {
    const o = objetivoCamara();
    if (!cam.listo) { Object.assign(cam, o); cam.listo = true; return; }
    const f = Math.min(1, dt * 4);
    cam.x += (o.x - cam.x) * f; cam.k += (o.k - cam.k) * f; cam.suelo += (o.suelo - cam.suelo) * f;
  }
  const aMundo = (px, py) => ({ x: cam.x + (px - W / 2) / cam.k, y: (py - cam.suelo) / cam.k });
  const aPantalla = (x, y) => ({ x: (x - cam.x) * cam.k + W / 2, y: cam.suelo + y * cam.k });

  /* ======================================================================
     DIBUJO
  ====================================================================== */
  function avanceDia() {
    if (!mundo) return 0;
    const a = mundo.est[0].x - PARADA - 200, b = mundo.finX;
    return clamp((jugador.x - a) / (b - a), 0, 1);
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
    // casa del jugador al inicio y al final del día
    dibujarCasaJugador(-260, t, false);
    dibujarCasaJugador(mundo.finX + 60, t, true);
    mundo.decor.forEach(d => { if (d.x > x0 - 200 && d.x < x1 + 200) dibujarDecor(d, t, p); });
    mundo.est.forEach(s => { if (s.x + 420 > x0 && s.x - 420 < x1) dibujarEstacion(s, t); });
    mundo.burbujas.forEach(b => { if (b.x > x0 - 60 && b.x < x1 + 60) dibujarBurbuja(b, t); });
    items.forEach(it => { if (it.vis && it !== arrastre.item) dibujarItem(it, t); });
    if (actual) dibujarVitrinaFrente(actual);
    dibujarJugador(t);
    if (arrastre.item) dibujarItem(arrastre.item, t);
    particulas.forEach(q => { g.globalAlpha = clamp(q.vida / q.max, 0, 1); if (q.txt) Obj.text(g, q.txt, q.x, q.y, q.tam, q.c); else Obj.circle(g, q.x, q.y, q.r, q.c); });
    g.globalAlpha = 1;
    textos.forEach(q => {
      g.globalAlpha = clamp(q.vida / 0.4, 0, 1);
      g.font = `900 ${q.tam}px system-ui, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.lineWidth = q.tam / 5; g.strokeStyle = 'rgba(0,0,0,.45)'; g.strokeText(q.txt, q.x, q.y); g.fillStyle = q.c; g.fillText(q.txt, q.x, q.y);
    });
    g.globalAlpha = 1;
    if (modo === 'caminar') dibujarFlecha(t);
  }
  // La casa del jugador: de ahí sale por la mañana y ahí termina el día
  function dibujarCasaJugador(x, t, fin) {
    Obj.rect(g, x - 110, -190, 220, 190, '#ffe0b2'); Obj.poly(g, [[x - 126, -190], [x, -262], [x + 126, -190]], '#e65100');
    Obj.rr(g, x - 24, -100, 48, 100, 4, '#6d4c41'); Obj.circle(g, x + 14, -50, 3, '#ffd54f');
    D.letrero(g, x, -222, 110, 30, 'HOME', '#fff8e1', '#e65100');
    if (fin) { g.globalAlpha = 0.5 + Math.sin(t * 3) * 0.3; Obj.circle(g, x, -140, 20, '#fff59d'); g.globalAlpha = 1; Obj.text(g, '⭐', x, -140, 18, '#f9a825'); }
  }
  function dibujarDecor(d, t, p) {
    if (d.tipo === 'arbol') D.arbol(g, d.x, -2, Gen.makeRand(mundo.semilla + d.x), t);
    else if (d.tipo === 'farola') D.farola(g, d.x, -2, p > 0.82);
    else Obj.draw(g, d.obj, d.x, -2, t, ESTADO_OBJ);
    if (d.w && d.brillo > 0) { g.globalAlpha = d.brillo; Obj.text(g, d.w.en, d.x, -((Obj.O[d.obj] || { h: 60 }).h) - 18, 15, '#fff'); g.globalAlpha = 1; }
  }
  function dibujarBurbuja(b, t) {
    if (b.rota > 1) return;
    const y = b.y + Math.sin(t * 1.6 + b.fase) * 10;
    const r = 30 * (1 + b.rota * 0.6);
    g.globalAlpha = 1 - b.rota;
    Obj.circle(g, b.x, y, r, 'rgba(255,255,255,0.55)'); Obj.ring(g, b.x, y, r, 'rgba(255,255,255,0.95)', 2.5);
    Obj.ell(g, b.x - r * 0.35, y - r * 0.4, r * 0.25, r * 0.14, 'rgba(255,255,255,.9)', -0.6);
    Obj.emoji(g, b.w.icon || '💬', b.x, y, 26);
    g.globalAlpha = 1;
  }
  function dibujarFlecha(t) {
    const lim = limiteDerecho();
    if (lim - jugador.x < 60 && estSiguiente()) return;
    const x = jugador.x + 70 + Math.sin(t * 5) * 6;
    Obj.poly(g, [[x, -150], [x + 22, -138], [x, -126]], 'rgba(255,122,0,.9)');
  }
  function dibujarEstacion(s, t) {
    const ch = s.ch, e = s.esc;
    const tipoTarea = tarea && actual === s ? tarea.tipo : (vitrina && actual === s ? vitrina.tipo : null);
    e.atras(g, s.x, t, ch, tipoTarea);
    dibujarNPC(s, t);
    e.frente(g, s.x, t, ch, tipoTarea);
    if (actual === s && vitrina) dibujarVitrina(s, t);
    if (s.hecho) Obj.text(g, '✅', s.npcX, s.npcY - s.npc.h.alto * 1.25 - 26, 22, '#43a047');
    else if (actual !== s && s === estSiguiente()) {
      const y = s.npcY - s.npc.h.alto * 1.2 - 36 + Math.sin(t * 4) * 5;
      Obj.circle(g, s.npcX, y, 16, '#ff7a00'); Obj.text(g, '!', s.npcX, y + 1, 20, '#fff');
    }
    const gl = s.npc.globo;
    if (gl && gl.hasta > ahora) globo(s.npcX, s.npcY - s.npc.h.alto * 1.12 - 30, gl.txt, gl.c);
  }
  function globo(x, y, txt, c = '#ffffff') {
    g.font = '800 15px system-ui, sans-serif';
    const w = Math.min(260, g.measureText(txt).width + 22), hh = 30;
    Obj.rr(g, x - w / 2, y - hh, w, hh, 12, c);
    Obj.poly(g, [[x - 8, y - 1], [x + 8, y - 1], [x + 2, y + 10]], c);
    g.fillStyle = '#263238'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, x, y - hh / 2, w - 12);
  }
  const ARRIBA = new Set(['jump', 'fly', 'win', 'climb', 'dance', 'catch', 'throw', 'wake up', 'stand', 'become', 'grow', 'hope', 'love', 'enjoy', 'laugh', 'sing', 'smile', 'begin', 'start', 'finish', 'hug']);
  const SALUDA = new Set(['wave', 'call', 'say', 'tell', 'speak', 'talk', 'ask', 'meet', 'invite', 'show', 'explain', 'teach', 'agree', 'give', 'bring', 'send',
    'share', 'sell', 'pay', 'borrow', 'help', 'touch', 'knock', 'open', 'close', 'push', 'pull', 'hold', 'carry', 'cut', 'draw', 'paint', 'write', 'wash',
    'sweep', 'fix', 'build', 'break', 'cook', 'eat', 'drink', 'put', 'take', 'use', 'turn', 'choose', 'buy', 'feed', 'kiss', 'stop', 'get', 'make', 'save', 'spend']);
  const CAMINA = new Set(['walk', 'run', 'go', 'come', 'move', 'travel', 'arrive', 'leave', 'cross', 'ride', 'drive', 'swim', 'visit', 'return', 'follow']);
  const TUMBA = new Set(['sleep', 'rest', 'relax', 'fall']);
  function animVerbo(en, t) {
    if (TUMBA.has(en)) return { pose: 'de pie', rot: en === 'fall' ? Math.sin(t * 2) * 0.3 + 1.2 : Math.PI / 2, dy: -12 };
    if (ARRIBA.has(en)) return { pose: 'brazos arriba', lift: en === 'dance' || en === 'laugh' ? Math.abs(Math.sin(t * 8)) * 6 : Math.abs(Math.sin(t * 5)) * 22, sway: en === 'dance' ? Math.sin(t * 4) * 0.14 : 0 };
    if (CAMINA.has(en)) return { moving: true, vel: en === 'run' ? 18 : 9 };
    if (SALUDA.has(en)) return { pose: 'saludo', fase: true };
    if (en === 'cry' || en === 'forget' || en === 'lose') return { pose: 'manos en cintura', sway: Math.sin(t * 6) * 0.05 };
    return { pose: 'manos en cintura', lift: Math.abs(Math.sin(t * 2)) * 4 };
  }
  function dibujarHumanoAnim(h, x, y, t, an, acc) {
    if (an.moving) h.walkP.phase = t * an.vel;
    if (an.fase && h.poses.saludo) h.poses.saludo.p.phase = t * 3;
    const lift = an.lift || 0;
    drawHuman(g, h, x, y + (an.dy || 0), { pose: an.pose || 'de pie', moving: !!an.moving, lift, sway: an.sway || 0, rot: an.rot || 0 });
    if (acc && !an.rot) D.accesorio(g, acc, x, y - lift - h.alto * 1.02, h.alto);
  }
  function dibujarNPC(s, t) {
    const n = s.npc, h = n.h, x = s.npcX, y = s.npcY;
    let an = { pose: 'de pie' };
    if (n.accion) an = animVerbo(n.accion.en, t);
    else if (n.celebra > 0) an = { pose: 'brazos arriba', lift: Math.abs(Math.sin(t * 7)) * 14 };
    else if (n.habla > 0) { an = { pose: 'saludo', fase: true }; }
    else if (s.hecho) an = { pose: 'saludo', fase: true };
    dibujarHumanoAnim(h, x, y, t, an, n.acc);
    if (n.accion) {   // burbuja de pensamiento del mimo con el icono de la acción
      const by = y - h.alto * 1.25 - 40;
      Obj.circle(g, x + 16, y - h.alto * 1.08, 4, '#fff'); Obj.circle(g, x + 24, y - h.alto * 1.16, 6, '#fff');
      Obj.ell(g, x + 40, by, 30, 24, '#fff'); Obj.emoji(g, n.accion.icono, x + 40, by, 28);
    }
  }
  function dibujarJugador(t) {
    const h = jugador.h; if (!h) return;
    const ac = jugador.accion;
    if (ac && ac.hasta > ahora) {
      dibujarHumanoAnim(h, jugador.x, 0, t, animVerbo(ac.en, t));
      const by = -h.alto * 1.25 - 34;
      Obj.ell(g, jugador.x + 36, by, 26, 22, '#fff'); Obj.emoji(g, ac.icono, jugador.x + 36, by, 24);
      return;
    }
    const celebra = jugador.celebra > ahora;
    drawHuman(g, h, jugador.x, 0, { moving: jugador.mov, pose: celebra ? 'brazos arriba' : 'de pie', lift: celebra ? Math.abs(Math.sin(t * 7)) * 12 : 0 });
    if (modo === 'caminar' && !jugador.mov && jugador.x < 30 && progreso.paso === 0) globo(jugador.x, -h.alto * 1.12 - 20, '▶  ¡Camina!', '#fff3e0');
  }
  function easeBack(p) { const c = 1.7; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); }
  function dibujarItem(it, t) {
    const s = it.s * easeBack(clamp(it.pop, 0, 1));
    if (s <= 0.01) return;
    g.save();
    g.translate(it.x + (it.sacudir > 0 ? Math.sin(t * 50) * 4 * it.sacudir : 0), it.y);
    if (it.brillo > 0) { g.globalAlpha = 0.35 + Math.sin(t * 5) * 0.15; Obj.circle(g, 0, -it.v.h * s / 2, Math.max(it.v.w, it.v.h) * s / 2 + 12, '#fff59d'); g.globalAlpha = 1; }
    g.scale(s, s);
    it.v.d(g, 0, 0, t);
    g.restore();
    if (it.etiqueta) Obj.text(g, it.etiqueta, it.x, it.y + 14, 13, '#263238');
  }

  /* ---------- Vitrina: lo que se ve en grande durante un reto ---------- */
  function vitrinaPos(s) { const v = s.esc.vitrina || [-110, -30]; return { x: s.x + v[0], y: v[1] }; }
  function dibujarVitrina(s, t) {
    const v = vitrina, p = vitrinaPos(s);
    if (v.tipo === 'pip') {
      Obj.rr(g, p.x - 46, -60, 92, 30, 6, '#ffd54f'); Obj.rr(g, p.x - 36, -30, 72, 30, 4, '#ffb300');
      D.pip(g, p.x, -60, t, pip);
      if (v.destello > ahora) for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + t * 3; Obj.text(g, '✦', p.x + Math.cos(a) * 70, -120 + Math.sin(a) * 60, 18, '#ffd600'); }
    } else if (v.tipo === 'cuerpo') {
      Obj.rr(g, p.x - 95, -268, 190, 270, 10, 'rgba(255,255,255,.85)');
      Obj.text(g, 'YOU', p.x, -252, 14, '#00838f');
      g.save(); g.translate(p.x, 0); g.scale(v.esc, v.esc); drawHuman(g, jugador.h, 0, 0, { pose: 'de pie' }); g.restore();
      if (v.marca) { const ez = escZonas(), [zx, zy, zr] = v.marca; g.globalAlpha = 0.5 + Math.sin(t * 6) * 0.3; Obj.ring(g, p.x + zx * ez, zy * ez, (zr + 2) * ez, '#ff1744', 4); g.globalAlpha = 1; }
      if (v.toque && v.toque.hasta > ahora) Obj.circle(g, v.toque.x, v.toque.y, 7, v.toque.ok ? '#43a047' : '#e53935');
    } else if (v.tipo === 'reloj') {
      D.reloj(g, p.x, v.y || -170, 70, v.h, v.m, true);
      if (v.icono) Obj.emoji(g, v.icono, p.x + 95, (v.y || -170) - 60, 30);
    } else if (v.tipo === 'pizarra') {
      D.pizarra(g, p.x, v.y || -175, v.txt, t);
    } else if (v.tipo === 'clima') {
      D.clima(g, v.clima, s.x, t);
    } else if (v.tipo === 'parte') {
      const o = Obj.O[v.obj];
      g.save(); g.translate(p.x, v.y); g.scale(v.esc, v.esc); o.d(g, t, ESTADO_OBJ); g.restore();
      if (v.marca) { const [bx, by, bw, bh] = v.marca; g.globalAlpha = 0.45 + Math.sin(t * 6) * 0.3; g.strokeStyle = '#ff1744'; g.lineWidth = 4 / cam.k; g.strokeRect(p.x + bx * v.esc, v.y + by * v.esc, bw * v.esc, bh * v.esc); g.globalAlpha = 1; }
    } else if (v.tipo === 'pon') {
      const P = v.P;
      Obj.draw(g, 'table', s.x + (P.t0 + P.t1) / 2, 0, t, ESTADO_OBJ, (P.t1 - P.t0) / 100);
      D.cajaAbierta(g, s.x + P.b0, s.x + P.b1, P.btop, false);
    } else if (v.tipo === 'bolsa') {
      D.bolsa(g, v.x, v.y, v.n);
    }
  }
  function dibujarVitrinaFrente(s) {
    if (vitrina && vitrina.tipo === 'pon') { const P = vitrina.P; D.cajaAbierta(g, s.x + P.b0, s.x + P.b1, P.btop, true); }
  }

  /* ======================================================================
     PARTÍCULAS Y PREMIOS
  ====================================================================== */
  function chispas(x, y, n = 14, cols = ['#ffd600', '#ff7043', '#66bb6a', '#42a5f5', '#ec407a']) {
    for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = 80 + Math.random() * 160; particulas.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, r: 3 + Math.random() * 3, c: elegirUno(cols), vida: 0.9, max: 0.9 }); }
  }
  function confeti() {
    const s = actual || { x: jugador.x };
    for (let i = 0; i < 70; i++) particulas.push({ x: s.x - 260 + Math.random() * 520, y: -420 - Math.random() * 120, vx: (Math.random() - 0.5) * 60, vy: 60 + Math.random() * 120, r: 3 + Math.random() * 3, c: elegirUno(['#ffd600', '#ff7043', '#66bb6a', '#42a5f5', '#ec407a', '#ab47bc']), vida: 2.6, max: 2.6, sinGrav: true });
  }
  function flotante(txt, x, y, c = '#ffd600', tam = 22) { textos.push({ txt, x, y, c, tam, vida: 1.3 }); }
  function ganarXP(n, x, y) {
    const antes = nivel(progreso.xp);
    progreso.xp += n;
    if (x !== undefined) flotante('+' + n + ' XP', x, y, '#ffd600', 18);
    if (nivel(progreso.xp) > antes) { Sfx.level(); banner(`🎉 ¡Nivel ${nivel(progreso.xp)}!`, 'Level up!'); }
    hud();
  }
  function acierto(x, y) {
    combo++; mejorCombo = Math.max(mejorCombo, combo);
    progreso.stats.aciertos++; progreso.stats.mejorCombo = Math.max(progreso.stats.mejorCombo, combo);
    Sfx.collect(combo); Sfx.ok();
    ganarXP(5 + Math.min(combo - 1, 10), x, y);
    if (combo >= 3) mostrarCombo();
  }
  function fallo() { combo = 0; erroresEnc++; progreso.stats.errores++; Sfx.bad(); mostrarCombo(); }
  function marcarPalabra(w, ok) {
    const e = progreso.palabras[w.id] || (progreso.palabras[w.id] = [0, 0, progreso.dia]);
    if (ok) e[0]++; else e[1]++;
  }
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
    $('hDia').textContent = 'Día ' + progreso.dia;
    $('hPal').textContent = `${totalVistas()}/${PALABRAS.words.length}`;
    $('hEst').textContent = Object.values(progreso.estrellas).reduce((s, v) => s + v, 0);
    $('hRacha').textContent = progreso.racha.dias || 0;
    if (mundo) $('hRuta').innerHTML = mundo.est.map(s => `<span class="${s.hecho ? 'ok' : s === estSiguiente() ? 'cur' : ''}" title="${escHTML(s.ch.nombre)}">${s.ch.emoji}</span>`).join('');
    $('btnTrad').classList.toggle('off', !progreso.traduccion);
    $('btnLento').classList.toggle('off', !progreso.lento);
    $('btnMudo').textContent = progreso.mudo ? '🔇' : '🔊';
    document.body.classList.toggle('sin-es', !progreso.traduccion);
  }

  /* ======================================================================
     CUADRO DE DIÁLOGO
  ====================================================================== */
  let turno = 0;               // cada pantalla nueva invalida los botones de la anterior
  let teclaOps = [], teclaSig = null;
  function dlgPersonaje(ch) {
    $('dEmoji').textContent = ch.emoji; $('dNombre').textContent = ch.nombre;
    $('dTitulo').textContent = `${ch.titulo.en} · ${ch.titulo.es}`;
    $('dlg').style.setProperty('--c', ch.color);
  }
  function dlgPasos(hechos, total) { $('dPasos').innerHTML = Array.from({ length: total }, (_, i) => `<i class="${i < hechos ? 'on' : ''}"></i>`).join(''); }
  function dlgLimpiar() {
    turno++;
    $('dOps').innerHTML = ''; $('dOps').className = '';
    $('dSig').classList.add('oculto'); $('dMic').classList.add('oculto'); $('dSaltar').classList.add('oculto');
    $('dOido').textContent = ''; $('dPalabra').classList.add('oculto'); $('dPista').textContent = '';
    teclaOps = []; teclaSig = null;
  }
  function dlgLinea(linea, cfg = {}) {
    $('dlg').classList.remove('oculto');
    $('dEn').innerHTML = cfg.html || escHTML(linea ? linea.en : '');
    $('dEn').classList.toggle('escondido', !!cfg.esconder);
    $('dEs').textContent = linea && linea.es ? linea.es : '';
    $('dEn').classList.toggle('grande', !!cfg.grande);
  }
  function dlgPalabra(w, nueva) {
    const el = $('dPalabra'); el.classList.remove('oculto');
    el.innerHTML = `<span class="ico">${w.icon || ''}</span><span><b>${escHTML(w.en)}</b><small>${escHTML(w.es)}</small></span>${nueva ? '<span class="chip">✨ New word</span>' : '<span class="chip rep">🔁 Repaso</span>'}`;
  }
  function esperarSiguiente(txt = 'Continuar ▶') {
    const b = $('dSig'); b.textContent = txt; b.classList.remove('oculto');
    const mi = turno;
    return new Promise(res => {
      const ir = () => { if (mi !== turno) return; b.classList.add('oculto'); teclaSig = null; res(); };
      b.onclick = ir; teclaSig = ir;
    });
  }
  // El personaje dice algo y se espera a que el jugador siga
  async function dice(ch, linea, cfg = {}) {
    dlgLimpiar(); dlgLinea(linea, cfg);
    npcHabla(linea.en);
    const voz = hablar(linea.en, ch.tono);
    if (cfg.sinEspera) return voz;
    await esperarSiguiente(cfg.boton);
  }
  function npcHabla(txt) { if (actual) actual.npc.habla = Math.min(4, 0.8 + txt.length * 0.06); }
  function npcGlobo(txt, c) { if (actual) actual.npc.globo = { txt, c, hasta: ahora + 2.2 }; }
  async function reaccionBien(ch) {
    const r = elegirUno(C.BIEN);
    npcGlobo(r.en, '#e8f5e9'); if (actual) actual.npc.celebra = 1.2;
    await Promise.race([hablar(r.en, ch.tono), espera(1300)]);
  }
  function reaccionMal(ch, linea) {
    const r = linea || elegirUno(C.MAL);
    npcGlobo(r.en, '#ffebee');
    hablar(r.en, ch.tono);
    $('dPista').textContent = r.es;
  }

  /* ---------- Elegir entre opciones (con botones o con la voz) ----------
     opciones: [{ en, es, ok, icono }] · cfg: { esconder, sinEs, alElegir, voz, grande, html, columnas } */
  function elegir(ch, linea, opciones, cfg = {}) {
    dlgLimpiar(); dlgLinea(linea, cfg);
    if (linea && !cfg.mudo) { npcHabla(linea.en); hablar(cfg.decirEn || linea.en, ch.tono); }
    const mi = turno;
    const cont = $('dOps'); cont.className = cfg.columnas === 1 ? 'una' : cfg.iconos ? 'iconos' : '';
    let errores = 0, ocupado = false;
    return new Promise(resolve => {
      const botones = opciones.map((op, i) => {
        const b = document.createElement('button'); b.className = 'op';
        b.innerHTML = `<span class="n">${i + 1}</span>${op.icono ? `<span class="ico">${op.icono}</span>` : ''}<span class="t">${op.en ? `<b>${escHTML(op.en)}</b>` : ''}${op.es && !cfg.sinEs ? `<small>${escHTML(op.es)}</small>` : ''}</span>`;
        b.onclick = () => escoger(op, b);
        cont.appendChild(b); return b;
      });
      teclaOps = botones;
      async function escoger(op, b) {
        if (ocupado || mi !== turno || b.disabled) return;
        ocupado = true;
        if (op.en && cfg.decirOpcion !== false) hablar(op.en, 1);
        if (cfg.alElegir) await cfg.alElegir(op);
        if (mi !== turno) return;
        if (op.ok) {
          b.classList.add('bien'); botones.forEach(x => { x.disabled = true; });
          if (errores === 0) acierto(); else { Sfx.ok(); combo = 1; }
          if (cfg.palabra) marcarPalabra(cfg.palabra, errores === 0);
          if (cfg.despues) await cfg.despues(op);
          else await reaccionBien(ch);
          resolve({ errores });
        } else {
          errores++; fallo(); b.classList.add('mal'); b.disabled = true;
          reaccionMal(ch, cfg.mal ? cfg.mal(op) : null);
          if (cfg.palabra && errores === 1) marcarPalabra(cfg.palabra, false);
          ocupado = false;
        }
      }
      // Responder hablando
      if (SR && cfg.voz !== false && opciones.some(o => o.en)) {
        const m = $('dMic'); m.classList.remove('oculto'); m.textContent = '🎤 Dilo';
        m.onclick = async () => {
          if (ocupado || mi !== turno) return;
          m.classList.add('escuchando'); m.textContent = '👂 Escuchando…';
          const dichos = await escucharVoz();
          m.classList.remove('escuchando'); m.textContent = '🎤 Dilo';
          if (mi !== turno) return;
          if (dichos === null) { toast('🎤 Permite el micrófono para responder hablando'); return; }
          if (!dichos.length) { $('dOido').textContent = '🤔 No te escuché. Intenta otra vez.'; return; }
          let mejor = -1, idx = -1;
          opciones.forEach((o, i) => { if (!o.en || botones[i].disabled) return; const p = parecido(dichos, o.en); if (p > mejor) { mejor = p; idx = i; } });
          $('dOido').textContent = `👂 "${dichos[0]}"`;
          if (mejor >= 0.6) { progreso.stats.habladas++; ganarXP(3); escoger(opciones[idx], botones[idx]); }
          else $('dOido').textContent = `👂 "${dichos[0]}" — no se parece a ninguna. ¡Otra vez!`;
        };
      }
    });
  }

  /* ======================================================================
     RETOS EN EL CANVAS
  ====================================================================== */
  const arrastre = { item: null, dx: 0, dy: 0, px: 0, py: 0, movio: false };
  function mesaAbs(s = actual) { const m = s.esc.mesa; return [s.x + m[0], s.x + m[1], m[2]]; }
  function limpiarItems() { items = []; tarea = null; arrastre.item = null; }
  // Pone cosas en la mesa del personaje, repartidas
  function colocar(lista, cfg = {}) {
    const [a, b, y] = mesaAbs();
    const n = lista.length, paso = (b - a) / n;
    const max = cfg.max || Math.min(70, paso - 6);
    return lista.map((p, i) => {
      const v = p.v || (cfg.foto ? visualFoto(p) : visual(p));
      const s = cfg.escala || escalaPara(v, max, cfg.maxH || 74);
      return nuevoItem(p.w || p, v, a + paso * (i + 0.5), y, s, { arrastrable: !!cfg.arrastrable, pop: -i * 0.12 });
    });
  }
  function nuevoItem(w, v, x, y, s, extra) {
    const it = Object.assign({ w, v, x, y, s, hx: x, hy: y, pop: 0, vis: true, arrastrable: false, brillo: 0, sacudir: 0, vuelo: null }, extra);
    items.push(it); return it;
  }
  function cajaItem(it) {
    const pad = 12 / cam.k, s = it.s;
    return { x0: it.x - it.v.w * s / 2 - pad, x1: it.x + it.v.w * s / 2 + pad, y0: it.y - it.v.h * s - pad, y1: it.y + pad };
  }
  function itemEn(x, y) {
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i]; if (!it.vis || it.vuelo) continue;
      const c = cajaItem(it); if (x >= c.x0 && x <= c.x1 && y >= c.y0 && y <= c.y1) return it;
    }
    return null;
  }
  function volar(it, x, y, dur = 0.45, fin) { it.vuelo = { x0: it.x, y0: it.y, x1: x, y1: y, t: 0, dur, fin }; }
  function volverACasa(it) { volar(it, it.hx, it.hy, 0.3); it.sacudir = 1; }
  const sobreNPC = (x, y) => actual && x > actual.npcX - 70 && x < actual.npcX + 70 && y > -170 && y < 30;

  // «Pásame el …»: arrastrar la cosa correcta hasta el personaje
  function retoEntrega(ch, w, cfg = {}) {
    const opciones = barajar([w].concat(distractores(w, cfg.n || 3, cfg.filtro || (x => visual(x).dibujable === visual(w).dibujable))));
    limpiarItems();
    const its = colocar(opciones, { arrastrable: true });
    const linea = cfg.linea || rellenar(elegirUno(ch.pide || PIDE), w);
    dlgLimpiar(); dlgLinea(linea);
    $('dPista').textContent = `👉 Arrastra la cosa hasta ${ch.nombre}. Toca una cosa para oír su nombre.`;
    npcHabla(linea.en); hablar(linea.en, ch.tono);
    oirOtraVez = () => hablar(linea.en, ch.tono);
    let errores = 0;
    return new Promise(res => {
      tarea = {
        tipo: 'entrega',
        tocar(it) { hablar(it.w.en, 1); it.brillo = 0.6; setTimeout(() => { it.brillo = 0; }, 600); },
        soltar(it, x, y) {
          if (!sobreNPC(x, y)) { volverACasa(it); it.sacudir = 0; return; }
          if (it.w === w) {
            tarea = null;
            volar(it, actual.npcX + 14, -52, 0.3, () => { it.vis = false; chispas(actual.npcX, -80); });
            if (errores === 0) acierto(actual.npcX, -150); else Sfx.ok();
            marcarPalabra(w, errores === 0);
            reaccionBien(ch).then(() => { its.forEach(i => { i.vis = false; }); res({ errores }); });
          } else {
            errores++; fallo(); volverACasa(it);
            if (errores === 1) marcarPalabra(w, false);
            const art = it.w.t === 'n' && !esPluralEn(it.w) ? `${anEn(it.w.en)} ${it.w.en}` : it.w.en;
            reaccionMal(ch, { en: `No, that's ${art}. I need the ${w.en}.`, es: `No, eso es: ${esCorto(it.w)}. Necesito: ${esCorto(w)}.` });
          }
        }
      };
    });
  }
  // Tocar la cosa correcta entre varias (animales, letreros, fotos…)
  function retoToca(ch, w, linea, cfg = {}) {
    const opciones = cfg.opciones || barajar([w].concat(distractores(w, cfg.n || 3, cfg.filtro)));
    limpiarItems();
    const its = colocar(opciones, { foto: cfg.foto, maxH: cfg.maxH });
    dlgLimpiar(); dlgLinea(linea, { esconder: cfg.esconder });
    $('dPista').textContent = cfg.pista || '👆 Toca la respuesta en la escena.';
    npcHabla(linea.en); hablar(cfg.decir || linea.en, ch.tono);
    oirOtraVez = () => hablar(cfg.decir || linea.en, ch.tono);
    let errores = 0;
    return new Promise(res => {
      tarea = {
        tipo: 'toca',
        tocar(it) {
          if (it.w === w) {
            tarea = null; it.brillo = 1; chispas(it.x, it.y - it.v.h * it.s / 2);
            if (errores === 0) acierto(it.x, it.y - 90); else Sfx.ok();
            marcarPalabra(w, errores === 0);
            hablar(w.en, 1);
            reaccionBien(ch).then(() => { its.forEach(i => { i.vis = false; }); res({ errores }); });
          } else {
            errores++; fallo(); it.sacudir = 1; setTimeout(() => { it.sacudir = 0; }, 400);
            if (errores === 1) marcarPalabra(w, false);
            reaccionMal(ch, { en: `No, that's ${conArt(it.w)}.`, es: `No, eso es: ${esCorto(it.w)}.` });
          }
        }
      };
    });
  }
  // Contar: meter n cosas en la bolsa (panadera)
  function retoContar(ch, w) {
    const n = +w.value;
    const cosa = elegirUno(['cookie', 'bread', 'apple', 'cake', 'candy'].map(e => PAL_EN[e]).filter(Boolean));
    limpiarItems();
    const [a, b, y] = mesaAbs();
    const total = Math.max(n + 2, 6), porFila = Math.ceil(total / 2), paso = (b - a - 50) / porFila;
    const v = visual(cosa), s = escalaPara(v, Math.min(40, paso - 2), 34);
    const its = [];
    for (let i = 0; i < total; i++) { const fila = Math.floor(i / porFila), col = i % porFila; its.push(nuevoItem(cosa, v, a + paso * (col + 0.5), y - fila * 36, s, { pop: -i * 0.05 })); }
    const bolsa = { tipo: 'bolsa', x: b - 18, y, n: 0 };
    vitrina = bolsa;
    const plural = cosa.en === 'bread' ? 'pieces of bread' : cosa.en === 'candy' ? 'candies' : cosa.en + 's';
    const uno = cosa.en === 'bread' ? 'piece of bread' : cosa.en;
    const linea = n === 1 ? { en: `I need one ${uno}, please. Put it in the bag.`, es: `Necesito ${artEs(cosa, false)} ${esCorto(cosa)}, por favor. Ponlo en la bolsa.` }
      : { en: `I need ${w.en} ${plural}, please. Put them in the bag.`, es: `Necesito ${esCorto(w)} (${n}), por favor. Ponlos en la bolsa.` };
    dlgLimpiar(); dlgLinea(linea);
    $('dPista').textContent = '👆 Toca cada cosa para meterla en la bolsa y luego pulsa «Listo».';
    npcHabla(linea.en); hablar(linea.en, ch.tono);
    oirOtraVez = () => hablar(linea.en, ch.tono);
    let errores = 0;
    const dentro = [];
    const mi = turno;
    return new Promise(res => {
      tarea = {
        tipo: 'contar',
        tocar(it) {
          if (dentro.includes(it)) return;
          dentro.push(it); bolsa.n = dentro.length;
          volar(it, bolsa.x, bolsa.y - 30, 0.3, () => { it.vis = false; });
          hablar(NUMS[dentro.length] || String(dentro.length), 1.1, 1);
          Sfx.collect(dentro.length);
        }
      };
      const ops = $('dOps'); ops.className = 'una';
      const listo = document.createElement('button'); listo.className = 'op principal'; listo.innerHTML = '<span class="t"><b>✔ Listo</b><small>Ya puse todo</small></span>';
      const vaciar = document.createElement('button'); vaciar.className = 'op'; vaciar.innerHTML = '<span class="t"><b>↺ Vaciar la bolsa</b></span>';
      ops.append(listo, vaciar);
      const reiniciar = () => { dentro.forEach(it => { it.vis = true; it.x = it.hx; it.y = it.hy; it.vuelo = null; }); dentro.length = 0; bolsa.n = 0; };
      vaciar.onclick = () => { if (mi === turno) reiniciar(); };
      listo.onclick = () => {
        if (mi !== turno) return;
        if (dentro.length === n) {
          tarea = null; vitrina = null; acierto(actual.npcX, -150); if (errores) combo = 1; marcarPalabra(w, errores === 0);
          reaccionBien(ch).then(() => { its.forEach(i => { i.vis = false; }); res({ errores }); });
        } else {
          errores++; fallo(); if (errores === 1) marcarPalabra(w, false);
          reaccionMal(ch, { en: `Hmm, that's ${NUMS[dentro.length] || dentro.length}. I need ${w.en}.`, es: `Mmm, esos son ${dentro.length}. Necesito ${n}.` });
          reiniciar();
        }
      };
    });
  }
  // Tocar una parte del cuerpo en tu propio personaje, en grande (enfermera)
  const ZONAS = {
    hair: [[0, -98.5, 4]], head: [[0, -91, 9]], face: [[0, -86.5, 6]], eye: [[-3.6, -88, 2.2], [3.6, -88, 2.2]], ear: [[-8.6, -87, 2.6], [8.6, -87, 2.6]],
    nose: [[0, -85.2, 2]], mouth: [[0, -82.4, 2.4]], chin: [[0, -80, 2.2]], neck: [[0, -77.3, 2.6]], shoulder: [[-10.5, -74.5, 3.6], [10.5, -74.5, 3.6]],
    chest: [[0, -68.5, 5.5]], arm: [[-13.5, -64, 4], [13.5, -64, 4]], stomach: [[0, -58, 5.5]], hand: [[-13.2, -43.2, 3.6], [13.2, -43.2, 3.6]],
    finger: [[-13.5, -39.6, 2.4], [13.5, -39.6, 2.4]], leg: [[-5, -33, 4.5], [5, -33, 4.5], [-5, -13, 4], [5, -13, 4]], knee: [[-5, -24, 3.2], [5, -24, 3.2]],
    foot: [[-6, -2.5, 4], [6, -2.5, 4]], feet: [[-6, -2.5, 4], [6, -2.5, 4]], toe: [[-8.5, -1.6, 2.4], [8.5, -1.6, 2.4]]
  };
  // Escala del dibujo grande del cuerpo y de sus zonas (el avatar no siempre mide 100)
  const ESC_CUERPO = 2.45;
  const escZonas = () => ESC_CUERPO * jugador.h.alto / 100;
  function retoCuerpo(ch, w) {
    const esc = ESC_CUERPO, ez = escZonas();
    limpiarItems();
    vitrina = { tipo: 'cuerpo', esc, marca: null };
    const plural = w.en === 'feet';
    const linea = elegirUno([
      { en: `Touch your ${w.en}, please.`, es: `Toca tu ${esCorto(w)}, por favor.` },
      { en: `Where ${plural ? 'are' : 'is'} your ${w.en}? Touch ${plural ? 'them' : 'it'}!`, es: `¿Dónde ${plural ? 'están tus' : 'está tu'} ${esCorto(w)}? ¡Toca!` }
    ]);
    dlgLimpiar(); dlgLinea(linea);
    $('dPista').textContent = '👆 Toca la parte del cuerpo en el dibujo grande.';
    npcHabla(linea.en); hablar(linea.en, ch.tono);
    oirOtraVez = () => hablar(linea.en, ch.tono);
    const p = vitrinaPos(actual);
    let errores = 0;
    return new Promise(res => {
      tarea = {
        tipo: 'cuerpo',
        tocarLibre(x, y) {
          const ux = (x - p.x) / ez, uy = y / ez;
          const dist = (zs) => Math.min(...zs.map(([zx, zy, zr]) => Math.hypot(ux - zx, uy - zy) - zr));
          if (ux < -30 || ux > 30 || uy < -110 || uy > 5) return;
          const ok = dist(ZONAS[w.en]) < 2.2;
          vitrina.toque = { x, y, ok, hasta: ahora + 0.6 };
          if (ok) {
            tarea = null; chispas(x, y);
            if (errores === 0) acierto(x, y - 40); else Sfx.ok();
            marcarPalabra(w, errores === 0); hablar(w.en, 1);
            vitrina.marca = ZONAS[w.en][0];
            reaccionBien(ch).then(() => res({ errores }));
          } else {
            errores++; fallo(); if (errores === 1) marcarPalabra(w, false);
            let cerca = null, dm = 99;
            Object.entries(ZONAS).forEach(([k, zs]) => { const d = dist(zs); if (d < dm && PAL_EN[k]) { dm = d; cerca = k; } });
            if (cerca && dm < 3) reaccionMal(ch, { en: `No, that's your ${cerca}. Find your ${w.en}!`, es: `No, eso es: ${esCorto(PAL_EN[cerca])}. ¡Busca: ${esCorto(w)}!` });
            else reaccionMal(ch);
          }
        }
      };
    });
  }
  // Tocar una zona de un tablero de English Town (días, meses, casa de muñecas, letreros…)
  function retoParte(ch, w, obj, linea, cfg = {}) {
    const o = Obj.O[obj];
    const p = vitrinaPos(actual);
    const esc = Math.min(1.3, 280 / o.w, 230 / o.h);
    limpiarItems();
    vitrina = { tipo: 'parte', obj, esc, y: cfg.y || 0, marca: null };
    dlgLimpiar(); dlgLinea(linea);
    $('dPista').textContent = cfg.pista || '👆 Toca la respuesta en el tablero.';
    npcHabla(linea.en); hablar(linea.en, ch.tono);
    oirOtraVez = () => hablar(linea.en, ch.tono);
    let errores = 0;
    return new Promise(res => {
      tarea = {
        tipo: 'parte',
        tocarLibre(x, y) {
          const ux = (x - p.x) / esc, uy = (y - vitrina.y) / esc;
          let hit = null, area = Infinity;
          Object.entries(o.partes).forEach(([k, [bx, by, bw, bh]]) => {
            if (ux >= bx - 3 && ux <= bx + bw + 3 && uy >= by - 3 && uy <= by + bh + 3 && bw * bh < area) { hit = k; area = bw * bh; }
          });
          if (!hit) return;
          if (hit === w.en) {
            tarea = null; vitrina.marca = o.partes[hit]; chispas(x, y);
            if (errores === 0) acierto(x, y - 40); else Sfx.ok();
            marcarPalabra(w, errores === 0); hablar(w.en, 1);
            reaccionBien(ch).then(() => res({ errores }));
          } else {
            errores++; fallo(); if (errores === 1) marcarPalabra(w, false);
            const otra = PAL_EN[hit];
            reaccionMal(ch, otra ? { en: `No, that's ${hit}.`, es: `No, eso es: ${esCorto(otra)}.` } : null);
          }
        }
      };
    });
  }
  // Preposiciones: arrastrar la pelota encima, debajo, al lado… (Sam)
  const PREP = {
    on: ['on the table', 'sobre la mesa'], under: ['under the table', 'debajo de la mesa'], below: ['below the table', 'debajo de la mesa'],
    above: ['above the table', 'encima de la mesa (en el aire)'], over: ['over the table', 'por encima de la mesa (en el aire)'],
    'next to': ['next to the table', 'al lado de la mesa'], near: ['near the table', 'cerca de la mesa'], in: ['in the box', 'dentro de la caja'],
    into: ['into the box', 'dentro de la caja'], between: ['between the table and the box', 'entre la mesa y la caja']
  };
  function relaciones(P, x, y) {
    const r = new Set();
    const enT = x > P.t0 + 4 && x < P.t1 - 4;
    if (x > P.b0 + 4 && x < P.b1 - 4 && y > P.btop - 30) { r.add('in'); r.add('into'); return r; }
    if (enT && y < P.ttop - 60) { r.add('above'); r.add('over'); }
    else if (enT && y <= P.ttop + 14) r.add('on');
    else if (enT) { r.add('under'); r.add('below'); }
    const dT = x < P.t0 ? P.t0 - x : x > P.t1 ? x - P.t1 : 0;
    if (!enT && dT < 75) r.add('next to');
    if (!r.has('on') && !r.has('above') && dT < 150) r.add('near');
    if (x > P.t1 + 4 && x < P.b0 - 4) r.add('between');
    return r;
  }
  function retoPon(ch, w) {
    const P = { t0: -205, t1: -95, ttop: -55, b0: -45, b1: 15, btop: -44 };
    limpiarItems();
    vitrina = { tipo: 'pon', P };
    const bola = PAL_EN.ball;
    const it = nuevoItem(bola, visual(bola), actual.x + 50, 0, 1.2, { arrastrable: true });
    const [en, es] = PREP[w.en];
    const linea = { en: `Please put the ball ${en}.`, es: `Por favor, pon la pelota ${es}.` };
    dlgLimpiar(); dlgLinea(linea);
    $('dPista').textContent = '👉 Arrastra la pelota al lugar correcto.';
    npcHabla(linea.en); hablar(linea.en, ch.tono);
    oirOtraVez = () => hablar(linea.en, ch.tono);
    let errores = 0;
    return new Promise(res => {
      tarea = {
        tipo: 'pon',
        tocar() { hablar('ball', 1); },
        soltar(item, x, y) {
          const rx = x - actual.x;
          const r = relaciones(P, rx, y);
          // la pelota cae al suelo si no queda en la mesa, en la caja o en el aire
          let ny = y;
          if (r.has('on')) ny = P.ttop; else if (r.has('in')) ny = P.btop + 26; else if (!r.has('above')) ny = 0;
          item.x = x; item.y = ny; item.hx = x; item.hy = ny;
          if (r.has(w.en)) {
            tarea = null; chispas(x, ny - 20);
            if (errores === 0) acierto(x, ny - 60); else Sfx.ok();
            marcarPalabra(w, errores === 0);
            reaccionBien(ch).then(() => { it.vis = false; vitrina = null; res({ errores }); });
          } else if (rx < P.t0 - 160 || rx > P.b1 + 120) {
            volar(item, actual.x + 50, 0, 0.3);
          } else {
            errores++; fallo(); if (errores === 1) marcarPalabra(w, false);
            const donde = ['on', 'under', 'in', 'above', 'between', 'next to', 'near'].find(k => r.has(k));
            if (donde) reaccionMal(ch, { en: `No, now the ball is ${PREP[donde][0]}. I said ${en}.`, es: `No, ahora la pelota está ${PREP[donde][1]}. Dije: ${es}.` });
            else reaccionMal(ch);
          }
        }
      };
    });
  }

  /* ======================================================================
     ELEGIR LAS DISTRACCIONES
  ====================================================================== */
  function distractores(w, n, filtro) {
    const dueno = DUENO[w.id];
    const ok = x => x !== w && x.en !== w.en && (x.icon !== w.icon || !x.icon) && (!filtro || filtro(x));
    let cands = POOL[dueno].filter(x => ok(x) && x.t === w.t);
    const vistas = cands.filter(vista);
    let lista = barajar(vistas).concat(barajar(cands.filter(x => !vista(x))));
    if (lista.length < n) lista = lista.concat(barajar(PALABRAS.words.filter(x => ok(x) && x.theme === w.theme && !lista.includes(x))));
    if (lista.length < n) lista = lista.concat(barajar(PALABRAS.words.filter(x => ok(x) && x.t === w.t && !lista.includes(x))));
    return lista.slice(0, n);
  }

  /* ======================================================================
     RETOS CON OPCIONES
  ====================================================================== */
  const PIDE = [{ en: 'Can you hand me the {w}, please?', es: '¿Me pasas {el} {es}, por favor?' }, { en: 'Please give me the {w}.', es: 'Por favor, dame {el} {es}.' }];
  const opPalabra = (x, ok) => ({ en: x.en, es: esCorto(x), ok });
  const opSignificado = (x, ok) => ({ en: '', es: x.es, ok, icono: '' });

  function retoSignificado(ch, w) {
    const ops = barajar([w].concat(distractores(w, 2))).map(x => ({ en: x.es, es: '', ok: x === w }));
    return elegir(ch, { en: `What does "${w.en}" mean?`, es: `¿Qué significa «${w.en}»?` }, ops, { palabra: w, voz: false, decirEn: w.en, decirOpcion: false, columnas: 1 });
  }
  function retoEscucha(ch, w) {
    const ops = barajar([w].concat(distractores(w, 2))).map(x => opPalabra(x, x === w));
    oirOtraVez = () => hablar(w.en, ch.tono, 0.8);
    return elegir(ch, { en: '🔊 Listen! Which word do you hear?', es: '🔊 ¡Escucha! ¿Qué palabra oyes?' }, ops,
      { palabra: w, decirEn: w.en, sinEs: true, voz: false, decirOpcion: false });
  }
  function retoQueEs(ch, w) {
    limpiarItems();
    const v = visual(w), [a, b, y] = mesaAbs();
    nuevoItem(w, v, (a + b) / 2, y, escalaPara(v, 110, 110), { brillo: 0.6 });
    const ops = barajar([w].concat(distractores(w, 2))).map(x => opPalabra(x, x === w));
    return elegir(ch, elegirUno([{ en: "What's this?", es: '¿Qué es esto?' }, { en: 'Do you know what this is?', es: '¿Sabes qué es esto?' }]), ops, { palabra: w, sinEs: true })
      .then(r => { limpiarItems(); return r; });
  }
  // Frase con un hueco
  function huecoDe(w) {
    if (!w.exEn) return null;
    const re = new RegExp(`\\b${w.en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return re.test(w.exEn) ? re : null;
  }
  function retoHueco(ch, w) {
    const re = huecoDe(w);
    if (!re) return retoSignificado(ch, w);
    const frase = w.exEn.replace(re, '_____');
    const ops = barajar([w].concat(distractores(w, 2, x => x.t === w.t))).map(x => opPalabra(x, x === w));
    return elegir(ch, { en: frase, es: w.exEs }, ops, { palabra: w, sinEs: true, mudo: true, decirOpcion: false,
      despues: async () => { $('dEn').textContent = w.exEn; await Promise.race([hablar(w.exEn, ch.tono), espera(2600)]); } });
  }
  // Ordenar las palabras de una frase
  function retoOrdena(ch, w) {
    const frase = w.exEn;
    const piezas = frase.replace(/[.!?]$/, '').split(' ');
    if (piezas.length < 3 || piezas.length > 8) return retoHueco(ch, w);
    dlgLimpiar(); dlgLinea({ en: '🧩 Put the words in order', es: w.exEs });
    hablar(frase, ch.tono);
    oirOtraVez = () => hablar(frase, ch.tono);
    const mi = turno;
    let errores = 0;
    const armado = [];
    const ops = $('dOps'); ops.className = 'fichas';
    const linea = document.createElement('div'); linea.className = 'armado';
    const banco = document.createElement('div'); banco.className = 'banco';
    ops.append(linea, banco);
    let orden = barajar(piezas.map((p, i) => ({ p, i })));
    if (orden.every((o, i) => o.i === i)) orden = orden.reverse();
    return new Promise(res => {
      orden.forEach(o => {
        const b = document.createElement('button'); b.className = 'ficha'; b.textContent = o.p;
        b.onclick = () => {
          if (mi !== turno || b.disabled) return;
          const sig = piezas[armado.length];
          if (o.p === sig) {
            armado.push(o.p); b.disabled = true; b.classList.add('puesta'); Sfx.touch();
            const s = document.createElement('span'); s.textContent = o.p; linea.appendChild(s);
            if (armado.length === piezas.length) {
              if (errores === 0) acierto(); else { Sfx.ok(); combo = 1; }
              marcarPalabra(w, errores === 0);
              reaccionBien(ch).then(() => res({ errores }));
            }
          } else {
            errores++; fallo(); b.classList.add('mal'); setTimeout(() => b.classList.remove('mal'), 400);
            if (errores === 1) marcarPalabra(w, false);
          }
        };
        banco.appendChild(b);
      });
    });
  }
  // Decir una frase en voz alta
  async function retoDecir(ch, frase) {
    dlgLimpiar();
    dlgLinea({ en: frase.en, es: frase.es }, { grande: true });
    $('dPista').textContent = SR ? '🎤 Toca «Hablar» y dilo en inglés.' : '🗣️ Repite la frase en voz alta y luego toca «Ya lo dije».';
    npcGlobo('Your turn! Say it!', '#fff8e1');
    await hablar(`Say: ${frase.en}`, ch.tono);
    oirOtraVez = () => hablar(frase.en, ch.tono, 0.8);
    const mi = turno;
    return new Promise(res => {
      const ops = $('dOps'); ops.className = 'una';
      const bHab = document.createElement('button'); bHab.className = 'op principal';
      bHab.innerHTML = SR ? '<span class="t"><b>🎤 Hablar</b><small>Toca y di la frase</small></span>' : '<span class="t"><b>✔ Ya lo dije</b><small>Lo repetí en voz alta</small></span>';
      const bOir = document.createElement('button'); bOir.className = 'op'; bOir.innerHTML = '<span class="t"><b>🔊 Escuchar despacio</b></span>';
      const bSal = document.createElement('button'); bSal.className = 'op'; bSal.innerHTML = '<span class="t"><b>⏭ Ahora no puedo hablar</b></span>';
      ops.append(bHab, bOir, bSal);
      let intentos = 0;
      const terminar = async ok => {
        if (ok) { progreso.stats.habladas++; Sfx.mission(); ganarXP(SR ? 15 : 5, jugador.x, -150); chispas(jugador.x, -120, 20); jugador.celebra = ahora + 1.5; }
        await reaccionBien(ch); res();
      };
      bOir.onclick = () => hablar(frase.en, ch.tono, 0.7);
      bSal.onclick = () => { if (mi === turno) { turno++; res(); } };
      bHab.onclick = async () => {
        if (mi !== turno) return;
        if (!SR) { turno++; terminar(true); return; }
        bHab.classList.add('escuchando'); bHab.querySelector('b').textContent = '👂 Escuchando…';
        const dichos = await escucharVoz();
        bHab.classList.remove('escuchando'); bHab.querySelector('b').textContent = '🎤 Hablar';
        if (mi !== turno) return;
        if (dichos === null) { $('dOido').textContent = '🎤 Permite el micrófono en tu navegador para hablar.'; return; }
        if (!dichos.length) { $('dOido').textContent = '🤔 No te escuché. Habla un poco más fuerte.'; return; }
        const p = parecido(dichos, frase.en);
        $('dOido').textContent = `👂 "${dichos[0]}"`;
        if (p >= 0.7) { turno++; $('dOido').textContent += '  ✅'; terminar(true); }
        else {
          intentos++; Sfx.bad();
          $('dPista').textContent = intentos >= 2 ? '¡Casi! Escúchala despacio y vuelve a intentarlo (o salta).' : '¡Casi! Intenta otra vez.';
          if (intentos >= 2) hablar(frase.en, ch.tono, 0.7);
        }
      };
    });
  }

  /* ---------- Retos especiales de cada personaje ---------- */
  // Maga: «¡Haz que Pip sea …!»
  async function retoMago(ch, w) {
    limpiarItems();
    vitrina = { tipo: 'pip', destello: 0 };
    pipObj = D.pipEstado(null);
    const visuales = Object.keys(D.MAGIA).filter(k => PAL_EN[k] && k !== w.en);
    const op = (C_OPUESTOS[w.en] || []).filter(k => D.MAGIA[k] && PAL_EN[k]);
    const otros = barajar(op).concat(barajar(visuales.filter(k => !op.includes(k)))).slice(0, 2);
    const ops = barajar([w.en].concat(otros)).map(k => ({ en: k, es: '', ok: k === w.en }));
    const linea = elegirUno([{ en: `Make Pip ${w.en}!`, es: `¡Haz que Pip esté ${esCorto(w)}!` }, { en: `Abracadabra... Pip, be ${w.en}!`, es: `Abracadabra... ¡Pip, ponte ${esCorto(w)}!` }]);
    return elegir(ch, linea, ops, {
      palabra: w, sinEs: true, iconos: false,
      alElegir: async o => {
        Sfx.tone(880, 0.25, 'triangle', 0.1); vitrina.destello = ahora + 0.8; pipObj = D.pipEstado(o.en);
        await espera(700);
        if (!o.ok) { $('dPista').textContent = `Ahora Pip está «${o.en}» = ${esCorto(PAL_EN[o.en])}. Pero la maga pidió otra cosa.`; }
      },
      mal: o => ({ en: `Oh no! Now Pip is ${o.en}. I said ${w.en}!`, es: `¡Oh no! Ahora Pip está ${esCorto(PAL_EN[o.en])}. ¡Yo dije ${esCorto(w)}!` }),
      despues: async () => { await Promise.race([hablar(`Yes! Now Pip is ${w.en}!`, ch.tono), espera(2200)]); pipObj = D.pipEstado(null); }
    });
  }
  const C_OPUESTOS = {};
  Ingles.OPPOSITES.forEach(([a, b]) => { (C_OPUESTOS[a] = C_OPUESTOS[a] || []).push(b); (C_OPUESTOS[b] = C_OPUESTOS[b] || []).push(a); });
  function retoOpuesto(ch, w) {
    const op = (C_OPUESTOS[w.en] || []).map(k => PAL_EN[k]).filter(Boolean)[0];
    if (!op) return retoEscucha(ch, w);
    const ops = barajar([op].concat(distractores(op, 2, x => x !== w))).map(x => opPalabra(x, x === op));
    return elegir(ch, { en: `What is the opposite of "${w.en}"?`, es: `¿Cuál es lo contrario de «${w.en}» (${esCorto(w)})?` }, ops, { palabra: w, sinEs: true });
  }
  // Mimo: adivina qué hace
  function retoMimo(ch, w) {
    limpiarItems();
    actual.npc.accion = { en: w.en, icono: w.icon || '❓' };
    const ops = barajar([w].concat(distractores(w, 2, x => x.icon !== w.icon))).map(x => opPalabra(x, x === w));
    return elegir(ch, elegirUno([{ en: 'What am I doing? Guess!', es: '¿Qué estoy haciendo? ¡Adivina!' }, { en: 'Look at me! What do I do?', es: '¡Mírame! ¿Qué hago?' }]), ops, {
      palabra: w, sinEs: true,
      despues: async () => { const f = fraseVerbo(w); $('dEn').textContent = f.en; $('dEs').textContent = f.es; await Promise.race([hablar(f.en, ch.tono), espera(2400)]); }
    }).then(r => { actual.npc.accion = null; return r; });
  }
  // Tu turno: elige el dibujo de la acción y tu personaje la hace
  function retoHazlo(ch, w) {
    const otros = distractores(w, 2, x => x.icon && x.icon !== w.icon);
    const ops = barajar([w].concat(otros)).map(x => ({ en: '', es: '', icono: x.icon, ok: x === w, w: x }));
    return elegir(ch, { en: `Your turn! Show me: ${w.en}!`, es: `¡Tu turno! Muéstrame: ${w.en}.` }, ops, {
      palabra: w, sinEs: true, iconos: true, voz: false, decirOpcion: false,
      alElegir: async o => { jugador.accion = { en: o.w.en, icono: o.icono, hasta: ahora + 1.6 }; hablar(`I ${o.w.en}`, 1.1); await espera(900); },
      mal: o => ({ en: `No! You ${o.w.en}. I said ${w.en}!`, es: `¡No! Eso es ${esCorto(o.w)}. Yo dije: ${esCorto(w)}.` })
    });
  }
  function retoPasado(ch, w) {
    const formas = [...new Set([w.past, w.en, w.ing])];
    if (formas.length < 3) return retoSignificado(ch, w);
    const ops = barajar(formas).map(f => ({ en: f, es: '', ok: f === w.past }));
    return elegir(ch, { en: `Yesterday, I _____ . (${w.en})`, es: `Ayer, yo… (${esCorto(w)}) — ¿cuál es el pasado?` }, ops, {
      palabra: w, sinEs: true, mudo: true, decirOpcion: false,
      despues: async () => { const f = `Yesterday, I ${w.past}.`; $('dEn').textContent = f; await Promise.race([hablar(f, ch.tono), espera(2000)]); }
    });
  }
  const DIAS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const MESES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function retoSecuencia(ch, w, lista, obj, tipoEs) {
    const i = lista.indexOf(w.en), prev = lista[(i - 1 + lista.length) % lista.length];
    return retoParte(ch, w, obj, { en: `What ${tipoEs[0]} comes after ${prev}? Touch it!`, es: `¿Qué ${tipoEs[1]} viene después de ${prev}? ¡Tócalo!` }, { y: -20 });
  }
  function retoReloj(ch, w) {
    const h = 1 + Math.floor(Math.random() * 12);
    let correcta, malas;
    if (w.en === 'noon' || w.en === 'midnight') { vitrina = { tipo: 'reloj', h: 12, m: 0, icono: w.en === 'noon' ? '☀️' : '🌙' }; correcta = `It's ${w.en}.`; malas = [`It's ${w.en === 'noon' ? 'midnight' : 'noon'}.`, "It's six o'clock."]; }
    else if (w.en === 'quarter') { vitrina = { tipo: 'reloj', h, m: 15 }; correcta = `It's a quarter past ${NUMS[h]}.`; malas = [`It's ${NUMS[h]} o'clock.`, `It's half past ${NUMS[h]}.`]; }
    else { vitrina = { tipo: 'reloj', h, m: 0 }; const h2 = (h % 12) + 1, h3 = ((h + 5) % 12) + 1; correcta = `It's ${NUMS[h]} o'clock.`; malas = [`It's ${NUMS[h2]} o'clock.`, `It's ${NUMS[h3]} o'clock.`]; }
    limpiarItems();
    const ops = barajar([correcta].concat(malas)).map(e => ({ en: e, es: '', ok: e === correcta }));
    return elegir(ch, { en: 'What time is it?', es: '¿Qué hora es?' }, ops, { palabra: w, sinEs: true, columnas: 1 });
  }
  const CLIMA = new Set(['sunny', 'cloudy', 'rainy', 'windy', 'hot', 'cold', 'snow', 'rain', 'wind', 'storm', 'rainbow', 'sun', 'cloud', 'moon', 'star', 'sunset', 'ice', 'air', 'warm', 'cool', 'wet', 'dry']);
  function retoClima(ch, w) {
    limpiarItems();
    vitrina = { tipo: 'clima', clima: w.en };
    const adj = w.t === 'a';
    const cands = [...CLIMA].map(k => PAL_EN[k]).filter(x => x && x !== w && (x.t === 'a') === adj);
    const ops = barajar([w].concat(barajar(cands).slice(0, 2))).map(x => opPalabra(x, x === w));
    const linea = adj ? { en: "How's the weather? It's...", es: '¿Cómo está el clima? Está…' } : { en: 'Look up! What can you see?', es: '¡Mira arriba! ¿Qué ves?' };
    return elegir(ch, linea, ops, { palabra: w, sinEs: true }).then(r => { vitrina = null; return r; });
  }
  function retoNumero(ch, w) {
    limpiarItems();
    vitrina = { tipo: 'pizarra', txt: w.value };
    const vecinos = PALABRAS.words.filter(x => x.t === 'm' && x !== w && x.value && /^\d+$/.test(x.value));
    const parecidos = vecinos.filter(x => x.value.length === w.value.length || x.value[0] === w.value[0]);
    const ops = barajar([w].concat(barajar(parecidos.length >= 2 ? parecidos : vecinos).slice(0, 2))).map(x => opPalabra(x, x === w));
    return elegir(ch, { en: 'What number is this?', es: '¿Qué número es este?' }, ops, { palabra: w, sinEs: true }).then(r => { vitrina = null; return r; });
  }
  function retoNumeroOido(ch, w) {
    const vecinos = PALABRAS.words.filter(x => x.t === 'm' && x !== w && x.value && /^\d+$/.test(x.value));
    const ops = barajar([w].concat(barajar(vecinos).slice(0, 2))).map(x => ({ en: x.value, es: '', ok: x === w }));
    oirOtraVez = () => hablar(w.en, ch.tono, 0.8);
    return elegir(ch, { en: '🔊 Listen! Which number?', es: '🔊 ¡Escucha! ¿Qué número es?' }, ops, { palabra: w, sinEs: true, decirEn: w.en, voz: false, decirOpcion: false });
  }
  function retoSonido(ch, w) {
    const son = C.SONIDOS[w.en];
    const con = POOL.granjera.filter(x => C.SONIDOS[x.en] && x !== w);
    return retoToca(ch, w, { en: `Which animal says "${son}"?`, es: `¿Qué animal dice «${son}»?` }, { opciones: barajar([w].concat(barajar(con).slice(0, 2))) });
  }
  function retoFoto(ch, w) {
    limpiarItems();
    const v = visualFoto(w), [a, b, y] = mesaAbs();
    nuevoItem(w, v, (a + b) / 2, y, 1.25, { brillo: 0.5 });
    const ops = barajar([w].concat(distractores(w, 2))).map(x => opPalabra(x, x === w));
    return elegir(ch, elegirUno([{ en: 'Who is this?', es: '¿Quién es?' }, { en: 'Look at this photo. Who is it?', es: 'Mira esta foto. ¿Quién es?' }]), ops, { palabra: w, sinEs: true })
      .then(r => { limpiarItems(); return r; });
  }

  /* ======================================================================
     ¿QUÉ RETO PARA CADA PALABRA?
  ====================================================================== */
  const PARTES_DE = {};
  ['dollhouse', 'mannequinWinter', 'mannequinCasual', 'insideChart', 'faceChart', 'turnSign', 'signpostA', 'signpostB', 'podium', 'subjectsBoard',
    'schoolBoard', 'seasonsBoard', 'dayPartsBoard', 'shapesBoard', 'bed', 'stove'].forEach(o => Object.keys(Obj.O[o].partes || {}).forEach(p => { if (!PARTES_DE[p]) PARTES_DE[p] = o; }));
  // Zonas demasiado finas o que no se ven como lo que nombran: mejor con tarjeta
  ['room', 'floor', 'wall', 'shape', 'subject', 'season', 'sentence'].forEach(p => { delete PARTES_DE[p]; });
  const lineaToca = w => ({ en: `Where is the ${w.en}? Touch it!`, es: `¿Dónde está: ${esCorto(w)}? ¡Tócalo!` });
  function lineaParte(w) {
    const o = PARTES_DE[w.en];
    if (o === 'turnSign') return w.en === 'straight' ? { en: 'Go straight! Touch the sign.', es: '¡Sigue derecho! Toca la señal.' } : { en: `Turn ${w.en}! Touch the sign.`, es: `¡Gira a la ${esCorto(w)}! Toca la señal.` };
    if (o === 'podium') return { en: `Who is in ${w.en} place? Touch it!`, es: `¿Quién está en ${esCorto(w)} lugar? ¡Toca!` };
    if (o === 'dollhouse') return { en: `Where is the ${w.en}? Touch it in the dollhouse!`, es: `¿Dónde está: ${esCorto(w)}? ¡Tócalo en la casita!` };
    return lineaToca(w);
  }
  const varios = (...fns) => elegirUno(fns.filter(Boolean));

  function retoPrincipal(ch, w) {
    const est = ch.estilo, v = visual(w);
    if (est === 'mimo' && w.t === 'v') return retoMimo(ch, w);
    if (est === 'mago' && D.MAGIA[w.en]) return retoMago(ch, w);
    if (w.theme === 'prepositions' && PREP[w.en]) return retoPon(ch, w);
    if (est === 'cuerpo' && ZONAS[w.en]) return retoCuerpo(ch, w);
    if (w.theme === 'numbers' && w.value && +w.value >= 1 && +w.value <= 12 && est === 'tienda') return retoContar(ch, w);
    if (w.theme === 'numbers' && w.value && /^\d+$/.test(w.value)) return varios(() => retoNumero(ch, w), () => retoNumeroOido(ch, w))();
    if (DIAS.includes(w.en)) return retoSecuencia(ch, w, DIAS, 'daysBoard', ['day', 'día']);
    if (MESES.includes(w.en)) return retoSecuencia(ch, w, MESES, 'monthsBoard', ['month', 'mes']);
    if (["o'clock", 'noon', 'midnight', 'quarter'].includes(w.en)) return retoReloj(ch, w);
    if (est === 'naturaleza' && CLIMA.has(w.en)) return retoClima(ch, w);
    if (est === 'colores' && (COLOR_HEX[w.en] || FORMAS.has(w.en))) return retoEntrega(ch, w, { linea: COLOR_HEX[w.en] ? rellenar(ch.pide[0], w) : null, filtro: x => !!(COLOR_HEX[x.en] && COLOR_HEX[w.en]) || (FORMAS.has(x.en) && FORMAS.has(w.en)) });
    if (PARTES_DE[w.en]) return retoParte(ch, w, PARTES_DE[w.en], lineaParte(w));
    if (est === 'fotos') return PERSONAS.has(w.en) ? retoFoto(ch, w) : (huecoDe(w) ? retoHueco(ch, w) : retoSignificado(ch, w));
    if (est === 'animales') return retoToca(ch, w, lineaToca(w), { filtro: x => x.t === 'n' });
    if (w.t === 'n' && v.dibujable && ['tienda', 'mudanza', 'colores', 'escuela', 'deporte', 'cuerpo', 'naturaleza'].includes(est)) return retoEntrega(ch, w);
    if (est === 'ciudad' && w.t === 'n') return retoToca(ch, w, { en: `I'm going to the ${w.en}. Which one is it?`, es: `Voy a: ${esCorto(w)}. ¿Cuál es?` });
    if (w.t === 'n' && (est === 'naturaleza' || est === 'tiempo' || est === 'escuela' || est === 'deporte' || est === 'cuerpo' || est === 'tienda' || est === 'mudanza')) return retoToca(ch, w, lineaToca(w));
    if (huecoDe(w)) return retoHueco(ch, w);
    return retoSignificado(ch, w);
  }
  function retoSegundo(ch, w) {
    const est = ch.estilo;
    if (est === 'mimo' && w.t === 'v') return varios(() => retoHazlo(ch, w), w.past && w.past !== w.en + 'ed' && w.past !== w.en + 'd' ? () => retoPasado(ch, w) : null, () => retoSignificado(ch, w))();
    if (est === 'mago') return C_OPUESTOS[w.en] ? retoOpuesto(ch, w) : retoEscucha(ch, w);
    if (est === 'animales' && C.SONIDOS[w.en]) return retoSonido(ch, w);
    if (w.t === 'm' && w.value && /^\d+$/.test(w.value)) return retoNumeroOido(ch, w);
    const v = visual(w);
    return varios(() => retoEscucha(ch, w), v.dibujable && w.t === 'n' ? () => retoQueEs(ch, w) : null,
      huecoDe(w) ? () => retoHueco(ch, w) : null, () => retoSignificado(ch, w))();
  }

  /* ======================================================================
     PRESENTAR UNA PALABRA NUEVA
  ====================================================================== */
  function fraseVerbo(w) {
    if (C.VERBO_FRASE[w.en]) return C.VERBO_FRASE[w.en];
    return { en: `Look at me! I can ${w.en}!`, es: `¡Mírame! ¡Puedo ${esCorto(w)}!` };
  }
  const FAMILIA = new Set(['mother', 'father', 'mom', 'dad', 'brother', 'sister', 'son', 'daughter', 'grandmother', 'grandfather', 'aunt', 'uncle', 'cousin',
    'husband', 'wife', 'friend', 'neighbor', 'parents', 'grandparents', 'children', 'family', 'baby']);
  function fraseAprende(ch, w) {
    const es = esCorto(w), pl = esPluralEn(w), f = generoEs(es) === 'f';
    if (w.t === 'v') return fraseVerbo(w);
    if (ch.estilo === 'mago' && D.MAGIA[w.en]) return { en: `Abracadabra! Now Pip is ${w.en}!`, es: `¡Abracadabra! ¡Ahora Pip está ${es}!` };
    if (ch.estilo === 'cuerpo' && ZONAS[w.en]) return pl ? { en: `These are your ${w.en}.`, es: `Est${f ? 'as' : 'os'} son tus ${es}.` } : { en: `This is your ${w.en}.`, es: `Est${f ? 'a' : 'e'} es tu ${es}.` };
    if (ch.estilo === 'fotos' && FAMILIA.has(w.en)) return pl ? { en: `These are my ${w.en}.`, es: `Est${f ? 'as' : 'os'} son mis ${es}.` } : { en: `This is my ${w.en}.`, es: `Est${f ? 'a' : 'e'} es mi ${es}.` };
    if (ch.estilo === 'animales') return { en: `Look! It's ${conArt(w)}!${C.SONIDOS[w.en] ? ` It says "${C.SONIDOS[w.en]}".` : ''}`, es: `¡Mira! Es ${artEs(w, false)} ${es}.${C.SONIDOS[w.en] ? ` Dice «${C.SONIDOS[w.en]}».` : ''}` };
    if (w.t === 'm' && w.value) return { en: `${cap(w.en)}! This is ${w.en}: ${w.value}.`, es: `¡${cap(es)}! Así se escribe: ${w.value}.` };
    if (w.theme === 'colors' && w.t === 'a') return { en: `This paint is ${w.en}.`, es: `Esta pintura es de color ${es}.` };
    if (w.exEn && w.exEs && w.exEn.length < 70) return { en: w.exEn, es: w.exEs };
    if (w.t === 'n' || w.t === 'u') {
      if (pl) return { en: `These are ${w.en}.`, es: `Est${f ? 'as' : 'os'} son ${es}.` };
      if (w.t === 'u') return { en: `This is ${w.en}.`, es: `Esto es: ${es}.` };
      return { en: `This is ${conArt(w)}.`, es: `Es ${artEs(w, false)} ${es}.` };
    }
    if (w.t === 'a') return { en: `It's ${w.en}!`, es: `¡Es/está ${es}!` };
    return { en: `"${cap(w.en)}" means "${es}".`, es: `«${w.en}» significa «${es}».` };
  }
  async function aprende(ch, w) {
    limpiarItems(); vitrina = null;
    const est = ch.estilo;
    let it = null;
    if (est === 'mago' && D.MAGIA[w.en]) { vitrina = { tipo: 'pip', destello: ahora + 1 }; pipObj = D.pipEstado(w.en); Sfx.tone(880, 0.3, 'triangle', 0.1); }
    else if (est === 'mimo' && w.t === 'v') actual.npc.accion = { en: w.en, icono: w.icon || '❓' };
    else if (est === 'cuerpo' && ZONAS[w.en]) { vitrina = { tipo: 'cuerpo', esc: ESC_CUERPO, marca: ZONAS[w.en][0] }; }
    else if (est === 'naturaleza' && CLIMA.has(w.en)) vitrina = { tipo: 'clima', clima: w.en };
    else if (PARTES_DE[w.en]) { const o = Obj.O[PARTES_DE[w.en]]; vitrina = { tipo: 'parte', obj: PARTES_DE[w.en], esc: Math.min(1.3, 280 / o.w, 230 / o.h), y: 0, marca: o.partes[w.en] }; }
    else if (est === 'escuela' && w.t === 'm' && w.value) vitrina = { tipo: 'pizarra', txt: w.value };
    else {
      const v = est === 'fotos' ? visualFoto(w) : visual(w), [a, b, y] = mesaAbs();
      it = nuevoItem(w, v, (a + b) / 2, y, escalaPara(v, est === 'fotos' ? 100 : 96, 110), { brillo: 0.8 });
    }
    const linea = fraseAprende(ch, w);
    dlgLimpiar(); dlgPalabra(w, !vista(w)); dlgLinea(linea);
    $('dPista').textContent = it ? '👆 Toca la cosa para guardarla en tu álbum.' : '';
    npcHabla(linea.en);
    oirOtraVez = async () => { await hablar(w.en, 1, 0.75); hablar(linea.en, ch.tono); };
    const mi = turno;
    (async () => { await hablar(w.en, 1, 0.8); await espera(250); if (mi === turno) hablar(linea.en, ch.tono); })();
    await new Promise(res => {
      if (it) tarea = { tipo: 'aprende', tocar(x) { if (x === it) { tarea = null; res(); } } };
      esperarSiguiente('¡Entendido! ▶').then(res);
    });
    const nueva = !vista(w);
    if (nueva) {
      progreso.palabras[w.id] = [0, 0, progreso.dia]; hoyNuevas++;
      Sfx.collect(3); ganarXP(10, it ? it.x : actual.x - 100, -180);
      flotante('✨ New word!', it ? it.x : actual.x - 100, -220, '#fff', 20);
      chispas(it ? it.x : actual.x - 100, -120, 18);
    }
    if (it) volar(it, cam.x - W / 2 / cam.k + 40, -cam.suelo / cam.k + 20, 0.6, () => { it.vis = false; });
    actual.npc.accion = null; tarea = null;
    await espera(350);
    vitrina = null; pipObj = D.pipEstado(null);
    hud();
  }

  /* ======================================================================
     UN ENCUENTRO COMPLETO
  ====================================================================== */
  function planPalabras(ch) {
    const k = ch.clave;
    const nuevas = POOL[k].filter(w => !vista(w)).slice(0, C.NUEVAS);
    const vistasCh = POOL[k].filter(vista);
    const repaso = vistasCh.slice().sort((a, b) => {
      const pa = progreso.palabras[a.id], pb = progreso.palabras[b.id];
      return (pb[1] * 2 - pb[0]) - (pa[1] * 2 - pa[0]) + (Math.random() - 0.5);
    }).slice(0, nuevas.length >= 3 ? 2 : 5 - nuevas.length);
    return { nuevas, repaso };
  }
  function saludoHora() {
    const p = avanceDia();
    return p < 0.4 ? { en: 'Good morning', es: 'Buenos días' } : p < 0.85 ? { en: 'Good afternoon', es: 'Buenas tardes' } : { en: 'Good evening', es: 'Buenas noches' };
  }
  function opcionesCharla(c) {
    const ok = conNombre(elegirUno(c.ok));
    const malas = barajar(c.bad).slice(0, 2).map(conNombre);
    return barajar([{ ...ok, ok: true }].concat(malas.map(m => ({ ...m, ok: false }))));
  }
  async function encuentro(s) {
    actual = s; modo = 'encuentro';
    const ch = s.ch;
    erroresEnc = 0;
    jugador.mov = false;
    dlgPersonaje(ch);
    const primera = !progreso.visitas[ch.clave];
    const plan = planPalabras(ch);
    const total = 2 + plan.nuevas.length * 2 + plan.repaso.length + (plan.nuevas.length ? 1 : 0) + 2;
    let hechos = 0;
    const paso = () => dlgPasos(++hechos, total);
    dlgPasos(0, total);
    $('controles').classList.add('oculto');
    await espera(250);

    // 1. Saludo
    const saludo = primera ? ch.conoce : (Math.random() < 0.5 ? elegirUno(C.REENCUENTROS).npc : { en: `${saludoHora().en}! ${elegirUno(['Welcome back!', 'Nice to see you!', 'How are you?'])}`, es: `¡${saludoHora().es}! ${elegirUno(['¡Bienvenido otra vez!', '¡Qué gusto verte!', '¿Cómo estás?'])}` });
    await dice(ch, conNombre(saludo));
    paso();
    const charla = elegirUno(primera ? C.SALUDOS.concat(ch.charlas) : ch.charlas.concat(C.SALUDOS, C.REENCUENTROS));
    await elegir(ch, conNombre(charla.npc), opcionesCharla(charla), { despues: async () => { if (charla.resp) { const r = conNombre(charla.resp); npcGlobo(r.en.length < 34 ? r.en : '😊', '#e8f5e9'); $('dEn').textContent = r.en; $('dEs').textContent = r.es; await Promise.race([hablar(r.en, ch.tono), espera(2600)]); } else await reaccionBien(ch); } });
    paso();

    // 2. Palabras nuevas, de a 2 o 3, cada grupo seguido de sus retos
    if (plan.nuevas.length) {
      await dice(ch, elegirUno(ch.ensena));
      const grupos = plan.nuevas.length > 3 ? [plan.nuevas.slice(0, 3), plan.nuevas.slice(3)] : [plan.nuevas];
      for (const gr of grupos) {
        for (const w of gr) { await aprende(ch, w); paso(); }
        for (const w of barajar(gr)) { await retoPrincipal(ch, w); limpiarItems(); vitrina = null; paso(); }
      }
    } else {
      await dice(ch, { en: "You know all my words! Let's practice.", es: '¡Ya sabes todas mis palabras! Practiquemos.' });
    }
    // 3. Repaso mezclado
    for (const w of barajar(plan.repaso.concat(plan.nuevas.length ? [elegirUno(plan.nuevas)] : []))) {
      await retoSegundo(ch, w); limpiarItems(); vitrina = null; paso();
    }
    // 4. Decirlo en voz alta
    const candidatas = plan.nuevas.concat(plan.repaso);
    if (candidatas.length) {
      const w = elegirUno(candidatas);
      const f = fraseDecir(ch, w);
      await retoDecir(ch, f);
    }
    paso();
    // 5. Despedida
    const adios = elegirUno(C.DESPEDIDAS);
    await elegir(ch, adios.npc, opcionesCharla(adios), {});
    paso();
    await terminarEncuentro(s);
  }
  function fraseDecir(ch, w) {
    if (ch.estilo === 'tienda' && w.t === 'n') return { en: `${cap(w.en)}, please.`, es: `${cap(esCorto(w))}, por favor.` };
    if (w.exEn && w.exEn.split(' ').length <= 7) return { en: w.exEn, es: w.exEs };
    if (w.t === 'v') { const f = fraseVerbo(w); if (f.en.split(' ').length <= 7) return f; }
    return { en: cap(w.en), es: cap(esCorto(w)) };
  }
  async function terminarEncuentro(s) {
    const ch = s.ch;
    const estrellas = erroresEnc === 0 ? 3 : erroresEnc <= 2 ? 2 : 1;
    s.hecho = true;
    progreso.visitas[ch.clave] = (progreso.visitas[ch.clave] || 0) + 1;
    progreso.ultimaVisita[ch.clave] = progreso.dia;
    progreso.estrellas[ch.clave] = (progreso.estrellas[ch.clave] || 0) + estrellas;
    progreso.paso = s.i + 1;
    progreso.stats.encuentros++;
    hoyEstrellas += estrellas;
    ganarXP(estrellas * 10, s.npcX, -200);
    Sfx.mission(); confeti(); jugador.celebra = ahora + 2; s.npc.celebra = 2;
    banner('⭐'.repeat(estrellas) + '☆'.repeat(3 - estrellas), estrellas === 3 ? '¡Perfecto, sin errores!' : estrellas === 2 ? '¡Muy bien!' : '¡Completado! Repasa para más estrellas');
    guardar();
    limpiarItems(); vitrina = null;
    dlgLimpiar();
    $('dlg').classList.add('oculto');
    actual = null; modo = 'caminar';
    $('controles').classList.remove('oculto');
    ponerBurbujas();
    hud();
    if (totalVistas() === PALABRAS.words.length && !progreso.fin) { progreso.fin = true; guardar(); setTimeout(() => $('final').classList.remove('oculto'), 1500); }
  }

  /* ======================================================================
     FIN DEL DÍA
  ====================================================================== */
  function finDia() {
    modo = 'resumen';
    $('controles').classList.add('oculto');
    ganarXP(50);
    guardar();
    $('resTitulo').textContent = `🌇 ¡Día ${progreso.dia} completado!`;
    $('resStats').innerHTML = [
      ['✨', hoyNuevas, 'palabras nuevas'], ['⭐', hoyEstrellas, 'estrellas'], ['🔥', mejorCombo, 'mejor combo'],
      ['📘', `${totalVistas()}/${PALABRAS.words.length}`, 'palabras en tu álbum'], ['🎁', '+50', 'XP de bonus']
    ].map(([i, n, t]) => `<div><span>${i}</span><b>${n}</b><small>${t}</small></div>`).join('');
    $('resumen').classList.remove('oculto');
    Sfx.level(); confeti();
    hablar(`Day ${progreso.dia} complete! Great job!`, 1.1);
  }
  function nuevoDia() {
    progreso.dia++; progreso.paso = 0; progreso.ruta = armarRuta();
    hoyNuevas = 0; hoyEstrellas = 0; mejorCombo = 0;
    guardar();
    jugador.x = -120; cam.listo = false;
    crearMundo(); modo = 'caminar'; hud();
    $('resumen').classList.add('oculto'); $('controles').classList.remove('oculto');
    banner(`🌅 Día ${progreso.dia}`, '¡Nuevos vecinos te esperan!');
  }
  function actualizarRacha() {
    const h = hoy(), r = progreso.racha;
    if (r.ultima === h) return;
    const ayer = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    r.dias = r.ultima === ayer ? r.dias + 1 : 1; r.ultima = h;
  }

  /* ======================================================================
     BUCLE PRINCIPAL
  ====================================================================== */
  let oirOtraVez = () => { if (ultimaVoz.txt) hablar(ultimaVoz.txt, ultimaVoz.tono); };
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
      const nx = clamp(jugador.x + v * (teclas.correr ? 380 : 250) * dt, -180, lim);
      jugador.mov = Math.abs(nx - jugador.x) > 0.01;
      if (jugador.mov) jugador.h.walkP.phase += dt * (teclas.correr ? 15 : 10);
      jugador.x = nx;
      if (v > 0 && nx >= lim - 0.5) {
        teclas.der = false; jugador.objetivo = null; jugador.mov = false;
        const s = estSiguiente();
        if (s) encuentro(s); else finDia();
      }
      // tocar burbujas al pasar no hace nada: hay que tocarlas
    }
    moverCamara(dt);
    items.forEach(it => {
      if (it.pop < 1) it.pop = Math.min(1, it.pop + dt * 3.2);
      if (it.sacudir > 0) it.sacudir = Math.max(0, it.sacudir - dt * 2.5);
      if (it.vuelo) {
        const vu = it.vuelo; vu.t += dt; const p = clamp(vu.t / vu.dur, 0, 1), e = 1 - Math.pow(1 - p, 3);
        it.x = vu.x0 + (vu.x1 - vu.x0) * e; it.y = vu.y0 + (vu.y1 - vu.y0) * e - Math.sin(p * Math.PI) * 40;
        if (p >= 1) { it.vuelo = null; if (vu.fin) vu.fin(); }
      }
    });
    if (mundo) mundo.est.forEach(s => {
      const n = s.npc; if (n.habla > 0) n.habla -= dt; if (n.celebra > 0) n.celebra -= dt;
    });
    if (mundo) mundo.burbujas.forEach(b => { if (b.rota > 0 && b.rota <= 1) b.rota += dt * 2.5; });
    if (mundo) mundo.decor.forEach(d => { if (d.brillo > 0) d.brillo -= dt * 0.5; });
    D.pipAcercar(pip, pipObj, dt);
    particulas.forEach(q => { q.vida -= dt; q.x += q.vx * dt; q.y += q.vy * dt; if (!q.sinGrav) q.vy += 420 * dt; });
    particulas = particulas.filter(q => q.vida > 0);
    textos.forEach(q => { q.vida -= dt; q.y -= 40 * dt; });
    textos = textos.filter(q => q.vida > 0);
  }

  /* ======================================================================
     ENTRADA: toques, arrastre y teclado
  ====================================================================== */
  let tocandoSuelo = false;
  canvas.addEventListener('pointerdown', e => {
    if (modo === 'intro' || modo === 'resumen') return;
    canvas.setPointerCapture(e.pointerId);
    const m = aMundo(e.clientX, e.clientY);
    arrastre.px = e.clientX; arrastre.py = e.clientY; arrastre.movio = false;
    if (tarea) {
      const it = itemEn(m.x, m.y);
      if (it && (tarea.tocar || tarea.soltar)) {
        if (it.arrastrable) { arrastre.item = it; arrastre.dx = it.x - m.x; arrastre.dy = it.y - m.y; }
        else { arrastre.tap = it; }
        return;
      }
      if (tarea.tocarLibre) { tarea.tocarLibre(m.x, m.y); return; }
    }
    if (modo === 'encuentro') { if (actual && sobreNPC(m.x, m.y)) oirOtraVez(); return; }
    if (modo === 'caminar') {
      // burbujas de repaso
      const b = mundo.burbujas.find(q => !q.rota && Math.hypot(q.x - m.x, q.y + Math.sin(ahora * 1.6 + q.fase) * 10 - m.y) < 40);
      if (b) {
        b.rota = 0.01; hablar(b.w.en, 1); toast(`${b.w.icon || ''} ${b.w.en} = ${b.w.es}`); chispas(b.x, b.y, 12); Sfx.collect(2); ganarXP(2, b.x, b.y - 30); guardar();
        return;
      }
      // personas ya visitadas y cosas del adorno
      const s = mundo.est.find(q => Math.abs(q.npcX - m.x) < 50 && m.y > q.npcY - 130 && m.y < 10);
      if (s && s.hecho) { const d = elegirUno(C.DESPEDIDAS).npc; s.npc.globo = { txt: d.en, hasta: ahora + 2 }; s.npc.habla = 1.5; hablar(d.en, s.ch.tono); return; }
      const d = mundo.decor.find(q => q.w && Math.abs(q.x - m.x) < ((Obj.O[q.obj] || { w: 60 }).w / 2 + 10) && m.y < 5 && m.y > -((Obj.O[q.obj] || { h: 60 }).h) - 10);
      if (d) { d.brillo = 1.6; Sfx.touch(); hablar(`${cap(conArt(d.w))}.`, 1); toast(`${d.w.icon || ''} ${d.w.en} = ${d.w.es}`); return; }
      tocandoSuelo = true; jugador.objetivo = m.x;
    }
  });
  canvas.addEventListener('pointermove', e => {
    if (Math.hypot(e.clientX - arrastre.px, e.clientY - arrastre.py) > 8) arrastre.movio = true;
    const m = aMundo(e.clientX, e.clientY);
    if (arrastre.item) { arrastre.item.x = m.x + arrastre.dx; arrastre.item.y = m.y + arrastre.dy; arrastre.item.vuelo = null; }
    else if (tocandoSuelo && modo === 'caminar') jugador.objetivo = m.x;
  });
  function soltarPuntero(e) {
    tocandoSuelo = false;
    const m = aMundo(e.clientX, e.clientY);
    if (arrastre.item) {
      const it = arrastre.item; arrastre.item = null;
      if (!arrastre.movio) { it.x = it.hx; it.y = it.hy; if (tarea && tarea.tocar) tarea.tocar(it); }
      else if (tarea && tarea.soltar) tarea.soltar(it, it.x, it.y);
      else volverACasa(it);
    } else if (arrastre.tap) {
      const it = arrastre.tap; arrastre.tap = null;
      if (tarea && tarea.tocar && itemEn(m.x, m.y) === it) tarea.tocar(it);
    }
  }
  canvas.addEventListener('pointerup', soltarPuntero);
  canvas.addEventListener('pointercancel', soltarPuntero);

  const TECLAS_DER = ['ArrowRight', 'd', 'D'], TECLAS_IZQ = ['ArrowLeft', 'a', 'A'];
  addEventListener('keydown', e => {
    if (modo === 'intro') { if (e.key === 'Enter') $('btnJugar').click(); return; }
    if (TECLAS_DER.includes(e.key)) teclas.der = true;
    if (TECLAS_IZQ.includes(e.key)) teclas.izq = true;
    if (e.key === 'Shift') teclas.correr = true;
    if (/^[1-4]$/.test(e.key) && teclaOps[+e.key - 1]) teclaOps[+e.key - 1].click();
    if ((e.key === 'Enter' || e.key === ' ') && teclaSig) { e.preventDefault(); teclaSig(); }
    if (e.key === 'r' || e.key === 'R') oirOtraVez();
  });
  addEventListener('keyup', e => {
    if (TECLAS_DER.includes(e.key)) teclas.der = false;
    if (TECLAS_IZQ.includes(e.key)) teclas.izq = false;
    if (e.key === 'Shift') teclas.correr = false;
  });
  function botonMantener(id, clave) {
    const b = $(id);
    const on = e => { e.preventDefault(); teclas[clave] = true; b.classList.add('on'); };
    const off = () => { teclas[clave] = false; b.classList.remove('on'); };
    b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointerleave', off); b.addEventListener('pointercancel', off);
  }
  botonMantener('btnDer', 'der'); botonMantener('btnIzq', 'izq');

  /* ======================================================================
     BOTONES Y PANTALLAS
  ====================================================================== */
  $('dOir').onclick = () => oirOtraVez();
  $('dEn').onclick = () => oirOtraVez();
  $('btnTrad').onclick = () => { progreso.traduccion = !progreso.traduccion; guardar(); hud(); toast(progreso.traduccion ? '🇪🇸 Traducción visible' : '🙈 Traducción oculta: ¡modo reto!'); };
  $('btnLento').onclick = () => { progreso.lento = !progreso.lento; guardar(); hud(); toast(progreso.lento ? '🐢 Voz lenta' : '🐇 Voz normal'); };
  $('btnMudo').onclick = () => { progreso.mudo = !progreso.mudo; settings.mute = progreso.mudo; guardar(); hud(); toast(progreso.mudo ? '🔇 Efectos de sonido apagados (la voz sigue)' : '🔊 Efectos de sonido encendidos'); };
  $('btnAyuda').onclick = () => { $('intro').classList.remove('oculto'); $('btnJugar').textContent = '▶ Seguir jugando'; };
  $('btnAlbum').onclick = () => abrirAlbum();
  $('btnAlbumCerrar').onclick = () => $('album').classList.add('oculto');
  $('btnDia').onclick = () => nuevoDia();
  $('btnFinal').onclick = () => $('final').classList.add('oculto');
  function abrirAlbum() {
    const temas = PALABRAS.themes.map(t => {
      const vs = t.words.filter(vista).length;
      const palabras = t.words.map(w => {
        const e = progreso.palabras[w.id];
        return e ? `<span class="${e[0] > e[1] ? 'ok' : ''}" data-en="${escHTML(w.en)}" title="${escHTML(w.es)}">${w.icon || ''} ${escHTML(w.en)}</span>` : '<span class="no">???</span>';
      }).join('');
      return `<details><summary>${t.icon} <b>${escHTML(t.name)}</b> <small>${escHTML(t.es)}</small><i>${vs}/${t.words.length}</i></summary><div class="pals">${palabras}</div></details>`;
    }).join('');
    const quien = CLAVES.map(k => `<div title="${escHTML(PERS[k].titulo.es)}"><span>${PERS[k].emoji}</span><b>${escHTML(PERS[k].nombre)}</b><small>${POOL[k].filter(vista).length}/${POOL[k].length} · ⭐${progreso.estrellas[k] || 0}</small></div>`).join('');
    $('albQuien').innerHTML = quien;
    $('albTemas').innerHTML = temas;
    $('albStats').innerHTML = [['📘', totalVistas(), 'palabras'], ['🎤', progreso.stats.habladas, 'frases dichas'], ['✅', progreso.stats.aciertos, 'aciertos'], ['🔥', progreso.stats.mejorCombo, 'mejor combo'], ['📅', progreso.dia, 'día']]
      .map(([i, n, t]) => `<div><span>${i}</span><b>${n}</b><small>${t}</small></div>`).join('');
    $('album').classList.remove('oculto');
  }
  $('albTemas').addEventListener('click', e => { const s = e.target.closest('span[data-en]'); if (s) hablar(s.dataset.en, 1); });

  // Vista previa del personaje en la pantalla de inicio
  function dibujarPrevia() {
    const c = $('previa'), gg = c.getContext('2d'), r = Math.min(devicePixelRatio || 1, 2);
    c.width = 120 * r; c.height = 150 * r;
    gg.setTransform(r * 1.15, 0, 0, r * 1.15, 60 * r, 140 * r);
    gg.clearRect(-100, -200, 300, 300);
    if (jugador.h) drawHuman(gg, jugador.h, 0, 0, { pose: 'saludo' });
  }
  $('btnOtro').onclick = () => { progreso.avatar.seed = Gen.randomSeed(); crearJugador(); HUMANOS.clear(); dibujarPrevia(); guardar(); };
  $('btnSexo').onclick = () => { progreso.avatar.sexo = progreso.avatar.sexo === 'f' ? 'm' : 'f'; crearJugador(); dibujarPrevia(); guardar(); };
  $('btnJugar').onclick = () => {
    $('intro').classList.add('oculto');
    if (modo === 'intro') {
      started = true;   // habilita los efectos de sonido de motor_base
      modo = 'caminar';
      $('controles').classList.remove('oculto');
      actualizarRacha(); guardar(); hud();
      hablar(progreso.paso === 0 ? `${saludoHora().en}, ${nombreJugador}! Let's go!` : `Welcome back, ${nombreJugador}!`, 1.1);
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
      const r = await AbuProgreso.iniciar({ app: 'juego2' });
      if (!r) return;   // sin sesión: ya se redirigió al inicio de sesión
      datos = r.datos;
      const meta = (r.user && r.user.user_metadata) || {};
      const n = (meta.full_name || meta.name || meta.nombre || (r.user && r.user.email ? r.user.email.split('@')[0] : '') || '').trim().split(/[\s._-]/)[0];
      if (n) nombreJugador = cap(n.toLowerCase());
    } catch (e) { console.warn('[English Street] no se pudo cargar el avance:', e); }
    progreso = normalizar(datos);
    settings.slow = progreso.lento; settings.mute = progreso.mudo;
    if (!progreso.ruta || !progreso.ruta.every(k => PERS[k])) { progreso.ruta = armarRuta(); progreso.paso = 0; }
    crearJugador();
    crearMundo();
    const s = estSiguiente();
    jugador.x = progreso.paso === 0 ? -120 : (s ? s.x - PARADA - 260 : mundo.finX - 300);
    hud(); dibujarPrevia();
    $('cargando').style.display = 'none';
    if (progreso.paso > 0 || totalVistas() > 0) $('btnJugar').textContent = `▶ Seguir · Día ${progreso.dia}`;
  }
  // Para las pruebas automáticas (juego2.html?debug): ver dónde está cada cosa
  if (/[?&]debug\b/.test(location.search)) {
    window.__calle = { aPantalla, get items() { return items; }, get tarea() { return tarea; }, get actual() { return actual; }, get modo() { return modo; },
      get vitrina() { return vitrina; }, escZonas, get progreso() { return progreso; }, get jugador() { return jugador; }, ZONAS, vitrinaPos, PREP };
  }
  iniciar();
})();
