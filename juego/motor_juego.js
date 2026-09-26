'use strict';

/* ============================================================================
   ENGLISH TOWN · MOTOR (4/4): dibujo, enseñanza, misiones, bucle y controles
============================================================================ */

/* ---------- Dibujos del juego original ---------- */
const Draw = {
  bench(g, x, y) {
    g.fillStyle = '#6b4a2b'; g.fillRect(x - 58, y - 64, 116, 10); g.fillRect(x - 58, y - 50, 116, 8);
    g.fillStyle = '#8a6239'; g.fillRect(x - 62, y - 32, 124, 10);
    g.fillStyle = '#3a3f45';
    [-50, 46].forEach(dx => { g.fillRect(x + dx, y - 64, 5, 64); g.fillRect(x + dx - 2, y - 24, 8, 24); });
  },
  mailbox(g, x, y, n) {
    g.fillStyle = '#5a4632'; g.fillRect(x - 3, y - 46, 6, 46);
    g.fillStyle = '#2f5d8a'; rrect(g, x - 18, y - 68, 36, 24, 6); g.fill();
    g.fillStyle = '#ffffff'; g.font = 'bold 17px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(String(n), x, y - 55);
    g.fillStyle = '#d7263d'; g.fillRect(x + 16, y - 72, 3, 16);
  },
  bicycle(g, x, y, color, t = 0) {
    g.strokeStyle = '#222'; g.lineWidth = 3;
    [-26, 26].forEach(dx => {
      g.beginPath(); g.arc(x + dx, y - 17, 16, 0, Math.PI * 2); g.stroke();
      g.beginPath(); g.moveTo(x + dx, y - 17); g.lineTo(x + dx + Math.cos(t) * 15, y - 17 + Math.sin(t) * 15); g.stroke();
    });
    g.strokeStyle = color; g.lineWidth = 4;
    g.beginPath();
    g.moveTo(x - 26, y - 17); g.lineTo(x - 4, y - 17); g.lineTo(x + 12, y - 42); g.lineTo(x - 10, y - 42); g.closePath();
    g.moveTo(x - 4, y - 17); g.lineTo(x - 12, y - 48); g.moveTo(x + 12, y - 42); g.lineTo(x + 26, y - 17);
    g.moveTo(x + 12, y - 42); g.lineTo(x + 10, y - 52);
    g.stroke();
    g.fillStyle = '#222'; g.fillRect(x - 19, y - 52, 14, 5); g.fillRect(x + 4, y - 55, 14, 4);
  },
  doghouse(g, x, y, color) {
    g.fillStyle = color; g.fillRect(x - 38, y - 52, 76, 52);
    g.fillStyle = Gen.shade(color, -0.35); g.beginPath(); g.moveTo(x - 46, y - 50); g.lineTo(x, y - 86); g.lineTo(x + 46, y - 50); g.closePath(); g.fill();
    g.fillStyle = '#2b2118'; g.beginPath(); g.moveTo(x - 16, y); g.lineTo(x - 16, y - 26); g.arc(x, y - 26, 16, Math.PI, 0); g.lineTo(x + 16, y); g.fill();
  },
  barn(g, x, y) {
    g.fillStyle = '#b23a2a'; g.fillRect(x - 130, y - 190, 260, 190);
    g.fillStyle = '#7a2418'; g.beginPath(); g.moveTo(x - 150, y - 186); g.lineTo(x - 90, y - 280); g.lineTo(x + 90, y - 280); g.lineTo(x + 150, y - 186); g.closePath(); g.fill();
    g.strokeStyle = '#ffffff'; g.lineWidth = 7;
    g.strokeRect(x - 55, y - 120, 110, 120);
    g.beginPath(); g.moveTo(x - 55, y - 120); g.lineTo(x + 55, y); g.moveTo(x + 55, y - 120); g.lineTo(x - 55, y); g.stroke();
    g.fillStyle = '#fff'; g.fillRect(x - 22, y - 250, 44, 34);
    g.fillStyle = '#2b2118'; g.fillRect(x - 17, y - 245, 34, 24);
  },
  fence(g, x0, x1, y) {
    g.fillStyle = '#c8a27a';
    for (let x = x0; x <= x1; x += 40) g.fillRect(x - 4, y - 50, 8, 52);
    g.fillRect(x0, y - 42, x1 - x0, 7); g.fillRect(x0, y - 22, x1 - x0, 7);
  },
  clockTower(g, x, y, h, m) {
    g.fillStyle = '#c9b79c'; g.fillRect(x - 55, y - 380, 110, 380);
    g.fillStyle = '#8a7a64'; g.beginPath(); g.moveTo(x - 70, y - 378); g.lineTo(x, y - 470); g.lineTo(x + 70, y - 378); g.closePath(); g.fill();
    g.fillStyle = '#6b4a2b'; g.beginPath(); g.moveTo(x - 24, y); g.lineTo(x - 24, y - 60); g.arc(x, y - 60, 24, Math.PI, 0); g.lineTo(x + 24, y); g.fill();
    const cy = y - 300;
    g.fillStyle = '#fffdf5'; g.beginPath(); g.arc(x, cy, 42, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#2b2b2b'; g.lineWidth = 4; g.stroke();
    for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; g.beginPath(); g.moveTo(x + Math.sin(a) * 34, cy - Math.cos(a) * 34); g.lineTo(x + Math.sin(a) * 39, cy - Math.cos(a) * 39); g.stroke(); }
    const ah = ((h % 12) + m / 60) / 12 * Math.PI * 2, am = m / 60 * Math.PI * 2;
    g.lineWidth = 5; g.beginPath(); g.moveTo(x, cy); g.lineTo(x + Math.sin(ah) * 22, cy - Math.cos(ah) * 22); g.stroke();
    g.lineWidth = 3; g.beginPath(); g.moveTo(x, cy); g.lineTo(x + Math.sin(am) * 33, cy - Math.cos(am) * 33); g.stroke();
  },
  goal(g, x, y, dir) {
    g.strokeStyle = '#ffffff'; g.lineWidth = 6;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 110); g.lineTo(x + dir * 50, y - 90); g.lineTo(x + dir * 50, y + 10); g.stroke();
    g.strokeStyle = Gen.rgba('#ffffff', 0.5); g.lineWidth = 1.5;
    for (let k = 1; k < 5; k++) { g.beginPath(); g.moveTo(x, y - k * 22); g.lineTo(x + dir * 50, y - k * 20 + 10); g.stroke(); }
  },
  fountain(g, x, y, t) {
    g.fillStyle = '#b8b2a7'; g.beginPath(); g.ellipse(x, y - 14, 80, 24, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#6fb7e0'; g.beginPath(); g.ellipse(x, y - 18, 68, 17, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#a39d92'; g.fillRect(x - 8, y - 80, 16, 64);
    g.fillStyle = '#b8b2a7'; g.beginPath(); g.ellipse(x, y - 80, 30, 8, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = Gen.rgba('#bfe6ff', 0.9); g.lineWidth = 3;
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2 + t, dx = Math.cos(a) * 50;
      g.beginPath(); g.moveTo(x, y - 84); g.quadraticCurveTo(x + dx * 0.5, y - 130, x + dx, y - 22); g.stroke();
    }
  },
  pondGround(g, p, t) {
    g.fillStyle = '#8fb58a'; g.beginPath(); g.ellipse(p.x, p.y, p.rx + 18, p.ry + 12, 0, 0, Math.PI * 2); g.fill();
    const grd = g.createLinearGradient(0, p.y - p.ry, 0, p.y + p.ry);
    grd.addColorStop(0, '#5aa7d6'); grd.addColorStop(1, '#3b7fb0');
    g.fillStyle = grd; g.beginPath(); g.ellipse(p.x, p.y, p.rx, p.ry, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = Gen.rgba('#ffffff', 0.35); g.lineWidth = 2;
    for (let k = 0; k < 4; k++) { const rr2 = ((t * 20 + k * 40) % 160); g.beginPath(); g.ellipse(p.x - 60 + k * 40, p.y + 10, rr2 * 0.5, rr2 * 0.18, 0, 0, Math.PI * 2); g.stroke(); }
  },
  slide(g, x, y) {
    g.strokeStyle = '#d35400'; g.lineWidth = 6;
    g.beginPath(); g.moveTo(x - 50, y); g.lineTo(x - 50, y - 120); g.moveTo(x - 20, y); g.lineTo(x - 20, y - 120); g.stroke();
    g.lineWidth = 3; g.beginPath(); for (let k = 1; k < 6; k++) { g.moveTo(x - 50, y - k * 20); g.lineTo(x - 20, y - k * 20); } g.stroke();
    g.fillStyle = '#f1c40f'; g.beginPath(); g.moveTo(x - 20, y - 120); g.quadraticCurveTo(x + 30, y - 110, x + 70, y - 6); g.lineTo(x + 50, y - 6);
    g.quadraticCurveTo(x + 15, y - 95, x - 20, y - 104); g.fill();
    g.fillStyle = '#d35400'; g.fillRect(x - 54, y - 124, 38, 8);
  },
  swing(g, x, y, t) {
    g.strokeStyle = '#34495e'; g.lineWidth = 6;
    g.beginPath(); g.moveTo(x - 60, y); g.lineTo(x - 40, y - 150); g.lineTo(x + 40, y - 150); g.lineTo(x + 60, y); g.stroke();
    g.save(); g.translate(x, y - 150); g.rotate(Math.sin(t * 1.6) * 0.35);
    g.strokeStyle = '#7f8c8d'; g.lineWidth = 2; g.beginPath(); g.moveTo(-14, 0); g.lineTo(-14, 110); g.moveTo(14, 0); g.lineTo(14, 110); g.stroke();
    g.fillStyle = '#c0392b'; g.fillRect(-20, 108, 40, 7); g.restore();
  },
  flowers(g, x, y, w, colors) {
    g.fillStyle = '#4e8a3a'; rrect(g, x - w / 2, y - 14, w, 16, 8); g.fill();
    for (let i = 0; i < w / 14; i++) {
      const fx = x - w / 2 + 7 + i * 14, fy = y - 14 - (i % 3) * 4;
      g.strokeStyle = '#3d7a2e'; g.lineWidth = 2; g.beginPath(); g.moveTo(fx, y - 6); g.lineTo(fx, fy); g.stroke();
      g.fillStyle = colors[i % colors.length]; g.beginPath(); g.arc(fx, fy - 2, 5, 0, Math.PI * 2); g.fill();
    }
  },
  streetlight(g, x, y, on) {
    g.strokeStyle = '#3a3f45'; g.lineWidth = 7;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 190); g.quadraticCurveTo(x, y - 205, x + 25, y - 200); g.stroke();
    g.fillStyle = on ? '#ffe08a' : '#e8e4d8'; g.beginPath(); g.ellipse(x + 30, y - 195, 16, 7, 0, 0, Math.PI * 2); g.fill();
  },
  trafficLight(g, x, y, state) {
    g.strokeStyle = '#2d3238'; g.lineWidth = 7; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 150); g.stroke();
    g.fillStyle = '#2d3238'; rrect(g, x - 15, y - 222, 30, 78, 8); g.fill();
    ['red', 'yellow', 'green'].forEach((c, i) => {
      g.fillStyle = state === c ? ({ red: '#ff3b30', yellow: '#ffcc00', green: '#34c759' })[c] : '#4a4f55';
      g.beginPath(); g.arc(x, y - 208 + i * 25, 9, 0, Math.PI * 2); g.fill();
    });
  },
  busStop(g, x, y) {
    g.strokeStyle = '#5d6d7e'; g.lineWidth = 6; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 160); g.stroke();
    g.fillStyle = '#2e86de'; g.beginPath(); g.arc(x, y - 170, 22, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fff'; g.font = 'bold 14px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('BUS', x, y - 170);
  },
  sign(g, x, y, text, color) {
    g.font = 'bold 34px system-ui, sans-serif';
    const w = g.measureText(text).width + 40;
    g.fillStyle = color; rrect(g, x - w / 2, y - 30, w, 52, 10); g.fill();
    g.strokeStyle = '#ffffff'; g.lineWidth = 3; g.stroke();
    g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, x, y - 3);
  },
  prop(g, kind, x, y, t, color) {
    const hy = y - 52;
    if (kind === 'book') {
      g.fillStyle = color || '#c0392b'; g.fillRect(x - 16, hy - 8, 15, 20); g.fillRect(x + 1, hy - 8, 15, 20);
      g.fillStyle = '#fdfaf0'; g.fillRect(x - 14, hy - 6, 12, 16); g.fillRect(x + 2, hy - 6, 12, 16);
    } else if (kind === 'iceCream') {
      g.fillStyle = '#d9a066'; g.beginPath(); g.moveTo(x + 18, hy + 10); g.lineTo(x + 12, hy - 8); g.lineTo(x + 24, hy - 8); g.fill();
      g.fillStyle = '#ff9fb2'; g.beginPath(); g.arc(x + 18, hy - 12, 8, 0, Math.PI * 2); g.fill();
    } else if (kind === 'coffee') {
      g.fillStyle = '#ffffff'; g.fillRect(x + 12, hy - 6, 13, 15); g.fillStyle = '#6b3e26'; g.fillRect(x + 12, hy - 6, 13, 4);
      g.strokeStyle = Gen.rgba('#ffffff', 0.7); g.lineWidth = 2;
      g.beginPath(); g.moveTo(x + 16, hy - 10); g.quadraticCurveTo(x + 12 + Math.sin(t * 3) * 4, hy - 18, x + 18, hy - 26); g.stroke();
    } else if (kind === 'phone') {
      g.fillStyle = '#222'; g.fillRect(x + 12, y - 92, 7, 13);
    } else if (kind === 'camera') {
      g.fillStyle = '#333'; g.fillRect(x - 12, y - 86, 24, 15); g.fillStyle = '#777'; g.beginPath(); g.arc(x, y - 78, 5, 0, Math.PI * 2); g.fill();
      if ((t % 3) < 0.12) { g.fillStyle = Gen.rgba('#ffffff', 0.9); g.beginPath(); g.arc(x, y - 80, 26, 0, Math.PI * 2); g.fill(); }
    } else if (kind === 'broom') {
      g.save(); g.translate(x + 22, hy); g.rotate(Math.sin(t * 5) * 0.3);
      g.strokeStyle = '#8a6239'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, -20); g.lineTo(0, 44); g.stroke();
      g.fillStyle = '#d4a017'; g.beginPath(); g.moveTo(-10, 44); g.lineTo(10, 44); g.lineTo(14, 58); g.lineTo(-14, 58); g.fill(); g.restore();
    } else if (kind === 'wateringCan') {
      g.fillStyle = '#2e86de'; g.fillRect(x + 14, hy, 22, 16);
      g.strokeStyle = '#2e86de'; g.lineWidth = 4; g.beginPath(); g.moveTo(x + 36, hy + 4); g.lineTo(x + 50, hy - 4); g.stroke();
      g.fillStyle = '#6fb7e0'; for (let k = 0; k < 4; k++) { const d = ((t * 60 + k * 12) % 44); g.fillRect(x + 50 + k * 2, hy - 2 + d, 3, 5); }
    } else if (kind === 'bag') {
      g.fillStyle = '#e0b040'; g.fillRect(x + 20, hy + 2, 20, 22);
      g.strokeStyle = '#8a6d1d'; g.lineWidth = 2; g.beginPath(); g.arc(x + 30, hy + 2, 6, Math.PI, 0); g.stroke();
      g.fillStyle = '#27ae60'; g.beginPath(); g.arc(x + 26, hy, 5, 0, Math.PI * 2); g.fill();
    } else if (kind === 'music') {
      g.fillStyle = '#222'; g.fillRect(x - 16, y - 108, 32, 5);
      g.fillStyle = '#e74c3c'; g.beginPath(); g.arc(x - 16, y - 96, 6, 0, Math.PI * 2); g.arc(x + 16, y - 96, 6, 0, Math.PI * 2); g.fill();
      Draw.notes(g, x + 20, y - 110, t);
    }
  },
  notes(g, x, y, t) {
    g.font = '20px system-ui, sans-serif'; g.textAlign = 'center';
    for (let k = 0; k < 3; k++) {
      const p = (t * 0.6 + k / 3) % 1;
      g.globalAlpha = 1 - p; g.fillStyle = ['#8e44ad', '#2e86de', '#e67e22'][k];
      g.fillText(k % 2 ? '♪' : '♫', x + Math.sin(p * 6 + k) * 10, y - p * 50);
    }
    g.globalAlpha = 1;
  },
  zzz(g, x, y, t) {
    g.font = 'bold 18px system-ui, sans-serif'; g.textAlign = 'center'; g.fillStyle = '#34495e';
    for (let k = 0; k < 3; k++) { const p = (t * 0.4 + k / 3) % 1; g.globalAlpha = 1 - p; g.fillText('z', x + p * 24, y - p * 40); }
    g.globalAlpha = 1;
  },
  kite(g, x, y, hx, hy, t, color) {
    g.strokeStyle = Gen.rgba('#ffffff', 0.8); g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(hx, hy); g.quadraticCurveTo((hx + x) / 2 + 30, (hy + y) / 2 + 40, x, y + 30); g.stroke();
    g.fillStyle = color; g.beginPath(); g.moveTo(x, y - 30); g.lineTo(x + 22, y); g.lineTo(x, y + 30); g.lineTo(x - 22, y); g.closePath(); g.fill();
    g.strokeStyle = color; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y + 30);
    for (let k = 1; k < 6; k++) g.lineTo(x + Math.sin(t * 4 + k) * 8, y + 30 + k * 12);
    g.stroke();
  },
  rod(g, x, y, tx, ty, t) {
    g.strokeStyle = '#6b4a2b'; g.lineWidth = 3; g.beginPath(); g.moveTo(x + 14, y - 50); g.lineTo(x + 70, y - 110); g.stroke();
    g.strokeStyle = Gen.rgba('#ffffff', 0.8); g.lineWidth = 1; g.beginPath(); g.moveTo(x + 70, y - 110); g.lineTo(tx, ty + Math.sin(t * 2) * 2); g.stroke();
  },
  crumbs(g, x, y, t) {
    g.fillStyle = '#d9a066';
    for (let k = 0; k < 5; k++) { const p = (t * 0.8 + k / 5) % 1; g.fillRect(x + 20 + p * 50, y - 50 + p * p * 60, 4, 4); }
  },
  cap(g, x, y) {
    g.fillStyle = '#1b1b1b';
    g.beginPath(); g.moveTo(x - 24, y - 4); g.lineTo(x, y - 14); g.lineTo(x + 24, y - 4); g.lineTo(x, y + 6); g.closePath(); g.fill();
    g.fillRect(x - 10, y - 2, 20, 10);
    g.strokeStyle = '#f1c40f'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 2, y - 4); g.lineTo(x + 18, y + 10); g.stroke();
  },
  // Burbuja de palabra: flota y se puede tocar; si ya la aprendiste, lleva un anillo dorado y ✓
  orb(g, o, t, glow, aprendida) {
    const th = THEME[o.w.theme];
    const y = o.y - 34 + Math.sin(t * 2.4 + o.x * 0.01) * 5;
    if (glow) { g.fillStyle = Gen.rgba('#fff3a0', 0.35 + 0.25 * Math.sin(t * 5)); g.beginPath(); g.arc(o.x, y, 36, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = Gen.rgba('#000000', 0.15); g.beginPath(); g.ellipse(o.x, o.y, 16, 5, 0, 0, Math.PI * 2); g.fill();
    const grd = g.createRadialGradient(o.x - 8, y - 10, 2, o.x, y, 26);
    grd.addColorStop(0, Gen.shade(th.color, 0.55)); grd.addColorStop(1, th.color);
    g.fillStyle = grd; g.beginPath(); g.arc(o.x, y, 24, 0, Math.PI * 2); g.fill();
    g.strokeStyle = aprendida ? '#f5b700' : '#ffffff'; g.lineWidth = aprendida ? 4 : 3; g.stroke();
    g.font = '22px system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = '#ffffff';
    g.fillText(o.w.t === 'm' ? o.w.value : (o.w.icon || o.w.en[0].toUpperCase()), o.x, y + 1);
    if (aprendida) { g.fillStyle = '#f5b700'; g.beginPath(); g.arc(o.x + 18, y - 18, 8, 0, Math.PI * 2); g.fill(); g.fillStyle = '#fff'; g.font = 'bold 11px system-ui'; g.fillText('✓', o.x + 18, y - 17); }
    g.font = 'bold 15px system-ui, sans-serif';
    g.lineWidth = 4; g.strokeStyle = 'rgba(0,0,0,0.55)'; g.strokeText(o.w.en, o.x, y + 38);
    g.fillStyle = '#ffffff'; g.fillText(o.w.en, o.x, y + 38);
  }
};

/* ---------- Personas y grupos ---------- */
function drawPerson(g, p, t) {
  const a = p.actKey, x = p.x, y = p.y, talking = p.talkT > 0, h = p.h;
  if (a === 'sleep') { Draw.bench(g, x, y); drawHuman(g, h, x - 50, y - 44, { pose: 'de pie', rot: Math.PI / 2 }); Draw.zzz(g, x + 50, y - 60, t); return; }
  if (p.tumbado) { drawHuman(g, h, x - 46, y - 8, { pose: 'de pie', rot: Math.PI / 2 }); if (a === 'rest') Draw.zzz(g, x + 40, y - 50, t); return; }
  if (a === 'sit') {
    g.save(); g.beginPath(); g.rect(x - 80, y - 400, 160, 370); g.clip();
    drawHuman(g, h, x, y + 18, { pose: talking ? 'saludo' : 'de pie' }); g.restore();
    Draw.bench(g, x, y);
    g.strokeStyle = p.geo.bottomType === 'pantalón' ? p.geo.bottomColor : '#d9a066'; g.lineWidth = 8;
    g.beginPath(); g.moveTo(x - 7, y - 26); g.lineTo(x - 7, y - 4); g.moveTo(x + 7, y - 26); g.lineTo(x + 7, y - 4); g.stroke();
    return;
  }
  if (p.enAgua) {
    const sw = Math.sin(t * 3) * 3;
    g.save(); g.beginPath(); g.rect(x - 60, y - 200, 120, 200 - 16); g.clip();
    drawHuman(g, h, x, y + h.alto * 0.45 + sw, { pose: 'brazos arriba' }); g.restore();
    g.fillStyle = 'rgba(79,195,247,0.85)'; g.beginPath(); g.ellipse(x, y - 14, 34, 7, 0, 0, Math.PI * 2); g.fill();
    PROPS.water(g, x, y - 10, t);
    return;
  }
  const moving = (p.move || a === 'soccer') && p.pause <= 0;
  let pose = p.act.pose === 'caminando' ? 'de pie' : (p.act.pose || 'de pie'), lift = 0, sway = 0;
  if (talking) pose = 'saludo';
  if (!h.poses[pose]) pose = Object.keys(h.poses)[0];
  if (a === 'jump' && !talking) lift = Math.abs(Math.sin(t * 5)) * 26;
  if ((a === 'dance' || a === 'enjoy' || a === 'win') && !talking) { sway = Math.sin(t * 4) * 0.12; lift = Math.abs(Math.sin(t * 8)) * 6; }
  if (a === 'stretch' && !talking) sway = Math.sin(t * 1.5) * 0.18;
  if (a === 'laugh' && !talking) sway = Math.sin(t * 9) * 0.05;
  if (a === 'wave' && h.poses.saludo) h.poses.saludo.p.phase = t * 3;
  if (a === 'ride') { drawHuman(g, h, x, y - 24, { moving: true }); Draw.bicycle(g, x, y, p.c.bikeC, h.walkP.phase); return; }
  if (a === 'walkDog') Animales.dog(g, x + p.dir * 58, y + 4, p.c.dogC, t, moving ? 'walk' : 'sit', p.dir);
  drawHuman(g, h, x, y, { moving: moving && !talking, pose, lift, sway });
  const top = y - lift - h.alto * 1.02;
  if (p.acc && ACCESORIOS[p.acc]) ACCESORIOS[p.acc](g, x, top, h.alto);
  const obj = p.act.obj;
  if (['book', 'iceCream', 'coffee', 'phone', 'camera', 'broom', 'wateringCan', 'bag', 'music'].includes(obj)) Draw.prop(g, obj, x, y - lift, t, p.c.bookC);
  if (p.act.prop && PROPS[p.act.prop] && !talking) PROPS[p.act.prop](g, x, y - lift, t, h);
  if (p.estado) PROPS[MundoDatos.ESTADOS[p.estado].prop](g, x, y, t, h);
  if (a === 'sing') Draw.notes(g, x + 14, y - 104, t);
  if (a === 'kite') Draw.kite(g, x + 90 + Math.sin(t * 0.7) * 30, y - 330 + Math.sin(t) * 20, x + 26, y - 112, t, p.c.kiteC);
  if (a === 'fish' && p.target) Draw.rod(g, x, y, p.target[0], p.target[1], t);
  if (a === 'feed') Draw.crumbs(g, x, y, t);
  if (a === 'play' || a === 'soccer') {
    const by = y - Math.abs(Math.sin(t * 4)) * (a === 'play' ? 60 : 20);
    g.fillStyle = a === 'soccer' ? '#ffffff' : '#e74c3c'; g.beginPath(); g.arc(x + 34 * p.dir, by - 10, 10, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#222'; g.lineWidth = 1.5; g.stroke();
  }
  if (a === 'catch') { const p2 = (t * 0.8 + 0.5) % 1; Obj.circle(g, x - 20, y - 140 - Math.sin(p2 * Math.PI) * 10, 8, '#e53935'); }
}
function drawGrupo(g, gr, t) {
  const a = gr.actKey;
  gr.miembros.forEach((m, i) => {
    const x = gr.x + m.dx, y = gr.y;
    if (a === 'sit') {
      g.save(); g.beginPath(); g.rect(x - 30, y - 400, 60, 370); g.clip(); drawHuman(g, m.h, x, y + 18, { pose: 'de pie' }); g.restore();
      g.strokeStyle = m.h.geo.bottomType === 'pantalón' ? m.h.geo.bottomColor : '#d9a066'; g.lineWidth = 8;
      g.beginPath(); g.moveTo(x - 7, y - 26); g.lineTo(x - 7, y - 4); g.moveTo(x + 7, y - 26); g.lineTo(x + 7, y - 4); g.stroke();
      return;
    }
    const pose = gr.act.pose === 'caminando' ? 'de pie' : (gr.act.pose || 'de pie');
    let lift = 0, sway = 0;
    if (a === 'enjoy' || a === 'play') { lift = Math.abs(Math.sin(t * 6 + m.fase)) * 8; sway = Math.sin(t * 4 + m.fase) * 0.1; }
    if (a === 'wave' && m.h.poses.saludo) m.h.poses.saludo.p.phase = t * 3 + m.fase;
    drawHuman(g, m.h, x, y, { pose: m.h.poses[pose] ? pose : 'de pie', lift, sway });
    if (m.acc && ACCESORIOS[m.acc]) ACCESORIOS[m.acc](g, x, y - lift - m.h.alto * 1.02, m.h.alto);
    if (a === 'play' && i === 1) { const by = y - 70 - Math.abs(Math.sin(t * 4)) * 40; Obj.circle(g, x, by, 8, '#e53935'); }
  });
}

/* ============================================================================
   ENSEÑAR Y DESCUBRIR PALABRAS
============================================================================ */
function aprender(id, x, y) {
  if (!id || !PALABRAS.byId[id]) return false;
  const nuevo = !progress.words[id];
  if (!nuevo) return false;
  progress.words[id] = [0, 0];
  combo = now - lastCollectT < 8 ? combo + 1 : 1;
  lastCollectT = now;
  progress.stats.bestCombo = Math.max(progress.stats.bestCombo, combo);
  if (isDark()) progress.stats.night++;
  if (weather.kind === 'rainy') progress.stats.rain++;
  const mult = 1 + Math.floor((combo - 1) / 2);
  const px = x ?? player.x, py = y ?? player.y - 120;
  addXP(10 * mult, px, py - 40);
  floaters.push({ x: px, y: py - 80, text: `✨ ${PALABRAS.byId[id].en}`, t: 1.6, color: THEME[PALABRAS.byId[id].theme].color });
  if (combo >= 2) floaters.push({ x: px, y: py - 115, text: `Combo x${combo}!`, t: 1.3, color: '#ff6b6b' });
  Sfx.collect(combo);
  sparks(px, py, THEME[PALABRAS.byId[id].theme].color);
  missionEvent('learn', id);
  const count = Object.keys(progress.words).length;
  if (count % 15 === 0 && !quiz && !(mission && mission.type === 'quiz')) setTimeout(() => { if (!quiz) openReview(); }, 4200);
  if (count % 100 === 0) banner(`📘 ${count} words!`, `¡Ya conoces ${count} palabras!`);
  checkBadges();
  saveProgress();
  updateStats();
  return true;
}

function teach(ent, manual) {
  const ls = ent.lessons ? ent.lessons() : [];
  if (!ls.length) return;
  // Primero lo que todavía no conoces
  let idx = ent.li % ls.length;
  if (!manual || ent.li === 0) { const j = ls.findIndex(l => l.wordId && !progress.words[l.wordId]); if (j >= 0) idx = j; }
  const l = ls[idx];
  ent.li = idx + 1;
  ent.cd = now + (manual ? 4 : 45);
  recentKinds[ent.kind] = now;
  lesson = { ...l, ent, t: 0, dur: 8 };
  showLesson(l);
  guide.pointT = 8;
  sayBubble(guide, l.en);
  Voice.speak(l.speak || l.en);
  if (l.wordId) { const b = ent.box(); aprender(l.wordId, b.x + b.w / 2, b.y); }
}

function teachFree(l) {
  lesson = { ...l, ent: null, t: 0, dur: 7 };
  showLesson(l);
  guide.pointT = 0;
  sayBubble(guide, l.en);
  Voice.speak(l.speak || l.en);
  if (l.wordId) aprender(l.wordId);
}

function showLesson(l) {
  if (quiz) return;
  const c = CATS[l.cat] || CATS.noun;
  const col = l.theme ? l.theme.color : c.color;
  $('lChip').textContent = l.tense ? `${l.tense[0]} · ${l.tense[1]}` : l.theme ? `${l.theme.icon} ${l.theme.name} · ${l.theme.es}` : `${c.name} · ${c.es}`;
  $('lChip').style.background = col;
  $('lesson').style.setProperty('--mark', col);
  $('lWord').textContent = `${l.icon || ''} ${l.word}`;
  $('lWordEs').textContent = `= ${l.wordEs}`;
  const esc = s => String(s).replace(/[&<>]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[ch]);
  const re = new RegExp(`\\b(${String(l.word).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'i');
  $('lEn').innerHTML = esc(l.en).replace(re, '<mark>$1</mark>');
  $('lEs').textContent = l.es;
  $('lExtra').textContent = l.extra || '';
  $('lNuevo').classList.toggle('hidden', !(l.wordId && progress.words[l.wordId] && progress.words[l.wordId][0] === 0 && progress.words[l.wordId][1] === 0));
  $('lesson').classList.remove('hidden');
}

function sayBubble(who, text, dur = 4.5) {
  bubbles = bubbles.filter(b => b.who !== who);
  bubbles.push({ who, text, t: dur });
}

function candidatesNear(x, y, r) {
  return W.ents.filter(e => e.lessons && !e.lejos && e.kind !== 'park')
    .map(e => {
      const b = e.box(), cx = Math.max(b.x, Math.min(x, b.x + b.w)), d = Math.hypot(cx - x, (e.y - y) * 1.2);
      const nueva = (e.palabras || []).some(id => !progress.words[id]);
      const pen = (e.kind === 'tree' ? 70 : 0) + (now - (recentKinds[e.kind] ?? -999) < 60 ? 140 : 0) - (nueva ? 60 : 0);
      return [e, d, d + pen];
    }).filter(([, d]) => d < r).sort((a, b) => a[2] - b[2]);
}

function talkTo(p) {
  p.talkT = 3.2; p.pause = 3.5;
  if (p.kind === 'group') { teach(p, true); missionEvent('talk', p); return; }
  const ph = I.PHRASES[Math.floor(Math.random() * I.PHRASES.length)];
  const gr = I.greeting(hourNow());
  const line = mission && mission.type === 'greet' ? [`${gr[0]} ${ph[0]}`, `${gr[1]} ${ph[1]}`] : ph;
  sayBubble(p, line[0]);
  lesson = { cat: 'noun', word: p.name, wordEs: 'dice…', en: line[0], es: line[1], icon: '💬', ent: p, t: 0, dur: 6,
    theme: { icon: '💬', name: 'Conversation', es: 'Conversación', color: '#16a085' } };
  showLesson(lesson);
  Voice.speak(line[0], undefined, 0.85 + (p.name.length % 5) * 0.12);
  progress.stats.talks++;
  missionEvent('talk', p);
  if (!p.talked) { p.talked = true; addXP(5, p.x, p.y - 130); }
  // Al hablar también aprendes quién es (su rol) si aún no lo sabías
  const rol = leccionRol(p);
  if (rol && !progress.words[rol.wordId]) setTimeout(() => { if (!quiz) teach(p, true); }, 3200);
  checkBadges();
}

function ringDoor(b) {
  if (!b.resident) b.resident = makeHuman(`${W.seed}:residente:${b.num || b.kind}`, ['saludo']);
  b.ring = 5;
  Sfx.tone(880, 0.3, 'sine', 0.1); Sfx.tone(660, 0.4, 'sine', 0.1, 0.3);
  sayBubble(player, 'Ding, dong! 🔔');
  setTimeout(() => {
    const txt = b.shop ? `Hello! Welcome to the ${b.shop.n.en}!` : `Hello! Welcome to house number ${b.num}!`;
    teachFree(conPalabra(L.free('noun', 'welcome', 'bienvenido', txt, b.shop ? `¡Hola! ¡Bienvenido a ${elN(b.shop.n)}!` : `¡Hola! ¡Bienvenido a la casa número ${b.num}!`, '🚪'), 'welcome'));
  }, 600);
  missionEvent('ring', b);
}

let whereState = { key: '', since: 0, said: -99, text: null };
function autoTeach() {
  if (!settings.auto || !started || quiz) return;
  if (lesson && lesson.t < lesson.dur) return;
  if (now - lastLessonEnd < 4) return;
  const c = candidatesNear(player.x, player.y, 240).find(([e]) => e.cd <= now);
  if (c) { teach(c[0], false); return; }
  if (whereState.text && now - whereState.since > 1.5 && now - whereState.said > 40) {
    whereState.said = now;
    const w = whereState.text;
    const l = L.free('prep', w.prepEn, w.prepEs, `You are ${w.en}.`, `Estás ${w.es}.`, '📍');
    if (w.surf && w.surf.palabra && PAL[w.surf.palabra]) l.wordId = palabraId(w.surf.palabra);
    teachFree(l);
  }
}

function interact() {
  if (quiz) return;
  const np = nearestPerson(), nd = nearestDoor();
  if (np && (!nd || Math.hypot(np.x - player.x, np.y - player.y) < Math.abs(nd.doorX - player.x))) { if (np.talkT > 0) { teach(np, true); missionEvent('talk', np); } else talkTo(np); return; }
  if (nd) { ringDoor(nd); return; }
  const c = candidatesNear(player.x, player.y, 340);
  if (c.length) teach(c[0][0], true);
  else if (whereState.text) { const w = whereState.text; teachFree(L.free('prep', w.prepEn, w.prepEs, `You are ${w.en}.`, `Estás ${w.es}.`, '📍')); }
}
function nearestPerson() {
  let best = null, bd = 120;
  [...W.people, ...W.ents.filter(e => e.kind === 'group')].forEach(n => { const d = Math.hypot(n.x - player.x, (n.y - player.y) * 1.5); if (d < bd) { bd = d; best = n; } });
  return best;
}
const nearestDoor = () => W.buildings.find(b => Math.abs(player.x - b.doorX) < 70 && player.y > b.base - 20 && player.y < b.base + 125) || null;

/* ============================================================================
   MISIONES EN CURSO
============================================================================ */
function startMission() {
  if (progress.mi >= TOTAL_MISSIONS) { mission = null; showMissionHud(); return; }
  mission = resolveMission(campaign[progress.mi]);
  if (mission.type === 'quiz') setTimeout(() => { if (mission && mission.type === 'quiz' && !quiz && started) openQuiz(); }, 1400);
  showMissionHud();
  if (mission.autoDone) setTimeout(completeMission, 700);
}

function showMissionHud() {
  if (!mission) {
    $('mNum').textContent = '🏆 Game complete'; $('mChap').textContent = '';
    $('mEn').textContent = 'You completed all 300 missions!'; $('mEs').textContent = '¡Completaste las 300 misiones! Sigue practicando.';
    $('mProg').style.width = '100%';
    return;
  }
  const th = THEME[mission.theme];
  $('mNum').textContent = `🎯 Mission ${progress.mi + 1}/${TOTAL_MISSIONS}`;
  $('mChap').textContent = `${th.icon} Ch. ${mission.chapter}: ${th.name}`;
  $('mEn').textContent = mission.en;
  $('mEs').textContent = mission.es + (mission.type === 'learn' ? ` · ${mission.count}/${mission.need}` : '');
  $('mission').style.borderLeft = `5px solid ${th.color}`;
  $('mProg').style.width = `${Math.min(100, (mission.count / Math.max(1, mission.need)) * 100)}%`;
}

function missionEvent(ev, data) {
  if (!mission || mission.completed) return;
  let hit = false;
  if (ev === 'learn' && mission.type === 'learn' && mission.set.has(data)) { mission.count = mission.ids.filter(id => progress.words[id]).length; showMissionHud(); if (mission.count >= mission.need) completeMission(); return; }
  if (ev === 'quizOk' && mission.type === 'quiz') hit = true;
  if (ev === 'talk' && mission.event === 'talk' && (!mission.rol || data.rol === mission.rol)) hit = true;
  if (ev === 'ring' && mission.event === 'ring' && data === mission.ringTarget) hit = true;
  if (!hit) return;
  mission.count++;
  progress.mp = mission.count;
  showMissionHud();
  if (mission.count >= mission.need) completeMission();
}

function completeMission() {
  if (!mission || mission.completed) return;
  mission.completed = true;
  const ch = mission.chapter;
  progress.mi++;
  progress.mp = 0;
  addXP(50, player.x, player.y - 150);
  Sfx.mission();
  confetti(player.x, player.y - 120);
  const txt = ['Great job!', 'Well done!', 'Excellent!', 'Awesome!', 'Fantastic!', 'Perfect!'][Math.floor(Math.random() * 6)];
  sayBubble(guide, `${txt} Mission complete!`);
  Voice.speak(`${txt} Mission complete!`);
  $('mission').classList.add('done');
  checkBadges();
  saveProgress();
  updateStats();
  if (progress.mi >= TOTAL_MISSIONS) { mission = null; showMissionHud(); setTimeout(showEnding, 1800); return; }
  const next = campaign[progress.mi];
  if (next && next.chapter !== ch) {
    banner(`⭐ Chapter ${ch} complete!`, `¡Capítulo ${ch} completado! +200 XP`);
    addXP(200, player.x, player.y - 190);
  } else if (progress.mi % 10 === 0) banner(`🎯 ${progress.mi} missions!`, `¡Llevas ${progress.mi} misiones!`);
  setTimeout(() => { $('mission').classList.remove('done'); startMission(); if (mission) Voice.speak(mission.en); }, 2600);
}

/* ---------- Quizzes ---------- */
function openQuiz(kind, themeKey, review) {
  const k = kind || mission?.kind || 'mix';
  const tk = themeKey || mission?.theme || 'basics';
  const pool = review ? review.pool : mission?.pool;
  quiz = { kind: k, theme: tk, review: !!review, pool, q: genQuestion(k, tk, pool), answered: false };
  renderQuiz();
}
function renderQuiz() {
  const qz = quiz, q = qz.q;
  $('quiz').classList.remove('hidden');
  $('lesson').classList.add('hidden');
  $('qTitle').textContent = qz.review ? '⚡ Quick review · repaso' : `❓ ${THEME[qz.theme]?.name || 'Quiz'}`;
  $('qCount').textContent = qz.review ? '+15 XP' : mission ? `${mission.count}/${mission.need}` : '';
  $('qText').textContent = q.q;
  $('qEs').textContent = q.qes + (q.tenseName ? ` · ${q.tenseName}` : '');
  const box = $('qOpts');
  box.innerHTML = '';
  q.options.forEach((opt, i) => {
    const b = document.createElement('button');
    b.textContent = opt;
    b.title = `Tecla ${i + 1}`;
    b.addEventListener('click', ev => { ev.stopPropagation(); answer(opt, b); });
    box.appendChild(b);
  });
  if (q.speak) setTimeout(() => Voice.speak(q.speak, q.listen ? 0.75 : undefined), 250);
  else Voice.speak(q.q.replace(/[“”]/g, '').replace(/___/g, 'blank').replace(/🕰️.*$/u, ''));
}
function answer(opt, btn) {
  if (!quiz || quiz.answered) return;
  quiz.answered = true;
  const q = quiz.q, ok = opt === q.correct;
  [...$('qOpts').children].forEach(b => { if (b.textContent === q.correct) b.classList.add('ok'); });
  if (!ok) btn.classList.add('bad');
  if (q.word) { const e = progress.words[q.word.id]; if (e) { if (ok) e[0]++; else e[1]++; } }
  if (ok) { progress.stats.quizOk++; Sfx.ok(); addXP(15, player.x, player.y - 150); Voice.speak(`Correct! ${q.explainEn}`); sayBubble(guide, `Correct! ${q.explainEn}`); }
  else { progress.stats.quizBad++; Sfx.bad(); Voice.speak(`Not quite. ${q.explainEn}`); sayBubble(guide, `Not quite. ${q.explainEn}`); }
  checkBadges();
  saveProgress();
  const wasReview = quiz.review;
  setTimeout(() => {
    $('quiz').classList.add('hidden');
    quiz = null;
    if (ok && !wasReview) missionEvent('quizOk');
    if (!wasReview && mission && mission.type === 'quiz' && !mission.completed) setTimeout(() => { if (!quiz && mission && mission.type === 'quiz' && !mission.completed) openQuiz(); }, 700);
  }, ok ? 1500 : 2800);
}
function openReview() {
  const ids = Object.keys(progress.words);
  if (ids.length < 4) return;
  const weak = ids.filter(id => (progress.words[id][1] || 0) > (progress.words[id][0] || 0));
  const src = weak.length ? weak : ids;
  const w = PALABRAS.byId[src[Math.floor(Math.random() * src.length)]];
  if (!w) return;
  const pool = ids.filter(id => PALABRAS.byId[id].theme === w.theme);
  quiz = { kind: 'mix', theme: w.theme, review: true, pool, q: genQuestion(['meaning', 'say', 'listen'][Math.floor(Math.random() * 3)], w.theme, pool.length >= 4 ? pool : null), answered: false };
  renderQuiz();
}

/* ============================================================================
   XP, NIVELES, LOGROS Y RACHA
============================================================================ */
const xpForLevel = l => 100 + (l - 1) * 45;
function levelInfo() {
  let l = 1, xp = progress.xp;
  while (xp >= xpForLevel(l)) { xp -= xpForLevel(l); l++; }
  return { level: l, into: xp, need: xpForLevel(l) };
}
function addXP(n, x, y) {
  const before = levelInfo().level;
  progress.xp += n;
  floaters.push({ x, y, text: `+${n} XP`, t: 1.4, color: '#f5b700' });
  const after = levelInfo().level;
  if (after > before) {
    Sfx.level();
    banner(`🆙 Level ${after}!`, `¡Subiste al nivel ${after}!`);
    setTimeout(() => Voice.speak(`Level up! You are level ${after}!`), 900);
    confetti(player.x, player.y - 160);
  }
  updateStats();
}
const BADGES = [
  ['w1', '🌱 First word', 'Primera palabra', s => s.words >= 1], ['w10', '📗 10 words', '10 palabras', s => s.words >= 10],
  ['w50', '📘 50 words', '50 palabras', s => s.words >= 50], ['w100', '📙 100 words', '100 palabras', s => s.words >= 100],
  ['w250', '📚 250 words', '250 palabras', s => s.words >= 250], ['w500', '🎓 500 words', '500 palabras', s => s.words >= 500],
  ['w1000', '👑 1000 words', '¡Las 1000 palabras!', s => s.words >= 1000], ['m10', '🎯 10 missions', '10 misiones', s => s.missions >= 10],
  ['m50', '🏹 50 missions', '50 misiones', s => s.missions >= 50], ['m100', '🥉 100 missions', '100 misiones', s => s.missions >= 100],
  ['m200', '🥈 200 missions', '200 misiones', s => s.missions >= 200], ['m300', '🏆 300 missions', '¡Juego completado!', s => s.missions >= 300],
  ['c5', '🔥 Combo x5', 'Combo de 5', s => s.bestCombo >= 5], ['c10', '⚡ Combo x10', 'Combo de 10', s => s.bestCombo >= 10],
  ['q25', '🧠 25 right answers', '25 respuestas correctas', s => s.quizOk >= 25], ['q100', '🧠 100 right answers', '100 respuestas correctas', s => s.quizOk >= 100],
  ['n20', '🦉 Night owl', '20 palabras de noche', s => s.night >= 20], ['r10', '☔ Rain lover', '10 palabras bajo la lluvia', s => s.rain >= 10],
  ['t10', '💬 Chatterbox', 'Habla con 10 personas', s => s.talks >= 10], ['l10', '⭐ Level 10', 'Nivel 10', s => s.level >= 10],
  ['s3', '🔥 3-day streak', 'Racha de 3 días', s => s.streak >= 3], ['s7', '🔥 7-day streak', 'Racha de 7 días', s => s.streak >= 7]
];
const statSnapshot = () => ({ words: Object.keys(progress.words).length, missions: progress.mi, level: levelInfo().level, streak: progress.streak.days, ...progress.stats });
function checkBadges() {
  const s = statSnapshot();
  BADGES.forEach(([id, name, es, cond]) => {
    if (progress.badges.includes(id) || !cond(s)) return;
    progress.badges.push(id);
    setTimeout(() => { toast(`🏅 New badge: ${name} · ${es}`); Sfx.level(); }, 400);
  });
}
function updateStreak() {
  const today = new Date().toISOString().slice(0, 10);
  const st = progress.streak;
  if (st.last === today) return;
  const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  st.days = st.last === y ? st.days + 1 : 1;
  st.last = today;
  saveProgress();
  if (st.days > 1) setTimeout(() => toast(`🔥 ${st.days}-day streak! · ¡Racha de ${st.days} días!`), 2500);
  checkBadges();
}
function updateStats() {
  if (!progress) return;
  const li = levelInfo();
  $('lvl').textContent = `Lv ${li.level}`;
  $('xpTxt').textContent = `${li.into}/${li.need}`;
  $('xpBar').style.width = `${li.into / li.need * 100}%`;
  const n = Object.keys(progress.words).length;
  $('wTxt').textContent = `${n}/${TOTAL_WORDS}`;
  $('wBar').style.width = `${n / TOTAL_WORDS * 100}%`;
  $('mTxt').textContent = `${progress.mi}/${TOTAL_MISSIONS}`;
  $('mBar').style.width = `${progress.mi / TOTAL_MISSIONS * 100}%`;
}
let bannerT = null;
function banner(a, b) {
  const el = $('banner');
  el.innerHTML = `${a}<small>${b}</small>`;
  el.classList.add('show');
  clearTimeout(bannerT);
  bannerT = setTimeout(() => el.classList.remove('show'), 2400);
}
function toast(msg) {
  const el = $('toast'); el.textContent = msg; el.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 2600);
}
function confetti(x, y) {
  for (let i = 0; i < 70; i++) particles.push({ x, y, vx: (Math.random() - 0.5) * 520, vy: -Math.random() * 520 - 150, life: 1.7, c: ['#e74c3c', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'][i % 5], g: 600 });
}
function sparks(x, y, c) {
  for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; particles.push({ x, y, vx: Math.cos(a) * 220, vy: Math.sin(a) * 220, life: 0.5, c, g: 0 }); }
}
function statCards(s) {
  return [['📘', `${s.words}/${TOTAL_WORDS}`, 'palabras'], ['🎯', `${s.missions}/${TOTAL_MISSIONS}`, 'misiones'], ['⭐', s.level, 'nivel'], ['🧠', s.quizOk, 'respuestas correctas'],
    ['🔥', progress.streak.days, 'días de racha'], ['⚡', s.bestCombo, 'mejor combo'], ['🏅', progress.badges.length, 'logros'],
    ['⏱️', `${Math.round(progress.stats.played / 60)} min`, 'jugados']].map(([i, v, l]) => `<div>${i}<b>${v}</b>${l}</div>`).join('');
}
function showEnding() {
  progress.done = true;
  saveProgress();
  $('endStats').innerHTML = statCards(statSnapshot());
  $('ending').classList.remove('hidden');
  Sfx.level();
  confetti(player.x, player.y - 150);
  Voice.speak('Congratulations! You completed the game! You are an English Town champion!');
}
function openAlbum() {
  $('albStats').innerHTML = statCards(statSnapshot());
  $('albBadges').innerHTML = BADGES.map(([id, name, es]) => `<div class="${progress.badges.includes(id) ? 'on' : ''}">${name}<br><small>${es}</small></div>`).join('');
  const box = $('albThemes');
  box.innerHTML = '';
  PALABRAS.themes.forEach(t => {
    const got = t.words.filter(w => progress.words[w.id]).length;
    const d = document.createElement('div');
    d.className = 'theme';
    d.innerHTML = `<div class="th"><span>${t.icon} ${t.name} · ${t.es}</span><span>${got}/${t.words.length}</span></div><div class="bar g"><i style="width:${got / t.words.length * 100}%"></i></div><div class="words"></div>`;
    const ws = d.querySelector('.words');
    t.words.forEach(w => {
      const e = progress.words[w.id];
      const sp = document.createElement('span');
      if (e) {
        sp.textContent = `${w.icon || ''} ${w.en} · ${first(w.es)}`;
        if ((e[0] || 0) > 0) sp.className = 'm';
        sp.addEventListener('click', () => Voice.speak(wordLesson(w).speak));
      } else { sp.textContent = '？？？'; sp.className = 'lock'; }
      ws.appendChild(sp);
    });
    box.appendChild(d);
  });
  $('album').classList.remove('hidden');
}

/* ============================================================================
   SIMULACIÓN
============================================================================ */
function blocked(x, y) {
  if (x < 20 || x > WORLD_W - 20 || y < TOP_Y || y > BOTTOM_Y) return true;
  return W.solids.some(s => s.ellipse ? Math.hypot((x - s.ellipse.x) / (s.ellipse.rx + 8), (y - s.ellipse.y) / (s.ellipse.ry + 8)) < 1 : x > s.x0 && x < s.x1 && y > s.y0 && y < s.y1);
}
const joy = { active: false, sx: 0, sy: 0, x: 0, y: 0 };

function update(dt) {
  now += dt;
  progress.stats.played += dt;
  // Reloj del juego: 1 segundo real = 2 minutos (un día dura 12 minutos)
  const prevH = hourNow();
  clockMin = (clockMin + dt * 2) % 1440;
  if (hourNow() !== prevH) {
    const ph = phaseName();
    if (ph !== lastPhase && started) {
      lastPhase = ph;
      const g = I.greeting(hourNow()), tw = I.timeWords(hourNow(), 0);
      setTimeout(() => { if (!quiz) teachFree(Object.assign(L.free('noun', g[2], g[3], `${g[0]} ${tw.en}`, `${g[1]} ${tw.es}`, isDark() ? '🌙' : '☀️', `${g[2]} = ${g[3]}`), PAL[g[2]] ? { wordId: palabraId(g[2]) } : {})); }, 200);
    }
    if (--weather.left <= 0) {
      const kinds = ['sunny', 'sunny', 'cloudy', 'rainy', 'windy'].filter(k => k !== weather.kind);
      weather = { kind: kinds[Math.floor(Math.random() * kinds.length)], left: 2 + Math.floor(Math.random() * 3) };
      if (started) setTimeout(() => { if (!quiz) { const wx = I.WEATHER[weather.kind]; teachFree(Object.assign(L.free('adj', wx.word, wx.wordEs, wx.en, wx.es, wx.icon), PAL[wx.word] ? { wordId: palabraId(wx.word) } : {})); } }, 3500);
    }
  }
  if (Math.floor(now) !== Math.floor(now - dt)) updateClockHud();

  const pl = player;
  let dx = (keys.right ? 1 : 0) - (keys.left ? 1 : 0), dy = (keys.down ? 1 : 0) - (keys.up ? 1 : 0);
  let run = keys.shift;
  const dpr = window.devicePixelRatio || 1;
  if (joy.active) {
    const jx = joy.x - joy.sx, jy = joy.y - joy.sy, d = Math.hypot(jx, jy);
    if (d > 8 * dpr) { dx = jx / d; dy = jy / d; run = d > 70 * dpr; pl.target = null; }
  }
  if (dx || dy) pl.target = null;
  if (pl.target) {
    const ex = pl.target.x - pl.x, ey = pl.target.y - pl.y, d = Math.hypot(ex, ey);
    if (d < 12) pl.target = null; else { dx = ex / d; dy = ey / d; }
  } else if (dx && dy && !joy.active) { dx *= 0.7071; dy *= 0.7071; }
  const sp = run ? 430 : 220;
  const nx = pl.x + dx * sp * dt, ny = pl.y + dy * sp * 0.78 * dt;
  let mx = false, my = false;
  if (!blocked(nx, pl.y)) { pl.x = nx; mx = dx !== 0; }
  if (!blocked(pl.x, ny)) { pl.y = ny; my = dy !== 0; }
  if (pl.target && !mx && !my) pl.target = null;
  pl.moving = mx || my;
  if (pl.moving) pl.h.walkP.phase += dt * (run ? 16 : 9);

  // Burbujas: al pasar por encima se enseñan (y se quedan donde están)
  for (const o of W.orbs) {
    const dentro = Math.abs(o.x - pl.x) < 46 && Math.abs(o.y - pl.y) < 40;
    if (dentro && !o.dentro && !quiz) teach(o, true);
    o.dentro = dentro;
  }

  // Profesor
  const gx = pl.x - 70, gy = pl.y - 12, gd = Math.hypot(gx - guide.x, gy - guide.y);
  guide.moving = gd > 30;
  if (guide.moving) { const gs = Math.min(gd * 3, run ? 460 : 270); guide.x += (gx - guide.x) / gd * gs * dt; guide.y += (gy - guide.y) / gd * gs * dt; guide.h.walkP.phase += dt * 9; }
  if (gd > 900) { guide.x = gx; guide.y = gy; }
  guide.pointT = Math.max(0, (guide.pointT || 0) - dt);

  // Tráfico
  W.cars.forEach(car => {
    let target = car.speed;
    W.cars.forEach(o => {
      if (o === car || o.row !== car.row || o.lane !== car.lane) return;
      const gap = (o.x - car.x) * car.dir, need = (o.len + car.len) / 2 + 60;
      if (gap > 0 && gap < need * 1.7) target = Math.min(target, gap < need ? 0 : o.cur * 0.9);
    });
    const front = car.x + car.dir * car.len / 2;
    W.ents.forEach(e => {
      if (e.kind !== 'trafficLight' || e.row !== car.row || e.state() === 'green') return;
      const stop = car.dir > 0 ? e.v.x0 - 12 : e.v.x1 + 12, gap = (stop - front) * car.dir;
      if (gap > -8 && gap < 140) target = 0;
    });
    [pl, guide, ...W.people].forEach(b => {
      if (b.y > car.y + 20 || b.y < car.y - 110) return;
      const gap = (b.x - car.x) * car.dir;
      if (gap > 0 && gap < car.len / 2 + 150) target = 0;
    });
    car.cur += (target - car.cur) * Math.min(1, dt * (target < car.cur ? 6 : 1.4));
    car.x += car.dir * car.cur * dt;
    if (car.x > WORLD_W + 400) car.x = -400;
    if (car.x < -400) car.x = WORLD_W + 400;
    car.sortY = car.y;
    if (car.day) { car.day.p.spin += car.cur * dt / (CAR_SCALE * car.geo.r); car.night.p.spin = car.day.p.spin; }
  });

  // Personas
  W.people.forEach(p => {
    p.talkT = Math.max(0, p.talkT - dt);
    if (p.pause > 0) { p.pause -= dt; return; }
    if (p.actKey === 'soccer' && p.roam) {
      if (!p.goal || Math.hypot(p.goal[0] - p.x, p.goal[1] - p.y) < 10) p.goal = [p.roam.x0 + Math.random() * (p.roam.x1 - p.roam.x0), p.roam.y0 + Math.random() * (p.roam.y1 - p.roam.y0)];
      const ex = p.goal[0] - p.x, ey = p.goal[1] - p.y, d = Math.hypot(ex, ey) || 1;
      p.x += ex / d * 90 * dt; p.y += ey / d * 90 * dt; p.dir = ex >= 0 ? 1 : -1; p.h.walkP.phase += dt * 11; p.sortY = p.y;
      return;
    }
    if (!p.move) return;
    const nx2 = p.x + p.dir * p.speed * dt;
    if (nx2 < 250 || nx2 > WORLD_W - 250 || Math.random() < dt * 0.02) p.dir *= -1; else p.x = nx2;
    p.h.walkP.phase += dt * (p.speed > 120 ? 14 : 3 + p.speed * 0.1);
  });
  W.ents.forEach(e => { if (e.kind === 'group') e.talkT = Math.max(0, e.talkT - dt); });
  W.animals.forEach(a => a.update && a.update(dt));
  W.ents.forEach(e => { if (e.update && !W.animals.includes(e)) e.update(dt); });
  W.buildings.forEach(b => { if (b.ring > 0) b.ring -= dt; });

  if (lesson) { lesson.t += dt; if (lesson.t >= lesson.dur) { lesson = null; lastLessonEnd = now; $('lesson').classList.add('hidden'); } }
  bubbles = bubbles.filter(b => (b.t -= dt) > 0);
  floaters = floaters.filter(f => (f.t -= dt) > 0);
  floaters.forEach(f => f.y -= 40 * dt);
  particles = particles.filter(p => (p.life -= dt) > 0);
  particles.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.g * dt; });

  if (Math.floor(now * 4) !== Math.floor((now - dt) * 4)) {
    const w = relationOf(pl.x, pl.y);
    const k = w ? w.en : '';
    if (k !== whereState.key) { whereState.key = k; whereState.since = now; whereState.text = w; }
    if (w) $('where').innerHTML = `📍 <b>You are ${w.en}.</b><br>Estás ${w.es}.`;
    autoTeach();
    if (mission && !mission.completed && mission.check && started && mission.type !== 'learn') { try { if (mission.check()) { mission.count = mission.need; completeMission(); } } catch (err) { console.warn(err); } }
  }
  if (mission) mission.t += dt;
  saveTimer += dt;
  if (saveTimer > 15) { saveTimer = 0; saveProgress(); }

  cam.x += (pl.x - cam.x) * Math.min(1, dt * 5);
  cam.y += (pl.y - 120 - cam.y) * Math.min(1, dt * 5);
}

/* ============================================================================
   DIBUJO
============================================================================ */
const rainDrops = Array.from({ length: 160 }, () => [Math.random(), Math.random(), 0.6 + Math.random() * 0.8]);
function viewScale() {
  const Wc = canvas.width, Hc = canvas.height;
  return Hc / VIEW_H * cam.zoom * (Hc > Wc ? 0.78 : Math.max(1, Math.min(1.25, (Wc / Hc) / 1.4)));
}

function render() {
  const Wc = canvas.width, Hc = canvas.height, dpr = window.devicePixelRatio || 1;
  const scale = viewScale();
  const g = ctx;
  const dark = darkness();
  g.setTransform(1, 0, 0, 1, 0, 0);
  const grass = grassColor();
  g.fillStyle = grass;
  g.fillRect(0, 0, Wc, Hc);
  g.translate(Wc / 2, Hc / 2);
  g.scale(scale, scale);
  g.translate(-cam.x, -cam.y);
  const vl = cam.x - Wc / 2 / scale, vr = cam.x + Wc / 2 / scale, vt = cam.y - Hc / 2 / scale, vb = cam.y + Hc / 2 / scale;

  // Cielo, colinas del fondo y vía del tren
  if (vt < SKY_Y + 60) {
    const sk = skyColors();
    const grd = g.createLinearGradient(0, -2600, 0, SKY_Y);
    grd.addColorStop(0, sk.top); grd.addColorStop(1, sk.bottom);
    g.fillStyle = grd;
    g.fillRect(vl - 10, Math.min(vt, -2600) - 10, vr - vl + 20, SKY_Y - Math.min(vt, -2600) + 10);
    g.fillStyle = Gen.mix('#6fa860', '#1b3322', dark / 0.55);
    g.beginPath(); g.moveTo(vl - 20, SKY_Y + 2);
    for (let x = Math.floor(vl / 40) * 40; x <= vr + 40; x += 40) g.lineTo(x, SKY_Y - 60 - 40 * Math.sin(x / 700) - 25 * Math.sin(x / 260 + 1));
    g.lineTo(vr + 20, SKY_Y + 2); g.fill();
    g.fillStyle = Gen.mix('#8d8d8d', '#3a3a3a', dark / 0.55); g.fillRect(vl - 10, RAIL_Y - 4, vr - vl + 20, 16);
    g.fillStyle = '#6d4c41'; for (let x = Math.floor(vl / 30) * 30; x < vr + 30; x += 30) g.fillRect(x, RAIL_Y - 2, 14, 12);
    g.fillStyle = '#b0bec5'; g.fillRect(vl - 10, RAIL_Y - 1, vr - vl + 20, 3); g.fillRect(vl - 10, RAIL_Y + 7, vr - vl + 20, 3);
  }

  const sidewalk = Gen.mix('#d3cdc2', '#6e6a64', dark), road = Gen.mix('#56575c', '#2a2b30', dark);
  const L0 = vl - 50, Wd = vr - vl + 100;
  W.grounds.forEach(p => {
    if (p.x1 < vl || p.x0 > vr || p.y1 < vt || p.y0 > vb) return;
    g.fillStyle = Gen.mix(p.color || '#8cc271', grass, dark ? 0.5 : 0);
    rrect(g, p.x0, p.y0, p.x1 - p.x0, p.y1 - p.y0, 60); g.fill();
    if (p.cancha) {
      g.strokeStyle = Gen.rgba('#ffffff', 0.8); g.lineWidth = 6;
      g.strokeRect(p.x0 + 50, p.y0 + 150, p.x1 - p.x0 - 100, p.y1 - p.y0 - 250);
      g.beginPath(); g.moveTo(p.lot.cx, p.y0 + 150); g.lineTo(p.lot.cx, p.y1 - 100); g.stroke();
      g.beginPath(); g.arc(p.lot.cx, (p.y0 + p.y1) / 2 + 25, 90, 0, Math.PI * 2); g.stroke();
    } else if (p.camino) {
      g.fillStyle = Gen.mix('#d8c7a2', '#6b604e', dark);
      g.fillRect(p.lot.cx - 30, p.y0 + 40, 60, p.y1 - p.y0 - 40);
    } else if (p.lineas) {
      g.strokeStyle = Gen.rgba('#ffffff', 0.7); g.lineWidth = 4;
      for (let x = p.x0 + 80; x < p.x1 - 40; x += 120) { g.beginPath(); g.moveTo(x, p.y0 + 60); g.lineTo(x, p.y0 + 260); g.stroke(); g.beginPath(); g.moveTo(x, p.y1 - 260); g.lineTo(x, p.y1 - 60); g.stroke(); }
    }
  });
  W.ponds.forEach(p => { if (p.x + p.rx > vl && p.x - p.rx < vr) Draw.pondGround(g, p, now); });
  for (let r = 0; r < ROWS; r++) {
    const b = rowBase(r);
    if (b + SW_B[1] < vt || b + SW_A[0] > vb) continue;
    g.fillStyle = sidewalk; g.fillRect(L0, b + SW_A[0], Wd, SW_A[1] - SW_A[0]); g.fillRect(L0, b + SW_B[0], Wd, SW_B[1] - SW_B[0]);
    g.fillStyle = road; g.fillRect(L0, b + ROAD[0], Wd, ROAD[1] - ROAD[0]);
    g.fillStyle = Gen.shade(sidewalk, -0.25); g.fillRect(L0, b + ROAD[0] - 3, Wd, 7); g.fillRect(L0, b + ROAD[1] - 4, Wd, 7);
    g.strokeStyle = '#f2c94c'; g.lineWidth = 6; g.setLineDash([70, 55]);
    g.beginPath(); g.moveTo(Math.floor(L0 / 125) * 125, b + 295); g.lineTo(vr + 150, b + 295); g.stroke(); g.setLineDash([]);
  }
  vstreets.forEach(v => {
    if (v.x1 + 40 < vl || v.x0 - 40 > vr) return;
    const y0 = rowBase(0) + ROAD[0], y1 = LAST_ROAD_END - (SW_B[1] - ROAD[1]);
    g.fillStyle = sidewalk; g.fillRect(v.x0 - 40, y0, VS_W + 80, y1 - y0);
    g.fillStyle = road; g.fillRect(v.x0, y0, VS_W, y1 - y0);
    g.strokeStyle = '#f2c94c'; g.lineWidth = 6; g.setLineDash([60, 50]);
    g.beginPath(); g.moveTo(v.x0 + VS_W / 2, y0); g.lineTo(v.x0 + VS_W / 2, y1); g.stroke(); g.setLineDash([]);
  });
  g.fillStyle = Gen.rgba('#ffffff', 0.9);
  W.crossings.forEach(c => { if (c.x1 > vl && c.x0 < vr) for (let x = c.x0; x < c.x1 - 10; x += 36) g.fillRect(x, c.y0, 18, c.y1 - c.y0); });
  // Playa y mar
  if (vb > SAND_Y0) {
    g.fillStyle = Gen.mix('#f1dca7', '#6d6250', dark); g.fillRect(vl - 10, SAND_Y0, vr - vl + 20, SEA_Y - SAND_Y0 + 20);
    const grd = g.createLinearGradient(0, SEA_Y, 0, SEA_END);
    grd.addColorStop(0, Gen.mix('#4fb3e0', '#12324a', dark)); grd.addColorStop(1, Gen.mix('#1a5f8f', '#081a2a', dark));
    g.fillStyle = grd; g.fillRect(vl - 10, SEA_Y, vr - vl + 20, Math.max(0, vb - SEA_Y + 20));
    g.strokeStyle = 'rgba(255,255,255,0.75)'; g.lineWidth = 4; g.beginPath();
    for (let x = Math.floor(vl / 30) * 30; x < vr + 30; x += 30) g.lineTo(x, SEA_Y + 4 + Math.sin(x / 40 + now * 2) * 5);
    g.stroke();
  }

  const ents = [];
  const vis = b => !(b.x + b.w < vl - 300 || b.x > vr + 300 || b.y + b.h < vt - 200 || b.y > vb + 300);
  W.ents.forEach(e => { if (!e.noDraw && e.draw && vis(e.box())) ents.push(e); });
  ents.push({ sortY: guide.y, draw: () => drawGuide(g) });
  ents.push({ sortY: player.y + 0.1, draw: () => drawPlayer(g) });
  ents.sort((a, b) => a.sortY - b.sortY).forEach(e => e.draw(g, now));
  if (settings.etiquetas) dibujarEtiquetas(g, vl, vr, vt, vb);

  if (dark > 0) {
    g.fillStyle = `rgba(10, 18, 45, ${dark})`;
    g.fillRect(vl - 10, vt - 10, vr - vl + 20, vb - vt + 20);
    if (isDark()) {
      g.globalCompositeOperation = 'lighter';
      W.winLights.forEach(wl => { if (wl.x > vl - 100 && wl.x < vr && wl.y > vt - 100 && wl.y < vb) { g.fillStyle = 'rgba(255, 196, 90, 0.55)'; g.fillRect(wl.x, wl.y, wl.w, wl.h); } });
      W.lights.forEach(l => {
        if (l.x < vl - 200 || l.x > vr + 200 || l.y < vt - 300 || l.y > vb + 300) return;
        const grd = g.createRadialGradient(l.x, l.y, 0, l.x, l.y, 210);
        grd.addColorStop(0, 'rgba(255, 210, 120, 0.4)'); grd.addColorStop(1, 'rgba(255, 210, 120, 0)');
        g.fillStyle = grd; g.fillRect(l.x - 210, l.y - 210, 420, 420);
      });
      g.globalCompositeOperation = 'source-over';
    }
  } else if (clockMin / 60 > 16.5 && clockMin / 60 < 18) {
    g.fillStyle = `rgba(255, 140, 60, ${(clockMin / 60 - 16.5) / 1.5 * 0.12})`;
    g.fillRect(vl - 10, vt - 10, vr - vl + 20, vb - vt + 20);
  }
  if (weather.kind === 'cloudy' || weather.kind === 'rainy') {
    g.fillStyle = `rgba(60, 70, 90, ${weather.kind === 'rainy' ? 0.18 : 0.1})`;
    g.fillRect(vl - 10, vt - 10, vr - vl + 20, vb - vt + 20);
  }

  if (lesson && lesson.ent && lesson.t < lesson.dur && lesson.ent.box) drawPointer(g, lesson);
  if (mission && !mission.completed && mission.target && mission.t > 6) {
    const tg = mission.target();
    if (tg) {
      const ang = Math.atan2(tg.y - player.y, tg.x - player.x), dist = Math.hypot(tg.x - player.x, tg.y - player.y);
      if (dist > 140) {
        g.save(); g.translate(player.x + Math.cos(ang) * 95, player.y - 50 + Math.sin(ang) * 95); g.rotate(ang);
        g.fillStyle = THEME[mission.theme].color; g.globalAlpha = 0.9;
        g.beginPath(); g.moveTo(22, 0); g.lineTo(-12, -15); g.lineTo(-4, 0); g.lineTo(-12, 15); g.closePath(); g.fill();
        g.strokeStyle = '#fff'; g.lineWidth = 3; g.stroke(); g.restore();
      }
    }
  }
  drawBubbles(g);
  g.font = 'bold 26px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  floaters.forEach(f => { g.globalAlpha = Math.min(1, f.t * 1.5); g.lineWidth = 5; g.strokeStyle = 'rgba(0,0,0,.5)'; g.strokeText(f.text, f.x, f.y); g.fillStyle = f.color; g.fillText(f.text, f.x, f.y); });
  g.globalAlpha = 1;
  particles.forEach(p => { g.fillStyle = p.c; g.globalAlpha = Math.min(1, p.life * 2); g.fillRect(p.x, p.y, 10, 6); });
  g.globalAlpha = 1;

  g.setTransform(1, 0, 0, 1, 0, 0);
  if (weather.kind === 'rainy') {
    g.strokeStyle = 'rgba(200, 220, 255, 0.55)'; g.lineWidth = 1.5 * dpr;
    g.beginPath();
    rainDrops.forEach(d => { const y = ((d[1] + now * d[2] * 1.2) % 1) * Hc, x = d[0] * Wc; g.moveTo(x, y); g.lineTo(x - 6 * dpr, y + 18 * dpr); });
    g.stroke();
  } else if (weather.kind === 'windy') {
    g.fillStyle = 'rgba(120, 170, 80, 0.8)';
    rainDrops.slice(0, 30).forEach(d => { const x = ((d[0] + now * d[2] * 0.35) % 1) * Wc, y = d[1] * Hc + Math.sin(now * 3 + d[0] * 10) * 20; g.beginPath(); g.ellipse(x, y, 6 * dpr, 3 * dpr, now + d[0] * 6, 0, Math.PI * 2); g.fill(); });
  }
  drawJoystick(dpr);
  drawMinimap(Wc, Hc, dpr);
}

// Etiqueta con la palabra debajo de las cosas que ya descubriste (solo cerca de ti)
function dibujarEtiquetas(g, vl, vr, vt, vb) {
  g.font = 'bold 13px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  W.ents.forEach(e => {
    if (e.kind === 'orb' || e.lejos || !e.palabras || !e.palabras.length) return;
    if (!['objeto', 'parte', 'person', 'group'].includes(e.kind)) return;
    if (Math.abs(e.x - player.x) > 520 || Math.abs(e.y - player.y) > 420) return;
    const ids = e.palabras.filter(id => progress.words[id]);
    if (!ids.length) return;
    const pal = e.kind === 'person' || e.kind === 'group' ? PALABRAS.byId[ids[0]].en : PALABRAS.byId[e.palabras[0]] && progress.words[e.palabras[0]] ? PALABRAS.byId[e.palabras[0]].en : null;
    if (!pal) return;
    const b = e.box();
    const x = b.x + b.w / 2, y = e.kind === 'parte' ? b.y + b.h + 9 : Math.min(b.y + b.h, e.y) + 12;
    const w = g.measureText(pal).width + 12;
    g.fillStyle = 'rgba(255,255,255,0.88)'; rrect(g, x - w / 2, y - 9, w, 18, 9); g.fill();
    g.fillStyle = '#2f7d4f'; g.fillText(pal, x, y + 0.5);
  });
}

function drawGuide(g) {
  const pointing = guide.pointT > 0 && lesson && lesson.ent;
  drawHuman(g, guide.h, guide.x, guide.y, { moving: guide.moving && !pointing, pose: pointing ? 'saludo' : 'de pie' });
  Draw.cap(g, guide.x, guide.y - HUMAN_H * 1.13);
  g.font = 'bold 15px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = 'rgba(255,255,255,0.9)'; rrect(g, guide.x - 36, guide.y + 8, 72, 20, 10); g.fill();
  g.fillStyle = '#2f7d4f'; g.fillText('Teacher', guide.x, guide.y + 18);
}
function drawPlayer(g) {
  drawHuman(g, player.h, player.x, player.y, { moving: player.moving });
  const top = player.y - HUMAN_H * 1.22 + Math.sin(now * 5) * 4;
  g.fillStyle = '#ff4d6d';
  g.beginPath(); g.moveTo(player.x - 11, top - 22); g.lineTo(player.x + 11, top - 22); g.lineTo(player.x, top - 6); g.closePath(); g.fill();
  g.font = 'bold 15px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = 'rgba(255,255,255,0.9)'; rrect(g, player.x - 22, player.y + 8, 44, 20, 10); g.fill();
  g.fillStyle = '#c2185b'; g.fillText('You', player.x, player.y + 18);
  if (combo >= 2 && now - lastCollectT < 8) { g.fillStyle = '#ff6b6b'; g.font = 'bold 18px system-ui, sans-serif'; g.fillText(`🔥 x${combo}`, player.x + 40, top - 12); }
}
function drawPointer(g, l) {
  const b = l.ent.box(), pulse = 0.5 + 0.5 * Math.sin(now * 6);
  const color = l.theme ? l.theme.color : (CATS[l.cat] || CATS.noun).color;
  g.save(); g.strokeStyle = color; g.lineWidth = 5 + pulse * 3; g.shadowColor = color; g.shadowBlur = 18;
  rrect(g, b.x - 10, b.y - 10, b.w + 20, b.h + 20, 16); g.stroke(); g.restore();
  if (!l.ent.lejos) {
    const hx = guide.x + 27, hy = guide.y - 112, tx = b.x + b.w / 2, ty = b.y + b.h / 2;
    g.save(); g.strokeStyle = color; g.lineWidth = 3; g.setLineDash([12, 10]); g.lineDashOffset = -now * 40;
    g.beginPath(); g.moveTo(hx, hy); g.lineTo(tx, ty); g.stroke(); g.restore();
  }
  const text = `${l.icon || ''} ${l.word}`;
  g.font = 'bold 26px system-ui, sans-serif';
  const w = g.measureText(text).width + 30, ly = b.y - 34, tx = b.x + b.w / 2;
  g.fillStyle = color; rrect(g, tx - w / 2, ly - 22, w, 40, 20); g.fill();
  g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, tx, ly - 1);
}
function drawBubbles(g) {
  g.font = '600 20px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  bubbles.forEach(bb => {
    const x = bb.who.x, y = bb.who.y - HUMAN_H * 1.3 - 40;
    const lines = wrap(g, bb.text, 330);
    const w = Math.max(...lines.map(s => g.measureText(s).width)) + 28, h = lines.length * 24 + 16;
    g.globalAlpha = Math.min(1, bb.t * 2);
    g.fillStyle = '#ffffff'; g.strokeStyle = '#2a2a2a'; g.lineWidth = 2.5;
    rrect(g, x - w / 2, y - h, w, h, 14); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(x - 8, y - 1); g.lineTo(x, y + 14); g.lineTo(x + 8, y - 1); g.fill();
    g.fillStyle = '#1f2421';
    lines.forEach((s, i) => g.fillText(s, x, y - h + 20 + i * 24));
    g.globalAlpha = 1;
  });
}
function wrap(g, text, maxW) {
  const words = text.split(' '), lines = [];
  let cur = '';
  words.forEach(wd => { const t = cur ? cur + ' ' + wd : wd; if (g.measureText(t).width > maxW && cur) { lines.push(cur); cur = wd; } else cur = t; });
  if (cur) lines.push(cur);
  return lines;
}
function drawJoystick(dpr) {
  if (!joy.active) return;
  const g = ctx;
  g.fillStyle = 'rgba(255,255,255,0.18)'; g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 3 * dpr;
  g.beginPath(); g.arc(joy.sx, joy.sy, 60 * dpr, 0, Math.PI * 2); g.fill(); g.stroke();
  const dx = joy.x - joy.sx, dy = joy.y - joy.sy, d = Math.hypot(dx, dy), k = d > 60 * dpr ? 60 * dpr / d : 1;
  g.fillStyle = 'rgba(255,255,255,0.75)';
  g.beginPath(); g.arc(joy.sx + dx * k, joy.sy + dy * k, 26 * dpr, 0, Math.PI * 2); g.fill();
}
const MAP_Y0 = TOP_Y - 200, MAP_Y1 = SEA_Y + 300;
function minimapRect(Wc, Hc, dpr) {
  const small = Wc < 760 * dpr;
  const w = small ? 110 * dpr : Math.min(230 * dpr, Wc * 0.2), h = w * (MAP_Y1 - MAP_Y0) / WORLD_W;
  return { x: Wc - w - 10 * dpr, y: Hc - h - (small ? 12 : 14) * dpr, w, h, small };
}
function drawMinimap(Wc, Hc, dpr) {
  const g = ctx;
  const m = minimapRect(Wc, Hc, dpr);
  if (m.small && (!$('lesson').classList.contains('hidden') || !$('quiz').classList.contains('hidden'))) return;
  const sx = m.w / WORLD_W;
  const X = x => m.x + x * sx, Y = y => m.y + (y - MAP_Y0) * sx;
  g.fillStyle = 'rgba(20,24,22,0.6)'; rrect(g, m.x - 4, m.y - 4, m.w + 8, m.h + 8, 8); g.fill();
  g.fillStyle = '#5f8f55'; g.fillRect(m.x, m.y, m.w, m.h);
  g.fillStyle = '#e9d8a6'; g.fillRect(m.x, Y(SAND_Y0), m.w, (SEA_Y - SAND_Y0) * sx);
  g.fillStyle = '#3d8fc4'; g.fillRect(m.x, Y(SEA_Y), m.w, (MAP_Y1 - SEA_Y) * sx);
  g.fillStyle = '#555';
  for (let r = 0; r < ROWS; r++) g.fillRect(m.x, Y(rowBase(r) + ROAD[0]), m.w, (ROAD[1] - ROAD[0]) * sx);
  vstreets.forEach(v => g.fillRect(X(v.x0), Y(rowBase(0) + ROAD[0]), VS_W * sx, (rowBase(ROWS - 1) - rowBase(0) + ROAD[1] - ROAD[0]) * sx));
  W.grounds.forEach(p => { g.fillStyle = p.color || '#8fce7a'; g.fillRect(X(p.x0), Y(p.y0), (p.x1 - p.x0) * sx, (p.y1 - p.y0) * sx); });
  W.buildings.forEach(b => { g.fillStyle = b.shop ? '#f6c667' : '#e9d8a6'; g.fillRect(X(b.x0), Y(b.base - 380), (b.x1 - b.x0) * sx, 380 * sx); });
  if (mission && mission.type === 'learn') {
    g.fillStyle = '#ffd400';
    mission.ids.forEach(id => { if (progress.words[id]) return; (W.porPalabra[id] || []).forEach(e => { if (!e.lejos) g.fillRect(X(e.x) - 1.5 * dpr, Y(e.y) - 1.5 * dpr, 3 * dpr, 3 * dpr); }); });
  } else if (mission && !mission.completed && mission.target) {
    const t = mission.target();
    if (t) { g.fillStyle = '#ffd400'; g.font = `${14 * dpr}px system-ui`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('★', X(t.x), Y(t.y)); }
  }
  g.fillStyle = '#ff4d6d'; g.beginPath(); g.arc(X(player.x), Y(player.y), 4 * dpr, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#fff'; g.lineWidth = 1.5 * dpr; g.stroke();
}

/* ============================================================================
   INICIO, ENTRADA Y BUCLE
============================================================================ */
function newWorld(seed, announce) {
  W = genWorld(seed);
  if (W.avisos.length) console.warn('[English Town]', W.avisos);
  progress.seed = seed;
  const plazaLot = W.lots.find(l => l.type === 'plaza');
  let px = plazaLot ? plazaLot.cx : 900, py = plazaLot ? plazaLot.base + 95 : 100;
  if (!announce && Array.isArray(progress.pos) && !blocked(progress.pos[0], progress.pos[1])) [px, py] = progress.pos;
  player = { h: makeHuman(`${seed}:jugador`, ['de pie']), x: px, y: py, moving: false, target: null };
  guide = { h: makeHuman('english-teacher', ['de pie', 'saludo'], { hair: 'corto', glasses: 'redondas', beard: 'ninguna', top: 'suéter', bottom: 'pantalón', randomColors: false, skinColor: '#c68642', hairColor: '#2a2f4a', topColor: '#2f7d4f', bottomColor: '#34495e', smile: 0.8 }), x: px - 70, y: py - 12, pointT: 0 };
  cam.x = px; cam.y = py - 120;
  lesson = null; bubbles = []; lastLessonEnd = now;
  $('lesson').classList.add('hidden');
  saveProgress();
  startMission();
  if (announce) teachFree(L.free('noun', 'town', 'pueblo', "Welcome to a new town! Let's explore!", '¡Bienvenido a un pueblo nuevo! ¡Vamos a explorar!', '🌎'));
}

function resize() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
}
let lastT = performance.now();
function frame(t) {
  const dt = Math.min(0.05, (t - lastT) / 1000);
  lastT = t;
  if (W) { update(dt); render(); }
  requestAnimationFrame(frame);
}
function begin() {
  if (started || !W) return;
  started = true;
  $('help').classList.add('hidden');
  Voice.pick();
  updateStreak();
  const n = Object.keys(progress.words).length;
  teachFree(n
    ? L.free('noun', 'welcome back', 'bienvenido de nuevo', `Welcome back! You know ${n} words. Let's continue!`, `¡Bienvenido de nuevo! Conoces ${n} palabras. ¡Sigamos!`, '👋')
    : conPalabra(L.free('noun', 'hello', 'hola', "Hello! I'm your teacher. Let's learn English together!", '¡Hola! Soy tu profesor. ¡Aprendamos inglés juntos!', '👋'), 'hello'));
  lastPhase = phaseName();
  setTimeout(() => { if (mission) { Voice.speak(mission.en); if (mission.type === 'quiz' && !quiz) openQuiz(); } }, 4200);
  if (progress.mi >= TOTAL_MISSIONS && !progress.done) setTimeout(showEnding, 1000);
  canvas.focus();
}

const KEYMAP = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ShiftLeft: 'shift', ShiftRight: 'shift' };
document.addEventListener('keydown', e => {
  if (!started) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); begin(); } return; }
  if (KEYMAP[e.code]) { keys[KEYMAP[e.code]] = true; e.preventDefault(); return; }
  if (e.repeat) return;
  const k = e.code;
  if (quiz && /^(Digit|Numpad)[1-4]$/.test(k)) { const b = $('qOpts').children[+k.slice(-1) - 1]; if (b) b.click(); return; }
  if (k === 'KeyE' || k === 'Enter') interact();
  else if (k === 'KeyR' || k === 'Space') { e.preventDefault(); if (quiz && quiz.q.speak) Voice.speak(quiz.q.speak, 0.75); else if (lastSpoken) Voice.speak(lastSpoken); }
  else if (k === 'KeyL') { settings.slow = !settings.slow; toast(settings.slow ? '🐢 Voz lenta' : '🐇 Voz normal'); }
  else if (k === 'KeyT') { settings.auto = !settings.auto; toast(settings.auto ? 'El profesor enseña solo: sí' : 'El profesor enseña solo: no (usa E)'); }
  else if (k === 'KeyM') toggleMute();
  else if (k === 'KeyN') toggleEtiquetas();
  else if (k === 'KeyV') { if ($('album').classList.contains('hidden')) openAlbum(); else $('album').classList.add('hidden'); }
  else if (k === 'KeyH') $('help').classList.toggle('hidden');
  else if (k === 'KeyC') tellTime();
  else if (e.key === '+' || k === 'Equal' || k === 'NumpadAdd') cam.zoom = Math.min(2.2, cam.zoom * 1.15);
  else if (e.key === '-' || k === 'Minus' || k === 'NumpadSubtract') cam.zoom = Math.max(0.4, cam.zoom / 1.15);
  else if (k === 'Escape') { $('album').classList.add('hidden'); $('help').classList.add('hidden'); }
});
document.addEventListener('keyup', e => { if (KEYMAP[e.code]) keys[KEYMAP[e.code]] = false; });
window.addEventListener('blur', () => { Object.keys(keys).forEach(k => keys[k] = false); joy.active = false; saveProgress(); if (window.AbuProgreso) AbuProgreso.guardarYa(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) saveProgress(); });
window.addEventListener('pagehide', saveProgress);

function toggleMute() { settings.mute = !settings.mute; if (settings.mute && Voice.ok) speechSynthesis.cancel(); $('btnMute').textContent = settings.mute ? '🔇' : '🔊'; toast(settings.mute ? '🔇 Sonidos apagados' : '🔊 Sonidos encendidos'); }
function toggleEtiquetas() { settings.etiquetas = !settings.etiquetas; $('btnTags').classList.toggle('off', !settings.etiquetas); toast(settings.etiquetas ? '🏷️ Etiquetas: se ven las palabras que ya descubriste' : '🏷️ Etiquetas ocultas'); }

function screenToWorld(px, py) {
  const scale = viewScale();
  return { x: (px - canvas.width / 2) / scale + cam.x, y: (py - canvas.height / 2) / scale + cam.y };
}
// Arrastrar = joystick (en cualquier parte); toque corto = caminar, hablar o aprender
let press = null;
canvas.addEventListener('pointerdown', ev => {
  if (!started) { begin(); return; }
  canvas.focus();
  const dpr = window.devicePixelRatio || 1;
  press = { id: ev.pointerId, x: ev.clientX * dpr, y: ev.clientY * dpr, moved: false };
  try { canvas.setPointerCapture(ev.pointerId); } catch { /* nada */ }
});
canvas.addEventListener('pointermove', ev => {
  if (!press || ev.pointerId !== press.id) return;
  const dpr = window.devicePixelRatio || 1, x = ev.clientX * dpr, y = ev.clientY * dpr;
  if (!press.moved && Math.hypot(x - press.x, y - press.y) > 14 * dpr) { press.moved = true; joy.active = true; joy.sx = press.x; joy.sy = press.y; }
  if (joy.active) { joy.x = x; joy.y = y; }
});
function endPress(ev) {
  if (!press || ev.pointerId !== press.id) return;
  const wasTap = !press.moved, { x, y } = press;
  joy.active = false;
  press = null;
  if (!wasTap || !W) return;
  const dpr = window.devicePixelRatio || 1, m = minimapRect(canvas.width, canvas.height, dpr);
  if (x > m.x && x < m.x + m.w && y > m.y && y < m.y + m.h) {
    const wx = (x - m.x) / (m.w / WORLD_W), wy = (y - m.y) / (m.w / WORLD_W) + MAP_Y0;
    player.target = { x: wx, y: Math.max(TOP_Y, Math.min(BOTTOM_Y, wy)) };
    return;
  }
  const p = screenToWorld(x, y);
  const inBox = e => { const b = e.box(); return p.x > b.x && p.x < b.x + b.w && p.y > b.y && p.y < b.y + b.h; };
  const persona = [...W.people, ...W.ents.filter(e => e.kind === 'group')].find(q => inBox(q));
  if (persona) {
    const cerca = Math.hypot(persona.x - player.x, persona.y - player.y) < 400;
    if (cerca && persona.talkT <= 0) talkTo(persona); else { teach(persona, true); if (cerca) missionEvent('talk', persona); }
    player.target = { x: persona.x + (player.x < persona.x ? -70 : 70), y: persona.y };
    return;
  }
  const orb = W.orbs.find(o => Math.hypot(p.x - o.x, p.y - (o.y - 34)) < 42);
  if (orb) { teach(orb, true); player.target = { x: orb.x + (player.x < orb.x ? -60 : 60), y: orb.y }; return; }
  const hits = W.ents.filter(e => e.lessons && e.kind !== 'person' && e.kind !== 'orb' && inBox(e)).sort((a, b) => {
    const A = a.box(), B = b.box(); return (a.lejos ? 1e9 : 0) + A.w * A.h - ((b.lejos ? 1e9 : 0) + B.w * B.h);
  });
  const hit = hits[0];
  if (hit) {
    if (hit.kind === 'door' && Math.hypot(hit.x - player.x, hit.y - player.y) < 500) ringDoor(hit.building);
    else { teach(hit, true); Sfx.touch(); }
  }
  if (!hit || !hit.lejos) player.target = { x: p.x, y: hit && hit.y > p.y ? Math.min(hit.y + 25, BOTTOM_Y) : Math.max(TOP_Y, Math.min(BOTTOM_Y, p.y)) };
}
canvas.addEventListener('pointerup', endPress);
canvas.addEventListener('pointercancel', () => { press = null; joy.active = false; });
canvas.addEventListener('wheel', ev => { ev.preventDefault(); cam.zoom = Math.max(0.4, Math.min(2.2, cam.zoom * (ev.deltaY < 0 ? 1.1 : 1 / 1.1))); }, { passive: false });
document.addEventListener('gesturestart', e => e.preventDefault());

$('btnRandom').addEventListener('click', ev => {
  ev.stopPropagation();
  if (!started) begin();
  if (!confirm('¿Crear un pueblo nuevo? Tus palabras y misiones se conservan; solo cambia el lugar de las cosas.')) return;
  $('loading').style.display = 'flex';
  setTimeout(() => { newWorld(Gen.randomSeed(), true); $('loading').style.display = 'none'; toast('🎲 ¡Pueblo nuevo! Tu progreso se mantiene.'); canvas.focus(); }, 30);
});
$('btnMute').addEventListener('click', ev => { ev.stopPropagation(); toggleMute(); });
$('btnTags').addEventListener('click', ev => { ev.stopPropagation(); toggleEtiquetas(); });
$('btnHelp').addEventListener('click', ev => { ev.stopPropagation(); $('help').classList.remove('hidden'); });
$('lesson').addEventListener('click', ev => {
  if (ev.target.id === 'lWord' && lesson) Voice.speak(lesson.word, 0.6);
  else if (lesson) Voice.speak(lesson.speak || lesson.en);
  else if (lastSpoken) Voice.speak(lastSpoken);
  if (lesson) lesson.t = Math.min(lesson.t, 2);
});
$('where').addEventListener('click', () => { const w = whereState.text; if (w) Voice.speak(`You are ${w.en}.`); });
$('mission').addEventListener('click', () => { if (mission) { Voice.speak(mission.en); if (mission.type === 'quiz' && !quiz) openQuiz(); } });
$('clock').addEventListener('click', tellTime);
$('stats').addEventListener('click', openAlbum);
$('btnAlbumClose').addEventListener('click', () => $('album').classList.add('hidden'));
$('album').addEventListener('pointerdown', ev => { if (ev.target === $('album')) $('album').classList.add('hidden'); });
$('title').addEventListener('click', () => $('help').classList.remove('hidden'));
$('btnStart').addEventListener('click', () => { if (!started) begin(); else $('help').classList.add('hidden'); });
$('help').addEventListener('pointerdown', ev => { if (ev.target === $('help')) { if (!started) begin(); else $('help').classList.add('hidden'); } });
$('btnKeep').addEventListener('click', () => $('ending').classList.add('hidden'));
$('btnRestart').addEventListener('click', () => {
  if (!confirm('¿Borrar todo el progreso del juego y empezar de nuevo?')) return;
  progress = normalizarProgreso({ seed: progress.seed });
  saveProgress();
  if (window.AbuProgreso) AbuProgreso.guardarYa();
  setTimeout(() => location.reload(), 400);
});
$('helpCats').innerHTML = Object.values(CATS).map(c => `<span class="chip" style="background:${c.color}">${c.name} · ${c.es}</span>`).join('');

window.addEventListener('resize', resize);
resize();

/* ---------- Arranque: sesión de Abulingo y avance guardado en Supabase ---------- */
(async () => {
  let datos = null;
  try {
    const r = await AbuProgreso.iniciar({ app: 'mundo_ingles' });
    if (!r) return;   // sin sesión: ya se redirigió al inicio de sesión
    datos = r.datos;
  } catch (e) {
    console.warn('[English Town] no se pudo cargar el avance:', e);
  }
  progress = normalizarProgreso(datos);
  clockMin = progress.clock ?? 8 * 60;
  campaign = buildCampaign();
  updateStats();
  updateClockHud();
  $('loadingTxt').textContent = '🌎 Building English Town…';
  setTimeout(() => {
    const seed0 = new URLSearchParams(location.hash.slice(1)).get('seed') || progress.seed || Gen.randomSeed();
    newWorld(seed0, false);
    $('loading').style.display = 'none';
    requestAnimationFrame(frame);
  }, 30);
})();
