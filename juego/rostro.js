'use strict';

// Generador de rostros: expone build(params, rand) y la configuración de su página.
const Rostro = (() => {

  const SKINS = ['#ffdbac', '#f9d7c0', '#f1c27d', '#e0ac69', '#d4a07a', '#c68642', '#8d5524', '#5c3a1e'];
  const HAIRS = ['#1c1a19', '#3b2a20', '#6a4e35', '#a0522d', '#d9b36c', '#b5b5b5', '#e8e2d0', '#b23a2a', '#2a2f4a', '#8b3fa0'];
  const EYES = ['#3d2b1f', '#5b3a1a', '#2f6f9f', '#4a7a3a', '#7a8a8f', '#1d1d1d', '#8a6a2a'];
  const SHIRTS = ['#2f5d8a', '#b33a3a', '#3a8a5a', '#e0b040', '#6a4a9a', '#2a2a2a', '#e0e0e0', '#e07a5f'];

  const SHAPES = {
    ovalado:   { w: 1.00, h: 1.00, jaw: 0.62 },
    redondo:   { w: 1.08, h: 0.92, jaw: 0.80 },
    cuadrado:  { w: 1.02, h: 0.97, jaw: 0.92 },
    alargado:  { w: 0.90, h: 1.08, jaw: 0.60 },
    'corazón': { w: 1.04, h: 1.00, jaw: 0.45 }
  };
  const HAIR_STYLES = ['corto', 'largo', 'rizado', 'moño', 'mohicano', 'afro', 'calvo'];
  const orRandom = (v, list, R) => v === 'aleatorio' ? R.pick(list) : v;

  function build(p, R) {
    const v = p.variation;
    const cx = 400, cy = 430;

    // Elecciones aleatorias con semilla (salvo que el usuario fije una opción)
    const shapeName = orRandom(p.faceShape, Object.keys(SHAPES), R);
    const shape = SHAPES[shapeName];
    const hairStyle = orRandom(p.hair, HAIR_STYLES, R);
    const beard = orRandom(p.beard, ['ninguna', 'ninguna', 'ninguna', 'barba', 'bigote', 'candado'], R);
    const glasses = orRandom(p.glasses, ['no', 'no', 'no', 'redondas', 'cuadradas'], R);
    const freckles = p.freckles === 'aleatorio' ? R.chance(0.25) : p.freckles === 'sí';
    const skin = p.randomColors ? R.pick(SKINS) : p.skinColor;
    const hair = p.randomColors ? R.pick(HAIRS) : p.hairColor;
    const eyeColor = p.randomColors ? R.pick(EYES) : p.eyeColor;
    const shirt = p.randomColors ? R.pick(SHIRTS) : p.shirtColor;

    const hW = 230 * p.faceWidth * shape.w * (1 + R.sym(0.06 * v));
    const hH = 300 * shape.h * (1 + R.sym(0.05 * v));
    const jaw = shape.jaw + R.sym(0.08 * v);
    const line = Gen.shade(skin, -0.55);
    const skinDark = Gen.shade(skin, -0.14);
    const hairDark = Gen.shade(hair, -0.3);

    function headPath(ctx, k = 1) {
      const w = hW * k, h = hH * k, j = jaw;
      ctx.moveTo(cx, cy - h);
      ctx.bezierCurveTo(cx + w * 0.62, cy - h, cx + w, cy - h * 0.7, cx + w, cy - h * 0.25);
      ctx.bezierCurveTo(cx + w, cy + h * 0.2, cx + w * (j + 0.12), cy + h * 0.5, cx + w * j, cy + h * 0.66);
      ctx.bezierCurveTo(cx + w * j * 0.7, cy + h * 0.9, cx + w * 0.3, cy + h, cx, cy + h);
      ctx.bezierCurveTo(cx - w * 0.3, cy + h, cx - w * j * 0.7, cy + h * 0.9, cx - w * j, cy + h * 0.66);
      ctx.bezierCurveTo(cx - w * (j + 0.12), cy + h * 0.5, cx - w, cy + h * 0.2, cx - w, cy - h * 0.25);
      ctx.bezierCurveTo(cx - w, cy - h * 0.7, cx - w * 0.62, cy - h, cx, cy - h);
      ctx.closePath();
    }

    // Rasgos
    const eyeY = cy + R.sym(10 * v);
    const eyeDX = hW * 0.4 * p.eyeSpacing * (1 + R.sym(0.06 * v));
    const rx = 34 * p.eyeSize * (1 + R.sym(0.2 * v));
    const ry = rx * R.range(0.5, 0.68);
    const look = R.sym(rx * 0.22);
    const noseY = cy + hH * (0.34 + R.sym(0.04 * v));
    const nw = 22 * p.noseSize * (1 + R.sym(0.25 * v));
    const mouthY = cy + hH * (0.6 + R.sym(0.04 * v));
    const mw = hW * 0.34 * p.mouthWidth * (1 + R.sym(0.2 * v));
    const smile = Math.max(-1, Math.min(1, p.smile + R.sym(0.25 * v)));
    const brow = Math.max(-1, Math.min(1, p.brow + R.sym(0.25 * v)));
    const browW = R.range(7, 15);
    const lip = Gen.mix(skin, '#b8434f', 0.45);
    const vol = 1 + p.hairVolume * 0.18;
    const parts = [];

    // 1. Fondo
    parts.push(Gen.fondo(ctx => {
      ctx.fillStyle = p.bgColor;
      ctx.fillRect(-2000, -2000, 5000, 5000);
      const g = ctx.createRadialGradient(cx, cy, 50, cx, cy, 650);
      g.addColorStop(0, Gen.rgba('#ffffff', 0.25));
      g.addColorStop(1, Gen.rgba('#ffffff', 0));
      ctx.fillStyle = g;
      ctx.fillRect(-2000, -2000, 5000, 5000);
    }));

    // 2. Pelo de atrás (largo, afro, moño, rizado)
    const curls = [];
    if (hairStyle === 'rizado') {
      for (let row = 0; row < 3; row++) {
        const n = 16 + row * 3;
        for (let i = 0; i <= n; i++) {
          const a = Math.PI * (0.92 + 1.16 * i / n);
          const rr = 1.02 + row * 0.1;
          curls.push([cx + Math.cos(a) * hW * rr * vol, cy - hH * 0.12 + Math.sin(a) * hH * rr * vol,
            hW * R.range(0.13, 0.2), row]);
        }
      }
    }
    const longLen = R.range(1.0, 1.35);
    if (['largo', 'afro', 'moño', 'rizado'].includes(hairStyle)) {
      parts.push(ctx => {
        ctx.fillStyle = hairDark;
        ctx.beginPath();
        if (hairStyle === 'largo') {
          Gen.roundedPoly(ctx, [
            [cx - hW * 1.18 * vol, cy + hH * longLen, 40], [cx - hW * 1.2 * vol, cy - hH * 1.1, hW],
            [cx + hW * 1.2 * vol, cy - hH * 1.1, hW], [cx + hW * 1.18 * vol, cy + hH * longLen, 40]]);
        } else if (hairStyle === 'afro') {
          ctx.arc(cx, cy - hH * 0.25, hW * 1.45 * vol, 0, Math.PI * 2);
        } else if (hairStyle === 'moño') {
          ctx.arc(cx, cy - hH * 1.08, hW * 0.4 * vol, 0, Math.PI * 2);
        } else {
          curls.filter(c => c[3] === 2).forEach(([x, y, r]) => { ctx.moveTo(x + r, y); ctx.arc(x, y, r * 1.2, 0, Math.PI * 2); });
        }
        ctx.fill();
      });
    }

    // 3. Cuello y ropa
    parts.push(ctx => {
      const neckTop = cy + hH * 0.4, neckW = hW * 0.42;
      ctx.fillStyle = skinDark;
      ctx.fillRect(cx - neckW, neckTop, neckW * 2, hH * (p.soloCabeza ? 0.75 : 0.9));
      if (p.soloCabeza) return;
      const sy = cy + hH + 70;
      ctx.fillStyle = shirt;
      ctx.beginPath();
      Gen.roundedPoly(ctx, [[cx - 420, 1100, 0], [cx - 380, sy + 60, 90], [cx - neckW - 30, sy, 30],
        [cx + neckW + 30, sy, 30], [cx + 380, sy + 60, 90], [cx + 420, 1100, 0]]);
      ctx.fill();
      ctx.fillStyle = skinDark;
      ctx.beginPath();
      ctx.moveTo(cx - neckW, sy - 2);
      ctx.lineTo(cx, sy + 90);
      ctx.lineTo(cx + neckW, sy - 2);
      ctx.fill();
      ctx.strokeStyle = Gen.shade(shirt, -0.25);
      ctx.lineWidth = 6;
      ctx.stroke();
    });

    // 4. Orejas
    if (hairStyle !== 'largo') {
      parts.push(ctx => {
        [-1, 1].forEach(s => {
          const ex = cx + s * hW * 0.97, ey = eyeY + hH * 0.08;
          ctx.fillStyle = skin;
          ctx.beginPath();
          ctx.ellipse(ex, ey, hW * 0.13, hH * 0.17, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = skinDark;
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.arc(ex + s * 4, ey, hW * 0.06, -Math.PI / 2, Math.PI / 2, s < 0);
          ctx.stroke();
        });
      });
    }

    // 5. Cabeza
    parts.push(ctx => {
      const g = ctx.createRadialGradient(cx - hW * 0.3, cy - hH * 0.3, hW * 0.2, cx, cy, hH * 1.1);
      g.addColorStop(0, Gen.shade(skin, 0.08));
      g.addColorStop(1, Gen.shade(skin, -0.08));
      ctx.fillStyle = g;
      ctx.beginPath();
      headPath(ctx);
      ctx.fill();
      if (hairStyle === 'calvo') {
        ctx.fillStyle = Gen.rgba('#ffffff', 0.25);
        ctx.beginPath();
        ctx.ellipse(cx - hW * 0.3, cy - hH * 0.75, hW * 0.22, hH * 0.08, -0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // 6. Mejillas y pecas
    const blush = R.range(0.08, 0.22);
    const dots = [];
    if (freckles) {
      for (let i = 0; i < 40; i++) {
        const s = R.chance(0.5) ? -1 : 1;
        dots.push([cx + s * R.range(hW * 0.15, hW * 0.7), R.range(eyeY + ry * 1.8, noseY + nw), R.range(2, 4.5)]);
      }
    }
    parts.push(ctx => {
      [-1, 1].forEach(s => {
        const g = ctx.createRadialGradient(cx + s * hW * 0.55, mouthY - hH * 0.18, 0, cx + s * hW * 0.55, mouthY - hH * 0.18, hW * 0.25);
        g.addColorStop(0, Gen.rgba('#ff5a5a', blush));
        g.addColorStop(1, Gen.rgba('#ff5a5a', 0));
        ctx.fillStyle = g;
        ctx.fillRect(cx + s * hW * 0.55 - hW * 0.3, mouthY - hH * 0.18 - hW * 0.3, hW * 0.6, hW * 0.6);
      });
      ctx.fillStyle = Gen.rgba(Gen.shade(skin, -0.4), 0.55);
      ctx.beginPath();
      dots.forEach(([x, y, r]) => { ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, Math.PI * 2); });
      ctx.fill();
    });

    // 7. Ojos
    parts.push(ctx => {
      [-1, 1].forEach(s => {
        const ex = cx + s * eyeDX, ey = eyeY;
        const almond = () => {
          ctx.beginPath();
          ctx.moveTo(ex - rx, ey);
          ctx.quadraticCurveTo(ex, ey - ry * 2, ex + rx, ey);
          ctx.quadraticCurveTo(ex, ey + ry * 1.6, ex - rx, ey);
          ctx.closePath();
        };
        ctx.save();
        almond();
        ctx.fillStyle = '#fbfbf8';
        ctx.fill();
        ctx.clip();
        ctx.fillStyle = eyeColor;
        ctx.beginPath();
        ctx.arc(ex + look, ey, ry * 1.05, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = Gen.shade(eyeColor, -0.4);
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.arc(ex + look, ey, ry * 0.48, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ex + look - ry * 0.3, ey - ry * 0.35, ry * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        // párpado superior y pliegue
        ctx.strokeStyle = line;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(ex - rx, ey);
        ctx.quadraticCurveTo(ex, ey - ry * 2, ex + rx, ey);
        ctx.stroke();
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ex - rx * 0.8, ey - ry * 1.1);
        ctx.quadraticCurveTo(ex, ey - ry * 2.3, ex + rx * 0.8, ey - ry * 1.1);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(ex - rx * 0.7, ey + ry * 0.55);
        ctx.quadraticCurveTo(ex, ey + ry * 1.05, ex + rx * 0.7, ey + ry * 0.55);
        ctx.strokeStyle = Gen.rgba(line, 0.35);
        ctx.stroke();
      });
    });

    // 8. Cejas
    parts.push(ctx => {
      ctx.strokeStyle = Gen.shade(hair, -0.15);
      ctx.lineWidth = browW;
      const by = eyeY - ry * 1.7 - 12;
      [-1, 1].forEach(s => {
        const ix = cx + s * (eyeDX - rx * 0.95), ox = cx + s * (eyeDX + rx * 1.1);
        const iy = by - brow * 16, oy = by - brow * 6 - 4;
        ctx.beginPath();
        ctx.moveTo(ix, iy);
        ctx.quadraticCurveTo((ix + ox) / 2, Math.min(iy, oy) - 12, ox, oy + 6);
        ctx.stroke();
      });
    });

    // 9. Nariz
    parts.push(ctx => {
      ctx.strokeStyle = Gen.shade(skin, -0.35);
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(cx - nw, noseY);
      ctx.quadraticCurveTo(cx - nw * 1.25, noseY + nw * 0.75, cx - nw * 0.4, noseY + nw * 0.55);
      ctx.quadraticCurveTo(cx, noseY + nw * 0.85, cx + nw * 0.4, noseY + nw * 0.55);
      ctx.quadraticCurveTo(cx + nw * 1.25, noseY + nw * 0.75, cx + nw, noseY);
      ctx.stroke();
      ctx.strokeStyle = Gen.rgba(Gen.shade(skin, -0.35), 0.45);
      ctx.beginPath();
      ctx.moveTo(cx + nw * 0.35, eyeY + ry * 0.6);
      ctx.quadraticCurveTo(cx + nw * 0.6, noseY - nw * 0.9, cx + nw * 0.9, noseY - nw * 0.05);
      ctx.stroke();
    });

    // 10. Barba (va debajo de la boca)
    if (beard === 'barba') {
      const len = R.range(0.05, 0.3);
      parts.push(ctx => {
        ctx.save();
        ctx.beginPath();
        headPath(ctx, 1.03);
        ctx.clip();
        ctx.fillStyle = hair;
        ctx.beginPath();
        ctx.moveTo(cx - hW * 1.2, cy + hH * 0.02);
        ctx.lineTo(cx - hW * 0.86, cy + hH * 0.12);
        ctx.quadraticCurveTo(cx - hW * 0.6, mouthY - hH * 0.02, cx - mw * 1.1, mouthY - hH * 0.08);
        ctx.lineTo(cx + mw * 1.1, mouthY - hH * 0.08);
        ctx.quadraticCurveTo(cx + hW * 0.6, mouthY - hH * 0.02, cx + hW * 0.86, cy + hH * 0.12);
        ctx.lineTo(cx + hW * 1.2, cy + hH * 0.02);
        ctx.lineTo(cx + hW * 1.2, cy + hH * 2);
        ctx.lineTo(cx - hW * 1.2, cy + hH * 2);
        ctx.fill();
        ctx.restore();
        ctx.fillStyle = hair;
        ctx.beginPath();
        ctx.ellipse(cx, cy + hH * 0.96, hW * 0.5, hH * (0.1 + len), 0, 0, Math.PI);
        ctx.fill();
      });
    }
    if (beard === 'candado') {
      parts.push(ctx => {
        ctx.fillStyle = hair;
        ctx.beginPath();
        ctx.ellipse(cx, mouthY + hH * 0.22, mw * 0.55, hH * 0.14, 0, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // 11. Boca
    parts.push(ctx => {
      const lx = cx - mw, rX = cx + mw, cyC = mouthY - smile * 16;
      const upper = () => {
        ctx.moveTo(lx, cyC);
        ctx.quadraticCurveTo(cx - mw * 0.5, mouthY - 14, cx, mouthY - 6);
        ctx.quadraticCurveTo(cx + mw * 0.5, mouthY - 14, rX, cyC);
      };
      const midY = mouthY + smile * 20;
      ctx.strokeStyle = Gen.shade(lip, -0.35);
      ctx.lineWidth = 3;
      if (smile > 0.45) {
        const lowY = mouthY + 26 + smile * 26;
        ctx.beginPath();
        ctx.moveTo(lx, cyC);
        ctx.quadraticCurveTo(cx, mouthY + 2, rX, cyC);
        ctx.quadraticCurveTo(cx, lowY + 12, lx, cyC);
        ctx.closePath();
        ctx.fillStyle = '#5a1f25';
        ctx.fill();
        ctx.save();
        ctx.clip();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(lx, mouthY - 20, mw * 2, 14 + smile * 10);
        ctx.fillStyle = '#e0707a';
        ctx.beginPath();
        ctx.ellipse(cx, lowY + 4, mw * 0.5, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.beginPath();
        upper();
        ctx.quadraticCurveTo(cx, mouthY + 2, lx, cyC);
        ctx.fillStyle = lip;
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(lx, cyC);
        ctx.quadraticCurveTo(cx, lowY + 12, rX, cyC);
        ctx.lineWidth = 7;
        ctx.strokeStyle = lip;
        ctx.stroke();
      } else {
        ctx.fillStyle = lip;
        ctx.beginPath();
        upper();
        ctx.quadraticCurveTo(cx, midY, lx, cyC);
        ctx.fill();
        ctx.fillStyle = Gen.shade(lip, 0.1);
        ctx.beginPath();
        ctx.moveTo(lx, cyC);
        ctx.quadraticCurveTo(cx, midY, rX, cyC);
        ctx.quadraticCurveTo(cx, mouthY + 24 + smile * 16, lx, cyC);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(lx, cyC);
        ctx.quadraticCurveTo(cx, midY, rX, cyC);
        ctx.stroke();
      }
    });

    // 12. Bigote
    if (beard === 'bigote' || beard === 'candado' || (beard === 'barba' && R.chance(0.8))) {
      const droop = R.range(0, 18);
      parts.push(ctx => {
        ctx.fillStyle = hair;
        ctx.beginPath();
        ctx.moveTo(cx, mouthY - 30);
        ctx.bezierCurveTo(cx + mw * 0.6, mouthY - 40, cx + mw * 1.1, mouthY - 20, cx + mw * 1.2, mouthY + droop);
        ctx.bezierCurveTo(cx + mw * 0.8, mouthY - 12, cx + mw * 0.3, mouthY - 14, cx, mouthY - 10);
        ctx.bezierCurveTo(cx - mw * 0.3, mouthY - 14, cx - mw * 0.8, mouthY - 12, cx - mw * 1.2, mouthY + droop);
        ctx.bezierCurveTo(cx - mw * 1.1, mouthY - 20, cx - mw * 0.6, mouthY - 40, cx, mouthY - 30);
        ctx.fill();
      });
    }

    // 13. Pelo delantero
    const fringeType = R.pick(['recto', 'lado', 'puntas']);
    const fringeN = 14;
    const fringeJit = Array.from({ length: fringeN + 1 }, () => R.range(0, 1));
    const side = R.chance(0.5) ? 1 : -1;
    const spikes = Array.from({ length: 7 }, () => R.range(0.7, 1.3));
    parts.push(ctx => {
      ctx.fillStyle = hair;
      ctx.strokeStyle = hairDark;
      ctx.lineWidth = 3;
      const capY = cy - hH * 0.1;
      const cap = (hairline, zig) => {
        ctx.beginPath();
        ctx.moveTo(cx - hW * 1.06 * vol, capY);
        ctx.ellipse(cx, capY, hW * 1.06 * vol, hH * 1.0 * vol, 0, Math.PI, Math.PI * 2);
        ctx.lineTo(cx + hW * 0.93, capY);
        for (let i = 0; i <= fringeN; i++) {
          const t = i / fringeN;
          const x = cx + hW * 0.93 - t * hW * 1.86;
          ctx.lineTo(x, hairline(t) + (i % 2 ? zig * fringeJit[i] : 0));
        }
        ctx.lineTo(cx - hW * 0.93, capY);
        ctx.closePath();
        ctx.fill();
      };
      const lines = {
        recto: t => cy - hH * (0.5 + 0.12 * Math.sin(t * Math.PI)) - (t < 0.1 || t > 0.9 ? -hH * 0.25 : 0),
        lado: t => { const u = side > 0 ? t : 1 - t; return cy - hH * (0.3 + 0.35 * u); },
        puntas: t => cy - hH * (0.55 + 0.08 * Math.sin(t * Math.PI))
      };
      if (hairStyle === 'corto') cap(lines[fringeType], fringeType === 'puntas' ? 26 : 10);
      else if (hairStyle === 'largo') {
        cap(lines.lado, 6);
        [-1, 1].forEach(s => {
          ctx.beginPath();
          ctx.moveTo(cx + s * hW * 1.08 * vol, capY);
          ctx.quadraticCurveTo(cx + s * hW * 1.15 * vol, cy + hH * 0.7, cx + s * hW * 1.12 * vol, cy + hH * 1.1);
          ctx.lineTo(cx + s * hW * 0.9, cy + hH * 0.9);
          ctx.quadraticCurveTo(cx + s * hW * 0.95, cy, cx + s * hW * 0.9, capY - hH * 0.2);
          ctx.fill();
        });
      } else if (hairStyle === 'moño' || hairStyle === 'afro') {
        cap(t => cy - hH * (0.6 + 0.1 * Math.sin(t * Math.PI)), 0);
      } else if (hairStyle === 'rizado') {
        curls.filter(c => c[3] < 2).forEach(([x, y, r]) => {
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });
      } else if (hairStyle === 'mohicano') {
        ctx.save();
        ctx.beginPath();
        headPath(ctx);
        ctx.clip();
        ctx.fillStyle = Gen.rgba(hair, 0.3);
        cap(lines.puntas, 0);
        ctx.restore();
        ctx.fillStyle = hair;
        ctx.beginPath();
        ctx.moveTo(cx - hW * 0.18, cy - hH * 0.55);
        for (let i = 0; i < spikes.length; i++) {
          const a = Math.PI * (1.25 + 0.5 * (i + 0.5) / spikes.length);
          const r0 = hH * 1.0, r1 = hH * (1.0 + 0.35 * spikes[i] * vol);
          ctx.lineTo(cx + Math.cos(a) * hW * 0.25 * (r1 / hH), cy - hH * 0.1 + Math.sin(a) * r1);
          ctx.lineTo(cx + Math.cos(a + 0.08) * hW * 0.2, cy - hH * 0.1 + Math.sin(a + 0.08) * r0);
        }
        ctx.lineTo(cx + hW * 0.18, cy - hH * 0.55);
        ctx.closePath();
        ctx.fill();
      } else if (hairStyle === 'calvo') {
        ctx.save();
        ctx.beginPath();
        headPath(ctx);
        ctx.clip();
        [-1, 1].forEach(s => {
          ctx.beginPath();
          ctx.ellipse(cx + s * hW * 0.98, cy - hH * 0.25, hW * 0.12, hH * 0.2, s * 0.2, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }
    });

    // 14. Gafas
    if (glasses !== 'no') {
      const frame = R.pick(['#1b1b1b', '#6b3a1e', '#2a4a8a', '#8a1f2a', '#c9a227']);
      parts.push(ctx => {
        ctx.strokeStyle = frame;
        ctx.lineWidth = 7;
        ctx.fillStyle = Gen.rgba('#dff3ff', 0.18);
        const gr = rx * 1.35;
        [-1, 1].forEach(s => {
          const ex = cx + s * eyeDX;
          ctx.beginPath();
          if (glasses === 'redondas') ctx.arc(ex, eyeY - 4, gr, 0, Math.PI * 2);
          else Gen.roundedPoly(ctx, [[ex - gr * 1.1, eyeY - gr * 0.8], [ex + gr * 1.1, eyeY - gr * 0.8],
            [ex + gr * 1.0, eyeY + gr * 0.75], [ex - gr * 1.0, eyeY + gr * 0.75]], 14);
          ctx.fill();
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(ex + s * gr * 1.05, eyeY - gr * 0.3);
          ctx.lineTo(cx + s * hW * 0.98, eyeY - gr * 0.1);
          ctx.stroke();
        });
        ctx.beginPath();
        ctx.moveTo(cx - eyeDX + gr * 0.95, eyeY - 6);
        ctx.quadraticCurveTo(cx, eyeY - 26, cx + eyeDX - gr * 0.95, eyeY - 6);
        ctx.stroke();
      });
    }

    build.info = `${shapeName} · pelo ${hairStyle}`;
    parts.geo = { shapeName, hairStyle, beard, glasses, freckles, smile, skin, hair, eyeColor };
    return parts;
  }

  const config = {
    title: 'Generador de rostros',
    subtitle: 'Rostros procedurales',
    newLabel: '🙂 Generar otro rostro',
    fileName: 'rostro',
    view: { w: 800, h: 1000 },
    build,
    stats: () => build.info,
    defaultPreset: 'Aleatorio',
    controls: [
      { group: 'Forma', id: 'faceShape', type: 'select', label: 'Forma de la cara',
        options: ['aleatorio', ...Object.keys(SHAPES)] },
      { group: 'Forma', id: 'faceWidth', type: 'range', label: 'Ancho de la cara', min: 0.85, max: 1.15, step: 0.01 },
      { group: 'Rasgos', id: 'eyeSize', type: 'range', label: 'Tamaño de ojos', min: 0.6, max: 1.6, step: 0.01 },
      { group: 'Rasgos', id: 'eyeSpacing', type: 'range', label: 'Separación de ojos', min: 0.75, max: 1.25, step: 0.01 },
      { group: 'Rasgos', id: 'noseSize', type: 'range', label: 'Tamaño de nariz', min: 0.6, max: 1.8, step: 0.01 },
      { group: 'Rasgos', id: 'mouthWidth', type: 'range', label: 'Ancho de boca', min: 0.6, max: 1.5, step: 0.01 },
      { group: 'Rasgos', id: 'smile', type: 'range', label: 'Sonrisa', min: -1, max: 1, step: 0.05 },
      { group: 'Rasgos', id: 'brow', type: 'range', label: 'Cejas (enojo ↔ sorpresa)', min: -1, max: 1, step: 0.05 },
      { group: 'Rasgos', id: 'variation', type: 'range', label: 'Variación aleatoria', min: 0, max: 1, step: 0.05,
        fmt: v => Math.round(v * 100) + ' %' },
      { group: 'Estilo', id: 'hair', type: 'select', label: 'Peinado', options: ['aleatorio', ...HAIR_STYLES] },
      { group: 'Estilo', id: 'hairVolume', type: 'range', label: 'Volumen del pelo', min: 0, max: 1, step: 0.05 },
      { group: 'Estilo', id: 'beard', type: 'select', label: 'Vello facial',
        options: ['aleatorio', 'ninguna', 'barba', 'bigote', 'candado'] },
      { group: 'Estilo', id: 'glasses', type: 'select', label: 'Gafas', options: ['aleatorio', 'no', 'redondas', 'cuadradas'] },
      { group: 'Estilo', id: 'freckles', type: 'select', label: 'Pecas', options: ['aleatorio', 'sí', 'no'] },
      { group: 'Colores', id: 'randomColors', type: 'check', label: 'Colores aleatorios de piel, pelo, ojos y ropa' },
      { group: 'Colores', id: 'skinColor', type: 'color', label: 'Piel' },
      { group: 'Colores', id: 'hairColor', type: 'color', label: 'Pelo' },
      { group: 'Colores', id: 'eyeColor', type: 'color', label: 'Ojos' },
      { group: 'Colores', id: 'shirtColor', type: 'color', label: 'Ropa' },
      { group: 'Colores', id: 'bgColor', type: 'color', label: 'Fondo' }
    ],
    presets: {
      'Aleatorio': {
        faceShape: 'aleatorio', faceWidth: 1, eyeSize: 1, eyeSpacing: 1, noseSize: 1, mouthWidth: 1, smile: 0.2, brow: 0,
        variation: 0.7, hair: 'aleatorio', hairVolume: 0.4, beard: 'aleatorio', glasses: 'aleatorio', freckles: 'aleatorio',
        randomColors: true, skinColor: '#e0ac69', hairColor: '#3b2a20', eyeColor: '#5b3a1a', shirtColor: '#2f5d8a', bgColor: '#dbe7f0'
      },
      'Sonriente': {
        faceShape: 'redondo', faceWidth: 1.05, eyeSize: 1.05, eyeSpacing: 1, noseSize: 0.9, mouthWidth: 1.25, smile: 0.9, brow: 0.3,
        variation: 0.3, hair: 'aleatorio', hairVolume: 0.5, beard: 'ninguna', glasses: 'no', freckles: 'aleatorio',
        randomColors: true, skinColor: '#f1c27d', hairColor: '#6a4e35', eyeColor: '#2f6f9f', shirtColor: '#e0b040', bgColor: '#fff1c9'
      },
      'Serio': {
        faceShape: 'cuadrado', faceWidth: 1, eyeSize: 0.85, eyeSpacing: 1, noseSize: 1.2, mouthWidth: 0.9, smile: -0.3, brow: -0.6,
        variation: 0.3, hair: 'corto', hairVolume: 0.2, beard: 'aleatorio', glasses: 'aleatorio', freckles: 'no',
        randomColors: true, skinColor: '#c68642', hairColor: '#1c1a19', eyeColor: '#3d2b1f', shirtColor: '#2a2a2a', bgColor: '#d9d9d9'
      },
      'Caricatura': {
        faceShape: 'aleatorio', faceWidth: 1.1, eyeSize: 1.55, eyeSpacing: 1.15, noseSize: 1.7, mouthWidth: 1.4, smile: 0.6, brow: 0.6,
        variation: 1, hair: 'aleatorio', hairVolume: 1, beard: 'aleatorio', glasses: 'aleatorio', freckles: 'aleatorio',
        randomColors: true, skinColor: '#f9d7c0', hairColor: '#b23a2a', eyeColor: '#4a7a3a', shirtColor: '#e07a5f', bgColor: '#f7d6e0'
      },
      'Abuelo': {
        faceShape: 'ovalado', faceWidth: 1.02, eyeSize: 0.8, eyeSpacing: 1, noseSize: 1.4, mouthWidth: 1, smile: 0.5, brow: 0.2,
        variation: 0.3, hair: 'calvo', hairVolume: 0.3, beard: 'barba', glasses: 'redondas', freckles: 'no',
        randomColors: false, skinColor: '#f1c9a5', hairColor: '#d8d8d8', eyeColor: '#2f6f9f', shirtColor: '#7a5a3a', bgColor: '#efe6d8'
      },
      'Pelirroja pecosa': {
        faceShape: 'corazón', faceWidth: 0.95, eyeSize: 1.15, eyeSpacing: 1, noseSize: 0.8, mouthWidth: 1, smile: 0.35, brow: 0.1,
        variation: 0.3, hair: 'largo', hairVolume: 0.6, beard: 'ninguna', glasses: 'no', freckles: 'sí',
        randomColors: false, skinColor: '#fbe0cf', hairColor: '#c2512a', eyeColor: '#4a7a3a', shirtColor: '#3a8a5a', bgColor: '#e3f0e6'
      },
      'Afro': {
        faceShape: 'ovalado', faceWidth: 1, eyeSize: 1.05, eyeSpacing: 1, noseSize: 1.2, mouthWidth: 1.15, smile: 0.6, brow: 0.1,
        variation: 0.3, hair: 'afro', hairVolume: 0.7, beard: 'ninguna', glasses: 'aleatorio', freckles: 'no',
        randomColors: false, skinColor: '#6b4226', hairColor: '#1c1a19', eyeColor: '#3d2b1f', shirtColor: '#e0b040', bgColor: '#f3d9b1'
      }
    }
  };

  return { build, config, SKINS, HAIRS, EYES, SHIRTS, HAIR_STYLES };
})();
