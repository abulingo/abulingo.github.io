'use strict';

/* ============================================================================
   OBJETOS DE ENGLISH TOWN  ·  juego/objetos.js
   ----------------------------------------------------------------------------
   Cada palabra concreta del juego (salad, pizza, bed, jeans, lion…) tiene aquí
   su dibujo con canvas, en el mismo estilo plano de las casas y las personas.

   Convención: cada objeto se dibuja con el origen (0, 0) en el centro de su
   base, hacia arriba (y negativa). `w` y `h` son su caja visual: la usa el
   mundo para colocarlo sin que tape ni lo tapen otras cosas, y para saber
   dónde se tocó. `partes` (opcional) son zonas dentro del dibujo que enseñan
   otra palabra (la almohada de la cama, los meses del calendario…).
   Escala: una persona adulta mide 100.
============================================================================ */
const Obj = (() => {
  const TAU = Math.PI * 2;
  const sh = (c, a) => Gen.shade(c, a);
  const O = {};
  const def = (nombre, w, h, d, extra) => { O[nombre] = Object.assign({ w, h, d }, extra || {}); };

  /* ---------- Primitivas ---------- */
  function circle(g, x, y, r, c) { g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
  function ring(g, x, y, r, c, w) { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke(); }
  function ell(g, x, y, rx, ry, c, rot = 0) { g.fillStyle = c; g.beginPath(); g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, TAU); g.fill(); }
  function rect(g, x, y, w, h, c) { g.fillStyle = c; g.fillRect(x, y, w, h); }
  function rrPath(g, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    g.beginPath();
    g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }
  function rr(g, x, y, w, h, r, c) { rrPath(g, x, y, w, h, r); g.fillStyle = c; g.fill(); }
  function poly(g, pts, c) { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); g.fillStyle = c; g.fill(); }
  function line(g, pts, c, w, cap = 'round') {
    g.strokeStyle = c; g.lineWidth = w; g.lineCap = cap; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.stroke();
  }
  function curve(g, x0, y0, cx, cy, x1, y1, c, w) { g.strokeStyle = c; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(cx, cy, x1, y1); g.stroke(); }
  function text(g, s, x, y, size, c, peso = '800') {
    g.font = `${peso} ${size}px system-ui, -apple-system, "Segoe UI", sans-serif`;
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = c; g.fillText(s, x, y);
  }
  function emoji(g, s, x, y, size) {
    g.font = `${size}px system-ui, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#000'; g.fillText(s, x, y);
  }
  function brillo(g, x, y, rx, ry) { ell(g, x, y, rx, ry, 'rgba(255,255,255,0.4)', -0.5); }
  function sombra(g, w) { ell(g, 0, 0, w / 2, Math.max(2, w * 0.08), 'rgba(0,0,0,0.16)'); }
  function vapor(g, x, y, t, c = 'rgba(255,255,255,0.75)') {
    for (let k = 0; k < 2; k++) {
      const p = (t * 0.7 + k * 0.5) % 1;
      g.globalAlpha = 1 - p;
      curve(g, x + k * 6 - 3, y - p * 14, x + k * 6 + 3 + Math.sin(t * 3 + k) * 3, y - 8 - p * 14, x + k * 6 - 2, y - 16 - p * 14, c, 2);
    }
    g.globalAlpha = 1;
  }
  function etiqueta(g, s, x, y, w, h, fondo, color, tam) { rr(g, x - w / 2, y - h / 2, w, h, 3, fondo); text(g, s, x, y + 0.5, tam || Math.min(h * 0.62, 10), color); }
  // Pata / poste de madera
  const MADERA = '#8a6239', MADERA_OSC = '#6b4a2b', METAL = '#9aa5b1', METAL_OSC = '#5d6d7e';

  /* ======================================================================
     COMIDA Y BEBIDA
  ====================================================================== */
  def('apple', 30, 32, g => {
    circle(g, -5, -14, 11, '#e53935'); circle(g, 5, -14, 11, '#e53935'); circle(g, 0, -12, 12, '#d32f2f');
    brillo(g, -6, -19, 4, 2.5);
    line(g, [[0, -24], [2, -31]], '#6d4c41', 3);
    ell(g, 7, -29, 6, 3, '#43a047', -0.5);
  });
  def('banana', 46, 28, g => {
    for (let i = 0; i < 3; i++) {
      const y = -8 - i * 5;
      curve(g, -19, y - 8, -2, y + 8, 18, y - 10, '#fbc02d', 9);
      curve(g, -18, y - 9, -2, y + 5, 17, y - 11, '#fdd835', 5);
      circle(g, -19, y - 8, 2.2, '#5d4037');
    }
    rect(g, 15, -28, 6, 8, '#6d4c41');
  });
  def('grapes', 30, 40, g => {
    const filas = [[3, -28], [3, -20], [2, -12], [1, -5]];
    filas.forEach(([n, y], f) => { for (let i = 0; i < n; i++) { const x = (i - (n - 1) / 2) * 10; circle(g, x, y, 6, f % 2 ? '#6a1b9a' : '#7b1fa2'); circle(g, x - 2, y - 2, 1.6, 'rgba(255,255,255,.45)'); } });
    line(g, [[0, -34], [3, -39]], '#6d4c41', 3);
    ell(g, 8, -36, 6, 3, '#43a047', -0.3);
  });
  def('strawberry', 28, 32, g => {
    g.beginPath(); g.moveTo(0, -1); g.bezierCurveTo(-16, -10, -13, -26, 0, -25); g.bezierCurveTo(13, -26, 16, -10, 0, -1);
    g.fillStyle = '#e53935'; g.fill();
    [[-5, -17], [4, -19], [-1, -11], [6, -11], [-7, -10], [1, -6]].forEach(([x, y]) => ell(g, x, y, 1, 1.6, '#ffee58'));
    poly(g, [[-9, -24], [-3, -27], [0, -32], [3, -27], [9, -24], [0, -22]], '#43a047');
  });
  def('lemon', 36, 26, g => {
    ell(g, 0, -12, 15, 11, '#fdd835'); ell(g, -15, -12, 4, 3, '#fbc02d'); ell(g, 15, -12, 4, 3, '#fbc02d');
    brillo(g, -5, -17, 5, 2.5);
  });
  def('watermelon', 54, 34, g => {
    ell(g, 0, -16, 25, 16, '#2e7d32');
    for (let k = -2; k <= 2; k++) { g.save(); g.beginPath(); g.ellipse(0, -16, 25, 16, 0, 0, TAU); g.clip(); curve(g, k * 9, -32, k * 9 + 6, -16, k * 9, 0, '#1b5e20', 3); g.restore(); }
    brillo(g, -9, -24, 8, 3);
  });
  def('pineapple', 32, 54, g => {
    ell(g, 0, -17, 12, 17, '#f9a825');
    g.save(); g.beginPath(); g.ellipse(0, -17, 12, 17, 0, 0, TAU); g.clip();
    for (let k = -3; k <= 3; k++) { line(g, [[k * 7 - 12, 0], [k * 7 + 12, -34]], 'rgba(191,54,12,.5)', 1.5); line(g, [[k * 7 + 12, 0], [k * 7 - 12, -34]], 'rgba(191,54,12,.5)', 1.5); }
    g.restore();
    [[-8, -30, -12, -46], [-3, -32, -5, -52], [3, -32, 5, -52], [8, -30, 12, -46], [0, -32, 0, -54]].forEach(([a, b, c, d]) => poly(g, [[a - 3, b], [c, d], [a + 3, b]], '#43a047'));
  });
  def('cherry', 32, 36, g => {
    curve(g, -7, -9, -4, -24, 3, -32, '#6d4c41', 2.5); curve(g, 7, -8, 6, -22, 3, -32, '#6d4c41', 2.5);
    circle(g, -7, -8, 8, '#c62828'); circle(g, 7, -7, 8, '#b71c1c');
    circle(g, -9, -11, 2, 'rgba(255,255,255,.5)'); circle(g, 5, -10, 2, 'rgba(255,255,255,.5)');
    ell(g, 9, -31, 7, 3, '#43a047', -0.3);
  });
  def('potato', 38, 24, g => {
    ell(g, 0, -10, 17, 10, '#c49a6c'); ell(g, 6, -12, 10, 8, '#cfa574');
    [[-8, -12], [2, -7], [9, -13], [-3, -15]].forEach(([x, y]) => circle(g, x, y, 1.4, '#8d6e43'));
  });
  def('tomato', 32, 30, g => {
    ell(g, 0, -13, 14, 12, '#e53935'); brillo(g, -5, -17, 4, 2.5);
    poly(g, [[0, -26], [-7, -24], [-2, -23], [-5, -19], [0, -22], [5, -19], [2, -23], [7, -24]], '#388e3c');
    line(g, [[0, -25], [1, -30]], '#388e3c', 2);
  });
  def('carrot', 46, 30, g => {
    poly(g, [[-21, -4], [14, -20], [18, -8]], '#fb8c00');
    [[-8, -9, -4, -11], [0, -12, 3, -15], [8, -14, 11, -12]].forEach(([a, b, c, d]) => line(g, [[a, b], [c, d]], '#e65100', 1.5));
    poly(g, [[14, -16], [24, -30], [19, -14]], '#43a047'); poly(g, [[15, -13], [28, -22], [18, -10]], '#66bb6a'); poly(g, [[16, -17], [17, -30], [19, -16]], '#2e7d32');
  });
  def('onion', 32, 38, g => {
    g.beginPath(); g.moveTo(0, -30); g.bezierCurveTo(22, -20, 16, -1, 0, -1); g.bezierCurveTo(-16, -1, -22, -20, 0, -30);
    g.fillStyle = '#b5651d'; g.fill();
    curve(g, 0, -29, 10, -16, 3, -2, 'rgba(255,255,255,.3)', 2); curve(g, 0, -29, -9, -16, -3, -2, 'rgba(0,0,0,.15)', 2);
    line(g, [[0, -29], [1, -37]], '#8d6e63', 2.5);
    line(g, [[-3, 0], [-5, 3]], '#d7ccc8', 1.5); line(g, [[2, 0], [3, 3]], '#d7ccc8', 1.5);
  });
  def('corn', 32, 50, g => {
    poly(g, [[-3, 0], [-15, -30], [-8, -44], [-1, -8]], '#7cb342');
    ell(g, 2, -24, 8, 21, '#fdd835');
    for (let y = -40; y < -6; y += 5) for (let x = -3; x <= 7; x += 5) circle(g, x, y, 1.9, '#f9a825');
    poly(g, [[4, 0], [16, -28], [11, -42], [6, -8]], '#8bc34a');
  });
  def('pepper', 20, 40, g => { // pimienta: pimentero negro
    rr(g, -8, -30, 16, 30, 5, '#37474f'); rr(g, -7, -38, 14, 9, 4, '#b0bec5');
    [[-2, -35], [2, -35], [0, -33]].forEach(([x, y]) => circle(g, x, y, 1, '#263238'));
    text(g, 'P', 0, -15, 11, '#eceff1');
  });
  def('salt', 20, 40, g => {
    rr(g, -8, -30, 16, 30, 5, '#f5f5f5'); g.strokeStyle = '#cfd8dc'; g.lineWidth = 1.5; rrPath(g, -8, -30, 16, 30, 5); g.stroke();
    rr(g, -7, -38, 14, 9, 4, '#b0bec5');
    [[-2, -35], [2, -35], [0, -33]].forEach(([x, y]) => circle(g, x, y, 1, '#455a64'));
    text(g, 'S', 0, -15, 11, '#90a4ae');
  });
  def('cheese', 44, 28, g => {
    poly(g, [[-21, 0], [21, 0], [21, -14], [-21, -26]], '#fbc02d'); poly(g, [[-21, -26], [21, -14], [16, -12], [-21, -22]], '#fdd835');
    [[-10, -8, 3], [4, -6, 2.5], [12, -9, 2], [-2, -14, 2.2]].forEach(([x, y, r]) => circle(g, x, y, r, '#f9a825'));
  });
  def('egg', 42, 32, g => { // canasta con huevos
    ell(g, -9, -20, 7, 9, '#fff8e1'); ell(g, 0, -22, 7, 9, '#fffdf5'); ell(g, 9, -20, 7, 9, '#fff3e0');
    poly(g, [[-19, -16], [19, -16], [14, 0], [-14, 0]], '#a1887f');
    for (let x = -12; x <= 12; x += 6) line(g, [[x, -15], [x * 0.75, -1]], '#8d6e63', 1.5);
    line(g, [[-17, -9], [17, -9]], '#8d6e63', 1.5);
  });
  def('butter', 44, 24, g => {
    ell(g, 0, -4, 21, 5, '#eceff1'); rr(g, -14, -18, 28, 14, 2, '#ffe082'); rect(g, -14, -18, 11, 14, '#fff');
    text(g, 'BUTTER', 3, -11, 5.5, '#f57f17');
  });
  def('milk', 30, 52, g => {
    rect(g, -12, -36, 24, 36, '#ffffff'); rect(g, -12, -14, 24, 9, '#1e88e5');
    poly(g, [[-12, -36], [0, -48], [12, -36]], '#e3f2fd'); rect(g, -3, -52, 6, 5, '#1e88e5');
    text(g, 'MILK', 0, -26, 8, '#1565c0');
    g.strokeStyle = '#cfd8dc'; g.lineWidth = 1; g.strokeRect(-12, -36, 24, 36);
  });
  def('yogurt', 28, 32, g => {
    poly(g, [[-11, -26], [11, -26], [8, 0], [-8, 0]], '#fff'); rect(g, -10, -19, 20, 7, '#ec407a');
    ell(g, 0, -26, 12, 3, '#f06292'); circle(g, 0, -8, 3, '#e53935');
    g.strokeStyle = '#e0e0e0'; g.lineWidth = 1; g.beginPath(); g.moveTo(-11, -26); g.lineTo(-8, 0); g.lineTo(8, 0); g.lineTo(11, -26); g.stroke();
  });
  def('rice', 36, 44, g => {
    g.beginPath(); g.moveTo(-15, 0); g.lineTo(-16, -30); g.quadraticCurveTo(0, -38, 16, -30); g.lineTo(15, 0); g.closePath(); g.fillStyle = '#efe6d2'; g.fill();
    poly(g, [[-8, -33], [0, -44], [8, -33]], '#e0d4b8'); line(g, [[-9, -33], [9, -33]], '#a1887f', 2);
    etiqueta(g, 'RICE', 0, -16, 24, 11, '#c62828', '#fff', 7);
  });
  def('beans', 40, 26, g => {
    ell(g, 0, -9, 18, 5, '#8d6e63'); poly(g, [[-18, -9], [18, -9], [12, 0], [-12, 0]], '#795548');
    for (let i = 0; i < 9; i++) ell(g, -12 + (i % 5) * 6, -12 - Math.floor(i / 5) * 3, 3.2, 2, i % 2 ? '#6d2e1f' : '#8e3b27', 0.4);
  });
  def('sugar', 34, 42, g => {
    rr(g, -13, -32, 26, 32, 5, 'rgba(225,245,254,0.9)');
    for (let i = 0; i < 6; i++) rect(g, -10 + (i % 3) * 7, -14 - Math.floor(i / 3) * 7, 6, 6, '#fff');
    rr(g, -14, -38, 28, 7, 3, '#8d6e63'); etiqueta(g, 'SUGAR', 0, -24, 24, 8, '#ffffff', '#6d4c41', 6);
  });
  def('oil', 22, 54, g => {
    rr(g, -9, -36, 18, 36, 5, '#cddc39'); rect(g, -4, -46, 8, 11, '#c0ca33'); rect(g, -5, -52, 10, 6, '#c62828');
    etiqueta(g, 'OIL', 0, -18, 16, 10, '#fff', '#827717', 7); brillo(g, -5, -28, 2, 6);
  });
  def('honey', 32, 44, g => {
    rr(g, -13, -32, 26, 32, 7, '#ffa000'); rr(g, -14, -38, 28, 7, 3, '#fff3e0');
    etiqueta(g, 'HONEY', 0, -17, 22, 9, '#fffde7', '#e65100', 6);
    line(g, [[8, -34], [14, -44]], MADERA, 3); ell(g, 7, -32, 4, 3, '#6d4c41');
  });
  def('candy', 34, 48, g => {
    line(g, [[0, -24], [0, 0]], '#fafafa', 3);
    circle(g, 0, -34, 12, '#ec407a');
    g.strokeStyle = '#fff'; g.lineWidth = 3; g.beginPath();
    for (let a = 0; a < 12; a += 0.25) { const r = a; const x = Math.cos(a) * r, y = -34 + Math.sin(a) * r; if (a === 0) g.moveTo(x, y); else g.lineTo(x, y); }
    g.stroke();
    [[-12, -4, '#42a5f5'], [12, -4, '#ffca28']].forEach(([x, y, c]) => { ell(g, x, y, 6, 4, c); poly(g, [[x - 6, y], [x - 11, y - 4], [x - 11, y + 4]], c); poly(g, [[x + 6, y], [x + 11, y - 4], [x + 11, y + 4]], c); });
  });
  def('chocolate', 44, 26, g => {
    rr(g, -20, -22, 40, 22, 2, '#5d4037');
    for (let x = -18; x < 0; x += 9) for (let y = -20; y < -2; y += 9) rr(g, x, y, 7, 7, 1.5, '#6d4c41');
    rect(g, 0, -22, 20, 22, '#c62828'); rect(g, 0, -22, 20, 4, '#ffd54f');
    text(g, 'CHOCO', 10, -10, 5.5, '#fff');
  });
  def('nut', 40, 22, g => {
    [[-12, -6], [0, -5], [12, -6], [-6, -13], [6, -13]].forEach(([x, y], i) => {
      ell(g, x - 3, y, 5, 4.2, '#c8a165', i * 0.4); ell(g, x + 3, y, 5, 4.2, '#bf9555', i * 0.4); line(g, [[x - 2, y - 1], [x + 2, y + 1]], '#a1793f', 1);
    });
  });
  def('snack', 34, 44, g => {
    g.beginPath(); g.moveTo(-14, -2); for (let x = -14; x <= 14; x += 4) g.lineTo(x, x % 8 === 0 ? 0 : -3); g.lineTo(15, -38);
    for (let x = 14; x >= -14; x -= 4) g.lineTo(x, x % 8 === 0 ? -41 : -38); g.closePath(); g.fillStyle = '#ff7043'; g.fill();
    circle(g, 0, -21, 8, '#ffca28'); etiqueta(g, 'SNACK', 0, -8, 24, 8, '#fff', '#d84315', 6);
  });
  def('cookie', 36, 28, g => {
    for (let i = 0; i < 3; i++) { const y = -5 - i * 8; ell(g, 0, y, 16, 5, '#c8914f'); ell(g, 0, y - 1.5, 15, 3.8, '#d9a066'); [[-7, 0], [2, -1], [8, 1], [-2, 1]].forEach(([x, dy]) => circle(g, x, y - 1.5 + dy, 1.4, '#4e342e')); }
  });
  def('water', 26, 54, g => {
    rr(g, -10, -40, 20, 40, 6, 'rgba(129,212,250,0.85)'); rect(g, -4, -48, 8, 9, 'rgba(129,212,250,0.9)'); rect(g, -5, -53, 10, 6, '#1565c0');
    etiqueta(g, 'WATER', 0, -20, 20, 9, '#1e88e5', '#fff', 6); brillo(g, -5, -31, 2, 6);
  });
  def('juice', 28, 48, g => {
    rect(g, -12, -34, 24, 34, '#ffa726'); rect(g, -12, -34, 24, 5, '#fb8c00');
    circle(g, 0, -17, 7, '#ff9800'); circle(g, 0, -17, 5, '#ffcc80'); line(g, [[0, -17], [0, -12]], '#ff9800', 1);
    line(g, [[5, -34], [8, -46]], '#e91e63', 2.5);
    text(g, 'JUICE', 0, -5, 6, '#fff');
  });
  def('soda', 24, 38, g => {
    rr(g, -10, -34, 20, 34, 3, '#e53935'); rect(g, -9, -36, 18, 3, '#bdbdbd'); rect(g, -9, -1, 18, 2, '#bdbdbd');
    curve(g, -10, -14, 0, -22, 10, -18, '#fff', 3); brillo(g, -5, -24, 1.5, 7);
    text(g, 'SODA', 0, -8, 6, '#fff');
  });
  def('bottle', 22, 54, g => {
    rr(g, -9, -32, 18, 32, 5, '#2e7d32'); poly(g, [[-9, -30], [-4, -40], [4, -40], [9, -30]], '#2e7d32'); rect(g, -3, -52, 6, 13, '#2e7d32'); rect(g, -3.5, -54, 7, 4, '#c9a227');
    brillo(g, -5, -20, 2, 8);
  });
  def('glass', 26, 36, g => {
    poly(g, [[-11, -32], [11, -32], [8, 0], [-8, 0]], 'rgba(200,230,255,0.55)');
    poly(g, [[-10, -20], [10, -20], [8, 0], [-8, 0]], 'rgba(100,181,246,0.55)');
    g.strokeStyle = 'rgba(96,125,139,.8)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-11, -32); g.lineTo(-8, 0); g.lineTo(8, 0); g.lineTo(11, -32); g.stroke();
    brillo(g, -6, -18, 1.5, 9);
  });
  def('coffee', 34, 44, (g, t) => {
    rr(g, -12, -26, 22, 26, 4, '#ffffff'); ring(g, 11, -14, 6, '#ffffff', 3.5);
    ell(g, -1, -26, 11, 3, '#5d4037'); rect(g, -12, -12, 22, 4, '#6d4c41');
    g.strokeStyle = '#e0e0e0'; g.lineWidth = 1; rrPath(g, -12, -26, 22, 26, 4); g.stroke();
    vapor(g, -2, -29, t, 'rgba(160,160,160,0.7)');
  });
  def('tea', 46, 40, (g, t) => {
    ell(g, 0, -15, 16, 14, '#e8f5e9'); rect(g, -16, -15, 32, 14, '#e8f5e9'); ell(g, 0, -2, 15, 3, '#c8e6c9');
    poly(g, [[14, -14], [26, -26], [23, -27], [13, -20]], '#e8f5e9'); ring(g, -17, -15, 7, '#c8e6c9', 3);
    ell(g, 0, -29, 8, 3, '#a5d6a7'); circle(g, 0, -33, 3, '#81c784');
    [[-7, -14], [6, -10], [0, -18]].forEach(([x, y]) => circle(g, x, y, 2.5, '#66bb6a'));
    vapor(g, 26, -30, t, 'rgba(160,160,160,0.6)');
  });
  def('cup', 40, 26, g => {
    ell(g, 0, -3, 18, 4, '#fff'); ell(g, 0, -3, 18, 4, 'rgba(33,150,243,0.25)');
    poly(g, [[-12, -20], [12, -20], [9, -4], [-9, -4]], '#ffffff'); ring(g, 13, -13, 5, '#ffffff', 3);
    ell(g, 0, -20, 12, 3, '#eceff1'); line(g, [[-12, -17], [12, -17]], '#1e88e5', 2);
  });
  def('pizza', 58, 26, g => {
    ell(g, 0, -6, 28, 7, MADERA); rect(g, 26, -8, 10, 4, MADERA);
    ell(g, 0, -10, 25, 9, '#e0a458'); ell(g, 0, -11, 22, 7.5, '#e53935'); ell(g, 0, -11.5, 20, 6.5, '#ffd54f');
    [[-12, -11], [-3, -14], [7, -10], [13, -13], [0, -8], [-8, -15]].forEach(([x, y]) => ell(g, x, y, 3.2, 2, '#c62828'));
    [[-6, -9], [10, -15], [3, -12]].forEach(([x, y]) => ell(g, x, y, 1.6, 1, '#43a047'));
  });
  def('pasta', 56, 28, g => {
    ell(g, 0, -5, 26, 6, '#ffffff'); ell(g, 0, -6, 20, 4, '#eceff1');
    for (let i = 0; i < 7; i++) curve(g, -15 + i * 5, -6, -10 + i * 4, -22 - (i % 3) * 3, -4 + i * 3, -8, '#ffe082', 2);
    ell(g, 2, -18, 9, 4, '#d84315'); circle(g, -3, -19, 3.5, '#6d4c41'); circle(g, 6, -18, 3.5, '#5d4037'); ell(g, 1, -23, 2, 1, '#43a047');
  });
  def('soup', 48, 36, (g, t) => {
    g.beginPath(); g.ellipse(0, -16, 21, 16, 0, 0, Math.PI); g.fillStyle = '#e57373'; g.fill();
    ell(g, 0, -16, 21, 5, '#ffb74d'); [[-8, -16], [5, -17], [10, -15]].forEach(([x, y]) => circle(g, x, y, 2.2, '#ff7043'));
    ell(g, 0, -1, 10, 2.5, '#c62828'); vapor(g, -2, -20, t);
  });
  def('salad', 50, 34, g => {
    [[-10, -18, '#66bb6a'], [0, -22, '#43a047'], [10, -18, '#81c784'], [-4, -16, '#9ccc65'], [6, -15, '#7cb342']].forEach(([x, y, c]) => circle(g, x, y, 8, c));
    circle(g, -6, -21, 3.5, '#e53935'); circle(g, 8, -21, 3.5, '#e53935'); ring(g, 2, -17, 3, '#dce775', 2);
    g.beginPath(); g.ellipse(0, -14, 22, 14, 0, 0, Math.PI); g.fillStyle = '#4fc3f7'; g.fill(); ell(g, 0, -14, 22, 3, 'rgba(255,255,255,.4)');
  });
  def('meat', 56, 22, g => {
    ell(g, 0, -5, 26, 6, '#ffffff'); ell(g, 0, -6, 20, 4, '#eceff1');
    g.beginPath(); g.moveTo(-16, -8); g.bezierCurveTo(-18, -18, 4, -20, 15, -14); g.bezierCurveTo(19, -10, 10, -6, -16, -8); g.fillStyle = '#8d4b2d'; g.fill();
    for (let k = 0; k < 3; k++) line(g, [[-9 + k * 7, -9], [-5 + k * 7, -17]], '#5d2e1a', 2);
    ell(g, 16, -8, 3, 2, '#43a047');
  });
  def('sandwich', 44, 34, g => {
    poly(g, [[-20, 0], [20, 0], [0, -30]], '#f3d7a1');
    poly(g, [[-18, -4], [18, -4], [0, -26]], '#fff3e0');
    line(g, [[-15, -8], [15, -8]], '#66bb6a', 4); line(g, [[-12, -12], [12, -12]], '#e53935', 3); line(g, [[-9, -16], [9, -16]], '#ffca28', 3);
    poly(g, [[-20, 0], [20, 0], [0, -30]], 'rgba(0,0,0,0)');
    g.strokeStyle = '#d7a86e'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(-20, 0); g.lineTo(0, -30); g.lineTo(20, 0); g.closePath(); g.stroke();
  });
  def('hamburger', 44, 38, g => {
    g.beginPath(); g.ellipse(0, -22, 19, 13, 0, Math.PI, 0); g.fillStyle = '#e0a458'; g.fill();
    [[-8, -30], [0, -32], [7, -29], [-3, -27]].forEach(([x, y]) => ell(g, x, y, 1.6, 1, '#fff8e1'));
    line(g, [[-20, -19], [20, -19]], '#66bb6a', 5); rect(g, -19, -18, 38, 3, '#ffca28');
    rr(g, -19, -15, 38, 7, 3, '#6d4c41'); rr(g, -18, -8, 36, 7, 3, '#e0a458');
  });
  def('fries', 32, 46, g => {
    for (let i = 0; i < 7; i++) rr(g, -11 + i * 3.5, -40 + (i % 3) * 4, 3.5, 24, 1, i % 2 ? '#ffd54f' : '#ffca28');
    poly(g, [[-14, -22], [14, -22], [11, 0], [-11, 0]], '#e53935'); circle(g, 0, -12, 4.5, '#ffd54f'); ell(g, 0, -12, 2, 3, '#e53935');
  });
  def('sausage', 48, 22, g => {
    ell(g, 0, -6, 21, 6, '#e0a458'); rr(g, -22, -15, 44, 8, 4, '#b5462d');
    g.strokeStyle = '#ffd600'; g.lineWidth = 2; g.beginPath(); for (let x = -16; x <= 16; x += 4) g.lineTo(x, -11 + (x % 8 === 0 ? -2 : 2)); g.stroke();
    ell(g, 0, -4, 20, 3, '#d4964a');
  });
  def('bread', 52, 32, g => {
    g.beginPath(); g.moveTo(-24, 0); g.bezierCurveTo(-26, -26, 26, -30, 24, 0); g.closePath(); g.fillStyle = '#c67c3a'; g.fill();
    for (let k = 0; k < 3; k++) curve(g, -12 + k * 10, -14, -7 + k * 10, -22, -2 + k * 10, -15, '#f3c887', 3);
    brillo(g, -10, -18, 7, 3);
  });
  def('cake', 52, 48, g => {
    rr(g, -22, -20, 44, 20, 4, '#f8bbd0'); rr(g, -17, -36, 34, 17, 4, '#fce4ec');
    for (let x = -20; x <= 20; x += 8) ell(g, x, -20, 4, 3, '#fff');
    for (let x = -15; x <= 15; x += 7.5) ell(g, x, -36, 3.5, 2.5, '#fff');
    [[-8, -40], [0, -41], [8, -40]].forEach(([x, y]) => circle(g, x, y, 3, '#d50000'));
    rect(g, -22, -10, 44, 3, '#ec407a');
  });
  def('dessert', 34, 46, g => {
    poly(g, [[-13, -34], [13, -34], [7, -12], [-7, -12]], 'rgba(225,245,254,.8)');
    poly(g, [[-12, -31], [12, -31], [10, -24], [-10, -24]], '#8d6e63'); poly(g, [[-10, -24], [10, -24], [8, -17], [-8, -17]], '#fff59d'); poly(g, [[-8, -17], [8, -17], [7, -13], [-7, -13]], '#f48fb1');
    rect(g, -2, -12, 4, 9, 'rgba(225,245,254,.9)'); ell(g, 0, -2, 9, 2.5, 'rgba(225,245,254,.9)');
    circle(g, -5, -37, 6, '#fff'); circle(g, 5, -37, 6, '#fff'); circle(g, 0, -40, 6, '#fff'); circle(g, 0, -45, 3.5, '#d50000');
  });
  def('breakfast', 60, 24, g => {
    ell(g, 0, -5, 28, 7, '#ffffff'); ell(g, 0, -6, 22, 5, '#eceff1');
    ell(g, -10, -8, 8, 4, '#fff'); circle(g, -10, -9, 3, '#ffb300'); ell(g, 3, -7, 7, 3.5, '#fff'); circle(g, 3, -8, 2.6, '#ffb300');
    line(g, [[10, -10], [20, -7]], '#c0392b', 3); line(g, [[10, -6], [20, -4]], '#d35400', 3);
    rr(g, -24, -20, 12, 12, 3, '#e0a458'); rr(g, -22, -18, 8, 8, 2, '#f3d7a1');
  });
  def('cereal', 48, 32, g => {
    [[-10, -16], [-3, -19], [5, -17], [11, -15], [0, -14], [-7, -13], [8, -20]].forEach(([x, y], i) => ring(g, x, y, 3, ['#ffb74d', '#ef5350', '#ffd54f', '#81c784'][i % 4], 2.2));
    line(g, [[12, -14], [22, -28]], '#bdbdbd', 3); ell(g, 22, -29, 3, 2, '#bdbdbd');
    g.beginPath(); g.ellipse(0, -13, 21, 13, 0, 0, Math.PI); g.fillStyle = '#7e57c2'; g.fill(); ell(g, 0, -13, 21, 3, 'rgba(255,255,255,.55)');
  });
  def('plate', 56, 18, g => { ell(g, 0, -7, 26, 7, '#fafafa'); ell(g, 0, -7.5, 18, 4.2, '#eceff1'); g.strokeStyle = '#cfd8dc'; g.lineWidth = 1; g.beginPath(); g.ellipse(0, -7, 26, 7, 0, 0, TAU); g.stroke(); });
  def('fork', 18, 50, g => {
    rr(g, -2.5, -32, 5, 32, 2, '#b0bec5'); rr(g, -7, -38, 14, 7, 3, '#b0bec5');
    for (let k = -1; k <= 2; k++) rect(g, -7 + (k + 1) * 4, -50, 2.2, 13, '#b0bec5');
    brillo(g, -1, -18, 1, 8);
  });
  def('knife', 16, 52, g => { rr(g, -3, -22, 6, 22, 2, '#5d4037'); g.beginPath(); g.moveTo(-3, -22); g.lineTo(-3, -48); g.quadraticCurveTo(5, -44, 3, -22); g.closePath(); g.fillStyle = '#cfd8dc'; g.fill(); });
  def('spoon', 18, 52, g => { rr(g, -2.5, -34, 5, 34, 2, '#b0bec5'); ell(g, 0, -42, 7, 10, '#b0bec5'); ell(g, -1, -43, 4, 7, '#cfd8dc'); });
  def('menu', 56, 76, g => {
    line(g, [[-20, 0], [-10, -70]], MADERA, 4); line(g, [[20, 0], [10, -70]], MADERA, 4);
    rr(g, -24, -70, 48, 54, 4, MADERA); rr(g, -21, -67, 42, 48, 3, '#263238');
    text(g, 'MENU', 0, -58, 11, '#fff');
    for (let k = 0; k < 4; k++) { line(g, [[-15, -48 + k * 8], [8, -48 + k * 8]], 'rgba(255,255,255,.6)', 1.5); text(g, '$', 13, -48 + k * 8, 7, '#ffd54f'); }
  });
  def('lunch', 36, 42, g => {
    poly(g, [[-15, 0], [15, 0], [14, -30], [-14, -30]], '#c8a27a'); poly(g, [[-14, -30], [14, -30], [11, -38], [-11, -38]], '#b58d63');
    text(g, 'LUNCH', 0, -15, 7, '#6d4c41'); ell(g, 8, -36, 5, 5, '#e53935');
  });
  def('dinnerSign', 62, 70, g => {
    line(g, [[0, 0], [0, -30]], MADERA_OSC, 5);
    rr(g, -29, -68, 58, 42, 6, '#3e2723'); rr(g, -26, -65, 52, 36, 4, '#4e342e');
    text(g, 'DINNER', 0, -54, 10, '#ffd54f'); text(g, '6 – 10 PM', 0, -40, 8, '#fff');
  });
  def('meal', 64, 40, g => {
    rr(g, -30, -6, 60, 6, 2, '#ef5350');
    O.hamburger.d(g); g.save(); g.translate(20, 0); g.scale(0.6, 0.6); O.fries.d(g); g.restore();
    g.save(); g.translate(-22, 0); g.scale(0.65, 0.65); O.soda.d(g); g.restore();
  });
  def('iceCream', 34, 52, g => {
    poly(g, [[-10, -28], [10, -28], [0, 0]], '#d9a066');
    for (let k = -1; k <= 1; k++) { line(g, [[k * 6 - 4, -26], [k * 6 + 3, -10]], '#b37a3f', 1.2); }
    circle(g, -5, -32, 8, '#f48fb1'); circle(g, 5, -32, 8, '#fff59d'); circle(g, 0, -41, 8, '#a1887f'); circle(g, 0, -49, 3, '#d50000');
  });

  /* ======================================================================
     LA CASA
  ====================================================================== */
  def('bed', 144, 66, g => {
    rr(g, -70, -66, 12, 66, 3, MADERA); rr(g, 58, -44, 12, 44, 3, MADERA);
    rr(g, -60, -30, 120, 18, 4, '#eceff1'); rect(g, -60, -14, 120, 6, MADERA_OSC);
    rr(g, -60, -40, 120, 14, 6, '#fafafa');
    rr(g, -56, -52, 34, 16, 8, '#ffffff'); g.strokeStyle = '#cfd8dc'; g.lineWidth = 1.5; rrPath(g, -56, -52, 34, 16, 8); g.stroke();
    rr(g, -24, -44, 84, 30, 6, '#5c6bc0'); for (let x = -18; x < 56; x += 14) line(g, [[x, -42], [x, -16]], '#7986cb', 3);
    rect(g, -66, -8, 6, 8, MADERA_OSC); rect(g, 60, -8, 6, 8, MADERA_OSC);
  }, { partes: { pillow: [-58, -54, 38, 20], blanket: [-24, -46, 84, 32] } });
  def('sofa', 128, 60, g => {
    rr(g, -60, -52, 120, 30, 10, '#e07a5f'); rr(g, -64, -40, 20, 34, 8, '#d0664b'); rr(g, 44, -40, 20, 34, 8, '#d0664b');
    rr(g, -46, -30, 92, 20, 6, '#f0917a'); line(g, [[0, -30], [0, -12]], '#d0664b', 2);
    rect(g, -58, -8, 6, 8, MADERA_OSC); rect(g, 52, -8, 6, 8, MADERA_OSC);
  });
  def('table', 100, 50, g => {
    rr(g, -48, -50, 96, 10, 3, MADERA); rect(g, -44, -40, 7, 40, MADERA_OSC); rect(g, 37, -40, 7, 40, MADERA_OSC);
    rect(g, -44, -42, 88, 3, MADERA_OSC);
  });
  def('chair', 42, 66, g => {
    rect(g, -16, -66, 6, 66, MADERA_OSC); rr(g, -16, -64, 30, 8, 3, MADERA); rr(g, -16, -52, 30, 6, 3, MADERA);
    rr(g, -16, -32, 34, 7, 2, MADERA); rect(g, 12, -26, 5, 26, MADERA_OSC);
  });
  def('lamp', 44, 100, (g, t, s) => {
    ell(g, 0, -3, 14, 4, '#455a64'); rect(g, -2, -80, 4, 78, '#546e7a');
    if (s && s.noche) { g.fillStyle = 'rgba(255,224,130,0.35)'; g.beginPath(); g.moveTo(-18, -78); g.lineTo(18, -78); g.lineTo(34, -8); g.lineTo(-34, -8); g.closePath(); g.fill(); }
    poly(g, [[-12, -100], [12, -100], [20, -78], [-20, -78]], '#fff3e0'); line(g, [[-20, -78], [20, -78]], '#ffcc80', 2);
  });
  def('lightBulb', 30, 46, (g, t) => {
    rect(g, -12, -6, 24, 6, '#795548');
    rr(g, -6, -18, 12, 12, 2, '#9e9e9e'); for (let y = -16; y < -6; y += 3) line(g, [[-6, y], [6, y]], '#757575', 1);
    circle(g, 0, -30, 12, `rgba(255,${230 + Math.round(Math.sin(t * 4) * 15)},130,1)`);
    line(g, [[-3, -22], [-3, -30], [3, -30], [3, -22]], '#ff8f00', 1.5); brillo(g, -4, -35, 3, 5);
  });
  def('clock', 42, 50, (g, t, s) => {
    rr(g, -18, -50, 36, 44, 8, MADERA); circle(g, 0, -30, 14, '#fffdf5'); ring(g, 0, -30, 14, '#5d4037', 2);
    const h = s && s.hora != null ? s.hora : 3, m = s && s.min != null ? s.min : 0;
    const ah = ((h % 12) + m / 60) / 12 * TAU, am = m / 60 * TAU;
    line(g, [[0, -30], [Math.sin(ah) * 7, -30 - Math.cos(ah) * 7]], '#263238', 2.5);
    line(g, [[0, -30], [Math.sin(am) * 11, -30 - Math.cos(am) * 11]], '#263238', 1.8);
    rect(g, -14, -6, 5, 6, MADERA_OSC); rect(g, 9, -6, 5, 6, MADERA_OSC);
  });
  def('mirror', 48, 90, g => {
    line(g, [[-16, 0], [-10, -30]], MADERA_OSC, 4); line(g, [[16, 0], [10, -30]], MADERA_OSC, 4);
    ell(g, 0, -52, 20, 36, MADERA); ell(g, 0, -52, 16, 32, '#b3e5fc'); ell(g, -5, -62, 5, 16, 'rgba(255,255,255,.55)', 0.2);
  });
  def('picture', 60, 70, g => {
    line(g, [[-18, 0], [0, -68]], MADERA_OSC, 4); line(g, [[18, 0], [0, -68]], MADERA_OSC, 4);
    rect(g, -26, -64, 52, 40, '#c9a227'); rect(g, -22, -60, 44, 32, '#81d4fa');
    poly(g, [[-22, -28], [-8, -46], [4, -34], [12, -42], [22, -28]], '#66bb6a'); circle(g, 12, -52, 4, '#ffee58');
  });
  def('shelf', 66, 80, g => {
    rect(g, -30, -80, 60, 80, MADERA); rect(g, -26, -76, 52, 72, MADERA_OSC);
    [-54, -28].forEach(y => rect(g, -26, y, 52, 4, MADERA));
    ['#c62828', '#1565c0', '#2e7d32', '#f9a825', '#6a1b9a'].forEach((c, i) => rect(g, -24 + i * 7, -74, 6, 20, c));
    ell(g, 12, -34, 9, 3, '#8d6e63'); circle(g, 12, -40, 6, '#43a047'); circle(g, 8, -44, 4, '#66bb6a');
    rr(g, -22, -22, 18, 16, 2, '#bcaaa4');
  });
  def('box', 48, 40, g => {
    rect(g, -22, -30, 44, 30, '#c8a27a'); poly(g, [[-22, -30], [-28, -40], [-6, -40], [0, -30]], '#b58d63'); poly(g, [[22, -30], [28, -40], [6, -40], [0, -30]], '#a67c52');
    line(g, [[-22, -18], [22, -18]], '#a67c52', 2); text(g, 'THINGS', 0, -10, 7, '#6d4c41');
  });
  def('closet', 68, 120, g => {
    rr(g, -32, -120, 64, 116, 4, MADERA); line(g, [[0, -116], [0, -8]], MADERA_OSC, 2);
    rect(g, -28, -116, 26, 108, '#a1784f'); rect(g, 2, -116, 26, 108, '#a1784f');
    circle(g, -5, -62, 2.5, '#ffd54f'); circle(g, 5, -62, 2.5, '#ffd54f');
    rect(g, -30, -4, 8, 4, MADERA_OSC); rect(g, 22, -4, 8, 4, MADERA_OSC);
  });
  def('drawer', 66, 66, g => {
    rr(g, -30, -62, 60, 58, 3, MADERA);
    [-56, -38, -20].forEach((y, i) => { rect(g, -26 + (i === 1 ? -6 : 0), y, 52 + (i === 1 ? 6 : 0), 15, i === 1 ? '#b58d63' : '#a1784f'); circle(g, i === 1 ? -6 : 0, y + 7, 2.5, '#ffd54f'); });
    rect(g, -28, -4, 6, 4, MADERA_OSC); rect(g, 22, -4, 6, 4, MADERA_OSC);
  });
  def('curtain', 70, 100, g => {
    line(g, [[-22, 0], [-22, -92]], MADERA_OSC, 4); line(g, [[22, 0], [22, -92]], MADERA_OSC, 4); line(g, [[-28, 0], [-16, 0]], MADERA_OSC, 4); line(g, [[16, 0], [28, 0]], MADERA_OSC, 4);
    rect(g, -18, -88, 36, 44, '#b3e5fc'); line(g, [[0, -88], [0, -44]], '#fff', 2); line(g, [[-18, -66], [18, -66]], '#fff', 2);
    line(g, [[-30, -94], [30, -94]], '#6d4c41', 3);
    g.beginPath(); g.moveTo(-30, -94); g.lineTo(-10, -94); g.quadraticCurveTo(-18, -60, -26, -30); g.lineTo(-30, -30); g.closePath(); g.fillStyle = '#e57373'; g.fill();
    g.beginPath(); g.moveTo(30, -94); g.lineTo(10, -94); g.quadraticCurveTo(18, -60, 26, -30); g.lineTo(30, -30); g.closePath(); g.fillStyle = '#e57373'; g.fill();
  });
  def('carpet', 100, 20, g => {
    ell(g, 0, -8, 48, 9, '#c0392b'); ell(g, 0, -8, 40, 6.5, '#f5b041'); ell(g, 0, -8, 30, 4.5, '#c0392b'); ell(g, 0, -8, 12, 2.2, '#f5b041');
    for (let x = -44; x <= 44; x += 8) line(g, [[x, -1], [x, 1]], '#f5b041', 1.5);
  });
  def('television', 66, 66, (g, t) => {
    rect(g, -24, -6, 5, 6, '#37474f'); rect(g, 19, -6, 5, 6, '#37474f'); rr(g, -28, -14, 56, 8, 2, '#546e7a');
    rr(g, -31, -62, 62, 46, 4, '#263238');
    const c = ['#4fc3f7', '#81c784', '#ffb74d', '#ba68c8'][Math.floor(t / 2.5) % 4];
    rect(g, -27, -58, 54, 38, c); circle(g, -10 + Math.sin(t) * 6, -44, 6, 'rgba(255,255,255,.7)'); rect(g, -27, -30, 54, 10, 'rgba(0,0,0,.18)');
  });
  def('radio', 50, 40, (g, t) => {
    line(g, [[10, -26], [22, -40]], '#90a4ae', 2);
    rr(g, -22, -28, 44, 28, 5, '#c0392b'); circle(g, -10, -14, 8, '#37474f'); circle(g, -10, -14, 4, '#546e7a');
    rr(g, 2, -22, 16, 8, 2, '#fff8e1'); circle(g, 6, -8, 2.5, '#fff'); circle(g, 14, -8, 2.5, '#fff');
    const p = (t * 0.6) % 1; g.globalAlpha = 1 - p; text(g, '♪', -10 + p * 10, -34 - p * 18, 12, '#8e44ad'); g.globalAlpha = 1;
  });
  def('phone', 26, 44, g => {
    poly(g, [[-10, 0], [10, 0], [4, -10], [-4, -10]], '#90a4ae');
    rr(g, -10, -44, 20, 36, 4, '#212121'); rect(g, -8, -40, 16, 26, '#4fc3f7'); circle(g, 0, -11, 1.8, '#616161');
    [[-5, -35], [0, -35], [5, -35], [-5, -29], [0, -29], [5, -29]].forEach(([x, y]) => rr(g, x - 2, y - 2, 4, 4, 1, '#fff'));
  });
  def('camera', 40, 32, g => {
    rr(g, -18, -26, 36, 24, 4, '#37474f'); rect(g, -8, -30, 12, 5, '#37474f'); circle(g, 2, -14, 8, '#263238'); circle(g, 2, -14, 5, '#607d8b'); circle(g, 0, -16, 1.8, '#fff');
    rect(g, 10, -24, 5, 3, '#ffeb3b');
  });
  def('computer', 58, 42, g => {
    poly(g, [[-26, 0], [26, 0], [22, -6], [-22, -6]], '#b0bec5');
    rr(g, -21, -40, 42, 34, 3, '#37474f'); rect(g, -18, -37, 36, 26, '#e3f2fd');
    rect(g, -16, -35, 32, 5, '#1e88e5'); for (let k = 0; k < 3; k++) rect(g, -15, -27 + k * 5, 20 - k * 4, 2.5, '#90a4ae');
  });
  def('wallet', 36, 26, g => {
    rr(g, -16, -22, 32, 22, 4, '#6d4c41'); rr(g, -16, -22, 32, 9, 4, '#5d4037'); rect(g, -10, -26, 16, 6, '#81c784'); circle(g, 11, -12, 2.5, '#ffd54f');
  });
  def('candle', 18, 46, (g, t) => {
    ell(g, 0, -2, 9, 3, '#bdbdbd'); rr(g, -6, -28, 12, 26, 2, '#fff3e0'); line(g, [[0, -28], [0, -31]], '#424242', 1.5);
    const f = 1 + Math.sin(t * 12) * 0.12; ell(g, 0, -37, 3.5 * f, 7 * f, '#ffb300'); ell(g, 0, -35, 1.8, 3.5, '#fff59d');
  });
  def('key', 40, 24, g => {
    ring(g, -11, -12, 7, '#ffca28', 4); rect(g, -4, -14, 22, 4, '#ffca28'); rect(g, 12, -10, 3, 6, '#ffca28'); rect(g, 17, -10, 3, 5, '#ffca28');
  });
  def('fridge', 56, 108, g => {
    rr(g, -24, -108, 48, 104, 6, '#eceff1'); line(g, [[-24, -70], [24, -70]], '#b0bec5', 2);
    rect(g, 14, -100, 4, 22, '#90a4ae'); rect(g, 14, -62, 4, 28, '#90a4ae');
    rr(g, -16, -96, 12, 10, 2, '#ef9a9a'); rr(g, -12, -52, 10, 12, 2, '#fff59d');
    rect(g, -20, -4, 8, 4, '#607d8b'); rect(g, 12, -4, 8, 4, '#607d8b');
  });
  def('stove', 66, 78, (g, t) => {
    rr(g, -30, -60, 60, 56, 3, '#f5f5f5'); rect(g, -30, -64, 60, 6, '#bdbdbd'); rr(g, -30, -78, 60, 14, 2, '#cfd8dc');
    [-18, -6, 6, 18].forEach(x => circle(g, x, -71, 2.5, '#607d8b'));
    ell(g, -14, -64, 9, 2.5, '#37474f'); ell(g, 14, -64, 9, 2.5, '#37474f');
    ell(g, -14, -65, 7, 1.6, `rgba(255,${120 + Math.round(Math.sin(t * 8) * 40)},60,.9)`);
    rr(g, -24, -50, 48, 38, 3, '#263238'); rr(g, -19, -45, 38, 26, 2, '#ff8a65'); rect(g, -18, -54, 36, 3, '#9e9e9e');
    rect(g, -26, -4, 6, 4, '#607d8b'); rect(g, 20, -4, 6, 4, '#607d8b');
  }, { partes: { stove: [-30, -80, 60, 22], oven: [-26, -56, 52, 48] } });
  def('pot', 50, 36, (g, t) => {
    rr(g, -18, -26, 36, 26, 4, '#546e7a'); rect(g, -24, -22, 7, 4, '#37474f'); rect(g, 17, -22, 7, 4, '#37474f');
    ell(g, 0, -26, 19, 4, '#78909c'); rect(g, -3, -34, 6, 7, '#37474f'); brillo(g, -10, -14, 2, 7); vapor(g, 8, -30, t);
  });
  def('pan', 64, 20, g => {
    ell(g, -8, -8, 22, 7, '#37474f'); ell(g, -8, -9, 18, 5, '#546e7a'); rr(g, 12, -11, 22, 5, 2, '#212121');
    ell(g, -8, -10, 7, 3, '#fff'); circle(g, -8, -10.5, 2.2, '#ffb300');
  });
  def('sink', 58, 68, g => {
    rr(g, -26, -44, 52, 44, 3, '#90caf9'); rect(g, -22, -38, 20, 34, '#bbdefb'); rect(g, 2, -38, 20, 34, '#bbdefb'); circle(g, -6, -22, 2, '#1565c0'); circle(g, 6, -22, 2, '#1565c0');
    rr(g, -28, -50, 56, 8, 3, '#eceff1'); ell(g, 0, -50, 16, 3, '#cfd8dc');
    line(g, [[0, -52], [0, -64], [10, -64], [10, -58]], '#b0bec5', 4);
  });
  def('toilet', 44, 58, g => {
    rr(g, -2, -58, 20, 30, 4, '#fafafa'); rect(g, -2, -60, 20, 4, '#e0e0e0');
    ell(g, -2, -28, 18, 6, '#fafafa'); poly(g, [[-14, -26], [10, -26], [6, 0], [-10, 0]], '#f5f5f5'); ell(g, -2, -29, 14, 3.5, '#b3e5fc');
    g.strokeStyle = '#cfd8dc'; g.lineWidth = 1.2; g.beginPath(); g.ellipse(-2, -28, 18, 6, 0, 0, TAU); g.stroke();
  });
  def('bath', 108, 50, g => {
    rr(g, -52, -38, 104, 32, 14, '#fafafa'); rect(g, -48, -40, 96, 5, '#e0e0e0'); ell(g, 0, -36, 44, 4, '#81d4fa');
    [[-20, -42], [-8, -46], [6, -43], [18, -45]].forEach(([x, y]) => circle(g, x, y, 5, 'rgba(255,255,255,.95)'));
    [-40, 36].forEach(x => { rect(g, x, -8, 6, 8, '#ffd54f'); });
    line(g, [[46, -38], [46, -52], [38, -52]], '#b0bec5', 3);
  });
  def('shower', 60, 124, (g, t) => {
    rect(g, -26, -4, 52, 4, '#b0bec5'); rect(g, -26, -120, 52, 116, 'rgba(178,235,242,0.35)');
    g.strokeStyle = '#90a4ae'; g.lineWidth = 2; g.strokeRect(-26, -120, 52, 116);
    line(g, [[18, -118], [18, -104], [4, -104]], '#78909c', 3); ell(g, 2, -102, 8, 3, '#78909c');
    for (let k = 0; k < 6; k++) { const p = (t * 1.3 + k / 6) % 1; line(g, [[-4 + k * 2.5, -98 + p * 80], [-5 + k * 2.5, -92 + p * 80]], 'rgba(33,150,243,.6)', 1.5); }
  });
  def('towel', 46, 60, g => {
    line(g, [[-18, 0], [-18, -58]], METAL_OSC, 3); line(g, [[18, 0], [18, -58]], METAL_OSC, 3); line(g, [[-20, -56], [20, -56]], METAL_OSC, 3);
    rr(g, -16, -56, 32, 44, 3, '#26a69a'); rect(g, -16, -24, 32, 5, '#80cbc4'); rect(g, -16, -18, 32, 3, '#fff');
  });
  def('soap', 34, 26, g => {
    ell(g, 0, -3, 15, 4, '#b0bec5'); rr(g, -10, -12, 20, 9, 4, '#f48fb1'); brillo(g, -3, -10, 4, 1.5);
    [[-8, -18, 4], [2, -22, 5], [10, -17, 3]].forEach(([x, y, r]) => { circle(g, x, y, r, 'rgba(225,245,254,.7)'); ring(g, x, y, r, 'rgba(129,212,250,.8)', 1); });
  });
  def('trashCan', 36, 50, g => {
    poly(g, [[-15, -42], [15, -42], [12, 0], [-12, 0]], '#43a047'); rr(g, -17, -48, 34, 7, 3, '#2e7d32');
    for (let x = -8; x <= 8; x += 8) line(g, [[x, -38], [x * 0.85, -4]], '#2e7d32', 2); rect(g, -4, -52, 8, 4, '#1b5e20');
  });
  def('trash', 36, 38, g => {
    g.beginPath(); g.moveTo(-15, 0); g.quadraticCurveTo(-19, -24, -5, -30); g.lineTo(5, -30); g.quadraticCurveTo(19, -24, 15, 0); g.closePath(); g.fillStyle = '#37474f'; g.fill();
    poly(g, [[-5, -30], [0, -38], [5, -30]], '#263238'); brillo(g, -7, -16, 2, 8);
  });
  def('letter', 46, 32, g => {
    rect(g, -21, -30, 42, 28, '#fff8e1'); poly(g, [[-21, -30], [0, -14], [21, -30]], '#ffe0b2');
    g.strokeStyle = '#bcaaa4'; g.lineWidth = 1; g.strokeRect(-21, -30, 42, 28);
    rect(g, 11, -27, 7, 8, '#e53935'); circle(g, -3, -20, 4, '#c62828');
  });
  def('paper', 46, 28, g => {
    for (let i = 0; i < 4; i++) { rect(g, -20 + i, -6 - i * 5, 40, 6, i % 2 ? '#fafafa' : '#eeeeee'); }
    rect(g, -18, -30, 38, 8, '#ffffff'); for (let k = 0; k < 3; k++) line(g, [[-14, -28 + k * 2.5], [14, -28 + k * 2.5]], '#90caf9', 0.8);
  });
  def('gift', 40, 44, g => {
    rect(g, -17, -30, 34, 30, '#e53935'); rect(g, -19, -36, 38, 8, '#ef5350'); rect(g, -3, -36, 6, 36, '#ffd54f');
    ell(g, -7, -40, 7, 4, '#ffd54f', 0.4); ell(g, 7, -40, 7, 4, '#ffd54f', -0.4);
  });
  def('toy', 42, 48, g => { // osito de peluche
    circle(g, -11, -40, 6, '#a1887f'); circle(g, 11, -40, 6, '#a1887f');
    ell(g, 0, -16, 15, 16, '#a1887f'); circle(g, 0, -34, 12, '#a1887f'); ell(g, 0, -30, 6, 4, '#d7ccc8');
    circle(g, -4, -36, 1.8, '#212121'); circle(g, 4, -36, 1.8, '#212121'); circle(g, 0, -31, 1.8, '#3e2723');
    ell(g, -14, -18, 5, 8, '#8d6e63'); ell(g, 14, -18, 5, 8, '#8d6e63'); ell(g, -8, -2, 6, 4, '#8d6e63'); ell(g, 8, -2, 6, 4, '#8d6e63');
    ell(g, 0, -14, 8, 9, '#d7ccc8');
  });
  def('doll', 30, 54, g => {
    poly(g, [[-12, -4], [12, -4], [7, -30], [-7, -30]], '#ec407a'); rect(g, -6, -4, 4, 4, '#ffe0b2'); rect(g, 2, -4, 4, 4, '#ffe0b2');
    circle(g, 0, -38, 9, '#ffe0b2'); g.beginPath(); g.arc(0, -40, 10, Math.PI, 0); g.fillStyle = '#ffca28'; g.fill();
    ell(g, -10, -34, 3, 8, '#ffca28'); ell(g, 10, -34, 3, 8, '#ffca28');
    circle(g, -3, -38, 1.4, '#212121'); circle(g, 3, -38, 1.4, '#212121'); ell(g, 0, -34, 2, 1, '#e57373');
  });
  def('ball', 30, 30, g => {
    circle(g, 0, -14, 13, '#fafafa'); poly(g, [[0, -19], [5, -15], [3, -9], [-3, -9], [-5, -15]], '#212121');
    [[-10, -20], [10, -20], [-9, -5], [9, -5], [0, -27]].forEach(([x, y]) => circle(g, x, y, 3, '#212121'));
    ring(g, 0, -14, 13, '#bdbdbd', 1);
  });
  def('money', 50, 30, g => {
    for (let i = 0; i < 3; i++) { rr(g, -22 + i * 2, -10 - i * 5, 30, 12, 2, '#66bb6a'); ring(g, -7 + i * 2, -4 - i * 5, 3.5, '#2e7d32', 1.2); }
    text(g, '$', -5, -19, 10, '#1b5e20');
    [[14, -4], [20, -9], [16, -14]].forEach(([x, y]) => { ell(g, x, y, 7, 4, '#fbc02d'); ell(g, x, y - 1, 5, 2.5, '#fdd835'); });
  });
  def('piggyBank', 44, 34, g => {
    ell(g, 0, -15, 17, 13, '#f48fb1'); circle(g, 14, -18, 7, '#f48fb1'); ell(g, 19, -18, 3, 3.5, '#f06292');
    poly(g, [[-8, -26], [-4, -32], [-2, -25]], '#f06292'); rect(g, -3, -29, 8, 2, '#880e4f');
    [-10, -3, 5, 11].forEach(x => rect(g, x, -4, 4, 5, '#f06292')); circle(g, 10, -21, 1.5, '#212121');
  });
  def('dollhouse', 210, 196, g => {
    rect(g, -96, -150, 192, 150, '#f5deb3'); poly(g, [[-104, -148], [0, -196], [104, -148]], '#c0392b');
    rect(g, -90, -144, 180, 138, '#8d6e63');
    // Cuartos: arriba dormitorio (izq) y baño (der); abajo cocina (izq) y sala (der); escalera en medio
    rect(g, -86, -140, 80, 62, '#e3f2fd'); rect(g, 6, -140, 80, 62, '#e0f7fa');
    rect(g, -86, -72, 80, 64, '#fff8e1'); rect(g, 6, -72, 80, 64, '#fce4ec');
    rect(g, -6, -140, 12, 132, '#bcaaa4'); for (let k = 0; k < 8; k++) rect(g, -6, -18 - k * 15, 12 + (k % 2) * 0, 3, '#8d6e63');
    // dormitorio
    rr(g, -80, -96, 50, 14, 3, '#5c6bc0'); rr(g, -80, -102, 16, 8, 4, '#fff'); rect(g, -80, -84, 4, 6, MADERA_OSC);
    // baño
    rr(g, 16, -98, 38, 14, 6, '#fff'); ell(g, 35, -98, 16, 2.5, '#81d4fa'); rr(g, 64, -104, 14, 20, 3, '#fff');
    // cocina
    rr(g, -80, -40, 24, 32, 2, '#eceff1'); rr(g, -52, -30, 24, 22, 2, '#bdbdbd'); ell(g, -40, -31, 7, 2, '#37474f');
    // sala
    rr(g, 14, -30, 44, 16, 5, '#e07a5f'); rr(g, 64, -46, 16, 22, 2, '#263238'); rect(g, 66, -44, 12, 16, '#4fc3f7');
    // piso y pared (contornos)
    rect(g, -96, -8, 192, 8, '#6d4c41');
    text(g, 'DOLLHOUSE', 0, -166, 12, '#fff');
  }, { partes: { bedroom: [-86, -140, 80, 62], bathroom: [6, -140, 80, 62], kitchen: [-86, -72, 80, 64], 'living room': [6, -72, 80, 64],
    stairs: [-7, -140, 14, 132], floor: [-96, -8, 192, 8], wall: [-96, -150, 8, 142], room: [-104, -196, 208, 48] } });
  def('garage', 170, 132, g => {
    rect(g, -80, -104, 160, 104, '#d7ccc8'); poly(g, [[-90, -100], [0, -132], [90, -100]], '#795548');
    rr(g, -62, -86, 124, 86, 3, '#eceff1'); for (let y = -80; y < 0; y += 12) line(g, [[-60, y], [60, y]], '#b0bec5', 2);
    rect(g, -14, -50, 28, 4, '#90a4ae');
    text(g, 'GARAGE', 0, -94, 9, '#5d4037');
  });

  /* ======================================================================
     ROPA (colgada en un tendedero: la parte de arriba toca la cuerda)
  ====================================================================== */
  const pinza = (g, x, y) => rect(g, x - 2, y - 4, 4, 8, '#ffca28');
  def('shirt', 48, 54, g => {
    poly(g, [[-14, -54], [14, -54], [24, -44], [18, -36], [14, -40], [14, 0], [-14, 0], [-14, -40], [-18, -36], [-24, -44]], '#90caf9');
    poly(g, [[-6, -54], [0, -46], [6, -54]], '#e3f2fd'); line(g, [[0, -46], [0, -2]], '#64b5f6', 1.5);
    for (let y = -40; y < 0; y += 9) circle(g, 0, y, 1.5, '#1e88e5');
    pinza(g, -10, -54); pinza(g, 10, -54);
  });
  def('tshirt', 48, 48, g => {
    poly(g, [[-13, -48], [-5, -48], [0, -44], [5, -48], [13, -48], [24, -38], [17, -30], [13, -34], [13, 0], [-13, 0], [-13, -34], [-17, -30], [-24, -38]], '#ef5350');
    circle(g, 0, -24, 6, '#fff'); text(g, '★', 0, -24, 9, '#ef5350');
    pinza(g, -9, -48); pinza(g, 9, -48);
  });
  def('pants', 42, 64, g => {
    poly(g, [[-15, -64], [15, -64], [17, 0], [4, 0], [0, -38], [-4, 0], [-17, 0]], '#37474f');
    rect(g, -15, -64, 30, 6, '#263238'); pinza(g, -11, -64); pinza(g, 11, -64);
  });
  def('jeans', 42, 64, g => {
    poly(g, [[-15, -64], [15, -64], [17, 0], [4, 0], [0, -38], [-4, 0], [-17, 0]], '#3f6fb5');
    rect(g, -15, -64, 30, 6, '#2c5aa0'); poly(g, [[-13, -56], [-4, -56], [-5, -46], [-12, -46]], '#2f5e9e');
    line(g, [[-13, -56], [-4, -56]], '#f5b041', 1); line(g, [[-10, -30], [-10, -4]], '#f5b041', 0.8); line(g, [[10, -30], [10, -4]], '#f5b041', 0.8);
    pinza(g, -11, -64); pinza(g, 11, -64);
  }, { partes: { pocket: [-15, -58, 13, 14] } });
  def('shorts', 42, 34, g => {
    poly(g, [[-16, -34], [16, -34], [19, 0], [3, 0], [0, -14], [-3, 0], [-19, 0]], '#66bb6a'); rect(g, -16, -34, 32, 5, '#43a047');
    pinza(g, -11, -34); pinza(g, 11, -34);
  });
  def('skirt', 44, 40, g => {
    rect(g, -12, -40, 24, 6, '#8e24aa'); poly(g, [[-12, -34], [12, -34], [21, 0], [-21, 0]], '#ab47bc');
    for (let k = -1; k <= 1; k++) line(g, [[k * 5, -32], [k * 11, -2]], '#8e24aa', 1.5);
    pinza(g, -8, -40); pinza(g, 8, -40);
  });
  def('dress', 46, 66, g => {
    poly(g, [[-8, -66], [8, -66], [12, -44], [22, 0], [-22, 0], [-12, -44]], '#f06292'); rect(g, -12, -46, 24, 5, '#ec407a');
    [[-10, -20], [6, -28], [12, -10], [-4, -8]].forEach(([x, y]) => circle(g, x, y, 2.5, '#fff'));
    pinza(g, -6, -66); pinza(g, 6, -66);
  });
  def('socks', 44, 38, g => {
    [[-10, '#ffca28'], [10, '#ffb300']].forEach(([x, c]) => {
      rect(g, x - 5, -38, 10, 26, c); ell(g, x + 1, -10, 9, 7, c); rect(g, x - 5, -38, 10, 5, '#fff'); rect(g, x - 5, -26, 10, 3, '#e53935');
      pinza(g, x, -38);
    });
  });
  def('pajamas', 50, 62, g => {
    poly(g, [[-12, -62], [12, -62], [20, -54], [15, -48], [12, -50], [12, -30], [-12, -30], [-12, -50], [-15, -48], [-20, -54]], '#b39ddb');
    poly(g, [[-12, -30], [12, -30], [13, 0], [3, 0], [0, -16], [-3, 0], [-13, 0]], '#9575cd');
    for (let y = -58; y < 0; y += 8) line(g, [[-12, y], [12, y]], 'rgba(255,255,255,.45)', 2);
    [[-4, -44], [5, -40]].forEach(([x, y]) => text(g, '★', x, y, 7, '#fff59d'));
    pinza(g, -8, -62); pinza(g, 8, -62);
  });
  def('uniform', 50, 72, g => {
    line(g, [[0, -72], [0, -66]], '#9e9e9e', 2); line(g, [[-18, -60], [0, -68], [18, -60]], '#9e9e9e', 2.5);
    poly(g, [[-15, -60], [15, -60], [22, -52], [16, -46], [14, -48], [14, -18], [-14, -18], [-14, -48], [-16, -46], [-22, -52]], '#1a237e');
    poly(g, [[-5, -60], [0, -50], [5, -60]], '#fff'); rect(g, 6, -50, 6, 6, '#ffd54f');
    poly(g, [[-14, -18], [14, -18], [18, 0], [-18, 0]], '#283593');
    for (let y = -46; y < -20; y += 8) circle(g, 0, y, 1.8, '#ffd54f');
  }, { partes: { button: [-4, -48, 8, 28] } });

  /* ---------- Maniquíes y exhibidores de la tienda de ropa ---------- */
  function maniqui(g, colorBase) {
    ell(g, 0, -3, 16, 4, '#546e7a'); rect(g, -2, -40, 4, 38, '#546e7a');
    ell(g, 0, -104, 10, 12, colorBase || '#eceff1');
  }
  def('mannequinWinter', 64, 148, g => {
    maniqui(g);
    poly(g, [[-18, -90], [18, -90], [22, -36], [-22, -36]], '#6d4c41');
    line(g, [[0, -88], [0, -38]], '#4e342e', 2); for (let y = -80; y < -40; y += 12) circle(g, 4, y, 2, '#ffd54f');
    rr(g, -12, -94, 24, 9, 4, '#c62828'); rect(g, 6, -94, 7, 26, '#c62828');
    ell(g, -24, -44, 5, 6, '#1565c0'); ell(g, 24, -44, 5, 6, '#1565c0'); line(g, [[-20, -86], [-24, -48]], '#6d4c41', 7); line(g, [[20, -86], [24, -48]], '#6d4c41', 7);
    ell(g, 0, -118, 16, 4, '#37474f'); rr(g, -10, -134, 20, 16, 3, '#37474f'); rect(g, -10, -124, 20, 3, '#c62828');
  }, { partes: { hat: [-16, -136, 32, 20], scarf: [-13, -96, 26, 30], coat: [-22, -86, 44, 50], gloves: [-30, -52, 60, 16] } });
  def('mannequinCasual', 64, 136, g => {
    maniqui(g);
    poly(g, [[-18, -90], [18, -90], [20, -52], [-20, -52]], '#ffb300'); for (let y = -84; y < -54; y += 6) line(g, [[-18, y], [18, y]], 'rgba(0,0,0,.08)', 2);
    rect(g, -20, -54, 40, 7, '#5d4037'); rr(g, -5, -55, 10, 9, 2, '#ffd54f');
    poly(g, [[-18, -47], [18, -47], [16, -34], [-16, -34]], '#3f6fb5');
    g.beginPath(); g.ellipse(0, -114, 11, 6, 0, Math.PI, 0); g.fillStyle = '#e53935'; g.fill(); ell(g, 9, -114, 9, 2.5, '#c62828');
  }, { partes: { cap: [-12, -122, 32, 12], sweater: [-20, -90, 40, 36], belt: [-20, -56, 40, 11] } });
  def('clothesRack', 124, 112, g => {
    line(g, [[-56, 0], [-56, -104]], METAL_OSC, 4); line(g, [[56, 0], [56, -104]], METAL_OSC, 4); line(g, [[-60, -104], [60, -104]], METAL_OSC, 4);
    line(g, [[-64, 0], [-48, 0]], METAL_OSC, 4); line(g, [[48, 0], [64, 0]], METAL_OSC, 4);
    ['#ef5350', '#42a5f5', '#66bb6a', '#ffca28', '#ab47bc', '#26a69a'].forEach((c, i) => {
      const x = -44 + i * 17; line(g, [[x, -104], [x, -98]], '#757575', 1.5);
      poly(g, [[x - 8, -96], [x + 8, -96], [x + 9, -44 - (i % 2) * 10], [x - 9, -44 - (i % 2) * 10]], c);
    });
    etiqueta(g, 'CLOTHES', 0, -20, 60, 14, '#c9184a', '#fff', 9);
  });
  def('shoe', 34, 20, g => {
    g.beginPath(); g.moveTo(-15, -2); g.lineTo(-15, -14); g.quadraticCurveTo(-8, -16, -2, -12); g.quadraticCurveTo(12, -10, 15, -4); g.lineTo(15, -2); g.closePath(); g.fillStyle = '#6d4c41'; g.fill();
    rect(g, -15, -3, 30, 3, '#3e2723');
  });
  def('shoes', 48, 22, g => {
    [[-11, '#1e88e5'], [11, '#1e88e5']].forEach(([x]) => {
      g.save(); g.translate(x, 0);
      g.beginPath(); g.moveTo(-11, -2); g.lineTo(-11, -14); g.quadraticCurveTo(-4, -16, 0, -12); g.quadraticCurveTo(10, -10, 11, -4); g.lineTo(11, -2); g.closePath(); g.fillStyle = '#1e88e5'; g.fill();
      rect(g, -11, -4, 22, 4, '#fff'); line(g, [[-4, -12], [2, -10]], '#fff', 1.5);
      g.restore();
    });
  });
  def('boots', 44, 44, g => {
    [-10, 10].forEach(x => { rect(g, x - 7, -42, 12, 34, '#795548'); rr(g, x - 7, -12, 18, 10, 3, '#6d4c41'); rect(g, x - 7, -3, 18, 3, '#3e2723'); rect(g, x - 7, -42, 12, 4, '#a1887f'); });
  });
  def('glasses', 44, 22, g => {
    rr(g, -19, -18, 16, 12, 4, '#212121'); rr(g, 3, -18, 16, 12, 4, '#212121'); line(g, [[-3, -14], [3, -14]], '#212121', 2.5);
    rr(g, -17, -16, 12, 8, 3, '#455a64'); rr(g, 5, -16, 12, 8, 3, '#455a64'); brillo(g, -13, -14, 2, 1.2); brillo(g, 9, -14, 2, 1.2);
    ell(g, 0, -2, 20, 2.5, 'rgba(0,0,0,.08)');
  });
  def('ring', 30, 30, g => {
    rr(g, -13, -14, 26, 14, 3, '#c62828'); rr(g, -13, -24, 26, 11, 3, '#e53935');
    ring(g, 0, -16, 6, '#ffd54f', 3); poly(g, [[-3, -22], [3, -22], [0, -27]], '#b3e5fc');
  });
  def('necklace', 34, 46, g => {
    poly(g, [[-10, -44], [10, -44], [14, -8], [-14, -8]], '#37474f'); rr(g, -8, -8, 16, 8, 2, '#263238');
    g.strokeStyle = '#ffd54f'; g.lineWidth = 2; g.beginPath(); g.moveTo(-9, -40); g.quadraticCurveTo(0, -18, 9, -40); g.stroke();
    circle(g, 0, -28, 4, '#e91e63');
  });
  def('earrings', 32, 36, g => {
    rr(g, -14, -34, 28, 34, 3, '#fff8e1'); g.strokeStyle = '#d7ccc8'; g.lineWidth = 1; rrPath(g, -14, -34, 28, 34, 3); g.stroke();
    [-6, 6].forEach(x => { ring(g, x, -24, 2, '#ffd54f', 1.5); line(g, [[x, -22], [x, -16]], '#ffd54f', 1.5); circle(g, x, -12, 4, '#26c6da'); });
  });
  def('bag', 40, 42, g => {
    g.strokeStyle = '#6d4c41'; g.lineWidth = 3; g.beginPath(); g.arc(0, -28, 10, Math.PI, 0); g.stroke();
    poly(g, [[-17, -28], [17, -28], [14, 0], [-14, 0]], '#8d6e63'); rect(g, -17, -28, 34, 8, '#6d4c41'); circle(g, 0, -22, 3, '#ffd54f');
  });
  def('backpack', 40, 50, g => {
    rr(g, -16, -46, 32, 46, 10, '#ef5350'); rr(g, -11, -22, 22, 16, 5, '#e53935'); rect(g, -11, -22, 22, 3, '#c62828');
    line(g, [[-16, -38], [-21, -12]], '#c62828', 4); line(g, [[16, -38], [21, -12]], '#c62828', 4); rr(g, -6, -50, 12, 6, 3, '#c62828');
  });
  def('umbrella', 64, 76, g => {
    line(g, [[0, -58], [0, -8]], '#424242', 3); curve(g, 0, -8, 0, 2, 7, -2, '#424242', 3);
    g.beginPath(); g.moveTo(-30, -52); g.quadraticCurveTo(0, -84, 30, -52);
    for (let k = 2; k >= -2; k--) g.quadraticCurveTo(k * 12 + 6, -58, k * 12, -52);
    g.closePath(); g.fillStyle = '#1e88e5'; g.fill();
    for (let k = -1; k <= 1; k++) curve(g, 0, -74, k * 10, -64, k * 18, -53, '#1565c0', 1.5);
  });
  def('button', 34, 34, g => {
    circle(g, 0, -15, 14, '#e53935'); ring(g, 0, -15, 10, '#c62828', 2);
    [[-3, -18], [3, -18], [-3, -12], [3, -12]].forEach(([x, y]) => circle(g, x, y, 1.8, '#7f0000'));
  });
  def('sizeTag', 48, 34, g => {
    rr(g, -22, -30, 44, 26, 4, '#fff'); g.strokeStyle = '#90a4ae'; g.lineWidth = 1.5; rrPath(g, -22, -30, 44, 26, 4); g.stroke();
    text(g, 'S  M  L', 0, -17, 10, '#37474f'); ring(g, -17, -26, 2, '#90a4ae', 1);
  });

  /* ======================================================================
     ESCUELA Y OFICINA
  ====================================================================== */
  def('book', 36, 42, g => { rr(g, -14, -40, 28, 40, 2, '#1565c0'); rect(g, -14, -40, 5, 40, '#0d47a1'); rect(g, -5, -32, 16, 8, '#fff'); text(g, 'BOOK', 3, -28, 5, '#0d47a1'); rect(g, 10, -40, 3, 40, '#e3f2fd'); });
  def('notebook', 32, 42, g => { rr(g, -13, -40, 26, 40, 2, '#43a047'); for (let y = -36; y < 0; y += 6) ring(g, -13, y, 2.2, '#9e9e9e', 1.2); rect(g, -6, -30, 14, 8, '#fff'); });
  def('pen', 14, 46, g => { rr(g, -3, -40, 6, 36, 2, '#1e88e5'); poly(g, [[-3, -4], [3, -4], [0, 4 - 4]], '#1e88e5'); rect(g, -3, -46, 6, 6, '#0d47a1'); rect(g, 2, -44, 2, 12, '#90caf9'); });
  def('pencil', 14, 48, g => { rect(g, -3, -38, 6, 32, '#ffca28'); poly(g, [[-3, -6], [3, -6], [0, 0]], '#f3d7a1'); poly(g, [[-1, -2], [1, -2], [0, 0]], '#424242'); rect(g, -3, -44, 6, 6, '#f48fb1'); rect(g, -3, -40, 6, 2, '#bdbdbd'); });
  def('eraser', 30, 18, g => { rr(g, -13, -14, 26, 13, 3, '#f48fb1'); rect(g, -13, -14, 11, 13, '#42a5f5'); });
  def('ruler', 56, 14, g => { rect(g, -26, -12, 52, 11, '#ffe082'); for (let x = -24; x <= 24; x += 4) line(g, [[x, -12], [x, x % 8 === 0 ? -6 : -9]], '#795548', 1); });
  def('scissors', 38, 30, g => {
    ring(g, -10, -8, 6, '#e53935', 3); ring(g, 4, -6, 6, '#e53935', 3);
    line(g, [[-6, -12], [14, -28]], '#b0bec5', 3.5); line(g, [[0, -10], [16, -24]], '#90a4ae', 3.5); circle(g, -1, -13, 1.8, '#607d8b');
  });
  def('dictionary', 40, 50, g => { rr(g, -16, -48, 32, 48, 2, '#b71c1c'); rect(g, -16, -48, 6, 48, '#7f0000'); rect(g, 12, -46, 3, 44, '#fff8e1'); text(g, 'A–Z', 2, -30, 8, '#ffd54f'); text(g, 'DICT.', 2, -18, 6, '#fff'); });
  def('page', 52, 34, g => {
    poly(g, [[-24, -4], [0, 0], [0, -30], [-24, -32]], '#fffdf5'); poly(g, [[24, -4], [0, 0], [0, -30], [24, -32]], '#ffffff');
    for (let k = 0; k < 4; k++) { line(g, [[-20, -26 + k * 5], [-4, -24 + k * 5]], '#b0bec5', 1); line(g, [[4, -24 + k * 5], [20, -26 + k * 5]], '#b0bec5', 1); }
    text(g, '12', 12, -5, 6, '#e53935'); rect(g, -26, -2, 52, 2, '#795548');
  });
  const hoja = (g, titulo, color, marca) => {
    rect(g, -15, -44, 30, 42, '#fff'); g.strokeStyle = '#cfd8dc'; g.lineWidth = 1; g.strokeRect(-15, -44, 30, 42);
    text(g, titulo, 0, -38, 5.5, color); for (let k = 0; k < 5; k++) line(g, [[-11, -30 + k * 5], [11, -30 + k * 5]], '#b0bec5', 1);
    if (marca) marca();
  };
  def('homework', 34, 46, g => hoja(g, 'HOMEWORK', '#1565c0'));
  def('test', 34, 46, g => hoja(g, 'TEST', '#37474f', () => { ring(g, 7, -14, 7, '#e53935', 1.5); text(g, 'A+', 7, -14, 8, '#e53935'); }));
  def('list', 34, 46, g => hoja(g, 'LIST', '#2e7d32', () => { for (let k = 0; k < 4; k++) text(g, '✓', -8, -30 + k * 5, 5, '#2e7d32'); }));
  def('story', 40, 46, g => {
    rr(g, -16, -44, 32, 44, 3, '#7e57c2'); rect(g, -12, -36, 24, 22, '#b39ddb');
    rect(g, -6, -28, 12, 12, '#ede7f6'); poly(g, [[-8, -28], [-4, -34], [0, -28]], '#ede7f6'); poly(g, [[0, -28], [4, -34], [8, -28]], '#ede7f6'); circle(g, 8, -33, 2.5, '#ffee58');
    text(g, 'STORY', 0, -7, 6, '#fff');
  });

  /* ======================================================================
     PEQUEÑOS OBJETOS DE LA CIUDAD Y DE LA NATURALEZA
  ====================================================================== */
  def('rock', 46, 30, g => { g.beginPath(); g.moveTo(-21, 0); g.lineTo(-18, -18); g.lineTo(-6, -27); g.lineTo(10, -24); g.lineTo(21, -10); g.lineTo(20, 0); g.closePath(); g.fillStyle = '#8d8d8d'; g.fill(); poly(g, [[-6, -27], [10, -24], [4, -14], [-10, -16]], '#a3a3a3'); });
  def('stone', 84, 14, g => { [[-30, -5, 11], [-8, -6, 10], [14, -5, 11], [34, -6, 8]].forEach(([x, y, r]) => { ell(g, x, y, r, r * 0.45, '#9e9e9e'); ell(g, x - 2, y - 1.5, r * 0.6, r * 0.22, '#bdbdbd'); }); });
  def('leaf', 54, 26, g => {
    [['#e67e22', -14, -8, 0.4], ['#f1c40f', 2, -10, -0.3], ['#c0392b', 14, -7, 0.8], ['#d35400', -4, -15, 1.4], ['#e74c3c', 9, -16, -1]].forEach(([c, x, y, r]) => {
      g.save(); g.translate(x, y); g.rotate(r); ell(g, 0, 0, 10, 5, c); line(g, [[-10, 0], [10, 0]], 'rgba(0,0,0,.2)', 1); g.restore();
    });
  });
  def('plant', 40, 58, g => {
    poly(g, [[-13, -22], [13, -22], [10, 0], [-10, 0]], '#d35400'); rect(g, -15, -26, 30, 5, '#e67e22');
    [[-12, -44, -0.6], [0, -54, 0], [12, -44, 0.6], [-6, -36, -1.2], [7, -34, 1.1]].forEach(([x, y, r]) => { g.save(); g.translate(x, y); g.rotate(r); ell(g, 0, 0, 5, 13, '#43a047'); line(g, [[0, -12], [0, 12]], '#2e7d32', 1); g.restore(); });
  });
  def('flowerPot', 36, 50, g => {
    poly(g, [[-11, -18], [11, -18], [9, 0], [-9, 0]], '#c0392b'); line(g, [[0, -18], [0, -40]], '#2e7d32', 3);
    ell(g, -5, -30, 5, 3, '#43a047', 0.5); ell(g, 5, -26, 5, 3, '#43a047', -0.5);
    for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; circle(g, Math.cos(a) * 7, -44 + Math.sin(a) * 7, 5, '#ec407a'); } circle(g, 0, -44, 4, '#ffeb3b');
  });
  def('nest', 46, 26, g => {
    ell(g, 0, -10, 21, 10, '#a1887f'); for (let k = -3; k <= 3; k++) curve(g, k * 6 - 6, -14, k * 6, -4, k * 6 + 6, -14, '#6d4c41', 1.5);
    ell(g, -6, -18, 5, 6, '#fffdf5'); ell(g, 5, -18, 5, 6, '#f5f5f5');
    poly(g, [[-2, -20], [0, -24], [2, -20], [4, -24], [6, -20]], '#f5f5f5'); ell(g, 12, -13, 6, 4, '#eeeeee', 0.4);
  }, { partes: { 'egg shell': [4, -20, 16, 12] } });
  def('trophy', 34, 46, g => {
    rect(g, -12, -6, 24, 6, '#5d4037'); rect(g, -4, -16, 8, 11, '#fbc02d');
    g.beginPath(); g.moveTo(-13, -44); g.lineTo(13, -44); g.quadraticCurveTo(13, -18, 0, -16); g.quadraticCurveTo(-13, -18, -13, -44); g.fillStyle = '#fdd835'; g.fill();
    ring(g, -15, -36, 5, '#fbc02d', 3); ring(g, 15, -36, 5, '#fbc02d', 3); text(g, '1', 0, -32, 11, '#f57f17');
  });
  def('globe', 40, 64, g => {
    ell(g, 0, -3, 12, 3, MADERA); rect(g, -2, -16, 4, 14, MADERA_OSC);
    g.strokeStyle = '#8d6e63'; g.lineWidth = 3; g.beginPath(); g.arc(0, -40, 22, 0.7, Math.PI * 1.5); g.stroke();
    circle(g, 0, -40, 18, '#42a5f5');
    poly(g, [[-12, -50], [-2, -54], [2, -44], [-6, -38], [-12, -42]], '#66bb6a'); poly(g, [[4, -36], [12, -40], [14, -30], [6, -26]], '#66bb6a'); ell(g, 8, -52, 4, 2.5, '#66bb6a');
    brillo(g, -6, -48, 5, 3);
  });
  def('planet', 70, 72, g => {
    ell(g, 0, -3, 12, 3, '#455a64'); rect(g, -2, -20, 4, 18, '#607d8b');
    g.save(); g.translate(0, -44); g.rotate(-0.3);
    g.strokeStyle = '#d7ccc8'; g.lineWidth = 4; g.beginPath(); g.ellipse(0, 0, 32, 8, 0, Math.PI, TAU); g.stroke();
    circle(g, 0, 0, 18, '#ffb74d'); line(g, [[-17, -5], [17, -5]], '#ff8a65', 3); line(g, [[-15, 5], [15, 5]], '#ffcc80', 3);
    g.beginPath(); g.ellipse(0, 0, 32, 8, 0, 0, Math.PI); g.stroke();
    g.restore();
  });
  function cuadro(g, pinta) {
    line(g, [[-18, 0], [0, -76]], MADERA_OSC, 4); line(g, [[18, 0], [0, -76]], MADERA_OSC, 4);
    rect(g, -30, -72, 60, 46, '#c9a227'); g.save(); g.beginPath(); g.rect(-26, -68, 52, 38); g.clip(); pinta(); g.restore();
  }
  def('desertPainting', 64, 78, g => cuadro(g, () => {
    rect(g, -26, -68, 52, 38, '#ffe0b2'); circle(g, 12, -58, 6, '#ff7043');
    poly(g, [[-26, -30], [-10, -44], [6, -34], [26, -46], [26, -30]], '#f4a261'); rect(g, -12, -48, 4, 16, '#43a047'); rect(g, -16, -44, 4, 6, '#43a047'); rect(g, -8, -42, 4, 6, '#43a047');
  }));
  def('junglePainting', 64, 78, g => cuadro(g, () => {
    rect(g, -26, -68, 52, 38, '#1b5e20'); [[-18, -40], [-4, -52], [12, -44], [20, -60], [-12, -62]].forEach(([x, y], i) => ell(g, x, y, 12, 7, i % 2 ? '#43a047' : '#2e7d32', i));
    rect(g, 2, -48, 3, 18, '#5d4037'); circle(g, -14, -50, 3, '#e53935'); ell(g, 14, -36, 5, 3, '#fdd835');
  }));
  def('sunsetPainting', 64, 78, g => cuadro(g, () => {
    const gr = g.createLinearGradient(0, -68, 0, -30); gr.addColorStop(0, '#6a4c93'); gr.addColorStop(1, '#f6a55c'); g.fillStyle = gr; g.fillRect(-26, -68, 52, 38);
    circle(g, 0, -40, 10, '#ffca28'); rect(g, -26, -40, 52, 10, '#1a3a5f'); line(g, [[-8, -37], [8, -37]], '#ffca28', 1.5); line(g, [[-5, -34], [5, -34]], '#ffca28', 1.5);
  }));
  def('paintCan', 28, 32, (g, t, s) => {
    const c = (s && s.color) || '#e53935';
    rr(g, -12, -26, 24, 26, 3, '#b0bec5'); rect(g, -12, -20, 24, 12, c); ell(g, 0, -26, 12, 3, '#90a4ae');
    curve(g, -12, -24, 0, -36, 12, -24, '#78909c', 1.5); g.beginPath(); g.moveTo(-12, -26); g.quadraticCurveTo(-6, -22, -6, -16); g.lineTo(-10, -14); g.closePath(); g.fillStyle = c; g.fill();
  });

  /* ---------- Dibujo por nombre ---------- */
  function draw(g, nombre, x, y, t, estado, escala = 1) {
    const o = O[nombre];
    if (!o) return;
    g.save();
    g.translate(x, y);
    if (escala !== 1) g.scale(escala, escala);
    g.lineCap = 'round'; g.lineJoin = 'round';
    o.d(g, t || 0, estado);
    g.restore();
  }

  return { O, def, draw, circle, ring, ell, rect, rr, rrPath, poly, line, curve, text, emoji, brillo, sombra, vapor, etiqueta, MADERA, MADERA_OSC, METAL, METAL_OSC };
})();
