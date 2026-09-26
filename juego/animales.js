'use strict';

/* ============================================================================
   ANIMALES DE ENGLISH TOWN  ·  juego/animales.js
   Todos de perfil, mirando a la derecha (dir = -1 los voltea), con el
   origen en el suelo, bajo el centro del cuerpo. Escala: persona = 100.
============================================================================ */
const Animales = (() => {
  const { circle, ring, ell, rect, rr, poly, line, curve } = Obj;
  const TAU = Math.PI * 2;
  const sh = (c, a) => Gen.shade(c, a);

  /* ---------- Los del juego original (perro, gato, pato, granja) ---------- */
  function dog(g, x, y, color, t, mode, dir = 1) {
    const legs = mode === 'walk' ? Math.sin(t * 12) * 5 : 0;
    g.save(); g.translate(x, y); g.scale(dir, 1);
    g.fillStyle = color;
    if (mode === 'sleep') {
      ell(g, 0, -12, 26, 12, color); ell(g, 22, -10, 11, 9, color); ell(g, 20, -16, 5, 8, sh(color, -0.3), -0.4);
    } else {
      [[-18 + legs], [12 - legs], [-10 - legs], [4 + legs]].forEach(([dx]) => rect(g, dx, -16, 6, 16, color));
      ell(g, 0, -24, 24, 12, color); ell(g, 24, -36, 12, 10, color); rect(g, 28, -36, 12, 7, color);
      ell(g, 19, -41, 5, 9, sh(color, -0.3), -0.5);
      curve(g, -22, -28, -28, -34, -32, -40 + Math.sin(t * 14) * 5, color, 5);
      circle(g, 28, -39, 2, '#111'); circle(g, 40, -33, 2.5, '#111');
    }
    g.restore();
  }
  function cat(g, x, y, color, t) {
    ell(g, x, y - 10, 20, 10, color); circle(g, x + 16, y - 12, 9, color);
    poly(g, [[x + 10, y - 18], [x + 12, y - 28], [x + 17, y - 20]], color); poly(g, [[x + 18, y - 20], [x + 23, y - 28], [x + 24, y - 17]], color);
    g.strokeStyle = color; g.lineWidth = 5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x - 18, y - 8); g.quadraticCurveTo(x - 30, y - 2 + Math.sin(t) * 3, x - 22, y + 2); g.stroke();
    circle(g, x + 19, y - 13, 1.4, '#1b5e20');
  }
  function duck(g, x, y, t, dir = 1) {
    g.save(); g.translate(x, y + Math.sin(t * 2) * 1.5); g.scale(dir, 1);
    ell(g, 0, -8, 17, 9, '#f5f0e1'); circle(g, 13, -20, 8, '#2e7d4f');
    poly(g, [[19, -21], [28, -18], [19, -16]], '#f39c12'); circle(g, 15, -22, 1.6, '#111');
    g.restore();
  }
  function quad(g, x, y, t, dir, kind, moving) {
    const S = { cow: [58, 30, '#f5f5f5', '#222'], horse: [60, 30, '#8d5a3a', '#4a2e1c'], pig: [44, 22, '#f4a6b7', '#e07a93'], sheep: [44, 24, '#f2f0ea', '#333'] }[kind];
    const [bw, bh, c1, c2] = S;
    const lg = moving ? Math.sin(t * 10) * 5 : 0;
    const legH = kind === 'horse' ? 34 : kind === 'pig' ? 12 : 24;
    g.save(); g.translate(x, y); g.scale(dir, 1);
    g.fillStyle = kind === 'sheep' ? '#333' : sh(c1, -0.15);
    [-bw * 0.35 + lg, -bw * 0.2 - lg, bw * 0.2 + lg, bw * 0.35 - lg].forEach(dx => g.fillRect(dx - 4, -legH, 8, legH));
    if (kind === 'sheep') {
      for (let k = 0; k < 7; k++) circle(g, -bw * 0.35 + (k % 4) * bw * 0.23, -legH - bh * 0.5 - (k > 3 ? 8 : -2), bh * 0.5, c1);
    } else rr(g, -bw / 2, -legH - bh, bw, bh, bh * 0.45, c1);
    if (kind === 'cow') { ell(g, -8, -legH - bh * 0.6, 10, 7, c2, 0.3); ell(g, 14, -legH - bh * 0.35, 8, 6, c2); }
    const hx = bw / 2 + 4, hy = -legH - bh * (kind === 'horse' ? 1.25 : 0.75);
    if (kind === 'horse') { g.save(); g.translate(hx - 6, hy + 10); g.rotate(-0.6); rect(g, -7, -26, 16, 30, c1); g.restore(); rect(g, hx - 16, hy - 16, 8, 26, c2); }
    ell(g, hx + (kind === 'horse' ? 4 : 0), hy - (kind === 'horse' ? 12 : 0), kind === 'pig' ? 12 : 13, kind === 'pig' ? 11 : 10, kind === 'sheep' ? '#333' : c1, 0.2);
    if (kind === 'pig') ell(g, hx + 10, hy + 1, 5, 4, '#e07a93');
    if (kind === 'cow') ell(g, hx + 9, hy + 4, 6, 5, '#f4b6c2');
    circle(g, hx + 4 + (kind === 'horse' ? 4 : 0), hy - 3 - (kind === 'horse' ? 12 : 0), 2, '#111');
    curve(g, -bw / 2, -legH - bh * 0.7, -bw / 2 - 10, -legH - bh * 0.3 + Math.sin(t * 4) * 3, -bw / 2 - 6, -legH, kind === 'pig' ? '#e07a93' : c2, 3);
    g.restore();
  }
  function chicken(g, x, y, t) {
    const peck = Math.max(0, Math.sin(t * 3)) * 6;
    ell(g, x, y - 14, 13, 10, '#fff8e7'); circle(g, x + 11, y - 22 + peck, 6, '#fff8e7');
    circle(g, x + 11, y - 29 + peck, 3, '#e74c3c');
    poly(g, [[x + 16, y - 23 + peck], [x + 22, y - 21 + peck], [x + 16, y - 19 + peck]], '#f39c12');
    line(g, [[x - 3, y - 5], [x - 3, y]], '#f39c12', 2); line(g, [[x + 3, y - 5], [x + 3, y]], '#f39c12', 2);
  }

  /* ---------- Cuadrúpedo genérico (zoológico y granja) ---------- */
  function cuadrupedo(g, p, t, moving) {
    const lg = moving ? Math.sin(t * 9) * 5 : 0;
    const { bw, bh, legH, c1 } = p;
    const c2 = p.c2 || sh(c1, -0.25), lw = p.legW || 8;
    const top = -legH - bh;
    // cola
    if (p.tail) { const tl = p.tail; curve(g, -bw / 2 + 2, top + bh * 0.3, -bw / 2 - tl * 0.6, top + bh * 0.2 + Math.sin(t * 3) * 3, -bw / 2 - tl * 0.8, top + bh * 0.9, tl > 25 ? c1 : c2, p.tailW || 3); if (p.tuft) circle(g, -bw / 2 - tl * 0.8, top + bh * 0.95, 4, p.tuft); }
    // patas de atrás (más oscuras) y de adelante
    [[-bw * 0.32 - lg, c2], [bw * 0.28 + lg, c2], [-bw * 0.22 + lg, c1], [bw * 0.36 - lg, c1]].forEach(([dx, c]) => rr(g, dx - lw / 2, -legH - 4, lw, legH + 4, 2, c));
    rr(g, -bw / 2, top, bw, bh, bh * 0.45, c1);
    if (p.belly) ell(g, 0, top + bh * 0.8, bw * 0.35, bh * 0.25, p.belly);
    if (p.stripes) { g.save(); g.beginPath(); g.roundRect ? g.roundRect(-bw / 2, top, bw, bh, bh * 0.45) : g.rect(-bw / 2, top, bw, bh); g.clip(); for (let k = -3; k <= 3; k++) line(g, [[k * bw / 7 - 3, top], [k * bw / 7 + 3, top + bh]], p.stripes, 4); g.restore(); }
    if (p.spots) [[-0.25, 0.35], [0.1, 0.3], [-0.05, 0.65], [0.3, 0.6], [-0.35, 0.7]].forEach(([fx, fy]) => ell(g, fx * bw, top + fy * bh, bw * 0.07, bh * 0.14, p.spots));
    // cuello y cabeza
    const nk = p.neck || { len: 10, ang: -0.9, w: bh * 0.6 };
    const nx = bw / 2 - 6, ny = top + bh * 0.35;
    const hx = nx + Math.cos(nk.ang) * nk.len, hy = ny + Math.sin(nk.ang) * nk.len;
    line(g, [[nx, ny], [hx, hy]], c1, nk.w);
    if (p.spots && nk.len > 40) for (let k = 1; k < 5; k++) ell(g, nx + (hx - nx) * k / 5, ny + (hy - ny) * k / 5, 4, 3, p.spots);
    if (p.mane) { circle(g, hx - 2, hy, p.head.ry * 1.55, p.mane); }
    const H = p.head;
    ell(g, hx + H.rx * 0.3, hy, H.rx, H.ry, p.headC || c1, 0.1);
    if (p.snout) ell(g, hx + H.rx * 1.05, hy + H.ry * 0.3, p.snout[0], p.snout[1], p.snout[2]);
    // orejas
    if (p.ear === 'point') poly(g, [[hx - 3, hy - H.ry * 0.6], [hx + 1, hy - H.ry - 9], [hx + 5, hy - H.ry * 0.6]], p.earC || c2);
    else if (p.ear === 'round') circle(g, hx - 1, hy - H.ry * 0.8, H.ry * 0.38, p.earC || c2);
    else if (p.ear === 'long') ell(g, hx - 4, hy - H.ry * 0.2, 4, H.ry * 0.8, p.earC || c2, 0.8);
    if (p.horns) { curve(g, hx, hy - H.ry * 0.7, hx - 6, hy - H.ry - 12, hx - 12, hy - H.ry - 8, p.horns, 3); }
    if (p.antlers) { const a = p.antlers; line(g, [[hx, hy - H.ry * 0.7], [hx - 4, hy - H.ry - 20]], a, 3); line(g, [[hx - 2, hy - H.ry - 10], [hx + 6, hy - H.ry - 16]], a, 2.5); line(g, [[hx - 4, hy - H.ry - 18], [hx - 12, hy - H.ry - 24]], a, 2.5); line(g, [[hx + 3, hy - H.ry * 0.7], [hx + 8, hy - H.ry - 14]], a, 2.5); }
    if (p.ossicones) { line(g, [[hx - 2, hy - H.ry * 0.7], [hx - 3, hy - H.ry - 8]], c2, 3); circle(g, hx - 3, hy - H.ry - 9, 2.5, '#5d4037'); line(g, [[hx + 3, hy - H.ry * 0.7], [hx + 3, hy - H.ry - 8]], c2, 3); circle(g, hx + 3, hy - H.ry - 9, 2.5, '#5d4037'); }
    if (p.beard) poly(g, [[hx + H.rx * 0.8, hy + H.ry * 0.6], [hx + H.rx * 1.1, hy + H.ry * 0.6], [hx + H.rx * 0.9, hy + H.ry * 1.5]], p.beard);
    circle(g, hx + H.rx * 0.55, hy - H.ry * 0.25, 2, '#111');
    if (p.nose) circle(g, hx + H.rx * 1.25, hy + H.ry * 0.15, 2.5, p.nose);
    if (p.stripesHead) line(g, [[hx - 2, hy - H.ry * 0.8], [hx + 2, hy - H.ry * 0.2]], p.stripesHead, 2.5);
  }
  const ESPECIES = {
    goat: { bw: 42, bh: 20, legH: 20, c1: '#e9e4d8', c2: '#cfc7b4', head: { rx: 9, ry: 7 }, neck: { len: 14, ang: -1.1, w: 9 }, ear: 'long', earC: '#cfc7b4', horns: '#8d8d8d', beard: '#cfc7b4', tail: 6 },
    deer: { bw: 50, bh: 20, legH: 34, legW: 6, c1: '#a0673c', c2: '#7d4f2b', belly: '#e8cfa9', head: { rx: 9, ry: 7 }, neck: { len: 22, ang: -1.15, w: 9 }, ear: 'point', antlers: '#6d4c41', tail: 6, nose: '#2b1d10' },
    wolf: { bw: 52, bh: 20, legH: 24, c1: '#8e949b', c2: '#6c7278', belly: '#cfd3d6', head: { rx: 12, ry: 8 }, neck: { len: 8, ang: -0.6, w: 13 }, ear: 'point', snout: [7, 4, '#8e949b'], nose: '#1c1c1c', tail: 26, tailW: 7 },
    fox: { bw: 42, bh: 16, legH: 18, legW: 6, c1: '#e07b39', c2: '#b85f25', belly: '#fff3e0', head: { rx: 10, ry: 7 }, neck: { len: 6, ang: -0.6, w: 11 }, ear: 'point', earC: '#3e2723', snout: [7, 3, '#e07b39'], nose: '#1c1c1c', tail: 30, tailW: 9, tuft: '#fff' },
    lion: { bw: 58, bh: 26, legH: 26, legW: 10, c1: '#e0a94f', c2: '#c68b35', head: { rx: 12, ry: 11 }, neck: { len: 6, ang: -0.7, w: 16 }, mane: '#9c5a1f', ear: 'round', snout: [6, 5, '#f0c984'], nose: '#5d4037', tail: 28, tuft: '#9c5a1f' },
    tiger: { bw: 60, bh: 24, legH: 24, legW: 10, c1: '#f08a24', c2: '#d9731a', belly: '#fff3e0', head: { rx: 12, ry: 10 }, neck: { len: 6, ang: -0.6, w: 15 }, ear: 'round', earC: '#212121', snout: [6, 5, '#fff3e0'], nose: '#5d4037', stripes: '#212121', stripesHead: '#212121', tail: 28, tuft: '#212121' },
    bear: { bw: 64, bh: 34, legH: 20, legW: 13, c1: '#6d4c41', c2: '#5d4037', head: { rx: 14, ry: 12 }, neck: { len: 6, ang: -0.5, w: 20 }, ear: 'round', snout: [7, 6, '#a1887f'], nose: '#212121', tail: 4 },
    giraffe: { bw: 56, bh: 26, legH: 54, legW: 7, c1: '#f2c14e', c2: '#d9a72f', head: { rx: 11, ry: 7 }, neck: { len: 78, ang: -1.25, w: 11 }, ear: 'point', ossicones: true, spots: '#b5651d', tail: 22, tuft: '#5d4037', snout: [5, 4, '#e8b64a'] }
  };
  function especie(g, x, y, t, tipo, dir = 1, moving = false) {
    g.save(); g.translate(x, y); g.scale(dir, 1); cuadrupedo(g, ESPECIES[tipo], t, moving); g.restore();
  }
  const ALTO = { goat: 56, deer: 84, wolf: 60, fox: 46, lion: 76, tiger: 72, bear: 82, giraffe: 190 };

  function elephant(g, x, y, t, dir = 1) {
    g.save(); g.translate(x, y); g.scale(dir, 1);
    const c = '#9aa0a6', c2 = '#80868b';
    [[-26, c2], [18, c2], [-14, c], [28, c]].forEach(([dx, cc]) => rr(g, dx - 7, -34, 14, 34, 3, cc));
    ell(g, 0, -52, 42, 28, c);
    curve(g, -40, -58, -52, -40, -50, -30, c2, 4);
    ell(g, 38, -64, 20, 20, c);
    ell(g, 26, -60, 14, 20, c2, 0.2);
    const sw = Math.sin(t * 1.5) * 4;
    g.strokeStyle = c; g.lineWidth = 11; g.lineCap = 'round'; g.beginPath(); g.moveTo(54, -58); g.quadraticCurveTo(66 + sw, -40, 58 + sw, -20); g.stroke();
    poly(g, [[48, -50], [60, -46], [50, -44]], '#fffdf5');
    circle(g, 44, -70, 2.5, '#111');
    g.restore();
  }
  function monkey(g, x, y, t, dir = 1) {
    g.save(); g.translate(x, y); g.scale(dir, 1);
    const c = '#8d6e63';
    g.strokeStyle = c; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(-10, -12); g.bezierCurveTo(-34, -10, -30, -44 + Math.sin(t * 2) * 4, -18, -42); g.stroke();
    ell(g, 0, -20, 12, 16, c); ell(g, 0, -17, 7, 10, '#d7ccc8');
    ell(g, -8, -4, 7, 4, c); ell(g, 8, -4, 7, 4, c);
    line(g, [[9, -28], [18, -44 - Math.abs(Math.sin(t * 2)) * 4]], c, 5);
    circle(g, 2, -42, 11, c); circle(g, -9, -42, 4, '#d7ccc8'); circle(g, 13, -42, 4, '#d7ccc8');
    ell(g, 4, -39, 7, 6, '#d7ccc8'); circle(g, 1, -43, 1.6, '#111'); circle(g, 7, -43, 1.6, '#111'); curve(g, 1, -37, 4, -35, 7, -37, '#5d4037', 1.2);
    g.restore();
  }
  function rabbit(g, x, y, t, color = '#f5f5f5') {
    const hop = Math.max(0, Math.sin(t * 3)) * 3;
    ell(g, x, y - 10 - hop, 14, 10, color); circle(g, x - 13, y - 12 - hop, 4, '#fff');
    circle(g, x + 11, y - 20 - hop, 8, color);
    ell(g, x + 8, y - 34 - hop, 3, 10, color, -0.2); ell(g, x + 14, y - 33 - hop, 3, 10, color, 0.2); ell(g, x + 14, y - 33 - hop, 1.5, 7, '#f8bbd0', 0.2);
    circle(g, x + 15, y - 21 - hop, 1.6, '#e91e63'); circle(g, x + 18, y - 18 - hop, 1.4, '#f48fb1');
  }
  function mouse(g, x, y, t) {
    curve(g, x - 10, y - 5, x - 20, y - 2, x - 24, y - 8 + Math.sin(t * 5) * 2, '#f48fb1', 1.5);
    ell(g, x, y - 6, 11, 6, '#9e9e9e'); ell(g, x + 10, y - 7, 6, 4.5, '#9e9e9e'); circle(g, x + 7, y - 12, 3.5, '#bdbdbd'); circle(g, x + 7, y - 12, 2, '#f8bbd0');
    circle(g, x + 12, y - 8, 1.2, '#111'); circle(g, x + 16, y - 6, 1.2, '#e91e63');
  }
  function snake(g, x, y, t) {
    ell(g, x, y - 6, 22, 7, '#43a047'); ell(g, x, y - 13, 16, 6, '#66bb6a'); ell(g, x, y - 19, 10, 5, '#43a047');
    const s = Math.sin(t * 2) * 2;
    line(g, [[x + 4, y - 22], [x + 10, y - 34 + s], [x + 16, y - 38 + s]], '#43a047', 7);
    ell(g, x + 19, y - 39 + s, 7, 5, '#388e3c'); circle(g, x + 21, y - 41 + s, 1.3, '#111');
    if ((t % 2) < 0.6) line(g, [[x + 25, y - 38 + s], [x + 31, y - 38 + s], [x + 33, y - 40 + s]], '#e53935', 1.2);
    for (let k = -2; k <= 2; k++) circle(g, x + k * 7, y - 6, 1.5, '#fdd835');
  }
  function frog(g, x, y, t) {
    const j = Math.max(0, Math.sin(t * 1.3) - 0.8) * 30;
    ell(g, x, y - 9 - j, 13, 9, '#4caf50'); ell(g, x - 10, y - 4 - j, 7, 4, '#388e3c'); ell(g, x + 10, y - 4 - j, 7, 4, '#388e3c');
    circle(g, x - 6, y - 18 - j, 5, '#4caf50'); circle(g, x + 6, y - 18 - j, 5, '#4caf50'); circle(g, x - 6, y - 19 - j, 2.5, '#fff'); circle(g, x + 6, y - 19 - j, 2.5, '#fff');
    circle(g, x - 6, y - 19 - j, 1.3, '#111'); circle(g, x + 6, y - 19 - j, 1.3, '#111'); curve(g, x - 6, y - 10 - j, x, y - 7 - j, x + 6, y - 10 - j, '#1b5e20', 1.2);
  }
  function bee(g, x, y, t) {
    const bx = x + Math.sin(t * 2.1) * 14, by = y + Math.cos(t * 3.3) * 8;
    const a = Math.abs(Math.sin(t * 40)) * 0.6 + 0.4;
    g.globalAlpha = 0.7; ell(g, bx - 2, by - 8, 5, 7 * a, '#e3f2fd'); ell(g, bx + 3, by - 8, 5, 7 * a, '#e3f2fd'); g.globalAlpha = 1;
    ell(g, bx, by, 8, 6, '#fdd835'); line(g, [[bx - 2, by - 6], [bx - 2, by + 6]], '#212121', 2.5); line(g, [[bx + 3, by - 5], [bx + 3, by + 5]], '#212121', 2.5);
    circle(g, bx + 8, by, 3, '#212121');
  }
  function butterfly(g, x, y, t, c = '#ab47bc') {
    const bx = x + Math.sin(t * 0.9) * 22, by = y + Math.sin(t * 1.7) * 12;
    const a = 0.35 + Math.abs(Math.sin(t * 9)) * 0.65;
    g.save(); g.translate(bx, by);
    g.save(); g.scale(a, 1); ell(g, -7, -5, 8, 7, c); ell(g, -6, 5, 6, 5, sh(c, -0.2)); ell(g, 7, -5, 8, 7, c); ell(g, 6, 5, 6, 5, sh(c, -0.2)); circle(g, -8, -5, 2.2, '#fff59d'); circle(g, 8, -5, 2.2, '#fff59d'); g.restore();
    ell(g, 0, 0, 1.8, 8, '#212121'); curve(g, 0, -8, -2, -12, -5, -14, '#212121', 1); curve(g, 0, -8, 2, -12, 5, -14, '#212121', 1);
    g.restore();
  }
  function ant(g, x, y, t) {
    for (let k = 0; k < 4; k++) {
      const ax = x - 20 + ((t * 10 + k * 12) % 44);
      circle(g, ax, y - 3, 2, '#3e2723'); circle(g, ax + 3.5, y - 3.5, 1.6, '#3e2723'); circle(g, ax + 6.5, y - 4, 1.8, '#3e2723');
      line(g, [[ax + 1, y - 2], [ax, y]], '#3e2723', 0.8); line(g, [[ax + 4, y - 2], [ax + 5, y]], '#3e2723', 0.8);
    }
  }
  function spider(g, x, y, t) {
    const cy = y - 30 + Math.sin(t * 1.2) * 4;
    line(g, [[x, y - 58], [x, cy]], 'rgba(255,255,255,.8)', 1);
    for (let k = -2; k <= 2; k++) if (k) { curve(g, x, cy, x + k * 7, cy - 6, x + k * 11, cy + 2, '#212121', 1.5); curve(g, x, cy + 2, x + k * 7, cy + 4, x + k * 10, cy + 10, '#212121', 1.5); }
    ell(g, x, cy + 2, 5, 6, '#212121'); circle(g, x, cy - 4, 3.5, '#212121'); circle(g, x - 1, cy - 5, 0.9, '#f44336'); circle(g, x + 1, cy - 5, 0.9, '#f44336');
  }
  function turtle(g, x, y, t, dir = 1) {
    g.save(); g.translate(x, y); g.scale(dir, 1);
    const s = Math.sin(t * 0.8) * 2;
    ell(g, 18 + s, -9, 6, 5, '#7cb342'); circle(g, 21 + s, -10, 1.2, '#111');
    [-10, 8].forEach(dx => ell(g, dx, -3, 5, 3, '#7cb342'));
    g.beginPath(); g.ellipse(0, -8, 17, 12, 0, Math.PI, 0); g.fillStyle = '#6d8b3a'; g.fill();
    [[-8, -12], [2, -15], [10, -11], [-2, -10]].forEach(([dx, dy]) => ell(g, dx, dy, 4, 3, '#8bc34a'));
    rect(g, -17, -9, 34, 3, '#558b2f');
    g.restore();
  }
  function owl(g, x, y, t) {
    const blink = (t % 4) < 0.15;
    ell(g, x, y - 20, 14, 18, '#8d6e63'); ell(g, x, y - 16, 9, 12, '#d7ccc8');
    poly(g, [[x - 12, y - 34], [x - 9, y - 44], [x - 5, y - 35]], '#8d6e63'); poly(g, [[x + 12, y - 34], [x + 9, y - 44], [x + 5, y - 35]], '#8d6e63');
    circle(g, x - 6, y - 28, 6, '#fff'); circle(g, x + 6, y - 28, 6, '#fff');
    if (blink) { line(g, [[x - 10, y - 28], [x - 2, y - 28]], '#5d4037', 2); line(g, [[x + 2, y - 28], [x + 10, y - 28]], '#5d4037', 2); }
    else { circle(g, x - 6, y - 28, 3, '#ff9800'); circle(g, x + 6, y - 28, 3, '#ff9800'); circle(g, x - 6, y - 28, 1.5, '#111'); circle(g, x + 6, y - 28, 1.5, '#111'); }
    poly(g, [[x - 2, y - 23], [x + 2, y - 23], [x, y - 19]], '#ffb300');
    line(g, [[x - 4, y - 2], [x - 4, y + 1]], '#ffb300', 2); line(g, [[x + 4, y - 2], [x + 4, y + 1]], '#ffb300', 2);
  }
  function penguin(g, x, y, t) {
    const w = Math.sin(t * 4) * 0.12;
    g.save(); g.translate(x, y); g.rotate(w);
    ell(g, 0, -20, 13, 20, '#263238'); ell(g, 2, -17, 9, 15, '#fafafa');
    circle(g, 0, -38, 9, '#263238'); circle(g, 3, -39, 1.6, '#fff'); poly(g, [[7, -38], [14, -36], [7, -34]], '#ff9800');
    ell(g, -11, -20, 4, 11, '#263238', 0.3); ell(g, -4, -1, 5, 2.5, '#ff9800'); ell(g, 6, -1, 5, 2.5, '#ff9800');
    g.restore();
  }
  function parrot(g, x, y, t) {
    line(g, [[x - 22, y], [x + 22, y]], Obj.MADERA, 5);
    ell(g, x, y - 18, 10, 16, '#e53935'); circle(g, x + 3, y - 36, 8, '#e53935');
    circle(g, x + 6, y - 37, 3, '#fff'); circle(g, x + 6.5, y - 37, 1.4, '#111');
    g.beginPath(); g.moveTo(x + 10, y - 38); g.quadraticCurveTo(x + 18, y - 36, x + 12, y - 30); g.closePath(); g.fillStyle = '#fdd835'; g.fill();
    const f = Math.sin(t * 2) * 0.1;
    g.save(); g.translate(x - 2, y - 24); g.rotate(0.3 + f); ell(g, 0, 8, 7, 15, '#1e88e5'); ell(g, 0, 16, 5, 8, '#43a047'); g.restore();
    poly(g, [[x - 4, y - 4], [x + 4, y - 4], [x + 2, y + 14], [x - 6, y + 12]], '#1565c0');
    line(g, [[x - 2, y - 2], [x - 2, y + 2]], '#555', 2); line(g, [[x + 3, y - 2], [x + 3, y + 2]], '#555', 2);
  }
  function ladybug(g, x, y, t) {
    ell(g, x, y - 5, 22, 7, '#43a047', 0.1); line(g, [[x - 20, y - 5], [x + 20, y - 6]], '#2e7d32', 1.5);
    const lx = x - 8 + Math.sin(t * 0.8) * 8;
    circle(g, lx, y - 12, 6, '#e53935'); line(g, [[lx, y - 18], [lx, y - 6]], '#212121', 1.2); circle(g, lx + 6, y - 11, 3, '#212121');
    [[-3, -14], [3, -14], [-3, -9], [3, -9]].forEach(([dx, dy]) => circle(g, lx + dx, y + dy, 1.3, '#212121'));
  }
  function fishbowl(g, x, y, t) {
    ell(g, x, y - 3, 14, 3, '#b0bec5');
    circle(g, x, y - 20, 18, 'rgba(179,229,252,0.65)'); g.save(); g.beginPath(); g.arc(x, y - 20, 18, 0, TAU); g.clip(); rect(g, x - 20, y - 40, 40, 10, 'rgba(255,255,255,.35)'); g.restore();
    const fx = x + Math.sin(t * 1.4) * 7, d = Math.cos(t * 1.4) > 0 ? 1 : -1;
    ell(g, fx, y - 18, 7, 5, '#ff9800'); poly(g, [[fx - 6 * d, y - 18], [fx - 12 * d, y - 23], [fx - 12 * d, y - 13]], '#fb8c00'); circle(g, fx + 3 * d, y - 19, 1.2, '#111');
    ell(g, x, y - 37, 11, 2.5, 'rgba(255,255,255,.6)');
    ring(g, x + 9, y - 30 - ((t * 10) % 12), 1.5, 'rgba(255,255,255,.8)', 1);
  }
  function bird(g, x, y, t, c = '#1e88e5') {
    const hop = Math.max(0, Math.sin(t * 2.5)) * 2;
    ell(g, x, y - 8 - hop, 9, 7, c); circle(g, x + 7, y - 14 - hop, 5, c); poly(g, [[x + 11, y - 15 - hop], [x + 16, y - 13 - hop], [x + 11, y - 12 - hop]], '#ffb300');
    circle(g, x + 8, y - 15 - hop, 1.2, '#111'); poly(g, [[x - 8, y - 9 - hop], [x - 16, y - 13 - hop], [x - 15, y - 6 - hop]], sh(c, -0.25));
    ell(g, x - 1, y - 9 - hop, 5, 3, sh(c, -0.2), -0.3);
  }
  function whale(g, x, y, t) {
    const b = Math.sin(t * 0.8) * 3;
    g.beginPath(); g.moveTo(x - 70, y - 20 + b); g.quadraticCurveTo(x - 20, y - 60 + b, x + 60, y - 30 + b); g.quadraticCurveTo(x + 70, y - 16 + b, x + 50, y - 10 + b);
    g.lineTo(x - 60, y - 10 + b); g.closePath(); g.fillStyle = '#546e7a'; g.fill();
    poly(g, [[x - 66, y - 20 + b], [x - 86, y - 36 + b], [x - 80, y - 18 + b], [x - 88, y - 4 + b]], '#546e7a');
    circle(g, x + 42, y - 32 + b, 2.5, '#111'); curve(g, x + 28, y - 20 + b, x + 44, y - 18 + b, x + 58, y - 24 + b, '#37474f', 1.5);
    const p = (t * 0.6) % 1;
    if (p < 0.6) {
      g.globalAlpha = 1 - p / 0.6;
      [-8, 0, 8].forEach(dx => curve(g, x + 20, y - 46 + b, x + 20 + dx * 0.4, y - 62 + b - p * 18, x + 20 + dx, y - 56 + b - p * 24, '#e1f5fe', 3));
      g.globalAlpha = 1;
    }
  }
  function shark(g, x, y, t) {
    const sx = x + Math.sin(t * 0.6) * 60, d = Math.cos(t * 0.6) > 0 ? 1 : -1;
    g.save(); g.translate(sx, y); g.scale(d, 1);
    poly(g, [[-8, 0], [8, 0], [-2, -28]], '#607d8b'); poly(g, [[-2, -28], [8, 0], [2, 0]], '#78909c');
    curve(g, -30, 2, -10, -2, 20, 2, 'rgba(255,255,255,.7)', 2);
    g.restore();
  }

  return { dog, cat, duck, quad, chicken, especie, ESPECIES, ALTO, elephant, monkey, rabbit, mouse, snake, frog, bee, butterfly, ant, spider, turtle, owl, penguin, parrot, ladybug, fishbowl, bird, whale, shark };
})();
