'use strict';

/*
 * Base común de los generadores (rostros, carros, casas).
 * Misma metodología que el generador de árboles: números aleatorios con semilla,
 * parámetros ajustables, estilos predefinidos, animación por etapas, exportación
 * a PNG y enlaces compartibles.
 *
 * Cada página llama a Gen.crear({ ... }) con:
 *   title, subtitle, newLabel, view: {w, h}, controls: [...], presets: {...},
 *   defaultPreset, build(params, rand) -> lista de funciones de dibujo (partes).
 * Las partes marcadas con Gen.fondo(fn) se omiten al exportar con fondo transparente.
 */
const Gen = (() => {
  const $ = id => document.getElementById(id);

  const NAV = [
    ['index.html', 'Árboles'],
    ['rostros.html', 'Rostros'],
    ['carros.html', 'Carros'],
    ['casas.html', 'Casas'],
    ['humanos.html', 'Humanos'],
    ['mundo.html', 'Mundo'],
    ['mundo_ingles.html', 'Inglés'],
    ['antes_arboles.html', 'Versión anterior']
  ];

  /* ---------- Números aleatorios con semilla ---------- */

  function hashString(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return h >>> 0;
  }

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function makeRand(seed) {
    const r = mulberry32(hashString(String(seed)));
    const f = () => r();
    f.range = (a, b) => a + r() * (b - a);
    f.int = (a, b) => Math.floor(a + r() * (b - a + 1));
    f.pick = arr => arr[Math.floor(r() * arr.length)];
    f.chance = p => r() < p;
    f.sym = amt => (r() * 2 - 1) * amt;
    return f;
  }

  function randomSeed() {
    return Math.random().toString(36).slice(2, 8);
  }

  /* ---------- Colores ---------- */

  function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgbToHex(c) {
    return '#' + c.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  }
  function mix(a, b, t) {
    const A = hexToRgb(a), B = hexToRgb(b);
    return rgbToHex(A.map((v, i) => v + (B[i] - v) * t));
  }
  // amt > 0 aclara, amt < 0 oscurece (rango -1..1)
  function shade(hex, amt) {
    return amt >= 0 ? mix(hex, '#ffffff', amt) : mix(hex, '#000000', -amt);
  }
  function rgba(hex, a) {
    const [r, g, b] = hexToRgb(hex);
    return `rgba(${r},${g},${b},${a})`;
  }

  /* ---------- Ayudas de dibujo ---------- */

  // Polígono con esquinas redondeadas: puntos [[x, y, radio?], ...]
  function roundedPoly(ctx, pts, defR = 0) {
    const n = pts.length;
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const start = mid(pts[n - 1], pts[0]);
    ctx.moveTo(start[0], start[1]);
    for (let i = 0; i < n; i++) {
      const p = pts[i], q = pts[(i + 1) % n];
      const r = p[2] !== undefined ? p[2] : defR;
      ctx.arcTo(p[0], p[1], q[0], q[1], r);
    }
    ctx.closePath();
  }

  function fondo(fn) { fn.bg = true; return fn; }

  function navHTML() {
    const here = location.pathname.split('/').pop() || 'index.html';
    return NAV.map(([href, name]) =>
      `<a href="${href}"${href === here ? ' class="active"' : ''}>${name}</a>`).join('');
  }

  /* ---------- Interfaz y ciclo de vida ---------- */

  function crear(cfg) {
    const view = cfg.view;
    const controls = cfg.controls;
    let params = {};
    let parts = [];
    let anim = null;

    buildUI();
    const canvas = $('canvas');
    const ctx = canvas.getContext('2d');

    function controlHTML(c) {
      if (c.type === 'range') {
        return `<label><span class="row">${c.label} <output id="${c.id}Out"></output></span>
          <input type="range" id="${c.id}" min="${c.min}" max="${c.max}" step="${c.step}"></label>`;
      }
      if (c.type === 'select') {
        const opts = c.options.map(o => Array.isArray(o) ? o : [o, o])
          .map(([v, t]) => `<option value="${v}">${t}</option>`).join('');
        return `<label>${c.label}<select id="${c.id}">${opts}</select></label>`;
      }
      if (c.type === 'check') {
        return `<label class="check"><input type="checkbox" id="${c.id}"> ${c.label}</label>`;
      }
      return `<label><input type="color" id="${c.id}"> ${c.label}</label>`;
    }

    function buildUI() {
      const nav = navHTML();

      const groups = [];
      controls.forEach(c => {
        let g = groups.find(x => x.name === c.group);
        if (!g) groups.push(g = { name: c.group, items: [] });
        g.items.push(c);
      });
      const groupHTML = groups.map(g => {
        let html = '', colors = '';
        g.items.forEach(c => {
          if (c.type === 'color') { colors += controlHTML(c); return; }
          if (colors) { html += `<div class="colors">${colors}</div>`; colors = ''; }
          html += controlHTML(c);
        });
        if (colors) html += `<div class="colors">${colors}</div>`;
        return `<fieldset><legend>${g.name}</legend>${html}</fieldset>`;
      }).join('');

      document.body.innerHTML = `
        <aside>
          <h1>${cfg.title} <small>${cfg.subtitle} · Espacio o Enter = nuevo</small></h1>
          <nav class="nav">${nav}</nav>
          <button class="primary" id="btnNew">${cfg.newLabel}</button>
          <label>Estilo predefinido <select id="preset"></select></label>
          <fieldset>
            <legend>Semilla</legend>
            <div class="seed">
              <input type="text" id="seed" spellcheck="false" aria-label="Semilla">
              <button id="btnRedraw" title="Volver a dibujar con esta semilla">↻</button>
            </div>
            <span class="hint">La misma semilla y ajustes producen siempre el mismo resultado.</span>
          </fieldset>
          ${groupHTML}
          <fieldset>
            <legend>Animación y exportación</legend>
            <label class="check"><input type="checkbox" id="animate"> Animar el dibujo por partes</label>
            <label><span class="row">Duración <output id="durationOut"></output></span>
              <input type="range" id="duration" min="0.3" max="5" step="0.1"></label>
            <label class="check"><input type="checkbox" id="transparent"> Fondo transparente al exportar</label>
          </fieldset>
          <div class="actions">
            <button id="btnPng">⬇ Descargar PNG</button>
            <button id="btnLink">🔗 Copiar enlace</button>
          </div>
        </aside>
        <main>
          <canvas id="canvas"></canvas>
          <div id="stats"></div>
          <div id="toast"></div>
        </main>`;
    }

    const allControls = [...controls,
      { id: 'animate', type: 'check' },
      { id: 'duration', type: 'range', fmt: v => v + ' s' },
      { id: 'transparent', type: 'check' }];

    function readParams() {
      const p = { seed: $('seed').value.trim() || '0' };
      allControls.forEach(c => {
        const el = $(c.id);
        p[c.id] = c.type === 'range' ? parseFloat(el.value) : c.type === 'check' ? el.checked : el.value;
      });
      return p;
    }

    function writeParams(p) {
      if (p.seed !== undefined) $('seed').value = p.seed;
      allControls.forEach(c => {
        if (p[c.id] === undefined) return;
        if (c.type === 'check') $(c.id).checked = !!p[c.id];
        else $(c.id).value = p[c.id];
      });
    }

    function updateOutputs() {
      allControls.forEach(c => {
        const o = $(c.id + 'Out');
        if (o) o.textContent = c.fmt ? c.fmt(parseFloat($(c.id).value)) : $(c.id).value;
      });
      $('duration').disabled = !$('animate').checked;
    }

    function render(target, W, H, progress = Infinity, transparent = false) {
      target.save();
      target.clearRect(0, 0, W, H);
      const s = Math.min(W / view.w, H / view.h);
      target.translate((W - view.w * s) / 2, (H - view.h * s) / 2);
      target.scale(s, s);
      target.lineCap = 'round';
      target.lineJoin = 'round';
      const n = parts.length, k = 2.5;
      parts.forEach((part, i) => {
        if (transparent && part.bg) return;
        const a = part.bg ? 1 : Math.max(0, Math.min(1, (progress * (n + k) - i) / k));
        if (a <= 0) return;
        target.save();
        target.globalAlpha = a;
        if (a < 1) target.translate(0, (1 - a) * 14);
        part(target);
        target.restore();
      });
      target.restore();
    }

    function draw(progress = Infinity) {
      render(ctx, canvas.width, canvas.height, progress);
    }

    function resizeCanvas() {
      const dpr = window.devicePixelRatio || 1;
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      if (!anim) draw();
    }

    function stopAnimation() {
      if (anim) { cancelAnimationFrame(anim); anim = null; }
    }

    function animate() {
      stopAnimation();
      const start = performance.now();
      const ms = params.duration * 1000;
      const step = now => {
        const t = Math.min(1, (now - start) / ms);
        draw(1 - Math.pow(1 - t, 2));
        anim = t < 1 ? requestAnimationFrame(step) : null;
      };
      anim = requestAnimationFrame(step);
    }

    function regenerate(withAnimation = false) {
      updateOutputs();
      params = readParams();
      parts = cfg.build(params, makeRand(params.seed));
      const extra = cfg.stats ? cfg.stats(params) + ' · ' : '';
      $('stats').textContent = `${extra}semilla «${params.seed}»`;
      history.replaceState(null, '', '#' + serialize(params));
      if (withAnimation && params.animate) animate();
      else { stopAnimation(); draw(); }
    }

    function serialize(p) {
      const q = new URLSearchParams();
      q.set('seed', p.seed);
      allControls.forEach(c => q.set(c.id, c.type === 'check' ? (p[c.id] ? 1 : 0) : p[c.id]));
      return q.toString();
    }

    function deserialize(hash) {
      const q = new URLSearchParams(hash.replace(/^#/, ''));
      if (!q.has('seed')) return null;
      const p = { seed: q.get('seed') };
      allControls.forEach(c => {
        if (!q.has(c.id)) return;
        const v = q.get(c.id);
        if (c.type === 'check') p[c.id] = v === '1';
        else if (c.type === 'range') { if (!isNaN(parseFloat(v))) p[c.id] = parseFloat(v); }
        else if (c.type === 'color') { if (/^#[0-9a-f]{6}$/i.test(v)) p[c.id] = v; }
        else if (c.options.some(o => (Array.isArray(o) ? o[0] : o) === v)) p[c.id] = v;
      });
      return p;
    }

    function toast(msg) {
      const el = $('toast');
      el.textContent = msg;
      el.classList.add('show');
      clearTimeout(toast.t);
      toast.t = setTimeout(() => el.classList.remove('show'), 1600);
    }

    function newOne() {
      $('seed').value = randomSeed();
      regenerate(true);
    }

    function exportPng() {
      const size = 2000;
      const off = document.createElement('canvas');
      const aspect = view.w / view.h;
      off.width = aspect >= 1 ? size : Math.round(size * aspect);
      off.height = aspect >= 1 ? Math.round(size / aspect) : size;
      render(off.getContext('2d'), off.width, off.height, Infinity, params.transparent);
      off.toBlob(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${cfg.fileName}-${params.seed}.png`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      });
    }

    // Inicio
    const sel = $('preset');
    Object.keys(cfg.presets).forEach(name => sel.add(new Option(name, name)));
    sel.add(new Option('Personalizado', 'custom'));
    writeParams({ ...cfg.presets[cfg.defaultPreset], animate: true, duration: cfg.duration || 1.6, transparent: false });
    sel.value = cfg.defaultPreset;

    const fromUrl = deserialize(location.hash);
    if (fromUrl) { writeParams(fromUrl); sel.value = 'custom'; }
    else $('seed').value = randomSeed();

    sel.addEventListener('change', () => {
      if (sel.value === 'custom') return;
      writeParams(cfg.presets[sel.value]);
      regenerate(true);
    });

    document.querySelectorAll('aside input, aside select').forEach(el => {
      if (el.id === 'seed' || el.id === 'preset') return;
      const cosmetic = el.id === 'animate' || el.id === 'duration' || el.id === 'transparent';
      el.addEventListener('input', () => {
        if (!cosmetic) sel.value = 'custom';
        regenerate(false);
      });
    });
    $('seed').addEventListener('change', () => regenerate(true));
    $('seed').addEventListener('keydown', e => { if (e.key === 'Enter') { e.stopPropagation(); regenerate(true); } });

    $('btnNew').addEventListener('click', newOne);
    $('btnRedraw').addEventListener('click', () => regenerate(true));
    $('btnPng').addEventListener('click', exportPng);
    $('btnLink').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(location.href); toast('Enlace copiado'); }
      catch { toast('No se pudo copiar el enlace'); }
    });

    document.addEventListener('keydown', e => {
      const tag = e.target.tagName;
      if ((e.key === ' ' || e.key === 'Enter') && tag !== 'INPUT' && tag !== 'SELECT' && tag !== 'BUTTON') {
        e.preventDefault();
        newOne();
      }
    });

    new ResizeObserver(resizeCanvas).observe(canvas);
    resizeCanvas();
    regenerate(true);
  }

  return { crear, fondo, mix, shade, rgba, roundedPoly, makeRand, randomSeed, navHTML };
})();
