'use strict';

/* ============================================================================
   ESTRUCTURAS Y OBJETOS GRANDES  ·  juego/estructuras.js
   Puestos, mesas, tendederos, pizarras con zonas que se tocan, letreros,
   animales del zoológico como objetos, la playa, las montañas y los
   vehículos. Mismo formato que objetos.js (Obj.def).
============================================================================ */
(() => {
  const { def, O, circle, ring, ell, rect, rr, rrPath, poly, line, curve, text, emoji, brillo, vapor, etiqueta, MADERA, MADERA_OSC, METAL, METAL_OSC } = Obj;
  const TAU = Math.PI * 2;
  const sh = (c, a) => Gen.shade(c, a);

  /* ======================================================================
     ANIMALES COMO OBJETOS (los que no caminan por el mundo)
  ====================================================================== */
  const A = Animales;
  ['lion', 'tiger', 'bear', 'wolf', 'fox', 'deer', 'goat'].forEach(k => {
    const p = A.ESPECIES[k];
    def(k, p.bw + p.head.rx * 2 + 40, A.ALTO[k], (g, t) => A.especie(g, -6, 0, t, k, 1, false));
  });
  def('giraffe', 110, 196, (g, t) => A.especie(g, -18, 0, t, 'giraffe', 1, false));
  def('elephant', 150, 96, (g, t) => A.elephant(g, -12, 0, t, 1));
  def('monkey', 70, 60, (g, t) => A.monkey(g, 6, 0, t, 1), { partes: { tail: [-34, -46, 26, 36] } });
  def('snake', 72, 46, (g, t) => A.snake(g, -6, 0, t));
  def('penguin', 34, 50, (g, t) => A.penguin(g, 0, 0, t));
  def('owl', 44, 52, (g, t) => { line(g, [[-20, 0], [20, 0]], MADERA, 5); A.owl(g, 0, -2, t); });
  def('parrot', 50, 58, (g, t) => A.parrot(g, 0, 0, t), { partes: { wing: [-12, -40, 16, 34] } });
  def('rabbit', 44, 46, (g, t) => {
    rect(g, -22, -38, 44, 38, 'rgba(0,0,0,0)'); A.rabbit(g, -4, 0, t);
  });
  def('mouse', 50, 44, (g, t) => {
    rr(g, -24, -40, 48, 38, 6, 'rgba(236,239,241,.5)'); for (let x = -22; x <= 22; x += 6) line(g, [[x, -40], [x, -2]], '#90a4ae', 1.2);
    line(g, [[-24, -40], [24, -40]], '#78909c', 2); rect(g, -24, -3, 48, 3, '#78909c'); A.mouse(g, 0, -3, t);
  });
  def('fishbowl', 44, 48, (g, t) => { rr(g, -18, -6, 36, 6, 2, MADERA); A.fishbowl(g, 0, -6, t); });
  def('turtle', 56, 34, (g, t) => { rr(g, -26, -30, 52, 30, 4, 'rgba(178,235,242,.55)'); rect(g, -26, -8, 52, 8, '#a1887f'); A.turtle(g, -2, -6, t, 1); g.strokeStyle = '#78909c'; g.lineWidth = 2; g.strokeRect(-26, -30, 52, 30); });
  def('frogPond', 90, 36, (g, t) => { ell(g, 0, -10, 42, 12, '#8fb58a'); ell(g, 0, -10, 36, 9, '#4a90c2'); ell(g, -16, -12, 9, 4, '#43a047'); A.frog(g, 12, -12, t); });
  def('beehive', 60, 70, (g, t) => {
    line(g, [[0, 0], [0, -30]], MADERA_OSC, 5); rect(g, -18, -32, 36, 4, MADERA);
    ell(g, 0, -44, 15, 13, '#fbc02d'); ell(g, 0, -54, 11, 8, '#f9a825'); ell(g, 0, -61, 6, 4, '#fbc02d'); ell(g, 0, -40, 4, 3, '#5d4037');
    A.bee(g, 16, -58, t); A.bee(g, -18, -48, t + 1.7);
  });
  def('butterflies', 80, 70, (g, t) => {
    for (let k = -2; k <= 2; k++) { line(g, [[k * 12, 0], [k * 12, -18 - Math.abs(k) * 2]], '#2e7d32', 2); circle(g, k * 12, -20 - Math.abs(k) * 2, 5, ['#ec407a', '#ffca28', '#ab47bc', '#ef5350', '#42a5f5'][k + 2]); circle(g, k * 12, -20 - Math.abs(k) * 2, 2, '#fff59d'); }
    A.butterfly(g, -10, -46, t, '#ab47bc'); A.butterfly(g, 16, -54, t + 2, '#ff7043');
  });
  def('antHill', 64, 26, (g, t) => { g.beginPath(); g.ellipse(-10, 0, 20, 14, 0, Math.PI, 0); g.fillStyle = '#a1887f'; g.fill(); circle(g, -10, -12, 3, '#5d4037'); A.ant(g, 14, 0, t); });
  def('webPost', 60, 70, (g, t) => {
    rect(g, -26, -70, 8, 70, MADERA); rect(g, 18, -70, 8, 70, MADERA); rect(g, -26, -56, 52, 5, MADERA);
    g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 1;
    for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; g.beginPath(); g.moveTo(0, -30); g.lineTo(Math.cos(a) * 17, -30 + Math.sin(a) * 17); g.stroke(); }
    for (let r = 5; r <= 17; r += 4) { g.beginPath(); for (let k = 0; k <= 8; k++) { const a = k / 8 * TAU; g[k ? 'lineTo' : 'moveTo'](Math.cos(a) * r, -30 + Math.sin(a) * r); } g.stroke(); }
    A.spider(g, 0, 20, t);
  });
  def('ladybugLeaf', 50, 22, (g, t) => A.ladybug(g, 0, 0, t));
  def('birdhouse', 44, 120, (g, t) => {
    rect(g, -3, -84, 6, 84, MADERA_OSC); rect(g, -16, -110, 32, 28, '#e57373'); poly(g, [[-20, -108], [0, -122], [20, -108]], '#8d6e63'); circle(g, 0, -98, 5, '#3e2723'); rect(g, -8, -88, 16, 3, MADERA);
    A.bird(g, 10, -84, t, '#1e88e5');
  });
  def('whale', 180, 80, (g, t) => A.whale(g, 0, 0, t));
  def('shark', 140, 34, (g, t) => A.shark(g, 0, 0, t));

  /* ======================================================================
     OBJETOS SUELTOS QUE FALTABAN
  ====================================================================== */
  def('medicine', 30, 44, g => {
    rr(g, -12, -34, 24, 34, 4, '#fff'); g.strokeStyle = '#cfd8dc'; g.lineWidth = 1; rrPath(g, -12, -34, 24, 34, 4); g.stroke();
    rr(g, -9, -42, 18, 9, 2, '#1e88e5'); rect(g, -3, -26, 6, 16, '#e53935'); rect(g, -8, -21, 16, 6, '#e53935');
  });
  def('pill', 42, 26, g => {
    rr(g, -19, -22, 38, 20, 3, '#cfd8dc');
    for (let i = 0; i < 4; i++) { const x = -12 + i * 8; rr(g, x - 3, -17, 6, 10, 3, i % 2 ? '#ef5350' : '#fff'); rr(g, x - 3, -12, 6, 5, 3, '#42a5f5'); }
  });
  def('package', 56, 42, g => {
    rect(g, -26, -36, 52, 36, '#c8a27a'); rect(g, -26, -36, 52, 4, '#b58d63'); rect(g, -3, -36, 6, 36, '#a67c52');
    rect(g, 6, -28, 18, 14, '#fff'); for (let k = 0; k < 3; k++) line(g, [[8, -25 + k * 4], [21, -25 + k * 4]], '#546e7a', 1);
    text(g, 'FRAGILE', -14, -8, 5, '#c62828');
  }, { partes: { address: [5, -30, 21, 18] } });
  def('jacket', 52, 76, g => {
    line(g, [[0, -76], [0, -70]], '#9e9e9e', 2); line(g, [[-18, -64], [0, -72], [18, -64]], '#9e9e9e', 2.5);
    poly(g, [[-15, -64], [15, -64], [24, -54], [20, -10], [14, -12], [14, 0], [-14, 0], [-14, -12], [-20, -10], [-24, -54]], '#455a64');
    line(g, [[0, -60], [0, -2]], '#cfd8dc', 2); poly(g, [[-6, -64], [0, -54], [6, -64]], '#90a4ae');
    rect(g, -12, -30, 9, 3, '#263238'); rect(g, 3, -30, 9, 3, '#263238');
  });
  def('binoculars', 30, 18, g => { rr(g, -13, -16, 11, 16, 3, '#37474f'); rr(g, 2, -16, 11, 16, 3, '#37474f'); rect(g, -3, -12, 6, 6, '#263238'); });
  def('priceTag', 44, 60, g => {
    line(g, [[0, 0], [0, -26]], MADERA_OSC, 3);
    poly(g, [[-18, -58], [10, -58], [20, -44], [10, -30], [-18, -30]], '#fff59d'); ring(g, 11, -44, 3, '#8d6e63', 1.5);
    text(g, '$5', -4, -44, 13, '#c62828');
  });
  def('iceBucket', 44, 34, g => {
    poly(g, [[-18, -24], [18, -24], [14, 0], [-14, 0]], '#90a4ae'); rect(g, -18, -26, 36, 4, '#78909c');
    [[-9, -30], [0, -33], [9, -30], [-4, -27], [5, -27]].forEach(([x, y]) => rr(g, x - 5, y - 5, 10, 10, 2, 'rgba(225,245,254,.95)'));
    [[-9, -30], [0, -33], [9, -30]].forEach(([x, y]) => brillo(g, x - 1, y - 2, 2.5, 1.2));
  });
  def('guitar', 30, 76, g => {
    line(g, [[0, -40], [0, -74]], MADERA_OSC, 5); rect(g, -4, -76, 8, 6, '#3e2723');
    ell(g, 0, -16, 13, 14, '#d35400'); ell(g, 0, -34, 10, 10, '#d35400'); circle(g, 0, -24, 4, '#3e2723');
    for (let k = -1; k <= 1; k++) line(g, [[k * 1.5, -8], [k * 1.5, -74]], '#fff8e1', 0.6);
  });
  def('piano', 96, 70, g => {
    rr(g, -44, -66, 88, 36, 4, '#212121'); rect(g, -44, -34, 88, 12, '#fafafa');
    for (let x = -42; x < 44; x += 8) line(g, [[x, -34], [x, -22]], '#9e9e9e', 1);
    for (let x = -38; x < 40; x += 8) if ((x / 8 + 5) % 7 !== 2) rect(g, x, -34, 4, 7, '#212121');
    rect(g, -40, -22, 6, 22, '#212121'); rect(g, 34, -22, 6, 22, '#212121');
  });
  def('drum', 64, 56, g => {
    ell(g, 0, -38, 24, 7, '#eceff1'); rect(g, -24, -38, 48, 26, '#c62828'); ell(g, 0, -12, 24, 7, '#b71c1c');
    for (let x = -18; x <= 18; x += 9) line(g, [[x, -36], [x + 4, -14]], '#ffd54f', 1.5);
    line(g, [[-20, -12], [-26, 0]], METAL_OSC, 2.5); line(g, [[20, -12], [26, 0]], METAL_OSC, 2.5);
    line(g, [[24, -46], [34, -60]], MADERA, 2.5); line(g, [[18, -48], [22, -64]], MADERA, 2.5);
  });
  def('micStand', 26, 100, g => { line(g, [[0, 0], [0, -84]], '#37474f', 3); line(g, [[-10, 0], [10, 0]], '#37474f', 3); rr(g, -4, -100, 8, 16, 4, '#263238'); });
  def('musicStand', 44, 90, g => {
    line(g, [[0, 0], [0, -60]], '#37474f', 3); line(g, [[-12, 0], [12, 0]], '#37474f', 3);
    poly(g, [[-20, -86], [20, -86], [18, -58], [-18, -58]], '#fafafa'); text(g, 'SONG', 0, -80, 6, '#8e44ad');
    for (let k = 0; k < 3; k++) { line(g, [[-15, -74 + k * 6], [15, -74 + k * 6]], '#9e9e9e', 0.8); text(g, '♪', -8 + k * 8, -72 + k * 6, 7, '#212121'); }
  });
  def('easel', 70, 116, g => {
    line(g, [[-22, 0], [0, -112], [22, 0]], MADERA, 4); line(g, [[0, -112], [0, 0]], MADERA, 4);
    rect(g, -32, -104, 64, 50, '#c9a227');
    const gr = g.createLinearGradient(0, -100, 0, -58); gr.addColorStop(0, '#6a4c93'); gr.addColorStop(1, '#f6a55c'); g.fillStyle = gr; g.fillRect(-28, -100, 56, 42);
    circle(g, 0, -70, 10, '#ffca28'); rect(g, -28, -70, 56, 12, '#1a3a5f'); line(g, [[-9, -66], [9, -66]], '#ffca28', 1.5);
    rect(g, -30, -54, 60, 4, MADERA);
  }, { partes: { sunset: [-28, -100, 56, 42] } });

  /* ======================================================================
     PIZARRAS, TABLEROS Y CARTELES CON ZONAS QUE SE TOCAN
     celdas: [{ p: 'palabra', x, y, w, h, t: 'texto', c: color, d: (g) => extra }]
  ====================================================================== */
  function tablero(nombre, w, h, titulo, fondo, marco, celdas, opts = {}) {
    const alto = h + (opts.patas || 40);
    const partes = {};
    celdas.forEach(c => { partes[c.p] = [c.x, c.y, c.w, c.h]; });
    def(nombre, w + 12, alto, (g, t, s) => {
      const top = -alto;
      [-w / 2 + 14, w / 2 - 14].forEach(x => rect(g, x - 4, top + h - 6, 8, alto - h + 6, MADERA_OSC));
      rr(g, -w / 2 - 6, top - 6, w + 12, h + 12, 8, marco);
      rr(g, -w / 2, top, w, h, 5, fondo);
      if (titulo) text(g, titulo, 0, top + 14, 12, opts.colorTitulo || '#fff');
      celdas.forEach(c => {
        if (c.fondo !== false) rr(g, c.x, c.y, c.w, c.h, 5, c.c || 'rgba(255,255,255,0.9)');
        if (c.d) c.d(g, c, t, s);
        if (c.t) text(g, c.t, c.x + c.w / 2, c.y + c.h / 2 + (c.dt || 0), c.tam || Math.min(12, c.h * 0.45), c.ct || '#263238');
      });
    }, { partes });
  }
  const colorCelda = ['#ffcdd2', '#f8bbd0', '#e1bee7', '#d1c4e9', '#c5cae9', '#bbdefb', '#b2ebf2', '#c8e6c9', '#dcedc8', '#fff9c4', '#ffe0b2', '#ffccbc'];

  // Días de la semana
  (() => {
    const W = 330, H = 150, alto = H + 40, top = -alto;
    const dias = [['Monday', 'MON'], ['Tuesday', 'TUE'], ['Wednesday', 'WED'], ['Thursday', 'THU'], ['Friday', 'FRI'], ['Saturday', 'SAT'], ['Sunday', 'SUN']];
    const cw = 40, gap = 4, x0 = -W / 2 + 12;
    const celdas = dias.map(([p, t], i) => ({ p, t, x: x0 + i * (cw + gap), y: top + 32, w: cw, h: 50, c: i >= 5 ? '#ffe0b2' : '#e3f2fd', tam: 10 }));
    celdas.push({ p: 'week', t: '← one week (7 days) →', x: x0, y: top + 90, w: 7 * cw + 6 * gap, h: 20, c: '#bbdefb', tam: 10 });
    celdas.push({ p: 'weekend', t: 'WEEKEND', x: x0 + 5 * (cw + gap), y: top + 116, w: 2 * cw + gap, h: 22, c: '#ffcc80', tam: 9 });
    celdas.push({ p: 'day', t: '1 DAY', x: x0, y: top + 116, w: cw + 4, h: 22, c: '#c8e6c9', tam: 9 });
    tablero('daysBoard', W, H, 'DAYS OF THE WEEK', '#1565c0', '#8d6e63', celdas);
  })();
  // Meses del año
  (() => {
    const W = 330, H = 170, alto = H + 40, top = -alto;
    const meses = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const cw = 48, ch = 32, x0 = -W / 2 + 12;
    const celdas = meses.map((p, i) => ({ p, t: p.slice(0, 3).toUpperCase(), x: x0 + (i % 6) * (cw + 3), y: top + 30 + Math.floor(i / 6) * (ch + 4), w: cw, h: ch, c: colorCelda[i], tam: 11 }));
    celdas.push({ p: 'month', t: '1 MONTH ≈ 30 days', x: x0, y: top + 106, w: 3 * cw + 6, h: 22, c: '#fff59d', tam: 9 });
    celdas.push({ p: 'year', t: '1 YEAR = 12 months', x: x0 + 3 * cw + 12, y: top + 106, w: 3 * cw + 3, h: 22, c: '#b2dfdb', tam: 9 });
    celdas.push({ p: 'calendar', t: '📅 CALENDAR', x: x0, y: top + 134, w: 6 * cw + 15, h: 24, c: '#fff', tam: 10 });
    tablero('monthsBoard', W, H, 'MONTHS OF THE YEAR', '#6a1b9a', '#8d6e63', celdas);
  })();
  // Estaciones
  (() => {
    const W = 290, H = 150, alto = H + 40, top = -alto, x0 = -W / 2 + 10, cw = 64;
    const est = [['spring', '#c8e6c9', (g, c) => { for (let k = 0; k < 3; k++) { circle(g, c.x + 14 + k * 18, c.y + 30, 6, '#ec407a'); circle(g, c.x + 14 + k * 18, c.y + 30, 2.5, '#ffeb3b'); } }],
      ['summer', '#fff59d', (g, c) => { circle(g, c.x + 32, c.y + 30, 12, '#ffb300'); }],
      ['autumn', '#ffe0b2', (g, c) => { ell(g, c.x + 22, c.y + 30, 9, 5, '#e67e22', 0.5); ell(g, c.x + 42, c.y + 34, 9, 5, '#c0392b', -0.4); }],
      ['winter', '#e3f2fd', (g, c) => { circle(g, c.x + 32, c.y + 38, 10, '#fff'); circle(g, c.x + 32, c.y + 24, 7, '#fff'); circle(g, c.x + 30, c.y + 23, 1, '#111'); circle(g, c.x + 34, c.y + 23, 1, '#111'); }]];
    const celdas = est.map(([p, c, d], i) => ({ p, t: p.toUpperCase(), dt: 22, x: x0 + i * (cw + 4), y: top + 30, w: cw, h: 76, c, d, tam: 10 }));
    celdas.push({ p: 'season', t: '4 SEASONS', x: x0, y: top + 112, w: 4 * cw + 12, h: 26, c: '#fff', tam: 11 });
    tablero('seasonsBoard', W, H, 'SEASONS', '#2e7d32', '#8d6e63', celdas);
  })();
  // Partes del día
  (() => {
    const W = 330, H = 140, alto = H + 40, top = -alto, x0 = -W / 2 + 10, cw = 48;
    const partes = [['morning', '#fff9c4', '#ffb300', 34], ['noon', '#fffde7', '#ffca28', 20], ['afternoon', '#ffe0b2', '#ff9800', 30], ['evening', '#d1c4e9', '#ff7043', 44], ['night', '#283593', '#f5f5f5', 26], ['midnight', '#1a237e', '#fff59d', 16]];
    const celdas = partes.map(([p, c, sol, y], i) => ({ p, t: p.toUpperCase(), dt: 26, ct: i >= 4 ? '#fff' : '#263238', x: x0 + i * (cw + 3.5), y: top + 30, w: cw, h: 96, c, tam: 7.5,
      d: (g, cc) => { if (i >= 4) { circle(g, cc.x + 24, cc.y + y, 9, sol); circle(g, cc.x + 28, cc.y + y - 3, 8, c); } else circle(g, cc.x + 24, cc.y + y, 8, sol); } }));
    tablero('dayPartsBoard', W, H, 'PARTS OF THE DAY', '#00897b', '#8d6e63', celdas);
  })();
  // Reloj para aprender la hora
  (() => {
    const W = 230, H = 180, alto = H + 40, top = -alto;
    const cx = -40, cy = top + 100, R = 56;
    const celdas = [
      { p: 'time', fondo: false, x: cx - R, y: cy - R, w: 2 * R, h: 2 * R, d: (g, c, t, s) => {
        circle(g, cx, cy, R, '#fffdf5'); ring(g, cx, cy, R, '#37474f', 4);
        for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; text(g, String(k || 12), cx + Math.sin(a) * (R - 12), cy - Math.cos(a) * (R - 12), 10, '#37474f'); }
        const h = s && s.hora != null ? s.hora : 3, m = s && s.min != null ? s.min : 15;
        const ah = ((h % 12) + m / 60) / 12 * TAU, am = m / 60 * TAU;
        line(g, [[cx, cy], [cx + Math.sin(ah) * 26, cy - Math.cos(ah) * 26]], '#e53935', 5);
        line(g, [[cx, cy], [cx + Math.sin(am) * 42, cy - Math.cos(am) * 42]], '#1e88e5', 3);
        circle(g, cx, cy, 4, '#263238');
      } },
      { p: 'hour', t: 'HOUR', x: 36, y: top + 30, w: 70, h: 24, c: '#ffcdd2', ct: '#c62828' },
      { p: 'minute', t: 'MINUTE', x: 36, y: top + 60, w: 70, h: 24, c: '#bbdefb', ct: '#1565c0' },
      { p: "o'clock", t: "3 O'CLOCK", x: 36, y: top + 90, w: 70, h: 24, c: '#fff9c4', tam: 9 },
      { p: 'quarter', t: 'QUARTER ¼', x: 36, y: top + 120, w: 70, h: 24, c: '#c8e6c9', tam: 9 },
      { p: 'schedule', t: 'SCHEDULE', x: 36, y: top + 150, w: 70, h: 22, c: '#e1bee7', tam: 9 }];
    tablero('clockBoard', W, H, 'WHAT TIME IS IT?', '#37474f', '#8d6e63', celdas);
  })();
  // Pizarra del salón
  (() => {
    const W = 300, H = 150, alto = H + 110, top = -alto;
    const celdas = [
      { p: 'lesson', t: 'LESSON 5: At school', x: -W / 2 + 12, y: top + 28, w: 180, h: 20, c: 'rgba(255,255,255,0.12)', ct: '#fff59d', tam: 10 },
      { p: 'word', t: 'Word: book', x: -W / 2 + 12, y: top + 54, w: 88, h: 20, c: 'rgba(255,255,255,0.12)', ct: '#fff', tam: 10 },
      { p: 'sentence', t: 'I read a book.', x: -W / 2 + 108, y: top + 54, w: 104, h: 20, c: 'rgba(255,255,255,0.12)', ct: '#fff', tam: 10 },
      { p: 'question', t: 'Q: Where is the bank?', x: -W / 2 + 12, y: top + 80, w: 150, h: 20, c: 'rgba(255,255,255,0.12)', ct: '#81d4fa', tam: 10 },
      { p: 'answer', t: 'A: Next to the park.', x: -W / 2 + 12, y: top + 104, w: 150, h: 20, c: 'rgba(255,255,255,0.12)', ct: '#a5d6a7', tam: 10 },
      { p: 'example', t: 'e.g. apple, egg', x: W / 2 - 124, y: top + 80, w: 112, h: 20, c: 'rgba(255,255,255,0.12)', ct: '#fff', tam: 10 },
      { p: 'mistake', t: 'I goed ✗ → I went', x: W / 2 - 124, y: top + 104, w: 112, h: 20, c: 'rgba(255,255,255,0.12)', ct: '#ef9a9a', tam: 9 }];
    tablero('schoolBoard', W, H, '', '#1b4332', '#8d6e63', celdas, { patas: 110 });
  })();
  // Materias
  (() => {
    const W = 300, H = 160, alto = H + 40, top = -alto, cw = 66, ch = 50, x0 = -W / 2 + 10;
    const m = [['math', '÷ × +', '#ffcdd2'], ['science', '⚗', '#c8e6c9'], ['history', '🏛', '#ffe0b2'], ['art', '🎨', '#f8bbd0'],
      ['music', '♪ ♫', '#e1bee7'], ['English', 'Hello!', '#bbdefb'], ['Spanish', '¡Hola!', '#fff9c4'], ['language', 'A あ ع', '#b2ebf2']];
    const celdas = m.map(([p, simb, c], i) => ({ p, x: x0 + (i % 4) * (cw + 4), y: top + 30 + Math.floor(i / 4) * (ch + 6), w: cw, h: ch, c,
      d: (g, cc) => { text(g, simb, cc.x + cc.w / 2, cc.y + 18, 13, '#37474f'); text(g, p.toUpperCase(), cc.x + cc.w / 2, cc.y + 38, 8.5, '#263238'); } }));
    celdas.push({ p: 'subject', t: 'SUBJECTS', x: x0, y: top + 142, w: 4 * cw + 12, h: 16, c: '#fff', tam: 9 });
    tablero('subjectsBoard', W, H, 'SCHOOL SUBJECTS', '#0d47a1', '#8d6e63', celdas);
  })();
  // Formas
  (() => {
    const W = 220, H = 130, alto = H + 40, top = -alto, x0 = -W / 2 + 10;
    const celdas = [
      { p: 'circle', x: x0, y: top + 30, w: 62, h: 60, c: '#fff', d: (g, c) => { ring(g, c.x + 31, c.y + 28, 18, '#e53935', 4); text(g, 'CIRCLE', c.x + 31, c.y + 53, 7.5, '#263238'); } },
      { p: 'triangle', x: x0 + 68, y: top + 30, w: 62, h: 60, c: '#fff', d: (g, c) => { g.strokeStyle = '#1e88e5'; g.lineWidth = 4; g.beginPath(); g.moveTo(c.x + 31, c.y + 10); g.lineTo(c.x + 50, c.y + 44); g.lineTo(c.x + 12, c.y + 44); g.closePath(); g.stroke(); text(g, 'TRIANGLE', c.x + 31, c.y + 53, 7, '#263238'); } },
      { p: 'line', x: x0 + 136, y: top + 30, w: 64, h: 60, c: '#fff', d: (g, c) => { line(g, [[c.x + 10, c.y + 36], [c.x + 54, c.y + 16]], '#43a047', 4); text(g, 'LINE', c.x + 32, c.y + 53, 7.5, '#263238'); } },
      { p: 'shape', t: 'SHAPES', x: x0, y: top + 98, w: 200, h: 24, c: '#fff59d', tam: 11 }];
    tablero('shapesBoard', W, H, 'SHAPES', '#ef6c00', '#8d6e63', celdas);
  })();
  // Cara
  (() => {
    const W = 230, H = 210, alto = H + 36, top = -alto, cx = -24, cy = top + 120;
    const cara = (g) => {
      ell(g, cx, cy - 58, 56, 30, '#5d4037'); ell(g, cx, cy, 52, 62, '#f1c27d'); ell(g, cx - 54, cy, 9, 14, '#e0ac69'); ell(g, cx + 54, cy, 9, 14, '#e0ac69');
      ell(g, cx, cy - 64, 50, 20, '#5d4037'); ell(g, cx - 20, cy - 12, 10, 7, '#fff'); ell(g, cx + 20, cy - 12, 10, 7, '#fff'); circle(g, cx - 20, cy - 12, 4.5, '#5d4037'); circle(g, cx + 20, cy - 12, 4.5, '#5d4037');
      poly(g, [[cx, cy - 6], [cx - 8, cy + 14], [cx + 8, cy + 14]], '#e0ac69');
      g.beginPath(); g.moveTo(cx - 22, cy + 28); g.quadraticCurveTo(cx, cy + 50, cx + 22, cy + 28); g.closePath(); g.fillStyle = '#b71c1c'; g.fill();
      rect(g, cx - 16, cy + 29, 32, 6, '#fff'); for (let k = -12; k <= 12; k += 8) line(g, [[cx + k, cy + 29], [cx + k, cy + 35]], '#e0e0e0', 1);
      ell(g, cx + 6, cy + 42, 8, 4, '#f06292'); curve(g, cx - 22, cy + 28, cx, cy + 22, cx + 22, cy + 28, '#c2185b', 3);
    };
    const et = (p, t, x, y, px, py) => ({ p, x, y, w: 58, h: 18, c: '#fff', t, tam: 9, d: (g) => line(g, [[x + (x < cx ? 58 : 0), y + 9], [px, py]], '#90a4ae', 1.2) });
    const celdas = [
      { p: 'face', fondo: false, x: cx - 52, y: cy - 30, w: 104, h: 30, d: (g) => cara(g) },
      { p: 'head', t: 'HEAD', x: -W / 2 + 8, y: top + 28, w: 58, h: 18, c: '#fff', tam: 9 },
      et('hair', 'HAIR', W / 2 - 66, top + 28, cx + 30, cy - 70),
      et('eye', 'EYE', W / 2 - 66, top + 56, cx + 28, cy - 12),
      et('ear', 'EAR', -W / 2 + 8, top + 100, cx - 58, cy),
      et('nose', 'NOSE', W / 2 - 66, top + 84, cx + 6, cy + 8),
      et('mouth', 'MOUTH', W / 2 - 66, top + 112, cx + 18, cy + 34),
      et('lip', 'LIP', -W / 2 + 8, top + 128, cx - 18, cy + 30),
      et('tooth', 'TOOTH', W / 2 - 66, top + 140, cx + 12, cy + 32),
      et('teeth', 'TEETH', -W / 2 + 8, top + 156, cx - 6, cy + 32),
      et('tongue', 'TONGUE', W / 2 - 66, top + 168, cx + 8, cy + 42),
      et('chin', 'CHIN', -W / 2 + 8, top + 184, cx, cy + 58)];
    tablero('faceChart', W, H, 'THE FACE', '#e3f2fd', '#1565c0', celdas, { colorTitulo: '#1565c0', patas: 36 });
  })();
  // Cuerpo
  (() => {
    const W = 240, H = 230, alto = H + 36, top = -alto, cx = -30, by = top + 210;
    const cuerpo = (g) => {
      const piel = '#e0ac69', ropa = '#42a5f5';
      circle(g, cx, by - 160, 16, piel); rect(g, cx - 5, by - 146, 10, 10, piel);
      rr(g, cx - 26, by - 138, 52, 60, 10, ropa);
      line(g, [[cx - 24, by - 132], [cx - 40, by - 96], [cx - 44, by - 68]], piel, 10); line(g, [[cx + 24, by - 132], [cx + 40, by - 96], [cx + 44, by - 68]], piel, 10);
      circle(g, cx - 44, by - 64, 7, piel); circle(g, cx + 44, by - 64, 7, piel); line(g, [[cx + 48, by - 62], [cx + 52, by - 54]], piel, 3);
      rect(g, cx - 22, by - 80, 44, 16, '#1565c0');
      line(g, [[cx - 12, by - 66], [cx - 14, by - 32], [cx - 14, by - 6]], piel, 13); line(g, [[cx + 12, by - 66], [cx + 14, by - 32], [cx + 14, by - 6]], piel, 13);
      circle(g, cx - 14, by - 32, 6, sh(piel, -0.08)); circle(g, cx + 14, by - 32, 6, sh(piel, -0.08));
      ell(g, cx - 18, by - 2, 12, 5, piel); ell(g, cx + 18, by - 2, 12, 5, piel); circle(g, cx + 27, by - 3, 2.5, sh(piel, -0.1));
    };
    const et = (p, t, x, y, px, py) => ({ p, x, y, w: 60, h: 17, c: '#fff', t, tam: 8.5, d: (g) => line(g, [[x + (x < cx ? 60 : 0), y + 8.5], [px, py]], '#90a4ae', 1.2) });
    const X0 = -W / 2 + 6, X1 = W / 2 - 66;
    const celdas = [
      { p: 'body', fondo: false, x: cx - 30, y: by - 136, w: 60, h: 50, d: g => cuerpo(g) },
      et('neck', 'NECK', X1, top + 30, cx + 5, by - 142), et('shoulder', 'SHOULDER', X0, top + 30, cx - 24, by - 134),
      et('chest', 'CHEST', X1, top + 52, cx + 10, by - 124), et('arm', 'ARM', X0, top + 56, cx - 36, by - 104),
      et('stomach', 'STOMACH', X1, top + 76, cx + 6, by - 96), et('hand', 'HAND', X0, top + 104, cx - 44, by - 64),
      et('finger', 'FINGER', X1, top + 100, cx + 52, by - 56), et('leg', 'LEG', X0, top + 132, cx - 14, by - 48),
      et('knee', 'KNEE', X1, top + 128, cx + 14, by - 32), et('foot', 'FOOT', X0, top + 180, cx - 22, by - 2),
      et('feet', 'FEET', X0, top + 204, cx - 4, by), et('toe', 'TOE', X1, top + 186, cx + 27, by - 3),
      { p: 'back', x: X1, y: top + 152, w: 60, h: 26, c: '#fff', d: (g, c) => { text(g, 'BACK', c.x + 20, c.y + 13, 8.5, '#263238'); rr(g, c.x + 38, c.y + 4, 16, 18, 4, '#42a5f5'); circle(g, c.x + 46, c.y + 2, 4, '#5d4037'); } }];
    tablero('bodyChart', W, H, 'THE BODY', '#e8f5e9', '#2e7d32', celdas, { colorTitulo: '#2e7d32', patas: 36 });
  })();
  // Por dentro
  (() => {
    const W = 220, H = 150, alto = H + 36, top = -alto, x0 = -W / 2 + 10, cw = 64;
    const celdas = [
      { p: 'heart', x: x0, y: top + 30, w: cw, h: 54, c: '#ffebee', d: (g, c) => { const x = c.x + 32, y = c.y + 22; circle(g, x - 7, y - 4, 8, '#e53935'); circle(g, x + 7, y - 4, 8, '#e53935'); poly(g, [[x - 15, y], [x + 15, y], [x, y + 16]], '#e53935'); text(g, 'HEART', x, c.y + 46, 8, '#263238'); } },
      { p: 'brain', x: x0 + cw + 6, y: top + 30, w: cw, h: 54, c: '#fce4ec', d: (g, c) => { const x = c.x + 32, y = c.y + 22; ell(g, x, y, 20, 14, '#f48fb1'); curve(g, x - 14, y - 4, x - 6, y - 12, x, y - 2, '#ec407a', 2); curve(g, x, y - 2, x + 8, y + 8, x + 14, y, '#ec407a', 2); text(g, 'BRAIN', x, c.y + 46, 8, '#263238'); } },
      { p: 'bone', x: x0 + 2 * (cw + 6), y: top + 30, w: cw, h: 54, c: '#eceff1', d: (g, c) => { const x = c.x + 32, y = c.y + 22; rect(g, x - 14, y - 3, 28, 6, '#fff'); [[-14, -4], [-14, 4], [14, -4], [14, 4]].forEach(([dx, dy]) => circle(g, x + dx, y + dy, 5, '#fff')); text(g, 'BONE', x, c.y + 46, 8, '#263238'); } },
      { p: 'blood', x: x0, y: top + 92, w: cw + 30, h: 46, c: '#ffebee', d: (g, c) => { const x = c.x + 22, y = c.y + 24; g.beginPath(); g.moveTo(x, y - 14); g.quadraticCurveTo(x + 12, y + 2, x, y + 12); g.quadraticCurveTo(x - 12, y + 2, x, y - 14); g.fillStyle = '#c62828'; g.fill(); text(g, 'BLOOD', x + 42, y, 9, '#263238'); } },
      { p: 'skin', x: x0 + cw + 36, y: top + 92, w: cw + 40, h: 46, c: '#fff3e0', d: (g, c) => { [['#ffdbac', 0], ['#e0ac69', 1], ['#8d5524', 2]].forEach(([col, i]) => circle(g, c.x + 16 + i * 14, c.y + 22, 7, col)); text(g, 'SKIN', c.x + 78, c.y + 23, 9, '#263238'); } }];
    tablero('insideChart', W, H, 'INSIDE THE BODY', '#fafafa', '#c62828', celdas, { colorTitulo: '#c62828', patas: 36 });
  })();
  // Mapa del pueblo
  tablero('mapBoard', 170, 130, 'TOWN MAP', '#1b5e20', '#5d4037', [{ p: 'map', x: -75, y: -150, w: 150, h: 100, c: '#dcedc8', d: (g, c) => {
    rect(g, c.x, c.y + 44, c.w, 10, '#9e9e9e'); rect(g, c.x + 60, c.y, 10, c.w - 50, '#9e9e9e');
    [['#e57373', 10, 10], ['#64b5f6', 90, 12], ['#ffd54f', 20, 64], ['#81c784', 90, 66]].forEach(([col, x, y]) => rect(g, c.x + x, c.y + y, 34, 24, col));
    text(g, '★ YOU ARE HERE', c.x + 66, c.y + 92, 8, '#c62828');
  } }], { patas: 40 });
  // Mapa del mundo
  tablero('worldMap', 180, 110, 'THE WORLD', '#0277bd', '#5d4037', [{ p: 'world', x: -84, y: -134, w: 168, h: 84, c: '#81d4fa', d: (g, c) => {
    const x = c.x, y = c.y;
    poly(g, [[x + 14, y + 16], [x + 44, y + 12], [x + 50, y + 34], [x + 34, y + 44], [x + 20, y + 36]], '#66bb6a');
    poly(g, [[x + 38, y + 48], [x + 52, y + 50], [x + 48, y + 76], [x + 40, y + 74]], '#66bb6a');
    poly(g, [[x + 74, y + 14], [x + 110, y + 12], [x + 112, y + 30], [x + 90, y + 34], [x + 78, y + 28]], '#81c784');
    poly(g, [[x + 80, y + 36], [x + 100, y + 38], [x + 98, y + 66], [x + 86, y + 68]], '#aed581');
    poly(g, [[x + 110, y + 18], [x + 156, y + 16], [x + 158, y + 42], [x + 124, y + 44]], '#66bb6a'); ell(g, x + 144, y + 66, 12, 7, '#81c784');
  } }], { patas: 40 });
  // Horario del bus
  tablero('busSchedule', 76, 96, 'BUS', '#1565c0', '#37474f', [{ p: 'schedule', x: -32, y: -118, w: 64, h: 70, c: '#fff', d: (g, c) => {
    text(g, 'SCHEDULE', c.x + 32, c.y + 9, 7, '#1565c0'); ['7:00', '7:30', '8:00', '8:30', '9:00'].forEach((h, i) => text(g, h, c.x + 32, c.y + 22 + i * 10, 8, '#263238'));
  } }], { patas: 40 });
  // Clima (se dibuja con el clima actual)
  tablero('weatherBoard', 150, 110, 'WEATHER', '#0288d1', '#5d4037', [{ p: 'weather', x: -65, y: -126, w: 130, h: 76, c: '#e1f5fe', d: (g, c, t, s) => {
    const k = (s && s.clima) || 'sunny', x = c.x + 40, y = c.y + 36;
    if (k === 'sunny') { circle(g, x, y, 16, '#ffb300'); for (let a = 0; a < 8; a++) line(g, [[x + Math.cos(a) * 20, y + Math.sin(a) * 20], [x + Math.cos(a) * 26, y + Math.sin(a) * 26]], '#ffb300', 3); }
    else { circle(g, x - 10, y + 2, 12, '#b0bec5'); circle(g, x + 6, y - 4, 15, '#cfd8dc'); circle(g, x + 20, y + 4, 10, '#b0bec5'); if (k === 'rainy') for (let d = 0; d < 4; d++) line(g, [[x - 10 + d * 9, y + 18], [x - 13 + d * 9, y + 28]], '#1e88e5', 2); if (k === 'windy') for (let d = 0; d < 3; d++) curve(g, x - 20, y + 16 + d * 6, x, y + 10 + d * 6, x + 26, y + 16 + d * 6, '#78909c', 2); }
    text(g, k.toUpperCase(), c.x + 96, c.y + 38, 11, '#01579b');
  } }], { patas: 40 });
  // Tablero de empleos
  tablero('jobBoard', 110, 100, 'JOBS', '#795548', '#4e342e', [{ p: 'job', x: -48, y: -120, w: 96, h: 66, c: '#d7ccc8', d: (g, c) => {
    [['WAITER', '#fff59d'], ['DRIVER', '#b3e5fc'], ['TEACHER', '#c8e6c9'], ['NURSE', '#f8bbd0']].forEach(([s, col], i) => { rr(g, c.x + 4 + (i % 2) * 46, c.y + 4 + Math.floor(i / 2) * 31, 42, 27, 2, col); text(g, s, c.x + 25 + (i % 2) * 46, c.y + 17 + Math.floor(i / 2) * 31, 7, '#263238'); });
  } }], { patas: 40 });
  // Carteles de películas y de vacaciones
  def('moviePosters', 150, 120, g => {
    [[-38, '#311b92', 'SPACE WAR'], [38, '#b71c1c', 'THE HERO']].forEach(([x, c, s]) => {
      rect(g, x - 3, -30, 6, 30, '#37474f'); rr(g, x - 32, -118, 64, 92, 3, '#fff8e1'); rect(g, x - 28, -114, 56, 84, c);
      circle(g, x, -84, 16, 'rgba(255,255,255,.25)'); text(g, s, x, -48, 8, '#ffd54f'); text(g, '★★★★', x, -38, 7, '#fff');
    });
  }, { partes: { movie: [-72, -120, 144, 96] } });
  def('holidayPoster', 76, 110, g => {
    rect(g, -3, -30, 6, 30, '#37474f'); rr(g, -34, -108, 68, 82, 3, '#fff'); rect(g, -30, -104, 60, 74, '#4fc3f7');
    rect(g, -30, -52, 60, 22, '#ffe082'); circle(g, 14, -90, 8, '#ffca28'); rect(g, -18, -72, 3, 22, '#6d4c41'); ell(g, -16, -74, 12, 4, '#43a047', 0.3);
    text(g, 'HOLIDAY', 0, -40, 10, '#e65100');
  });
  def('healthPoster', 76, 110, g => {
    rect(g, -3, -30, 6, 30, '#37474f'); rr(g, -34, -108, 68, 82, 3, '#e8f5e9');
    rect(g, -6, -96, 12, 30, '#43a047'); rect(g, -15, -87, 30, 12, '#43a047');
    text(g, 'HEALTH', 0, -56, 11, '#2e7d32'); text(g, 'Eat well · Sleep', 0, -44, 6.5, '#388e3c'); text(g, 'Walk every day', 0, -36, 6.5, '#388e3c');
  });

  /* ======================================================================
     LETREROS
  ====================================================================== */
  function letrero(nombre, w, texto, color, opts = {}) {
    const h = opts.alto || 100;
    def(nombre, w + 8, h, g => {
      const postes = opts.postes || 1;
      if (postes === 1) rect(g, -4, -h + 30, 8, h - 30, MADERA_OSC);
      else { rect(g, -w / 2 + 10, -h + 30, 7, h - 30, MADERA_OSC); rect(g, w / 2 - 17, -h + 30, 7, h - 30, MADERA_OSC); }
      rr(g, -w / 2, -h, w, opts.bh || 40, 8, color); g.strokeStyle = '#fff'; g.lineWidth = 2.5; rrPath(g, -w / 2 + 3, -h + 3, w - 6, (opts.bh || 40) - 6, 6); g.stroke();
      const lineas = texto.split('\n');
      lineas.forEach((s, i) => text(g, s, 0, -h + (opts.bh || 40) / 2 + (i - (lineas.length - 1) / 2) * 13, opts.tam || 13, '#fff'));
      if (opts.icono) opts.icono(g, h);
    });
  }
  letrero('yardSaleSign', 110, 'YARD SALE\nToday!', '#e53935', { bh: 44 });
  letrero('grassSign', 120, 'KEEP OFF\nTHE GRASS', '#2e7d32', { bh: 44, tam: 12 });
  letrero('natureSign', 120, 'NATURE\nTRAIL →', '#558b2f', { bh: 44 });
  letrero('gardenSign', 150, 'COMMUNITY\nGARDEN', '#6d4c41', { bh: 44, postes: 2 });
  letrero('beachSign', 100, 'BEACH', '#0288d1');
  letrero('zooSign', 190, 'CITY ZOO\nanimals', '#e65100', { bh: 48, postes: 2, alto: 120 });
  letrero('petSign', 100, 'PETS', '#43a047');
  letrero('welcomeSign', 210, 'WELCOME TO\nENGLISH TOWN', '#2f7d4f', { bh: 48, postes: 2, alto: 110, tam: 14 });
  letrero('neighborhoodSign', 180, 'OUR\nNEIGHBORHOOD', '#5e35b1', { bh: 48, postes: 2, alto: 110 });
  letrero('companySign', 170, 'GLOBAL\nCOMPANY', '#263238', { bh: 48, postes: 2 });
  letrero('classroomSign', 120, 'CLASSROOM\n5B', '#1565c0', { bh: 44 });
  letrero('parkingSign', 50, 'P', '#1565c0', { bh: 46, tam: 28, alto: 130 });
  letrero('wifiSign', 110, 'FREE Wi-Fi\nINTERNET', '#00897b', { bh: 44, tam: 11 });
  letrero('universitySign', 150, 'UNIVERSITY\n2 miles →', '#4a148c', { bh: 44, tam: 12 });
  letrero('stationSign', 120, 'STATION', '#37474f');
  def('streetSign', 110, 160, g => {
    rect(g, -3, -150, 6, 150, '#546e7a');
    rr(g, -52, -150, 104, 20, 3, '#2e7d32'); text(g, 'MAIN ST', 0, -140, 11, '#fff');
    rr(g, -44, -126, 88, 20, 3, '#2e7d32'); text(g, 'OAK AVE', 0, -116, 11, '#fff');
  }, { partes: { street: [-52, -150, 104, 20], corner: [-44, -126, 88, 20] } });
  def('signpostA', 170, 190, g => {
    rect(g, -4, -190, 8, 190, MADERA_OSC);
    const flecha = (y, dir, s, c) => { const x0 = dir < 0 ? -80 : 0, x1 = dir < 0 ? 0 : 80; poly(g, [[x0 + (dir < 0 ? 12 : 0), y], [x1 - (dir < 0 ? 0 : 12), y], [dir < 0 ? x1 : x1, y + 11], [x1 - (dir < 0 ? 0 : 12), y + 22], [x0 + (dir < 0 ? 12 : 0), y + 22], [dir < 0 ? x0 : x0, y + 11]], c); text(g, s, (x0 + x1) / 2, y + 11.5, 10, '#fff'); };
    flecha(-184, -1, 'AIRPORT', '#1565c0'); flecha(-156, 1, 'STATION', '#6a1b9a'); flecha(-128, -1, 'CITY', '#c62828'); flecha(-100, 1, 'VILLAGE', '#2e7d32');
  }, { partes: { airport: [-84, -186, 84, 26], station: [0, -158, 84, 26], city: [-84, -130, 84, 26], village: [0, -102, 84, 26] } });
  def('signpostB', 150, 180, g => {
    rect(g, -4, -150, 8, 150, MADERA_OSC);
    rr(g, -70, -150, 140, 26, 5, '#f57f17'); text(g, 'THIS WAY →', 0, -137, 11, '#fff');
    circle(g, 0, -80, 34, '#fffde7'); ring(g, 0, -80, 34, '#5d4037', 3);
    poly(g, [[0, -112], [7, -80], [-7, -80]], '#c62828'); poly(g, [[0, -48], [7, -80], [-7, -80]], '#37474f');
    text(g, 'N', 0, -121, 10, '#c62828'); text(g, 'S', 0, -39, 10, '#37474f'); text(g, 'E', 42, -80, 9, '#37474f'); text(g, 'W', -42, -80, 9, '#37474f');
  }, { partes: { way: [-70, -150, 140, 26], north: [-14, -118, 28, 36], south: [-14, -80, 28, 36] } });
  def('turnSign', 150, 150, g => {
    rect(g, -3, -100, 6, 100, '#546e7a'); rr(g, -70, -150, 140, 52, 6, '#1565c0');
    const flecha = (x, ang) => { g.save(); g.translate(x, -124); g.rotate(ang); poly(g, [[-3, 12], [3, 12], [3, -2], [8, -2], [0, -12], [-8, -2], [-3, -2]], '#fff'); g.restore(); };
    flecha(-44, -Math.PI / 2); flecha(0, 0); flecha(44, Math.PI / 2);
    text(g, 'LEFT', -44, -106, 7, '#fff'); text(g, 'STRAIGHT', 0, -106, 7, '#fff'); text(g, 'RIGHT', 44, -106, 7, '#fff');
  }, { partes: { left: [-70, -150, 46, 52], straight: [-24, -150, 48, 52], right: [24, -150, 46, 52] } });
  def('infoKiosk', 76, 140, g => {
    rr(g, -30, -130, 60, 130, 8, '#0277bd'); rr(g, -24, -120, 48, 60, 5, '#e1f5fe'); circle(g, 0, -104, 7, '#0277bd'); rect(g, -4, -94, 8, 24, '#0277bd');
    text(g, 'INFO', 0, -44, 12, '#fff'); rect(g, -34, -4, 68, 4, '#01579b');
  });
  def('newsStand', 96, 116, g => {
    rect(g, -44, -80, 88, 80, '#37474f'); poly(g, [[-50, -80], [50, -80], [44, -110], [-44, -110]], '#c62828'); text(g, 'NEWS', 0, -95, 13, '#fff');
    for (let i = 0; i < 4; i++) { rect(g, -38 + i * 20, -70, 17, 24, '#fafafa'); rect(g, -36 + i * 20, -66, 13, 4, '#212121'); for (let k = 0; k < 3; k++) line(g, [[-36 + i * 20, -58 + k * 4], [-24 + i * 20, -58 + k * 4]], '#9e9e9e', 1); }
    rect(g, -44, -40, 88, 6, '#263238');
  });
  def('ticketBooth', 90, 130, g => {
    rect(g, -40, -110, 80, 110, '#8e24aa'); poly(g, [[-46, -110], [46, -110], [40, -130], [-40, -130]], '#4a148c'); text(g, 'TICKETS', 0, -119, 11, '#ffd54f');
    rect(g, -28, -96, 56, 40, '#e1f5fe'); rect(g, -32, -56, 64, 6, '#6a1b9a');
    rr(g, -12, -52, 24, 14, 2, '#ffd54f'); text(g, 'ADMIT', 0, -45, 5.5, '#6a1b9a');
  });
  def('subway', 130, 96, g => {
    rect(g, -60, -8, 120, 8, '#616161'); for (let k = 0; k < 4; k++) rect(g, -44 + k * 6, -8 + k * 0, 88 - k * 12, 2, '#424242');
    rect(g, -58, -44, 6, 44, '#37474f'); rect(g, 52, -44, 6, 44, '#37474f'); line(g, [[-58, -44], [58, -44]], '#37474f', 4);
    rect(g, -4, -96, 8, 52, '#37474f'); rr(g, -46, -96, 92, 26, 5, '#2e7d32'); text(g, 'SUBWAY', 0, -83, 13, '#fff'); circle(g, -34, -83, 8, '#fff'); text(g, 'M', -34, -83, 10, '#2e7d32');
  });
  def('gasPump', 60, 110, g => {
    rr(g, -22, -100, 44, 96, 5, '#e53935'); rr(g, -16, -92, 32, 26, 3, '#263238'); text(g, '$3.50', 0, -79, 9, '#76ff03');
    rect(g, -26, -4, 52, 4, '#9e9e9e'); text(g, 'GAS', 0, -52, 12, '#fff'); curve(g, 22, -60, 34, -40, 28, -20, '#212121', 3); rr(g, 22, -28, 10, 16, 3, '#424242');
  });
  def('roadWork', 150, 74, g => {
    [-58, 58].forEach(x => { poly(g, [[x - 12, 0], [x + 12, 0], [x + 4, -30], [x - 4, -30]], '#ff6d00'); rect(g, x - 8, -16, 16, 4, '#fff'); });
    rect(g, -40, -44, 6, 44, '#616161'); rect(g, 34, -44, 6, 44, '#616161');
    rr(g, -48, -58, 96, 20, 2, '#fff'); for (let x = -46; x < 46; x += 16) poly(g, [[x, -58], [x + 8, -58], [x + 16, -38], [x + 8, -38]], '#e53935');
    rr(g, -44, -74, 88, 16, 3, '#ffb300'); text(g, 'ROAD WORK', 0, -66, 10, '#263238');
  });
  def('blueprint', 100, 64, g => {
    rect(g, -44, -44, 6, 44, MADERA_OSC); rect(g, 38, -44, 6, 44, MADERA_OSC); rect(g, -48, -48, 96, 8, MADERA);
    g.save(); g.translate(0, -52); g.transform(1, 0, -0.3, 1, 0, 0); rect(g, -40, -12, 80, 12, '#1565c0'); g.restore();
    rr(g, -38, -64, 76, 16, 2, '#1976d2'); for (let k = 0; k < 3; k++) line(g, [[-32 + k * 20, -60], [-16 + k * 20, -52]], '#e3f2fd', 1.2); text(g, 'PLAN', 22, -56, 7, '#e3f2fd');
  });
  def('bricks', 70, 40, g => { for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) rr(g, -32 + c * 16 + (r % 2) * 8, -10 - r * 9, 15, 8, 1, r === 3 && c > 1 ? 'rgba(0,0,0,0)' : '#c0392b'); });

  /* ======================================================================
     PUESTOS, MESAS Y MUEBLES DE ESCENA (bases sin palabra propia)
  ====================================================================== */
  Obj.puesto = function (g, w, color, titulo) {
    const h = 150;
    rect(g, -w / 2 + 6, -h, 8, h, MADERA_OSC); rect(g, w / 2 - 14, -h, 8, h, MADERA_OSC);
    for (let k = 0; k < Math.ceil(w / 34); k++) {
      const x = -w / 2 + k * 34; g.fillStyle = k % 2 ? '#ffffff' : color;
      g.beginPath(); g.moveTo(x, -h); g.lineTo(Math.min(x + 34, w / 2), -h); g.lineTo(Math.min(x + 34, w / 2), -h + 20); g.quadraticCurveTo(x + 17, -h + 30, x, -h + 20); g.fill();
    }
    if (titulo) { rr(g, -54, -h - 22, 108, 22, 5, sh(color, -0.2)); text(g, titulo, 0, -h - 11, 11, '#fff'); }
    rect(g, -w / 2, -44, w, 44, '#8a6239'); rect(g, -w / 2, -48, w, 6, '#a67c52');
    for (let x = -w / 2 + 8; x < w / 2; x += 22) line(g, [[x, -40], [x, -4]], '#6b4a2b', 1.5);
  };
  Obj.mesa = function (g, w, estilo) {
    if (estilo === 'mantel') {
      rect(g, -w / 2 + 10, -40, 6, 40, MADERA_OSC); rect(g, w / 2 - 16, -40, 6, 40, MADERA_OSC);
      rr(g, -w / 2, -50, w, 14, 3, '#fafafa'); for (let x = -w / 2; x < w / 2; x += 14) rect(g, x, -50, 7, 14, 'rgba(229,57,53,.75)');
    } else if (estilo === 'bistro') {
      rect(g, -3, -46, 6, 44, '#37474f'); ell(g, 0, -2, 16, 4, '#37474f'); rr(g, -w / 2, -52, w, 8, 3, '#eceff1');
    } else if (estilo === 'picnic') {
      rect(g, -w / 2 + 8, -40, 8, 40, MADERA_OSC); rect(g, w / 2 - 16, -40, 8, 40, MADERA_OSC);
      rr(g, -w / 2, -48, w, 10, 2, MADERA); rr(g, -w / 2 - 8, -22, w + 16, 7, 2, MADERA);
    } else {
      line(g, [[-w / 2 + 10, 0], [w / 2 - 20, -44]], METAL_OSC, 3); line(g, [[w / 2 - 10, 0], [-w / 2 + 20, -44]], METAL_OSC, 3);
      rr(g, -w / 2, -50, w, 8, 2, '#eceff1');
    }
  };
  Obj.tendedero = function (g, w) {
    [-w / 2, w / 2].forEach(x => { rect(g, x - 4, -88, 8, 88, MADERA_OSC); rect(g, x - 14, -88, 28, 5, MADERA_OSC); });
    curve(g, -w / 2, -84, 0, -78, w / 2, -84, '#eceff1', 2);
  };
  Obj.plataforma = function (g, w, color) { rr(g, -w / 2, -10, w, 10, 3, color || '#cfd8dc'); for (let x = -w / 2 + 20; x < w / 2; x += 20) line(g, [[x, -10], [x, 0]], 'rgba(0,0,0,.08)', 1); };
  Obj.cerca = function (g, w, h, color) {
    const c = color || '#d7ccc8';
    for (let x = -w / 2; x <= w / 2; x += 18) rect(g, x - 3, -h, 6, h, c);
    rect(g, -w / 2, -h + 6, w, 5, sh(c, -0.1)); rect(g, -w / 2, -h * 0.45, w, 5, sh(c, -0.1));
  };
  Obj.estante = function (g, w, niveles, h) {
    rect(g, -w / 2, -h, 6, h, MADERA_OSC); rect(g, w / 2 - 6, -h, 6, h, MADERA_OSC);
    for (let k = 0; k < niveles; k++) rect(g, -w / 2, -6 - k * (h / niveles), w, 5, MADERA);
  };
  def('grill', 70, 74, (g, t) => {
    line(g, [[-24, 0], [-18, -40]], '#37474f', 4); line(g, [[24, 0], [18, -40]], '#37474f', 4);
    g.beginPath(); g.ellipse(0, -44, 28, 16, 0, 0, Math.PI); g.fillStyle = '#263238'; g.fill(); rect(g, -30, -48, 60, 5, '#90a4ae');
    for (let x = -24; x <= 24; x += 8) line(g, [[x, -50], [x, -46]], '#607d8b', 2);
    [[-12, -52], [4, -53], [16, -52]].forEach(([x, y]) => rr(g, x - 7, y - 3, 14, 5, 2, '#8d4b2d'));
    vapor(g, -6, -58, t, 'rgba(180,180,180,.7)'); vapor(g, 10, -60, t + 0.5, 'rgba(180,180,180,.6)');
  });
  def('stroller', 60, 64, g => {
    circle(g, -16, -8, 8, '#37474f'); circle(g, 16, -8, 8, '#37474f'); circle(g, -16, -8, 3, '#b0bec5'); circle(g, 16, -8, 3, '#b0bec5');
    g.beginPath(); g.moveTo(-24, -20); g.lineTo(22, -20); g.quadraticCurveTo(24, -46, 4, -50); g.lineTo(-24, -50); g.closePath(); g.fillStyle = '#7e57c2'; g.fill();
    g.beginPath(); g.arc(-8, -44, 18, Math.PI, Math.PI * 1.9); g.lineTo(-8, -44); g.fillStyle = '#5e35b1'; g.fill();
    line(g, [[22, -22], [30, -58]], '#37474f', 3); line(g, [[26, -58], [34, -58]], '#37474f', 4);
    circle(g, 4, -40, 8, '#f1c27d'); circle(g, 2, -41, 1.1, '#111'); circle(g, 7, -41, 1.1, '#111'); ell(g, 4, -36, 2.2, 1.2, '#e57373'); ell(g, 4, -47, 7, 3, '#f8bbd0');
  }, { partes: { baby: [-4, -50, 18, 18] } });
  def('hammock', 170, 70, (g, t) => {
    [-78, 78].forEach(x => { rect(g, x - 4, -70, 8, 70, MADERA_OSC); });
    const s = Math.sin(t * 1.2) * 3;
    g.beginPath(); g.moveTo(-74, -58); g.quadraticCurveTo(0, -6 + s, 74, -58); g.lineTo(74, -52); g.quadraticCurveTo(0, 2 + s, -74, -52); g.closePath(); g.fillStyle = '#26a69a'; g.fill();
    for (let x = -60; x <= 60; x += 20) line(g, [[x, -40 + Math.abs(x) * 0.3 + s * 0.5], [x, -34 + Math.abs(x) * 0.3 + s * 0.5]], '#ffca28', 3);
  });
  def('tent', 120, 84, g => {
    poly(g, [[-56, 0], [0, -84], [56, 0]], '#ef6c00'); poly(g, [[0, -84], [56, 0], [30, 0]], '#e65100');
    poly(g, [[-14, 0], [0, -40], [14, 0]], '#3e2723'); line(g, [[0, -84], [0, -92]], '#6d4c41', 3);
  });
  def('campfire', 56, 56, (g, t) => {
    [[-18, -4, 0.3], [18, -4, -0.3], [0, -2, 0]].forEach(([x, y, r]) => { g.save(); g.translate(x, y); g.rotate(r); rr(g, -16, -3, 32, 7, 3, MADERA); g.restore(); });
    [[-14, -3], [14, -3], [0, 2]].forEach(([x, y]) => ell(g, x, y, 5, 3, '#9e9e9e'));
    const f = Math.sin(t * 10) * 3;
    poly(g, [[-12, -6], [-6, -30 + f], [0, -16], [6, -40 - f], [12, -6]], '#ff7043'); poly(g, [[-7, -6], [-2, -22 - f], [4, -10], [7, -6]], '#ffca28');
  });
  def('bench2', 130, 70, g => {
    rect(g, -58, -64, 116, 10, '#6b4a2b'); rect(g, -58, -50, 116, 8, '#6b4a2b'); rect(g, -62, -32, 124, 10, '#8a6239');
    [-50, 46].forEach(dx => { rect(g, dx, -64, 5, 64, '#3a3f45'); rect(g, dx - 2, -24, 8, 24, '#3a3f45'); });
  });
  def('chessTable', 90, 60, g => {
    rect(g, -4, -42, 8, 40, '#546e7a'); ell(g, 0, -2, 18, 4, '#546e7a'); rr(g, -40, -50, 80, 8, 2, '#8d6e63');
    g.save(); g.translate(0, -52); g.transform(1, 0, -0.35, 0.4, 0, 0);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) rect(g, -32 + c * 8, -16 + r * 8, 8, 8, (r + c) % 2 ? '#3e2723' : '#fff8e1');
    g.restore();
    [[-18, '#fafafa'], [-10, '#fafafa'], [12, '#212121'], [20, '#212121']].forEach(([x, c]) => { rect(g, x - 2, -64, 4, 8, c); circle(g, x, -66, 3, c); });
    rect(g, -2, -72, 4, 12, '#fafafa'); rect(g, -4, -74, 8, 3, '#fafafa');
  }, { partes: { chess: [-40, -76, 80, 30] } });
  def('boardGame', 70, 22, g => {
    g.save(); g.translate(0, -8); g.transform(1, 0, -0.4, 0.45, 0, 0);
    rr(g, -30, -24, 60, 48, 3, '#fff8e1'); for (let k = 0; k < 10; k++) rect(g, -28 + k * 5.6, -22, 5, 5, ['#ef5350', '#42a5f5', '#66bb6a', '#ffca28'][k % 4]);
    g.restore(); circle(g, -12, -14, 3, '#e53935'); circle(g, 10, -12, 3, '#1e88e5'); rr(g, 18, -14, 7, 7, 1.5, '#fff'); circle(g, 21.5, -10.5, 1, '#212121');
  });
  def('icecreamCart', 110, 124, (g, t) => {
    circle(g, -30, -10, 10, '#37474f'); circle(g, 30, -10, 10, '#37474f');
    rr(g, -46, -62, 92, 50, 6, '#e1f5fe'); rect(g, -46, -40, 92, 8, '#f48fb1'); text(g, 'ICE CREAM', 0, -52, 10, '#ec407a');
    line(g, [[-40, -62], [-40, -104]], '#90a4ae', 3); line(g, [[40, -62], [40, -104]], '#90a4ae', 3);
    for (let k = 0; k < 5; k++) { g.fillStyle = k % 2 ? '#fff' : '#f48fb1'; g.beginPath(); g.moveTo(-48 + k * 19.2, -104); g.lineTo(-48 + (k + 1) * 19.2, -104); g.lineTo(-48 + (k + 0.5) * 19.2, -92); g.closePath(); g.fill(); }
    rect(g, -48, -112, 96, 8, '#ec407a');
    g.save(); g.translate(0, -62); g.scale(0.9, 0.9); O.iceCream.d(g); g.restore();
  }, { partes: { 'ice cream': [-16, -110, 32, 48] } });
  def('foodTruck', 250, 130, (g, t) => {
    rr(g, -120, -112, 240, 94, 10, '#ffca28'); rect(g, -120, -40, 240, 8, '#f57f17');
    rr(g, -86, -96, 150, 46, 4, '#263238'); rect(g, -86, -52, 150, 8, '#bdbdbd');
    rr(g, 76, -100, 36, 40, 4, '#b3e5fc'); rect(g, -120, -112, 240, 10, '#e53935'); text(g, 'FOOD', -10, -121, 14, '#e53935');
    circle(g, -80, -16, 16, '#263238'); circle(g, 80, -16, 16, '#263238'); circle(g, -80, -16, 6, '#9e9e9e'); circle(g, 80, -16, 6, '#9e9e9e');
    rr(g, -110, -128, 200, 18, 4, '#e53935'); text(g, 'FOOD TRUCK', -10, -119, 11, '#fff');
  }, { partes: { food: [-120, -40, 240, 26] } });
  def('bookCart', 110, 70, g => {
    rect(g, -46, -58, 92, 44, '#6d4c41'); rect(g, -46, -36, 92, 4, '#4e342e');
    ['#c62828', '#1565c0', '#2e7d32', '#f9a825', '#6a1b9a', '#00838f', '#ef6c00', '#5d4037'].forEach((c, i) => rect(g, -42 + i * 11, -56 - (i % 3) * 2, 9, 20 + (i % 3) * 2, c));
    circle(g, -36, -8, 7, '#37474f'); circle(g, 36, -8, 7, '#37474f'); line(g, [[46, -50], [58, -62]], '#546e7a', 3);
  });
  def('luggage', 90, 100, g => {
    rect(g, -40, -14, 80, 6, '#ffd54f'); line(g, [[-36, -14], [-36, -96]], '#ffd54f', 4); line(g, [[36, -14], [36, -96]], '#ffd54f', 4); curve(g, -36, -96, 0, -112, 36, -96, '#ffd54f', 4);
    circle(g, -30, -4, 5, '#37474f'); circle(g, 30, -4, 5, '#37474f');
    rr(g, -30, -60, 34, 46, 4, '#1565c0'); rr(g, 6, -52, 26, 38, 4, '#c62828'); rr(g, -24, -84, 44, 24, 4, '#43a047'); rect(g, -6, -88, 8, 5, '#2e7d32');
  });
  def('petCages', 150, 60, g => { Obj.mesa(g, 150, 'plegable'); });
  def('pool', 250, 50, (g, t) => {
    rr(g, -120, -34, 240, 34, 6, '#b0bec5'); rr(g, -112, -30, 224, 26, 4, '#29b6f6');
    for (let k = 0; k < 5; k++) curve(g, -100 + k * 48, -18 + Math.sin(t * 2 + k) * 2, -88 + k * 48, -24, -76 + k * 48, -18 + Math.sin(t * 2 + k) * 2, 'rgba(255,255,255,.6)', 2);
    line(g, [[98, -34], [98, -60]], '#90a4ae', 3); line(g, [[110, -34], [110, -60]], '#90a4ae', 3); curve(g, 98, -60, 104, -68, 110, -60, '#90a4ae', 3);
    text(g, 'POOL', -86, -44, 10, '#0277bd');
  });
  def('dumbbells', 60, 26, g => { [[-14, -8], [14, -8]].forEach(([x, y]) => { rect(g, x - 10, y - 2, 20, 4, '#607d8b'); rr(g, x - 13, y - 8, 6, 16, 2, '#263238'); rr(g, x + 7, y - 8, 6, 16, 2, '#263238'); }); });
  def('sportsRack', 90, 90, g => {
    Obj.estante(g, 84, 2, 80);
    circle(g, -26, -54, 11, '#ff7043'); line(g, [[-37, -54], [-15, -54]], '#212121', 1); curve(g, -26, -65, -21, -54, -26, -43, '#212121', 1);
    circle(g, 0, -54, 10, '#fafafa'); circle(g, 24, -52, 7, '#cddc39');
    ell(g, -20, -24, 10, 13, '#1e88e5'); line(g, [[-20, -12], [-20, -4]], '#1e88e5', 3); ell(g, 20, -24, 10, 13, '#e53935'); line(g, [[20, -12], [20, -4]], '#e53935', 3);
  }, { partes: { sport: [-42, -80, 84, 76] } });
  def('basketballHoop', 90, 190, g => {
    rect(g, -40, -190, 6, 190, '#546e7a'); rr(g, -38, -190, 70, 48, 3, '#fff'); rect(g, -14, -172, 22, 18, '#fff'); g.strokeStyle = '#e53935'; g.lineWidth = 2; g.strokeRect(-14, -172, 22, 18);
    ell(g, 0, -150, 16, 4, 'rgba(0,0,0,0)'); g.strokeStyle = '#ff6d00'; g.lineWidth = 3; g.beginPath(); g.ellipse(-3, -150, 16, 4, 0, 0, TAU); g.stroke();
    for (let k = -2; k <= 2; k++) line(g, [[-3 + k * 6, -148], [-3 + k * 4, -128]], '#fff', 1.2);
    circle(g, 20, -12, 11, '#ff7043'); line(g, [[9, -12], [31, -12]], '#212121', 1); curve(g, 20, -23, 25, -12, 20, -1, '#212121', 1);
  });
  def('tennisNet', 190, 60, g => {
    rect(g, -90, -44, 5, 44, '#37474f'); rect(g, 85, -44, 5, 44, '#37474f'); rect(g, -86, -44, 172, 4, '#fff');
    g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 1; for (let x = -84; x < 86; x += 8) { g.beginPath(); g.moveTo(x, -40); g.lineTo(x, -14); g.stroke(); } for (let y = -38; y < -14; y += 6) { g.beginPath(); g.moveTo(-84, y); g.lineTo(84, y); g.stroke(); }
    [[-60, 1], [60, -1]].forEach(([x, d]) => { ell(g, x, -24, 9, 12, '#5c6bc0'); line(g, [[x, -12], [x + d * 4, 0]], '#3e2723', 3); });
    circle(g, 20, -8, 4, '#cddc39');
  });
  def('podium', 170, 76, g => {
    rr(g, -24, -70, 48, 70, 3, '#ffd54f'); text(g, '1', 0, -40, 22, '#f57f17');
    rr(g, -72, -50, 48, 50, 3, '#cfd8dc'); text(g, '2', -48, -26, 20, '#607d8b');
    rr(g, 24, -36, 48, 36, 3, '#ffab91'); text(g, '3', 48, -18, 18, '#bf360c');
  }, { partes: { first: [-24, -70, 48, 70], second: [-72, -50, 48, 50], third: [24, -36, 48, 36] } });
  def('finishBanner', 230, 130, g => {
    rect(g, -108, -130, 8, 130, '#37474f'); rect(g, 100, -130, 8, 130, '#37474f');
    rr(g, -104, -130, 208, 30, 4, '#fff'); for (let x = -104; x < 104; x += 16) for (let r = 0; r < 2; r++) rect(g, x + (r % 2) * 8, -130 + r * 8, 8, 8, '#212121');
    text(g, 'FINISH', 0, -108, 12, '#c62828');
    for (let x = -100; x < 100; x += 20) rect(g, x, -4, 10, 4, '#fff');
  });
  def('stage', 330, 60, g => {
    rr(g, -160, -34, 320, 34, 4, '#4e342e'); rect(g, -160, -38, 320, 6, '#6d4c41');
    [-150, 138].forEach(x => { rr(g, x, -96, 16, 60, 3, '#212121'); circle(g, x + 8, -80, 5, '#424242'); circle(g, x + 8, -56, 6, '#424242'); });
  });
  def('concertBanner', 250, 44, g => {
    rr(g, -120, -44, 240, 34, 6, '#6a1b9a'); text(g, '♪ CONCERT TONIGHT ♪', 0, -27, 13, '#ffd54f');
    rect(g, -118, -10, 5, 10, '#37474f'); rect(g, 113, -10, 5, 10, '#37474f');
  });
  def('birthdayBanner', 210, 150, g => {
    rect(g, -100, -150, 6, 150, MADERA_OSC); rect(g, 94, -150, 6, 150, MADERA_OSC);
    curve(g, -97, -146, 0, -124, 97, -146, '#8d6e63', 2);
    for (let k = 0; k < 9; k++) { const x = -86 + k * 21.5, y = -146 + Math.sin((k + 0.5) / 9 * Math.PI) * 20; poly(g, [[x - 8, y], [x + 8, y], [x, y + 16]], ['#ef5350', '#ffca28', '#42a5f5', '#66bb6a'][k % 4]); }
    rr(g, -84, -116, 168, 24, 5, '#fff'); text(g, 'HAPPY BIRTHDAY!', 0, -104, 12, '#e91e63');
    [[-92, -60, '#ef5350'], [-82, -70, '#42a5f5'], [92, -64, '#ffca28']].forEach(([x, y, c]) => { line(g, [[x, y + 14], [x + (x < 0 ? 6 : -4), -2]], '#9e9e9e', 1); ell(g, x, y, 9, 11, c); });
  }, { partes: { party: [-84, -118, 168, 28] } });
  def('birthdayCake', 60, 60, (g, t) => {
    O.cake.d(g);
    [-12, -4, 4, 12].forEach(x => { rect(g, x - 1.5, -52, 3, 12, ['#42a5f5', '#ef5350', '#66bb6a', '#ffca28'][(x + 12) / 8]); const f = 1 + Math.sin(t * 12 + x) * 0.15; ell(g, x, -56, 2 * f, 3.5 * f, '#ffb300'); });
  });
  def('weddingArch', 190, 196, g => {
    [-80, 80].forEach(x => rect(g, x - 5, -150, 10, 150, '#fff'));
    g.strokeStyle = '#fff'; g.lineWidth = 10; g.beginPath(); g.arc(0, -150, 80, Math.PI, 0); g.stroke();
    for (let k = 0; k <= 12; k++) { const a = Math.PI + k / 12 * Math.PI; const x = Math.cos(a) * 80, y = -150 + Math.sin(a) * 80; circle(g, x, y, 7, k % 2 ? '#f8bbd0' : '#fff59d'); circle(g, x + 4, y + 4, 4, '#81c784'); }
    [-80, 80].forEach(x => { for (let y = -140; y < -10; y += 22) circle(g, x, y, 5, '#f48fb1'); });
    rr(g, -44, -196, 88, 22, 5, '#fff'); text(g, 'JUST MARRIED', 0, -185, 10, '#c2185b');
  }, { partes: { wedding: [-88, -196, 176, 60] } });
  def('meetingTable', 170, 60, g => {
    rect(g, -70, -44, 8, 44, MADERA_OSC); rect(g, 62, -44, 8, 44, MADERA_OSC); rr(g, -80, -52, 160, 10, 3, '#5d4037');
    rect(g, -60, -58, 22, 6, '#fafafa'); rect(g, 40, -58, 22, 6, '#fafafa'); g.save(); g.translate(0, -52); O.coffee.d(g, 0); g.restore();
  });
  def('emailLaptop', 70, 56, g => {
    rr(g, -24, -14, 48, 14, 2, '#5d4037');
    poly(g, [[-30, -14], [30, -14], [26, -20], [-26, -20]], '#b0bec5'); rr(g, -26, -56, 52, 36, 3, '#37474f'); rect(g, -23, -53, 46, 30, '#fff');
    rect(g, -23, -53, 46, 7, '#e53935'); text(g, '@ Inbox (3)', 0, -49.5, 5.5, '#fff');
    for (let k = 0; k < 3; k++) { circle(g, -17, -40 + k * 6.5, 2, '#90caf9'); line(g, [[-12, -40 + k * 6.5], [16, -40 + k * 6.5]], '#90a4ae', 1.5); }
  });
  def('microscope', 44, 60, g => {
    rr(g, -18, -6, 36, 6, 2, '#37474f'); curve(g, 10, -6, 16, -30, 4, -44, '#546e7a', 6); rect(g, -8, -26, 20, 4, '#90a4ae');
    g.save(); g.translate(-2, -40); g.rotate(-0.4); rr(g, -4, -18, 8, 26, 2, '#eceff1'); rect(g, -5, -22, 10, 6, '#37474f'); g.restore();
  });
  def('sandcastle', 80, 60, g => {
    rect(g, -32, -30, 64, 30, '#e9c46a'); for (let x = -32; x < 32; x += 10) rect(g, x, -36, 6, 6, '#e9c46a');
    rect(g, -12, -50, 24, 22, '#f4d58d'); for (let x = -12; x < 12; x += 8) rect(g, x, -56, 5, 6, '#f4d58d');
    g.beginPath(); g.arc(0, -8, 7, Math.PI, 0); g.lineTo(7, 0); g.lineTo(-7, 0); g.fillStyle = '#b08b3a'; g.fill();
    line(g, [[0, -56], [0, -72]], '#6d4c41', 1.5); poly(g, [[0, -72], [12, -68], [0, -64]], '#e53935');
    rr(g, 30, -12, 12, 12, 2, '#29b6f6'); line(g, [[32, -12], [40, -22]], '#29b6f6', 2);
  }, { partes: { sand: [-40, -36, 80, 36] } });
  def('beachUmbrella', 110, 110, g => {
    line(g, [[4, 0], [-4, -96]], '#8d6e63', 4);
    g.beginPath(); g.moveTo(-54, -80); g.quadraticCurveTo(-4, -130, 46, -80); g.closePath(); g.fillStyle = '#ef5350'; g.fill();
    for (let k = -2; k <= 1; k++) { g.beginPath(); g.moveTo(-4, -104); g.lineTo(-54 + (k + 2) * 25, -80); g.lineTo(-54 + (k + 2.5) * 25, -80); g.closePath(); g.fillStyle = '#fff'; g.fill(); }
    rr(g, -48, -8, 70, 8, 2, '#29b6f6'); for (let x = -46; x < 20; x += 10) rect(g, x, -8, 5, 8, '#fff59d');
  });
  def('lighthouse', 70, 190, (g, t) => {
    poly(g, [[-24, 0], [24, 0], [14, -150], [-14, -150]], '#fafafa');
    for (let k = 0; k < 3; k++) poly(g, [[-22 + k * 3.3, -30 - k * 44], [22 - k * 3.3, -30 - k * 44], [20 - k * 3.3, -48 - k * 44], [-20 + k * 3.3, -48 - k * 44]], '#e53935');
    rect(g, -16, -170, 32, 20, '#ffd54f'); poly(g, [[-20, -170], [20, -170], [0, -190]], '#c62828');
    g.globalAlpha = 0.3 + 0.3 * Math.sin(t * 3); poly(g, [[16, -164], [70, -184], [70, -144]], '#fff59d'); g.globalAlpha = 1;
  });
  def('statueKing', 70, 170, g => pedestal(g, 'KING', (x, y) => {
    rr(g, x - 20, y - 70, 40, 70, 8, '#b0bec5'); poly(g, [[x - 26, y - 64], [x - 34, y], [x + 34, y], [x + 26, y - 64]], '#90a4ae');
    circle(g, x, y - 84, 14, '#b0bec5'); poly(g, [[x - 14, y - 96], [x - 14, y - 108], [x - 7, y - 100], [x, y - 110], [x + 7, y - 100], [x + 14, y - 108], [x + 14, y - 96]], '#ffd54f');
    ell(g, x, y - 76, 10, 6, '#90a4ae'); line(g, [[x + 22, y - 60], [x + 30, y - 110]], '#90a4ae', 4); circle(g, x + 30, y - 112, 5, '#ffd54f');
  }));
  def('statueQueen', 70, 170, g => pedestal(g, 'QUEEN', (x, y) => {
    poly(g, [[x - 14, y - 70], [x + 14, y - 70], [x + 28, y], [x - 28, y]], '#b0bec5');
    circle(g, x, y - 82, 13, '#b0bec5'); ell(g, x, y - 86, 16, 12, '#90a4ae');
    poly(g, [[x - 11, y - 96], [x - 9, y - 106], [x - 4, y - 99], [x, y - 108], [x + 4, y - 99], [x + 9, y - 106], [x + 11, y - 96]], '#ffd54f'); circle(g, x, y - 104, 2, '#e53935');
    circle(g, x - 18, y - 50, 5, '#90a4ae'); line(g, [[x - 12, y - 62], [x - 18, y - 50]], '#b0bec5', 5);
  }));
  def('statueSoldier', 70, 170, g => pedestal(g, 'SOLDIER', (x, y) => {
    rect(g, x - 10, y - 30, 8, 30, '#8d9ba3'); rect(g, x + 2, y - 30, 8, 30, '#8d9ba3'); rr(g, x - 14, y - 66, 28, 38, 5, '#b0bec5');
    circle(g, x, y - 76, 11, '#b0bec5'); g.beginPath(); g.ellipse(x, y - 80, 14, 9, 0, Math.PI, 0); g.fillStyle = '#90a4ae'; g.fill(); rect(g, x - 16, y - 81, 32, 3, '#90a4ae');
    line(g, [[x + 16, y - 60], [x + 20, y - 100]], '#78909c', 3); line(g, [[x - 14, y - 60], [x - 22, y - 36]], '#b0bec5', 6);
  }));
  function pedestal(g, nombre, figura) {
    rr(g, -30, -50, 60, 50, 3, '#9e9e9e'); rect(g, -34, -54, 68, 6, '#bdbdbd'); rect(g, -34, -4, 68, 4, '#757575');
    rr(g, -22, -34, 44, 14, 2, '#c9a227'); text(g, nombre, 0, -27, 8, '#3e2723');
    figura(0, -54);
  }
  def('windmill', 110, 210, (g, t) => {
    poly(g, [[-18, 0], [18, 0], [8, -150], [-8, -150]], '#eceff1'); rect(g, -6, -30, 12, 30, '#8d6e63');
    circle(g, 0, -152, 6, '#607d8b');
    for (let k = 0; k < 4; k++) { g.save(); g.translate(0, -152); g.rotate(t * 1.5 + k * Math.PI / 2); rr(g, -4, -58, 8, 54, 2, '#b0bec5'); rr(g, -12, -56, 8, 44, 2, '#eceff1'); g.restore(); }
  });
  def('gardenBed', 180, 50, (g, t) => {
    rr(g, -86, -22, 172, 22, 3, '#8d6e63'); rect(g, -82, -22, 164, 8, '#5d4037');
    for (let k = 0; k < 8; k++) { const x = -72 + k * 20; line(g, [[x, -22], [x, -34]], '#388e3c', 2); ell(g, x - 4, -34, 6, 3, '#66bb6a', -0.5); ell(g, x + 4, -36, 6, 3, '#43a047', 0.5); if (k % 3 === 0) circle(g, x, -40, 4, '#e53935'); }
  });
  def('plowedField', 260, 60, g => {
    poly(g, [[-120, 0], [120, 0], [100, -50], [-100, -50]], '#8d6e63');
    for (let k = 0; k < 6; k++) { const y = -6 - k * 8; line(g, [[-118 + k * 3.4, y], [118 - k * 3.4, y]], '#6d4c41', 3); }
    for (let k = 0; k < 10; k++) { const x = -96 + k * 21; line(g, [[x, -46], [x, -56]], '#7cb342', 2); ell(g, x, -58, 4, 2.5, '#9ccc65'); }
  }, { partes: { land: [-120, -50, 240, 50] } });
  def('scarecrow', 70, 130, g => {
    rect(g, -3, -110, 6, 110, MADERA_OSC); rect(g, -34, -86, 68, 6, MADERA_OSC);
    poly(g, [[-22, -88], [22, -88], [18, -44], [-18, -44]], '#1565c0'); for (let k = 0; k < 3; k++) rect(g, -12 + k * 10, -80, 6, 6, '#c62828');
    circle(g, 0, -100, 12, '#f5deb3'); ell(g, 0, -110, 20, 5, '#d4a017'); rr(g, -10, -124, 20, 14, 3, '#d4a017');
    circle(g, -4, -102, 1.8, '#212121'); circle(g, 4, -102, 1.8, '#212121'); curve(g, -5, -96, 0, -93, 5, -96, '#212121', 1.5);
    poly(g, [[-34, -86], [-40, -78], [-32, -80]], '#d4a017'); poly(g, [[34, -86], [40, -78], [32, -80]], '#d4a017');
  });
  def('wagon', 70, 44, g => {
    rr(g, -30, -30, 60, 18, 3, '#e53935'); circle(g, -18, -8, 8, '#37474f'); circle(g, 18, -8, 8, '#37474f');
    line(g, [[30, -22], [48, -30]], '#37474f', 3); rr(g, -24, -44, 20, 14, 2, '#c8a27a'); rr(g, 0, -40, 22, 10, 2, '#fbc02d');
  });
  def('picnicBlanket', 200, 30, g => {
    poly(g, [[-96, 0], [96, 0], [80, -26], [-80, -26]], '#ef5350');
    for (let k = 0; k < 6; k++) line(g, [[-96 + k * 32 + 8, 0], [-80 + k * 26.6 + 6, -26]], 'rgba(255,255,255,.7)', 5);
    line(g, [[-90, -9], [90, -9]], 'rgba(255,255,255,.7)', 4); line(g, [[-85, -18], [85, -18]], 'rgba(255,255,255,.7)', 4);
    rr(g, 50, -34, 30, 22, 4, '#a1887f'); curve(g, 52, -34, 65, -50, 78, -34, '#6d4c41', 3);
  });
  def('chalkDrawing', 110, 20, g => {
    ell(g, 0, -8, 52, 9, 'rgba(0,0,0,.06)');
    ring(g, -30, -9, 6, '#ffeb3b', 2); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; line(g, [[-30 + Math.cos(a) * 8, -9 + Math.sin(a) * 4], [-30 + Math.cos(a) * 11, -9 + Math.sin(a) * 5.5]], '#ffeb3b', 1.5); }
    g.strokeStyle = '#f48fb1'; g.lineWidth = 2; g.strokeRect(-8, -12, 16, 8); line(g, [[-10, -12], [0, -17], [10, -12]], '#f48fb1', 2);
    for (let k = 0; k < 3; k++) { g.strokeStyle = '#81d4fa'; g.strokeRect(20 + k * 9, -12, 8, 6); }
  });

  /* ======================================================================
     VEHÍCULOS (de perfil, mirando a la derecha)
  ====================================================================== */
  def('bus', 230, 100, g => {
    rr(g, -110, -92, 220, 76, 10, '#fbc02d'); rect(g, -110, -40, 220, 6, '#f57f17');
    for (let k = 0; k < 6; k++) rr(g, -96 + k * 32, -82, 26, 26, 3, '#b3e5fc'); rr(g, 92, -82, 14, 40, 3, '#b3e5fc');
    text(g, 'SCHOOL BUS', -20, -28, 11, '#212121');
    [-66, 70].forEach(x => { circle(g, x, -14, 15, '#263238'); circle(g, x, -14, 6, '#9e9e9e'); }); rect(g, 104, -30, 8, 8, '#fff59d');
  });
  def('taxi', 130, 60, g => {
    g.beginPath(); g.moveTo(-60, -16); g.lineTo(-60, -34); g.lineTo(-30, -38); g.lineTo(-14, -56); g.lineTo(26, -56); g.lineTo(44, -38); g.lineTo(62, -34); g.lineTo(62, -16); g.closePath(); g.fillStyle = '#fdd835'; g.fill();
    poly(g, [[-10, -52], [4, -52], [4, -38], [-24, -38]], '#b3e5fc'); poly(g, [[8, -52], [24, -52], [38, -38], [8, -38]], '#b3e5fc');
    rr(g, -8, -66, 24, 10, 2, '#fff'); text(g, 'TAXI', 4, -61, 7, '#212121');
    for (let x = -56; x < 60; x += 12) rect(g, x, -26, 6, 5, '#212121');
    [-36, 38].forEach(x => { circle(g, x, -14, 12, '#263238'); circle(g, x, -14, 5, '#9e9e9e'); });
  });
  def('truck', 200, 96, g => {
    rr(g, -96, -90, 130, 70, 3, '#eceff1'); text(g, 'DELIVERY', -31, -58, 13, '#1565c0'); rect(g, -96, -30, 130, 6, '#90a4ae');
    rr(g, 36, -70, 58, 50, 6, '#1565c0'); rr(g, 58, -64, 28, 20, 3, '#b3e5fc'); rect(g, 90, -30, 8, 8, '#fff59d');
    [-70, -30, 64].forEach(x => { circle(g, x, -14, 14, '#263238'); circle(g, x, -14, 5, '#9e9e9e'); });
  });
  def('motorcycle', 90, 60, g => {
    [-28, 28].forEach(x => { ring(g, x, -14, 13, '#263238', 5); circle(g, x, -14, 3, '#9e9e9e'); });
    poly(g, [[-26, -16], [-6, -34], [18, -34], [30, -16]], '#e53935'); rr(g, -18, -40, 26, 8, 4, '#212121');
    line(g, [[22, -30], [30, -48], [36, -48]], '#9e9e9e', 3); rect(g, 30, -44, 6, 6, '#fff59d'); line(g, [[-10, -18], [-32, -14]], '#9e9e9e', 3);
  });

  /* ======================================================================
     CIELO Y PAISAJE DEL FONDO
  ====================================================================== */
  def('sun', 110, 110, (g, t) => {
    const r = 34; g.globalAlpha = 0.25; circle(g, 0, -55, r + 18 + Math.sin(t * 2) * 3, '#fff59d'); g.globalAlpha = 1;
    for (let k = 0; k < 12; k++) { const a = k / 12 * TAU + t * 0.2; line(g, [[Math.cos(a) * (r + 6), -55 + Math.sin(a) * (r + 6)], [Math.cos(a) * (r + 16), -55 + Math.sin(a) * (r + 16)]], '#ffca28', 4); }
    circle(g, 0, -55, r, '#ffd54f'); circle(g, -8, -62, 10, 'rgba(255,255,255,.4)');
  });
  def('moon', 80, 80, (g, t, s) => {
    g.globalAlpha = s && s.noche ? 1 : 0.55;
    circle(g, 0, -40, 28, '#fffde7'); circle(g, 12, -46, 25, s && s.noche ? '#0b1320' : '#9ecae9');
    circle(g, -8, -34, 4, 'rgba(0,0,0,.08)'); g.globalAlpha = 1;
  });
  def('star', 40, 40, (g, t, s) => {
    const a = (s && s.noche ? 1 : 0.5) * (0.75 + 0.25 * Math.sin(t * 3));
    g.globalAlpha = a; const pts = []; for (let k = 0; k < 10; k++) { const r = k % 2 ? 7 : 17, ang = -Math.PI / 2 + k * Math.PI / 5; pts.push([Math.cos(ang) * r, -20 + Math.sin(ang) * r]); } poly(g, pts, '#fff59d'); g.globalAlpha = 1;
  });
  def('cloud', 150, 60, g => { [[-40, -22, 22], [-12, -34, 28], [22, -30, 25], [48, -20, 18], [0, -16, 30]].forEach(([x, y, r]) => circle(g, x, y, r, '#ffffff')); rect(g, -60, -18, 120, 16, '#ffffff'); ell(g, 0, -2, 64, 4, 'rgba(0,0,0,.05)'); });
  def('rainCloud', 170, 110, (g, t) => {
    [[-44, -72, 24], [-12, -86, 30], [24, -80, 26], [52, -70, 20], [0, -66, 32]].forEach(([x, y, r]) => circle(g, x, y, r, '#90a4ae')); rect(g, -64, -70, 128, 16, '#90a4ae');
    for (let k = 0; k < 10; k++) { const p = (t * 1.4 + k * 0.13) % 1; line(g, [[-50 + k * 11, -50 + p * 50], [-54 + k * 11, -40 + p * 50]], 'rgba(33,150,243,.7)', 2); }
  });
  def('stormCloud', 170, 120, (g, t) => {
    [[-44, -82, 24], [-12, -96, 30], [24, -90, 26], [52, -80, 20], [0, -76, 32]].forEach(([x, y, r]) => circle(g, x, y, r, '#546e7a')); rect(g, -64, -80, 128, 16, '#546e7a');
    if ((t % 3) < 0.25) poly(g, [[-6, -62], [8, -62], [0, -40], [12, -40], [-10, -4], [-2, -34], [-14, -34]], '#fff59d');
    for (let k = 0; k < 8; k++) { const p = (t * 1.6 + k * 0.17) % 1; line(g, [[-40 + k * 11, -60 + p * 56], [-45 + k * 11, -48 + p * 56]], 'rgba(207,216,220,.8)', 2); }
  });
  def('rainbow', 300, 150, g => {
    ['#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#5e35b1'].forEach((c, i) => { g.globalAlpha = 0.75; g.strokeStyle = c; g.lineWidth = 9; g.beginPath(); g.arc(0, 0, 140 - i * 9, Math.PI, 0); g.stroke(); });
    g.globalAlpha = 1;
  });
  def('balloon', 90, 130, (g, t) => {
    const b = Math.sin(t * 0.8) * 4;
    g.beginPath(); g.moveTo(-36, -84 + b); g.bezierCurveTo(-40, -140 + b, 40, -140 + b, 36, -84 + b); g.quadraticCurveTo(24, -52 + b, 10, -44 + b); g.lineTo(-10, -44 + b); g.quadraticCurveTo(-24, -52 + b, -36, -84 + b); g.fillStyle = '#e53935'; g.fill();
    for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(k * 12, -124 + b); g.quadraticCurveTo(k * 22, -90 + b, k * 5, -46 + b); g.strokeStyle = '#ffd54f'; g.lineWidth = 5; g.stroke(); }
    line(g, [[-9, -44 + b], [-8, -24 + b]], '#6d4c41', 1.2); line(g, [[9, -44 + b], [8, -24 + b]], '#6d4c41', 1.2); rr(g, -10, -24 + b, 20, 16, 2, '#8d6e63');
  });
  def('plane', 170, 60, g => {
    rr(g, -76, -34, 150, 20, 10, '#eceff1'); poly(g, [[74, -24], [86, -28], [74, -16]], '#eceff1');
    poly(g, [[-66, -34], [-78, -58], [-60, -58], [-46, -34]], '#1e88e5'); poly(g, [[-6, -24], [-36, 0], [-18, 0], [22, -24]], '#90a4ae');
    for (let k = 0; k < 8; k++) circle(g, -40 + k * 12, -26, 3, '#1e88e5'); rr(g, 58, -32, 10, 7, 3, '#1e88e5');
  });
  def('train', 620, 90, g => {
    const car = (x, c) => { rr(g, x - 90, -80, 180, 64, 6, c); for (let k = 0; k < 5; k++) rr(g, x - 76 + k * 32, -70, 24, 22, 3, '#e1f5fe'); rect(g, x - 90, -30, 180, 6, sh(c, -0.25)); [-60, 60].forEach(dx => { circle(g, x + dx, -12, 12, '#263238'); circle(g, x + dx, -12, 4, '#9e9e9e'); }); };
    car(-210, '#1e88e5'); car(-20, '#1e88e5');
    rr(g, 90, -86, 190, 70, 8, '#c62828'); poly(g, [[280, -86], [310, -60], [310, -16], [280, -16]], '#c62828'); rr(g, 110, -76, 40, 26, 4, '#e1f5fe'); rr(g, 250, -76, 30, 26, 4, '#e1f5fe');
    rect(g, 90, -30, 220, 6, '#8e1c1c'); [130, 200, 270].forEach(x => { circle(g, x, -12, 12, '#263238'); circle(g, x, -12, 4, '#9e9e9e'); }); circle(g, 302, -34, 5, '#fff59d');
    text(g, 'EXPRESS', 190, -40, 12, '#fff');
  });
})();
