'use strict';

/* ===================== Utilidades ===================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const azar = a => a[Math.floor(Math.random() * a.length)];
const barajar = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const porSimbolo = Object.fromEntries(FONEMAS.map(f => [f.s, f]));
const NIVEL_TXT = { 1: 'Existe en español', 2: 'Parecido al español', 3: 'Nuevo para ti' };
const GRUPOS = [
  { g: 'vocal', t: 'Vocales', d: 'El inglés americano tiene unas 12 vocales simples; el español solo 5. Aquí está el mayor reto.' },
  { g: 'diptongo', t: 'Diptongos', d: 'Dos vocales que se deslizan en una sola sílaba.' },
  { g: 'vocal+r', t: 'Vocales con R', d: 'En inglés americano la r siempre se pronuncia y «colorea» la vocal anterior.' },
  { g: 'consonante', t: 'Consonantes', d: '24 consonantes. Varias no existen en español o cambian de forma importante.' }
];

function ejParse(str) {
  const [w, ipa, letras] = str.split('|');
  return { w, ipa, letras };
}
function resaltar(w, letras) {
  if (!letras) return esc(w);
  const i = w.toLowerCase().indexOf(letras.toLowerCase());
  if (i < 0) return esc(w);
  return esc(w.slice(0, i)) + '<mark>' + esc(w.slice(i, i + letras.length)) + '</mark>' + esc(w.slice(i + letras.length));
}

/* ===================== Progreso (Supabase, por usuario) =====================
   Se guarda en la tabla progreso_apps (app = 'fonetica') con abu-progreso.js,
   que además deja una copia local por si se cae la conexión. */
const baseProgreso = () => ({ vistos: {}, dominados: {}, lecciones: {}, fon: {}, ok: 0, n: 0, racha: 0, mejorRacha: 0, voz: '' });
const P = baseProgreso();
function guardar() { if (window.AbuProgreso) AbuProgreso.guardar(P); }
function registrar(simbolo, acierto) {
  P.n++;
  if (acierto) { P.ok++; P.racha++; P.mejorRacha = Math.max(P.mejorRacha, P.racha); } else P.racha = 0;
  if (simbolo) {
    const r = P.fon[simbolo] || (P.fon[simbolo] = { ok: 0, n: 0 });
    r.n++; if (acierto) r.ok++;
  }
  guardar();
  pintarRacha();
}
function pintarRacha() { $('#rachaTop').textContent = '🔥 ' + P.racha; }

/* ===================== Voz (Web Speech API) ===================== */
const hayVoz = 'speechSynthesis' in window;
let voces = [];
function cargarVoces() {
  if (!hayVoz) return;
  voces = speechSynthesis.getVoices().filter(v => /^en[-_]/i.test(v.lang));
}
function vozElegida() {
  if (!voces.length) cargarVoces();
  if (P.voz) { const v = voces.find(v => v.name === P.voz); if (v) return v; }
  const us = voces.filter(v => /en[-_]US/i.test(v.lang));
  return us.find(v => /google|natural|samantha|aria|jenny|guy/i.test(v.name)) || us[0] || voces[0] || null;
}
function hablar(texto, lento) {
  if (!hayVoz) return;
  texto = texto.replace(/\(.*?\)/g, '').trim();
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(texto);
  u.lang = 'en-US';
  const v = vozElegida(); if (v) u.voice = v;
  u.rate = lento ? 0.5 : 0.88;
  speechSynthesis.speak(u);
}
if (hayVoz) { cargarVoces(); speechSynthesis.addEventListener('voiceschanged', cargarVoces); }
setTimeout(() => {
  const av = $('#avisoVoz');
  if (!hayVoz) { av.textContent = '⚠️ Tu navegador no permite reproducir audio con voz sintética. Prueba con Chrome, Edge o Safari.'; av.classList.remove('oculto'); }
  else if (!voces.length) { av.innerHTML = 'ℹ️ No encontramos una voz en inglés instalada. El audio puede sonar con acento. En el celular, instala «Inglés (Estados Unidos)» en los ajustes de texto a voz.'; av.classList.remove('oculto'); }
}, 2500);

// Delegación: cualquier elemento con data-say reproduce audio
document.addEventListener('click', e => {
  const b = e.target.closest('[data-say]');
  if (b) { e.stopPropagation(); hablar(b.dataset.say, b.dataset.lento === '1'); }
  const f = e.target.closest('[data-fon]');
  if (f && !b) { e.preventDefault(); abrirFicha(f.dataset.fon); }
});

/* ===================== Tokenizador AFI ===================== */
const VOC = 'iɪɛæɑɔʌəʊuɝɚeaoʊ';
const SIMBOLOS = FONEMAS.map(f => f.s).sort((a, b) => b.length - a.length);
function tokenizar(ipa) {
  const out = [];
  let i = 0;
  const s = ipa.replace(/ɹ/g, 'r');
  while (i < s.length) {
    const c = s[i];
    if ('ˈˌ .'.includes(c)) { if (c !== ' ' && c !== '.') out.push({ t: c, marca: true }); i++; continue; }
    let hecho = false;
    for (const sim of SIMBOLOS) {
      if (s.startsWith(sim, i)) {
        // vocal+r solo si no la sigue otra vocal (very = v ɛ r i)
        if (porSimbolo[sim].g === 'vocal+r' && i + sim.length < s.length && VOC.includes(s[i + sim.length])) continue;
        out.push({ t: sim, f: porSimbolo[sim] }); i += sim.length; hecho = true; break;
      }
    }
    if (hecho) continue;
    // alófonos y diacríticos
    const alo = { 'ɾ': 'flap', 'ʔ': 'glotal', 'ɫ': 'l oscura', 'ʰ': 'aspiración', '̩': 'silábica' };
    if (c === 'ʰ' || c === '̩') { if (out.length) out[out.length - 1].t += c; i++; continue; }
    out.push({ t: c, alo: alo[c] || '' }); i++;
  }
  return out;
}

/* ===================== Índice de palabras ===================== */
const PALABRAS = (() => {
  const m = new Map();
  FONEMAS.forEach(f => f.ej.forEach(e => { const p = ejParse(e); if (!m.has(p.w.toLowerCase())) m.set(p.w.toLowerCase(), { w: p.w, ipa: p.ipa }); }));
  ESPECIALES.forEach(x => x.ej.forEach(e => { const [w, ipa] = e.split('|'); if (!m.has(w.toLowerCase())) m.set(w.toLowerCase(), { w, ipa }); }));
  EXTRA.forEach(e => { const [w, ipa] = e.split('|'); if (!m.has(w.toLowerCase())) m.set(w.toLowerCase(), { w, ipa }); });
  const arr = [...m.values()];
  arr.forEach(p => { p.toks = tokenizar(p.ipa); p.fons = new Set(p.toks.filter(t => t.f).map(t => t.f.s)); });
  return arr;
})();

/* ===================== Lecciones (ruta de estudio) ===================== */
const LECCIONES = [
  { t: 'Calentamiento: sonidos que ya conoces', s: ['i', 'ɛ', 'u', 'eɪ', 'aɪ', 'ɔɪ', 'aʊ'], d: 'Vocales y diptongos casi iguales al español.' },
  { t: 'Sheep vs. Ship', s: ['i', 'ɪ'], d: 'La i larga y la i corta: el contraste más famoso.' },
  { t: 'Las cuatro «a»', s: ['æ', 'ɛ', 'ʌ', 'ɑ'], d: 'cat, bed, cup, hot: cuatro vocales distintas.' },
  { t: 'Pool vs. Pull', s: ['u', 'ʊ'], d: 'La u larga y la u corta relajada.' },
  { t: 'La schwa y la R vocal', s: ['ə', 'ɝ', 'ɚ'], d: 'El sonido más común del inglés y la vocal de «bird».' },
  { t: 'Las «o» del inglés', s: ['ɔ', 'ɑ', 'oʊ'], d: 'law, hot, go: no hay una «o» pura.' },
  { t: 'Vocales + R', s: ['ɪr', 'ɛr', 'ɑr', 'ɔr', 'ʊr', 'aɪr'], d: 'near, hair, car, door, tour, fire.' },
  { t: 'Explosivas con aire', s: ['p', 'b', 't', 'd', 'k', 'ɡ'], d: 'La aspiración de p, t, k y la b de verdad.' },
  { t: 'B vs. V', s: ['b', 'v', 'f', 'w'], d: 'En inglés son sonidos diferentes: berry ≠ very.' },
  { t: 'Los sonidos TH', s: ['θ', 'ð', 't', 'd', 's'], d: 'think y this: la lengua entre los dientes.' },
  { t: 'S vs. Z', s: ['s', 'z'], d: 'La z inglesa zumba como una abeja.' },
  { t: 'Sh, Ch, J y Y', s: ['ʃ', 'ʒ', 'tʃ', 'dʒ', 'j'], d: 'shoe, vision, chair, job, yes.' },
  { t: 'R americana, L y H', s: ['r', 'l', 'h'], d: 'La r que no vibra y la h que es solo aire.' },
  { t: 'Nasales', s: ['m', 'n', 'ŋ'], d: 'sin vs. sing: la ng al fondo de la boca.' }
];

/* ===================== Navegación ===================== */
let tabActual = 'aprende';
function ir(tab) {
  tabActual = tab;
  $$('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
  const b = $(`#tabs button[data-tab="${tab}"]`); if (b) b.scrollIntoView({ inline: 'nearest', block: 'nearest' });
  VISTAS[tab]();
  if (location.hash !== '#' + tab) history.replaceState(null, '', '#' + tab);
  window.scrollTo({ top: 0 });
}
$('#tabs').addEventListener('click', e => { const b = e.target.closest('button[data-tab]'); if (b) ir(b.dataset.tab); });

/* ===================== Tarjeta de fonema ===================== */
function tarjeta(f) {
  const e = ejParse(f.ej[0]);
  const marca = P.dominados[f.s] ? '⭐' : (P.vistos[f.s] ? '👁️' : '');
  return `<div class="fcard n${f.nivel}" role="button" tabindex="0" data-fon="${esc(f.s)}" title="${esc(f.nombre)}">
    <span class="marcas">${marca}</span>
    <span class="sim ipa">/${esc(f.s)}/</span>
    <span class="nom">${esc(f.nombre)}</span>
    <span class="clave">${resaltar(e.w, e.letras)}</span>
    <button class="mini-play" data-say="${esc(e.w)}" aria-label="Escuchar ${esc(e.w)}">🔊</button>
  </div>`;
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') cerrarModal();
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.fcard')) { e.preventDefault(); abrirFicha(e.target.dataset.fon); }
});
function leyenda() {
  return `<div class="leyenda">
    <span class="chip n1"><i class="punto"></i>${NIVEL_TXT[1]}</span>
    <span class="chip n2"><i class="punto"></i>${NIVEL_TXT[2]}</span>
    <span class="chip n3"><i class="punto"></i>${NIVEL_TXT[3]}</span>
    <span class="chip">👁️ visto · ⭐ dominado</span>
  </div>`;
}

/* ===================== Ficha detallada ===================== */
function filaEjemplo(str) {
  const e = ejParse(str);
  return `<div class="ej">
    <button class="play" data-say="${esc(e.w)}" aria-label="Escuchar">🔊</button>
    <div class="txt"><span class="pal">${resaltar(e.w, e.letras)}</span><br><span class="tr ipa">/${esc(e.ipa)}/</span></div>
    <button class="play lento" data-say="${esc(e.w)}" data-lento="1" aria-label="Escuchar lento">🐢</button>
  </div>`;
}
function htmlPares(pares) {
  if (!pares || !pares.length) return '';
  return `<h3>Pares mínimos <small class="intro">(palabras que solo cambian en este sonido)</small></h3>
    <div class="pares">${pares.map(p => { const [a, b] = p.split('/');
      return `<span class="par"><button data-say="${esc(a)}">🔊 ${esc(a)}</button><span>vs</span><button data-say="${esc(b)}">🔊 ${esc(b)}</button></span>`; }).join('')}</div>`;
}
function abrirFicha(s) {
  const f = porSimbolo[s]; if (!f) return;
  P.vistos[s] = 1; guardar();
  const rasgos = f.g === 'consonante'
    ? [f.lugar, f.modo, f.voz ? 'sonora (vibran las cuerdas vocales)' : 'sorda (sin vibración)']
    : [{ vocal: 'vocal', diptongo: 'diptongo', 'vocal+r': 'vocal con r' }[f.g]];
  const st = P.fon[s];
  const idx = FONEMAS.indexOf(f);
  const ant = FONEMAS[(idx - 1 + FONEMAS.length) % FONEMAS.length], sig = FONEMAS[(idx + 1) % FONEMAS.length];
  $('#modalCuerpo').innerHTML = `
    <div class="ficha-cab">
      <div class="ficha-sim ipa">/${esc(f.s)}/</div>
      <div>
        <h2>${esc(f.nombre)}</h2>
        <span class="nivel n${f.nivel}"><i class="punto n${f.nivel}"></i>${NIVEL_TXT[f.nivel]}</span>
        <div class="rasgos">${rasgos.map(r => `<span class="rasgo">${esc(r)}</span>`).join('')}${f.ipa2 ? `<span class="rasgo">AFI estricto: /${esc(f.ipa2)}/</span>` : ''}</div>
      </div>
    </div>
    <div class="bloque"><b>👄 Cómo se pronuncia</b>${esc(f.como)}</div>
    <div class="bloque"><b>🇪🇸 Comparado con el español</b>${esc(f.es)}</div>
    <div class="bloque error"><b>⚠️ Error típico del hispanohablante</b>${esc(f.error)}</div>
    <div class="bloque"><b>✍️ Cómo se escribe</b>${esc(f.grafias)}</div>
    <h3>Ejemplos <small class="intro">(🔊 normal · 🐢 lento — las letras marcadas producen el sonido)</small></h3>
    <div class="ejemplos">${f.ej.map(filaEjemplo).join('')}</div>
    ${htmlPares(f.pares)}
    ${st ? `<p class="intro" style="margin-top:12px">Tus respuestas con este sonido: <b>${st.ok}/${st.n}</b> correctas.</p>` : ''}
    <div class="acciones">
      <button class="btn" id="fPract">🎯 Practicar este sonido</button>
      <button class="btn sec" id="fDom">${P.dominados[s] ? '⭐ Dominado (quitar)' : '☆ Marcar como dominado'}</button>
      <button class="btn sec" data-fon="${esc(ant.s)}">← /${esc(ant.s)}/</button>
      <button class="btn sec" data-fon="${esc(sig.s)}">/${esc(sig.s)}/ →</button>
    </div>`;
  $('#fDom').onclick = () => { if (P.dominados[s]) delete P.dominados[s]; else P.dominados[s] = 1; guardar(); abrirFicha(s); refrescar(); };
  $('#fPract').onclick = () => { cerrarModal(); practicarSonidos([s], `Práctica de /${s}/`); };
  const m = $('#modal'); m.classList.remove('oculto'); m.scrollTop = 0;
  document.body.style.overflow = 'hidden';
}
function cerrarModal() {
  $('#modal').classList.add('oculto'); document.body.style.overflow = '';
}
$('#cerrarModal').onclick = cerrarModal;
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') cerrarModal(); });
function refrescar() { if (['tabla', 'vocales', 'consonantes', 'progreso', 'aprende'].includes(tabActual)) VISTAS[tabActual](); }

/* ===================== Vista: Aprende ===================== */
function vistaAprende() {
  const hechas = LECCIONES.filter((l, i) => P.lecciones[i]).length;
  $('#vista').innerHTML = `
    <div class="caja">
      <h2>¿Qué es el Alfabeto Fonético (AFI / IPA)?</h2>
      <p>En español casi siempre se pronuncia como se escribe. En inglés <b>no</b>: la letra «a» suena distinto en <i>cat</i>, <i>car</i>, <i>cake</i> y <i>about</i>.
      El <b>Alfabeto Fonético Internacional</b> usa <b>un símbolo para cada sonido</b>, así puedes leer la pronunciación exacta de cualquier palabra en un diccionario.</p>
      <ul class="lista-simple">
        <li><b class="ipa">/ʃɪp/</b> — Entre barras: los <b>fonemas</b>, los sonidos que cambian el significado (ship ≠ sheep).</li>
        <li><b class="ipa">[ˈwɑɾɚ]</b> — Entre corchetes: la pronunciación <b>real y detallada</b> (la t de <i>water</i> suena como una «r» suave).</li>
        <li><b class="ipa">ˈ</b> — Marca la sílaba con <b>acento fuerte</b>: <span class="ipa">/ˈpipəl/</span> = <b>PEO</b>-ple. <b class="ipa">ˌ</b> es el acento secundario.</li>
        <li>🔊 El audio usa la voz en inglés de tu dispositivo. Los sonidos se escuchan <b>dentro de palabras</b>, que es como mejor se aprenden. Usa 🐢 para oírlo lento.</li>
      </ul>
      ${leyenda()}
    </div>
    <div class="caja">
      <h2>🧭 Ruta de estudio</h2>
      <p class="intro">14 lecciones ordenadas de lo fácil a lo difícil. Completa cada una sacando 8/10 o más en su práctica.</p>
      <div class="barra" aria-label="Progreso"><i style="width:${Math.round(hechas / LECCIONES.length * 100)}%"></i></div>
      <p class="intro" style="margin-top:6px">${hechas} de ${LECCIONES.length} lecciones completadas</p>
      <div class="ruta">${LECCIONES.map((l, i) => `
        <button class="leccion ${P.lecciones[i] ? 'hecha' : ''}" data-lec="${i}">
          <span class="num">${P.lecciones[i] ? '✓' : i + 1}</span>
          <span><span class="l-t">${esc(l.t)}</span><span class="l-s ipa">${l.s.map(s => '/' + esc(s) + '/').join(' ')}</span><span class="l-d">${esc(l.d)}</span></span>
        </button>`).join('')}
      </div>
    </div>
    <div class="caja">
      <h2>🚨 Los 10 retos principales para hispanohablantes</h2>
      <ol>
        <li><b>/ɪ/ vs /i/</b>: <i>ship</i> ≠ <i>sheep</i>, <i>live</i> ≠ <i>leave</i>.</li>
        <li><b>/æ/, /ʌ/, /ɑ/</b>: <i>cat</i>, <i>cut</i>, <i>cot</i> — tres «a» distintas.</li>
        <li><b>La schwa /ə/</b>: las sílabas sin acento se reducen a un sonido neutro.</li>
        <li><b>/b/ vs /v/</b>: <i>berry</i> ≠ <i>very</i>. La v se hace con dientes y labio.</li>
        <li><b>/z/</b>: la s entre vocales o al final suele zumbar: <i>is</i>, <i>dogs</i>, <i>music</i>.</li>
        <li><b>/θ/ y /ð/</b>: <i>think</i>, <i>this</i> — la lengua sale entre los dientes.</li>
        <li><b>La r americana</b>: no vibra; la lengua se recoge sin tocar nada.</li>
        <li><b>/ʃ/ vs /tʃ/</b>: <i>share</i> ≠ <i>chair</i>.</li>
        <li><b>La «e» inicial</b>: se dice <i>school</i>, no «eschool».</li>
        <li><b>Terminaciones -ed y -s</b>: <i>walked</i> = /wɔkt/ (¡una sola sílaba!).</li>
      </ol>
    </div>`;
  $$('.leccion').forEach(b => b.onclick = () => abrirLeccion(+b.dataset.lec));
}
function abrirLeccion(i) {
  const l = LECCIONES[i];
  $('#vista').innerHTML = `
    <button class="btn sec" id="volver">← Ruta</button>
    <h2>Lección ${i + 1}: ${esc(l.t)} ${P.lecciones[i] ? '✅' : ''}</h2>
    <p class="intro">${esc(l.d)} Escucha los ejemplos de cada sonido, compáralos y luego practica.</p>
    <div class="compara">${l.s.map(s => { const f = porSimbolo[s]; return `
      <div class="caja">
        <div class="ficha-cab" style="padding-right:0">
          <div class="ficha-sim ipa">/${esc(s)}/</div>
          <div><b>${esc(f.nombre)}</b><br><span class="nivel n${f.nivel}"><i class="punto n${f.nivel}"></i>${NIVEL_TXT[f.nivel]}</span></div>
        </div>
        <p style="margin:6px 0">${esc(f.como)}</p>
        <div class="ejemplos" style="grid-template-columns:1fr">${f.ej.slice(0, 3).map(filaEjemplo).join('')}</div>
        <div class="acciones"><button class="btn sec" data-fon="${esc(s)}">Ver ficha completa</button></div>
      </div>`; }).join('')}
    </div>
    ${(() => { const pares = [...new Set(l.s.flatMap(s => porSimbolo[s].pares))].slice(0, 10); return pares.length ? `<div class="caja">${htmlPares(pares)}</div>` : ''; })()}
    <div class="acciones"><button class="btn" id="lPract">🎯 Practicar la lección (10 preguntas)</button></div>`;
  $('#volver').onclick = () => ir('aprende');
  $('#lPract').onclick = () => practicarSonidos(l.s, `Lección ${i + 1}: ${l.t}`, i);
  window.scrollTo({ top: 0 });
}

/* ===================== Vista: Tabla AFI ===================== */
let filtroNivel = 0;
function vistaTabla() {
  const filtro = f => !filtroNivel || f.nivel === filtroNivel;
  $('#vista').innerHTML = `
    <h2>🔤 Tabla fonética del inglés americano</h2>
    <p class="intro">Toca cualquier sonido para ver cómo se pronuncia, ejemplos con audio y los errores típicos. 🔊 reproduce la palabra clave.</p>
    <div class="leyenda">
      <button class="chip ${filtroNivel === 0 ? 'on' : ''}" data-niv="0">Todos (${FONEMAS.length})</button>
      ${[3, 2, 1].map(n => `<button class="chip n${n} ${filtroNivel === n ? 'on' : ''}" data-niv="${n}"><i class="punto"></i>${NIVEL_TXT[n]} (${FONEMAS.filter(f => f.nivel === n).length})</button>`).join('')}
    </div>
    ${GRUPOS.map(g => { const fs = FONEMAS.filter(f => f.g === g.g && filtro(f)); return fs.length ? `
      <h3>${g.t} <small class="intro">— ${g.d}</small></h3>
      <div class="rejilla">${fs.map(tarjeta).join('')}</div>` : ''; }).join('')}`;
  $$('[data-niv]').forEach(b => b.onclick = () => { filtroNivel = +b.dataset.niv; vistaTabla(); });
}

/* ===================== Vista: Vocales (trapecio) ===================== */
// x: 0 = anterior (adelante) → 1 = posterior (atrás); y: 0 = cerrada (alta) → 1 = abierta (baja)
const POS_V = { i: [0.04, 0.04], 'ɪ': [0.2, 0.2], 'ɛ': [0.2, 0.55], 'æ': [0.12, 0.86], 'ɑ': [0.9, 0.95], 'ɔ': [0.9, 0.62], 'ʌ': [0.66, 0.62], 'ə': [0.5, 0.48], 'ʊ': [0.72, 0.2], u: [0.94, 0.04], 'ɝ': [0.42, 0.34], 'ɚ': [0.56, 0.34] };
const POS_ES = { i: [0.08, 0.1], e: [0.18, 0.42], a: [0.52, 0.97], o: [0.86, 0.42], u: [0.9, 0.1] };
const DIP = { 'eɪ': [[0.14, 0.4], [0.2, 0.2]], 'aɪ': [[0.4, 0.96], [0.22, 0.24]], 'ɔɪ': [[0.86, 0.6], [0.26, 0.22]], 'aʊ': [[0.42, 0.93], [0.7, 0.24]], 'oʊ': [[0.88, 0.38], [0.74, 0.22]] };
function pxV([x, y]) { const izq = 50 + 130 * y; return [izq + x * (380 - izq), 40 + y * 270]; }
let verEsp = true, verDip = false;
function vistaVocales() {
  const col = n => `var(--n${n})`;
  const svg = `<svg class="trapecio" viewBox="0 0 470 350" role="img" aria-label="Trapecio vocálico">
    <polygon class="borde" points="${[pxV([0, 0]), pxV([1, 0]), pxV([1, 1]), pxV([0, 1])].map(p => p.join(',')).join(' ')}"/>
    <line class="guia" x1="${pxV([0, .33])[0]}" y1="${pxV([0, .33])[1]}" x2="${pxV([1, .33])[0]}" y2="${pxV([1, .33])[1]}"/>
    <line class="guia" x1="${pxV([0, .66])[0]}" y1="${pxV([0, .66])[1]}" x2="${pxV([1, .66])[0]}" y2="${pxV([1, .66])[1]}"/>
    <line class="guia" x1="${pxV([.5, 0])[0]}" y1="${pxV([.5, 0])[1]}" x2="${pxV([.5, 1])[0]}" y2="${pxV([.5, 1])[1]}"/>
    <text class="eje" x="50" y="24">Adelante</text><text class="eje" x="215" y="24" text-anchor="middle">Centro</text><text class="eje" x="380" y="24" text-anchor="end">Atrás</text>
    <text class="eje" x="400" y="46">Cerrada</text><text class="eje" x="400" y="315">Abierta</text>
    <text class="eje" x="6" y="46">lengua</text><text class="eje" x="6" y="60">alta ↑</text><text class="eje" x="120" y="335">lengua baja ↓ (boca abierta)</text>
    ${verEsp ? Object.entries(POS_ES).map(([v, p]) => { const [x, y] = pxV(p); return `<g class="es"><circle cx="${x}" cy="${y}" r="15"/><text x="${x}" y="${y}">${v}</text></g>`; }).join('') : ''}
    ${verDip ? `<defs><marker id="flecha" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--acento)"/></marker></defs>` +
      Object.entries(DIP).map(([d, [a, b]]) => { const [x1, y1] = pxV(a), [x2, y2] = pxV(b); const mx = (x1 + x2) / 2 + 10, my = (y1 + y2) / 2;
        return `<path class="dip" d="M${x1},${y1} Q${mx + 20},${my} ${x2},${y2}" marker-end="url(#flecha)"/><text class="dip-t ipa" x="${x1}" y="${y1 + (y1 > 250 ? 22 : -8)}" data-fon="${d}">${d}</text>`; }).join('') : ''}
    ${Object.entries(POS_V).map(([v, p]) => { const [x, y] = pxV(p); const f = porSimbolo[v];
      return `<g class="v" data-fon="${esc(v)}"><circle cx="${x}" cy="${y}" r="17" fill="${col(f.nivel)}"/><text class="ipa" x="${x}" y="${y}">${esc(v)}</text></g>`; }).join('')}
  </svg>`;
  $('#vista').innerHTML = `
    <h2>👄 Las vocales del inglés americano</h2>
    <p class="intro">El <b>trapecio vocálico</b> es un mapa de la boca: muestra dónde está la lengua para cada vocal. Los círculos punteados son las 5 vocales del español: fíjate cuántas vocales inglesas caen <b>entre</b> ellas.</p>
    <div class="vocal-layout">
      <div class="caja">
        ${svg}
        <div class="leyenda">
          <button class="chip ${verEsp ? 'on' : ''}" id="tEsp">Vocales del español</button>
          <button class="chip ${verDip ? 'on' : ''}" id="tDip">Diptongos (flechas)</button>
        </div>
      </div>
      <div class="caja">
        <h3 style="margin-top:0">Palabras clave</h3>
        <ul class="lista-simple">${FONEMAS.filter(f => f.g === 'vocal' || f.g === 'diptongo').map(f => { const e = ejParse(f.ej[0]);
          return `<li><button class="play" data-say="${esc(e.w)}" aria-label="Escuchar">🔊</button>
            <a href="#" data-fon="${esc(f.s)}" class="ipa" style="font-size:1.2rem;font-weight:600;margin:0 6px">/${esc(f.s)}/</a>
            ${resaltar(e.w, e.letras)} <span class="intro">· ${esc(f.nombre)}</span></li>`; }).join('')}</ul>
      </div>
    </div>
    <div class="caja">
      <h3 style="margin-top:0">Consejos para las vocales</h3>
      <ul>
        <li><b>Largas vs. cortas:</b> /i/ y /u/ son tensas y largas; /ɪ/ y /ʊ/ son relajadas y cortas. Relaja la boca para las cortas.</li>
        <li><b>La schwa /ə/</b> aparece en casi todas las sílabas sin acento: <i>about, banana, pencil, today</i>. ¡Es el sonido más frecuente del inglés!</li>
        <li><b>No hay «o» pura:</b> en <i>go, no, home</i> la o siempre se desliza a u: /oʊ/.</li>
        <li><b>La /æ/</b> se hace con la boca de la «a» y la lengua de la «e»: abre mucho y estira los labios.</li>
      </ul>
    </div>`;
  $('#tEsp').onclick = () => { verEsp = !verEsp; vistaVocales(); };
  $('#tDip').onclick = () => { verDip = !verDip; vistaVocales(); };
  $$('a[data-fon]').forEach(a => a.addEventListener('click', e => e.preventDefault()));
}

/* ===================== Vista: Consonantes ===================== */
const LUGARES = ['bilabial', 'labiodental', 'dental', 'alveolar', 'postalveolar', 'palatal', 'velar', 'glotal'];
const LUGAR_TXT = { bilabial: 'Bilabial<br><small>dos labios</small>', labiodental: 'Labiodental<br><small>dientes + labio</small>', dental: 'Dental<br><small>lengua en dientes</small>', alveolar: 'Alveolar<br><small>detrás de dientes</small>', postalveolar: 'Postalveolar<br><small>más atrás</small>', palatal: 'Palatal<br><small>paladar</small>', velar: 'Velar<br><small>fondo</small>', glotal: 'Glotal<br><small>garganta</small>' };
const MODOS = [['oclusiva', 'Oclusiva (explosión)'], ['fricativa', 'Fricativa (fricción)'], ['africada', 'Africada (explosión + fricción)'], ['nasal', 'Nasal (aire por la nariz)'], ['lateral', 'Lateral'], ['aproximante', 'Aproximante (sin contacto)']];
function vistaConsonantes() {
  const cons = FONEMAS.filter(f => f.g === 'consonante');
  const celda = (m, l) => {
    const fs = cons.filter(f => f.modo === m && f.lugar === l).sort((a, b) => a.voz - b.voz);
    return `<td><div class="celda">${fs.map(f => `<button class="csim ipa n${f.nivel} ${f.voz ? 'sonora' : 'sorda'}" data-fon="${esc(f.s)}" title="${esc(f.nombre)}">${esc(f.s)}</button>`).join('')}</div></td>`;
  };
  $('#vista').innerHTML = `
    <h2>🦷 Las consonantes del inglés americano</h2>
    <p class="intro">Columnas: <b>dónde</b> se produce el sonido. Filas: <b>cómo</b> sale el aire. En cada casilla, a la izquierda la <b>sorda</b> (sin vibración) y a la derecha, con fondo de color, la <b>sonora</b> (tocando tu garganta sientes la vibración).</p>
    <div class="tabla-scroll"><table class="cons">
      <thead><tr><th></th>${LUGARES.map(l => `<th>${LUGAR_TXT[l]}</th>`).join('')}</tr></thead>
      <tbody>${MODOS.map(([m, t]) => `<tr><th class="fila">${t}</th>${LUGARES.map(l => celda(m, l)).join('')}</tr>`).join('')}</tbody>
    </table></div>
    ${leyenda()}
    <h3>Parejas sorda / sonora</h3>
    <p class="intro">La boca hace exactamente lo mismo; solo cambia si vibran las cuerdas vocales. Pon la mano en tu garganta y di «sssss» y luego «zzzzz».</p>
    <div class="rejilla">${[['p', 'b'], ['t', 'd'], ['k', 'ɡ'], ['f', 'v'], ['θ', 'ð'], ['s', 'z'], ['ʃ', 'ʒ'], ['tʃ', 'dʒ']].map(([a, b]) => `
      <div class="caja" style="margin:0;text-align:center">
        <button class="csim ipa n${porSimbolo[a].nivel}" data-fon="${esc(a)}">${esc(a)}</button> ·
        <button class="csim ipa sonora n${porSimbolo[b].nivel}" data-fon="${esc(b)}">${esc(b)}</button>
        <div style="margin-top:6px;font-size:.85rem">${[a, b].map(s => { const e = ejParse(porSimbolo[s].ej[0]); return `<button class="chip" data-say="${esc(e.w)}">🔊 ${esc(e.w)}</button>`; }).join(' ')}</div>
      </div>`).join('')}</div>
    <h3>Todas las consonantes</h3>
    <div class="rejilla">${cons.map(tarjeta).join('')}</div>`;
}

/* ===================== Vista: Acento americano ===================== */
function vistaEspeciales() {
  $('#vista').innerHTML = `
    <h2>🇺🇸 Lo que hace sonar «americano»</h2>
    <p class="intro">Además de los fonemas, el inglés americano tiene reglas de pronunciación que cambian cómo suenan las palabras en la vida real. Entre corchetes [ ] verás la pronunciación detallada.</p>
    <div class="esp-grid">${ESPECIALES.map(x => `
      <div class="caja esp">
        <h3><span class="icon">${x.icon}</span> ${esc(x.t)}</h3>
        <p>${esc(x.desc)}</p>
        <div class="ejemplos">${x.ej.map(e => { const [w, ipa] = e.split('|');
          return `<div class="ej"><button class="play" data-say="${esc(w)}" aria-label="Escuchar">🔊</button><div class="txt"><span class="pal">${esc(w)}</span><br><span class="tr ipa">[${esc(ipa)}]</span></div><button class="play lento" data-say="${esc(w)}" data-lento="1" aria-label="Lento">🐢</button></div>`; }).join('')}</div>
      </div>`).join('')}</div>`;
}

/* ===================== Práctica: motor de preguntas ===================== */
const CONFUSION = {
  'i': ['ɪ'], 'ɪ': ['i', 'ɛ'], 'ɛ': ['æ', 'ɪ', 'eɪ'], 'æ': ['ɛ', 'ʌ', 'ɑ'], 'ɑ': ['ʌ', 'æ', 'ɔ'], 'ʌ': ['ɑ', 'æ', 'ʊ'], 'ɔ': ['ɑ', 'oʊ'],
  'ʊ': ['u', 'ʌ'], 'u': ['ʊ'], 'eɪ': ['ɛ'], 'oʊ': ['ɔ', 'u'], 'ə': ['ʌ', 'ɛ'], 'θ': ['t', 's', 'f'], 'ð': ['d', 'z'], 'v': ['b'], 'b': ['v', 'p'],
  'z': ['s'], 's': ['z', 'θ'], 'ʃ': ['tʃ', 's'], 'tʃ': ['ʃ'], 'dʒ': ['j', 'ʒ'], 'j': ['dʒ'], 'ŋ': ['n'], 'n': ['ŋ'], 'd': ['ð'], 't': ['θ'], 'ʒ': ['dʒ', 'ʃ'], 'p': ['b']
};
function variantes(p) {
  // transcripciones incorrectas cambiando un sonido por otro que los hispanohablantes confunden
  const idx = p.toks.map((t, i) => t.f && CONFUSION[t.t] ? i : -1).filter(i => i >= 0);
  const out = new Set();
  barajar(idx).forEach(i => CONFUSION[p.toks[i].t].forEach(r => {
    out.add(p.toks.map((t, j) => j === i ? r : t.t).join(''));
  }));
  out.delete(p.ipa.replace(/ɹ/g, 'r'));
  return barajar([...out]);
}
const gen = {
  sonido(pool) {
    const f = porSimbolo[azar(pool)];
    const e = ejParse(azar(f.ej));
    const cercanos = barajar(pool.filter(s => s !== f.s));
    const mismos = barajar(FONEMAS.filter(x => x.g === f.g && x.s !== f.s && !cercanos.includes(x.s)).map(x => x.s));
    const otros = barajar(FONEMAS.filter(x => x.s !== f.s).map(x => x.s));
    const dis = [...new Set([...cercanos, ...(CONFUSION[f.s] || []), ...mismos, ...otros])].filter(s => s !== f.s && porSimbolo[s]).slice(0, 3);
    return {
      sim: f.s, audio: e.w,
      html: `<p class="enunciado">¿Qué sonido hacen las letras marcadas?</p><div class="grande">${resaltar(e.w, e.letras)}</div>`,
      opciones: barajar([f.s, ...dis]).map(s => ({ html: `<span class="ipa">/${esc(s)}/</span><small>${esc(porSimbolo[s].nombre)}</small>`, ok: s === f.s })),
      expl: `<b>${esc(e.w)}</b> = <span class="ipa">/${esc(e.ipa)}/</span>. Las letras «${esc(e.letras)}» suenan <b class="ipa">/${esc(f.s)}/</b> (${esc(f.nombre)}). <a href="#" data-fon="${esc(f.s)}">Ver ficha</a>`
    };
  },
  pares(pool) {
    const conPares = pool.filter(s => porSimbolo[s].pares.length);
    if (!conPares.length) return gen.sonido(pool);
    const f = porSimbolo[azar(conPares)];
    const [a, b] = azar(f.pares).split('/');
    const correcta = Math.random() < 0.5 ? a : b;
    return {
      sim: f.s, audio: correcta, autoplay: true, soloAudio: true,
      html: `<p class="enunciado">Escucha con atención. ¿Qué palabra oyes?</p><div class="grande">👂</div>`,
      opciones: [a, b].map(w => ({ html: esc(w), ok: w === correcta })),
      expl: `Era <b>${esc(correcta)}</b>. Compara: <button class="chip" data-say="${esc(a)}">🔊 ${esc(a)}</button> <button class="chip" data-say="${esc(b)}">🔊 ${esc(b)}</button> — la clave está en <a href="#" data-fon="${esc(f.s)}" class="ipa">/${esc(f.s)}/</a>.`
    };
  },
  transcripcion(pool) {
    const cand = PALABRAS.filter(p => [...p.fons].some(s => pool.includes(s)) && variantes(p).length >= 2);
    const p = azar(cand.length ? cand : PALABRAS);
    const buenas = p.ipa.replace(/ɹ/g, 'r');
    let malas = variantes(p).slice(0, 3);
    while (malas.length < 3) { const o = azar(PALABRAS).ipa; if (o !== buenas && !malas.includes(o)) malas.push(o); }
    const sims = [...p.fons].filter(s => pool.includes(s));
    return {
      sim: sims[0] || null, audio: p.w, autoplay: true,
      html: `<p class="enunciado">Escucha la palabra. ¿Cuál es su transcripción correcta?</p><div class="grande">${esc(p.w)}</div>`,
      opciones: barajar([buenas, ...malas]).map(t => ({ html: `<span class="ipa">/${esc(t)}/</span>`, ok: t === buenas })),
      expl: `<b>${esc(p.w)}</b> = <span class="ipa">/${esc(buenas)}/</span>. Sonidos: ${p.toks.filter(t => t.f).map(t => `<a href="#" data-fon="${esc(t.f.s)}" class="ipa">${esc(t.t)}</a>`).join(' · ')}`
    };
  },
  leer(pool) {
    const cand = PALABRAS.filter(p => [...p.fons].some(s => pool.includes(s)) && !/\s|\(/.test(p.w));
    const p = azar(cand.length ? cand : PALABRAS);
    // distractores: palabras que comparten algún sonido y tienen longitud parecida
    const parecidas = barajar(PALABRAS.filter(q => q.w !== p.w && q.ipa !== p.ipa && !/\(/.test(q.w) && Math.abs(q.toks.length - p.toks.length) <= 2 && [...q.fons].some(s => p.fons.has(s))));
    const dis = [];
    for (const q of [...parecidas, ...barajar(PALABRAS)]) { if (dis.length === 3) break; if (q.w !== p.w && q.ipa !== p.ipa && !dis.includes(q.w) && !/\(/.test(q.w)) dis.push(q.w); }
    return {
      sim: [...p.fons].find(s => pool.includes(s)) || null, audio: p.w, audioDespues: true,
      html: `<p class="enunciado">Lee la transcripción fonética. ¿Qué palabra es?</p><div class="grande ipa">/${esc(p.ipa)}/</div>`,
      opciones: barajar([p.w, ...dis]).map(w => ({ html: esc(w), ok: w === p.w })),
      expl: `<span class="ipa">/${esc(p.ipa)}/</span> = <b>${esc(p.w)}</b> <button class="chip" data-say="${esc(p.w)}">🔊 escuchar</button>`
    };
  }
};
const JUEGOS = [
  { id: 'pares', i: '👂', t: 'Pares mínimos', d: 'Escucha y elige: ¿ship o sheep? Entrena tu oído.' },
  { id: 'sonido', i: '🔤', t: '¿Qué sonido es?', d: 'Mira las letras marcadas y elige su símbolo fonético.' },
  { id: 'transcripcion', i: '✍️', t: 'Escucha y transcribe', d: 'Oye una palabra y elige su transcripción AFI correcta.' },
  { id: 'leer', i: '📖', t: 'Lee el AFI', d: 'Lee una transcripción y descubre qué palabra es.' },
  { id: 'mezcla', i: '🎲', t: 'Mezcla', d: 'Todos los tipos de pregunta al azar.' },
  { id: 'errores', i: '🩹', t: 'Repasa tus errores', d: 'Se enfoca en los sonidos donde más fallas.' }
];
const TODOS = FONEMAS.map(f => f.s);
function vistaPractica() {
  $('#vista').innerHTML = `
    <h2>🎮 Práctica</h2>
    <p class="intro">Rondas de 10 preguntas. Cada acierto suma a tu racha 🔥. Precisión total: <b>${P.n ? Math.round(P.ok / P.n * 100) : 0}%</b> en ${P.n} respuestas.</p>
    <div class="juegos">${JUEGOS.map(j => `<button class="juego" data-j="${j.id}"><span class="j-i">${j.i}</span><span class="j-t">${j.t}</span><span class="j-d">${j.d}</span></button>`).join('')}</div>
    <h3>Practica un grupo</h3>
    <div class="leyenda">
      ${GRUPOS.map(g => `<button class="chip" data-grupo="${g.g}">${g.t}</button>`).join('')}
      <button class="chip n3" data-grupo="n3"><i class="punto"></i>Solo sonidos nuevos</button>
    </div>`;
  $$('[data-j]').forEach(b => b.onclick = () => {
    const id = b.dataset.j;
    if (id === 'errores') {
      const peores = FONEMAS.map(f => { const r = P.fon[f.s]; const acc = r ? (r.ok + 1) / (r.n + 2) : 0.6; return [f.s, acc - (f.nivel === 3 ? 0.05 : 0)]; })
        .sort((a, b) => a[1] - b[1]).slice(0, 6).map(x => x[0]);
      return iniciarQuiz({ tipos: ['sonido', 'pares', 'transcripcion'], pool: peores, titulo: 'Repaso de errores: ' + peores.map(s => '/' + s + '/').join(' ') });
    }
    const t = JUEGOS.find(j => j.id === id).t;
    iniciarQuiz({ tipos: id === 'mezcla' ? ['sonido', 'pares', 'transcripcion', 'leer'] : [id], pool: TODOS, titulo: t });
  });
  $$('[data-grupo]').forEach(b => b.onclick = () => {
    const g = b.dataset.grupo;
    const pool = g === 'n3' ? FONEMAS.filter(f => f.nivel === 3).map(f => f.s) : FONEMAS.filter(f => f.g === g).map(f => f.s);
    iniciarQuiz({ tipos: ['sonido', 'pares', 'transcripcion'], pool, titulo: b.textContent.trim() });
  });
}
function practicarSonidos(pool, titulo, leccion) {
  $$('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === 'practica'));
  tabActual = 'practica';
  iniciarQuiz({ tipos: ['sonido', 'pares', 'transcripcion', 'sonido'], pool, titulo, leccion });
}

let Q = null;
function iniciarQuiz(cfg) {
  Q = Object.assign({ n: 0, total: 10, ok: 0 }, cfg);
  siguientePregunta();
}
function siguientePregunta() {
  if (Q.n >= Q.total) return finQuiz();
  let q, intentos = 0;
  do { q = gen[azar(Q.tipos)](Q.pool); intentos++; } while (Q.ultima && q.html === Q.ultima && intentos < 5);
  Q.ultima = q.html; Q.q = q; Q.n++;
  $('#vista').innerHTML = `
    <div class="quiz">
      <div class="quiz-top"><button class="btn sec" id="salir">✕ Salir</button><span>${esc(Q.titulo)}</span><span>${Q.n}/${Q.total} · ✅ ${Q.ok}</span></div>
      <div class="barra"><i style="width:${(Q.n - 1) / Q.total * 100}%"></i></div>
      <div class="caja pregunta pop">
        ${q.html}
        ${q.audioDespues ? '' : `<button class="btn escuchar" data-say="${esc(q.audio)}">🔊 Escuchar</button> <button class="btn sec escuchar" data-say="${esc(q.audio)}" data-lento="1">🐢</button>`}
      </div>
      <div class="opciones">${q.opciones.map((o, i) => `<button class="opcion" data-i="${i}">${o.html}</button>`).join('')}</div>
      <div id="fb"></div>
    </div>`;
  $('#salir').onclick = () => ir(Q.leccion != null ? 'aprende' : 'practica');
  if (q.autoplay) setTimeout(() => hablar(q.audio), 250);
  $$('.opcion').forEach(b => b.onclick = () => responder(+b.dataset.i));
}
function responder(i) {
  const q = Q.q;
  if (q.respondida) return; q.respondida = true;
  const bien = q.opciones[i].ok;
  if (bien) Q.ok++;
  registrar(q.sim, bien);
  sonido(bien);
  $$('.opcion').forEach((b, j) => { b.disabled = true; if (q.opciones[j].ok) b.classList.add('bien'); else if (j === i) b.classList.add('malo'); });
  if (q.audioDespues || !bien) setTimeout(() => hablar(q.audio), 200);
  $('#fb').innerHTML = `<div class="feedback ${bien ? 'bien' : 'malo'} pop">${bien ? '✅ ¡Correcto!' + (P.racha >= 3 ? ` 🔥 Racha de ${P.racha}` : '') : '❌ Casi.'} ${q.expl}</div>
    <div class="acciones"><button class="btn" id="sig">${Q.n >= Q.total ? 'Ver resultado' : 'Siguiente →'}</button></div>`;
  $$('#fb a[data-fon]').forEach(a => a.addEventListener('click', e => e.preventDefault()));
  $('#sig').onclick = siguientePregunta;
  $('#sig').focus({ preventScroll: true });
  $('#fb').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
function finQuiz() {
  const est = Q.ok >= 10 ? 3 : Q.ok >= 8 ? 2 : Q.ok >= 5 ? 1 : 0;
  let extra = '';
  if (Q.leccion != null) {
    if (Q.ok >= 8) { P.lecciones[Q.leccion] = 1; Q.pool.forEach(s => { P.vistos[s] = 1; }); guardar(); extra = '<p>🎉 ¡Lección completada!</p>'; }
    else extra = '<p>Necesitas 8/10 para completar la lección. ¡Inténtalo otra vez!</p>';
  }
  $('#vista').innerHTML = `
    <div class="quiz"><div class="caja resultado pop">
      <h2>${esc(Q.titulo)}</h2>
      <div class="estrellas">${'★'.repeat(est)}${'☆'.repeat(3 - est)}</div>
      <p style="font-size:1.4rem"><b>${Q.ok}/${Q.total}</b> correctas</p>
      <p class="intro">${['Sigue escuchando los ejemplos y vuelve a intentarlo.', '¡Vas bien! Repite para afinar el oído.', '¡Muy bien! Casi perfecto.', '¡Perfecto! Tu oído está entrenado. 🏆'][est]}</p>
      ${extra}
      <div class="acciones" style="justify-content:center">
        <button class="btn" id="otra">🔁 Otra ronda</button>
        <button class="btn sec" id="volverP">${Q.leccion != null ? '🧭 Volver a la ruta' : '🎮 Más juegos'}</button>
      </div>
    </div></div>`;
  sonido(est >= 2, true);
  $('#otra').onclick = () => iniciarQuiz({ tipos: Q.tipos, pool: Q.pool, titulo: Q.titulo, leccion: Q.leccion });
  $('#volverP').onclick = () => ir(Q.leccion != null ? 'aprende' : 'practica');
}

/* Efectos de sonido (WebAudio) */
let actx = null;
function sonido(bien, fin) {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const notas = fin ? (bien ? [523, 659, 784, 1047] : [392, 330]) : (bien ? [660, 880] : [220, 180]);
    notas.forEach((fr, i) => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = bien ? 'triangle' : 'sawtooth'; o.frequency.value = fr;
      const t = actx.currentTime + i * 0.09;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.08, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      o.connect(g).connect(actx.destination); o.start(t); o.stop(t + 0.18);
    });
  } catch (e) { /* sin audio */ }
}

/* ===================== Vista: Diccionario ===================== */
let busqueda = '', teclaSel = '';
function vistaDiccionario() {
  $('#vista').innerHTML = `
    <h2>🔎 Diccionario fonético</h2>
    <p class="intro">${PALABRAS.length} palabras con su transcripción. Busca por palabra o por símbolo, o toca un sonido del teclado para ver todas las palabras que lo contienen.</p>
    <input class="buscador" id="q" type="search" placeholder="Escribe una palabra en inglés (p. ej. water, think, girl)…" value="${esc(busqueda)}" autocomplete="off" autocapitalize="off">
    <div class="teclado">${FONEMAS.map(f => `<button class="ipa ${teclaSel === f.s ? 'on' : ''}" data-tecla="${esc(f.s)}" title="${esc(f.nombre)}">${esc(f.s)}</button>`).join('')}</div>
    <div class="resultados" id="res"></div>`;
  const q = $('#q');
  q.oninput = () => { busqueda = q.value; teclaSel = ''; $$('[data-tecla]').forEach(b => b.classList.remove('on')); pintarResultados(); };
  $$('[data-tecla]').forEach(b => b.onclick = () => {
    teclaSel = teclaSel === b.dataset.tecla ? '' : b.dataset.tecla; busqueda = ''; q.value = '';
    $$('[data-tecla]').forEach(x => x.classList.toggle('on', x.dataset.tecla === teclaSel)); pintarResultados();
  });
  pintarResultados();
}
function pintarResultados() {
  const t = busqueda.trim().toLowerCase();
  let lista = PALABRAS;
  if (teclaSel) lista = lista.filter(p => p.fons.has(teclaSel));
  else if (t) lista = lista.filter(p => p.w.toLowerCase().includes(t) || p.ipa.includes(t));
  else lista = lista.slice(0, 40);
  const cab = teclaSel ? `<p class="intro">${lista.length} palabras con <a href="#" data-fon="${esc(teclaSel)}" class="ipa">/${esc(teclaSel)}/</a> — ${esc(porSimbolo[teclaSel].nombre)}</p>` : (!t ? '<p class="intro">Algunas palabras:</p>' : `<p class="intro">${lista.length} resultado(s)</p>`);
  $('#res').innerHTML = cab + (lista.length ? lista.slice(0, 150).map(p => `
    <div class="fila-dic">
      <button class="play" data-say="${esc(p.w)}" aria-label="Escuchar">🔊</button>
      <span class="pal">${esc(p.w)}</span>
      <span class="tr ipa">/${esc(p.ipa)}/</span>
      <button class="play lento" data-say="${esc(p.w)}" data-lento="1" aria-label="Lento">🐢</button>
      <span class="tokens">${p.toks.filter(x => !x.marca).map(x => x.f
        ? `<button class="tok ipa n${x.f.nivel}" data-fon="${esc(x.f.s)}" title="${esc(x.f.nombre)}">${esc(x.t)}</button>`
        : `<span class="tok ipa" title="${esc(x.alo || '')}">${esc(x.t)}</span>`).join('')}</span>
    </div>`).join('') : '<p>No hay resultados. Prueba con otra palabra.</p>');
  $$('#res a[data-fon]').forEach(a => a.addEventListener('click', e => e.preventDefault()));
}

/* ===================== Vista: Progreso ===================== */
function vistaProgreso() {
  const vis = Object.keys(P.vistos).filter(s => porSimbolo[s]).length;
  const dom = Object.keys(P.dominados).filter(s => porSimbolo[s]).length;
  const lec = LECCIONES.filter((l, i) => P.lecciones[i]).length;
  $('#vista').innerHTML = `
    <h2>📈 Tu progreso</h2>
    <div class="stats">
      <div class="stat"><b>${vis}/${FONEMAS.length}</b><span>sonidos estudiados</span></div>
      <div class="stat"><b>${dom}</b><span>sonidos dominados ⭐</span></div>
      <div class="stat"><b>${lec}/${LECCIONES.length}</b><span>lecciones completadas</span></div>
      <div class="stat"><b>${P.n ? Math.round(P.ok / P.n * 100) : 0}%</b><span>precisión (${P.ok}/${P.n})</span></div>
      <div class="stat"><b>🔥 ${P.mejorRacha}</b><span>mejor racha</span></div>
    </div>
    <div class="caja">
      <h3 style="margin-top:0">Mapa de sonidos</h3>
      <p class="intro">Color según tu precisión en la práctica: verde ≥ 80%, naranja ≥ 50%, rojo &lt; 50%, gris sin datos.</p>
      <div class="mapa">${FONEMAS.map(f => { const r = P.fon[f.s]; const a = r && r.n ? r.ok / r.n : null;
        const c = a == null ? 'var(--panel)' : a >= 0.8 ? 'var(--n1s)' : a >= 0.5 ? 'var(--n2s)' : 'var(--n3s)';
        return `<button class="ipa" data-fon="${esc(f.s)}" style="background:${c}">${esc(f.s)}${P.dominados[f.s] ? '⭐' : ''}<small>${r ? r.ok + '/' + r.n : '—'}</small></button>`; }).join('')}</div>
    </div>
    <div class="acciones"><button class="btn sec" id="reset">🗑️ Borrar mi progreso</button></div>`;
  $('#reset').onclick = () => {
    if (!confirm('¿Seguro que quieres borrar todo tu progreso?')) return;
    Object.assign(P, baseProgreso(), { voz: P.voz });
    guardar(); pintarRacha(); vistaProgreso();
  };
}

/* ===================== Ajustes de voz ===================== */
$('#btnAjustes').onclick = () => {
  cargarVoces();
  const actual = vozElegida();
  $('#modalCuerpo').innerHTML = `
    <h2>⚙️ Voz</h2>
    <p class="intro">Elige la voz en inglés que más te guste. Las voces de Estados Unidos (en-US) son las recomendadas.</p>
    ${voces.length ? `<select id="selVoz" class="buscador">${voces.map(v => `<option value="${esc(v.name)}" ${actual && v.name === actual.name ? 'selected' : ''}>${esc(v.name)} (${esc(v.lang)})</option>`).join('')}</select>`
      : '<p>No se encontraron voces en inglés en este dispositivo.</p>'}
    <div class="acciones"><button class="btn" data-say="The quick brown fox jumps over the lazy dog.">🔊 Probar</button></div>`;
  const sel = $('#selVoz'); if (sel) sel.onchange = () => { P.voz = sel.value; guardar(); };
  $('#modal').classList.remove('oculto');
};

/* ===================== Inicio ===================== */
const VISTAS = { aprende: vistaAprende, tabla: vistaTabla, vocales: vistaVocales, consonantes: vistaConsonantes, especiales: vistaEspeciales, practica: vistaPractica, diccionario: vistaDiccionario, progreso: vistaProgreso };
(async () => {
  try {
    const r = await AbuProgreso.iniciar({ app: 'fonetica' });
    if (!r) return;                       // sin sesión: ya se redirigió al login
    if (r.datos) Object.assign(P, baseProgreso(), r.datos);
  } catch (e) {
    console.warn('[fonetica] no se pudo cargar el progreso:', e);
  }
  $('#cargando').classList.add('oculto');
  pintarRacha();
  ir(VISTAS[location.hash.slice(1)] ? location.hash.slice(1) : 'aprende');
})();
