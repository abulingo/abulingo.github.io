'use strict';

/* ============================================================================
   ENGLISH TOWN · MOTOR (2/4): generación del mundo
   ----------------------------------------------------------------------------
   Todo lo que está quieto (edificios, escenas, carteles, árboles, burbujas)
   se coloca con un mapa de ocupación: cada cosa reserva su caja visual y la
   siguiente solo se pone donde no choca con ninguna. Así nada tapa a nada.
============================================================================ */

/* ---------- Edificios nuevos ---------- */
Object.assign(N, {
  church: { en: 'church', es: 'iglesia', g: 'f', icon: '⛪' }, office: { en: 'office', es: 'oficina', g: 'f', icon: '🏢' },
  homeStore: { en: 'home store', es: 'tienda del hogar', g: 'f', icon: '🛋️' }, apartments: { en: 'apartment building', es: 'edificio de apartamentos', g: 'm', icon: '🏢' }
});
Object.assign(I.BUILDINGS, {
  church: { n: N.church, sign: 'CHURCH', fact: ['People get married here.', 'Aquí la gente se casa.'], wall: '#f5f0e6', door: '#6d4c41' },
  office: { n: N.office, sign: 'OFFICE', fact: ['People work at computers here.', 'Aquí la gente trabaja en computadoras.'], wall: '#cfd8dc', door: '#263238' },
  homeStore: { n: N.homeStore, sign: 'HOME STORE', fact: ['You can buy things for your house here.', 'Aquí puedes comprar cosas para tu casa.'], wall: '#ffe0b2', door: '#bf360c' },
  apartments: { n: N.apartments, sign: 'APARTMENTS', fact: ['Many families live here.', 'Aquí viven muchas familias.'], wall: '#d7ccc8', door: '#4e342e' }
});
// Palabras que enseña cada edificio (además de su nombre)
const PALABRAS_EDIFICIO = {
  school: ['school'], library: ['library'], hospital: ['hospital'], pharmacy: ['pharmacy'], supermarket: ['supermarket'], bakery: ['bakery'],
  cafe: [], restaurant: ['restaurant'], clothesStore: ['store'], gym: ['gym'], cinema: ['cinema'], hotel: ['hotel'], petShop: ['shop'], toyStore: [],
  bank: ['bank'], postOffice: ['post office'], fireStation: ['fire station'], policeStation: ['police station'], museum: ['museum'], church: ['church'],
  office: ['office', 'building'], homeStore: [], apartments: ['apartment'], house: ['house', 'home']
};

/* ---------- Mapa de ocupación (hash espacial) ---------- */
function crearOcupacion() {
  const C = 200, m = new Map(), lista = [];
  const claves = r => { const out = []; for (let i = Math.floor(r.x0 / C); i <= Math.floor(r.x1 / C); i++) for (let j = Math.floor(r.y0 / C); j <= Math.floor(r.y1 / C); j++) out.push(i * 100000 + j); return out; };
  const cruza = (a, b) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
  return {
    lista,
    add(r, tipo) { r.tipo = tipo || r.tipo || '?'; lista.push(r); claves(r).forEach(k => { if (!m.has(k)) m.set(k, []); m.get(k).push(r); }); return r; },
    libre(r, mg = 0, ignorar) {
      const q = { x0: r.x0 - mg, y0: r.y0 - mg, x1: r.x1 + mg, y1: r.y1 + mg };
      for (const k of claves(q)) { const l = m.get(k); if (l) for (const o of l) if (cruza(q, o) && !(ignorar && ignorar.includes(o.tipo))) return false; }
      return true;
    }
  };
}
const caja = (x0, y0, x1, y1) => ({ x0, y0, x1, y1 });
const lotArea = lot => ({ x0: lot.left + 40, x1: lot.right - 40, y0: lot.base - 860, y1: lot.base + 50 });

/* ---------- Lecciones de palabras ---------- */
const CAT_OF = { n: 'noun', u: 'noun', m: 'noun', r: 'noun', c: 'noun', q: 'noun', x: 'noun', v: 'verb', a: 'adj', d: 'adv', p: 'prep' };
const FEELINGS = new Set(['tired', 'hungry', 'thirsty', 'sick', 'healthy', 'happy', 'sad', 'angry', 'afraid', 'surprised', 'bored', 'excited', 'worried', 'busy', 'ready', 'alone', 'sleepy', 'lucky']);
const first = s => s.split(' / ')[0].replace(/ \(.*\)$/, '');
function unEs(es) {
  const e = first(es);
  if (/^el /.test(e)) return 'un ' + e.slice(3);
  if (/^la /.test(e)) return 'una ' + e.slice(3);
  if (/^los /.test(e)) return 'unos ' + e.slice(4);
  if (/^las /.test(e)) return 'unas ' + e.slice(4);
  return e;
}
function wordLesson(w) {
  const th = THEME[w.theme];
  let en, es, extra = '', speak;
  if (w.exEn) { en = w.exEn; es = w.exEs; }
  else if (w.t === 'n') {
    const esF = first(w.es);
    if (/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)$/.test(w.en)) { en = `Today is ${w.en}.`; es = `Hoy es ${esF.replace(/^el /, '')}.`; }
    else if (/^[A-Z]/.test(w.en)) { en = `My birthday is in ${w.en}.`; es = `Mi cumpleaños es en ${esF}.`; }
    else if (/^(los|las) /.test(esF)) { en = `Look! ${I.cap(w.en)}!`; es = `¡Mira! ¡${I.cap(esF.replace(/^(los|las) /, ''))}!`; }
    else { en = `Look! ${I.cap(I.a(w.en))}.`; es = `¡Mira! ${I.cap(unEs(w.es))}.`; }
  } else if (w.t === 'u') { en = `This is ${w.en}.`; es = `Esto es ${first(w.es).replace(/^(el|la) /, '')}.`; }
  else if (w.t === 'a') {
    if (FEELINGS.has(w.en)) { en = `I am ${w.en}.`; es = `Estoy ${first(w.es)}.`; }
    else { en = `It is ${w.en}.`; es = `Es ${first(w.es)}.`; }
  } else if (w.t === 'v') {
    const b = w.en === 'be' ? 'am' : w.en, p = w.en === 'be' ? 'was' : w.past;
    en = `I ${b} · I ${p} · I have ${w.pp}`;
    es = `${w.es}: yo ${w.yoPres} · yo ${w.yoPast}`;
    extra = `${w.en} · ${w.past} · ${w.pp} · ${w.ing} · (he/she) ${w.s}`;
    speak = `${w.en}. ${w.past}. ${w.pp}.`;
  } else if (w.t === 'm') { en = `Number ${w.value}: ${w.en}.`; es = `Número ${w.value}: ${w.es}.`; }
  else { en = w.en; es = w.es; }
  return { cat: CAT_OF[w.t] || 'noun', word: w.en, wordEs: w.es, en, es, icon: w.icon, extra, speak: speak || `${w.en}. ${en}`, theme: th, wordId: w.id };
}
const leccionDe = en => wordLesson(PAL[en]);
const conPalabra = (lec, en) => Object.assign(lec, { wordId: palabraId(en) });

/* ============================================================================
   GENERACIÓN
============================================================================ */
const SKIES = { day: { top: '#5fa8d3', bottom: '#cfe8f5' }, evening: { top: '#6a4c93', bottom: '#f6a55c' }, night: { top: '#0b1320', bottom: '#243b55' } };

function genWorld(seed) {
  const R = Gen.makeRand(seed);
  const w = { seed, ents: [], solids: [], buildings: [], trees: [], people: [], cars: [], lights: [], ponds: [], benches: [], crossings: [], grounds: [],
    lots: [], orbs: [], animals: [], places: {}, winLights: [], porPalabra: {}, porRol: {}, porAct: {}, info: {}, avisos: [], pastures: [], campos: [] };
  const occ = crearOcupacion();
  w.occ = occ;
  let orden = 0;
  const add = e => { e.cd = 0; e.li = 0; e.orden = orden++; if (e.sortY === undefined) e.sortY = e.y; w.ents.push(e); return e; };
  w.add = add;
  let nombres = 0;
  const nombre = sexo => { nombres++; const l = sexo === 'f' ? FEM : sexo === 'm' ? MASC : (nombres % 2 ? FEM : MASC); return l[(nombres * 7 + R.int(0, 3)) % l.length]; };

  /* ---------- Reservas: calles, bordes y mar ---------- */
  for (let r = 0; r < ROWS; r++) occ.add(caja(-2000, rowBase(r) + SW_A[0] - 8, WORLD_W + 2000, rowBase(r) + SW_B[1] + 6), 'calle');
  vstreets.forEach(v => occ.add(caja(v.x0 - 44, -2000, v.x1 + 44, LAST_ROAD_END + 10), 'calle'));
  occ.add(caja(-2000, -4000, 30, SEA_END), 'borde'); occ.add(caja(WORLD_W - 30, -4000, WORLD_W + 2000, SEA_END), 'borde');
  occ.add(caja(-2000, SEA_Y - 12, WORLD_W + 2000, SEA_END + 2000), 'mar');
  occ.add(caja(-2000, -4000, WORLD_W + 2000, -872), 'cielo');

  /* ---------- Tipos de lote ---------- */
  const n = ROWS * lotsX.length;
  const types = new Array(n).fill(null);
  const pool = [...MundoDatos.LOTES];
  const quitar = t => pool.splice(pool.indexOf(t), 1);
  const centro = 2 * lotsX.length + 4;
  types[centro] = 'plaza'; quitar('plaza');
  const bordes = [];
  for (let i = 0; i < n; i++) { const c = i % lotsX.length; if ((c === 0 || c === lotsX.length - 1) && !types[i]) bordes.push(i); }
  bordes.sort(() => R() - 0.5).slice(0, 2).forEach(i => { types[i] = 'farm'; quitar('farm'); });
  pool.sort(() => R() - 0.5);
  for (let i = 0; i < n; i++) if (!types[i]) types[i] = pool.pop();

  let houseNum = 0;
  const usedHouseColors = {};
  for (let r = 0; r < ROWS; r++) {
    lotsX.forEach((lot, li) => {
      const type = types[r * lotsX.length + li];
      const L2 = { ...lot, row: r, base: rowBase(r), type, escenas: 0 };
      w.lots.push(L2);
      if (I.BUILDINGS[type] || type === 'house') makeBuilding(w, R, add, L2, type, type === 'house' ? ++houseNum : 0, usedHouseColors);
      else {
        const A = lotArea(L2);
        (w.places[type] = w.places[type] || []).push({ doorX: L2.cx, frontY: L2.base + 40, x0: A.x0, x1: A.x1, base: L2.base, lot: L2 });
        LOTE_ESPECIAL[type](w, R, add, L2);
      }
    });
  }
  w.buildings.forEach(b => {
    if (b.shop) return;
    const c = b.color;
    b.label = usedHouseColors[c] === 1
      ? { en: `${c} house`, the: `the ${c} house`, esFull: `la casa ${adjEs(COLORS[c], N.house)}` }
      : { en: `house number ${b.num}`, the: `house number ${b.num}`, esFull: `la casa número ${b.num}` };
  });

  /* ---------- Mobiliario urbano (antes que las escenas: sobresale hacia los lotes) ---------- */
  for (let r = 0; r < ROWS; r++) {
    const base = rowBase(r);
    for (let x = 350; x < WORLD_W - 200; x += 900) {
      if (vstreets.some(v => x > v.x0 - 80 && x < v.x1 + 80)) continue;
      const lx = x, ly = base + SW_A[1] - 6;
      if (!occ.libre(caja(lx - 14, ly - 212, lx + 48, ly), 4, ['calle'])) continue;
      occ.add(caja(lx - 14, ly - 212, lx + 48, ly), 'farola');
      w.lights.push({ x: lx + 30, y: ly - 195 });
      registrarPalabras(add({ kind: 'streetlight', x: lx, y: ly, box: () => ({ x: lx - 12, y: ly - 210, w: 60, h: 210 }), draw: g => Draw.streetlight(g, lx, ly, isDark()),
        lessons: () => [leccionDe('streetlight'), conPalabra(L.adj(N.streetlight, isDark() ? 'on' : 'off'), 'streetlight'), conPalabra(L.prep('The streetlight', 'La farola', 'onSurface', N.sidewalk), 'sidewalk')] }));
    }
    vstreets.forEach(v => {
      const lx = v.x0 - 26, ly = base + SW_A[1] - 4, offset = R.range(0, 14);
      occ.add(caja(lx - 22, ly - 230, lx + 22, ly), 'semaforo');
      const tl = add({
        kind: 'trafficLight', x: lx, y: ly, row: r, v, offset, box: () => ({ x: lx - 20, y: ly - 228, w: 40, h: 228 }),
        state: () => { const c = (now + offset) % 15; return c < 7 ? 'green' : c < 9 ? 'yellow' : 'red'; },
        draw: g => Draw.trafficLight(g, lx, ly, tl.state()),
        lessons: () => {
          const s = tl.state();
          // «stop» y «go» se enseñan siempre; la del color actual va con la frase del momento
          const rojo = conPalabra(L.free('verb', 'stop', 'parar', 'When the light is red, the cars stop.', 'Cuando la luz está en rojo, los carros se detienen.', '🛑', 'to stop · stopped · stopping'), 'stop');
          const verde = conPalabra(L.free('verb', 'go', 'avanzar', 'When the light is green, the cars go.', 'Cuando la luz está en verde, los carros avanzan.', '🟢', 'to go · went · going'), 'go');
          return [leccionDe('traffic light'), ...(s === 'red' ? [] : [rojo]), ...(s === 'green' ? [] : [verde]), s === 'red'
            ? conPalabra(L.free('verb', 'stop', 'parar', 'The traffic light is red. The cars stop.', 'El semáforo está en rojo. Los carros se detienen.', '🚦', 'to stop · stopped · stopping'), 'stop')
            : s === 'green' ? conPalabra(L.free('verb', 'go', 'avanzar', 'The traffic light is green. The cars go.', 'El semáforo está en verde. Los carros avanzan.', '🚦', 'to go · went · going'), 'go')
            : conPalabra(L.free('adj', 'yellow', 'amarillo', 'The traffic light is yellow. Slow down!', 'El semáforo está en amarillo. ¡Más despacio!', '🚦'), 'yellow')];
        }
      });
      registrarPalabras(tl);
      w.crossings.push({ x0: v.x0 + 30, x1: v.x1 - 30, y0: base + ROAD[0] + 14, y1: base + ROAD[1] - 14, row: r });
      registrarPalabras(add({ kind: 'crosswalk', x: v.x0 + VS_W / 2, y: base + ROAD[0] + 2, noDraw: true, box: () => ({ x: v.x0 + 30, y: base + ROAD[0] + 14, w: VS_W - 60, h: ROAD[1] - ROAD[0] - 28 }),
        lessons: () => [leccionDe('crosswalk'), conPalabra(L.free('verb', 'cross', 'cruzar', 'Look both ways before you cross the street.', 'Mira a ambos lados antes de cruzar la calle.', '🚸'), 'cross'),
          conPalabra(L.free('noun', 'street', 'calle', 'This is a busy street.', 'Esta es una calle con mucho tráfico.', '🛣️'), 'street')] }));
    });
  }
  const busSpots = [];
  for (let k = 0; k < 5; k++) {
    for (let intento = 0; intento < 20; intento++) {
      const r = (k + intento) % ROWS, lot = R.pick(lotsX), bx = lot.cx + R.sym(360), by = rowBase(r) + SW_B[0] + 30;
      if (busSpots.some(([x, y]) => Math.abs(x - bx) < 400 && Math.abs(y - by) < 100)) continue;
      busSpots.push([bx, by]);
      registrarPalabras(add({ kind: 'busStop', x: bx, y: by, box: () => ({ x: bx - 24, y: by - 194, w: 48, h: 194 }), draw: g => Draw.busStop(g, bx, by),
        lessons: () => [conPalabra(L.noun(N.busStop, 'People wait for the bus here.', 'Aquí la gente espera el autobús.'), 'bus stop')] }));
      break;
    }
  }

  /* ---------- Escenas ---------- */
  MundoDatos.ESCENAS.forEach(esc => colocarEscena(w, R, esc, nombre));
  // Playa: franja de arena dividida en tramos como si fueran lotes
  const tramos = lotsX.map(l => ({ left: l.left, right: l.right, cx: l.cx, base: SEA_Y, type: 'beach', escenas: 0, area: { x0: l.left + 30, x1: l.right - 30, y0: SAND_Y0 + 24, y1: BOTTOM_Y } }));
  w.places.beach = [{ doorX: WORLD_W / 2, frontY: SAND_Y0 + 150, x0: 0, x1: WORLD_W, base: BOTTOM_Y, y0: SAND_Y0, y1: BOTTOM_Y }];
  MundoDatos.PLAYA.forEach((p, i) => colocarEscena(w, R, { id: 'beach' + i, lotes: ['beach'], ...p }, nombre, R.pick(tramos)));
  hacerMar(w, R, add, nombre);
  hacerCielo(w, R, add);

  /* ---------- Árboles en los huecos verdes ---------- */
  const lotesArboles = w.lots.filter(l => ['house', 'parkPond', 'parkRiver', 'campground', 'garden', 'farm', 'zoo'].includes(l.type) || (I.BUILDINGS[l.type] && R.chance(0.5)));
  let arboles = 0;
  for (const l of lotesArboles.sort(() => R() - 0.5)) {
    const cuantos = l.type === 'campground' ? 4 : l.type.startsWith('park') ? 3 : 1;
    for (let k = 0; k < cuantos && arboles < 60; k++) if (plantarArbol(w, R, add, l)) arboles++;
  }

  /* ---------- Tráfico y peatones ---------- */
  for (let r = 0; r < ROWS; r++) for (let i = 0; i < 3; i++) makeCar(w, R, add, r, i % 2, R.range(0, WORLD_W));
  [['bus', 0], ['bus', 3], ['taxi', 1], ['taxi', 4], ['taxi', 2], ['truck', 5], ['truck', 2], ['motorcycle', 1], ['motorcycle', 4]].forEach(([tipo, r], i) => makeVehiculo(w, R, add, tipo, r, i % 2, R.range(0, WORLD_W)));
  makeCaminantes(w, R, add, nombre);
  // Visitas en la puerta de dos casas: alguien toca la puerta y alguien trae flores
  const casas = w.buildings.filter(b => !b.shop).sort(() => R() - 0.5);
  [['guest', 'knock'], ['friend', 'visit']].forEach(([rol, act], i) => {
    const b = casas[i];
    if (!b) return;
    const x = b.doorX + 52, y = b.base + 58;
    crearPersona(w, R, { rol, act, x: 0, y: 0, dir: -1 }, x, y, y, nombre, 'house');
  });
  busSpots.forEach(([x, y], i) => { if (i < 3) crearPersona(w, R, { rol: i === 0 ? 'student' : 'adult', act: 'wait', x: 0, y: 0, dir: -1 }, x + 44, y + 2, y + 2, nombre, 'busStop'); });

  /* ---------- Burbujas para las palabras abstractas ---------- */
  colocarBurbujas(w, R);

  /* ---------- Índices ---------- */
  w.ents.forEach(e => {
    (e.palabras || []).forEach(id => { (w.porPalabra[id] = w.porPalabra[id] || []).push(e); });
    if (e.kind === 'person') { if (e.rol) (w.porRol[e.rol] = w.porRol[e.rol] || []).push(e); (w.porAct[e.actKey] = w.porAct[e.actKey] || []).push(e); }
    if (e.kind === 'group') (w.porAct[e.actKey] = w.porAct[e.actKey] || []).push(e);
  });
  return w;
}

/* ---------- Palabras que enseña una entidad (se leen de sus lecciones) ---------- */
function registrarPalabras(e) {
  try { e.palabras = [...new Set(e.lessons().map(l => l.wordId).filter(Boolean))]; } catch (err) { e.palabras = []; }
  return e;
}

/* ============================================================================
   EDIFICIOS
============================================================================ */
function makeBuilding(w, R, add, lot, type, num, usedHouseColors) {
  const base = lot.base;
  const shop = type !== 'house' ? I.BUILDINGS[type] : null;
  const alto = { school: 3, hospital: 3, hotel: 3, apartments: 3, office: 3 }[type] || 2;
  const hp = shop ? (type === 'church' ? {
    ...Casa.config.presets['Aleatoria'], floors: 2, width: 1.1, windows: 3, roof: 'dos aguas', garage: 'no', chimney: 'no', fence: 'no', trees: 0, wallTexture: 'liso',
    randomColors: false, wallColor: shop.wall, roofColor: '#8d6e63', doorColor: shop.door, trimColor: '#ffffff', time: 'día', solo: true
  } : {
    ...Casa.config.presets['Moderna'], floors: alto, width: R.range(1.15, 1.3), windows: R.int(3, 4), roof: 'plano', garage: 'no', chimney: 'no', fence: 'no', trees: 0,
    wallTexture: R.pick(['liso', 'ladrillo']), randomColors: false, wallColor: shop.wall, roofColor: '#3a3a3a', doorColor: shop.door, trimColor: '#ffffff', time: 'día', solo: true
  }) : {
    ...Casa.config.presets['Aleatoria'], floors: R.int(1, 2), width: R.range(0.85, 1.1), windows: R.int(2, 4), windowSize: R.range(0.9, 1.1),
    roofPitch: R.range(0.8, 1.2), fence: 'no', trees: 0, time: 'día', solo: true
  };
  const seed = `${w.seed}:edificio:${base}:${lot.cx}`;
  const parts = noBg(Casa.build(hp, Gen.makeRand(seed)));
  const geo = parts.geo;
  const ox = lot.cx - 500, oy = base - geo.groundY;
  const X = x => x + ox, Y = y => y + oy;
  const kind = shop ? type : 'house';
  const b = { kind, shop, num, lot, row: lot.row, base, parts, geo, ox, oy, x0: X(geo.x0), x1: X(geo.x1), color: colorName(geo.wall), faces: [] };
  if (!shop) usedHouseColors[b.color] = (usedHouseColors[b.color] || 0) + 1;
  geo.windows.forEach((win, k) => {
    if (R.chance(0.55)) w.winLights.push({ x: X(win.x), y: Y(win.y), w: win.w, h: win.h });
    if (!R.chance(shop ? 0.15 : 0.25)) return;
    const fp = { ...Rostro.config.presets['Aleatorio'], smile: R.range(0, 0.9) };
    b.faces.push({ win, parts: noBg(Rostro.build(fp, Gen.makeRand(`${seed}:ventana:${k}`))) });
  });
  w.buildings.push(b);
  (w.places[b.kind] = w.places[b.kind] || []).push(b);
  b.roofY = Y(geo.roofPeak) - (type === 'church' ? 130 : 0);
  w.occ.add(caja(b.x0 - 8, b.roofY - 10, b.x1 + 8, base + 6), 'edificio');
  w.solids.push({ x0: X(geo.x0) - 10, x1: X(geo.x1) + 10, y0: base - 70, y1: base + 4 });
  const n = shop ? shop.n : N.house;
  const wallC = b.color, doorC = colorName(geo.door.color), roofC = colorName(geo.roof);
  const extras = PALABRAS_EDIFICIO[kind] || [];
  const e = add({
    kind: b.kind, x: lot.cx, y: base - 5, building: b,
    box: () => ({ x: X(geo.houseX0), y: b.roofY, w: geo.houseX1 - geo.houseX0, h: base - b.roofY }),
    draw: g => drawBuilding(g, b),
    lessons: () => {
      const ls = [];
      if (shop) ls.push(Object.assign(L.theNoun(n, shop.fact[0], shop.fact[1]), extras[0] ? { wordId: palabraId(extras[0]) } : {}));
      else ls.push(conPalabra(L.noun(N.house, `It is house number ${num}.`, `Es la casa número ${num}.`), 'house'),
        conPalabra(L.free('noun', 'home', 'hogar', `This is my home. I live in house number ${num}.`, `Este es mi hogar. Vivo en la casa número ${num}.`, '🏡'), 'home'));
      extras.slice(shop ? 1 : 2).forEach(p => ls.push(leccionDe(p)));
      ls.push(Object.assign(L.color(n, wallC), COLORS[wallC] && PAL[wallC] ? { wordId: palabraId(wallC) } : {}));
      if (geo.floors === 1) ls.push(conPalabra(L.adj(n, 'small'), 'small')); else if (geo.floors === 3) ls.push(conPalabra(L.adj(n, 'big'), 'big'));
      ls.push(L.number(n, geo.floors, { en: 'floors', es: 'pisos', g: 'm', pl: true }), L.number(n, geo.windows.length, N.windows));
      if (b.faces.length) ls.push(conPalabra(L.free('verb', 'looking', 'mirar', 'Someone is looking out of the window.', 'Alguien está mirando por la ventana.', '👀'), 'look'));
      return ls;
    }
  });
  registrarPalabras(e);
  const d = geo.door;
  b.doorX = X(d.x + d.w / 2);
  b.frontY = base + SW_A[0] - 10;
  w.occ.add(caja(b.doorX - 44, base - 4, b.doorX + 44, base + SW_A[0]), 'entrada');
  registrarPalabras(add({ kind: 'door', x: b.doorX, y: base - 1, noDraw: true, building: b, box: () => ({ x: X(d.x) - 6, y: Y(d.y) - 6, w: d.w + 12, h: d.h + 6 }),
    lessons: () => [leccionDe('door'), Object.assign(L.color(N.door, doorC), PAL[doorC] ? { wordId: palabraId(doorC) } : {}), conPalabra(L.adj(N.door, b.ring > 0 ? 'open' : 'closed'), 'closed'),
      conPalabra(L.free('verb', 'knock', 'tocar', 'Knock on the door!', '¡Toca la puerta!', '✊'), 'knock')] }));
  registrarPalabras(add({ kind: 'roof', x: X(geo.cx), y: base - 3, noDraw: true, box: () => ({ x: X(geo.houseX0) - 28, y: Y(geo.roofPeak) - 6, w: geo.houseX1 - geo.houseX0 + 56, h: geo.wallTop - geo.roofPeak + 10 }),
    lessons: () => [leccionDe('roof'), Object.assign(L.color(N.roof, roofC), PAL[roofC] ? { wordId: palabraId(roofC) } : {})] }));
  if (geo.windows.length) {
    const win = geo.windows[0];
    registrarPalabras(add({ kind: 'window', x: X(win.x + win.w / 2), y: base - 2, noDraw: true, box: () => ({ x: X(win.x) - 4, y: Y(win.y) - 4, w: win.w + 8, h: win.h + 8 }),
      lessons: () => [leccionDe('window')] }));
  }
  if (geo.chimney) registrarPalabras(add({ kind: 'chimney', x: X(geo.chimney.x), y: base - 4, noDraw: true, box: () => ({ x: X(geo.chimney.x) - 6, y: Y(geo.chimney.y) - 4, w: 56, h: geo.chimney.h }),
    lessons: () => [leccionDe('chimney'), L.free('noun', 'smoke', 'humo', 'Smoke comes out of the chimney.', 'El humo sale de la chimenea.', '💨')] }));
  if (geo.garage) registrarPalabras(add({ kind: 'garageDoor', x: X(geo.garage.x + geo.garage.w / 2), y: base - 2, noDraw: true, box: () => ({ x: X(geo.garage.x), y: Y(geo.garage.y), w: geo.garage.w, h: geo.garage.h }),
    lessons: () => [leccionDe('garage')] }));
  if (!shop) {
    // Buzón y flores a un costado de la casa, para no tapar la fachada
    const lado = R.chance(0.5) ? 1 : -1;
    const mx = lado > 0 ? b.x1 + 46 : b.x0 - 46, my = base + SW_A[0] - 4;
    if (w.occ.libre(caja(mx - 24, my - 80, mx + 24, my), 4, ['calle'])) {
      w.occ.add(caja(mx - 24, my - 80, mx + 24, my), 'buzon');
      registrarPalabras(add({ kind: 'mailbox', x: mx, y: my, box: () => ({ x: mx - 22, y: my - 76, w: 44, h: 76 }), draw: g => Draw.mailbox(g, mx, my, num),
        lessons: () => [leccionDe('mailbox'), conPalabra(L.free('noun', 'number', 'número', `The number on the mailbox is ${num}.`, `El número del buzón es ${num}.`, '🔢'), 'number'),
          conPalabra(L.prep('The mailbox', 'El buzón', 'nextTo', b.label || { en: 'house', esFull: 'la casa' }), 'next to')] }));
    }
    const fx = lado > 0 ? b.x0 - 70 : b.x1 + 70, fy = base + SW_A[0] - 8;
    if (R.chance(0.7) && w.occ.libre(caja(fx - 52, fy - 34, fx + 52, fy), 4)) {
      w.occ.add(caja(fx - 52, fy - 34, fx + 52, fy), 'flores');
      const colors = [R.pick(['#e63946', '#f28482', '#ffb703']), R.pick(['#ffffff', '#b388eb'])];
      b.flowerBed = { x: fx, y: fy };
      registrarPalabras(add({ kind: 'flowers', x: fx, y: fy, box: () => ({ x: fx - 50, y: fy - 30, w: 100, h: 34 }), draw: g => Draw.flowers(g, fx, fy, 96, colors),
        lessons: () => [leccionDe('flower'), Object.assign(L.color(N.flowers, colorName(colors[0])), PAL[colorName(colors[0])] ? { wordId: palabraId(colorName(colors[0])) } : {})] }));
    }
    // Perro con su casita o gato en el techo (algunas casas)
    if (R.chance(0.45)) {
      const pos = buscarHueco(w, R, lotArea(lot), 190, 96, () => ({ x: R.range(lot.left + 120, lot.right - 120), y: R.range(base - 820, base - 20) }), 30);
      if (pos) {
        const dx = pos.x - 40, dy = pos.y, color = R.pick(['#c0392b', '#2e86de', '#8e6e53']), dogC = R.pick(['#8d6e63', '#f5deb3', '#3b2a20', '#e0e0e0']);
        w.occ.add(caja(dx - 50, dy - 92, dx + 110, dy + 4), 'perro');
        add({ kind: 'doghouse', x: dx, y: dy, box: () => ({ x: dx - 46, y: dy - 88, w: 92, h: 90 }), draw: g => Draw.doghouse(g, dx, dy, color), lessons: () => [L.free('noun', 'doghouse', 'caseta', 'This is a doghouse.', 'Esta es una caseta de perro.', '🐶')] });
        w.animals.push(registrarPalabras(add({ kind: 'dog', x: dx + 62, y: dy + 2, box: () => ({ x: dx + 32, y: dy - 50, w: 76, h: 54 }),
          draw: (g, t) => { Animales.dog(g, dx + 62, dy + 2, dogC, t, 'sleep', -1); Draw.zzz(g, dx + 72, dy - 30, t); },
          lessons: () => [leccionDe('dog'), conPalabra(L.prep('The dog', 'El perro', 'nextTo', { en: 'doghouse', esFull: 'la caseta' }), 'next to'), conPalabra(L.free('verb', 'sleeping', 'dormir', 'The dog is sleeping.', 'El perro está durmiendo.', '💤'), 'sleep')] })));
      }
    } else if (geo.roofType !== 'plano' && R.chance(0.5)) {
      const cx = X(geo.cx) + R.sym(30), cy = Y(geo.roofPeak) + 4, catC = R.pick(['#f39c12', '#2c2c2c', '#9e9e9e']);
      w.animals.push(registrarPalabras(add({ kind: 'cat', x: cx, y: base + 0.5, sortY: base + 0.5, box: () => ({ x: cx - 30, y: cy - 34, w: 60, h: 38 }),
        draw: (g, t) => { Animales.cat(g, cx, cy, catC, t); Draw.zzz(g, cx + 18, cy - 24, t); },
        lessons: () => [leccionDe('cat'), conPalabra(L.prep('The cat', 'El gato', 'on', N.roof), 'on'), conPalabra(L.free('verb', 'sleeping', 'dormir', 'The cat is sleeping on the roof.', 'El gato está durmiendo sobre el techo.', '💤'), 'sleep')] })));
    }
  }
  if (shop && (type === 'cafe' || type === 'restaurant')) b.patio = true;
}

function drawBuilding(g, b) {
  const geo = b.geo;
  g.save();
  g.translate(b.ox, b.oy);
  g.lineCap = 'round'; g.lineJoin = 'round';
  b.parts.forEach(q => q(g));
  b.faces.forEach(({ win, parts }) => {
    g.save(); g.beginPath();
    if (win.arch) { g.moveTo(win.x, win.y + win.h); g.lineTo(win.x, win.y + win.w / 2); g.arc(win.x + win.w / 2, win.y + win.w / 2, win.w / 2, Math.PI, 0); g.lineTo(win.x + win.w, win.y + win.h); }
    else g.rect(win.x, win.y, win.w, win.h);
    g.clip();
    const s = win.w * 0.85 / 460;
    g.translate(win.x + win.w / 2, win.y + win.h * 0.62); g.scale(s, s); g.translate(-400, -430);
    parts.forEach(q => q(g));
    g.restore();
  });
  if (b.kind === 'church') {
    const x = geo.cx, y = geo.roofPeak;
    g.fillStyle = '#efe6d6'; g.fillRect(x - 26, y - 90, 52, 100); g.fillStyle = '#8d6e63';
    g.beginPath(); g.moveTo(x - 34, y - 88); g.lineTo(x, y - 128); g.lineTo(x + 34, y - 88); g.closePath(); g.fill();
    g.fillStyle = '#ffd54f'; g.fillRect(x - 3, y - 150, 6, 26); g.fillRect(x - 10, y - 142, 20, 6);
    g.fillStyle = '#5d4037'; g.beginPath(); g.arc(x, y - 52, 12, Math.PI, 0); g.lineTo(x + 12, y - 30); g.lineTo(x - 12, y - 30); g.fill();
  }
  if (b.shop) {
    Draw.sign(g, geo.cx, geo.wallTop - 44, b.shop.sign, Gen.shade(b.shop.door, -0.1));
    if (b.kind === 'hospital' || b.kind === 'pharmacy') { g.fillStyle = '#d7263d'; g.fillRect(geo.cx - 12, geo.wallTop + 20, 24, 70); g.fillRect(geo.cx - 35, geo.wallTop + 43, 70, 24); }
  }
  if (b.ring > 0) {
    const d = geo.door;
    g.save(); g.beginPath(); g.rect(d.x, d.y, d.w, d.h); g.clip();
    g.fillStyle = '#2b2118'; g.fillRect(d.x, d.y, d.w, d.h);
    g.fillStyle = Gen.rgba('#ffd98a', 0.35); g.fillRect(d.x, d.y, d.w, d.h);
    if (b.resident) { g.translate(d.x + d.w / 2, d.y + d.h); const s = d.h * 0.95 / HUMAN_H; g.scale(s, s); drawHuman(g, b.resident, 0, 0, { pose: 'saludo' }); }
    g.restore();
  }
  g.restore();
}

/* ============================================================================
   LOTES ESPECIALES
============================================================================ */
function suelo(w, lot, color, extra = {}) {
  const A = lotArea(lot);
  const s = { ...A, lot, base: lot.base, color, ...extra };
  w.grounds.push(s);
  return A;
}
function letreroLote(w, add, lot, texto, color, palabras) {
  const A = lotArea(lot), x = lot.cx, y = A.y1 - 4;
  w.occ.add(caja(x - 95, y - 104, x + 95, y + 2), 'letrero');
  return registrarPalabras(add({ kind: 'lotSign', x, y, box: () => ({ x: x - 90, y: y - 100, w: 180, h: 100 }),
    draw: g => { g.fillStyle = '#6b4a2b'; g.fillRect(x - 4, y - 60, 8, 60); Draw.sign(g, x, y - 64, texto, color); },
    lessons: () => palabras.map(p => typeof p === 'string' ? leccionDe(p) : p) }));
}
// Reserva una zona y devuelve la entidad sin dibujo que enseña su palabra
function zonaTocable(w, add, kind, rect, lecciones, extra = {}) {
  return registrarPalabras(add({ kind, x: (rect.x0 + rect.x1) / 2, y: rect.y1, noDraw: true, box: () => ({ x: rect.x0, y: rect.y0, w: rect.x1 - rect.x0, h: rect.y1 - rect.y0 }), lessons: lecciones, ...extra }));
}

const LOTE_ESPECIAL = {
  parkPond(w, R, add, lot) {
    const A = suelo(w, lot, '#8cc271', { camino: true }), base = lot.base;
    (w.places.park = w.places.park || []).push({ doorX: lot.cx, frontY: base + 40, x0: A.x0, x1: A.x1, base, lot });
    letreroLote(w, add, lot, 'PARK', '#2e7d4f', ['sign', 'park']);
    w.occ.add(caja(lot.cx - 34, A.y0, lot.cx + 34, A.y1), 'camino');
    const pond = { x: lot.cx + 190, y: base - 470, rx: 230, ry: 95 };
    w.ponds.push(pond);
    w.solids.push({ ellipse: pond });
    w.occ.add(caja(pond.x - pond.rx - 22, pond.y - pond.ry - 18, pond.x + pond.rx + 22, pond.y + pond.ry + 16), 'estanque');
    zonaTocable(w, add, 'pond', caja(pond.x - pond.rx, pond.y - pond.ry, pond.x + pond.rx, pond.y + pond.ry), () => [leccionDe('pond'),
      conPalabra(L.prep('The ducks', 'Los patos', 'in', N.pond, 'are', 'están'), 'in')], { y: pond.y - pond.ry });
    for (let k = 0; k < 3; k++) {
      const madre = k === 0;
      const duck = add({ kind: 'duck', x: pond.x, y: pond.y, a: R.range(0, 6), sp: R.range(0.15, 0.3), rr: R.range(0.3, 0.75),
        box: () => ({ x: duck.x - 22, y: duck.y - 32, w: 54, h: 36 }),
        draw: (g, t) => {
          const d = Math.cos(duck.a) < 0 ? 1 : -1;
          Animales.duck(g, duck.x, duck.y, t, d);
          if (madre) for (let c = 1; c <= 2; c++) { g.save(); g.translate(duck.x + d * -26 * c, duck.y + 2); g.scale(0.55, 0.55); Animales.duck(g, 0, 0, t + c, d); g.restore(); }
        },
        lessons: () => madre ? [leccionDe('duck'), conPalabra(L.free('verb', 'follow', 'seguir', 'The ducklings follow their mother.', 'Los patitos siguen a su mamá.', '🦆'), 'follow')]
          : [leccionDe('duck'), conPalabra(L.free('verb', 'swimming', 'nadar', 'The duck is swimming.', 'El pato está nadando.', '🦆', 'to swim · swam · swimming'), 'swim')] });
      duck.update = dt => { duck.a += dt * duck.sp; duck.x = pond.x + Math.cos(duck.a) * pond.rx * duck.rr; duck.y = pond.y + Math.sin(duck.a) * pond.ry * duck.rr + 10; };
      w.animals.push(registrarPalabras(duck));
    }
    // Pesca y patos junto al agua
    const nombre = s => (s === 'f' ? FEM : MASC)[R.int(0, 19)];
    [['fish', pond.x - 80, pond.y + pond.ry + 34, [pond.x - 20, pond.y + 20]], ['feed', pond.x + 130, pond.y + pond.ry + 34]].forEach(([act, x, y, target]) => {
      w.occ.add(caja(x - 34, y - 130, x + 80, y + 4), 'persona');
      crearPersona(w, R, { rol: act === 'fish' ? 'man' : 'child', act, x: 0, y: 0, dir: 1, target }, x, y, y, nombre, 'parkPond');
    });
    const fx = lot.cx - 260, fy = base - 130;
    w.occ.add(caja(fx - 88, fy - 144, fx + 88, fy + 6), 'fuente');
    w.solids.push({ x0: fx - 80, x1: fx + 80, y0: fy - 34, y1: fy + 4 });
    registrarPalabras(add({ kind: 'fountain', x: fx, y: fy, box: () => ({ x: fx - 84, y: fy - 140, w: 168, h: 144 }), draw: (g, t) => Draw.fountain(g, fx, fy, t * 2),
      lessons: () => [leccionDe('fountain'), conPalabra(L.prep('The fountain', 'La fuente', 'in', N.park), 'in')] }));
    // Bancas con alguien sentado y alguien dormido
    [[lot.cx - 300, base - 380, 'sit'], [lot.cx - 90, base - 700, 'sleep']].forEach(([bx, by, act]) => {
      if (!w.occ.libre(caja(bx - 70, by - 130, bx + 70, by + 4), 6)) return;
      w.occ.add(caja(bx - 70, by - 130, bx + 70, by + 4), 'banca');
      w.benches.push({ x: bx, y: by });
      crearPersona(w, R, { rol: act === 'sit' ? 'woman' : 'man', act, x: 0, y: 0, dir: 1 }, bx, by + 1, by + 1, nombre, 'parkPond');
      registrarPalabras(add({ kind: 'benchSpot', x: bx, y: by, noDraw: true, box: () => ({ x: bx - 64, y: by - 40, w: 128, h: 42 }), lessons: () => [leccionDe('bench')] }));
    });
  },
  parkRiver(w, R, add, lot) {
    const A = suelo(w, lot, '#94c97a');
    (w.places.park = w.places.park || []).push({ doorX: lot.cx, frontY: lot.base + 40, x0: A.x0, x1: A.x1, base: lot.base, lot });
    letreroLote(w, add, lot, 'PARK', '#2e7d4f', ['sign', 'park']);
  },
  market(w, R, add, lot) {
    suelo(w, lot, '#d9c9a3');
    letreroLote(w, add, lot, 'MARKET', '#d35400', [conPalabra(L.theNoun(N.market, 'You can buy fruit and vegetables here.', 'Aquí puedes comprar frutas y verduras.'), 'market')]);
  },
  farm(w, R, add, lot) {
    const A = suelo(w, lot, '#b5c97a');
    const bx = lot.cx + 250, by = lot.base - 560;
    w.occ.add(caja(bx - 152, by - 284, bx + 152, by + 6), 'granero');
    w.solids.push({ x0: bx - 135, x1: bx + 135, y0: by - 60, y1: by + 4 });
    add({ kind: 'barn', x: bx, y: by, box: () => ({ x: bx - 150, y: by - 282, w: 300, h: 284 }), draw: g => Draw.barn(g, bx, by),
      lessons: () => [L.noun(N.barn, 'The animals sleep in the barn.', 'Los animales duermen en el granero.'), L.color(N.barn, 'red')] });
    const fy = A.y1 - 20;
    w.occ.add(caja(A.x0, fy - 96, A.x1, fy + 4), 'cerca');
    registrarPalabras(add({ kind: 'fence', x: lot.cx, y: fy, box: () => ({ x: A.x0, y: fy - 56, w: A.x1 - A.x0, h: 58 }),
      draw: g => { Draw.fence(g, A.x0, lot.cx - 90, fy); Draw.fence(g, lot.cx + 90, A.x1, fy); Draw.sign(g, lot.cx, fy - 70, 'FARM', '#8a6239'); },
      lessons: () => [conPalabra(L.theNoun(N.farm, 'Farmers grow food here.', 'Aquí los granjeros cultivan comida.'), 'farm'), L.noun(N.fence)] }));
    // Potrero: los animales caminan aquí y nada más se pone encima
    const P = { x0: A.x0 + 20, x1: lot.cx + 60, y0: lot.base - 470, y1: fy - 110 };
    w.pastures.push(P);
    w.occ.add(caja(P.x0 - 10, P.y0 - 120, P.x1 + 50, P.y1 + 10), 'potrero');
    const kinds = ['cow', 'cow', 'horse', 'pig', 'sheep', 'sheep', 'goat', 'chicken', 'chicken', 'chicken'];
    const sounds = { cow: ['moo', 'La vaca hace «mu».'], horse: ['neigh', 'El caballo relincha.'], pig: ['oink', 'El cerdo hace «oink».'], sheep: ['baa', 'La oveja hace «bee».'], chicken: ['cluck', 'La gallina cacarea.'], goat: ['meh', 'La cabra bala.'] };
    kinds.forEach(k => {
      const an = add({
        kind: k, x: R.range(P.x0 + 60, P.x1 - 60), y: R.range(P.y0 + 30, P.y1), dir: R.chance(0.5) ? 1 : -1, tx: 0, ty: 0, moving: false, wait: R.range(0, 4),
        box: () => ({ x: an.x - 45, y: an.y - (k === 'horse' ? 110 : k === 'chicken' ? 36 : 70), w: 90, h: k === 'horse' ? 112 : k === 'chicken' ? 38 : 72 }),
        draw: (g, t) => k === 'chicken' ? Animales.chicken(g, an.x, an.y, t + an.x) : k === 'goat' ? Animales.especie(g, an.x, an.y, t, 'goat', an.dir, an.moving) : Animales.quad(g, an.x, an.y, t, an.dir, k, an.moving),
        lessons: () => [leccionDe(k), L.free('verb', 'says', 'decir', `The ${k} says "${sounds[k][0]}!"`, sounds[k][1], PAL[k].icon),
          conPalabra(L.free('verb', an.moving ? 'eats' : 'eating', 'comer', an.moving ? `The ${k} eats grass every day.` : `The ${k} is eating grass.`,
            an.moving ? `El animal come pasto todos los días.` : `El animal está comiendo pasto.`, PAL[k].icon), 'eat'),
          ...(an.moving ? [conPalabra(L.free('verb', 'walking', 'caminar', `The ${k} is walking.`, `El animal está caminando.`, PAL[k].icon), 'walk')] : [])]
      });
      an.update = dt => {
        if (an.wait > 0) { an.wait -= dt; an.moving = false; an.sortY = an.y; return; }
        if (!an.moving) { an.tx = P.x0 + 50 + Math.random() * (P.x1 - P.x0 - 100); an.ty = P.y0 + 20 + Math.random() * (P.y1 - P.y0 - 20); an.moving = true; }
        const dx = an.tx - an.x, dy = an.ty - an.y, d = Math.hypot(dx, dy);
        if (d < 6) { an.moving = false; an.wait = 2 + Math.random() * 5; return; }
        const sp = k === 'chicken' ? 40 : 28;
        an.x += dx / d * sp * dt; an.y += dy / d * sp * dt; an.dir = dx >= 0 ? 1 : -1; an.sortY = an.y;
      };
      w.animals.push(registrarPalabras(an));
    });
  },
  plaza(w, R, add, lot) {
    const A = suelo(w, lot, '#d8d0c0');
    (w.places.square = w.places.square || []).push({ doorX: lot.cx, frontY: lot.base + 40, x0: A.x0, x1: A.x1, base: lot.base, lot });
    letreroLote(w, add, lot, 'TOWN SQUARE', '#7f5539', [conPalabra(L.theNoun(N.square, 'People meet in the square.', 'La gente se reúne en la plaza.'), 'square')]);
    const tx = lot.cx, ty = lot.base - 430;
    w.occ.add(caja(tx - 76, ty - 476, tx + 76, ty + 6), 'torre');
    w.solids.push({ x0: tx - 60, x1: tx + 60, y0: ty - 40, y1: ty + 4 });
    const tower = registrarPalabras(add({ kind: 'clockTower', x: tx, y: ty, box: () => ({ x: tx - 72, y: ty - 472, w: 144, h: 474 }),
      draw: g => Draw.clockTower(g, tx, ty, hourNow(), Math.floor(clockMin % 60)),
      lessons: () => { const tw = I.timeWords(hourNow(), Math.floor(clockMin % 60)); return [conPalabra(L.noun(N.clockTower), 'tower'), conPalabra(L.free('noun', 'time', 'la hora', `What time is it? ${tw.en}`, `¿Qué hora es? ${tw.es}`, '🕰️'), 'time'), leccionDe('clock')]; } }));
    w.places.clockTower = [tower];
    [[lot.cx - 340, lot.base - 170], [lot.cx + 340, lot.base - 170]].forEach(([fx, fy]) => {
      w.occ.add(caja(fx - 88, fy - 144, fx + 88, fy + 6), 'fuente');
      w.solids.push({ x0: fx - 80, x1: fx + 80, y0: fy - 34, y1: fy + 4 });
      add({ kind: 'fountain', x: fx, y: fy, box: () => ({ x: fx - 84, y: fy - 140, w: 168, h: 144 }), draw: (g, t) => Draw.fountain(g, fx, fy, t * 2),
        lessons: () => [conPalabra(L.prep('The fountain', 'La fuente', 'in', N.square), 'fountain')] });
    });
  },
  field(w, R, add, lot) {
    const A = suelo(w, lot, '#4f9a45', { cancha: true });
    letreroLote(w, add, lot, 'SOCCER FIELD', '#1e6b35', [conPalabra(L.theNoun(N.field, 'Teams play soccer here.', 'Aquí los equipos juegan fútbol.'), 'field')]);
    w.occ.add(caja(A.x0, A.y0 + 120, A.x1, A.y1 - 96), 'cancha');
    w.campos.push(A);
    const gy = lot.base - 400;
    registrarPalabras(add({ kind: 'goal', x: A.x0 + 60, y: gy, box: () => ({ x: A.x0 + 40, y: gy - 120, w: 80, h: 130 }), draw: g => Draw.goal(g, A.x0 + 60, gy, 1),
      lessons: () => [leccionDe('goal'), leccionDe('soccer')] }));
    registrarPalabras(add({ kind: 'goal', x: A.x1 - 60, y: gy, box: () => ({ x: A.x1 - 120, y: gy - 120, w: 80, h: 130 }), draw: g => Draw.goal(g, A.x1 - 60, gy, -1),
      lessons: () => [conPalabra(L.free('noun', 'goal', 'gol', 'Goal! The team is happy.', '¡Gol! El equipo está feliz.', '🥅'), 'goal')] }));
    const nombre = () => MASC[R.int(0, 19)];
    [[lot.cx - 250, lot.base - 300], [lot.cx + 200, lot.base - 450], [lot.cx - 50, lot.base - 600], [lot.cx + 350, lot.base - 200]].forEach(([x, y], i) => {
      crearPersona(w, R, { rol: i % 2 ? 'player' : 'boy', act: 'soccer', x: 0, y: 0, dir: 1, roam: { x0: A.x0 + 100, x1: A.x1 - 100, y0: A.y0 + 200, y1: A.y1 - 130 } }, x, y, y, nombre, 'field');
    });
  },
  zoo(w, R, add, lot) { suelo(w, lot, '#cfe3b0'); },
  construction(w, R, add, lot) { suelo(w, lot, '#c8b28a'); letreroLote(w, add, lot, 'CONSTRUCTION', '#ef6c00', [L.free('noun', 'construction', 'construcción', 'They are building a new school here.', 'Aquí están construyendo una escuela nueva.', '🏗️')]); },
  parking(w, R, add, lot) { suelo(w, lot, '#9ea3a8', { lineas: true }); },
  garden(w, R, add, lot) { suelo(w, lot, '#9bc47a'); },
  campground(w, R, add, lot) { suelo(w, lot, '#86b870'); letreroLote(w, add, lot, 'CAMPGROUND', '#2e7d32', [L.free('noun', 'campground', 'campamento', 'People sleep in tents here.', 'Aquí la gente duerme en carpas.', '⛺')]); }
};

/* ============================================================================
   COLOCAR UNA ESCENA
============================================================================ */
function componentesEscena(esc) {
  const comps = [];
  (esc.bases || []).forEach(b => comps.push({ tipo: 'base', b, x0: b.x - b.w / 2, y0: b.y - b.h, x1: b.x + b.w / 2, y1: b.y, fondo: b.fondo, suelo: b.suelo }));
  (esc.items || []).forEach(it => {
    const o = Obj.O[it.obj];
    if (!o) throw new Error(`Objeto desconocido: ${it.obj} (escena ${esc.id})`);
    comps.push({ tipo: 'item', it, o, x0: it.x - o.w * it.s / 2, y0: it.y - o.h * it.s, x1: it.x + o.w * it.s / 2, y1: it.y, fondo: o.fondo, suelo: o.suelo });
  });
  (esc.gente || []).forEach(p => {
    const edad = (MundoDatos.ROLES[p.rol] || [])[3];
    const alto = edad === 'niño' ? 72 : edad === 'joven' ? 98 : 116;
    const act = ACTIONS[p.act];
    let x0 = p.x - 30, x1 = p.x + 30, y0 = p.y - alto, y1 = p.y + 2;
    const pc = act && PROP_CAJA[act.prop];
    if (pc) { x0 = Math.min(x0, p.x + pc[0]); x1 = Math.max(x1, p.x + pc[0] + pc[2]); y0 = Math.min(y0, p.y + pc[1]); }
    if (p.act === 'kite') { x1 = p.x + 130; y0 = p.y - 370; }
    if (p.act === 'fish') { x1 = p.x + 80; }
    if (p.tumbado) { x0 = p.x - 64; x1 = p.x + 64; y0 = p.y - 44; }
    comps.push({ tipo: 'persona', p, x0, y0, x1, y1, sobre: p.sobre });
  });
  (esc.grupos || []).forEach(gp => {
    const G = MundoDatos.GRUPOS[gp.grupo];
    const ancho = G.n * 44 + 20, alto = G.edad === 'niño' ? 74 : 118;
    comps.push({ tipo: 'grupo', gp, x0: gp.x - ancho / 2, y0: gp.y - alto - (gp.act === 'enjoy' ? 20 : 0), x1: gp.x + ancho / 2, y1: gp.y + 2, sobre: gp.sobre });
  });
  return comps;
}
function unionCajas(comps) {
  const r = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
  comps.forEach(c => { r.x0 = Math.min(r.x0, c.x0); r.y0 = Math.min(r.y0, c.y0); r.x1 = Math.max(r.x1, c.x1); r.y1 = Math.max(r.y1, c.y1); });
  return r;
}
// Busca un lugar libre dentro de `area` para una caja relativa `bb` (x0..x1, y0..y1 respecto al ancla)
function buscarLugar(w, R, area, bb, preferido, margen = 16) {
  const cand = [];
  const ax0 = area.x0 - bb.x0, ax1 = area.x1 - bb.x1, ay0 = area.y0 - bb.y0, ay1 = area.y1 - bb.y1;
  if (ax1 < ax0 || ay1 < ay0) return null;
  const paso = 22;
  for (let ay = ay0; ay <= ay1; ay += paso) for (let ax = ax0; ax <= ax1; ax += paso) {
    const d = Math.hypot(ax - preferido.x, (ay - preferido.y) * 1.1) + R() * 60;
    cand.push([d, ax, ay]);
  }
  cand.sort((a, b) => a[0] - b[0]);
  for (const [, ax, ay] of cand) {
    const r = caja(ax + bb.x0, ay + bb.y0, ax + bb.x1, ay + bb.y1);
    if (w.occ.libre(r, margen)) return { x: Math.round(ax), y: Math.round(ay), r };
  }
  return null;
}
function buscarHueco(w, R, area, ancho, alto, gen, intentos = 40) {
  for (let i = 0; i < intentos; i++) {
    const p = gen();
    const r = caja(p.x - ancho / 2, p.y - alto, p.x + ancho / 2, p.y);
    if (r.x0 < area.x0 || r.x1 > area.x1 || r.y0 < area.y0 || r.y1 > area.y1) continue;
    if (w.occ.libre(r, 12)) return p;
  }
  return null;
}
// Punto preferido para la escena número k de un lote (se reparten por el terreno)
function puntoPreferido(lot, k, bb) {
  const A = lot.area || lotArea(lot);
  const b = W_EDIFICIO(lot);
  if (b) {
    // Patio trasero y costados de la casa o el edificio
    const huecos = [[lot.cx - 250, b.roofY - 30], [lot.cx + 250, b.roofY - 30], [b.x0 - 150, lot.base - 60], [b.x1 + 150, lot.base - 60], [lot.cx, A.y0 - bb.y0]];
    const [x, y] = huecos[k % huecos.length];
    return { x, y };
  }
  const cols = [0.2, 0.8, 0.5, 0.3, 0.7], filas = [0.35, 0.75, 0.55, 0.9, 0.2];
  return { x: A.x0 + (A.x1 - A.x0) * cols[k % 5], y: A.y0 + (A.y1 - A.y0) * filas[(k * 2) % 5] - bb.y0 * 0.4 };
}
let W_BUILD = null;
const W_EDIFICIO = lot => W_BUILD ? W_BUILD.buildings.find(b => b.lot === lot) : null;

function colocarEscena(w, R, esc, nombre, loteFijo) {
  W_BUILD = w;
  const comps = componentesEscena(esc);
  const bb = unionCajas(comps);
  const lotes = loteFijo ? [loteFijo] : [];
  if (!loteFijo) {
    esc.lotes.forEach(t => {
      const deTipo = w.lots.filter(l => l.type === t).sort((a, b) => a.escenas - b.escenas || R() - 0.5);
      lotes.push(...deTipo);
    });
    lotes.push(...w.lots.filter(l => !lotes.includes(l) && l.type !== 'field').sort((a, b) => a.escenas - b.escenas || R() - 0.5));
  }
  for (const lot of lotes) {
    const area = lot.area || lotArea(lot);
    const pos = buscarLugar(w, R, area, bb, puntoPreferido(lot, lot.escenas, bb));
    if (!pos) continue;
    lot.escenas++;
    w.occ.add(pos.r, 'escena:' + esc.id);
    crearEscena(w, R, esc, comps, pos.x, pos.y, lot, nombre);
    return true;
  }
  w.avisos.push('No cupo la escena ' + esc.id);
  return false;
}

// Palabras de las partes de un objeto: la clave es la palabra en inglés
function entidadesPartes(w, add, o, x, y, s, sortY, escId) {
  if (!o.partes) return;
  Object.entries(o.partes).forEach(([en, [px, py, pw, ph]]) => {
    if (!PAL[en]) return;
    registrarPalabras(add({ kind: 'parte', x: x + (px + pw / 2) * s, y, sortY, noDraw: true, escena: escId,
      box: () => ({ x: x + px * s, y: y + py * s, w: pw * s, h: ph * s }), lessons: () => [leccionDe(en)] }));
  });
}

function crearEscena(w, R, esc, comps, ax, ay, lot, nombre) {
  const add = w.add;
  let k = 0;
  const sy = () => ay + (k++) * 0.0005;
  comps.forEach(c => {
    if (c.tipo === 'base') {
      const b = c.b, x = ax + b.x, y = ay + b.y, s = sy();
      const o = b.obj ? Obj.O[b.obj] : null;
      const palabras = b.palabras || [];
      const e = add({ kind: 'base', x, y, sortY: s, escena: esc.id,
        box: () => b.caja ? { x: x + b.caja[0], y: y + b.caja[1], w: b.caja[2], h: b.caja[3] } : { x: x - b.w / 2, y: y - b.h, w: b.w, h: b.h },
        draw: (g, t) => { if (o) Obj.draw(g, b.obj, x, y, t); else if (b.dibujo) { g.save(); g.translate(x, y); b.dibujo(g, t); g.restore(); } },
        lessons: () => palabras.map(p => leccionDe(p)) });
      if (!palabras.length) e.lessons = null;
      else registrarPalabras(e);
      if (o) entidadesPartes(w, add, o, x, y, 1, s, esc.id);
    } else if (c.tipo === 'item') {
      const it = c.it, x = ax + it.x, y = ay + it.y, s = sy(), o = c.o;
      const pals = it.palabra == null ? [] : Array.isArray(it.palabra) ? it.palabra : [it.palabra];
      const estado = it.estado || {};
      const e = add({ kind: 'objeto', obj: it.obj, x, y, sortY: s, escena: esc.id,
        box: () => ({ x: x - o.w * it.s / 2, y: y - o.h * it.s, w: o.w * it.s, h: o.h * it.s }),
        draw: (g, t) => Obj.draw(g, it.obj, x, y, t, estadoObjeto(estado), it.s),
        lessons: pals.length ? () => pals.map(p => p === 'fall' ? conPalabra(L.free('verb', 'fall', 'caer', 'The leaves fall from the trees in autumn.', 'Las hojas caen de los árboles en otoño.', '🍂'), 'fall')
          : p === 'cost' ? conPalabra(L.free('verb', 'cost', 'costar', 'It costs five dollars.', 'Cuesta cinco dólares.', '💲'), 'cost') : leccionDe(p)) : null });
      if (e.lessons) registrarPalabras(e);
      entidadesPartes(w, add, o, x, y, it.s, s, esc.id);
      if (o.solido !== false && (o.h * it.s) > 40 && !o.suelo) w.solids.push({ x0: x - o.w * it.s / 2 + 6, x1: x + o.w * it.s / 2 - 6, y0: y - 18, y1: y + 3 });
    } else if (c.tipo === 'persona') {
      crearPersona(w, R, c.p, ax + c.p.x, ay + c.p.y, sy(), nombre, lot.type, esc.id);
    } else if (c.tipo === 'grupo') {
      crearGrupo(w, R, c.gp, ax + c.gp.x, ay + c.gp.y, sy(), esc.id);
    }
  });
}
// Estado dinámico de algunos objetos (reloj, clima, noche)
function estadoObjeto(estado) {
  return Object.assign({ noche: isDark(), hora: hourNow(), min: Math.floor(clockMin % 60), clima: weather.kind }, estado);
}

/* ============================================================================
   PERSONAS Y GRUPOS
============================================================================ */
function crearPersona(w, R, spec, x, y, sortY, nombre, lugar, escId) {
  const rolInfo = MundoDatos.ROLES[spec.rol] || ['n'];
  let sexo = rolInfo[0];
  if (sexo === 'n') sexo = R.chance(0.5) ? 'f' : 'm';
  const edad = rolInfo[3] || 'adulto';
  const name = nombre(sexo);
  const act = ACTIONS[spec.act];
  const poseBase = act.pose === 'caminando' ? 'de pie' : (act.pose || 'de pie');
  const R2 = Gen.makeRand(`${w.seed}:persona:${name}:${spec.act}:${x | 0}`);
  const ap = aspecto(R2, sexo, edad, spec.rol);
  const h = makeHuman(`${w.seed}:persona:${name}:${spec.act}:${x | 0}`, [...new Set([poseBase, 'saludo', 'de pie'])], ap);
  let speed = 0, advKey = R.pick(act.advs);
  if (spec.act === 'walk') { speed = R.chance(0.5) ? R.range(28, 42) : R.range(75, 95); advKey = speed < 50 ? 'slowly' : 'quickly'; }
  if (spec.act === 'run') speed = R.range(150, 190);
  if (spec.act === 'ride') speed = R.range(130, 170);
  if (spec.act === 'walkDog') speed = R.range(40, 55);
  if (spec.act === 'carry') { speed = R.range(35, 50); advKey = 'carefully'; }
  const c = { dogC: R.pick(['#8d6e63', '#f5deb3', '#3b2a20', '#e0e0e0']), bikeC: R.pick(['#e74c3c', '#2e86de', '#27ae60', '#f1c40f']),
    kiteC: R.pick(['#e74c3c', '#f1c40f', '#8e44ad', '#2e86de']), bookC: R.pick(['#c0392b', '#2e86de', '#27ae60']),
    paintC: [R.pick(['#e74c3c', '#f1c40f']), R.pick(['#2e86de', '#27ae60']), R.pick(['#8e44ad', '#e67e22'])] };
  const ropa = MundoDatos.ROPA[spec.rol];
  const person = w.add({
    kind: 'person', name, sexo, edad, rol: spec.rol || null, estado: spec.estado || null, act, actKey: spec.act, advKey, h, x, y, sortY, dir: spec.dir || 1, speed,
    move: !!spec.move, roam: spec.roam, target: spec.target, pause: 0, talkT: 0, geo: h.geo, tense: 0, talked: false, lugar, escena: escId,
    tumbado: !!spec.tumbado, enAgua: !!spec.enAgua, acc: ropa && ropa.acc, c,
    box: () => {
      if (spec.act === 'sleep' || person.tumbado) return { x: person.x - 60, y: person.y - 60, w: 120, h: 60 };
      if (person.enAgua) return { x: person.x - 34, y: person.y - 70, w: 68, h: 70 };
      const alto = h.alto * 1.14 + (spec.act === 'ride' ? 26 : 0);
      return { x: person.x - 30, y: person.y - alto, w: 60, h: alto };
    },
    draw: (g, t) => drawPerson(g, person, t),
    lessons: () => personLessons(person)
  });
  w.people.push(registrarPalabras(person));
  return person;
}

function crearGrupo(w, R, gp, x, y, sortY, escId) {
  const G = MundoDatos.GRUPOS[gp.grupo];
  const act = ACTIONS[gp.act];
  const miembros = [];
  for (let i = 0; i < G.n; i++) {
    const sexo = G.parejaMF ? (i % 2 ? 'm' : 'f') : (R.chance(0.5) ? 'f' : 'm');
    const edad = G.edad === 'adulto' ? 'adulto' : G.edad;
    const seed = `${w.seed}:grupo:${gp.grupo}:${i}:${x | 0}`;
    const ap = aspecto(Gen.makeRand(seed), sexo, edad, null, { ropa: G.ropa });
    const pose = act.pose === 'caminando' ? 'de pie' : (act.pose || 'de pie');
    miembros.push({ h: makeHuman(seed, [pose, 'de pie'], ap), dx: (i - (G.n - 1) / 2) * 44, fase: R.range(0, 6), acc: G.ropa && G.ropa.acc });
  }
  const grupo = w.add({
    kind: 'group', grupo: gp.grupo, act, actKey: gp.act, x, y, sortY, miembros, escena: escId, talkT: 0, pause: 0,
    box: () => ({ x: x - G.n * 22 - 8, y: y - (G.edad === 'niño' ? 74 : 116), w: G.n * 44 + 16, h: G.edad === 'niño' ? 76 : 118 }),
    draw: (g, t) => drawGrupo(g, grupo, t),
    lessons: () => lessonsGrupo(grupo)
  });
  registrarPalabras(grupo);
  return grupo;
}

/* ---------- Árboles ---------- */
function makeTreeSprite(R, len, leafColors) {
  const depth = 8;
  const tr = Casa.fractalTree(R, 0, 0, len, depth);
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const ext = (x, y, r) => { minX = Math.min(minX, x - r); maxX = Math.max(maxX, x + r); minY = Math.min(minY, y - r); maxY = Math.max(maxY, y + r); };
  tr.levels.forEach(seg => { for (let j = 0; j < seg.length; j += 2) ext(seg[j], seg[j + 1], 10); });
  for (let j = 0; j < tr.leaves.length; j += 4) ext(tr.leaves[j], tr.leaves[j + 1], tr.leaves[j + 2]);
  const res = 1.2;
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil((maxX - minX) * res));
  c.height = Math.max(1, Math.ceil((maxY - minY) * res));
  const g = c.getContext('2d');
  g.scale(res, res);
  g.translate(-minX, -minY);
  g.lineCap = 'round';
  tr.levels.forEach((seg, i) => {
    g.strokeStyle = Gen.mix('#4a3222', '#6b5a3a', i / depth);
    g.lineWidth = Math.max(1, 16 * Math.pow(0.68, i));
    g.beginPath();
    for (let j = 0; j < seg.length; j += 4) { g.moveTo(seg[j], seg[j + 1]); g.lineTo(seg[j + 2], seg[j + 3]); }
    g.stroke();
  });
  leafColors.forEach((col, k) => {
    g.fillStyle = col;
    g.beginPath();
    for (let j = 0; j < tr.leaves.length; j += 4) {
      if (tr.leaves[j + 3] !== k) continue;
      g.moveTo(tr.leaves[j] + tr.leaves[j + 2], tr.leaves[j + 1]);
      g.arc(tr.leaves[j], tr.leaves[j + 1], tr.leaves[j + 2], 0, Math.PI * 2);
    }
    g.fill();
  });
  return { img: c, ox: minX, oy: minY, w: maxX - minX, h: maxY - minY };
}
const LEAF_COLORS = ['#3f8f3a', '#5aa648', '#2f7a33', '#6cb655'];
function plantarArbol(w, R, add, lot) {
  const len = R.range(105, 150);
  const sprite = makeTreeSprite(R, len, LEAF_COLORS);
  const bb = { x0: sprite.ox, y0: sprite.oy, x1: sprite.ox + sprite.w, y1: 6 };
  const A = lotArea(lot);
  const pos = buscarLugar(w, R, A, bb, { x: R.range(A.x0, A.x1), y: R.range(A.y0 - bb.y0, A.y1) }, 10);
  if (!pos) return false;
  w.occ.add(pos.r, 'arbol');
  const { x, y } = pos, tall = len > 130;
  const t = add({ kind: 'tree', x, y, sprite, tall, box: () => ({ x: x + sprite.ox, y: y + sprite.oy, w: sprite.w, h: sprite.h }),
    draw: g => g.drawImage(sprite.img, x + sprite.ox, y + sprite.oy, sprite.w, sprite.h),
    lessons: () => [leccionDe('tree'), conPalabra(L.adj(N.tree, tall ? 'tall' : 'short'), tall ? 'tall' : 'short'), conPalabra(L.color(N.leaves, 'green'), 'green')] });
  registrarPalabras(t);
  w.trees.push(t);
  w.solids.push({ x0: x - 14, x1: x + 14, y0: y - 14, y1: y + 4 });
  return true;
}
// Objeto «árbol» para la escena de trepar (sprite fijo por escena)
Obj.def('treeObj', 190, 250, (g, t, s) => {
  if (!Obj.O.treeObj.sprite) Obj.O.treeObj.sprite = makeTreeSprite(Gen.makeRand('arbol-trepar'), 150, LEAF_COLORS);
  const sp = Obj.O.treeObj.sprite;
  const k = Math.min(190 / sp.w, 250 / sp.h);
  g.drawImage(sp.img, sp.ox * k, sp.oy * k, sp.w * k, sp.h * k);
});

/* ---------- Carros y otros vehículos ---------- */
function makeCar(w, R, add, row, lane, x) {
  const seed = `${w.seed}:carro:${row}:${w.cars.length}`;
  const mk = night => { const p = { ...Carro.config.presets['Aleatorio'], variation: 0.5, randomColors: true, scene: true, driver: true, skyColor: night ? '#0d1b2a' : '#8ec5ea', spin: 0 }; return { p, parts: noBg(Carro.build(p, Gen.makeRand(seed))) }; };
  const day = mk(false), night = mk(true);
  const geo = day.parts.geo;
  const typeEn = { 'sedán': 'sedan', 'deportivo': 'sports car', 'SUV': 'SUV', 'pickup': 'pickup truck', 'furgoneta': 'van', 'compacto': 'small car' };
  const typeEs = { 'sedán': 'sedán', 'deportivo': 'carro deportivo', 'SUV': 'camioneta SUV', 'pickup': 'camioneta pickup', 'furgoneta': 'furgoneta', 'compacto': 'carro pequeño' };
  const car = add({
    kind: 'car', day, night, geo, row, lane, dir: lane === 0 ? 1 : -1, x, y: rowBase(row) + LANE[lane], speed: R.range(150, 250), cur: 0, len: geo.L * CAR_SCALE,
    colorKey: colorName(geo.body), type: geo.type,
    box: () => ({ x: car.x - car.len / 2, y: car.y - geo.L * CAR_SCALE * 0.42, w: car.len, h: geo.L * CAR_SCALE * 0.44 }),
    draw: g => {
      const v = isDark() ? car.night : car.day;
      g.save(); g.translate(car.x, car.y); g.scale(car.dir * CAR_SCALE, CAR_SCALE); g.translate(-600, -geo.groundY);
      g.lineCap = 'round'; g.lineJoin = 'round'; v.parts.forEach(q => q(g)); g.restore();
    },
    lessons: () => {
      const c = car.colorKey, tEn = typeEn[car.type] || 'car', tEs = typeEs[car.type] || 'carro', moving = car.cur > 25, rapido = car.speed > 190;
      return [conPalabra(L.free('noun', tEn, tEs, `This is ${I.a(tEn)}. It is a car.`, `Esto es ${/furgoneta|camioneta/.test(tEs) ? 'una' : 'un'} ${tEs}. Es un carro.`, '🚗'), 'car'),
        Object.assign(L.color(N.car, c), PAL[c] ? { wordId: palabraId(c) } : {}),
        Object.assign(L.free('adv', rapido ? 'fast' : 'slowly', rapido ? 'rápido' : 'despacio', `The ${c} car ${moving ? 'is moving' : 'usually goes'} ${rapido ? 'fast' : 'slowly'}.`, `El carro ${adjEs(COLORS[c] || COLORS.gray, N.car)} ${moving ? 'se mueve' : 'suele ir'} ${rapido ? 'rápido' : 'despacio'}.`, '⚡'), { wordId: palabraId(rapido ? 'fast' : 'slowly') }),
        ...(moving ? [] : [conPalabra(L.free('verb', 'stopped', 'detenerse', `The ${c} car has stopped.`, `El carro ${adjEs(COLORS[c] || COLORS.gray, N.car)} se ha detenido.`, '🛑'), 'stop')]),
        conPalabra(L.free('verb', 'driving', 'conducir', 'The driver is driving the car.', 'El conductor está conduciendo el carro.', '🚗'), 'drive')];
    }
  });
  car.cur = car.speed;
  w.cars.push(registrarPalabras(car));
}
const VEHICULOS = {
  bus: { obj: 'bus', vel: [110, 150], en: 'The school bus takes children to school.', es: 'El autobús escolar lleva a los niños a la escuela.' },
  taxi: { obj: 'taxi', vel: [170, 230], en: 'The taxi is yellow. Call a taxi!', es: 'El taxi es amarillo. ¡Llama un taxi!' },
  truck: { obj: 'truck', vel: [120, 160], en: 'The truck carries boxes to the stores.', es: 'El camión lleva cajas a las tiendas.' },
  motorcycle: { obj: 'motorcycle', vel: [200, 260], en: 'The motorcycle is fast and loud.', es: 'La moto es rápida y ruidosa.' }
};
function makeVehiculo(w, R, add, tipo, row, lane, x) {
  const V = VEHICULOS[tipo], o = Obj.O[V.obj];
  const v = add({
    kind: 'car', vehiculo: tipo, row, lane, dir: lane === 0 ? 1 : -1, x, y: rowBase(row) + LANE[lane], speed: R.range(V.vel[0], V.vel[1]), cur: 0, len: o.w,
    box: () => ({ x: v.x - o.w / 2, y: v.y - o.h, w: o.w, h: o.h }),
    draw: (g, t) => { g.save(); g.translate(v.x, v.y); g.scale(v.dir, 1); Obj.O[V.obj].d(g, t); g.restore(); },
    lessons: () => [conPalabra(L.free('noun', tipo, PAL[tipo].es, V.en, V.es, PAL[tipo].icon), tipo)]
  });
  v.cur = v.speed;
  w.cars.push(registrarPalabras(v));
}

/* ---------- Peatones en las aceras ---------- */
function makeCaminantes(w, R, add, nombre) {
  const moviles = [['walk', 'man'], ['walk', 'woman'], ['walk', 'grandmother'], ['run', 'adult'], ['run', 'woman'], ['walkDog', 'man'], ['walkDog', 'girl'],
    ['ride', 'boy'], ['ride', 'woman'], ['carry', 'man'], ['walk', 'student'], ['run', 'man'], ['carry', 'woman'], ['walk', 'kid']];
  moviles.forEach(([act, rol]) => {
    const r = R.int(0, ROWS - 1), side = R.chance(0.5) ? 'A' : 'B';
    const y = rowBase(r) + (side === 'A' ? R.range(84, 112) : R.range(396, 424));
    crearPersona(w, R, { rol, act, x: 0, y: 0, dir: R.chance(0.5) ? 1 : -1, move: true }, R.range(300, WORLD_W - 300), y, undefined, nombre, 'sidewalk');
  });
}

/* ============================================================================
   PLAYA, MAR Y CIELO
============================================================================ */
function hacerMar(w, R, add, nombre) {
  const fijo = (kind, obj, x, y, palabras, lessons) => registrarPalabras(add({ kind, obj, x, y, box: () => ({ x: x - Obj.O[obj].w / 2, y: y - Obj.O[obj].h, w: Obj.O[obj].w, h: Obj.O[obj].h }),
    draw: (g, t) => Obj.draw(g, obj, x, y, t, estadoObjeto({})), lessons: lessons || (() => palabras.map(p => leccionDe(p))) }));
  zonaTocable(w, add, 'sea', caja(0, SEA_Y + 10, WORLD_W, SEA_Y + 330), () => [leccionDe('sea'), leccionDe('water')], { lejos: true });
  zonaTocable(w, add, 'ocean', caja(0, SEA_Y + 330, WORLD_W, SEA_END), () => [leccionDe('ocean')], { lejos: true });
  zonaTocable(w, add, 'beachZone', caja(0, SAND_Y0, WORLD_W, SEA_Y - 10), () => [conPalabra(L.free('noun', 'sand', 'arena', 'The sand on the beach is warm.', 'La arena de la playa está tibia.', '🏖️'), 'sand'), leccionDe('beach')], { lejos: true });
  const xs = [0.12, 0.3, 0.46, 0.62, 0.8, 0.92].map(f => f * WORLD_W + R.sym(200));
  fijo('island', 'islandObj', xs[0], SEA_Y + 520, ['island']);
  fijo('ship', 'ship', xs[1], SEA_Y + 700, ['ship']);
  fijo('lighthouse', 'lighthouse', xs[2], SEA_Y + 260, [], () => [L.free('noun', 'lighthouse', 'faro', 'The lighthouse helps the ships at night.', 'El faro ayuda a los barcos de noche.', '🗼')]);
  fijo('whale', 'whale', xs[3], SEA_Y + 420, ['whale']);
  fijo('stormCloud', 'stormCloud', xs[5], SEA_Y + 880, ['storm']);
  const barco = add({ kind: 'boat', x: xs[4], y: SEA_Y + 190, x0: xs[4], box: () => ({ x: barco.x - 60, y: barco.y - 100, w: 120, h: 100 }),
    draw: (g, t) => Obj.draw(g, 'boatObj', barco.x, barco.y + Math.sin(t * 1.4) * 3, t),
    lessons: () => [leccionDe('boat'), conPalabra(L.free('verb', 'sailing', 'navegar', 'The boat is sailing on the sea.', 'El barco navega en el mar.', '⛵'), 'sea')] });
  barco.update = () => { barco.x = barco.x0 + Math.sin(now * 0.08) * 160; };
  registrarPalabras(barco);
  fijo('shark', 'shark', xs[0] + 380, SEA_Y + 300, ['shark']);
  // Nadador cerca de la orilla
  const sx = xs[2] + 300, sy = SEA_Y + 60;
  crearPersona(w, R, { rol: 'man', act: 'swim', x: 0, y: 0, dir: 1, enAgua: true }, sx, sy, sy, nombre, 'beach');
}

function hacerCielo(w, R, add) {
  const fondo = (kind, obj, x, y, palabras, extra = {}) => {
    const o = Obj.O[obj], s = extra.s || 1;
    return registrarPalabras(add(Object.assign({ kind, obj, x, y, lejos: true, box: () => ({ x: x - o.w * s / 2, y: y - o.h * s, w: o.w * s, h: o.h * s }),
      draw: (g, t) => Obj.draw(g, obj, x, y, t, estadoObjeto({}), s), lessons: () => palabras.map(p => leccionDe(p)) }, extra)));
  };
  zonaTocable(w, add, 'sky', caja(0, -2600, WORLD_W, SKY_Y - 360), () => [leccionDe('sky'), leccionDe('air')], { lejos: true, sortY: -99999 });
  // Montañas, colinas, bosque y lago a lo largo del horizonte
  for (let k = 0; k < 5; k++) {
    const x = (k + 0.5) / 5 * WORLD_W + R.sym(300);
    fondo('mountain', 'mountainObj', x, SKY_Y - 40, ['mountain'], { s: R.range(0.9, 1.15) });
    const o = Obj.O.mountainObj, s = 1;
    registrarPalabras(add({ kind: 'snow', x, y: SKY_Y - 40, sortY: SKY_Y - 39.9, noDraw: true, lejos: true, box: () => ({ x: x - 70, y: SKY_Y - 40 - o.h, w: 140, h: 90 }), lessons: () => [leccionDe('snow')] }));
  }
  fondo('hill', 'hillObj', WORLD_W * 0.23, SKY_Y - 4, ['hill']);
  fondo('hill', 'hillObj', WORLD_W * 0.71, SKY_Y - 4, ['hill']);
  fondo('forest', 'forestObj', WORLD_W * 0.36, SKY_Y - 2, ['forest']);
  fondo('forest', 'forestObj', WORLD_W * 0.86, SKY_Y - 2, ['forest']);
  fondo('lake', 'lakeObj', WORLD_W * 0.55, SKY_Y - 6, ['lake']);
  fondo('rainCloud', 'rainCloud', WORLD_W * 0.1, SKY_Y - 330, ['rain']);
  fondo('rainbow', 'rainbow', WORLD_W * 0.62, SKY_Y - 60, ['rainbow']);
  fondo('sun', 'sun', WORLD_W * 0.78, SKY_Y - 480, ['sun']);
  fondo('moon', 'moon', WORLD_W * 0.28, SKY_Y - 470, ['moon']);
  [0.18, 0.33, 0.5, 0.66, 0.9].forEach((f, i) => fondo('star', 'star', f * WORLD_W + R.sym(80), SKY_Y - 560 - (i % 2) * 60, ['star']));
  for (let k = 0; k < 7; k++) {
    const cl = add({ kind: 'cloud', x: R.range(0, WORLD_W), y: SKY_Y - R.range(260, 520), lejos: true, v: R.range(8, 18), s: R.range(0.7, 1.2),
      box: () => ({ x: cl.x - 75 * cl.s, y: cl.y - 60 * cl.s, w: 150 * cl.s, h: 60 * cl.s }), draw: (g, t) => Obj.draw(g, 'cloud', cl.x, cl.y, t, null, cl.s),
      lessons: () => [leccionDe('cloud'), conPalabra(L.free('adj', 'white', 'blanco', 'The cloud is white.', 'La nube es blanca.', '☁️'), 'white')] });
    cl.update = dt => { cl.x += cl.v * dt; if (cl.x > WORLD_W + 200) cl.x = -200; };
    registrarPalabras(cl);
  }
  const globo = fondo('balloon', 'balloon', WORLD_W * 0.45, SKY_Y - 300, ['air']);
  globo.lessons = () => [conPalabra(L.free('noun', 'air', 'aire', 'Hot air makes the balloon go up.', 'El aire caliente hace subir el globo.', '🎈'), 'air')];
  const avion = add({ kind: 'plane', x: -300, y: SKY_Y - 620, lejos: true, box: () => ({ x: avion.x - 85, y: avion.y - 60, w: 170, h: 60 }),
    draw: (g, t) => Obj.draw(g, 'plane', avion.x, avion.y, t),
    lessons: () => [leccionDe('plane'), conPalabra(L.free('verb', 'flying', 'volar', 'The plane is flying over the town.', 'El avión vuela sobre el pueblo.', '✈️'), 'fly')] });
  avion.update = dt => { avion.x += 150 * dt; if (avion.x > WORLD_W + 600) avion.x = -600; };
  registrarPalabras(avion);
  // Tren y estación
  const est = WORLD_W * 0.5 + R.sym(400);
  fondo('station', 'stationObj', est, RAIL_Y - 2, ['station']);
  const tren = add({ kind: 'train', x: -900, y: RAIL_Y + 6, box: () => ({ x: tren.x - 310, y: tren.y - 90, w: 620, h: 90 }),
    draw: (g, t) => Obj.draw(g, 'train', tren.x, tren.y, t), lejos: true,
    lessons: () => [leccionDe('train'), conPalabra(L.free('verb', 'arrive', 'llegar', 'The train arrives at the station.', 'El tren llega a la estación.', '🚆'), 'arrive')] });
  tren.update = dt => {
    const cerca = Math.abs(tren.x - est) < 20;
    if (tren.parada > 0) { tren.parada -= dt; return; }
    tren.x += 260 * dt;
    if (cerca && !tren.paro) { tren.parada = 6; tren.paro = true; }
    if (tren.x > WORLD_W + 900) { tren.x = -900; tren.paro = false; }
  };
  registrarPalabras(tren);
}

/* ---------- Objetos del paisaje ---------- */
Obj.def('mountainObj', 520, 330, (g, t) => {
  const c = Gen.mix('#78909c', '#37474f', isDark() ? 0.6 : 0);
  g.fillStyle = c; g.beginPath(); g.moveTo(-260, 0); g.lineTo(-120, -220); g.lineTo(-40, -150); g.lineTo(40, -330); g.lineTo(150, -180); g.lineTo(260, 0); g.closePath(); g.fill();
  g.fillStyle = Gen.shade(c, -0.12); g.beginPath(); g.moveTo(40, -330); g.lineTo(150, -180); g.lineTo(260, 0); g.lineTo(90, 0); g.closePath(); g.fill();
  g.fillStyle = '#fafafa'; g.beginPath(); g.moveTo(40, -330); g.lineTo(78, -262); g.lineTo(58, -270); g.lineTo(40, -250); g.lineTo(20, -268); g.lineTo(6, -258); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(-120, -220); g.lineTo(-96, -182); g.lineTo(-112, -188); g.lineTo(-128, -176); g.lineTo(-138, -192); g.closePath(); g.fill();
});
Obj.def('hillObj', 700, 150, g => { g.fillStyle = Gen.mix('#6fa860', '#1b3322', isDark() ? 0.6 : 0); g.beginPath(); g.moveTo(-350, 0); g.quadraticCurveTo(-120, -190, 90, -120); g.quadraticCurveTo(250, -70, 350, 0); g.closePath(); g.fill(); });
Obj.def('forestObj', 420, 170, (g) => {
  for (let k = 0; k < 11; k++) { const x = -190 + k * 38, h = 110 + (k * 37 % 50); const c = k % 2 ? '#2e7d32' : '#1b5e20';
    g.fillStyle = '#5d4037'; g.fillRect(x - 4, -14, 8, 14); g.fillStyle = Gen.mix(c, '#0b1d10', isDark() ? 0.5 : 0);
    g.beginPath(); g.moveTo(x - 26, -12); g.lineTo(x, -h); g.lineTo(x + 26, -12); g.closePath(); g.fill(); }
});
Obj.def('lakeObj', 460, 70, (g, t) => {
  Obj.ell(g, 0, -30, 225, 34, '#8fb58a'); Obj.ell(g, 0, -30, 205, 26, '#4a90c2');
  for (let k = 0; k < 4; k++) Obj.curve(g, -120 + k * 70, -30 + Math.sin(t + k) * 2, -100 + k * 70, -36, -80 + k * 70, -30, 'rgba(255,255,255,.5)', 2);
});
Obj.def('stationObj', 300, 140, g => {
  Obj.rect(g, -150, -18, 300, 18, '#9e9e9e'); Obj.rect(g, -120, -120, 8, 104, '#546e7a'); Obj.rect(g, 112, -120, 8, 104, '#546e7a');
  Obj.poly(g, [[-140, -118], [140, -118], [120, -140], [-120, -140]], '#c62828');
  Obj.rr(g, -60, -110, 120, 24, 5, '#37474f'); Obj.text(g, 'STATION', 0, -98, 13, '#fff');
  Obj.rr(g, -30, -76, 60, 50, 4, '#eceff1'); Obj.text(g, '10:30', 0, -52, 11, '#e65100');
});
Obj.def('islandObj', 240, 110, (g, t) => {
  Obj.ell(g, 0, -12, 110, 20, '#e9c46a'); Obj.ell(g, 0, -16, 80, 12, '#f4d58d');
  Obj.curve(g, 10, -18, 20, -60, 6, -96, '#8d6e63', 7);
  [[-0.5, '#43a047'], [0.3, '#2e7d32'], [1.1, '#66bb6a'], [2.2, '#43a047'], [2.8, '#2e7d32']].forEach(([a, c]) => { g.save(); g.translate(6, -96); g.rotate(a); Obj.ell(g, 22, 0, 26, 7, c); g.restore(); });
});
Obj.def('ship', 280, 120, (g, t) => {
  const b = Math.sin(t * 0.9) * 2;
  Obj.poly(g, [[-130, -30 + b], [130, -30 + b], [100, 0 + b], [-110, 0 + b]], '#263238'); Obj.rect(g, -130, -34 + b, 260, 6, '#e53935');
  Obj.rect(g, -70, -80 + b, 120, 48, '#fafafa'); for (let k = 0; k < 5; k++) Obj.circle(g, -56 + k * 24, -56 + b, 5, '#90caf9');
  Obj.rect(g, 10, -116 + b, 26, 38, '#e53935'); Obj.rect(g, 10, -116 + b, 26, 8, '#212121');
});
Obj.def('boatObj', 120, 104, (g, t) => {
  Obj.poly(g, [[-50, -18], [50, -18], [36, 0], [-38, 0]], '#8d6e63'); Obj.rect(g, -2, -100, 4, 84, '#5d4037');
  Obj.poly(g, [[2, -96], [44, -24], [2, -24]], '#fafafa'); Obj.poly(g, [[-2, -86], [-40, -24], [-2, -24]], '#ffca28');
});
Obj.def('riverObj', 1000, 80, (g, t) => {
  Obj.rr(g, -500, -62, 1000, 60, 26, '#8fb58a'); Obj.rr(g, -490, -56, 980, 48, 22, '#4a90c2');
  for (let k = 0; k < 10; k++) Obj.curve(g, -460 + k * 95 + (t * 30 % 95), -32, -440 + k * 95 + (t * 30 % 95), -38, -420 + k * 95 + (t * 30 % 95), -32, 'rgba(255,255,255,.55)', 2);
});
Obj.O.riverObj.suelo = true;
Obj.def('bridgeObj', 220, 96, g => {
  g.fillStyle = '#8d6e63'; g.beginPath(); g.moveTo(-110, -16); g.quadraticCurveTo(0, -96, 110, -16); g.lineTo(110, -4); g.quadraticCurveTo(0, -82, -110, -4); g.closePath(); g.fill();
  for (let k = -4; k <= 4; k++) { const x = k * 22, y = -16 - (1 - (k / 5) * (k / 5)) * 56; Obj.line(g, [[x, y], [x, y - 22]], '#6d4c41', 3); }
  g.strokeStyle = '#6d4c41'; g.lineWidth = 3; g.beginPath(); g.moveTo(-100, -36); g.quadraticCurveTo(0, -112, 100, -36); g.stroke();
});
Obj.def('bicycleObj', 96, 64, (g, t) => Draw.bicycle(g, 0, 0, '#2e86de', 0));
Obj.def('slideObj', 130, 132, g => Draw.slide(g, -10, 0));
Obj.def('swingObj', 132, 160, (g, t) => Draw.swing(g, 0, 0, t));
Obj.def('parkedCar', 190, 90, g => {
  if (!Obj.O.parkedCar.car) { const p = { ...Carro.config.presets['Aleatorio'], variation: 0.5, randomColors: true, scene: true, driver: false, skyColor: '#8ec5ea', spin: 0 }; Obj.O.parkedCar.car = noBg(Carro.build(p, Gen.makeRand('estacionado'))); }
  const c = Obj.O.parkedCar.car, geo = c.geo;
  g.save(); g.scale(CAR_SCALE, CAR_SCALE); g.translate(-600, -geo.groundY); c.forEach(q => q(g)); g.restore();
});
Obj.def('concertBanner2', 260, 170, g => {
  Obj.rect(g, -118, -166, 6, 166, '#37474f'); Obj.rect(g, 112, -166, 6, 166, '#37474f');
  Obj.rr(g, -124, -170, 248, 36, 6, '#6a1b9a'); Obj.text(g, '♪ CONCERT TONIGHT ♪', 0, -152, 13, '#ffd54f');
});
