'use strict';

// Generador de carros: expone build(params, rand) y la configuración de su página.
const Carro = (() => {

  const CAR_COLORS = ['#c0392b', '#2e86de', '#f1c40f', '#27ae60', '#ecf0f1', '#2c3e50', '#e67e22', '#8e44ad',
    '#7f8c8d', '#16a085', '#d35400', '#1a1a1a', '#f78fb3'];

  // Proporciones de cada tipo, como fracción del largo del carro
  const TYPES = {
    'sedán':     { len: 1.00, wheel: 1.00, wr: .18, wf: .80, lift: 0,    bodyH: .12, cabH: .115, hood: .27, ws: .15, trunk: .21, rg: .13, rr: .05, fr: .06, drop: .015, roofR: 1,   doors: 4 },
    'deportivo': { len: 1.02, wheel: 0.95, wr: .17, wf: .81, lift: -.12, bodyH: .10, cabH: .085, hood: .34, ws: .19, trunk: .12, rg: .22, rr: .05, fr: .05, drop: .025, roofR: 1.3, doors: 2 },
    'SUV':       { len: 0.98, wheel: 1.15, wr: .17, wf: .82, lift: .35,  bodyH: .15, cabH: .14,  hood: .22, ws: .12, trunk: 0,   rg: .05, rr: .03, fr: .06, drop: .01,  roofR: .8,  doors: 4 },
    'pickup':    { len: 1.08, wheel: 1.10, wr: .16, wf: .82, lift: .35,  bodyH: .15, cabH: .14,  hood: .24, ws: .10, trunk: .38, rg: .04, rr: .02, fr: .05, drop: .01,  roofR: .8,  doors: 2 },
    'furgoneta': { len: 1.00, wheel: 1.00, wr: .16, wf: .83, lift: .2,   bodyH: .17, cabH: .19,  hood: .10, ws: .12, trunk: 0,   rg: .02, rr: .03, fr: .08, drop: .04,  roofR: .8,  doors: 2 },
    'compacto':  { len: 0.78, wheel: 1.05, wr: .17, wf: .82, lift: .05,  bodyH: .15, cabH: .15,  hood: .20, ws: .16, trunk: .02, rg: .16, rr: .1,  fr: .1,  drop: .03,  roofR: 2,   doors: 2 }
  };
  const orRandom = (v, list, R) => v === 'aleatorio' ? R.pick(list) : v;
  const lum = hex => { const n = parseInt(hex.slice(1), 16); return (0.3 * (n >> 16 & 255) + 0.59 * (n >> 8 & 255) + 0.11 * (n & 255)) / 255; };

  function build(p, R) {
    const v = p.variation;
    const type = orRandom(p.carType, Object.keys(TYPES), R);
    const base = TYPES[type];
    const T = {};
    Object.keys(base).forEach(k => T[k] = typeof base[k] === 'number' && k !== 'doors' ? base[k] * (1 + R.sym(0.08 * v)) : base[k]);

    const body = p.randomColors ? R.pick(CAR_COLORS) : p.bodyColor;
    const rimStyle = orRandom(p.rimStyle, ['rayos', 'estrella', 'tapacubos'], R);
    const stripes = p.stripes === 'aleatorio' ? R.chance(0.3) : p.stripes === 'sí';
    const spoiler = p.spoiler === 'aleatorio' ? (type === 'deportivo' ? R.chance(0.7) : type === 'sedán' ? R.chance(0.2) : false) : p.spoiler === 'sí';
    const rack = type === 'SUV' && R.chance(0.5);
    const stripeColor = lum(body) > 0.6 ? R.pick(['#1a1a1a', '#c0392b', '#2e86de']) : R.pick(['#ffffff', '#f1c40f', '#1a1a1a']);
    const night = p.scene && lum(p.skyColor) < 0.3;

    const groundY = 470;
    const L = 900 * p.length * T.len;
    const x0 = 600 - L / 2, x1 = 600 + L / 2;
    const r = L * 0.085 * p.wheelSize * T.wheel;
    const wy = groundY - r;
    const wheels = [x0 + L * T.wr, x0 + L * T.wf];
    const bottomY = wy + r * (0.45 - T.lift);
    const beltY = bottomY - L * T.bodyH * p.height;
    const roofY = beltY - L * T.cabH * p.height;
    const hatch = T.trunk < 0.04;

    // Pilares: trasero (A→B) y delantero (C→D)
    const rearA = hatch ? [x0, beltY] : [x0 + L * T.trunk, beltY];
    const rearB = [x0 + L * (T.trunk + T.rg), roofY];
    const frontC = [x1 - L * (T.hood + T.ws), roofY];
    const frontD = [x1 - L * T.hood, beltY];
    const xOn = (a, b, y) => a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]);

    function bodyPath(ctx) {
      const pts = [[x0, bottomY, 12]];
      if (hatch) pts.push([x0 - 2, beltY, L * T.rr]);
      else pts.push([x0 - 4, beltY + L * 0.01, L * T.rr], [rearA[0], rearA[1], 18]);
      pts.push([rearB[0], rearB[1], L * 0.04 * T.roofR], [frontC[0], frontC[1], L * 0.04 * T.roofR],
        [frontD[0], frontD[1], 18], [x1, beltY + L * T.drop, L * T.fr], [x1, bottomY, 12]);
      Gen.roundedPoly(ctx, pts);
    }

    // Ventanas
    const d = L * 0.018;
    const yTop = roofY + d, yBot = beltY - d * 0.6;
    const wl = y => xOn(rearA, rearB, y) + d * 1.5;
    const wr = y => xOn(frontC, frontD, y) - d * 1.2;
    const splits = type === 'furgoneta' ? [0.36, 0.7] : type === 'deportivo' || type === 'pickup' ? [] : [T.doors === 4 ? 0.5 : 0.62];
    const bx = t => wl(yBot) + (wr(yBot) - wl(yBot)) * t;
    const driver = p.driver;
    const parts = [];

    // 1. Escena
    const clouds = Array.from({ length: R.int(2, 5) }, () => [R.range(0, 1200), R.range(40, 200), R.range(0.6, 1.3)]);
    const stars = Array.from({ length: 70 }, () => [R.range(-200, 1400), R.range(-200, 330), R.range(0.8, 2.2)]);
    const hills = Array.from({ length: 7 }, (_, i) => [i * 220 - 200 + R.range(-40, 40), R.range(40, 130)]);
    parts.push(Gen.fondo(ctx => {
      if (!p.scene) {
        ctx.fillStyle = p.skyColor;
        ctx.fillRect(-2000, -2000, 5000, 5000);
        return;
      }
      const g = ctx.createLinearGradient(0, -200, 0, groundY);
      g.addColorStop(0, Gen.shade(p.skyColor, night ? -0.3 : -0.1));
      g.addColorStop(1, Gen.shade(p.skyColor, night ? 0.1 : 0.45));
      ctx.fillStyle = g;
      ctx.fillRect(-2000, -2000, 5000, 2000 + groundY);
      if (night) {
        ctx.fillStyle = '#ffffff';
        stars.forEach(([x, y, s]) => { ctx.globalAlpha = 0.4 + s / 4; ctx.fillRect(x, y, s, s); });
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#f4f1de';
        ctx.beginPath(); ctx.arc(1000, 110, 42, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillStyle = Gen.rgba('#fff3b0', 0.9);
        ctx.beginPath(); ctx.arc(1010, 100, 48, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = Gen.rgba('#ffffff', 0.85);
        clouds.forEach(([x, y, s]) => {
          ctx.beginPath();
          [[0, 0, 34], [36, -14, 40], [76, 0, 32], [38, 10, 36]].forEach(([dx, dy, rr]) => {
            ctx.moveTo(x + dx * s + rr * s, y + dy * s);
            ctx.arc(x + dx * s, y + dy * s, rr * s, 0, Math.PI * 2);
          });
          ctx.fill();
        });
      }
      ctx.fillStyle = night ? '#1b2a2a' : Gen.shade('#6fae62', -0.1);
      ctx.beginPath();
      ctx.moveTo(-2000, groundY - 40);
      hills.forEach(([x, h]) => ctx.quadraticCurveTo(x + 110, groundY - 40 - h * 2, x + 220, groundY - 40));
      ctx.lineTo(3000, groundY - 40);
      ctx.lineTo(3000, groundY);
      ctx.lineTo(-2000, groundY);
      ctx.fill();
      ctx.fillStyle = night ? '#2b2b30' : '#56575c';
      ctx.fillRect(-2000, groundY - 40, 5000, 3000);
      ctx.fillStyle = night ? '#1f3a1f' : '#78b35f';
      ctx.fillRect(-2000, groundY + 70, 5000, 3000);
      ctx.strokeStyle = Gen.rgba('#ffffff', 0.8);
      ctx.lineWidth = 6;
      ctx.setLineDash([60, 50]);
      ctx.beginPath(); ctx.moveTo(-2000, groundY + 32); ctx.lineTo(3000, groundY + 32); ctx.stroke();
      ctx.setLineDash([]);
    }));

    // 2. Sombra
    parts.push(ctx => {
      ctx.fillStyle = Gen.rgba('#000000', 0.28);
      ctx.beginPath();
      ctx.ellipse(600, groundY + 4, L * 0.55, 16, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // 3. Carrocería
    parts.push(ctx => {
      const g = ctx.createLinearGradient(0, roofY, 0, bottomY);
      g.addColorStop(0, Gen.shade(body, 0.18));
      g.addColorStop(0.55, body);
      g.addColorStop(1, Gen.shade(body, -0.25));
      ctx.fillStyle = g;
      ctx.beginPath();
      bodyPath(ctx);
      ctx.fill();
      ctx.save();
      ctx.clip();
      ctx.fillStyle = Gen.shade(body, -0.3);
      ctx.fillRect(x0 - 10, bottomY - L * 0.03, L + 20, L * 0.05);
      ctx.fillStyle = Gen.rgba('#ffffff', 0.18);
      ctx.fillRect(x0 - 10, beltY + L * 0.012, L + 20, 4);
      // pasos de rueda
      ctx.fillStyle = '#141414';
      wheels.forEach(x => { ctx.beginPath(); ctx.arc(x, wy, r * 1.13, 0, Math.PI * 2); ctx.fill(); });
      if (type === 'pickup') {
        ctx.fillStyle = Gen.shade(body, -0.4);
        ctx.fillRect(x0 + L * 0.02, beltY - 2, L * (T.trunk - 0.03), L * 0.018);
      }
      if (stripes) {
        ctx.fillStyle = stripeColor;
        const sy = beltY + (bottomY - beltY) * 0.42;
        ctx.fillRect(x0 - 10, sy, L + 20, L * 0.012);
        ctx.fillRect(x0 - 10, sy + L * 0.02, L + 20, L * 0.006);
      }
      ctx.restore();
      ctx.strokeStyle = Gen.shade(body, -0.45);
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      bodyPath(ctx);
      ctx.stroke();
    });

    // 4. Ventanas
    parts.push(ctx => {
      const edges = [0, ...splits, 1];
      const glass = ctx.createLinearGradient(0, roofY, 0, beltY);
      glass.addColorStop(0, Gen.shade(p.glassColor, 0.25));
      glass.addColorStop(1, Gen.shade(p.glassColor, -0.2));
      ctx.save();
      ctx.beginPath();
      for (let i = 0; i < edges.length - 1; i++) {
        const gap = d * 0.7;
        const left = i === 0 ? null : bx(edges[i]) + gap;
        const right = i === edges.length - 2 ? null : bx(edges[i + 1]) - gap;
        Gen.roundedPoly(ctx, [
          [left ?? wl(yBot), yBot], [left ?? wl(yTop), yTop],
          [right ?? wr(yTop), yTop], [right ?? wr(yBot), yBot]], 8);
      }
      ctx.fillStyle = glass;
      ctx.fill();
      ctx.clip();
      if (driver) {
        const hx = bx(edges[edges.length - 2]) + (wr(yBot) - bx(edges[edges.length - 2])) * 0.35;
        const hr = (beltY - roofY) * 0.24;
        ctx.fillStyle = Gen.rgba('#0b0b10', 0.55);
        ctx.beginPath();
        ctx.arc(hx, roofY + (beltY - roofY) * 0.45, hr, 0, Math.PI * 2);
        ctx.ellipse(hx, beltY, hr * 1.7, hr * 1.1, 0, Math.PI, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = Gen.rgba('#ffffff', 0.22);
      ctx.beginPath();
      ctx.moveTo(x0 + L * 0.35, roofY - 20);
      ctx.lineTo(x0 + L * 0.42, roofY - 20);
      ctx.lineTo(x0 + L * 0.3, beltY + 10);
      ctx.lineTo(x0 + L * 0.23, beltY + 10);
      ctx.fill();
      ctx.restore();
    });

    // 5. Puertas, manijas y espejo
    parts.push(ctx => {
      ctx.strokeStyle = Gen.shade(body, -0.4);
      ctx.lineWidth = 2.5;
      const doorBottom = bottomY - L * 0.035;
      const frontEdge = frontD[0] - d * 0.5;
      const lines = [frontEdge];
      if (type !== 'furgoneta') {
        const bEdge = splits.length ? bx(splits[0]) : bx(0.55);
        lines.push(bEdge);
        if (T.doors === 4) lines.push(wl(yBot) - d * 0.5);
      } else {
        lines.push(bx(0.36));
      }
      lines.forEach(x => {
        ctx.beginPath();
        ctx.moveTo(x, beltY + 4);
        ctx.quadraticCurveTo(x + 6, (beltY + doorBottom) / 2, x - 2, doorBottom);
        ctx.stroke();
      });
      ctx.fillStyle = Gen.shade(body, -0.45);
      for (let i = 1; i < lines.length; i++) {
        ctx.beginPath();
        Gen.roundedPoly(ctx, [[lines[i] + 12, beltY + L * 0.018], [lines[i] + 12 + L * 0.035, beltY + L * 0.018],
          [lines[i] + 12 + L * 0.035, beltY + L * 0.026], [lines[i] + 12, beltY + L * 0.026]], 3);
        ctx.fill();
      }
      ctx.fillStyle = Gen.shade(body, -0.15);
      ctx.beginPath();
      Gen.roundedPoly(ctx, [[frontD[0] - L * 0.03, beltY - L * 0.025], [frontD[0] + L * 0.005, beltY - L * 0.02],
        [frontD[0] + L * 0.005, beltY + 2], [frontD[0] - L * 0.03, beltY + 2]], 6);
      ctx.fill();
      ctx.stroke();
    });

    // 6. Luces y parachoques
    parts.push(ctx => {
      const hy = beltY + L * T.drop + L * 0.028;
      if (night) {
        const g = ctx.createLinearGradient(x1, 0, x1 + 420, 0);
        g.addColorStop(0, Gen.rgba('#fff6c8', 0.55));
        g.addColorStop(1, Gen.rgba('#fff6c8', 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(x1 - 6, hy - 8);
        ctx.lineTo(x1 + 420, hy - 60);
        ctx.lineTo(x1 + 420, groundY + 20);
        ctx.lineTo(x1 - 6, hy + 8);
        ctx.fill();
      }
      ctx.fillStyle = '#fff6c8';
      ctx.strokeStyle = Gen.shade(body, -0.5);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x1 - L * 0.022, hy, L * 0.022, L * 0.012, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#d7263d';
      const ty = beltY + L * 0.012;
      ctx.beginPath();
      Gen.roundedPoly(ctx, [[x0 - 2, ty], [x0 + L * 0.018, ty], [x0 + L * 0.018, ty + L * 0.035], [x0 - 2, ty + L * 0.035]], 4);
      ctx.fill();
      ctx.fillStyle = '#2a2a2a';
      [[x1 - L * 0.06, x1 + 8], [x0 - 8, x0 + L * 0.06]].forEach(([a, b]) => {
        ctx.beginPath();
        Gen.roundedPoly(ctx, [[a, bottomY - L * 0.035], [b, bottomY - L * 0.035], [b, bottomY + 3], [a, bottomY + 3]], 6);
        ctx.fill();
      });
    });

    // 7. Alerón o parrilla de techo
    if (spoiler) {
      parts.push(ctx => {
        ctx.fillStyle = Gen.shade(body, -0.35);
        const sx = hatch ? rearB[0] : x0 + L * 0.015;
        const sy = hatch ? roofY : beltY;
        ctx.fillRect(sx + L * 0.02, sy - L * 0.04, 6, L * 0.04);
        ctx.fillRect(sx + L * 0.07, sy - L * 0.04, 6, L * 0.04);
        ctx.beginPath();
        Gen.roundedPoly(ctx, [[sx - 6, sy - L * 0.055], [sx + L * 0.11, sy - L * 0.05], [sx + L * 0.11, sy - L * 0.035], [sx - 6, sy - L * 0.035]], 5);
        ctx.fill();
      });
    }
    if (rack) {
      parts.push(ctx => {
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(rearB[0] + L * 0.03, roofY - L * 0.025);
        ctx.lineTo(frontC[0] - L * 0.03, roofY - L * 0.025);
        [0.1, 0.5, 0.9].forEach(t => {
          const x = rearB[0] + L * 0.03 + (frontC[0] - rearB[0] - L * 0.06) * t;
          ctx.moveTo(x, roofY - L * 0.025);
          ctx.lineTo(x, roofY + 2);
        });
        ctx.stroke();
      });
    }

    // 8. Ruedas
    const spokes = R.int(5, 8);
    const rot = [R.range(0, Math.PI), R.range(0, Math.PI)];
    wheels.forEach((x, i) => {
      parts.push(ctx => {
        ctx.fillStyle = '#1b1b1b';
        ctx.beginPath(); ctx.arc(x, wy, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = r * 0.08;
        ctx.beginPath(); ctx.arc(x, wy, r * 0.84, 0, Math.PI * 2); ctx.stroke();
        const rr = r * 0.62;
        ctx.fillStyle = Gen.shade(p.rimColor, -0.35);
        ctx.beginPath(); ctx.arc(x, wy, rr, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = p.rimColor;
        ctx.strokeStyle = p.rimColor;
        if (rimStyle === 'tapacubos') {
          ctx.beginPath(); ctx.arc(x, wy, rr * 0.92, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = Gen.shade(p.rimColor, -0.3);
          for (let k = 0; k < spokes; k++) {
            const a = (rot[i] + (p.spin || 0)) + k * Math.PI * 2 / spokes;
            ctx.beginPath(); ctx.arc(x + Math.cos(a) * rr * 0.6, wy + Math.sin(a) * rr * 0.6, rr * 0.12, 0, Math.PI * 2); ctx.fill();
          }
        } else if (rimStyle === 'estrella') {
          ctx.beginPath();
          for (let k = 0; k < spokes * 2; k++) {
            const a = (rot[i] + (p.spin || 0)) + k * Math.PI / spokes;
            const rad = k % 2 ? rr * 0.3 : rr * 0.95;
            ctx.lineTo(x + Math.cos(a) * rad, wy + Math.sin(a) * rad);
          }
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.lineWidth = rr * 0.16;
          ctx.beginPath();
          for (let k = 0; k < spokes; k++) {
            const a = (rot[i] + (p.spin || 0)) + k * Math.PI * 2 / spokes;
            ctx.moveTo(x, wy);
            ctx.lineTo(x + Math.cos(a) * rr * 0.92, wy + Math.sin(a) * rr * 0.92);
          }
          ctx.stroke();
          ctx.lineWidth = rr * 0.1;
          ctx.beginPath(); ctx.arc(x, wy, rr * 0.92, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.fillStyle = Gen.shade(p.rimColor, -0.2);
        ctx.beginPath(); ctx.arc(x, wy, rr * 0.22, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = Gen.rgba('#ffffff', 0.18);
        ctx.beginPath(); ctx.arc(x - rr * 0.3, wy - rr * 0.3, rr * 0.35, 0, Math.PI * 2); ctx.fill();
      });
    });

    build.info = `${type} · rines ${rimStyle}`;
    // Datos para componer el carro en otras escenas (mundo.html)
    parts.geo = { x0, x1, groundY, L, r, night, body, type };
    return parts;
  }

  const config = {
    title: 'Generador de carros',
    subtitle: 'Carros procedurales',
    newLabel: '🚗 Generar otro carro',
    fileName: 'carro',
    view: { w: 1200, h: 620 },
    build,
    stats: () => build.info,
    defaultPreset: 'Aleatorio',
    controls: [
      { group: 'Tipo y forma', id: 'carType', type: 'select', label: 'Tipo de carro', options: ['aleatorio', ...Object.keys(TYPES)] },
      { group: 'Tipo y forma', id: 'length', type: 'range', label: 'Largo', min: 0.8, max: 1.15, step: 0.01 },
      { group: 'Tipo y forma', id: 'height', type: 'range', label: 'Altura', min: 0.75, max: 1.3, step: 0.01 },
      { group: 'Tipo y forma', id: 'wheelSize', type: 'range', label: 'Tamaño de ruedas', min: 0.75, max: 1.4, step: 0.01 },
      { group: 'Tipo y forma', id: 'variation', type: 'range', label: 'Variación aleatoria', min: 0, max: 1, step: 0.05,
        fmt: v => Math.round(v * 100) + ' %' },
      { group: 'Detalles', id: 'rimStyle', type: 'select', label: 'Rines', options: ['aleatorio', 'rayos', 'estrella', 'tapacubos'] },
      { group: 'Detalles', id: 'stripes', type: 'select', label: 'Franjas', options: ['aleatorio', 'sí', 'no'] },
      { group: 'Detalles', id: 'spoiler', type: 'select', label: 'Alerón', options: ['aleatorio', 'sí', 'no'] },
      { group: 'Detalles', id: 'driver', type: 'check', label: 'Mostrar conductor' },
      { group: 'Colores y escena', id: 'scene', type: 'check', label: 'Escena (cielo, colinas y carretera)' },
      { group: 'Colores y escena', id: 'randomColors', type: 'check', label: 'Color de carrocería aleatorio' },
      { group: 'Colores y escena', id: 'bodyColor', type: 'color', label: 'Carrocería' },
      { group: 'Colores y escena', id: 'glassColor', type: 'color', label: 'Vidrios' },
      { group: 'Colores y escena', id: 'rimColor', type: 'color', label: 'Rines' },
      { group: 'Colores y escena', id: 'skyColor', type: 'color', label: 'Cielo / fondo' }
    ],
    presets: {
      'Aleatorio': {
        carType: 'aleatorio', length: 1, height: 1, wheelSize: 1, variation: 0.6, rimStyle: 'aleatorio', stripes: 'aleatorio',
        spoiler: 'aleatorio', driver: true, scene: true, randomColors: true,
        bodyColor: '#2e86de', glassColor: '#9fc6d9', rimColor: '#c9ccd1', skyColor: '#8ec5ea'
      },
      'Deportivo rojo': {
        carType: 'deportivo', length: 1.05, height: 0.85, wheelSize: 1.05, variation: 0.2, rimStyle: 'estrella', stripes: 'sí',
        spoiler: 'sí', driver: true, scene: true, randomColors: false,
        bodyColor: '#c0392b', glassColor: '#3b4a5a', rimColor: '#d9d9d9', skyColor: '#f6b26b'
      },
      'Todoterreno': {
        carType: 'SUV', length: 1, height: 1.1, wheelSize: 1.3, variation: 0.2, rimStyle: 'rayos', stripes: 'no',
        spoiler: 'no', driver: true, scene: true, randomColors: false,
        bodyColor: '#556b2f', glassColor: '#7d9aa8', rimColor: '#2a2a2a', skyColor: '#9ecae1'
      },
      'Pickup de campo': {
        carType: 'pickup', length: 1.05, height: 1.05, wheelSize: 1.2, variation: 0.3, rimStyle: 'tapacubos', stripes: 'aleatorio',
        spoiler: 'no', driver: true, scene: true, randomColors: false,
        bodyColor: '#e67e22', glassColor: '#9fc6d9', rimColor: '#e0e0e0', skyColor: '#a7d3f2'
      },
      'Furgoneta retro': {
        carType: 'furgoneta', length: 0.95, height: 1.05, wheelSize: 0.9, variation: 0.2, rimStyle: 'tapacubos', stripes: 'sí',
        spoiler: 'no', driver: true, scene: true, randomColors: false,
        bodyColor: '#f1c40f', glassColor: '#b8dce8', rimColor: '#f5f5f5', skyColor: '#f7c6d9'
      },
      'Compacto urbano': {
        carType: 'compacto', length: 1, height: 1, wheelSize: 1, variation: 0.3, rimStyle: 'aleatorio', stripes: 'no',
        spoiler: 'no', driver: true, scene: false, randomColors: true,
        bodyColor: '#16a085', glassColor: '#a9d0de', rimColor: '#c9ccd1', skyColor: '#eef1f4'
      },
      'De noche': {
        carType: 'aleatorio', length: 1, height: 1, wheelSize: 1, variation: 0.5, rimStyle: 'aleatorio', stripes: 'aleatorio',
        spoiler: 'aleatorio', driver: true, scene: true, randomColors: true,
        bodyColor: '#2e86de', glassColor: '#34495e', rimColor: '#aab0b8', skyColor: '#0d1b2a'
      }
    }
  };

  return { build, config };
})();
