'use strict';

/* ============================================================================
   ENGLISH TOWN · MOTOR (1/4): constantes, estado, guardado, voz y personas
============================================================================ */
const $ = id => document.getElementById(id);
const canvas = $('c');
const ctx = canvas.getContext('2d');
const I = Ingles;
const { N, L, COLORS, CATS, colorName, elN, adjEs } = I;
MundoDatos.registrarAcciones();
const ACTIONS = I.ACTIONS;
const TOTAL_MISSIONS = 300;
const TOTAL_WORDS = PALABRAS.words.length;
const PAL = Object.fromEntries(PALABRAS.words.map(w => [w.en, w]));   // palabra en inglés → datos
const palabraId = en => { const w = PAL[en]; if (!w) throw new Error('Palabra desconocida: ' + en); return w.id; };

/* ---------- Trazado del pueblo (unidades del mundo) ---------- */
const ROWS = 6, ROW_H = 1350, LOT_W = 1150, VS_W = 300, START_X = 500;
const ROW_ITEMS = ['L', 'L', 'L', 'V', 'L', 'L', 'L', 'V', 'L', 'L', 'L'];
const SW_A = [70, 120], ROAD = [120, 380], SW_B = [380, 432], LANE = [238, 352];
const HUMAN_H = 100, CAR_SCALE = 0.26, VIEW_H = 1250;
const TOP_Y = -880, RAIL_Y = -915, SKY_Y = -960;
const lotsX = [], vstreets = [];
let WORLD_W = 0;
{
  let x = START_X;
  ROW_ITEMS.forEach(it => {
    if (it === 'L') { lotsX.push({ left: x, cx: x + LOT_W / 2, right: x + LOT_W }); x += LOT_W; }
    else { vstreets.push({ x0: x, x1: x + VS_W }); x += VS_W; }
  });
  WORLD_W = x + START_X;
}
const rowBase = r => r * ROW_H;
const LAST_ROAD_END = rowBase(ROWS - 1) + SW_B[1];
const SAND_Y0 = LAST_ROAD_END + 6, SEA_Y = LAST_ROAD_END + 470, SEA_END = SEA_Y + 950;
const BOTTOM_Y = SEA_Y - 24;
const THEME_COLORS = ['#2e86de', '#e67e22', '#8e44ad', '#16a085', '#c0392b', '#d35400', '#27ae60', '#2c3e50', '#7f8c8d',
  '#6d4c41', '#2e7d32', '#1565c0', '#6a1b9a', '#ef6c00', '#e65100', '#00897b', '#ad1457', '#5e35b1'];
PALABRAS.themes.forEach((t, i) => t.color = THEME_COLORS[i % THEME_COLORS.length]);
const THEME = Object.fromEntries(PALABRAS.themes.map(t => [t.key, t]));

/* ---------- Estado ---------- */
let W = null, player = null, guide = null;
const cam = { x: 900, y: 200, zoom: 1 };
const keys = {};
let lesson = null, lastLessonEnd = -99, lastSpoken = '';
let particles = [], floaters = [], bubbles = [];
let started = false, now = 0;
const settings = { slow: false, auto: true, mute: false, etiquetas: true };
let progress = null;
let campaign = [];
let mission = null;
let quiz = null;
let combo = 0, lastCollectT = -99;
let clockMin = 8 * 60;
let weather = { kind: 'sunny', left: 3 };
let lastPhase = null;
const recentKinds = {};

/* ---------- Progreso por usuario (tabla progreso_apps, app = 'mundo_ingles') ---------- */
function baseProgress() {
  return { v: 3, seed: null, words: {}, mi: 0, mp: 0, xp: 0, badges: [], streak: { last: null, days: 0 },
    stats: { quizOk: 0, quizBad: 0, night: 0, rain: 0, bestCombo: 0, talks: 0, played: 0 }, done: false, clock: 8 * 60, pos: null };
}
function normalizarProgreso(s) {
  const base = baseProgress();
  s = s || {};
  const p = { ...base, ...s, stats: { ...base.stats, ...(s.stats || {}) }, streak: { ...base.streak, ...(s.streak || {}) } };
  // Palabras en formato compacto: { id: [aciertos, fallos] }
  Object.keys(p.words).forEach(id => {
    const e = p.words[id];
    if (!Array.isArray(e)) p.words[id] = [e && e.ok || 0, e && e.bad || 0];
    if (!PALABRAS.byId[id]) delete p.words[id];
  });
  return p;
}
let saveTimer = 0;
function saveProgress() {
  if (!progress) return;
  progress.clock = clockMin;
  if (player) progress.pos = [Math.round(player.x), Math.round(player.y)];
  if (window.AbuProgreso) AbuProgreso.guardar(progress);
}

/* ---------- Voz y sonido ---------- */
const Voice = {
  voice: null, ok: 'speechSynthesis' in window,
  pick() {
    if (!this.ok) return;
    const vs = speechSynthesis.getVoices();
    this.voice = vs.find(v => /en[-_]US/i.test(v.lang) && /Google|Samantha|Aria|Jenny|Natural/i.test(v.name))
      || vs.find(v => /en[-_]US/i.test(v.lang)) || vs.find(v => /^en/i.test(v.lang)) || null;
  },
  speak(text, rate, pitch) {
    lastSpoken = text;
    if (!this.ok || !started) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[🔊🎯⭐🕰️]/gu, ''));
    u.lang = 'en-US';
    if (this.voice) u.voice = this.voice;
    u.rate = rate || (settings.slow ? 0.6 : 0.92);
    u.pitch = pitch || 1;
    speechSynthesis.speak(u);
  }
};
if (Voice.ok) { Voice.pick(); speechSynthesis.onvoiceschanged = () => Voice.pick(); }

const Sfx = {
  ac: null,
  tone(f, d, type = 'sine', v = 0.12, delay = 0) {
    if (settings.mute || !started) return;
    try {
      this.ac = this.ac || new (window.AudioContext || window.webkitAudioContext)();
      const t = this.ac.currentTime + delay, o = this.ac.createOscillator(), g = this.ac.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
      o.connect(g).connect(this.ac.destination); o.start(t); o.stop(t + d);
    } catch { /* sin audio */ }
  },
  collect(c) { const b = 520 * Math.pow(1.06, Math.min(c, 12)); this.tone(b, 0.12, 'triangle'); this.tone(b * 1.5, 0.16, 'triangle', 0.1, 0.07); },
  touch() { this.tone(740, 0.08, 'triangle', 0.08); },
  ok() { [660, 880, 1100].forEach((f, i) => this.tone(f, 0.18, 'triangle', 0.12, i * 0.08)); },
  bad() { this.tone(200, 0.25, 'sawtooth', 0.08); this.tone(150, 0.3, 'sawtooth', 0.07, 0.12); },
  mission() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.22, 'triangle', 0.13, i * 0.1)); },
  level() { [392, 523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, 0.25, 'square', 0.07, i * 0.09)); }
};

/* ---------- Ayudas de dibujo ---------- */
const noBg = parts => { const g = parts.geo; const out = parts.filter(q => !q.bg); out.geo = g; return out; };
function rrect(g, x, y, w, h, r) { Obj.rrPath(g, x, y, w, h, r); }

/* ============================================================================
   PERSONAS
   makeHuman arma a una persona con el generador de humanos (misma semilla →
   misma persona). El rol cambia la ropa (bata de médico, uniforme de policía…),
   la edad cambia el tamaño (niños) y el pelo (abuelos).
============================================================================ */
const FEM = ['Emma', 'Olivia', 'Mia', 'Sofia', 'Lucy', 'Grace', 'Chloe', 'Lily', 'Rosa', 'Ana', 'Nora', 'Ella', 'Zoe', 'Ruby', 'Ivy', 'Maya', 'Clara', 'Julia', 'Alice', 'Hannah'];
const MASC = ['Liam', 'Noah', 'Leo', 'Jack', 'Ben', 'Lucas', 'Tom', 'Max', 'Sam', 'Dan', 'Luis', 'Omar', 'Ethan', 'Owen', 'Hugo', 'Mateo', 'David', 'Oscar', 'Adam', 'Paul'];

function makeHuman(seed, poses, extra = {}) {
  const base = { ...Humano.config.presets['Aleatorio'], randomColors: true, variation: 0.5, smile: 0.5, ...extra };
  const h = { poses: {} };
  h.walkP = { ...base, pose: 'caminando', phase: Math.random() * 6 };
  h.walk = noBg(Humano.build(h.walkP, Gen.makeRand(seed)));
  poses.forEach(pose => {
    const p = { ...base, pose, phase: 0 };
    h.poses[pose] = { p, parts: noBg(Humano.build(p, Gen.makeRand(seed))) };
  });
  h.geo = h.walk.geo;
  h.alto = HUMAN_H * (base.height || 1);
  return h;
}

// Parámetros del generador según sexo, edad y rol
function aspecto(R, sexo, edad, rol, extra = {}) {
  const p = { smile: R.range(0.25, 0.95) };
  if (sexo === 'f') { p.hair = R.pick(['largo', 'moño', 'rizado', 'largo', 'afro']); p.beard = 'ninguna'; if (R.chance(0.45)) p.top = R.pick(['vestido', 'camiseta', 'camisa']); if (p.top !== 'vestido' && R.chance(0.4)) p.bottom = 'falda'; }
  else if (sexo === 'm') { p.hair = R.pick(['corto', 'corto', 'calvo', 'afro', 'mohicano', 'rizado']); p.beard = R.pick(['ninguna', 'ninguna', 'barba', 'bigote', 'candado']); p.bottom = R.pick(['pantalón', 'pantalón', 'shorts']); if (p.top === 'vestido') p.top = 'camiseta'; p.top = R.pick(['camiseta', 'camisa', 'suéter', 'abrigo']); }
  if (edad === 'niño') { p.height = R.range(0.6, 0.7); p.headSize = 1.2; p.beard = 'ninguna'; p.glasses = 'no'; p.smile = R.range(0.6, 1); if (!p.bottom) p.bottom = R.pick(['shorts', 'pantalón']); }
  if (edad === 'joven') { p.height = R.range(0.85, 0.95); p.beard = 'ninguna'; }
  if (edad === 'mayor') { p.randomColors = false; p.skinColor = R.pick(Rostro.SKINS); p.hairColor = R.pick(['#b5b5b5', '#e8e2d0', '#d6d6d6']); p.topColor = R.pick(Rostro.SHIRTS); p.bottomColor = R.pick(['#5d4037', '#34495e', '#6d6d6d']); p.glasses = R.pick(['redondas', 'cuadradas', 'no']); if (sexo === 'm' && R.chance(0.5)) p.hair = 'calvo'; p.height = R.range(0.92, 0.98); }
  const ropa = MundoDatos.ROPA[rol] || extra.ropa;
  if (ropa) {
    if (ropa.top) p.top = ropa.top;
    if (ropa.bottom) p.bottom = ropa.bottom;
    if (ropa.topColor || ropa.bottomColor) {
      p.randomColors = false;
      p.skinColor = p.skinColor || R.pick(Rostro.SKINS); p.hairColor = p.hairColor || R.pick(Rostro.HAIRS.slice(0, 6));
      p.topColor = ropa.topColor || R.pick(Rostro.SHIRTS); p.bottomColor = ropa.bottomColor || R.pick(['#2c3e50', '#34495e', '#1f3a60', '#5d4037']);
    }
    if (ropa.glasses) p.glasses = ropa.glasses;
  }
  if (p.top === 'vestido') p.bottom = 'vestido';
  return p;
}

function drawHuman(g, h, x, y, opts = {}) {
  const parts = opts.moving ? h.walk : (h.poses[opts.pose] || Object.values(h.poses)[0]).parts;
  const s = HUMAN_H / 820;
  const bob = opts.moving ? Math.abs(Math.sin(h.walkP.phase)) * 3 : 0;
  g.save();
  g.translate(x, y - bob - (opts.lift || 0));
  if (opts.rot) g.rotate(opts.rot);
  if (opts.sway) g.rotate(opts.sway);
  g.scale(s, s);
  g.translate(-300, -960);
  g.lineCap = 'round';
  g.lineJoin = 'round';
  parts.forEach(q => q(g));
  g.restore();
}

/* ---------- Accesorios del oficio (se dibujan encima de la persona) ---------- */
const { circle, ring, ell, rect, rr, poly, line, curve, text } = Obj;
const ACCESORIOS = {
  policeCap(g, x, top) { g.beginPath(); g.ellipse(x, top + 8, 13, 7, 0, Math.PI, 0); g.fillStyle = '#1a237e'; g.fill(); rect(g, x - 15, top + 7, 30, 4, '#0d1b3e'); circle(g, x, top + 3, 2.5, '#ffd54f'); },
  fireHelmet(g, x, top) { g.beginPath(); g.ellipse(x, top + 9, 14, 11, 0, Math.PI, 0); g.fillStyle = '#c62828'; g.fill(); ell(g, x, top + 9, 18, 3, '#b71c1c'); rect(g, x - 3, top - 1, 6, 8, '#ffd54f'); },
  hardHat(g, x, top) { g.beginPath(); g.ellipse(x, top + 9, 13, 10, 0, Math.PI, 0); g.fillStyle = '#fdd835'; g.fill(); ell(g, x, top + 9, 17, 3, '#f9a825'); },
  strawHat(g, x, top) { ell(g, x, top + 8, 20, 4, '#d4a017'); g.beginPath(); g.ellipse(x, top + 7, 10, 8, 0, Math.PI, 0); g.fillStyle = '#e0b43a'; g.fill(); rect(g, x - 10, top + 4, 20, 3, '#c62828'); },
  pilotCap(g, x, top) { g.beginPath(); g.ellipse(x, top + 8, 13, 7, 0, Math.PI, 0); g.fillStyle = '#1a237e'; g.fill(); rect(g, x - 15, top + 7, 30, 4, '#111'); rect(g, x - 5, top + 2, 10, 3, '#ffd54f'); },
  beret(g, x, top) { ell(g, x + 2, top + 5, 13, 6, '#c62828', -0.15); circle(g, x + 3, top - 1, 2, '#c62828'); },
  sunHat(g, x, top) { ell(g, x, top + 8, 20, 4, '#fff3e0'); g.beginPath(); g.ellipse(x, top + 7, 10, 8, 0, Math.PI, 0); g.fillStyle = '#fff8e1'; g.fill(); rect(g, x - 10, top + 4, 20, 3, '#26a69a'); },
  veil(g, x, top) { g.globalAlpha = 0.75; g.beginPath(); g.moveTo(x - 10, top + 4); g.quadraticCurveTo(x - 22, top + 40, x - 14, top + 60); g.lineTo(x + 14, top + 60); g.quadraticCurveTo(x + 22, top + 40, x + 10, top + 4); g.closePath(); g.fillStyle = '#ffffff'; g.fill(); g.globalAlpha = 1; circle(g, x - 6, top + 4, 3, '#f8bbd0'); circle(g, x + 6, top + 4, 3, '#f8bbd0'); },
  stethoscope(g, x, top, alto) { const y = top + alto * 0.28; curve(g, x - 8, y, x, y + 16, x + 8, y, '#37474f', 2); line(g, [[x, y + 12], [x + 2, y + 24]], '#37474f', 2); circle(g, x + 2, y + 26, 3, '#90a4ae'); },
  bowTie(g, x, top, alto) { const y = top + alto * 0.24; poly(g, [[x - 7, y - 4], [x, y], [x - 7, y + 4]], '#c62828'); poly(g, [[x + 7, y - 4], [x, y], [x + 7, y + 4]], '#c62828'); },
  tie(g, x, top, alto) { const y = top + alto * 0.25; poly(g, [[x - 3, y], [x + 3, y], [x + 4, y + 22], [x, y + 27], [x - 4, y + 22]], '#c62828'); },
  medal(g, x, top, alto) { const y = top + alto * 0.26; line(g, [[x - 7, y - 2], [x, y + 12], [x + 7, y - 2]], '#1e88e5', 2); circle(g, x, y + 15, 5, '#fdd835'); }
};

/* ---------- Lo que las personas llevan en las manos ----------
   Se dibuja respecto a los pies (x, y). Las manos quedan más o menos en:
   de pie (x±13, y−42) · sostener (x, y−56) · señalar (x+42, y−74) · brazo arriba (x+8, y−128). */
const PROPS = {
  spatula(g, x, y) { line(g, [[x + 4, y - 54], [x + 18, y - 80]], '#5d4037', 3); rr(g, x + 14, y - 92, 10, 14, 2, '#90a4ae'); },
  clipboard(g, x, y) { rr(g, x - 10, y - 74, 20, 26, 2, '#8d6e63'); rect(g, x - 8, y - 70, 16, 20, '#fff'); for (let k = 0; k < 3; k++) line(g, [[x - 6, y - 65 + k * 5], [x + 6, y - 65 + k * 5]], '#90a4ae', 1); line(g, [[x + 10, y - 56], [x + 16, y - 66]], '#1e88e5', 2); },
  chalk(g, x, y) { rect(g, x + 12, y - 44, 3, 8, '#fff59d'); },
  bookOpen(g, x, y) { poly(g, [[x - 18, y - 60], [x, y - 56], [x, y - 72], [x - 18, y - 76]], '#fffdf5'); poly(g, [[x + 18, y - 60], [x, y - 56], [x, y - 72], [x + 18, y - 76]], '#ffffff'); line(g, [[x - 19, y - 59], [x + 19, y - 59]], '#1565c0', 2); },
  bookClosed(g, x, y) { rr(g, x - 9, y - 72, 18, 22, 2, '#2e7d32'); rect(g, x - 9, y - 72, 4, 22, '#1b5e20'); },
  bookHand(g, x, y) { rr(g, x + 34, y - 84, 16, 20, 2, '#c62828'); rect(g, x + 34, y - 84, 4, 20, '#7f0000'); },
  pointer(g, x, y) { line(g, [[x + 40, y - 74], [x + 70, y - 96]], '#6d4c41', 2.5); },
  notebook(g, x, y) { rr(g, x - 9, y - 72, 18, 22, 2, '#43a047'); line(g, [[x + 9, y - 60], [x + 16, y - 70]], '#1e88e5', 2); },
  binoculars(g, x, y, t, h) { const hy = y - (h ? h.alto : 100) * 0.86; rr(g, x - 11, hy - 4, 9, 11, 3, '#37474f'); rr(g, x + 2, hy - 4, 9, 11, 3, '#37474f'); },
  water(g, x, y, t) { for (let k = 0; k < 3; k++) curve(g, x - 30 + k * 20, y - 4 + Math.sin(t * 3 + k) * 2, x - 20 + k * 20, y - 10, x - 10 + k * 20, y - 4 + Math.sin(t * 3 + k) * 2, 'rgba(255,255,255,.8)', 2); },
  ballUp(g, x, y, t) { const p = (t * 0.8) % 1; const bx = x + 20 + p * 120, by = y - 130 - Math.sin(p * Math.PI) * 60; circle(g, bx, by, 8, '#e53935'); ring(g, bx, by, 8, '#fff', 1.5); },
  ballCatch() { },
  sponge(g, x, y) { rr(g, x + 36, y - 82, 14, 10, 3, '#ffeb3b'); for (let k = 0; k < 3; k++) circle(g, x + 44 + k * 5, y - 88 - k * 4, 2.5, 'rgba(225,245,254,.9)'); rect(g, x - 34, y - 18, 22, 18, '#1e88e5'); },
  wrench(g, x, y) { line(g, [[x + 38, y - 72], [x + 54, y - 64]], '#90a4ae', 4); ring(g, x + 56, y - 63, 3, '#90a4ae', 2.5); },
  brick(g, x, y) { rr(g, x - 9, y - 62, 18, 9, 1, '#c0392b'); },
  shovel(g, x, y) { line(g, [[x + 2, y - 54], [x + 14, y - 8]], '#8d6e63', 3); poly(g, [[x + 9, y - 10], [x + 20, y - 12], [x + 18, y], [x + 10, y]], '#78909c'); },
  scissors(g, x, y) { line(g, [[x - 2, y - 58], [x + 12, y - 72]], '#b0bec5', 2.5); line(g, [[x + 2, y - 58], [x + 16, y - 68]], '#b0bec5', 2.5); ring(g, x - 3, y - 56, 3, '#e53935', 2); },
  gift(g, x, y) { rect(g, x - 11, y - 70, 22, 18, '#8e24aa'); rect(g, x - 2, y - 70, 4, 18, '#ffd54f'); rect(g, x - 11, y - 64, 22, 4, '#ffd54f'); },
  giftHand(g, x, y) { rect(g, x + 36, y - 86, 18, 16, '#43a047'); rect(g, x + 43, y - 86, 4, 16, '#ffd54f'); },
  balloons(g, x, y, t) { [['#ef5350', -10, 0], ['#42a5f5', 8, 0.7], ['#ffca28', 22, 1.4]].forEach(([c, dx, f]) => { const bx = x + 8 + dx + Math.sin(t * 1.3 + f) * 4, by = y - 190 - Math.abs(dx) * 0.6; line(g, [[x + 8, y - 128], [bx, by + 14]], '#9e9e9e', 1); ell(g, bx, by, 11, 14, c); }); },
  heart(g, x, y, t) { const s = 1 + Math.sin(t * 4) * 0.12, hy = y - 140; circle(g, x - 5 * s, hy, 5 * s, '#e91e63'); circle(g, x + 5 * s, hy, 5 * s, '#e91e63'); poly(g, [[x - 10 * s, hy + 2], [x + 10 * s, hy + 2], [x, hy + 12 * s]], '#e91e63'); },
  haha(g, x, y, t) { const p = (t * 0.7) % 1; g.globalAlpha = 1 - p; text(g, 'HA HA!', x + 10, y - 132 - p * 20, 12, '#e65100'); g.globalAlpha = 1; },
  tears(g, x, y, t, h) { const hy = y - (h ? h.alto : 100) * 0.84; for (const dx of [-5, 5]) { const p = (t * 1.5 + (dx > 0 ? 0.5 : 0)) % 1; ell(g, x + dx, hy + p * 14, 1.6, 2.6, '#4fc3f7'); } },
  sparkle(g, x, y, t) { const p = (t * 0.9) % 1; g.globalAlpha = 1 - p; text(g, '✨', x + 18, y - 120 - p * 14, 12, '#fdd835'); g.globalAlpha = 1; },
  money(g, x, y) { rr(g, x + 36, y - 80, 18, 10, 2, '#66bb6a'); text(g, '$', x + 45, y - 75, 7, '#1b5e20'); },
  letter(g, x, y) { rect(g, x + 34, y - 84, 20, 14, '#fff8e1'); poly(g, [[x + 34, y - 84], [x + 44, y - 77], [x + 54, y - 84]], '#ffe0b2'); },
  bouquet(g, x, y) { poly(g, [[x - 5, y - 44], [x + 5, y - 44], [x + 9, y - 64], [x - 9, y - 64]], '#81c784'); [[-6, -70, '#e91e63'], [2, -74, '#ffeb3b'], [8, -68, '#ab47bc'], [-1, -66, '#f06292']].forEach(([dx, dy, c]) => circle(g, x + dx, y + dy, 5, c)); },
  suitcase(g, x, y) { rr(g, x + 14, y - 34, 26, 32, 4, '#1565c0'); rect(g, x + 20, y - 40, 14, 3, '#0d47a1'); circle(g, x + 18, y, 2.5, '#37474f'); circle(g, x + 36, y, 2.5, '#37474f'); line(g, [[x + 14, y - 42], [x + 13, y - 44]], '#37474f', 2); },
  guitar(g, x, y) { g.save(); g.translate(x, y - 50); g.rotate(-0.9); ell(g, 0, 8, 11, 12, '#d35400'); ell(g, 0, -6, 8, 8, '#d35400'); circle(g, 0, 2, 3, '#3e2723'); line(g, [[0, -12], [0, -40]], '#5d4037', 4); g.restore(); },
  stethoscope(g, x, y) { circle(g, x + 42, y - 72, 4, '#90a4ae'); },
  mapHeld(g, x, y) { rect(g, x + 32, y - 90, 24, 18, '#fff9c4'); line(g, [[x + 36, y - 84], [x + 52, y - 78]], '#e53935', 1.5); line(g, [[x + 44, y - 90], [x + 44, y - 72]], '#90a4ae', 1); },
  speech(g, x, y, t) { if ((t % 3) < 2.2) { rr(g, x + 14, y - 150, 32, 18, 8, '#fff'); poly(g, [[x + 20, y - 133], [x + 26, y - 133], [x + 16, y - 124]], '#fff'); text(g, '…', x + 30, y - 142, 12, '#455a64'); } },
  mic(g, x, y) { line(g, [[x + 2, y - 56], [x + 6, y - 80]], '#263238', 3); rr(g, x + 2, y - 90, 9, 12, 4, '#37474f'); },
  sandwich(g, x, y) { g.save(); g.translate(x + 44, y - 70); g.scale(0.45, 0.45); Obj.O.sandwich.d(g); g.restore(); },
  shovelSmall(g, x, y) { PROPS.shovel(g, x, y); },
  flag(g, x, y, t) { line(g, [[x + 8, y - 124], [x + 8, y - 168]], '#5d4037', 2.5); poly(g, [[x + 8, y - 168], [x + 34 + Math.sin(t * 6) * 3, y - 160], [x + 8, y - 152]], '#43a047'); },
  stopSign(g, x, y) { line(g, [[x + 8, y - 124], [x + 8, y - 150]], '#5d4037', 3); const cx = x + 8, cy = y - 164; const pts = []; for (let k = 0; k < 8; k++) { const a = Math.PI / 8 + k * Math.PI / 4; pts.push([cx + Math.cos(a) * 16, cy + Math.sin(a) * 16]); } poly(g, pts, '#e53935'); text(g, 'STOP', cx, cy, 8, '#fff'); },
  thought(g, x, y, t) { circle(g, x + 16, y - 124, 3, '#fff'); circle(g, x + 24, y - 134, 5, '#fff'); ell(g, x + 40, y - 150, 16, 11, '#fff'); text(g, '?', x + 40, y - 150, 12, '#5d4037'); },
  laptop(g, x, y) { rr(g, x - 14, y - 74, 28, 18, 2, '#37474f'); rect(g, x - 12, y - 72, 24, 14, '#90caf9'); rect(g, x - 16, y - 57, 32, 4, '#b0bec5'); },
  tray(g, x, y) { ell(g, x, y - 58, 20, 4, '#b0bec5'); g.save(); g.translate(x - 6, y - 60); g.scale(0.45, 0.45); Obj.O.pizza.d(g); g.restore(); circle(g, x + 12, y - 66, 5, '#fff'); },
  card(g, x, y) { rr(g, x + 34, y - 86, 20, 14, 2, '#f8bbd0'); text(g, '♥', x + 44, y - 79, 8, '#e91e63'); },
  piggy(g, x, y) { g.save(); g.translate(x, y - 52); g.scale(0.6, 0.6); Obj.O.piggyBank.d(g); g.restore(); circle(g, x - 2, y - 76, 4, '#fbc02d'); },
  bags(g, x, y) { [[-26, '#e91e63'], [18, '#42a5f5']].forEach(([dx, c]) => { rr(g, x + dx - 2, y - 40, 14, 18, 2, c); curve(g, x + dx + 1, y - 40, x + dx + 5, y - 48, x + dx + 9, y - 40, '#37474f', 1.5); }); },
  hatOn(g, x, y, t, h) { const top = y - (h ? h.alto : 100) * 1.05; ell(g, x, top + 9, 20, 4, '#6a1b9a'); rr(g, x - 10, top - 6, 20, 15, 4, '#8e24aa'); rect(g, x - 10, top + 3, 20, 3, '#ffd54f'); },
  box(g, x, y) { rect(g, x - 16, y - 76, 32, 26, '#c8a27a'); line(g, [[x - 16, y - 66], [x + 16, y - 66]], '#a67c52', 2); },
  pizzaSlice(g, x, y) { poly(g, [[x - 8, y - 70], [x + 10, y - 74], [x + 2, y - 54]], '#ffd54f'); circle(g, x + 1, y - 68, 2, '#c62828'); line(g, [[x - 8, y - 70], [x + 10, y - 74]], '#e0a458', 3); },
  console(g, x, y) { rr(g, x - 14, y - 64, 28, 14, 5, '#263238'); rect(g, x - 5, y - 62, 10, 9, '#4fc3f7'); circle(g, x - 9, y - 57, 2, '#e53935'); circle(g, x + 9, y - 57, 2, '#43a047'); },
  seeds(g, x, y, t) { for (let k = 0; k < 5; k++) { const p = (t * 0.9 + k / 5) % 1; rect(g, x + 44 + p * 20, y - 72 + p * p * 70, 3, 3, '#d4a017'); } },
  sticks(g, x, y, t) { const a = Math.sin(t * 10) * 0.3; line(g, [[x - 20, y - 126], [x - 30, y - 146 + a * 10]], '#d7ccc8', 2.5); line(g, [[x + 20, y - 126], [x + 30, y - 146 - a * 10]], '#d7ccc8', 2.5); },
  headHold(g, x, y, t, h) { const hy = y - (h ? h.alto : 100) * 0.9; rr(g, x - 16, hy - 8, 10, 8, 3, '#81d4fa'); },
  thermometer(g, x, y, t, h) { const hy = y - (h ? h.alto : 100) * 0.78; line(g, [[x + 2, hy], [x + 16, hy - 4]], '#eceff1', 3); circle(g, x + 16, hy - 4, 2, '#e53935'); },
  coughHand(g, x, y, t, h) { const hy = y - (h ? h.alto : 100) * 0.8; circle(g, x + 4, hy, 5, 'rgba(0,0,0,0.12)'); if ((t % 2) < 0.4) text(g, 'cough!', x + 26, hy - 16, 9, '#607d8b'); },
  sling(g, x, y) { poly(g, [[x - 18, y - 78], [x + 8, y - 60], [x - 4, y - 50], [x - 20, y - 64]], '#fafafa'); line(g, [[x - 18, y - 80], [x + 10, y - 90]], '#fafafa', 3); }
};

// Caja visual extra de los accesorios que sobresalen (respecto a los pies)
const PROP_CAJA = {
  ballUp: [-10, -200, 170, 80], balloons: [-10, -210, 60, 90], flag: [0, -172, 44, 48], stopSign: [-10, -184, 38, 60], heart: [-14, -156, 28, 20],
  haha: [0, -150, 60, 24], thought: [10, -164, 50, 44], speech: [10, -154, 40, 32], sparkle: [10, -140, 30, 24], sticks: [-36, -150, 72, 30], sponge: [-36, -96, 100, 96],
  suitcase: [10, -48, 34, 48], bags: [-30, -50, 64, 50]
};
