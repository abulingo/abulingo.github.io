/* Pronunciación del español (latinoamericano) explicada en inglés, para quien
   aprende español. La usa fonetica-es.html; los audios (voz es-US) están en
   audios_es/fonetica/<archivo>.mp3 — ver window.FON_ES_ARCHIVO. */
(function () {
  // Nombre de archivo de cada palabra: sin tildes pero sin perder la diferencia
  // (papá ≠ papa): á → a_, ñ → n_, ü → u_ (igual en scripts/espanol/fonetica.py).
  const ARCHIVO = (w) => w.toLowerCase()
    .replace(/[¿?¡!.,;:"«»]/g, '')
    .replace(/[áéíóúñü]/g, c => ({ á: 'a_', é: 'e_', í: 'i_', ó: 'o_', ú: 'u_', ñ: 'n_', ü: 'u__' }[c]))
    .trim().replace(/\s+/g, '-');

  const VOCALES = [
    { s: 'a', como: 'Mouth wide open, tongue low and relaxed.', en: 'Like the a in “father”, but shorter and crisper.',
      trampa: 'Never turn it into the “uh” sound of “about”: every a is a full, clear a, even in unstressed syllables.',
      ej: ['casa', 'mapa', 'agua', 'mañana', 'banana'] },
    { s: 'e', como: 'Lips slightly spread, tongue mid-front.', en: 'Like the e in “bet”, a bit more closed.',
      trampa: 'Don’t say “ay” as in “day”: «me» is a short, pure /e/, not “may”.',
      ej: ['mesa', 'leche', 'verde', 'tres', 'nene'] },
    { s: 'i', como: 'Lips spread as in a smile, tongue high and front.', en: 'Like the ee in “see”, but short.',
      trampa: 'Never use the short i of “sit”: «sí» rhymes with “see”.',
      ej: ['sí', 'vino', 'libro', 'cine', 'Chile'] },
    { s: 'o', como: 'Lips rounded, tongue mid-back.', en: 'Like the o in “more”, without the r.',
      trampa: 'Don’t glide to “oh-oo” as in “go”: «no» is one short, pure /o/.',
      ej: ['no', 'todo', 'ojo', 'como', 'loco'] },
    { s: 'u', como: 'Lips very rounded and pushed forward, tongue high and back.', en: 'Like the oo in “food”, but short.',
      trampa: 'Don’t add a y sound before it: «música» is “moo-see-kah”, not “myoo-”.',
      ej: ['uno', 'tú', 'luna', 'música', 'su'] }
  ];

  const CONSONANTES = [
    { s: 'r', t: 'The tap r', ico: '🥁',
      como: 'One quick flick of the tongue tip against the ridge behind your top teeth.',
      en: 'Exactly the “tt” of American “butter” or “dd” of “ladder” said fast.',
      trampa: 'Never use the English r (with the tongue curled back). «pero» ≈ “peh-do” said quickly.',
      ej: ['pero', 'caro', 'para', 'hora', 'mira'], pares: [['pero', 'perro'], ['caro', 'carro']] },
    { s: 'rr', t: 'The trilled r', ico: '🏍️',
      como: 'The tongue tip vibrates several times against the ridge behind your teeth.',
      en: 'No English equivalent. Practice by repeating “butter-butter-butter” very fast, or saying “drrr” like a motor.',
      trampa: 'Written rr between vowels, and a single r at the start of a word or after n, l, s, are all trilled: «rojo», «Enrique».',
      ej: ['perro', 'carro', 'rojo', 'arroz', 'Enrique'], pares: [['perro', 'pero'], ['carro', 'caro']] },
    { s: 'ñ', t: 'The ñ', ico: '🌟',
      como: 'The middle of the tongue presses the roof of the mouth while you say n.',
      en: 'Like the “ny” in “canyon” or the “ni” in “onion”.',
      trampa: 'It is a different letter from n: «año» (year) and «ano» (anus) are very different words!',
      ej: ['niño', 'año', 'mañana', 'España', 'señor'], pares: [['cana', 'caña'], ['mono', 'moño']] },
    { s: 'll / y', t: 'll and y', ico: '🦙',
      como: 'Tongue close to the roof of the mouth, as for an English y.',
      en: 'Like the y in “yes” (in most of Latin America). In Argentina and Uruguay it sounds like “sh”.',
      trampa: 'll is not an l sound: «llamar» is “yah-mar”, not “lah-mar”.',
      ej: ['llamar', 'calle', 'pollo', 'yo', 'playa'] },
    { s: 'j / ge / gi', t: 'The j sound', ico: '💨',
      como: 'Air rubs at the back of the mouth, like clearing your throat softly.',
      en: 'A stronger, raspier English h, as in “ha!”.',
      trampa: 'j is never like the English j of “jam”: «jamón» = “hah-MOHN”. g before e or i sounds the same: «gente», «gigante».',
      ej: ['jamón', 'joven', 'gente', 'gigante', 'México'] },
    { s: 'g', t: 'The hard g', ico: '🐈',
      como: 'Like English g in “go”; softer between vowels.',
      en: 'ga, go, gu = “go”. To keep it hard before e and i, Spanish writes gue, gui (the u is silent).',
      trampa: '«guitarra» is “gee-TAH-rah” (silent u). With ü the u is pronounced: «pingüino».',
      ej: ['gato', 'agua', 'guitarra', 'guerra', 'pingüino'] },
    { s: 'h', t: 'The silent h', ico: '🤫',
      como: 'Nothing! The letter h is never pronounced.',
      en: 'Like the h in “honest” or “hour”.',
      trampa: '«hola» = “OH-lah”, «hermano» = “er-MAH-no”. The only exception is ch, which is one sound.',
      ej: ['hola', 'hacer', 'hermano', 'ahora', 'hospital'] },
    { s: 'b / v', t: 'b and v sound the same', ico: '🐄',
      como: 'At the start: lips close like an English b. Between vowels: lips almost touch, softly.',
      en: 'There is no English v sound (teeth on lip) in Spanish.',
      trampa: '«vaca» and «baca» sound identical. Between vowels both are soft: «uva», «lobo».',
      ej: ['vaca', 'boca', 'vivir', 'beber', 'uva'] },
    { s: 'd', t: 'The soft d', ico: '🪶',
      como: 'At the start or after n/l: tongue tip touches the back of the top teeth. Between vowels: very soft.',
      en: 'Between vowels it sounds like the th in “this” or “other”.',
      trampa: '«nada» ≈ “NAH-tha” (soft th), never a hard American d, which would sound like a Spanish r.',
      ej: ['nada', 'cada', 'todo', 'verdad', 'Madrid'] },
    { s: 'c / z / s', t: 'c, z and s (seseo)', ico: '🐍',
      como: 'In Latin America z, ce, ci and s are all the same s sound.',
      en: 'Like the s in “sun”, never like the z in “zoo”.',
      trampa: '«zapato» = “sah-PAH-to”. In Spain z and ce/ci sound like the th in “think”.',
      ej: ['cine', 'zapato', 'cielo', 'casa', 'azul'] },
    { s: 'c / qu / k', t: 'The k sound', ico: '🔑',
      como: 'Like English k but without the puff of air.',
      en: 'ca, co, cu and que, qui all sound k. The u in que, qui is silent.',
      trampa: '«queso» = “KEH-so”, not “kway-so”. Also p, t and k have no puff of air: hold a paper in front of your mouth, it shouldn’t move.',
      ej: ['casa', 'queso', 'aquí', 'poco', 'taco'] },
    { s: 'ch', t: 'The ch', ico: '🍫',
      como: 'Exactly like English ch.',
      en: 'Like the ch in “church”.',
      trampa: 'Never like the “sh” in “Chicago”: «chico» = “CHEE-ko”.',
      ej: ['chico', 'mucho', 'leche', 'noche', 'chocolate'] },
    { s: 'x', t: 'The x', ico: '❌',
      como: 'Usually ks (or gs).',
      en: '«taxi», «examen» = ks/gs. In some names of Mexican origin it sounds like the Spanish j.',
      trampa: '«México», «Texas» and «Oaxaca» are pronounced with the j sound: “MEH-hee-ko”.',
      ej: ['taxi', 'examen', 'éxito', 'México', 'Oaxaca'] }
  ];

  // Acentuación: la sílaba fuerte (en mayúsculas en «s»).
  const ACENTO = {
    reglas: [
      ['Ends in a vowel, n or s', 'stress on the second-to-last syllable', [['casa', 'CA-sa'], ['hablan', 'HA-blan'], ['zapatos', 'za-PA-tos']]],
      ['Ends in any other consonant', 'stress on the last syllable', [['comer', 'co-MER'], ['ciudad', 'ciu-DAD'], ['español', 'es-pa-ÑOL']]],
      ['Has a written accent (á é í ó ú)', 'stress goes where the accent is', [['café', 'ca-FÉ'], ['árbol', 'ÁR-bol'], ['teléfono', 'te-LÉ-fo-no']]]
    ],
    pares: [
      ['papa', 'potato', 'papá', 'dad'],
      ['esta', 'this', 'está', 'is'],
      ['si', 'if', 'sí', 'yes'],
      ['tu', 'your', 'tú', 'you'],
      ['hablo', 'I speak', 'habló', 'he/she spoke'],
      ['termino', 'I finish', 'terminó', 'he/she finished']
    ]
  };

  // Enlace entre palabras: en el habla, las palabras se pegan.
  const ENLACE = [
    { t: 'Vowel + vowel (sinalefa)', d: 'When a word ends in a vowel and the next starts with a vowel, they merge into one syllable.',
      ej: [['mi amigo', 'mia-MI-go'], ['la escuela', 'laes-CUE-la'], ['¿Qué es esto?', 'que-ES-to'], ['todo el día', 'to-del-DÍ-a']] },
    { t: 'Consonant + vowel', d: 'A final consonant jumps to the next word if it starts with a vowel.',
      ej: [['los otros', 'lo-SO-tros'], ['es un amigo', 'e-su-na-MI-go'], ['mis hijos', 'mi-SI-jos'], ['el agua', 'e-LA-gua']] },
    { t: 'Same consonant twice', d: 'Two identical consonants become one, slightly longer.',
      ej: [['los sábados', 'lo-SÁ-ba-dos'], ['el lunes', 'e-LU-nes'], ['un nombre', 'u-NOM-bre']] }
  ];

  const todas = new Set();
  VOCALES.forEach(v => v.ej.forEach(w => todas.add(w)));
  CONSONANTES.forEach(c => { c.ej.forEach(w => todas.add(w)); (c.pares || []).flat().forEach(w => todas.add(w)); });
  ACENTO.reglas.forEach(r => r[2].forEach(([w]) => todas.add(w)));
  ACENTO.pares.forEach(p => { todas.add(p[0]); todas.add(p[2]); });
  ENLACE.forEach(g => g.ej.forEach(([w]) => todas.add(w)));

  window.FON_ES = { VOCALES, CONSONANTES, ACENTO, ENLACE, PALABRAS: [...todas] };
  window.FON_ES_ARCHIVO = ARCHIVO;
})();
