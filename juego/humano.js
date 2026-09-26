'use strict';

// Generador de humanos de cuerpo completo: cuerpo, ropa y pose propios; la cabeza se dibuja con Rostro.
// Las partes leen p.phase al dibujarse, así mundo.html puede animar la caminata sin reconstruir.
const Humano = (() => {
  const PANTS = ['#2c3e50', '#34495e', '#1f3a60', '#5d4037', '#212121', '#6d6d6d', '#8d6e63', '#3e5641', '#c2b280'];
  const SHOES = ['#1a1a1a', '#5d4037', '#f5f5f5', '#b71c1c', '#37474f', '#8d6e63'];
  const ACCENTS = ['#ffffff', '#f1c40f', '#1a1a1a', '#e74c3c', '#3498db'];
  const TOPS = ['camiseta', 'camisa', 'suéter', 'abrigo', 'vestido'];
  const BOTTOMS = ['pantalón', 'shorts', 'falda'];
  const POSES = ['de pie', 'saludo', 'manos en cintura', 'caminando', 'brazos arriba'];
  const orRandom = (v, list, R) => v === 'aleatorio' ? R.pick(list) : v;

  function build(p, R) {
    const v = p.variation;
    const skin = p.randomColors ? R.pick(Rostro.SKINS) : p.skinColor;
    const hair = p.randomColors ? R.pick(Rostro.HAIRS) : p.hairColor;
    const eyes = R.pick(Rostro.EYES);
    const topColor = p.randomColors ? R.pick(Rostro.SHIRTS) : p.topColor;
    const bottomColor = p.randomColors ? R.pick(PANTS) : p.bottomColor;
    const shoeColor = R.pick(SHOES);
    const accent = R.pick(ACCENTS.filter(c => c !== topColor));
    const topType = orRandom(p.top, TOPS, R);
    const bottomType = topType === 'vestido' ? 'vestido' : orRandom(p.bottom, BOTTOMS, R);
    const pose = orRandom(p.pose, POSES, R);
    const shortSleeves = (topType === 'camiseta' || topType === 'vestido') && R.chance(0.65);
    const stripes = topType === 'camiseta' && R.chance(0.35);
    const tights = (bottomType === 'falda' || bottomType === 'vestido') && R.chance(0.3);

    const cx = 300, feetY = 960;
    const H = 820 * p.height * (1 + R.sym(0.04 * v));
    const b = p.build * (1 + R.sym(0.1 * v));
    const headH = H * 0.2 * p.headSize;
    const s = headH / 600;
    const headCY = feetY - H + headH * 0.62;
    const shY = headCY + headH * 0.5 + H * 0.004;
    const shW = H * 0.12 * b;
    const waistY = shY + H * 0.22;
    const hipY = waistY + H * 0.06;
    const hipW = H * 0.095 * b;
    const legW = H * 0.07 * Math.sqrt(b);
    const armW = H * 0.052 * Math.sqrt(b);
    const upperArm = H * 0.17, foreArm = H * 0.16;
    const legLen = feetY - hipY - legW * 0.5;
    const thigh = legLen * 0.5, shin = legLen * 0.5;
    const phase = () => p.phase === undefined ? 0.9 : p.phase;

    // Cabeza con el generador de rostros (misma semilla → mismo rostro)
    const faceP = {
      faceShape: 'aleatorio', faceWidth: 1, eyeSize: 1.05, eyeSpacing: 1, noseSize: 1, mouthWidth: 1,
      smile: p.smile, brow: 0.1, variation: v, hair: p.hair, hairVolume: 0.4, beard: p.beard,
      glasses: p.glasses, freckles: 'aleatorio', randomColors: false, skinColor: skin, hairColor: hair,
      eyeColor: eyes, shirtColor: topColor, bgColor: '#ffffff', soloCabeza: true
    };
    const faceParts = Rostro.build(faceP, R);
    const faceGeo = faceParts.geo;
    const headParts = faceParts.filter(q => !q.bg);

    const dir = (a, side) => [side * Math.sin(a), Math.cos(a)];
    const seg = (ctx, x1, y1, x2, y2, w, color) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = w;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    };
    const parts = [];

    // 1. Fondo
    parts.push(Gen.fondo(ctx => {
      ctx.fillStyle = p.bgColor;
      ctx.fillRect(-2000, -2000, 5000, 5000);
      ctx.fillStyle = Gen.shade(p.bgColor, -0.08);
      ctx.fillRect(-2000, feetY - 10, 5000, 3000);
    }));

    // 2. Sombra
    parts.push(ctx => {
      ctx.fillStyle = Gen.rgba('#000000', 0.22);
      ctx.beginPath();
      ctx.ellipse(cx, feetY, H * 0.16 * b, H * 0.022, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // 3. Piernas y zapatos
    parts.push(ctx => {
      const walk = pose === 'caminando' ? Math.sin(phase()) : 0;
      [-1, 1].forEach(side => {
        // De frente, caminar se ve como una rodilla que sube y baja alternadamente
        const lift = Math.max(0, walk * side);
        const hx = cx + side * hipW * 0.5, hy = hipY;
        const a = 0.04 + lift * 0.12;
        const kx = hx + dir(a, side)[0] * thigh, ky = hy + dir(a, side)[1] * thigh - lift * H * 0.035;
        const ax = kx - side * lift * legW * 0.3, ay = ky + shin - lift * H * 0.05;
        const legColor = bottomType === 'pantalón' ? bottomColor : tights ? Gen.shade(bottomColor, -0.3) : skin;
        const thighColor = bottomType === 'shorts' ? bottomColor : legColor;
        seg(ctx, kx, ky, ax, ay, legW, legColor);
        seg(ctx, hx, hy, kx, ky, legW * (bottomType === 'shorts' ? 1.2 : 1.05), thighColor);
        if (bottomType === 'pantalón') seg(ctx, kx, ky, ax, ay - legW * 0.1, legW * 1.02, bottomColor);
        ctx.fillStyle = shoeColor;
        ctx.beginPath();
        ctx.ellipse(ax + side * legW * 0.25, ay + legW * 0.2, legW * 0.85, legW * 0.45, 0, Math.PI, Math.PI * 2);
        ctx.lineTo(ax + side * legW * 0.25 + legW * 0.85, ay + legW * 0.45);
        ctx.lineTo(ax + side * legW * 0.25 - legW * 0.85, ay + legW * 0.45);
        ctx.fill();
        ctx.fillStyle = Gen.shade(shoeColor, shoeColor === '#f5f5f5' ? -0.25 : 0.25);
        ctx.fillRect(ax + side * legW * 0.25 - legW * 0.85, ay + legW * 0.32, legW * 1.7, legW * 0.14);
      });
    });

    // 4. Torso, falda o vestido
    parts.push(ctx => {
      const long = topType === 'abrigo' ? H * 0.13 : 0;
      const torso = () => {
        ctx.beginPath();
        Gen.roundedPoly(ctx, [[cx - shW, shY, shW * 0.35], [cx + shW, shY, shW * 0.35],
          [cx + hipW * 1.08 + long * 0.3, hipY + long, 10], [cx - hipW * 1.08 - long * 0.3, hipY + long, 10]]);
      };
      if (bottomType === 'falda' || bottomType === 'vestido') {
        const skirtEnd = hipY + thigh * (bottomType === 'vestido' ? 1.05 : 0.85);
        ctx.fillStyle = bottomType === 'vestido' ? topColor : bottomColor;
        ctx.beginPath();
        Gen.roundedPoly(ctx, [[cx - hipW * 0.95, waistY], [cx + hipW * 0.95, waistY],
          [cx + hipW * 1.7, skirtEnd, 12], [cx - hipW * 1.7, skirtEnd, 12]], 6);
        ctx.fill();
        ctx.strokeStyle = Gen.rgba('#000000', 0.12);
        ctx.lineWidth = 3;
        ctx.beginPath();
        [-0.5, 0, 0.5].forEach(t => { ctx.moveTo(cx + t * hipW, waistY + 10); ctx.lineTo(cx + t * hipW * 1.8, skirtEnd - 4); });
        ctx.stroke();
      } else {
        ctx.fillStyle = bottomColor;
        ctx.beginPath();
        Gen.roundedPoly(ctx, [[cx - hipW * 1.05, waistY], [cx + hipW * 1.05, waistY],
          [cx + hipW * 1.05, hipY + legW * 0.6], [cx - hipW * 1.05, hipY + legW * 0.6]], 8);
        ctx.fill();
      }
      ctx.fillStyle = topColor;
      torso();
      ctx.fill();
      ctx.save();
      torso();
      ctx.clip();
      if (stripes) {
        ctx.fillStyle = accent;
        for (let y = shY + H * 0.06; y < hipY; y += H * 0.05) ctx.fillRect(cx - shW * 1.5, y, shW * 3, H * 0.018);
      }
      ctx.fillStyle = Gen.rgba('#000000', 0.1);
      ctx.fillRect(cx + shW * 0.55, shY, shW, H);
      if (topType === 'suéter') {
        ctx.fillStyle = Gen.shade(topColor, -0.2);
        ctx.fillRect(cx - shW * 1.5, hipY - H * 0.025, shW * 3, H * 0.03);
      }
      if (bottomType === 'pantalón' || bottomType === 'shorts') {
        if (topType === 'camisa') {
          ctx.fillStyle = '#3b2a20';
          ctx.fillRect(cx - shW * 1.5, waistY + H * 0.015, shW * 3, H * 0.018);
        }
      }
      ctx.restore();
      // cuello de la prenda
      ctx.fillStyle = Gen.shade(skin, -0.14);
      ctx.beginPath();
      ctx.moveTo(cx - headH * 0.17, shY - 2);
      ctx.lineTo(cx, shY + H * (topType === 'camisa' || topType === 'abrigo' ? 0.07 : 0.035));
      ctx.lineTo(cx + headH * 0.17, shY - 2);
      ctx.fill();
      if (topType === 'camisa' || topType === 'abrigo') {
        ctx.fillStyle = topType === 'camisa' ? Gen.shade(topColor, 0.35) : Gen.shade(topColor, -0.2);
        [-1, 1].forEach(side => {
          ctx.beginPath();
          ctx.moveTo(cx + side * headH * 0.18, shY - 4);
          ctx.lineTo(cx + side * headH * 0.02, shY + H * 0.075);
          ctx.lineTo(cx + side * headH * 0.3, shY + H * 0.03);
          ctx.fill();
        });
        ctx.fillStyle = topType === 'camisa' ? Gen.shade(topColor, -0.3) : '#d4af37';
        for (let i = 0; i < 4; i++) {
          ctx.beginPath(); ctx.arc(cx, shY + H * (0.1 + i * 0.055), H * 0.007, 0, Math.PI * 2); ctx.fill();
        }
      }
    });

    // 5. Cabeza
    headParts.forEach(q => parts.push(ctx => {
      ctx.save();
      ctx.translate(cx, headCY);
      ctx.scale(s, s);
      ctx.translate(-400, -430);
      q(ctx);
      ctx.restore();
    }));

    // 6. Brazos (después de la cabeza para que la mano que saluda quede delante)
    parts.push(ctx => {
      const ph = phase();
      [-1, 1].forEach(side => {
        const sx = cx + side * (shW - armW * 0.45), sy = shY + armW * 0.55;
        let ex, ey, hx, hy;
        const fromAngles = (u, f) => {
          ex = sx + dir(u, side)[0] * upperArm; ey = sy + dir(u, side)[1] * upperArm;
          hx = ex + dir(f, side)[0] * foreArm; hy = ey + dir(f, side)[1] * foreArm;
        };
        if (pose === 'manos en cintura') {
          ex = cx + side * (shW + armW * 1.5); ey = (shY + waistY) / 2 + H * 0.02;
          hx = cx + side * hipW * 1.15; hy = waistY + H * 0.01;
        } else if (pose === 'saludo' && side === 1) {
          fromAngles(2.3, 2.95 + Math.sin(ph * 2) * 0.25);
        } else if (pose === 'brazos arriba') {
          fromAngles(2.5, 2.85);
        } else if (pose === 'sostener') {
          // Codos pegados y manos juntas al frente, a la altura de la cintura
          ex = cx + side * (shW + armW * 0.15); ey = shY + H * 0.15;
          hx = cx + side * armW * 0.8; hy = shY + H * 0.21;
        } else if (pose === 'señalar' && side === 1) {
          fromAngles(1.5, 1.62);
        } else if (pose === 'brazo arriba' && side === 1) {
          fromAngles(2.95, 3.05);
        } else if (pose === 'caminando') {
          const fwd = Math.max(0, -Math.sin(ph) * side);
          fromAngles(0.12 + fwd * 0.15, 0.06 - fwd * 0.9);
        } else {
          fromAngles(0.13, 0.06);
        }
        const sleeve = topType === 'vestido' && shortSleeves ? skin : topColor;
        seg(ctx, sx, sy, ex, ey, armW * 1.12, sleeve);
        seg(ctx, ex, ey, hx, hy, armW, shortSleeves ? skin : topColor);
        if (shortSleeves && topType !== 'vestido') seg(ctx, sx, sy, sx + (ex - sx) * 0.55, sy + (ey - sy) * 0.55, armW * 1.3, topColor);
        ctx.fillStyle = skin;
        ctx.beginPath(); ctx.arc(hx, hy, armW * 0.62, 0, Math.PI * 2); ctx.fill();
      });
    });

    build.info = `${topType} · ${bottomType} · ${pose}`;
    parts.geo = { cx, feetY, H, topType, bottomType, topColor, bottomColor, shoeColor, pose, face: faceGeo, height: p.height };
    return parts;
  }

  const config = {
    title: 'Generador de humanos',
    subtitle: 'Personas de cuerpo completo',
    newLabel: '🧍 Generar otra persona',
    fileName: 'humano',
    view: { w: 600, h: 1000 },
    duration: 1.8,
    build,
    stats: () => build.info,
    defaultPreset: 'Aleatorio',
    controls: [
      { group: 'Cuerpo', id: 'height', type: 'range', label: 'Estatura', min: 0.8, max: 1.15, step: 0.01 },
      { group: 'Cuerpo', id: 'build', type: 'range', label: 'Complexión', min: 0.7, max: 1.45, step: 0.01 },
      { group: 'Cuerpo', id: 'headSize', type: 'range', label: 'Tamaño de cabeza', min: 0.8, max: 1.4, step: 0.01 },
      { group: 'Cuerpo', id: 'pose', type: 'select', label: 'Pose', options: ['aleatorio', ...POSES] },
      { group: 'Cuerpo', id: 'variation', type: 'range', label: 'Variación aleatoria', min: 0, max: 1, step: 0.05,
        fmt: v => Math.round(v * 100) + ' %' },
      { group: 'Ropa', id: 'top', type: 'select', label: 'Parte de arriba', options: ['aleatorio', ...TOPS] },
      { group: 'Ropa', id: 'bottom', type: 'select', label: 'Parte de abajo', options: ['aleatorio', ...BOTTOMS] },
      { group: 'Cabeza', id: 'hair', type: 'select', label: 'Peinado', options: ['aleatorio', ...Rostro.HAIR_STYLES] },
      { group: 'Cabeza', id: 'beard', type: 'select', label: 'Vello facial', options: ['aleatorio', 'ninguna', 'barba', 'bigote', 'candado'] },
      { group: 'Cabeza', id: 'glasses', type: 'select', label: 'Gafas', options: ['aleatorio', 'no', 'redondas', 'cuadradas'] },
      { group: 'Cabeza', id: 'smile', type: 'range', label: 'Sonrisa', min: -1, max: 1, step: 0.05 },
      { group: 'Colores', id: 'randomColors', type: 'check', label: 'Colores aleatorios de piel, pelo y ropa' },
      { group: 'Colores', id: 'skinColor', type: 'color', label: 'Piel' },
      { group: 'Colores', id: 'hairColor', type: 'color', label: 'Pelo' },
      { group: 'Colores', id: 'topColor', type: 'color', label: 'Arriba' },
      { group: 'Colores', id: 'bottomColor', type: 'color', label: 'Abajo' },
      { group: 'Colores', id: 'bgColor', type: 'color', label: 'Fondo' }
    ],
    presets: {
      'Aleatorio': {
        height: 1, build: 1, headSize: 1, pose: 'aleatorio', variation: 0.6, top: 'aleatorio', bottom: 'aleatorio',
        hair: 'aleatorio', beard: 'aleatorio', glasses: 'aleatorio', smile: 0.4, randomColors: true,
        skinColor: '#e0ac69', hairColor: '#3b2a20', topColor: '#2f5d8a', bottomColor: '#2c3e50', bgColor: '#e3edf3'
      },
      'Saludando': {
        height: 1, build: 1, headSize: 1.1, pose: 'saludo', variation: 0.4, top: 'camiseta', bottom: 'pantalón',
        hair: 'aleatorio', beard: 'ninguna', glasses: 'aleatorio', smile: 0.9, randomColors: true,
        skinColor: '#f1c27d', hairColor: '#6a4e35', topColor: '#e0b040', bottomColor: '#1f3a60', bgColor: '#fff1c9'
      },
      'Oficinista': {
        height: 1.02, build: 1, headSize: 1, pose: 'de pie', variation: 0.3, top: 'camisa', bottom: 'pantalón',
        hair: 'corto', beard: 'aleatorio', glasses: 'cuadradas', smile: 0.2, randomColors: false,
        skinColor: '#d4a07a', hairColor: '#1c1a19', topColor: '#dfe9f5', bottomColor: '#2c3e50', bgColor: '#e6e6ea'
      },
      'Deportista': {
        height: 1.08, build: 1.1, headSize: 0.95, pose: 'manos en cintura', variation: 0.3, top: 'camiseta', bottom: 'shorts',
        hair: 'aleatorio', beard: 'ninguna', glasses: 'no', smile: 0.6, randomColors: true,
        skinColor: '#8d5524', hairColor: '#1c1a19', topColor: '#b33a3a', bottomColor: '#212121', bgColor: '#dff0e3'
      },
      'Invierno': {
        height: 1, build: 1.15, headSize: 1, pose: 'de pie', variation: 0.3, top: 'abrigo', bottom: 'pantalón',
        hair: 'aleatorio', beard: 'aleatorio', glasses: 'aleatorio', smile: 0.3, randomColors: false,
        skinColor: '#f9d7c0', hairColor: '#a0522d', topColor: '#7a2e2e', bottomColor: '#34495e', bgColor: '#e8f1f8'
      },
      'Fiesta': {
        height: 0.98, build: 0.95, headSize: 1.05, pose: 'brazos arriba', variation: 0.4, top: 'vestido', bottom: 'falda',
        hair: 'largo', beard: 'ninguna', glasses: 'no', smile: 1, randomColors: false,
        skinColor: '#c68642', hairColor: '#2a2f4a', topColor: '#8e44ad', bottomColor: '#8e44ad', bgColor: '#f7d6e0'
      },
      'Caminante': {
        height: 1, build: 1, headSize: 1, pose: 'caminando', variation: 0.5, top: 'suéter', bottom: 'aleatorio',
        hair: 'aleatorio', beard: 'aleatorio', glasses: 'aleatorio', smile: 0.4, randomColors: true,
        skinColor: '#e0ac69', hairColor: '#3b2a20', topColor: '#3a8a5a', bottomColor: '#5d4037', bgColor: '#eef3e6'
      }
    }
  };

  return { build, config, POSES, TOPS, BOTTOMS };
})();
