'use strict';

/* ============================================================================
   ENGLISH STREET (Juego 2)  ·  juego/calle_dibujos.js
   ----------------------------------------------------------------------------
   Dibujos propios del juego 2, en el mismo estilo plano de English Town:
   el cielo y la calle, los escenarios de cada personaje, sus accesorios,
   Pip (la mascota mágica que cambia con los adjetivos), las tarjetas de
   palabras, los botes de pintura, el reloj y el clima.
   Convención de English Town: origen en el suelo, y negativa hacia arriba,
   una persona adulta mide 100.
============================================================================ */
const CalleDib = (() => {
  const { circle, ring, ell, rect, rr, rrPath, poly, line, curve, text, emoji, brillo, MADERA, MADERA_OSC, METAL } = Obj;
  const TAU = Math.PI * 2;
  const sh = (c, a) => Gen.shade(c, a);

  /* ======================================================================
     ACCESORIOS DE LOS PERSONAJES (x = centro, top = coronilla, alto = estatura)
  ====================================================================== */
  const ACC = {
    apron(g, x, top, alto) {
      const y0 = top + alto * 0.3, y1 = top + alto * 0.74;
      rr(g, x - 13, y0, 26, y1 - y0, 4, '#fafafa');
      line(g, [[x - 10, y0], [x - 6, top + alto * 0.22]], '#e0e0e0', 2); line(g, [[x + 10, y0], [x + 6, top + alto * 0.22]], '#e0e0e0', 2);
      rect(g, x - 9, y0 + 14, 18, 8, '#ef9a9a'); line(g, [[x - 13, y0 + 10], [x + 13, y0 + 10]], '#bdbdbd', 1.5);
    },
    chefHat(g, x, top) {
      rect(g, x - 11, top - 2, 22, 10, '#ffffff');
      circle(g, x - 8, top - 6, 8, '#ffffff'); circle(g, x + 8, top - 6, 8, '#ffffff'); circle(g, x, top - 11, 9, '#ffffff');
      line(g, [[x - 11, top + 6], [x + 11, top + 6]], '#e0e0e0', 1.5);
    },
    nurseCap(g, x, top) { poly(g, [[x - 11, top + 7], [x + 11, top + 7], [x + 8, top - 2], [x - 8, top - 2]], '#ffffff'); rect(g, x - 2, top, 4, 6, '#e53935'); rect(g, x - 4, top + 2, 8, 2, '#e53935'); },
    driverCap(g, x, top) { g.beginPath(); g.ellipse(x, top + 8, 13, 7, 0, Math.PI, 0); g.fillStyle = '#1565c0'; g.fill(); rect(g, x - 2, top + 7, 18, 3, '#0d47a1'); circle(g, x, top + 3, 2, '#ffd54f'); },
    cap(g, x, top) { g.beginPath(); g.ellipse(x, top + 8, 13, 8, 0, Math.PI, 0); g.fillStyle = '#ef6c00'; g.fill(); rect(g, x, top + 6, 17, 3.5, '#e65100'); },
    whistle(g, x, top, alto) { const y = top + alto * 0.24; line(g, [[x - 7, y - 3], [x, y + 9], [x + 7, y - 3]], '#fdd835', 1.5); rr(g, x - 3, y + 8, 7, 5, 2, '#b0bec5'); },
    mimeHat(g, x, top) { ell(g, x + 1, top + 5, 13, 6, '#212121', -0.12); circle(g, x + 2, top - 1, 2, '#212121'); ell(g, x - 5, top + 15, 2.5, 1.5, 'rgba(255,255,255,.9)'); ell(g, x + 5, top + 15, 2.5, 1.5, 'rgba(255,255,255,.9)'); },
    topHat(g, x, top) { ell(g, x, top + 7, 17, 4, '#212121'); rect(g, x - 10, top - 18, 20, 25, '#212121'); rect(g, x - 10, top + 1, 20, 4, '#ab47bc'); }
  };
  function accesorio(g, nombre, x, top, alto) {
    if (ACC[nombre]) ACC[nombre](g, x, top, alto);
    else if (typeof ACCESORIOS !== 'undefined' && ACCESORIOS[nombre]) ACCESORIOS[nombre](g, x, top, alto);
  }

  /* ======================================================================
     CIELO, FONDO Y CALLE
     p: avance del día (0 = mañana, 1 = atardecer)
  ====================================================================== */
  const CIELOS = [[0, '#ffd8a8', '#9fd3f5'], [0.3, '#bfe6ff', '#5aaee8'], [0.65, '#ffe6a8', '#6fb6e6'], [1, '#ffb27a', '#7d6bb5']];
  function cieloColores(p) {
    let a = CIELOS[0], b = CIELOS[CIELOS.length - 1];
    for (let i = 0; i < CIELOS.length - 1; i++) if (p >= CIELOS[i][0] && p <= CIELOS[i + 1][0]) { a = CIELOS[i]; b = CIELOS[i + 1]; break; }
    const t = b[0] === a[0] ? 0 : (p - a[0]) / (b[0] - a[0]);
    return [Gen.mix(a[1], b[1], t), Gen.mix(a[2], b[2], t)];
  }
  function cielo(g, W, H, p) {
    const [bajo, alto] = cieloColores(p);
    const gr = g.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, alto); gr.addColorStop(0.75, bajo); gr.addColorStop(1, bajo);
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
  }
  function sol(g, x, y, r, p) {
    const c = p > 0.85 ? '#ff8a50' : '#ffe066';
    g.globalAlpha = 0.25; circle(g, x, y, r * 1.8, c); g.globalAlpha = 1; circle(g, x, y, r, c);
  }
  // Nubes que pasan despacio (en coordenadas de pantalla)
  function nubes(g, W, H, camX, t, seed) {
    const R = Gen.makeRand('nubes' + seed);
    for (let i = 0; i < 6; i++) {
      const w = R.range(90, 170), vel = R.range(4, 9);
      const x = ((R.range(0, W + 400) - camX * 0.05 + t * vel) % (W + 400) + W + 400) % (W + 400) - 200;
      const y = R.range(H * 0.06, H * 0.3);
      g.fillStyle = 'rgba(255,255,255,0.85)';
      g.beginPath(); g.ellipse(x, y, w * 0.5, w * 0.16, 0, 0, TAU); g.ellipse(x - w * 0.2, y - w * 0.09, w * 0.22, w * 0.15, 0, 0, TAU);
      g.ellipse(x + w * 0.15, y - w * 0.12, w * 0.26, w * 0.18, 0, 0, TAU); g.fill();
    }
  }
  // Montañas lejanas y edificios de fondo (paralaje); dibujados en coordenadas del mundo ya escaladas
  function lejos(g, x0, x1, seed, p) {
    const R = Gen.makeRand('lejos' + seed);
    const col = Gen.mix('#8fb3c9', '#7a6f9a', p);
    g.fillStyle = col; g.beginPath(); g.moveTo(x0 - 400, 0);
    for (let x = Math.floor(x0 / 260) * 260 - 520; x < x1 + 520; x += 260) {
      const h = 160 + (Gen.makeRand('m' + seed + x)() * 140);
      g.lineTo(x + 130, -h); g.lineTo(x + 260, -40);
    }
    g.lineTo(x1 + 520, 0); g.closePath(); g.fill();
    void R;
  }
  const FACHADAS = ['#f4d6a0', '#f7b7a3', '#c8e6c9', '#bbdefb', '#e1bee7', '#ffe082', '#d7ccc8', '#b2dfdb', '#ffccbc', '#f8bbd0'];
  function edificios(g, x0, x1, seed, p) {
    const paso = 210;
    for (let x = Math.floor(x0 / paso) * paso - paso; x < x1 + paso; x += paso) {
      const R = Gen.makeRand('ed' + seed + x);
      const w = R.range(150, 200), h = R.range(170, 290), c = Gen.mix(R.pick(FACHADAS), '#6a5f8f', p * 0.35);
      const bx = x + (paso - w) / 2;
      rect(g, bx, -h, w, h, c);
      rect(g, bx - 4, -h - 8, w + 8, 10, sh(c, -0.25));
      const cols = Math.floor(w / 46), filas = Math.floor((h - 60) / 54);
      for (let i = 0; i < cols; i++) for (let j = 0; j < filas; j++) {
        const wx = bx + 14 + i * ((w - 28) / cols), wy = -h + 22 + j * 54;
        rr(g, wx, wy, 26, 32, 3, p > 0.85 && R.chance(0.5) ? '#ffe082' : '#e3f2fd');
        rect(g, wx + 12, wy, 2, 32, 'rgba(0,0,0,.08)');
      }
      if (R.chance(0.6)) { rr(g, bx + w / 2 - 14, -46, 28, 46, 3, sh(c, -0.35)); circle(g, bx + w / 2 + 8, -22, 2, '#ffd54f'); }
    }
  }
  // Acera y calle (y = 0 es el borde de la acera donde se camina)
  function calle(g, x0, x1, H) {
    rect(g, x0, -6, x1 - x0, 6, '#9e9e9e');
    rect(g, x0, 0, x1 - x0, 36, '#cfd8dc');
    for (let x = Math.floor(x0 / 60) * 60; x < x1; x += 60) rect(g, x, 0, 2, 36, '#b0bec5');
    rect(g, x0, 36, x1 - x0, 8, '#90a4ae');
    rect(g, x0, 44, x1 - x0, H, '#546e7a');
    for (let x = Math.floor(x0 / 120) * 120; x < x1; x += 120) rect(g, x, 92, 60, 6, '#eceff1');
  }
  function arbol(g, x, y, R, t) {
    const s = R.range(0.85, 1.2), c = R.pick(['#43a047', '#388e3c', '#66bb6a', '#2e7d32']);
    rect(g, x - 6 * s, y - 70 * s, 12 * s, 70 * s, MADERA);
    const sw = Math.sin(t * 1.2 + x) * 2;
    circle(g, x + sw, y - 100 * s, 38 * s, c); circle(g, x - 26 * s + sw, y - 80 * s, 26 * s, sh(c, -0.1)); circle(g, x + 26 * s + sw, y - 82 * s, 28 * s, sh(c, 0.1));
  }
  function farola(g, x, y, encendida) {
    rect(g, x - 3, y - 160, 6, 160, '#455a64'); rr(g, x - 9, y - 172, 18, 14, 4, '#37474f');
    if (encendida) { g.globalAlpha = 0.3; circle(g, x, y - 160, 26, '#fff59d'); g.globalAlpha = 1; }
    circle(g, x, y - 160, 6, encendida ? '#fff59d' : '#eceff1');
  }

  /* ======================================================================
     ESCENARIOS DE LOS PERSONAJES
     Cada uno: atras(g, x, t, ch) se dibuja antes del personaje y
     frente(g, x, t, ch) después. mesa = [x0, x1, y] donde se ponen las
     cosas (relativo al centro x del encuentro). npc = posición del
     personaje. vitrina = centro de la pantalla grande (Pip, cuerpo…).
  ====================================================================== */
  function toldo(g, x0, x1, y, alto, c1, c2) {
    const n = Math.round((x1 - x0) / 34), w = (x1 - x0) / n;
    for (let i = 0; i < n; i++) {
      rect(g, x0 + i * w, y, w, alto, i % 2 ? c2 : c1);
      g.fillStyle = i % 2 ? c2 : c1; g.beginPath(); g.arc(x0 + i * w + w / 2, y + alto, w / 2, 0, Math.PI); g.fill();
    }
    rect(g, x0, y - 4, x1 - x0, 5, sh(c1, -0.3));
  }
  function letrero(g, x, y, w, h, s, fondo, color) {
    rr(g, x - w / 2, y - h / 2, w, h, 6, fondo); rrPath(g, x - w / 2, y - h / 2, w, h, 6); g.strokeStyle = sh(fondo, -0.35); g.lineWidth = 3; g.stroke();
    text(g, s, x, y + 1, Math.min(h * 0.55, (w - 16) / (s.length * 0.62)), color);
  }
  function mostrador(g, x0, x1, y, c) {
    rect(g, x0, y, x1 - x0, -y, MADERA);
    for (let i = 0; i < 4; i++) rect(g, x0 + 8, y + 10 + i * ((-y - 14) / 4), x1 - x0 - 16, 2, MADERA_OSC);
    rect(g, x0 - 6, y - 6, x1 - x0 + 12, 8, sh(MADERA, 0.15));
    if (c) rect(g, x0, y + 6, x1 - x0, 7, c);
  }
  function casita(g, x0, x1, alto, pared, techo) {
    rect(g, x0, -alto, x1 - x0, alto, pared);
    poly(g, [[x0 - 18, -alto], [(x0 + x1) / 2, -alto - 80], [x1 + 18, -alto]], techo);
    rect(g, x0, -alto, x1 - x0, 6, sh(pared, -0.2));
  }
  function puerta(g, x, w, h, c) { rr(g, x - w / 2, -h, w, h, 4, c); rr(g, x - w / 2 + 6, -h + 8, w - 12, h * 0.4, 3, sh(c, 0.15)); circle(g, x + w / 2 - 8, -h / 2, 2.5, '#ffd54f'); }
  function ventana(g, x, y, w, h) { rr(g, x - w / 2 - 3, y - 3, w + 6, h + 6, 3, '#fafafa'); rect(g, x - w / 2, y, w, h, '#90caf9'); rect(g, x - 1, y, 2, h, '#fafafa'); rect(g, x - w / 2, y + h / 2 - 1, w, 2, '#fafafa'); brillo(g, x - w / 4, y + h / 4, 5, 3); }
  function flores(g, x0, x1, y, t) {
    const cs = ['#e91e63', '#ffeb3b', '#ab47bc', '#ff7043', '#42a5f5'];
    for (let x = x0, i = 0; x < x1; x += 14, i++) { const s = Math.sin(t * 2 + i) * 1.5; line(g, [[x, y], [x + s, y - 14]], '#43a047', 2); circle(g, x + s, y - 16, 4.5, cs[i % cs.length]); circle(g, x + s, y - 16, 1.6, '#fff8e1'); }
  }
  function mesaRedonda(g, x0, x1, y, c) {
    const cx = (x0 + x1) / 2;
    ell(g, cx, y, (x1 - x0) / 2 + 6, 9, sh(c, -0.15)); ell(g, cx, y - 3, (x1 - x0) / 2 + 6, 9, c);
    rect(g, cx - 4, y + 4, 8, -y - 4, '#5d4037'); ell(g, cx, -2, 26, 5, '#5d4037');
  }

  const ESC = {
    puesto: {
      mesa: [-205, 25, -64], npc: 100,
      atras(g, x, t, ch) {
        const [c1, c2] = ch.toldo;
        rect(g, x - 225, -190, 400, 126, sh(c2, -0.06));
        for (let i = 0; i < 3; i++) rect(g, x - 215, -160 + i * 34, 380, 4, sh(c2, -0.18));
        rect(g, x - 228, -200, 8, 200, MADERA_OSC); rect(g, x + 172, -200, 8, 200, MADERA_OSC);
        toldo(g, x - 245, x + 195, -212, 30, c1, c2);
        letrero(g, x - 25, -240, 190, 36, ch.letrero, '#fffdf5', sh(c1, -0.35));
        if (ch.letrero === 'BUTCHER') for (let i = 0; i < 5; i++) { const sx = x - 170 + i * 30, sw = Math.sin(t * 2 + i) * 2; line(g, [[sx, -178], [sx + sw, -150]], '#8d6e63', 1.5); ell(g, sx + sw, -140, 6, 12, '#c0392b'); }
        if (ch.letrero === 'FRUIT & VEG') { rr(g, x + 110, -26, 56, 26, 3, MADERA); for (let i = 0; i < 4; i++) circle(g, x + 120 + i * 12, -30, 6, ['#e53935', '#fb8c00', '#fdd835', '#7cb342'][i]); }
        if (ch.letrero === 'BAKERY') { for (let i = 0; i < 4; i++) ell(g, x - 180 + i * 46, -168, 18, 9, '#d4a056'); }
        if (ch.letrero === 'CLOTHES') { line(g, [[x - 200, -176], [x + 150, -176]], METAL, 3); [['#e53935', -180], ['#1e88e5', -120], ['#fdd835', -60], ['#43a047', 0], ['#8e24aa', 60]].forEach(([c, dx]) => { line(g, [[x + dx, -176], [x + dx, -170]], '#555', 1.5); poly(g, [[x + dx - 14, -170], [x + dx + 14, -170], [x + dx + 12, -132], [x + dx - 12, -132]], c); }); }
      },
      frente(g, x, t, ch) { mostrador(g, x - 215, x + 40, -64, ch.toldo[0]); }
    },
    cafe: {
      mesa: [-195, -25, -54], npc: 80,
      atras(g, x, t) {
        rect(g, x - 60, -230, 300, 230, '#5d8fc9'); rect(g, x - 66, -238, 312, 12, '#2f5f9a');
        toldo(g, x - 70, x + 250, -200, 24, '#1565c0', '#e3f2fd'); letrero(g, x + 95, -252, 120, 30, 'CAFÉ', '#fff8e1', '#4e342e');
        ventana(g, x + 20, -160, 70, 70); puerta(g, x + 190, 50, 96, '#3e2723');
        // sombrilla
        line(g, [[x - 110, -54], [x - 110, -190]], '#eceff1', 4);
        g.fillStyle = '#ef5350'; g.beginPath(); g.moveTo(x - 200, -170); g.quadraticCurveTo(x - 110, -230, x - 20, -170); g.closePath(); g.fill();
        for (let i = 0; i < 4; i++) { g.fillStyle = '#fff'; g.beginPath(); g.moveTo(x - 200 + i * 45 + 22, -170); g.lineTo(x - 110, -205); g.lineTo(x - 200 + i * 45 + 34, -170); g.fill(); }
      },
      frente(g, x) { mesaRedonda(g, x - 195, x - 25, -54, '#fafafa'); [-225, 5].forEach(dx => { rect(g, x + dx - 2, -40, 4, 40, '#78909c'); rr(g, x + dx - 14, -44, 28, 6, 3, '#90a4ae'); }); }
    },
    casa: {
      mesa: [-200, -50, -50], npc: 95,
      atras(g, x, t) {
        casita(g, x - 10, x + 250, 210, '#f8bbd0', '#ad1457');
        rect(g, x + 180, -290, 24, 60, '#8d6e63');
        ventana(g, x + 45, -160, 60, 56); puerta(g, x + 170, 54, 104, '#6d4c41');
        rr(g, x + 10, -100, 72, 12, 3, '#795548'); flores(g, x + 14, x + 80, -100, t);
        rect(g, x - 270, -46, 250, 5, '#ffffff'); for (let px = x - 266; px < x - 20; px += 22) { rect(g, px, -62, 8, 62, '#ffffff'); poly(g, [[px, -62], [px + 4, -70], [px + 8, -62]], '#ffffff'); }
        Animales.cat(g, x + 230, -2, '#ff9800', t);
      },
      frente(g, x) { mesaRedonda(g, x - 200, x - 50, -50, '#fff3e0'); }
    },
    banca: {
      mesa: [-205, -45, -46], npc: 105, vitrina: [-110, -150],
      atras(g, x, t) {
        arbol(g, x + 210, 0, Gen.makeRand('banca'), t);
        Obj.draw(g, 'bench2', x + 120, 0, t);
        flores(g, x - 270, x - 170, 0, t);
      },
      frente() { }
    },
    clinica: {
      mesa: [-205, -40, -58], npc: 95, vitrina: [-110, 0],
      atras(g, x) {
        rect(g, x - 280, -270, 520, 270, '#eceff1'); rect(g, x - 286, -280, 532, 14, '#90a4ae');
        rr(g, x + 120, -260, 70, 40, 6, '#ffffff'); rect(g, x + 149, -254, 12, 28, '#e53935'); rect(g, x + 141, -246, 28, 12, '#e53935');
        letrero(g, x - 60, -250, 150, 30, 'CLINIC', '#e53935', '#ffffff');
        puerta(g, x + 170, 60, 110, '#80cbc4'); ventana(g, x + 60, -190, 60, 56);
      },
      frente(g, x, t, ch, enTarea) {
        if (enTarea !== 'cuerpo') {
          rr(g, x - 210, -62, 175, 8, 3, '#b0bec5'); rect(g, x - 204, -54, 4, 46, '#90a4ae'); rect(g, x - 46, -54, 4, 46, '#90a4ae');
          rect(g, x - 204, -24, 162, 4, '#b0bec5'); circle(g, x - 200, -4, 4, '#455a64'); circle(g, x - 44, -4, 4, '#455a64');
        }
      }
    },
    atril: {
      mesa: [-205, -15, -40], npc: 90,
      atras(g, x, t) {
        Obj.draw(g, 'easel', x + 190, 0, t);
        const cs = ['#e53935', '#fdd835', '#1e88e5', '#43a047', '#8e24aa'];
        cs.forEach((c, i) => { circle(g, x - 240 + i * 22, -6 - (i % 2) * 6, 8, c); });
        // salpicaduras en el suelo
        cs.forEach((c, i) => ell(g, x - 140 + i * 50, 4, 14, 4, Gen.rgba(c, 0.5)));
      },
      frente(g, x) {
        rr(g, x - 215, -44, 210, 8, 3, '#a1887f'); rect(g, x - 205, -36, 6, 36, '#795548'); rect(g, x - 22, -36, 6, 36, '#795548');
      }
    },
    mudanza: {
      mesa: [-205, -25, -40], npc: 105, mesaPrep: { mesa: [-200, -90, -60], caja: [-40, 20, -44] },
      atras(g, x, t) {
        casita(g, x + 10, x + 260, 200, '#bbdefb', '#1565c0');
        ventana(g, x + 70, -150, 56, 52); puerta(g, x + 200, 54, 104, '#455a64');
        Obj.draw(g, 'truck', x + 380, 0, t);
        [[x + 150, 0], [x + 150, -40], [x + 240, 0]].forEach(([bx, by]) => { rect(g, bx - 22, by - 38, 44, 38, '#c8a27a'); line(g, [[bx - 22, by - 26], [bx + 22, by - 26]], '#a67c52', 2); });
      },
      frente(g, x, t, ch, enTarea) {
        if (enTarea !== 'pon') { rr(g, x - 215, -44, 200, 8, 3, '#c8a27a'); rect(g, x - 205, -36, 30, 36, '#b08a60'); rect(g, x - 55, -36, 30, 36, '#b08a60'); }
      }
    },
    parada: {
      mesa: [-210, -10, -74], npc: 100,
      atras(g, x, t) {
        Obj.draw(g, 'bus', x + 330, 0, t);
        rect(g, x + 170, -200, 6, 200, '#607d8b'); rr(g, x + 150, -232, 46, 40, 6, '#1e88e5'); text(g, 'BUS', x + 173, -212, 14, '#fff');
        rr(g, x - 240, -150, 250, 6, 3, '#455a64'); rect(g, x - 236, -144, 6, 144, '#455a64'); rect(g, x + 4, -144, 6, 144, '#455a64');
        g.globalAlpha = 0.35; rect(g, x - 230, -144, 234, 100, '#b3e5fc'); g.globalAlpha = 1;
      },
      frente(g, x) { rr(g, x - 225, -78, 230, 8, 3, '#78909c'); }
    },
    granja: {
      mesa: [-215, 35, 0], npc: 110, suelo: true,
      atras(g, x, t) {
        // granero
        const bx = x + 200;
        rect(g, bx - 70, -150, 140, 150, '#c0392b'); poly(g, [[bx - 82, -150], [bx, -215], [bx + 82, -150]], '#8e2a20');
        rect(g, bx - 30, -90, 60, 90, '#8e2a20'); line(g, [[bx - 30, -90], [bx + 30, 0]], '#fafafa', 4); line(g, [[bx + 30, -90], [bx - 30, 0]], '#fafafa', 4);
        rect(g, x - 280, -50, 380, 6, '#a1887f'); rect(g, x - 280, -30, 380, 6, '#a1887f');
        for (let px = x - 276; px < x + 100; px += 40) rect(g, px, -60, 8, 60, '#8d6e63');
        ell(g, x - 80, 4, 170, 10, 'rgba(124,179,66,.45)');
      },
      frente() { }
    },
    jardin: {
      mesa: [-205, -25, -40], npc: 100, vitrina: [-110, -230],
      atras(g, x, t) {
        const R = Gen.makeRand('jardin');
        arbol(g, x + 210, 0, R, t); arbol(g, x - 260, 0, R, t);
        flores(g, x + 30, x + 180, -2, t);
        rr(g, x + 20, -10, 170, 10, 4, '#6d4c41');
      },
      frente(g, x) { rr(g, x - 215, -44, 200, 8, 3, '#8d6e63'); rect(g, x - 205, -36, 6, 36, '#6d4c41'); rect(g, x - 35, -36, 6, 36, '#6d4c41'); }
    },
    relojeria: {
      mesa: [-205, 10, -64], npc: 105, vitrina: [-100, -170],
      atras(g, x, t) {
        rect(g, x - 240, -280, 470, 280, '#d7ccc8'); rect(g, x - 246, -290, 482, 14, '#5d4037');
        letrero(g, x + 150, -250, 120, 30, 'CLOCKS', '#5d4037', '#ffe0b2');
        // relojes de pared que hacen tic tac
        [[x + 110, -190, 18], [x + 180, -180, 14], [x + 145, -140, 12]].forEach(([cx, cy, r], i) => reloj(g, cx, cy, r, (t * 0.2 + i * 3) % 12, (t * 6 + i * 17) % 60));
      },
      frente(g, x) { mostrador(g, x - 215, x + 25, -64, '#8d6e63'); }
    },
    escuela: {
      mesa: [-205, -15, -56], npc: 100, vitrina: [-100, -175],
      atras(g, x) {
        rect(g, x - 260, -290, 500, 290, '#fff3e0'); rect(g, x - 266, -298, 512, 12, '#e65100');
        letrero(g, x + 150, -260, 120, 28, 'SCHOOL', '#e65100', '#fff');
        ventana(g, x + 150, -200, 64, 60);
      },
      frente(g, x) { rr(g, x - 215, -60, 210, 10, 3, '#a1887f'); rect(g, x - 205, -50, 8, 50, '#6d4c41'); rect(g, x - 25, -50, 8, 50, '#6d4c41'); }
    },
    cancha: {
      mesa: [-210, -20, -30], npc: 100,
      atras(g, x) {
        rect(g, x - 300, -4, 560, 8, '#7cb342');
        const gx = x + 210; rect(g, gx - 4, -110, 6, 110, '#fafafa'); rect(g, gx + 80, -110, 6, 110, '#fafafa'); rect(g, gx - 4, -114, 90, 6, '#fafafa');
        for (let i = 0; i < 6; i++) line(g, [[gx + i * 14, -108], [gx + i * 14, 0]], 'rgba(255,255,255,.5)', 1);
        for (let i = 0; i < 3; i++) poly(g, [[x - 60 + i * 40, 0], [x - 50 + i * 40, -22], [x - 40 + i * 40, 0]], '#ff7043');
      },
      frente(g, x) { rr(g, x - 220, -34, 210, 8, 3, '#90a4ae'); rect(g, x - 212, -26, 6, 26, '#607d8b'); rect(g, x - 24, -26, 6, 26, '#607d8b'); }
    },
    escenario: {
      mesa: [-205, -15, -30], npc: 90, npcY: -30, vitrina: [-110, -30],
      atras(g, x, t, ch) {
        const c = ch.telon || '#c62828';
        rect(g, x - 270, -300, 480, 270, '#3e2723');
        for (let i = 0; i < 4; i++) { const sw = Math.sin(t + i) * 3; poly(g, [[x - 270 + i * 22, -300], [x - 248 + i * 22, -300], [x - 250 + i * 18 + sw, -30], [x - 270 + i * 18 + sw, -30]], i % 2 ? sh(c, -0.15) : c); }
        for (let i = 0; i < 4; i++) { const sw = Math.sin(t + i) * 3; poly(g, [[x + 210 - i * 22, -300], [x + 188 - i * 22, -300], [x + 190 - i * 18 + sw, -30], [x + 210 - i * 18 + sw, -30]], i % 2 ? sh(c, -0.15) : c); }
        for (let i = 0; i < 12; i++) { g.fillStyle = i % 2 ? c : sh(c, -0.2); g.beginPath(); g.arc(x - 260 + i * 40 + 20, -300, 20, 0, Math.PI); g.fill(); }
        rect(g, x - 280, -30, 500, 30, '#8d6e63'); rect(g, x - 280, -34, 500, 6, '#a1887f');
        for (let i = 0; i < 5; i++) { circle(g, x - 230 + i * 100, -300, 6, '#ffd54f'); }
      },
      frente() { }
    }
  };

  /* ======================================================================
     RELOJ ANALÓGICO (para el relojero)
  ====================================================================== */
  function reloj(g, x, y, r, horas, minutos, grande) {
    circle(g, x, y, r + (grande ? 6 : 2), '#5d4037'); circle(g, x, y, r, '#fffdf5');
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * TAU;
      if (grande) text(g, String(i || 12), x + Math.sin(a) * r * 0.78, y - Math.cos(a) * r * 0.78, r * 0.2, '#3e2723');
      else rect(g, x + Math.sin(a) * r * 0.8 - 0.75, y - Math.cos(a) * r * 0.8 - 0.75, 1.5, 1.5, '#5d4037');
    }
    const am = minutos / 60 * TAU, ah = (horas % 12 + minutos / 60) / 12 * TAU;
    line(g, [[x, y], [x + Math.sin(ah) * r * 0.5, y - Math.cos(ah) * r * 0.5]], '#3e2723', grande ? 6 : 2);
    line(g, [[x, y], [x + Math.sin(am) * r * 0.78, y - Math.cos(am) * r * 0.78]], '#3e2723', grande ? 4 : 1.4);
    circle(g, x, y, grande ? 5 : 1.5, '#e53935');
  }

  /* ======================================================================
     PIZARRA (profesor): dibuja un texto grande
  ====================================================================== */
  function pizarra(g, x, y, txt, t) {
    rr(g, x - 130, y - 80, 260, 160, 6, '#8d6e63'); rect(g, x - 122, y - 72, 244, 144, '#2e5e4e');
    if (txt) text(g, txt, x, y, txt.length > 6 ? 40 : 64, '#fafafa', '700');
    rect(g, x - 40, y + 74, 30, 6, '#fafafa');
    void t;
  }

  /* ======================================================================
     PIP: la mascota mágica de la maga
     st = { s, sx, sy, alto, cara, tinte, extras: Set, sacudir, rebote, mover }
  ====================================================================== */
  const PIP_BASE = { s: 1, sx: 1, sy: 1, alto: 0, cara: 'normal', tinte: '#7e57c2', extras: [], sacudir: 0, rebote: 0, mover: 0, redondo: false };
  const MAGIA = {
    big: { s: 1.6 }, large: { s: 1.75 }, small: { s: 0.55 }, little: { s: 0.48, cara: 'cute' }, tall: { sy: 1.75 }, short: { sy: 0.55 },
    long: { sx: 2.3, extras: ['largo'] }, thin: { sx: 0.55 }, fat: { sx: 1.6, sy: 0.92 }, round: { redondo: true, extras: ['brillo'] },
    high: { alto: 120, extras: ['globo'] }, low: { sy: 0.75, alto: -6 },
    happy: { cara: 'feliz' }, sad: { cara: 'triste', extras: ['lagrima'] }, angry: { cara: 'bravo', tinte: '#e53935', extras: ['vapor'] },
    afraid: { cara: 'miedo', sacudir: 1, tinte: '#b39ddb' }, surprised: { cara: 'sorpresa', extras: ['exclama'] }, bored: { cara: 'aburrido', extras: ['puntos'] },
    excited: { cara: 'emocion', rebote: 1, extras: ['estrellas'] }, worried: { cara: 'preocupado', extras: ['sudor'] }, sleepy: { cara: 'dormido', extras: ['zzz'] },
    funny: { cara: 'chistoso', extras: ['risa'] }, cute: { cara: 'cute', extras: ['corazones'] }, beautiful: { cara: 'feliz', extras: ['flor', 'brillo'] },
    pretty: { cara: 'cute', extras: ['lazo'] }, ugly: { cara: 'chistoso', tinte: '#8bc34a', extras: ['verrugas'] }, clean: { extras: ['brillo', 'burbujas'], tinte: '#9575cd' },
    dirty: { extras: ['lodo'], tinte: '#8d6e63' }, fast: { mover: 3, extras: ['velocidad'] }, quick: { mover: 3, extras: ['velocidad'] }, slow: { mover: 0.4, extras: ['caracol'], cara: 'dormido' },
    heavy: { sy: 0.8, sx: 1.15, extras: ['pesa'] }, old: { tinte: '#9e9e9e', extras: ['baston', 'arrugas'] }, new: { extras: ['brillo', 'etiqueta'], tinte: '#7c4dff' },
    young: { s: 0.6, extras: ['chupo'], cara: 'cute' }, loud: { cara: 'grito', extras: ['ondas'] }, quiet: { cara: 'silencio', extras: ['shh'] },
    bright: { tinte: '#ffd54f', extras: ['luz'] }, strong: { extras: ['musculos'], cara: 'feliz' }, weak: { sy: 0.85, cara: 'triste', extras: ['sudor'] },
    hot: { tinte: '#ff7043', extras: ['vapor', 'sol'] }, cold: { tinte: '#81d4fa', extras: ['nieve'], sacudir: 0.5 }, wet: { extras: ['gotas', 'nube'] }
  };
  function pipEstado(adj) { return Object.assign({}, PIP_BASE, MAGIA[adj] || {}); }
  function lerp(a, b, k) { return a + (b - a) * k; }
  // Acerca el estado actual al objetivo (animación suave)
  function pipAcercar(cur, obj, dt) {
    const k = Math.min(1, dt * 6);
    ['s', 'sx', 'sy', 'alto', 'sacudir', 'rebote', 'mover'].forEach(p => { cur[p] = lerp(cur[p], obj[p], k); });
    cur.tinte = Gen.mix(cur.tinte, obj.tinte, k);
    cur.cara = obj.cara; cur.extras = obj.extras; cur.redondo = obj.redondo;
  }
  function pip(g, x, y, t, st) {
    const bob = Math.sin(t * 3) * 2 + (st.rebote > 0.1 ? -Math.abs(Math.sin(t * 9)) * 26 * st.rebote : 0);
    const shake = st.sacudir > 0.05 ? Math.sin(t * 50) * 3 * st.sacudir : 0;
    const mv = st.mover > 1.2 ? Math.sin(t * 9) * 50 : st.mover < 0.7 && st.mover > 0.05 ? Math.sin(t * 0.8) * 10 : 0;
    const ex = new Set(st.extras);
    const cx = x + shake + mv, base = y - st.alto + bob;
    const R = 34 * st.s, rx = R * st.sx * (st.redondo ? 1 : 1.05), ry = R * st.sy * (st.redondo ? 1 : 0.92);
    const cy = base - ry;
    ell(g, x + mv, y + 2, Math.max(10, rx * 0.9), 6, 'rgba(0,0,0,.18)');
    if (ex.has('globo')) { line(g, [[cx, cy - ry], [cx, cy - ry - 40]], '#9e9e9e', 1.5); ell(g, cx, cy - ry - 58, 16, 20, '#ef5350'); }
    if (ex.has('velocidad')) for (let i = 0; i < 3; i++) line(g, [[cx - rx - 16 - i * 4, cy - 10 + i * 10], [cx - rx - 46 - i * 6, cy - 10 + i * 10]], 'rgba(0,0,0,.35)', 3);
    if (ex.has('luz')) { g.globalAlpha = 0.35 + Math.sin(t * 5) * 0.1; circle(g, cx, cy, rx * 1.7, '#fff59d'); g.globalAlpha = 1; }
    if (ex.has('nube')) { ell(g, cx, cy - ry - 34, 40, 16, '#90a4ae'); for (let i = 0; i < 4; i++) { const p = (t * 1.5 + i / 4) % 1; ell(g, cx - 24 + i * 16, cy - ry - 18 + p * (ry + 20), 2, 4, '#4fc3f7'); } }
    if (ex.has('sol')) { circle(g, cx + rx + 30, cy - ry - 30, 18, '#ffb300'); }
    // patas
    ell(g, cx - rx * 0.45, base - 2, 9 * st.s, 6 * st.s, sh(st.tinte, -0.25)); ell(g, cx + rx * 0.45, base - 2, 9 * st.s, 6 * st.s, sh(st.tinte, -0.25));
    // cuerpo
    g.fillStyle = st.tinte; g.beginPath();
    if (st.redondo) g.arc(cx, cy, Math.max(rx, ry), 0, TAU);
    else { g.moveTo(cx - rx, cy + ry * 0.2); g.bezierCurveTo(cx - rx, cy - ry * 1.15, cx + rx, cy - ry * 1.15, cx + rx, cy + ry * 0.2); g.bezierCurveTo(cx + rx, cy + ry, cx - rx, cy + ry, cx - rx, cy + ry * 0.2); }
    g.fill();
    ell(g, cx, cy + ry * 0.35, rx * 0.55, ry * 0.4, sh(st.tinte, 0.3));
    // orejitas
    poly(g, [[cx - rx * 0.6, cy - ry * 0.75], [cx - rx * 0.75, cy - ry * 1.3], [cx - rx * 0.25, cy - ry * 0.95]], st.tinte);
    poly(g, [[cx + rx * 0.6, cy - ry * 0.75], [cx + rx * 0.75, cy - ry * 1.3], [cx + rx * 0.25, cy - ry * 0.95]], st.tinte);
    if (ex.has('largo')) { for (let i = 0; i < 3; i++) ell(g, cx - rx * 0.5 + i * rx * 0.5, cy + ry * 0.1, 3, 2, sh(st.tinte, -0.15)); }
    if (ex.has('lodo')) [[-0.5, 0.1, 9], [0.4, -0.3, 7], [0.1, 0.5, 11], [-0.2, -0.5, 6]].forEach(([dx, dy, r]) => ell(g, cx + dx * rx, cy + dy * ry, r * st.s, r * 0.7 * st.s, '#5d4037'));
    if (ex.has('verrugas')) [[-0.4, -0.2], [0.5, 0.2], [0.2, -0.6]].forEach(([dx, dy]) => circle(g, cx + dx * rx, cy + dy * ry, 4 * st.s, '#558b2f'));
    if (ex.has('arrugas')) for (let i = 0; i < 3; i++) curve(g, cx - 14 * st.s, cy - ry * 0.55 + i * 5, cx, cy - ry * 0.6 + i * 5, cx + 14 * st.s, cy - ry * 0.55 + i * 5, sh(st.tinte, -0.3), 1.5);
    if (ex.has('musculos')) { [-1, 1].forEach(d => { ell(g, cx + d * (rx + 10), cy, 12, 9, st.tinte); circle(g, cx + d * (rx + 16), cy - 8, 8, sh(st.tinte, 0.1)); }); }
    // cara
    cara(g, cx, cy - ry * 0.15, Math.max(0.5, Math.min(st.s * Math.min(st.sx, st.sy) ** 0.3, 1.8)), st.cara, t);
    // extras alrededor
    if (ex.has('lagrima')) { const p = (t * 1.2) % 1; ell(g, cx - 10 * st.s, cy - ry * 0.05 + p * 20, 2.5, 4, '#4fc3f7'); }
    if (ex.has('vapor')) for (let k = 0; k < 2; k++) { const p = (t * 0.8 + k * 0.5) % 1; g.globalAlpha = 1 - p; circle(g, cx + (k ? 14 : -14), cy - ry - 8 - p * 20, 5 + p * 5, '#eceff1'); g.globalAlpha = 1; }
    if (ex.has('exclama')) text(g, '!', cx + rx + 10, cy - ry, 26, '#e53935');
    if (ex.has('puntos')) text(g, '...', cx + rx + 18, cy - ry, 20, '#455a64');
    if (ex.has('estrellas') || ex.has('brillo')) for (let k = 0; k < 4; k++) { const a = t * 2 + k * TAU / 4; text(g, '✦', cx + Math.cos(a) * (rx + 18), cy + Math.sin(a) * (ry + 14), 14, '#ffd600'); }
    if (ex.has('sudor')) { const p = (t * 0.9) % 1; ell(g, cx + rx * 0.7, cy - ry * 0.5 + p * 12, 3, 5, '#81d4fa'); }
    if (ex.has('zzz')) { const p = (t * 0.6) % 1; g.globalAlpha = 1 - p; text(g, 'Z', cx + rx + 8 + p * 10, cy - ry - p * 24, 14 + p * 8, '#5c6bc0'); g.globalAlpha = 1; }
    if (ex.has('risa')) { const p = (t * 0.8) % 1; g.globalAlpha = 1 - p; text(g, 'HA HA', cx, cy - ry - 18 - p * 16, 14, '#ef6c00'); g.globalAlpha = 1; }
    if (ex.has('corazones')) for (let k = 0; k < 2; k++) { const p = (t * 0.7 + k * 0.5) % 1; g.globalAlpha = 1 - p; text(g, '♥', cx + (k ? 22 : -22), cy - ry - p * 26, 16, '#e91e63'); g.globalAlpha = 1; }
    if (ex.has('flor')) { circle(g, cx + rx * 0.55, cy - ry * 0.85, 8, '#f06292'); circle(g, cx + rx * 0.55, cy - ry * 0.85, 3, '#fff59d'); }
    if (ex.has('lazo')) { poly(g, [[cx, cy - ry * 0.95], [cx - 14, cy - ry * 1.1], [cx - 14, cy - ry * 0.8]], '#ec407a'); poly(g, [[cx, cy - ry * 0.95], [cx + 14, cy - ry * 1.1], [cx + 14, cy - ry * 0.8]], '#ec407a'); circle(g, cx, cy - ry * 0.95, 3.5, '#ad1457'); }
    if (ex.has('burbujas')) for (let k = 0; k < 4; k++) { const p = (t * 0.5 + k / 4) % 1; ring(g, cx - rx + k * rx * 0.6, cy - p * 40, 4 + k, 'rgba(129,212,250,.9)', 1.5); }
    if (ex.has('caracol')) { ell(g, cx + rx + 26, base - 6, 12, 5, '#a1887f'); circle(g, cx + rx + 24, base - 14, 9, '#ff8a65'); ring(g, cx + rx + 24, base - 14, 5, '#d84315', 1.5); }
    if (ex.has('pesa')) { rect(g, cx - 30, cy - ry - 30, 60, 6, '#455a64'); rr(g, cx - 40, cy - ry - 40, 14, 26, 3, '#263238'); rr(g, cx + 26, cy - ry - 40, 14, 26, 3, '#263238'); text(g, '100 kg', cx, cy - ry - 46, 10, '#263238'); }
    if (ex.has('baston')) { line(g, [[cx + rx + 6, base], [cx + rx + 6, cy - 10]], '#6d4c41', 3); curve(g, cx + rx + 6, cy - 10, cx + rx + 6, cy - 22, cx + rx + 16, cy - 18, '#6d4c41', 3); }
    if (ex.has('etiqueta')) { rr(g, cx + rx - 4, cy - ry * 0.4, 30, 14, 3, '#fff'); text(g, 'NEW', cx + rx + 11, cy - ry * 0.4 + 7, 8, '#e53935'); }
    if (ex.has('chupo')) { circle(g, cx, cy + ry * 0.12, 6, '#4fc3f7'); ring(g, cx, cy + ry * 0.12 + 7, 4, '#4fc3f7', 2); }
    if (ex.has('ondas')) for (let k = 0; k < 3; k++) { const p = (t * 1.5 + k / 3) % 1; g.globalAlpha = 1 - p; g.strokeStyle = '#ff7043'; g.lineWidth = 3; g.beginPath(); g.arc(cx + rx * 0.4, cy, rx * 0.5 + p * 50, -0.6, 0.6); g.stroke(); g.globalAlpha = 1; }
    if (ex.has('shh')) text(g, 'shh...', cx + rx + 22, cy - ry, 14, '#78909c');
    if (ex.has('nieve')) for (let k = 0; k < 6; k++) { const p = (t * 0.4 + k / 6) % 1; text(g, '❄', cx - rx - 10 + k * (rx * 2 + 20) / 6, cy - ry - 30 + p * (ry * 2 + 40), 11, '#e1f5fe'); }
    if (ex.has('gotas')) for (let k = 0; k < 3; k++) { const p = (t + k / 3) % 1; ell(g, cx - rx * 0.6 + k * rx * 0.6, cy + ry * 0.4 + p * 14, 2, 3.5, '#29b6f6'); }
  }
  function cara(g, x, y, s, tipo, t) {
    const ojo = (dx, forma) => {
      const ox = x + dx * s;
      if (forma === 'cerrado') { curve(g, ox - 5 * s, y, ox, y + 3 * s, ox + 5 * s, y, '#1a1a1a', 2.2); return; }
      if (forma === 'feliz') { curve(g, ox - 5 * s, y + 2 * s, ox, y - 4 * s, ox + 5 * s, y + 2 * s, '#1a1a1a', 2.5); return; }
      const r = forma === 'grande' ? 7 : 5.5;
      circle(g, ox, y, r * s, '#fff'); circle(g, ox + 1 * s, y + 0.5 * s, (r - 2.5) * s, '#1a1a1a'); circle(g, ox + 2 * s, y - 1.5 * s, 1.2 * s, '#fff');
    };
    const parpadeo = (t % 4) < 0.12;
    const boca = (pts, c = '#4a148c', w = 2.5) => curve(g, x + pts[0] * s, y + pts[1] * s, x + pts[2] * s, y + pts[3] * s, x + pts[4] * s, y + pts[5] * s, c, w);
    switch (tipo) {
      case 'feliz': case 'emocion':
        ojo(-11, 'feliz'); ojo(11, 'feliz');
        g.fillStyle = '#4a148c'; g.beginPath(); g.moveTo(x - 9 * s, y + 10 * s); g.quadraticCurveTo(x, y + 24 * s, x + 9 * s, y + 10 * s); g.closePath(); g.fill();
        ell(g, x, y + 16 * s, 4 * s, 2.5 * s, '#f06292'); break;
      case 'triste': ojo(-11); ojo(11); boca([-8, 18, 0, 10, 8, 18]); line(g, [[x - 16 * s, y - 9 * s], [x - 6 * s, y - 12 * s]], '#1a1a1a', 2); line(g, [[x + 16 * s, y - 9 * s], [x + 6 * s, y - 12 * s]], '#1a1a1a', 2); break;
      case 'bravo': ojo(-11); ojo(11); line(g, [[x - 17 * s, y - 12 * s], [x - 5 * s, y - 6 * s]], '#1a1a1a', 3); line(g, [[x + 17 * s, y - 12 * s], [x + 5 * s, y - 6 * s]], '#1a1a1a', 3); boca([-8, 16, 0, 12, 8, 16]); break;
      case 'miedo': ojo(-11, 'grande'); ojo(11, 'grande'); for (let i = -2; i <= 2; i++) line(g, [[x + i * 4 * s, y + 14 * s + (i % 2) * 2 * s], [x + (i + 1) * 4 * s, y + 14 * s - (i % 2) * 2 * s]], '#4a148c', 2); break;
      case 'sorpresa': ojo(-11, 'grande'); ojo(11, 'grande'); ell(g, x, y + 15 * s, 5 * s, 7 * s, '#4a148c'); break;
      case 'aburrido': curve(g, x - 16 * s, y, x - 11 * s, y + 1, x - 6 * s, y, '#1a1a1a', 2.5); curve(g, x + 6 * s, y, x + 11 * s, y + 1, x + 16 * s, y, '#1a1a1a', 2.5); line(g, [[x - 7 * s, y + 14 * s], [x + 7 * s, y + 14 * s]], '#4a148c', 2.5); break;
      case 'preocupado': ojo(-11); ojo(11); line(g, [[x - 16 * s, y - 12 * s], [x - 6 * s, y - 9 * s]], '#1a1a1a', 2); line(g, [[x + 16 * s, y - 12 * s], [x + 6 * s, y - 9 * s]], '#1a1a1a', 2); boca([-8, 15, -3, 12, 2, 15]); boca([2, 15, 5, 18, 8, 15]); break;
      case 'dormido': ojo(-11, 'cerrado'); ojo(11, 'cerrado'); ell(g, x, y + 14 * s, 3 * s, 4 * s, '#4a148c'); break;
      case 'chistoso': ojo(-11, 'grande'); ojo(11); g.fillStyle = '#4a148c'; g.beginPath(); g.moveTo(x - 9 * s, y + 10 * s); g.quadraticCurveTo(x, y + 22 * s, x + 9 * s, y + 10 * s); g.closePath(); g.fill(); ell(g, x + 3 * s, y + 20 * s, 4 * s, 6 * s, '#f06292'); break;
      case 'cute': ojo(-11, 'grande'); ojo(11, 'grande'); boca([-5, 12, 0, 16, 5, 12]); ell(g, x - 18 * s, y + 8 * s, 5 * s, 3 * s, 'rgba(244,143,177,.8)'); ell(g, x + 18 * s, y + 8 * s, 5 * s, 3 * s, 'rgba(244,143,177,.8)'); break;
      case 'grito': ojo(-11, 'cerrado'); ojo(11, 'cerrado'); ell(g, x, y + 16 * s, 9 * s, 10 * s, '#4a148c'); ell(g, x, y + 21 * s, 5 * s, 3 * s, '#f06292'); break;
      case 'silencio': ojo(-11, 'cerrado'); ojo(11, 'cerrado'); line(g, [[x - 5 * s, y + 14 * s], [x + 5 * s, y + 14 * s]], '#4a148c', 2.5); line(g, [[x, y + 6 * s], [x, y + 22 * s]], '#ffcc80', 4); break;
      default:
        if (parpadeo) { ojo(-11, 'cerrado'); ojo(11, 'cerrado'); } else { ojo(-11); ojo(11); }
        boca([-7, 12, 0, 18, 7, 12]);
    }
  }

  /* ======================================================================
     COSAS QUE SE TOCAN O SE PASAN
  ====================================================================== */
  // Tarjeta con un emoji (palabras sin dibujo propio)
  function tarjeta(g, x, y, icono, t, color) {
    rr(g, x - 26, y - 56, 52, 52, 10, '#ffffff');
    rrPath(g, x - 26, y - 56, 52, 52, 10); g.strokeStyle = color || '#cfd8dc'; g.lineWidth = 3; g.stroke();
    emoji(g, icono, x, y - 29, 32);
    void t;
  }
  // Bote de pintura de un color
  function bote(g, x, y, c, brilla) {
    rr(g, x - 16, y - 40, 32, 40, 4, '#cfd8dc'); rect(g, x - 16, y - 30, 32, 22, c);
    ell(g, x, y - 40, 16, 5, '#b0bec5'); ell(g, x, y - 40, 13, 3.5, c);
    if (brilla) { g.globalAlpha = 0.6; for (let k = 0; k < 3; k++) rect(g, x - 10 + k * 8, y - 28, 2, 18, '#fff'); g.globalAlpha = 1; }
    curve(g, x - 16, y - 34, x, y - 58, x + 16, y - 34, '#78909c', 1.5);
  }
  function forma(g, x, y, tipo, c = '#5c6bc0') {
    if (tipo === 'circle') circle(g, x, y - 26, 22, c);
    else if (tipo === 'triangle') poly(g, [[x - 24, y - 4], [x + 24, y - 4], [x, y - 50]], c);
    else if (tipo === 'line') line(g, [[x - 26, y - 26], [x + 26, y - 26]], c, 6);
    else rr(g, x - 20, y - 46, 40, 40, 4, c);
  }
  // Tarjeta con un número en cifras
  function numero(g, x, y, n) {
    rr(g, x - 30, y - 56, 60, 52, 10, '#fffde7'); rrPath(g, x - 30, y - 56, 60, 52, 10); g.strokeStyle = '#f9a825'; g.lineWidth = 3; g.stroke();
    const s = String(n); text(g, s, x, y - 29, s.length > 4 ? 15 : s.length > 2 ? 20 : 28, '#e65100');
  }
  // Marco de foto (abuela): dentro dibuja lo que se le pase
  function marco(g, x, y, w, h, dentro) {
    rr(g, x - w / 2 - 6, y - h - 6, w + 12, h + 12, 6, '#8d6e63'); rect(g, x - w / 2, y - h, w, h, '#e3f2fd');
    g.save(); g.beginPath(); g.rect(x - w / 2, y - h, w, h); g.clip(); dentro(g); g.restore();
  }
  // Bolsa de papel (contar)
  function bolsa(g, x, y, n) {
    poly(g, [[x - 26, y], [x + 26, y], [x + 22, y - 54], [x - 22, y - 54]], '#d7b98e'); rect(g, x - 22, y - 58, 44, 6, '#c4a373');
    if (n) { circle(g, x + 20, y - 58, 13, '#e53935'); text(g, String(n), x + 20, y - 58, 13, '#fff'); }
  }
  // Caja abierta (preposiciones)
  function cajaAbierta(g, x0, x1, y, frente) {
    if (!frente) { rect(g, x0, y, x1 - x0, -y, '#a67c52'); poly(g, [[x0, y], [x0 - 14, y - 16], [x0 + 8, y - 16], [x0 + 18, y]], '#c8a27a'); }
    else { rect(g, x0, y + 18, x1 - x0, -y - 18, '#c8a27a'); line(g, [[x0, y + 30], [x1, y + 30]], '#a67c52', 2); }
  }

  /* ======================================================================
     CLIMA (jardinero): se dibuja encima de la escena, en coordenadas del mundo
  ====================================================================== */
  function clima(g, tipo, x, t) {
    const cx = x - 110;
    if (tipo === 'sunny' || tipo === 'sun' || tipo === 'hot' || tipo === 'warm' || tipo === 'dry') {
      const r = tipo === 'hot' ? 46 : 36; g.globalAlpha = 0.3; circle(g, cx, -250, r * 1.7, '#ffeb3b'); g.globalAlpha = 1; circle(g, cx, -250, r, '#ffc107');
      for (let k = 0; k < 10; k++) { const a = k / 10 * TAU + t * 0.3; line(g, [[cx + Math.cos(a) * (r + 8), -250 + Math.sin(a) * (r + 8)], [cx + Math.cos(a) * (r + 22), -250 + Math.sin(a) * (r + 22)]], '#ffc107', 4); }
      if (tipo === 'hot') for (let k = 0; k < 3; k++) { const p = (t + k / 3) % 1; curve(g, cx - 60 + k * 60, -30 - p * 60, cx - 50 + k * 60, -45 - p * 60, cx - 60 + k * 60, -60 - p * 60, 'rgba(255,112,67,.6)', 3); }
    }
    if (tipo === 'cloudy' || tipo === 'cloud' || tipo === 'cool') Obj.draw(g, 'cloud', cx + Math.sin(t * 0.5) * 20, -220, t, null, 1.2);
    if (tipo === 'rainy' || tipo === 'rain' || tipo === 'wet') {
      Obj.draw(g, 'rainCloud', cx, -200, t, null, 1.1);
      for (let k = 0; k < 24; k++) { const p = (t * 1.6 + k * 0.137) % 1; const rx = cx - 90 + (k * 37) % 180; line(g, [[rx, -200 + p * 200], [rx - 3, -188 + p * 200]], 'rgba(41,182,246,.8)', 2); }
    }
    if (tipo === 'storm') { Obj.draw(g, 'stormCloud', cx, -200, t, null, 1.1); if ((t % 2) < 0.15) { poly(g, [[cx, -170], [cx - 18, -110], [cx - 2, -110], [cx - 14, -50], [cx + 20, -130], [cx + 4, -130], [cx + 14, -170]], '#ffeb3b'); } }
    if (tipo === 'windy' || tipo === 'wind' || tipo === 'air') for (let k = 0; k < 5; k++) { const p = (t * 0.8 + k / 5) % 1; const wx = cx - 160 + p * 320; curve(g, wx, -200 + k * 30, wx + 30, -215 + k * 30, wx + 60, -200 + k * 30, 'rgba(255,255,255,.9)', 3); }
    if (tipo === 'snow' || tipo === 'cold' || tipo === 'ice') for (let k = 0; k < 26; k++) { const p = (t * 0.35 + k * 0.137) % 1; text(g, '❄', cx - 110 + (k * 41) % 220 + Math.sin(t + k) * 6, -260 + p * 260, 12, '#e3f2fd'); }
    if (tipo === 'rainbow') Obj.draw(g, 'rainbow', cx, -120, t, null, 0.8);
    if (tipo === 'moon') { circle(g, cx, -250, 34, '#fff9c4'); circle(g, cx + 14, -258, 30, 'rgba(40,53,147,.0)'); }
    if (tipo === 'star') for (let k = 0; k < 6; k++) text(g, '★', cx - 90 + k * 36, -250 + (k % 2) * 30, 18 + Math.sin(t * 3 + k) * 3, '#fff176');
    if (tipo === 'sunset') { g.globalAlpha = 0.5; circle(g, cx, -70, 60, '#ff7043'); g.globalAlpha = 1; }
  }

  return { ACC, accesorio, cielo, cieloColores, sol, nubes, lejos, edificios, calle, arbol, farola, ESC, reloj, pizarra, MAGIA, pipEstado, pipAcercar, pip, cara,
    tarjeta, bote, forma, numero, marco, bolsa, cajaAbierta, clima, letrero };
})();
