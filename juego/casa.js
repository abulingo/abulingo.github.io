'use strict';

// Generador de casas: expone build(params, rand) y la configuración de su página.
const Casa = (() => {

  const WALLS = ['#f4e3c1', '#e8d5b7', '#c9e4de', '#f7d9c4', '#dfe7fd', '#f2f2f2', '#e9c46a', '#b5838d', '#a3b18a', '#e76f51', '#ffe5b4', '#cdb4db'];
  const ROOFS = ['#8d3b2e', '#5a3e36', '#3d405b', '#6b705c', '#9c4a1a', '#2f3e46', '#7f5539', '#4a4e69'];
  const DOORS = ['#6b2d1f', '#2a6f97', '#bc4749', '#386641', '#ffb703', '#3d405b', '#7b2cbf', '#8c5a3c'];
  const TRIMS = ['#ffffff', '#f8f4e3', '#e0e0e0', '#3a3a3a'];
  const ROOF_TYPES = ['dos aguas', 'cuatro aguas', 'plano', 'mansarda'];
  const SKIES = {
    'día':       { top: '#5fa8d3', bottom: '#cfe8f5', grass: '#7cb461', glass: ['#bfe3f2', '#7fb3cc'] },
    'atardecer': { top: '#6a4c93', bottom: '#f6a55c', grass: '#6b8f4e', glass: ['#ffd29a', '#e38b5a'] },
    'noche':     { top: '#0b1320', bottom: '#243b55', grass: '#24402a', glass: ['#ffe08a', '#f2a93b'] }
  };
  const orRandom = (v, list, R) => v === 'aleatorio' ? R.pick(list) : v;
  const yesNo = (v, prob, R) => v === 'aleatorio' ? R.chance(prob) : v === 'sí';

  // Mismo método recursivo del generador de árboles (index.html)
  function fractalTree(R, x, y, len, depth) {
    const levels = Array.from({ length: depth }, () => []);
    const tips = [];
    const pi = Math.PI;
    function tree(x, y, angle, d, l) {
      const x2 = x + Math.cos(angle * (pi / 180) - pi / 2) * l;
      const y2 = y + Math.sin(angle * (pi / 180) - pi / 2) * l;
      levels[depth - d].push(x, y, x2, y2);
      if (d === 1) { tips.push(x2, y2); return; }
      const next = a => { if (R() > 0.1) tree(x2, y2, a, d - 1, l / (1.25 + R() * 0.45)); };
      next(angle - 60 / (1.5 + R() * 2.5));
      next(angle + 60 / (1.5 + R() * 2.5));
      next(angle / (1.5 + R() * 2.5));
    }
    tree(x, y, 0, depth, len);
    const leaves = [];
    for (let i = 0; i < tips.length; i += 2) leaves.push(tips[i] + R.sym(8), tips[i + 1] + R.sym(8), R.range(6, 12), R.int(0, 3));
    return { levels, leaves };
  }

  function build(p, R) {
    const v = p.variation;
    const time = orRandom(p.time, Object.keys(SKIES), R);
    const sky = SKIES[time];
    const night = time === 'noche';
    const wall = p.randomColors ? R.pick(WALLS) : p.wallColor;
    const roof = p.randomColors ? R.pick(ROOFS) : p.roofColor;
    const door = p.randomColors ? R.pick(DOORS) : p.doorColor;
    const trim = p.randomColors ? R.pick(TRIMS) : p.trimColor;
    const roofType = orRandom(p.roof, ROOF_TYPES, R);
    const texture = orRandom(p.wallTexture, ['liso', 'ladrillo', 'tablas'], R);
    const hasGarage = yesNo(p.garage, 0.4, R);
    const hasChimney = roofType !== 'plano' && yesNo(p.chimney, 0.6, R);
    const hasFence = yesNo(p.fence, 0.5, R);

    const groundY = 640;
    const floors = Math.round(p.floors);
    const W = 460 * p.width * (1 + R.sym(0.06 * v));
    const floorH = 150 * (1 + R.sym(0.06 * v));
    const gW = hasGarage ? 200 : 0;
    const x0 = 500 - (W + gW) / 2, x1 = x0 + W;
    const cx = x0 + W / 2;
    const wallTop = groundY - floors * floorH;
    const rh = W * 0.32 * p.roofPitch * (1 + R.sym(0.1 * v));
    const o = 28;

    const slots = Math.round(p.windows);
    const doorSlot = R.int(0, slots - 1);
    const winStyle = R.pick(['cruz', 'arco', 'simple', 'cruz']);
    const shutters = R.chance(0.35);
    const flowerBoxes = R.chance(0.35);
    const wh = floorH * 0.46 * p.windowSize;
    const ww = Math.min(wh * R.range(0.65, 0.95), (W / slots) * 0.62);
    const slotX = k => x0 + W * (k + 0.5) / slots;
    const lit = Array.from({ length: floors * slots }, () => R.chance(night ? 0.7 : 0.15));
    const parts = [];
    // En modo «solo» (mundo.html) los caminos llegan hasta la acera y no hay árboles ni cerca
    const pathEnd = p.solo ? groundY + 75 : 900, spread = p.solo ? 12 : 50;
    const windows = [];

    // 1. Cielo y suelo
    const clouds = Array.from({ length: R.int(2, 4) }, () => [R.range(0, 1000), R.range(40, 180), R.range(0.6, 1.2)]);
    const stars = Array.from({ length: 80 }, () => [R.range(-200, 1200), R.range(-200, 420), R.range(0.8, 2.2)]);
    parts.push(Gen.fondo(ctx => {
      const g = ctx.createLinearGradient(0, -100, 0, groundY);
      g.addColorStop(0, sky.top);
      g.addColorStop(1, sky.bottom);
      ctx.fillStyle = g;
      ctx.fillRect(-2000, -2000, 5000, 2000 + groundY);
      if (night) {
        ctx.fillStyle = '#ffffff';
        stars.forEach(([x, y, s]) => { ctx.globalAlpha = 0.4 + s / 4; ctx.fillRect(x, y, s, s); });
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#f4f1de';
        ctx.beginPath(); ctx.arc(840, 110, 40, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillStyle = time === 'día' ? '#fff3b0' : '#ffd07a';
        ctx.beginPath(); ctx.arc(840, time === 'día' ? 110 : 380, 50, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = Gen.rgba('#ffffff', time === 'día' ? 0.85 : 0.45);
        clouds.forEach(([x, y, s]) => {
          ctx.beginPath();
          [[0, 0, 32], [34, -14, 38], [72, 0, 30], [36, 10, 34]].forEach(([dx, dy, r]) => {
            ctx.moveTo(x + dx * s + r * s, y + dy * s);
            ctx.arc(x + dx * s, y + dy * s, r * s, 0, Math.PI * 2);
          });
          ctx.fill();
        });
      }
      ctx.fillStyle = sky.grass;
      ctx.fillRect(-2000, groundY, 5000, 3000);
      ctx.fillStyle = Gen.shade(sky.grass, 0.08);
      ctx.fillRect(-2000, groundY, 5000, 14);
    }));

    // 2. Árboles fractales
    const treeCount = p.solo ? 0 : Math.round(p.trees);
    const treeSpots = [x0 - 150, x1 + gW + 150];
    const leafColors = night ? ['#1f4d2b', '#2a5e34', '#173d22', '#2f6b3a'] :
      time === 'atardecer' ? ['#c46a2b', '#8a9a3a', '#b5542a', '#6f8a36'] : ['#3f8f3a', '#5aa648', '#2f7a33', '#6cb655'];
    for (let t = 0; t < treeCount; t++) {
      const tx = treeSpots[t] + R.sym(30);
      const depth = 8;
      const tr = fractalTree(R, tx, groundY + 4, floorH * (0.55 + floors * 0.13) * R.range(0.9, 1.1), depth);
      parts.push(ctx => {
        tr.levels.forEach((seg, i) => {
          ctx.strokeStyle = Gen.mix('#4a3222', '#6b5a3a', i / depth);
          ctx.lineWidth = Math.max(1, 16 * Math.pow(0.68, i));
          ctx.beginPath();
          for (let j = 0; j < seg.length; j += 4) { ctx.moveTo(seg[j], seg[j + 1]); ctx.lineTo(seg[j + 2], seg[j + 3]); }
          ctx.stroke();
        });
        leafColors.forEach((c, k) => {
          ctx.fillStyle = c;
          ctx.beginPath();
          for (let j = 0; j < tr.leaves.length; j += 4) {
            if (tr.leaves[j + 3] !== k) continue;
            ctx.moveTo(tr.leaves[j] + tr.leaves[j + 2], tr.leaves[j + 1]);
            ctx.arc(tr.leaves[j], tr.leaves[j + 1], tr.leaves[j + 2], 0, Math.PI * 2);
          }
          ctx.fill();
        });
      });
    }

    // 3. Chimenea (detrás del techo)
    let chimneyX = null;
    if (hasChimney) {
      const chX = cx + W * R.range(0.12, 0.3) * (R.chance(0.5) ? 1 : -1);
      chimneyX = chX;
      const smoke = Array.from({ length: 5 }, (_, i) => [chX + 20 + i * 14 + R.sym(8), -i * 34 + R.sym(6), 14 + i * 5]);
      parts.push(ctx => {
        const top = wallTop - rh * 0.95;
        ctx.fillStyle = Gen.shade('#9c4a3a', -0.1);
        ctx.fillRect(chX, top, 44, rh);
        ctx.fillStyle = '#5a2e25';
        ctx.fillRect(chX - 6, top - 12, 56, 14);
        ctx.fillStyle = Gen.rgba(night ? '#9aa4b5' : '#e6e6e6', 0.55);
        smoke.forEach(([x, dy, r]) => { ctx.beginPath(); ctx.arc(x, top - 30 + dy, r, 0, Math.PI * 2); ctx.fill(); });
      });
    }

    // 4. Paredes
    const wallPath = ctx => ctx.rect(x0, wallTop, W, floors * floorH);
    parts.push(ctx => {
      ctx.fillStyle = wall;
      ctx.beginPath(); wallPath(ctx); ctx.fill();
      ctx.save();
      ctx.beginPath(); wallPath(ctx); ctx.clip();
      ctx.strokeStyle = Gen.rgba(Gen.shade(wall, -0.45), 0.35);
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (texture === 'ladrillo') {
        for (let y = groundY, row = 0; y > wallTop; y -= 16, row++) {
          ctx.moveTo(x0, y); ctx.lineTo(x1, y);
          for (let x = x0 + (row % 2) * 20; x < x1; x += 40) { ctx.moveTo(x, y); ctx.lineTo(x, y - 16); }
        }
      } else if (texture === 'tablas') {
        for (let y = groundY; y > wallTop; y -= 18) { ctx.moveTo(x0, y); ctx.lineTo(x1, y); }
      }
      ctx.stroke();
      ctx.fillStyle = Gen.rgba('#000000', 0.08);
      ctx.fillRect(x0, wallTop, W, 18);
      ctx.restore();
      ctx.fillStyle = trim;
      ctx.fillRect(x0 - 6, wallTop, 12, floors * floorH);
      ctx.fillRect(x1 - 6, wallTop, 12, floors * floorH);
      for (let f = 1; f < floors; f++) ctx.fillRect(x0, groundY - f * floorH - 5, W, 10);
      ctx.fillStyle = '#7d7468';
      ctx.fillRect(x0 - 8, groundY - 16, W + 16, 18);
    });

    // 5. Techo
    const dormers = roofType === 'mansarda' ? Math.max(1, slots - 1) : 0;
    parts.push(ctx => {
      const shingles = () => {
        ctx.save();
        ctx.clip();
        ctx.strokeStyle = Gen.rgba('#000000', 0.18);
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let y = wallTop; y > wallTop - rh - 20; y -= 16) { ctx.moveTo(x0 - 60, y); ctx.lineTo(x1 + 60, y); }
        ctx.stroke();
        ctx.restore();
      };
      ctx.fillStyle = roof;
      ctx.strokeStyle = Gen.shade(roof, -0.35);
      ctx.lineWidth = 6;
      ctx.beginPath();
      if (roofType === 'dos aguas') {
        ctx.moveTo(x0 - o, wallTop + 4); ctx.lineTo(cx, wallTop - rh); ctx.lineTo(x1 + o, wallTop + 4); ctx.closePath();
      } else if (roofType === 'cuatro aguas') {
        ctx.moveTo(x0 - o, wallTop + 4); ctx.lineTo(x0 + W * 0.22, wallTop - rh * 0.75);
        ctx.lineTo(x1 - W * 0.22, wallTop - rh * 0.75); ctx.lineTo(x1 + o, wallTop + 4); ctx.closePath();
      } else if (roofType === 'mansarda') {
        ctx.moveTo(x0 - o, wallTop + 4); ctx.lineTo(x0 + W * 0.06, wallTop - rh * 0.85);
        ctx.lineTo(x1 - W * 0.06, wallTop - rh * 0.85); ctx.lineTo(x1 + o, wallTop + 4); ctx.closePath();
      } else {
        ctx.rect(x0 - 12, wallTop - 34, W + 24, 38);
      }
      ctx.fill();
      ctx.stroke();
      if (roofType !== 'plano') shingles();
      if (roofType === 'mansarda') {
        ctx.fillStyle = Gen.shade(roof, -0.25);
        ctx.fillRect(x0 + W * 0.06 - 6, wallTop - rh * 0.85 - 16, W * 0.88 + 12, 18);
        for (let k = 0; k < dormers; k++) {
          const dx = x0 + W * (k + 1) / (dormers + 1), dw = Math.min(70, W / (dormers + 1) * 0.6), dh = rh * 0.5;
          const dy = wallTop - rh * 0.2;
          ctx.fillStyle = wall;
          ctx.fillRect(dx - dw / 2, dy - dh, dw, dh);
          ctx.fillStyle = night ? sky.glass[0] : sky.glass[1];
          ctx.fillRect(dx - dw * 0.3, dy - dh * 0.8, dw * 0.6, dh * 0.65);
          ctx.fillStyle = roof;
          ctx.beginPath();
          ctx.moveTo(dx - dw / 2 - 10, dy - dh); ctx.lineTo(dx, dy - dh - dw * 0.45); ctx.lineTo(dx + dw / 2 + 10, dy - dh);
          ctx.closePath(); ctx.fill(); ctx.stroke();
        }
      }
      if (roofType === 'dos aguas' && rh > 90) {
        const ar = Math.min(rh * 0.16, 34), ay = wallTop - rh * 0.38;
        ctx.fillStyle = trim;
        ctx.beginPath(); ctx.arc(cx, ay, ar + 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = night ? sky.glass[0] : sky.glass[1];
        ctx.beginPath(); ctx.arc(cx, ay, ar, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = trim; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(cx - ar, ay); ctx.lineTo(cx + ar, ay); ctx.moveTo(cx, ay - ar); ctx.lineTo(cx, ay + ar); ctx.stroke();
      }
    });

    // 6. Garaje
    if (hasGarage) {
      const gh = Math.min(floorH * 1.05, floors * floorH);
      parts.push(ctx => {
        const gx = x1, gy = groundY - gh;
        ctx.fillStyle = Gen.shade(wall, -0.06);
        ctx.fillRect(gx, gy, gW, gh);
        ctx.fillStyle = roof;
        ctx.strokeStyle = Gen.shade(roof, -0.35);
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.rect(gx - 4, gy - 22, gW + 22, 26);
        ctx.fill(); ctx.stroke();
        const dw = gW * 0.74, dh = gh * 0.7, dx = gx + (gW - dw) / 2, dy = groundY - dh;
        ctx.fillStyle = trim;
        ctx.fillRect(dx - 8, dy - 8, dw + 16, dh + 8);
        ctx.fillStyle = Gen.shade(door, 0.25);
        ctx.fillRect(dx, dy, dw, dh);
        ctx.strokeStyle = Gen.shade(door, -0.1);
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let k = 1; k < 5; k++) { ctx.moveTo(dx, dy + dh * k / 5); ctx.lineTo(dx + dw, dy + dh * k / 5); }
        ctx.stroke();
        ctx.fillStyle = '#9a9a9a';
        ctx.beginPath();
        ctx.moveTo(dx, groundY); ctx.lineTo(dx + dw, groundY); ctx.lineTo(dx + dw + spread * 1.2, pathEnd); ctx.lineTo(dx - spread * 1.2, pathEnd);
        ctx.fill();
      });
    }

    // 7. Puerta
    const dW = Math.min(W / slots * 0.55, 86), dH = floorH * 0.74;
    const dX = slotX(doorSlot) - dW / 2, dY = groundY - dH;
    const doorWindow = R.chance(0.5), awning = R.chance(0.5), lamp = R.chance(0.6);
    parts.push(ctx => {
      ctx.fillStyle = '#c9b79c';
      ctx.beginPath();
      ctx.moveTo(dX, groundY); ctx.lineTo(dX + dW, groundY); ctx.lineTo(dX + dW + spread, pathEnd); ctx.lineTo(dX - spread, pathEnd);
      ctx.fill();
      ctx.fillStyle = trim;
      ctx.fillRect(dX - 9, dY - 9, dW + 18, dH + 9);
      ctx.fillStyle = door;
      ctx.fillRect(dX, dY, dW, dH);
      ctx.strokeStyle = Gen.shade(door, -0.3);
      ctx.lineWidth = 3;
      ctx.strokeRect(dX + dW * 0.15, dY + dH * 0.5, dW * 0.7, dH * 0.38);
      if (doorWindow) {
        ctx.fillStyle = night ? sky.glass[0] : sky.glass[1];
        ctx.fillRect(dX + dW * 0.15, dY + dH * 0.1, dW * 0.7, dH * 0.3);
      } else ctx.strokeRect(dX + dW * 0.15, dY + dH * 0.1, dW * 0.7, dH * 0.3);
      ctx.fillStyle = '#d4af37';
      ctx.beginPath(); ctx.arc(dX + dW * 0.82, dY + dH * 0.55, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#8a8378';
      ctx.fillRect(dX - 18, groundY - 6, dW + 36, 12);
      if (awning) {
        ctx.fillStyle = roof;
        ctx.beginPath();
        ctx.moveTo(dX - 26, dY - 10); ctx.lineTo(dX + dW / 2, dY - 44); ctx.lineTo(dX + dW + 26, dY - 10); ctx.closePath();
        ctx.fill();
      }
      if (lamp) {
        const lx = dX + dW + 26, ly = dY + dH * 0.25;
        if (night) {
          const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, 70);
          g.addColorStop(0, Gen.rgba('#ffe08a', 0.55)); g.addColorStop(1, Gen.rgba('#ffe08a', 0));
          ctx.fillStyle = g; ctx.fillRect(lx - 70, ly - 70, 140, 140);
        }
        ctx.fillStyle = '#2a2a2a'; ctx.fillRect(lx - 7, ly - 14, 14, 26);
        ctx.fillStyle = night ? '#ffe08a' : '#f5ecd0'; ctx.fillRect(lx - 4, ly - 9, 8, 14);
      }
    });

    // 8. Ventanas (una parte por ventana para animar una a una)
    for (let f = 0; f < floors; f++) {
      for (let k = 0; k < slots; k++) {
        if (f === 0 && k === doorSlot) continue;
        const wx = slotX(k), wy = groundY - f * floorH - floorH * 0.56;
        windows.push({ x: wx - ww / 2, y: wy - wh / 2, w: ww, h: wh, arch: winStyle === 'arco' });
        const on = lit[f * slots + k];
        parts.push(ctx => {
          const x = wx - ww / 2, y = wy - wh / 2;
          const shape = (pad) => {
            ctx.beginPath();
            if (winStyle === 'arco') {
              ctx.moveTo(x - pad, y + wh + pad);
              ctx.lineTo(x - pad, y + ww / 2);
              ctx.arc(wx, y + ww / 2, ww / 2 + pad, Math.PI, 0);
              ctx.lineTo(x + ww + pad, y + wh + pad);
              ctx.closePath();
            } else ctx.rect(x - pad, y - pad, ww + pad * 2, wh + pad * 2);
          };
          if (shutters) {
            ctx.fillStyle = door;
            ctx.fillRect(x - ww * 0.5 - 8, y, ww * 0.42, wh);
            ctx.fillRect(x + ww + 8 + ww * 0.08, y, ww * 0.42, wh);
          }
          ctx.fillStyle = trim; shape(8); ctx.fill();
          const g = ctx.createLinearGradient(x, y, x + ww, y + wh);
          const glass = on ? SKIES.noche.glass : sky.glass;
          g.addColorStop(0, glass[0]); g.addColorStop(1, glass[1]);
          ctx.fillStyle = g; shape(0); ctx.fill();
          if (!on) {
            ctx.save(); shape(0); ctx.clip();
            ctx.fillStyle = Gen.rgba('#ffffff', 0.35);
            ctx.beginPath(); ctx.moveTo(x, y + wh * 0.5); ctx.lineTo(x + ww * 0.5, y); ctx.lineTo(x + ww * 0.7, y); ctx.lineTo(x, y + wh * 0.7); ctx.fill();
            ctx.restore();
          }
          if (winStyle !== 'simple') {
            ctx.strokeStyle = trim; ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(wx, y); ctx.lineTo(wx, y + wh);
            ctx.moveTo(x, y + wh * 0.55); ctx.lineTo(x + ww, y + wh * 0.55);
            ctx.stroke();
          }
          ctx.fillStyle = Gen.shade(trim, -0.12);
          ctx.fillRect(x - 14, y + wh + 6, ww + 28, 9);
          if (flowerBoxes) {
            ctx.fillStyle = '#7a4a2a';
            ctx.fillRect(x - 6, y + wh + 15, ww + 12, 16);
            ['#e63946', '#ffb703', '#f28482', '#ffffff'].forEach((c, i) => {
              ctx.fillStyle = c;
              for (let fx = x + i * 7; fx < x + ww; fx += 26) {
                ctx.beginPath(); ctx.arc(fx, y + wh + 13, 5, 0, Math.PI * 2); ctx.fill();
              }
            });
          }
        });
      }
    }

    // 9. Arbustos y cerca
    const bushes = [];
    for (let x = x0 + 20; x < x1 - 20; x += R.range(40, 70)) {
      if (Math.abs(x - slotX(doorSlot)) < dW) continue;
      bushes.push([x, groundY - R.range(4, 14), R.range(20, 32), R.int(0, 2)]);
    }
    parts.push(ctx => {
      bushes.forEach(([x, y, r, c]) => {
        ctx.fillStyle = Gen.shade(leafColors[c], -0.05);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.arc(x + r * 0.8, y + 4, r * 0.8, 0, Math.PI * 2);
        ctx.arc(x - r * 0.8, y + 4, r * 0.8, 0, Math.PI * 2);
        ctx.fill();
      });
    });
    if (hasFence && !p.solo) {
      parts.push(ctx => {
        const fy = groundY + 110, fh = 58;
        // Huecos para el camino de la puerta y la entrada del garaje
        const gaps = [[dX - 60, dX + dW + 60]];
        if (hasGarage) gaps.push([x1 + gW * 0.13 - 80, x1 + gW * 0.87 + 80]);
        gaps.sort((a, b) => a[0] - b[0]);
        const runs = [];
        let start = -40;
        gaps.forEach(([a, b]) => { if (a > start) runs.push([start, a]); start = Math.max(start, b); });
        runs.push([start, 1040]);
        ctx.fillStyle = trim;
        ctx.strokeStyle = Gen.shade(trim, -0.3);
        ctx.lineWidth = 2;
        runs.forEach(([a, b]) => {
          for (let x = a; x + 16 <= b; x += 28) {
            ctx.beginPath();
            ctx.moveTo(x, fy); ctx.lineTo(x, fy - fh); ctx.lineTo(x + 8, fy - fh - 12); ctx.lineTo(x + 16, fy - fh); ctx.lineTo(x + 16, fy);
            ctx.closePath(); ctx.fill(); ctx.stroke();
          }
          ctx.fillRect(a, fy - fh * 0.8, b - a, 8);
          ctx.fillRect(a, fy - fh * 0.3, b - a, 8);
        });
      });
    }

    const roofPeak = roofType === 'plano' ? wallTop - 34 : roofType === 'dos aguas' ? wallTop - rh
      : wallTop - rh * (roofType === 'cuatro aguas' ? 0.75 : 0.85);
    parts.geo = {
      x0, x1: x1 + gW, groundY, top: wallTop - rh - 160, windows,
      // Datos descriptivos (usados por mundo_ingles.html para enseñar vocabulario)
      houseX0: x0, houseX1: x1, cx, wallTop, roofPeak, roofType, floors, wall, roof, door: { x: dX, y: dY, w: dW, h: dH, color: door },
      chimney: chimneyX === null ? null : { x: chimneyX, y: wallTop - rh * 0.95 - 12, w: 56, h: rh * 0.5 },
      garage: hasGarage ? { x: x1, y: groundY - Math.min(floorH * 1.05, floors * floorH) - 22, w: gW + 18, h: Math.min(floorH * 1.05, floors * floorH) + 22 } : null,
      texture, time
    };
    build.info = `${floors} piso${floors > 1 ? 's' : ''} · techo ${roofType} · ${time}`;
    return parts;
  }

  const config = {
    title: 'Generador de casas',
    subtitle: 'Casas procedurales',
    newLabel: '🏠 Generar otra casa',
    fileName: 'casa',
    view: { w: 1000, h: 800 },
    duration: 2.2,
    build,
    stats: () => build.info,
    defaultPreset: 'Aleatoria',
    controls: [
      { group: 'Estructura', id: 'floors', type: 'range', label: 'Pisos', min: 1, max: 3, step: 1 },
      { group: 'Estructura', id: 'width', type: 'range', label: 'Ancho', min: 0.7, max: 1.4, step: 0.01 },
      { group: 'Estructura', id: 'windows', type: 'range', label: 'Ventanas por piso', min: 1, max: 5, step: 1 },
      { group: 'Estructura', id: 'windowSize', type: 'range', label: 'Tamaño de ventanas', min: 0.7, max: 1.3, step: 0.01 },
      { group: 'Estructura', id: 'roof', type: 'select', label: 'Techo', options: ['aleatorio', ...ROOF_TYPES] },
      { group: 'Estructura', id: 'roofPitch', type: 'range', label: 'Inclinación del techo', min: 0.5, max: 1.6, step: 0.01 },
      { group: 'Estructura', id: 'variation', type: 'range', label: 'Variación aleatoria', min: 0, max: 1, step: 0.05,
        fmt: v => Math.round(v * 100) + ' %' },
      { group: 'Detalles', id: 'wallTexture', type: 'select', label: 'Pared', options: ['aleatorio', 'liso', 'ladrillo', 'tablas'] },
      { group: 'Detalles', id: 'garage', type: 'select', label: 'Garaje', options: ['aleatorio', 'sí', 'no'] },
      { group: 'Detalles', id: 'chimney', type: 'select', label: 'Chimenea', options: ['aleatorio', 'sí', 'no'] },
      { group: 'Detalles', id: 'fence', type: 'select', label: 'Cerca', options: ['aleatorio', 'sí', 'no'] },
      { group: 'Detalles', id: 'trees', type: 'range', label: 'Árboles fractales', min: 0, max: 2, step: 1 },
      { group: 'Escena y colores', id: 'time', type: 'select', label: 'Momento del día', options: ['aleatorio', ...Object.keys(SKIES)] },
      { group: 'Escena y colores', id: 'randomColors', type: 'check', label: 'Colores aleatorios' },
      { group: 'Escena y colores', id: 'wallColor', type: 'color', label: 'Pared' },
      { group: 'Escena y colores', id: 'roofColor', type: 'color', label: 'Techo' },
      { group: 'Escena y colores', id: 'doorColor', type: 'color', label: 'Puerta' },
      { group: 'Escena y colores', id: 'trimColor', type: 'color', label: 'Marcos' }
    ],
    presets: {
      'Aleatoria': {
        floors: 2, width: 1, windows: 3, windowSize: 1, roof: 'aleatorio', roofPitch: 1, variation: 0.5, wallTexture: 'aleatorio',
        garage: 'aleatorio', chimney: 'aleatorio', fence: 'aleatorio', trees: 1, time: 'día', randomColors: true,
        wallColor: '#f4e3c1', roofColor: '#8d3b2e', doorColor: '#2a6f97', trimColor: '#ffffff'
      },
      'Cabaña': {
        floors: 1, width: 0.85, windows: 2, windowSize: 0.9, roof: 'dos aguas', roofPitch: 1.5, variation: 0.3, wallTexture: 'tablas',
        garage: 'no', chimney: 'sí', fence: 'no', trees: 2, time: 'atardecer', randomColors: false,
        wallColor: '#9c6b43', roofColor: '#5a3e36', doorColor: '#6b2d1f', trimColor: '#f8f4e3'
      },
      'Casa familiar': {
        floors: 2, width: 1.1, windows: 3, windowSize: 1, roof: 'dos aguas', roofPitch: 1, variation: 0.3, wallTexture: 'liso',
        garage: 'sí', chimney: 'aleatorio', fence: 'sí', trees: 1, time: 'día', randomColors: false,
        wallColor: '#f4e3c1', roofColor: '#8d3b2e', doorColor: '#2a6f97', trimColor: '#ffffff'
      },
      'Casona de ladrillo': {
        floors: 3, width: 1.25, windows: 4, windowSize: 1.05, roof: 'mansarda', roofPitch: 1.1, variation: 0.2, wallTexture: 'ladrillo',
        garage: 'no', chimney: 'sí', fence: 'sí', trees: 2, time: 'día', randomColors: false,
        wallColor: '#b5563b', roofColor: '#2f3e46', doorColor: '#386641', trimColor: '#f8f4e3'
      },
      'Moderna': {
        floors: 2, width: 1.3, windows: 4, windowSize: 1.3, roof: 'plano', roofPitch: 1, variation: 0.2, wallTexture: 'liso',
        garage: 'sí', chimney: 'no', fence: 'no', trees: 1, time: 'día', randomColors: false,
        wallColor: '#f2f2f2', roofColor: '#3a3a3a', doorColor: '#3d405b', trimColor: '#3a3a3a'
      },
      'Noche acogedora': {
        floors: 2, width: 1, windows: 3, windowSize: 1, roof: 'aleatorio', roofPitch: 1.1, variation: 0.5, wallTexture: 'aleatorio',
        garage: 'aleatorio', chimney: 'sí', fence: 'aleatorio', trees: 2, time: 'noche', randomColors: true,
        wallColor: '#e8d5b7', roofColor: '#4a4e69', doorColor: '#bc4749', trimColor: '#ffffff'
      }
    }
  };

  return { build, config, fractalTree };
})();
