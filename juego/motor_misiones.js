'use strict';

/* ============================================================================
   ENGLISH TOWN · MOTOR (3/4): tiempo, lecciones de personas, burbujas,
   campaña de 300 misiones (todas distintas) y quizzes
============================================================================ */

/* ---------- Tiempo: hora, día/noche y clima ---------- */
const hourNow = () => Math.floor(clockMin / 60) % 24;
function darkness() {
  const h = (clockMin / 60) % 24;
  if (h >= 7 && h < 18) return 0;
  if (h >= 18 && h < 20.5) return (h - 18) / 2.5 * 0.55;
  if (h >= 5 && h < 7) return (7 - h) / 2 * 0.55;
  return 0.55;
}
const isDark = () => darkness() > 0.25;
const phaseName = () => I.greeting(hourNow())[2];
function skyColors() {
  const h = (clockMin / 60) % 24;
  if (h >= 17 && h < 20) return SKIES.evening;
  if (h >= 20 || h < 5.5) return SKIES.night;
  if (h >= 5.5 && h < 7) return SKIES.evening;
  return SKIES.day;
}
const grassColor = () => Gen.mix('#7cb461', '#27402c', darkness() / 0.55 * 0.7);
function clockText() {
  const h = hourNow(), m = Math.floor(clockMin % 60);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}
function updateClockHud() {
  const icon = isDark() ? '🌙' : darkness() > 0 ? '🌅' : '☀️';
  $('clock').textContent = `${icon} ${clockText()} · ${I.WEATHER[weather.kind].icon}`;
}
function tellTime() {
  const tw = I.timeWords(hourNow(), Math.floor(clockMin % 60));
  teachFree(Object.assign(L.free('noun', 'time', 'la hora', `${tw.en} ${I.WEATHER[weather.kind].en}`, `${tw.es} ${I.WEATHER[weather.kind].es}`, '🕰️', clockText()), { wordId: palabraId('time') }));
}

/* ---------- Relaciones espaciales ---------- */
function surfaceAt(x, y) {
  if (y > SAND_Y0 - 4) return { key: 'beach', en: 'on the beach', es: 'en la playa', palabra: 'beach' };
  for (let r = 0; r < ROWS; r++) {
    const b = rowBase(r);
    if (y >= b + ROAD[0] && y < b + ROAD[1]) {
      if (vstreets.some(v => x > v.x0 + 30 && x < v.x1 - 30)) return { key: 'crosswalk', en: 'on the crosswalk', es: 'en el paso de peatones', palabra: 'crosswalk' };
      return { key: 'street', en: 'on the street', es: 'en la calle', palabra: 'street' };
    }
    if ((y >= b + SW_A[0] - 12 && y < b + ROAD[0]) || (y >= b + SW_B[0] && y < b + SW_B[1] + 8)) return { key: 'sidewalk', en: 'on the sidewalk', es: 'en la acera', palabra: 'sidewalk' };
  }
  const v = vstreets.find(v => x > v.x0 - 40 && x < v.x1 + 40);
  if (v && y > ROAD[0] && y < LAST_ROAD_END) return x < v.x0 || x > v.x1 ? { key: 'sidewalk', en: 'on the sidewalk', es: 'en la acera', palabra: 'sidewalk' } : { key: 'street', en: 'on the street', es: 'en la calle', palabra: 'street' };
  if (W) {
    const p = W.grounds.find(p => x > p.x0 && x < p.x1 && y > p.y0 && y < p.y1);
    if (p) {
      const t = p.lot.type;
      const S = { farm: ['farm', 'on the farm', 'en la granja'], market: ['market', 'in the market', 'en el mercado'], plaza: ['square', 'in the town square', 'en la plaza'],
        field: ['field', 'on the soccer field', 'en la cancha de fútbol'], zoo: ['zoo', 'at the zoo', 'en el zoológico'], garden: ['garden', 'in the garden', 'en el jardín'],
        parking: ['parking lot', 'in the parking lot', 'en el estacionamiento'], construction: [null, 'at the construction site', 'en la obra'],
        campground: [null, 'at the campground', 'en el campamento'] }[t];
      if (S) return { key: t, en: S[1], es: S[2], palabra: S[0] };
      return { key: 'park', en: 'in the park', es: 'en el parque', palabra: 'park' };
    }
  }
  return { key: 'grass', en: 'on the grass', es: 'en el césped', palabra: 'grass' };
}

function etiquetaEdificio(b) {
  return b.shop ? { the: 'the ' + b.shop.n.en, es: elN(b.shop.n) } : { the: b.label ? b.label.the : 'the house', es: b.label ? b.label.esFull : 'la casa' };
}
function relationOf(x, y) {
  if (!W) return null;
  const surf = surfaceAt(x, y);
  let rel = null;
  for (const b of W.buildings) {
    const lab = etiquetaEdificio(b);
    const inside = x > b.x0 - 10 && x < b.x1 + 10;
    if (inside && y >= b.base - 5 && y < b.base + 150) { rel = { key: 'inFrontOf', b, prepEn: 'in front of', prepEs: 'delante de', en: `in front of ${lab.the}`, es: I.prepEs(I.PREP.inFrontOf, lab.es) }; break; }
    if (inside && y < b.base - 70 && y > b.base - 460) { rel = { key: 'behind', b, prepEn: 'behind', prepEs: 'detrás de', en: `behind ${lab.the}`, es: I.prepEs(I.PREP.behind, lab.es) }; break; }
    if (!inside && Math.abs(y - b.base) < 110 && (Math.abs(x - b.x0) < 170 || Math.abs(x - b.x1) < 170)) rel = { key: 'nextTo', b, prepEn: 'next to', prepEs: 'al lado de', en: `next to ${lab.the}`, es: I.prepEs(I.PREP.nextTo, lab.es) };
  }
  if (!rel) for (const p of W.ponds) if (Math.hypot((x - p.x) / (p.rx + 120), (y - p.y) / (p.ry + 90)) < 1) { rel = { key: 'near', prepEn: 'near', prepEs: 'cerca de', en: 'near the pond', es: 'cerca del estanque' }; break; }
  if (!rel) { const t = W.trees.find(t => Math.abs(t.x - x) < 55 && Math.abs(t.y - y) < 45); if (t) rel = { key: 'under', prepEn: 'under', prepEs: 'debajo de', en: 'under the tree', es: 'debajo del árbol' }; }
  if (!rel) return { surf, prepEn: surf.en.split(' ')[0], prepEs: surf.es.split(' ')[0], en: surf.en, es: surf.es };
  return { surf, rel, prepEn: rel.prepEn, prepEs: rel.prepEs, en: `${surf.en}, ${rel.en}`, es: `${surf.es}, ${rel.es}` };
}

/* ============================================================================
   LECCIONES DE LAS PERSONAS
============================================================================ */
function leccionRol(p) {
  if (p.estado) {
    const E = MundoDatos.ESTADOS[p.estado];
    return conPalabra({ cat: 'noun', word: p.estado, wordEs: PAL[p.estado].es, en: E.en(p.name), es: E.es(p.name), icon: PAL[p.estado].icon }, p.estado);
  }
  if (!p.rol || !PAL[p.rol]) return null;
  const info = MundoDatos.ROLES[p.rol];
  const esRol = (p.sexo === 'f' ? info[2] : info[1]) || info[1] || info[2];
  const en = `${p.name} is ${I.a(p.rol)}.`;
  const es = `${p.name} es ${esRol}.`;
  return conPalabra({ cat: 'noun', word: p.rol, wordEs: first(PAL[p.rol].es), en, es, icon: PAL[p.rol].icon }, p.rol);
}
function leccionesVerbo(name, key, act, tenses) {
  const out = [];
  tenses.forEach(t => {
    const l = L.tense(name, key, act, t);
    if (act.verbo && PAL[act.verbo]) l.wordId = palabraId(act.verbo);
    out.push(l);
  });
  return out;
}
// Cosa que usa la persona en su acción: también se aprende tocándola
const COSA_DE_ACCION = {
  kite: ['kite', n => `${n} has a kite. The kite is flying high.`, n => `${n} tiene una cometa. La cometa vuela alto.`],
  photo: ['photo', n => `${n} is taking a photo.`, n => `${n} está tomando una foto.`],
  practice: ['guitar', n => `${n} plays the guitar.`, n => `${n} toca la guitarra.`],
  use: ['computer', n => `${n} is using a computer.`, n => `${n} está usando una computadora.`],
  playVideo: ['video game', n => `${n} likes video games.`, n => `A ${n} le gustan los videojuegos.`],
  soccer: ['team', n => `${n} plays on a soccer team.`, n => `${n} juega en un equipo de fútbol.`]
};
function personLessons(p) {
  const name = p.name, geo = p.geo;
  const orden = ['cont', 'simple', 'past', 'fut', 'perf'];
  const t0 = orden[p.tense % 5], t1 = orden[(p.tense + 1) % 5], t2 = orden[(p.tense + 2) % 5];
  const ls = [];
  const rol = leccionRol(p);
  if (rol) ls.push(rol);
  ls.push(...leccionesVerbo(name, p.actKey, p.act, [t0]));
  const adv = L.adverb(name, p.act, p.advKey);
  if (PAL[p.advKey]) adv.wordId = palabraId(p.advKey);
  ls.push(adv);
  const topN = { 'camiseta': N.tshirt, 'camisa': N.shirt, 'suéter': N.sweater, 'abrigo': N.coat, 'vestido': N.dress }[geo.topType];
  const tc = colorName(geo.topColor);
  if (topN && COLORS[tc]) {
    ls.push(Object.assign(L.free('adj', COLORS[tc].en, COLORS[tc].m, `${name} is wearing ${I.a(COLORS[tc].en + ' ' + topN.en)}.`,
      `${name} lleva ${I.un(topN)} ${topN.es} ${adjEs(COLORS[tc], topN)}.`, topN.icon, `${topN.en} = ${topN.es}`), { wordId: PAL[topN.en] ? palabraId(topN.en) : (PAL[tc] ? palabraId(tc) : undefined) }));
    ls.push(conPalabra(L.free('verb', 'wear', 'llevar puesto', `${name} wears ${I.a(topN.en)} today.`, `Hoy ${name} lleva ${I.un(topN)} ${topN.es}.`, '👕', 'wear · wore · worn'), 'wear'));
  }
  ls.push(...leccionesVerbo(name, p.actKey, p.act, [t1]));
  const hair = { 'largo': ['long', 'largo', 'has long hair', 'tiene el pelo largo'], 'corto': ['short', 'corto', 'has short hair', 'tiene el pelo corto'],
    'rizado': ['curly', 'rizado', 'has curly hair', 'tiene el pelo rizado'], 'calvo': ['bald', 'calvo/a', 'is bald', 'es calvo/a'] }[geo.face.hairStyle];
  if (hair) ls.push(Object.assign(L.free('adj', hair[0], hair[1], `${name} ${hair[2]}.`, `${name} ${hair[3]}.`, '💇'), PAL[hair[0]] ? { wordId: palabraId(hair[0]) } : { wordId: palabraId('hair') }));
  if (geo.face.glasses !== 'no') ls.push(conPalabra(L.free('noun', 'glasses', 'gafas', `${name} wears glasses.`, `${name} usa gafas.`, '👓'), 'glasses'));
  if (p.actKey === 'walkDog') ls.push(conPalabra(L.free('noun', 'dog', 'perro', `${name} has a dog. The dog is happy.`, `${name} tiene un perro. El perro está feliz.`, '🐕'), 'dog'));
  const cosa = COSA_DE_ACCION[p.actKey];
  if (cosa && PAL[cosa[0]]) ls.push(conPalabra(L.free('noun', cosa[0], first(PAL[cosa[0]].es), cosa[1](name), cosa[2](name), PAL[cosa[0]].icon), cosa[0]));
  if (p.actKey === 'ride') ls.push(conPalabra(L.free('noun', 'bike', 'bicicleta', `${name} rides a bike to work.`, `${name} va en bicicleta al trabajo.`, '🚲'), 'bike'));
  const where = relationOf(p.x, p.y);
  if (where) ls.push(L.free('prep', where.prepEn, where.prepEs, `${name} is ${where.en}.`, `${name} está ${where.es}.`, '📍'));
  ls.push(...leccionesVerbo(name, p.actKey, p.act, [t2]));
  return ls;
}
function plural(es) { return es.replace(/^se está /, 'se están ').replace(/^está /, 'están '); }
function lessonsGrupo(gr) {
  const G = MundoDatos.GRUPOS[gr.grupo];
  const act = gr.act;
  const ls = [conPalabra({ cat: 'noun', word: gr.grupo, wordEs: first(PAL[gr.grupo].es), en: G.en, es: G.es, icon: PAL[gr.grupo].icon }, gr.grupo)];
  const [base, ing, past] = act.verb;
  const t = I.TENSES[gr.actKey].split('|');
  const v = act.verbo && PAL[act.verbo] ? { wordId: palabraId(act.verbo) } : {};
  const persona3 = s => s.split(' ').map((w, i) => i === 0 ? base : w).join(' ');
  ls.push(Object.assign({ cat: 'verb', word: ing, wordEs: act.verb[3], en: `They are ${act.en}.`, es: `Ellos ${plural(act.es)}.`, icon: '👥', extra: `to ${base} · ${past} · ${ing}` }, v));
  ls.push(Object.assign({ cat: 'verb', word: past, wordEs: act.verb[3], en: `Yesterday, they ${t[1]}.`, es: `Ayer ellos también lo hicieron.`, icon: '⏳', extra: `Past simple — ${base} → ${past}` }, v));
  ls.push(Object.assign({ cat: 'verb', word: base, wordEs: act.verb[3], en: `Every weekend, they ${persona3(t[0])}.`, es: `Todos los fines de semana lo hacen.`, icon: '🔁', extra: `Present simple (they) — ${base}` }, v));
  return ls;
}

/* ============================================================================
   BURBUJAS: palabras abstractas que flotan (se tocan, pero no desaparecen)
============================================================================ */
function colocarBurbujas(w, R) {
  const cubiertas = new Set();
  w.ents.forEach(e => (e.palabras || []).forEach(id => cubiertas.add(id)));
  const pendientes = PALABRAS.words.filter(x => !cubiertas.has(x.id));
  const cuenta = new Map();
  const BB = { x0: -40, y0: -76, x1: 40, y1: 10 };
  const entidadDe = en => { const id = PAL[en] ? PAL[en].id : null; return id ? w.ents.find(e => (e.palabras || []).includes(id) && e.kind !== 'orb') : null; };
  pendientes.forEach(word => {
    let pos = null;
    const cerca = MundoDatos.CERCA_DE[word.en];
    const ent = cerca && entidadDe(cerca);
    if (ent) {
      const b = ent.box();
      const cx = b.x + b.w / 2, cy = ent.y;
      for (let i = 0; i < 40 && !pos; i++) {
        const a = R() * Math.PI * 2, d = 90 + R() * 260;
        const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * 0.6;
        if (y > BOTTOM_Y - 10 || y < TOP_Y + 80) continue;
        if (w.occ.libre(caja(x + BB.x0, y + BB.y0, x + BB.x1, y + BB.y1), 8)) pos = { x, y };
      }
    }
    if (!pos) {
      const zonas = MundoDatos.ZONAS[word.theme] || [];
      const lotes = [...w.lots.filter(l => zonas.includes(l.type)).sort((a, b) => (cuenta.get(a) || 0) - (cuenta.get(b) || 0) || R() - 0.5),
        ...w.lots.filter(l => !zonas.includes(l.type)).sort((a, b) => (cuenta.get(a) || 0) - (cuenta.get(b) || 0) || R() - 0.5)];
      for (const lot of lotes) {
        const A = lotArea(lot);
        for (let i = 0; i < 45 && !pos; i++) {
          const x = R.range(A.x0 + 45, A.x1 - 45), y = R.range(A.y0 + 80, A.y1 - 12);
          if (w.occ.libre(caja(x + BB.x0, y + BB.y0, x + BB.x1, y + BB.y1), 8)) pos = { x, y };
        }
        if (pos) { cuenta.set(lot, (cuenta.get(lot) || 0) + 1); break; }
      }
    }
    if (!pos) {
      // Último recurso: la arena de la playa
      for (let i = 0; i < 200 && !pos; i++) {
        const x = R.range(80, WORLD_W - 80), y = R.range(SAND_Y0 + 90, BOTTOM_Y - 10);
        if (w.occ.libre(caja(x + BB.x0, y + BB.y0, x + BB.x1, y + BB.y1), 8)) pos = { x, y };
      }
    }
    if (!pos) { w.avisos.push('Sin lugar para la burbuja ' + word.en); return; }
    w.occ.add(caja(pos.x + BB.x0, pos.y + BB.y0, pos.x + BB.x1, pos.y + BB.y1), 'burbuja');
    const o = w.add({ kind: 'orb', w: word, x: pos.x, y: pos.y, palabras: [word.id], dentro: false,
      box: () => ({ x: o.x - 38, y: o.y - 74, w: 76, h: 84 }),
      draw: (g, t) => Draw.orb(g, o, t, mission && mission.set && mission.set.has(word.id) && !progress.words[word.id], !!progress.words[word.id]),
      lessons: () => [wordLesson(word)] });
    w.orbs.push(o);
  });
}

/* ============================================================================
   CAMPAÑA: 300 misiones, todas distintas
   Se genera igual para todos los usuarios (depende solo de las palabras y
   de esta lista), así el avance guardado siempre apunta a la misma misión.
============================================================================ */
const ESPECIALES = {
  basics: ['go:square', 'greet', 'talk:tourist'],
  numbers: ['ring:3', 'ring:8', 'ring:14', 'quizk:number', 'find:first'],
  colors: ['go:homeStore', 'find:color', 'find:rainbow'],
  people: ['go:park', 'talk:grandmother', 'find:baby', 'find:family', 'talk:mom', 'find:wedding', 'find:king', 'talk:artist'],
  body: ['go:hospital', 'go:pharmacy', 'talk:doctor', 'talk:nurse', 'find:face', 'talk:dentist'],
  clothes: ['go:clothesStore', 'act:try', 'act:choose', 'wear'],
  food: ['go:market', 'go:restaurant', 'go:cafe', 'go:bakery', 'talk:waiter', 'act:sell', 'act:pay', 'act:eatPizza', 'find:food', 'act:cook'],
  home: ['find:room', 'find:bed', 'find:fridge', 'ring:5', 'act:move'],
  town: ['go:postOffice', 'go:bank', 'go:policeStation', 'go:fireStation', 'go:construction', 'find:traffic light', 'pos:crosswalk', 'find:bus', 'find:train', 'lights', 'talk:driver', 'talk:police officer'],
  animals: ['go:zoo', 'go:farm', 'go:petShop', 'find:elephant', 'find:giraffe', 'find:cow', 'find:duck', 'find:whale', 'talk:farmer', 'act:touch'],
  nature: ['go:garden', 'go:campground', 'go:beach', 'pos:under', 'pos:near', 'quizk:weather', 'find:mountain', 'find:river'],
  time: ['go:clockTower', 'quizk:time', 'find:week', 'find:season'],
  school: ['go:school', 'go:library', 'talk:teacher', 'act:study', 'act:borrow'],
  hobbies: ['go:field', 'go:gym', 'go:cinema', 'act:swim', 'act:win', 'find:concert', 'act:kite'],
  verbs: ['quizk:tense:0', 'act:climb', 'act:wash', 'act:fix', 'quizk:tense:1', 'act:throw', 'act:catch', 'act:draw', 'quizk:tense:2', 'act:dance', 'act:rest', 'act:build', 'quizk:tense:3', 'act:hug', 'act:laugh', 'act:cry', 'quizk:tense:4', 'act:hold', 'act:open', 'act:give', 'act:send', 'act:save'],
  adjectives: ['quizk:opposite:0', 'quizk:opposite:1', 'quizk:opposite:2'],
  adverbs: ['adv:0', 'adv:1', 'adv:2'],
  prepositions: ['quizk:prep:0', 'pos:behind:bakery', 'quizk:prep:1', 'pos:nextTo:bank', 'pos:inFrontOf:school', 'pos:behind:museum']
};
const LUGARES = {
  square: ['town square', 'la plaza'], park: ['park', 'el parque'], market: ['market', 'el mercado'], farm: ['farm', 'la granja'], field: ['soccer field', 'la cancha de fútbol'],
  zoo: ['zoo', 'el zoológico'], construction: ['construction site', 'la obra'], parking: ['parking lot', 'el estacionamiento'], garden: ['community garden', 'el jardín comunitario'],
  campground: ['campground', 'el campamento'], beach: ['beach', 'la playa'], clockTower: ['clock tower', 'la torre del reloj']
};
function nombreLugar(k) {
  if (LUGARES[k]) return LUGARES[k];
  const b = I.BUILDINGS[k];
  return b ? [b.n.en, elN(b.n)] : [k, k];
}

function buildCampaign() {
  const themes = PALABRAS.themes;
  const S = themes.reduce((s, t) => s + (ESPECIALES[t.key] || []).length, 0);
  const R = TOTAL_MISSIONS - S;              // misiones de palabras (descubrir + repaso)
  const total = PALABRAS.words.length;
  const cuota = themes.map(t => Math.max(2, Math.round(t.words.length * R / total)));
  let diff = R - cuota.reduce((a, b) => a + b, 0);
  for (let i = themes.length - 1; diff !== 0; i = (i - 1 + themes.length) % themes.length) { if (diff > 0) { cuota[i]++; diff--; } else if (cuota[i] > 2) { cuota[i]--; diff++; } }
  const list = [];
  themes.forEach((t, ti) => {
    const q = cuota[ti];
    const repasos = Math.floor(q / 5);         // un repaso cada 4 misiones de descubrir
    const aprender = q - repasos;
    const ws = t.words.map(x => x.id);
    const grupos = Array.from({ length: aprender }, (_, i) => ws.slice(Math.floor(ws.length * i / aprender), Math.floor(ws.length * (i + 1) / aprender)));
    const palabras = [];
    grupos.forEach((g, i) => {
      palabras.push({ type: 'learn', ids: g, theme: t.key, chapter: ti + 1 });
      if ((i + 1) % 4 === 0 && palabras.filter(m => m.type === 'review').length < repasos) {
        const previas = grupos.slice(i - 3, i + 1).flat();
        palabras.push({ type: 'review', ids: previas, theme: t.key, chapter: ti + 1 });
      }
    });
    while (palabras.filter(m => m.type === 'review').length < repasos) {
      const k = palabras.filter(m => m.type === 'review').length;
      const ids = grupos.slice(-2 - k).flat().slice(0, 12);
      palabras.push({ type: 'review', ids, theme: t.key, chapter: ti + 1, extra: k });
    }
    const esp = (ESPECIALES[t.key] || []).map(spec => ({ ...parseSpec(spec), theme: t.key, chapter: ti + 1 }));
    // Se intercalan las especiales entre las de palabras
    const salida = [];
    const n = palabras.length + esp.length;
    let a = 0, b = 0;
    for (let i = 0; i < n; i++) {
      const tocaEsp = b < esp.length && (a >= palabras.length || (i + 1) * esp.length / n > b + 0.5);
      if (tocaEsp) salida.push(esp[b++]); else salida.push(palabras[a++]);
    }
    list.push(...salida);
  });
  return list;
}
function parseSpec(s) { const [type, arg, arg2] = s.split(':'); return { type, arg, arg2 }; }
const claveMision = m => m.type === 'learn' || m.type === 'review' ? `${m.type}:${m.ids.join(',')}` : `${m.type}:${m.arg || ''}:${m.arg2 || ''}`;

const esSub = es => es.replace(/^se está /, 'se esté ').replace(/^está /, 'esté ');
function listaPalabras(ids, max = 5) {
  const ws = ids.map(id => PALABRAS.byId[id].en);
  return ws.length > max ? ws.slice(0, max).join(', ') + '…' : ws.join(', ');
}

function resolveMission(spec) {
  const th = THEME[spec.theme];
  const m = { ...spec, count: 0, need: 1, t: 0 };
  const near = (x, y, d = 150) => Math.hypot(player.x - x, (player.y - y) * 1.3) < d;
  const nearest = list => { let b = null, bd = Infinity; list.forEach(e => { if (!e) return; const d = Math.hypot(e.x - player.x, e.y - player.y); if (d < bd) { bd = d; b = e; } }); return b; };
  const quizM = (kind, n = 3, pool, extraEn, extraEs) => Object.assign(m, { type: 'quiz', kind, need: n, pool,
    en: extraEn || { tense: 'Verb tenses quiz!', opposite: 'Opposites quiz!', prep: 'Prepositions quiz!', time: 'What time is it?', weather: "What's the weather like?", number: 'Numbers quiz!' }[kind] || `Quiz: ${th.name}`,
    es: extraEs || { tense: 'Quiz de tiempos verbales (toca la misión para empezar)', opposite: 'Quiz de opuestos', prep: 'Quiz de preposiciones', time: 'Responde qué hora es', weather: 'Responde cómo está el clima', number: 'Quiz de números' }[kind] || `Responde ${n} preguntas de «${th.es}»` });
  switch (spec.type) {
    case 'learn': {
      m.set = new Set(spec.ids);
      m.need = spec.ids.length;
      m.count = spec.ids.filter(id => progress.words[id]).length;
      m.en = `Discover ${m.need} words: ${listaPalabras(spec.ids)}`;
      m.es = `Descubre ${m.need} palabras de «${th.es}» ${th.icon}: toca las cosas, las personas o las burbujas`;
      m.target = () => nearest(spec.ids.filter(id => !progress.words[id]).flatMap(id => W.porPalabra[id] || []));
      m.check = () => { m.count = spec.ids.filter(id => progress.words[id]).length; return m.count >= m.need; };
      if (m.count >= m.need) m.autoDone = true;
      return m;
    }
    case 'review': return quizM('mix', 3, spec.ids, `Review quiz: ${listaPalabras(spec.ids, 4)}`, `Repaso de «${th.es}»: responde 3 preguntas`);
    case 'quizk': {
      if (spec.arg === 'tense') return quizM('tense', 3, spec.arg2, `Verb tenses quiz #${+spec.arg2 + 1}`);
      if (spec.arg === 'opposite') return quizM('opposite', 3, spec.arg2, `Opposites quiz #${+spec.arg2 + 1}`);
      if (spec.arg === 'prep') return quizM('prep', 3, spec.arg2, `Prepositions quiz #${+spec.arg2 + 1}`);
      if (spec.arg === 'time' || spec.arg === 'weather') return quizM(spec.arg, 1);
      return quizM(spec.arg, 3);
    }
    case 'greet': {
      m.en = 'Greet someone: good morning, good afternoon or good evening!'; m.es = 'Saluda a alguien según la hora del día (habla con una persona).'; m.event = 'talk';
      m.target = () => nearest(W.people.filter(p => !p.move)); return m;
    }
    case 'talk': {
      const ps = W.porRol[spec.arg] || [];
      const w = PAL[spec.arg];
      m.en = `Talk to the ${spec.arg}!`; m.es = `¡Habla con ${first(w.es)}! (tócalo o pulsa E cerca)`;
      m.event = 'talk'; m.rol = spec.arg; m.target = () => nearest(ps); return m;
    }
    case 'go': {
      const places = W.places[spec.arg];
      const [en, es] = nombreLugar(spec.arg);
      if (!places || !places.length) return quizM('mix', 3, null);
      const p = places[0];
      m.en = `Go to the ${en}!`; m.es = `¡Ve a ${es}!`.replace('a el ', 'al ');
      m.target = () => ({ x: p.doorX ?? p.x, y: p.frontY ?? p.y + 40 });
      m.check = () => p.x0 !== undefined ? player.x > p.x0 - 60 && player.x < p.x1 + 60 && player.y > (p.y0 ?? p.base - 900) && player.y < (p.y1 ?? p.base + 150) : near(p.x, p.y + 40, 240);
      return m;
    }
    case 'find': {
      const id = palabraId(spec.arg), list = (W.porPalabra[id] || []).filter(e => e.kind !== 'orb');
      const w = PAL[spec.arg];
      m.en = `Find the ${spec.arg}!`; m.es = `¡Encuentra ${first(w.es)}!`;
      m.target = () => nearest(list);
      m.check = () => list.some(e => { const b = e.box(); return Math.hypot(player.x - (b.x + b.w / 2), (player.y - e.y) * 1.2) < Math.max(190, b.w / 2 + 60); });
      return m;
    }
    case 'act': {
      const ps = W.porAct[spec.arg] || [];
      const act = ACTIONS[spec.arg];
      m.en = `Find someone who is ${act.en}!`; m.es = `¡Encuentra a alguien que ${esSub(act.es)}!`;
      m.target = () => nearest(ps); m.check = () => ps.some(p => Math.hypot(player.x - p.x, player.y - p.y) < 160); return m;
    }
    case 'adv': {
      const ps = W.people.filter(p => !p.move && p.act.advs.length > 1).sort((a, b) => (a.actKey + a.advKey).localeCompare(b.actKey + b.advKey));
      const p = ps[(+spec.arg * 7) % ps.length], adv = I.ADV[p.advKey];
      const match = W.people.filter(q => q.actKey === p.actKey && q.advKey === p.advKey);
      m.en = `Find someone who is ${p.act.en} ${adv.en}!`; m.es = `¡Encuentra a alguien que ${esSub(p.act.es)} ${adv.es}!`;
      m.target = () => nearest(match); m.check = () => match.some(q => Math.hypot(player.x - q.x, player.y - q.y) < 160); return m;
    }
    case 'wear': {
      const TOP = { 'camiseta': N.tshirt, 'camisa': N.shirt, 'suéter': N.sweater, 'abrigo': N.coat, 'vestido': N.dress };
      const cands = W.people.filter(p => TOP[p.geo.topType] && COLORS[colorName(p.geo.topColor)] && !p.move).sort((a, b) => a.x - b.x);
      const p = cands[Math.floor(cands.length / 2)];
      const topN = TOP[p.geo.topType], ck = colorName(p.geo.topColor);
      const match = W.people.filter(q => q.geo.topType === p.geo.topType && colorName(q.geo.topColor) === ck);
      m.en = `Find someone wearing ${I.a(COLORS[ck].en + ' ' + topN.en)}!`; m.es = `¡Encuentra a alguien que lleve ${I.un(topN)} ${topN.es} ${adjEs(COLORS[ck], topN)}!`;
      m.target = () => nearest(match); m.check = () => match.some(q => Math.hypot(player.x - q.x, player.y - q.y) < 150); return m;
    }
    case 'ring': {
      const b = W.buildings.find(b => !b.shop && b.num === +spec.arg) || W.buildings.find(b => !b.shop);
      m.en = `Ring the doorbell of house number ${b.num}.`; m.es = `Toca el timbre de la casa número ${b.num} (toca la puerta o pulsa E).`;
      m.event = 'ring'; m.ringTarget = b; m.target = () => ({ x: b.doorX, y: b.frontY }); return m;
    }
    case 'pos': {
      const k = spec.arg;
      if (k === 'crosswalk') { m.en = 'Stand on the crosswalk!'; m.es = '¡Párate en el paso de peatones!'; m.check = () => surfaceAt(player.x, player.y).key === 'crosswalk'; m.target = () => nearest(W.crossings.map(c => ({ x: (c.x0 + c.x1) / 2, y: (c.y0 + c.y1) / 2 }))); return m; }
      if (k === 'under') { m.en = 'Stand under a tree!'; m.es = '¡Párate debajo de un árbol!'; m.check = () => relationOf(player.x, player.y)?.rel?.key === 'under'; m.target = () => nearest(W.trees); return m; }
      if (k === 'near') { m.en = 'Go near the pond!'; m.es = '¡Ve cerca del estanque!'; m.check = () => relationOf(player.x, player.y)?.rel?.key === 'near'; m.target = () => nearest(W.ponds.map(p => ({ x: p.x, y: p.y + 130 }))); return m; }
      const b = (W.places[spec.arg2] || [])[0] || W.buildings[0];
      const lab = etiquetaEdificio(b);
      const P = { inFrontOf: ['in front of', 'Stand'], behind: ['behind', 'Go'], nextTo: ['next to', 'Stand'] }[k];
      m.en = `${P[1]} ${P[0]} ${lab.the}!`; m.es = `¡${P[1] === 'Go' ? 'Ve' : 'Párate'} ${I.prepEs(I.PREP[k], lab.es)}!`;
      m.target = () => ({ x: k === 'nextTo' ? b.x1 + 90 : (b.x0 + b.x1) / 2, y: k === 'behind' ? b.base - 150 : k === 'nextTo' ? b.base + 20 : b.frontY });
      m.check = () => { const r = relationOf(player.x, player.y); return r && r.rel && r.rel.b === b && r.rel.key === k; };
      return m;
    }
    case 'lights': {
      m.en = 'At night, find a streetlight that is on.'; m.es = 'De noche, encuentra una farola encendida (espera a que oscurezca 🌙).';
      const ls = W.ents.filter(e => e.kind === 'streetlight');
      m.target = () => nearest(ls); m.check = () => isDark() && ls.some(e => near(e.x, e.y, 170)); return m;
    }
  }
  return quizM('mix', 3, null);
}

/* ============================================================================
   QUIZZES
============================================================================ */
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pickN = (arr, n, not) => shuffle([...new Set(arr)].filter(x => !not.includes(x))).slice(0, n);
const TIEMPOS_VERBOS = [
  ['go', 'eat', 'see', 'take', 'come', 'give', 'make', 'buy'], ['drink', 'drive', 'write', 'read', 'speak', 'sleep', 'swim', 'run'],
  ['sing', 'fly', 'draw', 'build', 'catch', 'throw', 'teach', 'think'], ['win', 'lose', 'find', 'send', 'spend', 'sell', 'pay', 'meet'],
  ['cook', 'clean', 'wash', 'play', 'walk', 'study', 'visit', 'travel']
];
const PREP_FACTS = [['The cat is ___ the roof.', 'on'], ['The ball is ___ the bench.', 'under'], ['The mailbox is ___ the house.', 'next to'],
  ['The ducks are ___ the pond.', 'in'], ['The bench is ___ two trees.', 'between'], ['The lamp is ___ the table.', 'above'],
  ['The dog is ___ the doghouse.', 'next to'], ['The garden is ___ the house.', 'behind'], ['I go ___ school by bus.', 'to'],
  ['I am ___ Mexico.', 'from'], ['Coffee ___ milk, please.', 'with'], ['The plane flies ___ the city.', 'over'],
  ['We walk ___ the park.', 'through'], ["See you ___ five o'clock.", 'at'], ['My birthday is ___ March.', 'in'], ['The book is ___ the table.', 'on'],
  ['The subway goes ___ the ground.', 'under'], ['The bridge goes ___ the river.', 'over'], ['Walk ___ the street.', 'across'], ['The bank is ___ the church.', 'across from']];

function genQuestion(kind, themeKey, pool) {
  const th = THEME[themeKey] || THEME.basics;
  const base = Array.isArray(pool) && pool.length ? pool.map(id => PALABRAS.byId[id]).filter(Boolean) : th.words;
  const collected = base.filter(w => progress.words[w.id]);
  const src = collected.length >= 3 ? collected : base;
  const w = src[Math.floor(Math.random() * src.length)];
  const k = kind === 'mix' ? ['meaning', 'say', 'listen'][Math.floor(Math.random() * 3)] : kind;
  const distractores = base.length >= 4 ? base : th.words;
  if (k === 'meaning') {
    const opts = [w.es, ...pickN(distractores.map(x => x.es), 3, [w.es])];
    return { q: `What does “${w.en}” mean?`, qes: '¿Qué significa?', speak: w.en, options: shuffle(opts), correct: w.es, explainEn: `${w.en} means ${first(w.es)}.`, word: w };
  }
  if (k === 'say') {
    const opts = [w.en, ...pickN(distractores.map(x => x.en), 3, [w.en])];
    return { q: `How do you say “${first(w.es)}” in English?`, qes: '¿Cómo se dice en inglés?', options: shuffle(opts), correct: w.en, explainEn: `${first(w.es)} is “${w.en}”.`, word: w };
  }
  if (k === 'listen') {
    const opts = [w.en, ...pickN(distractores.map(x => x.en), 3, [w.en])];
    return { q: '🔊 Listen! Which word do you hear?', qes: 'Escucha: ¿qué palabra oyes? (pulsa R para repetir)', speak: w.en, listen: true, options: shuffle(opts), correct: w.en, explainEn: `The word is “${w.en}”.`, word: w };
  }
  if (k === 'tense') {
    const grupo = TIEMPOS_VERBOS[(+pool || 0) % TIEMPOS_VERBOS.length];
    const verbs = THEME.verbs.words.filter(v => grupo.includes(v.en));
    const v = verbs[Math.floor(Math.random() * verbs.length)] || THEME.verbs.words[2];
    const nm = [...FEM, ...MASC][Math.floor(Math.random() * 40)];
    const forms = [
      { cue: 'Yesterday, I ___ .', cueEs: 'Ayer… (pasado simple)', ok: v.past, name: 'Past simple' },
      { cue: `Look! ${nm} is ___ now.`, cueEs: '¡Mira! … ahora (presente continuo)', ok: v.ing, name: 'Present continuous' },
      { cue: `Every day, ${nm} ___ .`, cueEs: 'Todos los días… (presente simple, 3.ª persona)', ok: v.s, name: 'Present simple' },
      { cue: 'Tomorrow, I ___ .', cueEs: 'Mañana… (futuro)', ok: 'will ' + v.en, name: 'Future' },
      { cue: 'I have already ___ .', cueEs: 'Ya he… (presente perfecto)', ok: v.pp, name: 'Present perfect' }
    ];
    const f = forms[Math.floor(Math.random() * forms.length)];
    const opts = [f.ok, ...pickN([v.en, v.past, v.pp, v.ing, v.s, 'will ' + v.en], 3, [f.ok])];
    return { q: `${f.cue}  (to ${v.en})`, qes: `${f.cueEs} — ${v.es}`, options: shuffle(opts), correct: f.ok, explainEn: f.cue.replace('___ ', f.ok).replace('___', f.ok), tenseName: f.name, word: v };
  }
  if (k === 'opposite') {
    const parte = +pool || 0, n = I.OPPOSITES.length;
    const pares = I.OPPOSITES.slice(Math.floor(n * parte / 3), Math.floor(n * (parte + 1) / 3));
    const [a, b] = pares[Math.floor(Math.random() * pares.length)];
    const adjs = THEME.adjectives.words.map(x => x.en).concat(['hot', 'cold', 'early', 'late', 'light', 'dark', 'sick', 'healthy', 'wet', 'dry']);
    const opts = [b, ...pickN(adjs, 3, [a, b])];
    return { q: `What is the opposite of “${a}”?`, qes: '¿Cuál es el opuesto?', speak: a, options: shuffle(opts), correct: b, explainEn: `The opposite of ${a} is ${b}.` };
  }
  if (k === 'prep') {
    const mitad = (+pool || 0) % 2;
    const facts = PREP_FACTS.filter((f, i) => i % 2 === mitad);
    const f = facts[Math.floor(Math.random() * facts.length)];
    const opts = [f[1], ...pickN(['on', 'under', 'in', 'behind', 'next to', 'in front of', 'between', 'above', 'to', 'from', 'with', 'at', 'over', 'through', 'across', 'across from'], 3, [f[1]])];
    return { q: f[0], qes: 'Elige la preposición correcta', options: shuffle(opts), correct: f[1], explainEn: f[0].replace('___', f[1]) };
  }
  if (k === 'time') {
    const ok = I.timeWords(hourNow(), Math.floor(clockMin % 60)).en;
    const set = new Set([ok]);
    while (set.size < 4) set.add(I.timeWords(Math.floor(Math.random() * 24), [0, 15, 30, 45][Math.floor(Math.random() * 4)]).en);
    return { q: `What time is it? 🕰️ ${clockText()}`, qes: 'Mira el reloj de arriba: ¿qué hora es?', options: shuffle([...set]), correct: ok, explainEn: ok };
  }
  if (k === 'weather') {
    const ok = I.WEATHER[weather.kind].en;
    return { q: "What's the weather like now?", qes: 'Mira el cielo: ¿cómo está el clima?', options: shuffle(Object.values(I.WEATHER).map(x => x.en)), correct: ok, explainEn: ok };
  }
  if (k === 'number') {
    const nums = THEME.numbers.words.filter(x => x.t === 'm' && /^\d+$/.test(x.value));
    const w2 = nums[Math.floor(Math.random() * nums.length)];
    const opts = [w2.en, ...pickN(nums.map(x => x.en), 3, [w2.en])];
    return { q: `How do you write ${Number(w2.value).toLocaleString('en-US')}?`, qes: '¿Cómo se escribe este número?', options: shuffle(opts), correct: w2.en, explainEn: `${w2.value} is ${w2.en}.`, word: w2 };
  }
  return genQuestion('meaning', themeKey, pool);
}
