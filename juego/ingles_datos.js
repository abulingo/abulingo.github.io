'use strict';

// Datos y gramática para mundo_ingles.html: vocabulario inglés–español y constructores de frases.
const Ingles = (() => {

  /* ---------- Sustantivos (g: género en español, pl: plural, the: se usa con «the») ---------- */
  const N = {
    house: { en: 'house', es: 'casa', g: 'f', icon: '🏠' },
    door: { en: 'door', es: 'puerta', g: 'f', icon: '🚪' },
    window: { en: 'window', es: 'ventana', g: 'f', icon: '🪟' },
    windows: { en: 'windows', es: 'ventanas', g: 'f', pl: true, icon: '🪟' },
    roof: { en: 'roof', es: 'techo', g: 'm', icon: '🏠' },
    chimney: { en: 'chimney', es: 'chimenea', g: 'f', icon: '🧱' },
    smoke: { en: 'smoke', es: 'humo', g: 'm', the: true, icon: '💨' },
    garage: { en: 'garage', es: 'garaje', g: 'm', icon: '🚗' },
    tree: { en: 'tree', es: 'árbol', g: 'm', icon: '🌳' },
    leaves: { en: 'leaves', es: 'hojas', g: 'f', pl: true, icon: '🍃' },
    car: { en: 'car', es: 'carro', g: 'm', icon: '🚗' },
    driver: { en: 'driver', es: 'conductor', g: 'm', icon: '🧑' },
    street: { en: 'street', es: 'calle', g: 'f', icon: '🛣️' },
    sidewalk: { en: 'sidewalk', es: 'acera', g: 'f', icon: '🚶' },
    crosswalk: { en: 'crosswalk', es: 'paso de peatones', g: 'm', icon: '🚸' },
    streetlight: { en: 'streetlight', es: 'farola', g: 'f', icon: '💡' },
    trafficLight: { en: 'traffic light', es: 'semáforo', g: 'm', icon: '🚦' },
    mailbox: { en: 'mailbox', es: 'buzón', g: 'm', icon: '📫' },
    flowers: { en: 'flowers', es: 'flores', g: 'f', pl: true, icon: '🌷' },
    bench: { en: 'bench', es: 'banca', g: 'f', icon: '🪑' },
    fountain: { en: 'fountain', es: 'fuente', g: 'f', icon: '⛲' },
    water: { en: 'water', es: 'agua', g: 'f', the: true, icon: '💧' },
    pond: { en: 'pond', es: 'estanque', g: 'm', icon: '🦆' },
    duck: { en: 'duck', es: 'pato', g: 'm', icon: '🦆' },
    ducks: { en: 'ducks', es: 'patos', g: 'm', pl: true, icon: '🦆' },
    dog: { en: 'dog', es: 'perro', g: 'm', icon: '🐕' },
    doghouse: { en: 'doghouse', es: 'caseta', g: 'f', icon: '🐶' },
    cat: { en: 'cat', es: 'gato', g: 'm', icon: '🐈' },
    bird: { en: 'bird', es: 'pájaro', g: 'm', icon: '🐦' },
    ball: { en: 'ball', es: 'pelota', g: 'f', icon: '⚽' },
    bicycle: { en: 'bicycle', es: 'bicicleta', g: 'f', icon: '🚲' },
    busStop: { en: 'bus stop', es: 'parada de autobús', g: 'f', icon: '🚏' },
    bus: { en: 'bus', es: 'autobús', g: 'm', icon: '🚌' },
    trashCan: { en: 'trash can', es: 'bote de basura', g: 'm', icon: '🗑️' },
    kite: { en: 'kite', es: 'cometa', g: 'f', icon: '🪁' },
    sun: { en: 'sun', es: 'sol', g: 'm', the: true, icon: '☀️' },
    moon: { en: 'moon', es: 'luna', g: 'f', the: true, icon: '🌙' },
    sky: { en: 'sky', es: 'cielo', g: 'm', the: true, icon: '🌤️' },
    cloud: { en: 'cloud', es: 'nube', g: 'f', icon: '☁️' },
    grass: { en: 'grass', es: 'césped', g: 'm', the: true, icon: '🌱' },
    park: { en: 'park', es: 'parque', g: 'm', icon: '🏞️' },
    slide: { en: 'slide', es: 'tobogán', g: 'm', icon: '🛝' },
    swing: { en: 'swing', es: 'columpio', g: 'm', icon: '🎠' },
    table: { en: 'table', es: 'mesa', g: 'f', icon: '🪑' },
    umbrella: { en: 'umbrella', es: 'sombrilla', g: 'f', icon: '⛱️' },
    rock: { en: 'rock', es: 'roca', g: 'f', icon: '🪨' },
    person: { en: 'person', es: 'persona', g: 'f', icon: '🧑' },
    teacher: { en: 'teacher', es: 'profesor', g: 'm', icon: '🎓' },
    // Edificios
    school: { en: 'school', es: 'escuela', g: 'f', icon: '🏫' },
    bakery: { en: 'bakery', es: 'panadería', g: 'f', icon: '🥐' },
    library: { en: 'library', es: 'biblioteca', g: 'f', icon: '📚' },
    cafe: { en: 'café', es: 'cafetería', g: 'f', icon: '☕' },
    hospital: { en: 'hospital', es: 'hospital', g: 'm', icon: '🏥' },
    supermarket: { en: 'supermarket', es: 'supermercado', g: 'm', icon: '🛒' },
    postOffice: { en: 'post office', es: 'oficina de correos', g: 'f', icon: '📮' },
    fireStation: { en: 'fire station', es: 'estación de bomberos', g: 'f', icon: '🚒' },
    policeStation: { en: 'police station', es: 'estación de policía', g: 'f', icon: '🚓' },
    restaurant: { en: 'restaurant', es: 'restaurante', g: 'm', icon: '🍽️' },
    bank: { en: 'bank', es: 'banco', g: 'm', icon: '🏦' },
    pharmacy: { en: 'pharmacy', es: 'farmacia', g: 'f', icon: '💊' },
    cinema: { en: 'cinema', es: 'cine', g: 'm', icon: '🎬' },
    museum: { en: 'museum', es: 'museo', g: 'm', icon: '🏛️' },
    clothesStore: { en: 'clothes store', es: 'tienda de ropa', g: 'f', icon: '👕' },
    gym: { en: 'gym', es: 'gimnasio', g: 'm', icon: '🏋️' },
    hotel: { en: 'hotel', es: 'hotel', g: 'm', icon: '🏨' },
    petShop: { en: 'pet shop', es: 'tienda de mascotas', g: 'f', icon: '🐾' },
    toyStore: { en: 'toy store', es: 'juguetería', g: 'f', icon: '🧸' },
    farm: { en: 'farm', es: 'granja', g: 'f', icon: '🚜' },
    market: { en: 'market', es: 'mercado', g: 'm', icon: '🏪' },
    square: { en: 'square', es: 'plaza', g: 'f', icon: '⛲' },
    clockTower: { en: 'clock tower', es: 'torre del reloj', g: 'f', icon: '🕰️' },
    field: { en: 'soccer field', es: 'cancha de fútbol', g: 'f', icon: '⚽' },
    cow: { en: 'cow', es: 'vaca', g: 'f', icon: '🐄' },
    pig: { en: 'pig', es: 'cerdo', g: 'm', icon: '🐖' },
    sheep: { en: 'sheep', es: 'oveja', g: 'f', icon: '🐑' },
    horse: { en: 'horse', es: 'caballo', g: 'm', icon: '🐎' },
    chicken: { en: 'chicken', es: 'gallina', g: 'f', icon: '🐔' },
    barn: { en: 'barn', es: 'granero', g: 'm', icon: '🛖' },
    fence: { en: 'fence', es: 'cerca', g: 'f', icon: '🚧' },
    stall: { en: 'market stall', es: 'puesto del mercado', g: 'm', icon: '🍎' },
    goal: { en: 'goal', es: 'portería', g: 'f', icon: '🥅' },
    // Ropa y rasgos
    tshirt: { en: 'T-shirt', es: 'camiseta', g: 'f', icon: '👕' },
    shirt: { en: 'shirt', es: 'camisa', g: 'f', icon: '👔' },
    sweater: { en: 'sweater', es: 'suéter', g: 'm', icon: '🧶' },
    coat: { en: 'coat', es: 'abrigo', g: 'm', icon: '🧥' },
    dress: { en: 'dress', es: 'vestido', g: 'm', icon: '👗' },
    pants: { en: 'pants', es: 'pantalones', g: 'm', pl: true, icon: '👖' },
    shorts: { en: 'shorts', es: 'pantalones cortos', g: 'm', pl: true, icon: '🩳' },
    skirt: { en: 'skirt', es: 'falda', g: 'f', icon: '👗' },
    shoes: { en: 'shoes', es: 'zapatos', g: 'm', pl: true, icon: '👟' },
    glasses: { en: 'glasses', es: 'gafas', g: 'f', pl: true, icon: '👓' },
    hair: { en: 'hair', es: 'pelo', g: 'm', the: true, icon: '💇' },
    beard: { en: 'beard', es: 'barba', g: 'f', icon: '🧔' },
    mustache: { en: 'mustache', es: 'bigote', g: 'm', icon: '🥸' },
    // Objetos que usan las personas
    book: { en: 'book', es: 'libro', g: 'm', icon: '📖' },
    iceCream: { en: 'ice cream', es: 'helado', g: 'm', icon: '🍦' },
    coffee: { en: 'coffee', es: 'café', g: 'm', the: true, icon: '☕' },
    phone: { en: 'phone', es: 'teléfono', g: 'm', icon: '📱' },
    camera: { en: 'camera', es: 'cámara', g: 'f', icon: '📷' },
    broom: { en: 'broom', es: 'escoba', g: 'f', icon: '🧹' },
    wateringCan: { en: 'watering can', es: 'regadera', g: 'f', icon: '🚿' },
    painting: { en: 'painting', es: 'cuadro', g: 'm', icon: '🎨' },
    fishingRod: { en: 'fishing rod', es: 'caña de pescar', g: 'f', icon: '🎣' },
    music: { en: 'music', es: 'música', g: 'f', the: true, icon: '🎵' },
    bag: { en: 'bag', es: 'bolsa', g: 'f', icon: '🛍️' }
  };

  const BUILDINGS = {
    school: { n: N.school, sign: 'SCHOOL', fact: ['Children learn here.', 'Los niños aprenden aquí.'], wall: '#f2d492', door: '#2a6f97' },
    bakery: { n: N.bakery, sign: 'BAKERY', fact: ['You can buy bread here.', 'Aquí puedes comprar pan.'], wall: '#f7d9c4', door: '#8c5a3c' },
    library: { n: N.library, sign: 'LIBRARY', fact: ['You can read books here.', 'Aquí puedes leer libros.'], wall: '#c9e4de', door: '#386641' },
    cafe: { n: N.cafe, sign: 'CAFÉ', fact: ['You can drink coffee here.', 'Aquí puedes tomar café.'], wall: '#e9c46a', door: '#6b2d1f' },
    hospital: { n: N.hospital, sign: 'HOSPITAL', fact: ['Doctors help sick people here.', 'Aquí los médicos ayudan a los enfermos.'], wall: '#f2f2f2', door: '#bc4749' },
    supermarket: { n: N.supermarket, sign: 'SUPERMARKET', fact: ['You can buy food here.', 'Aquí puedes comprar comida.'], wall: '#dfe7fd', door: '#3d405b' },
    postOffice: { n: N.postOffice, sign: 'POST OFFICE', fact: ['You can send letters here.', 'Aquí puedes enviar cartas.'], wall: '#ffe5b4', door: '#2a6f97' },
    fireStation: { n: N.fireStation, sign: 'FIRE STATION', fact: ['Firefighters work here.', 'Aquí trabajan los bomberos.'], wall: '#e76f51', door: '#3a3a3a' },
    policeStation: { n: N.policeStation, sign: 'POLICE', fact: ['Police officers work here.', 'Aquí trabajan los policías.'], wall: '#a8c5e6', door: '#1f3a60' },
    restaurant: { n: N.restaurant, sign: 'RESTAURANT', fact: ['People eat dinner here.', 'Aquí la gente cena.'], wall: '#f4a261', door: '#6b2d1f' },
    bank: { n: N.bank, sign: 'BANK', fact: ['People save money here.', 'Aquí la gente ahorra dinero.'], wall: '#d9d9d9', door: '#1f3a60' },
    pharmacy: { n: N.pharmacy, sign: 'PHARMACY', fact: ['You can buy medicine here.', 'Aquí puedes comprar medicinas.'], wall: '#d8f3dc', door: '#2d6a4f' },
    cinema: { n: N.cinema, sign: 'CINEMA', fact: ['You can watch movies here.', 'Aquí puedes ver películas.'], wall: '#9d4edd', door: '#240046' },
    museum: { n: N.museum, sign: 'MUSEUM', fact: ['You can see old things here.', 'Aquí puedes ver cosas antiguas.'], wall: '#e9e3d5', door: '#6c584c' },
    clothesStore: { n: N.clothesStore, sign: 'CLOTHES', fact: ['You can buy shirts and shoes here.', 'Aquí puedes comprar camisas y zapatos.'], wall: '#ffc8dd', door: '#c9184a' },
    gym: { n: N.gym, sign: 'GYM', fact: ['People exercise here.', 'Aquí la gente hace ejercicio.'], wall: '#8ecae6', door: '#023047' },
    hotel: { n: N.hotel, sign: 'HOTEL', fact: ['Tourists sleep here.', 'Aquí duermen los turistas.'], wall: '#ffe8d6', door: '#9c6644' },
    petShop: { n: N.petShop, sign: 'PET SHOP', fact: ['You can buy food for your pet here.', 'Aquí puedes comprar comida para tu mascota.'], wall: '#caffbf', door: '#386641' },
    toyStore: { n: N.toyStore, sign: 'TOYS', fact: ['Children buy toys here.', 'Aquí los niños compran juguetes.'], wall: '#ffd6a5', door: '#e63946' }
  };
  // Zona temática de cada edificio (dónde aparecen las palabras de cada tema)
  const BUILDING_ZONE = {
    school: 'school', library: 'library', bakery: 'bakery', cafe: 'cafe', restaurant: 'restaurant', supermarket: 'supermarket',
    hospital: 'hospital', pharmacy: 'pharmacy', gym: 'gym', cinema: 'cinema', clothesStore: 'clothes', petShop: 'petshop',
    bank: 'bank', postOffice: 'office', hotel: 'office', museum: 'school', fireStation: 'any', policeStation: 'any', toyStore: 'house'
  };

  /* ---------- Tiempos verbales de cada acción ---------- */
  // presente simple | pasado | futuro | presente perfecto  (inglés y español)
  const TENSES = {
    walk: 'walks|walked|will walk|has walked|camina|caminó|caminará|ha caminado',
    run: 'runs|ran|will run|has run|corre|corrió|correrá|ha corrido',
    walkDog: 'walks the dog|walked the dog|will walk the dog|has walked the dog|pasea al perro|paseó al perro|paseará al perro|ha paseado al perro',
    ride: 'rides a bicycle|rode a bicycle|will ride a bicycle|has ridden a bicycle|monta en bicicleta|montó en bicicleta|montará en bicicleta|ha montado en bicicleta',
    jump: 'jumps|jumped|will jump|has jumped|salta|saltó|saltará|ha saltado',
    dance: 'dances|danced|will dance|has danced|baila|bailó|bailará|ha bailado',
    wave: 'waves|waved|will wave|has waved|saluda|saludó|saludará|ha saludado',
    read: 'reads a book|read a book|will read a book|has read a book|lee un libro|leyó un libro|leerá un libro|ha leído un libro',
    eat: 'eats an ice cream|ate an ice cream|will eat an ice cream|has eaten an ice cream|come un helado|comió un helado|comerá un helado|ha comido un helado',
    drink: 'drinks coffee|drank coffee|will drink coffee|has drunk coffee|toma café|tomó café|tomará café|ha tomado café',
    sing: 'sings|sang|will sing|has sung|canta|cantó|cantará|ha cantado',
    sleep: 'sleeps on the bench|slept on the bench|will sleep on the bench|has slept on the bench|duerme en la banca|durmió en la banca|dormirá en la banca|ha dormido en la banca',
    sit: 'sits on the bench|sat on the bench|will sit on the bench|has sat on the bench|se sienta en la banca|se sentó en la banca|se sentará en la banca|se ha sentado en la banca',
    phone: 'talks on the phone|talked on the phone|will talk on the phone|has talked on the phone|habla por teléfono|habló por teléfono|hablará por teléfono|ha hablado por teléfono',
    play: 'plays with a ball|played with a ball|will play with a ball|has played with a ball|juega con una pelota|jugó con una pelota|jugará con una pelota|ha jugado con una pelota',
    water: 'waters the flowers|watered the flowers|will water the flowers|has watered the flowers|riega las flores|regó las flores|regará las flores|ha regado las flores',
    paint: 'paints a picture|painted a picture|will paint a picture|has painted a picture|pinta un cuadro|pintó un cuadro|pintará un cuadro|ha pintado un cuadro',
    kite: 'flies a kite|flew a kite|will fly a kite|has flown a kite|vuela una cometa|voló una cometa|volará una cometa|ha volado una cometa',
    sweep: 'sweeps the sidewalk|swept the sidewalk|will sweep the sidewalk|has swept the sidewalk|barre la acera|barrió la acera|barrerá la acera|ha barrido la acera',
    photo: 'takes a photo|took a photo|will take a photo|has taken a photo|toma una foto|tomó una foto|tomará una foto|ha tomado una foto',
    listen: 'listens to music|listened to music|will listen to music|has listened to music|escucha música|escuchó música|escuchará música|ha escuchado música',
    stretch: 'stretches|stretched|will stretch|has stretched|se estira|se estiró|se estirará|se ha estirado',
    fish: 'fishes in the pond|fished in the pond|will fish in the pond|has fished in the pond|pesca en el estanque|pescó en el estanque|pescará en el estanque|ha pescado en el estanque',
    feed: 'feeds the ducks|fed the ducks|will feed the ducks|has fed the ducks|alimenta a los patos|alimentó a los patos|alimentará a los patos|ha alimentado a los patos',
    wait: 'waits for the bus|waited for the bus|will wait for the bus|has waited for the bus|espera el autobús|esperó el autobús|esperará el autobús|ha esperado el autobús',
    carry: 'carries a bag|carried a bag|will carry a bag|has carried a bag|carga una bolsa|cargó una bolsa|cargará una bolsa|ha cargado una bolsa',
    soccer: 'plays soccer|played soccer|will play soccer|has played soccer|juega fútbol|jugó fútbol|jugará fútbol|ha jugado fútbol',
    shop: 'buys fruit|bought fruit|will buy fruit|has bought fruit|compra fruta|compró fruta|comprará fruta|ha comprado fruta'
  };
  const TENSE_NAMES = {
    cont: ['Present continuous', 'Presente continuo'], simple: ['Present simple', 'Presente simple'],
    past: ['Past simple', 'Pasado simple'], fut: ['Future (will)', 'Futuro (will)'], perf: ['Present perfect', 'Presente perfecto']
  };

  /* ---------- Frases de conversación (lo que dicen los vecinos) ---------- */
  const PHRASES = [
    ['Hello! How are you?', '¡Hola! ¿Cómo estás?'], ["I'm fine, thank you. And you?", 'Estoy bien, gracias. ¿Y tú?'],
    ['Nice to meet you!', '¡Mucho gusto!'], ["What's your name?", '¿Cómo te llamas?'], ['Where are you from?', '¿De dónde eres?'],
    ['I live in this town.', 'Vivo en este pueblo.'], ['Have a nice day!', '¡Que tengas un buen día!'], ['See you later!', '¡Nos vemos luego!'],
    ['Can you help me, please?', '¿Me puedes ayudar, por favor?'], ['Excuse me, where is the bank?', 'Disculpa, ¿dónde está el banco?'],
    ["It's next to the park.", 'Está al lado del parque.'], ['I like your shirt!', '¡Me gusta tu camisa!'], ['What time is it?', '¿Qué hora es?'],
    ["I'm hungry. Let's eat!", 'Tengo hambre. ¡Vamos a comer!'], ['I love this town.', 'Me encanta este pueblo.'], ["What's the weather like?", '¿Cómo está el clima?'],
    ['Do you speak English?', '¿Hablas inglés?'], ['Yes, a little.', 'Sí, un poco.'], ["I don't understand.", 'No entiendo.'],
    ['Can you repeat that, please?', '¿Puedes repetir eso, por favor?'], ['How old are you?', '¿Cuántos años tienes?'], ["I'm twenty years old.", 'Tengo veinte años.'],
    ['What do you do?', '¿A qué te dedicas?'], ["I'm a teacher.", 'Soy profesor.'], ['Do you like music?', '¿Te gusta la música?'],
    ['My favorite color is blue.', 'Mi color favorito es el azul.'], ["Let's go to the park!", '¡Vamos al parque!'], ['How much is this?', '¿Cuánto cuesta esto?'],
    ['It costs five dollars.', 'Cuesta cinco dólares.'], ['Good luck!', '¡Buena suerte!'], ['Congratulations!', '¡Felicitaciones!'],
    ["I'm sorry, I'm late.", 'Lo siento, llegué tarde.'], ["Don't worry!", '¡No te preocupes!'], ['Are you busy?', '¿Estás ocupado?'],
    ['I have a dog and a cat.', 'Tengo un perro y un gato.'], ['What are you doing?', '¿Qué estás haciendo?'], ["I'm learning English!", '¡Estoy aprendiendo inglés!'],
    ['You speak very well!', '¡Hablas muy bien!'], ['Take care!', '¡Cuídate!'], ['Welcome to our neighborhood!', '¡Bienvenido a nuestro barrio!']
  ];

  const OPPOSITES = [['big', 'small'], ['hot', 'cold'], ['happy', 'sad'], ['fast', 'slow'], ['new', 'old'], ['tall', 'short'], ['good', 'bad'],
    ['clean', 'dirty'], ['easy', 'difficult'], ['full', 'empty'], ['expensive', 'cheap'], ['rich', 'poor'], ['heavy', 'light'], ['quiet', 'loud'],
    ['beautiful', 'ugly'], ['wet', 'dry'], ['young', 'old'], ['strong', 'weak'], ['early', 'late'], ['safe', 'dangerous'], ['same', 'different'],
    ['high', 'low'], ['near', 'far'], ['right', 'wrong'], ['open', 'closed'], ['dark', 'light'], ['long', 'short'], ['sick', 'healthy']];

  /* ---------- La hora y el clima ---------- */
  const HOURS_EN = ['twelve', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven'];
  const HOURS_ES = ['doce', 'una', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once'];
  function timeWords(h, m) {
    const q = Math.round(m / 15) % 4, hh = (q === 3 || Math.round(m / 15) === 4 ? h + 1 : h) % 24;
    const en12 = HOURS_EN[hh % 12], es12 = HOURS_ES[hh % 12];
    const esArt = hh % 12 === 1 ? 'Es la' : 'Son las';
    const part = hh < 12 ? ['in the morning', 'de la mañana'] : hh < 18 ? ['in the afternoon', 'de la tarde'] : ['at night', 'de la noche'];
    if ((Math.round(m / 15) === 4 || q === 0) && hh === 12) return { en: "It's noon.", es: 'Es mediodía.' };
    if ((Math.round(m / 15) === 4 || q === 0) && hh === 0) return { en: "It's midnight.", es: 'Es medianoche.' };
    if (Math.round(m / 15) === 4 || q === 0) return { en: `It's ${en12} o'clock ${part[0]}.`, es: `${esArt} ${es12} en punto ${part[1]}.` };
    if (q === 1) return { en: `It's a quarter past ${en12}.`, es: `${esArt} ${es12} y cuarto.` };
    if (q === 2) return { en: `It's half past ${en12}.`, es: `${esArt} ${es12} y media.` };
    return { en: `It's a quarter to ${en12}.`, es: `${esArt} ${es12} menos cuarto.` };
  }
  function greeting(h) {
    if (h >= 5 && h < 12) return ['Good morning!', '¡Buenos días!', 'morning', 'mañana'];
    if (h >= 12 && h < 18) return ['Good afternoon!', '¡Buenas tardes!', 'afternoon', 'tarde'];
    if (h >= 18 && h < 21) return ['Good evening!', '¡Buenas noches!', 'evening', 'noche'];
    return ['Good night!', '¡Buenas noches!', 'night', 'noche'];
  }
  const WEATHER = {
    sunny: { en: "It's sunny. Wear sunglasses!", es: 'Hace sol. ¡Usa gafas de sol!', word: 'sunny', wordEs: 'soleado', icon: '☀️' },
    cloudy: { en: "It's cloudy today.", es: 'Hoy está nublado.', word: 'cloudy', wordEs: 'nublado', icon: '☁️' },
    rainy: { en: "It's raining. Take an umbrella!", es: 'Está lloviendo. ¡Lleva un paraguas!', word: 'raining', wordEs: 'lloviendo', icon: '🌧️' },
    windy: { en: "It's windy. Hold your hat!", es: 'Hace viento. ¡Sujeta tu sombrero!', word: 'windy', wordEs: 'con viento', icon: '💨' }
  };

  /* ---------- Adjetivos ---------- */
  const COLORS = {
    red: { en: 'red', m: 'rojo', f: 'roja' },
    blue: { en: 'blue', m: 'azul', f: 'azul' },
    green: { en: 'green', m: 'verde', f: 'verde' },
    yellow: { en: 'yellow', m: 'amarillo', f: 'amarilla' },
    orange: { en: 'orange', m: 'naranja', f: 'naranja', inv: true },
    purple: { en: 'purple', m: 'morado', f: 'morada' },
    pink: { en: 'pink', m: 'rosado', f: 'rosada' },
    brown: { en: 'brown', m: 'marrón', f: 'marrón' },
    black: { en: 'black', m: 'negro', f: 'negra' },
    white: { en: 'white', m: 'blanco', f: 'blanca' },
    gray: { en: 'gray', m: 'gris', f: 'gris' },
    beige: { en: 'beige', m: 'beige', f: 'beige', inv: true }
  };
  const ADJ = {
    big: { en: 'big', m: 'grande', f: 'grande' },
    small: { en: 'small', m: 'pequeño', f: 'pequeña' },
    tall: { en: 'tall', m: 'alto', f: 'alta' },
    short: { en: 'short', m: 'bajo', f: 'baja' },
    long: { en: 'long', m: 'largo', f: 'larga' },
    shortHair: { en: 'short', m: 'corto', f: 'corta' },
    curly: { en: 'curly', m: 'rizado', f: 'rizada' },
    fast: { en: 'fast', m: 'rápido', f: 'rápida' },
    slow: { en: 'slow', m: 'lento', f: 'lenta' },
    happy: { en: 'happy', m: 'feliz', f: 'feliz', estar: true },
    sad: { en: 'sad', m: 'triste', f: 'triste', estar: true },
    bright: { en: 'bright', m: 'brillante', f: 'brillante' },
    on: { en: 'on', m: 'encendido', f: 'encendida', estar: true },
    off: { en: 'off', m: 'apagado', f: 'apagada', estar: true },
    brick: { en: 'made of brick', m: 'de ladrillo', f: 'de ladrillo' },
    wooden: { en: 'made of wood', m: 'de madera', f: 'de madera' },
    flat: { en: 'flat', m: 'plano', f: 'plana' },
    open: { en: 'open', m: 'abierto', f: 'abierta', estar: true },
    closed: { en: 'closed', m: 'cerrado', f: 'cerrada', estar: true },
    beautiful: { en: 'beautiful', m: 'bonito', f: 'bonita' },
    old: { en: 'old', m: 'viejo', f: 'vieja' },
    new: { en: 'new', m: 'nuevo', f: 'nueva' },
    hot: { en: 'hot', m: 'caliente', f: 'caliente' },
    cold: { en: 'cold', m: 'frío', f: 'fría' },
    sleepy: { en: 'sleepy', m: 'dormilón', f: 'dormilona' },
    sunny: { en: 'sunny', m: 'soleado', f: 'soleada' }
  };

  /* ---------- Preposiciones (es: forma española; de: lleva «de» + artículo) ---------- */
  const PREP = {
    on: { en: 'on', es: 'sobre', de: false },
    onSurface: { en: 'on', es: 'en', de: false },
    in: { en: 'in', es: 'en', de: false },
    under: { en: 'under', es: 'debajo', de: true },
    nextTo: { en: 'next to', es: 'al lado', de: true },
    inFrontOf: { en: 'in front of', es: 'delante', de: true },
    behind: { en: 'behind', es: 'detrás', de: true },
    between: { en: 'between', es: 'entre', de: false },
    above: { en: 'above', es: 'encima', de: true },
    near: { en: 'near', es: 'cerca', de: true },
    across: { en: 'across from', es: 'enfrente', de: true }
  };

  /* ---------- Verbos y acciones (es: predicado completo después del nombre) ---------- */
  const ADV = {
    slowly: { en: 'slowly', es: 'despacio', from: 'slow → slowly' },
    quickly: { en: 'quickly', es: 'rápidamente', from: 'quick → quickly' },
    fast: { en: 'fast', es: 'rápido', from: 'fast → fast (irregular)' },
    happily: { en: 'happily', es: 'alegremente', from: 'happy → happily' },
    quietly: { en: 'quietly', es: 'en silencio', from: 'quiet → quietly' },
    loudly: { en: 'loudly', es: 'en voz alta', from: 'loud → loudly' },
    carefully: { en: 'carefully', es: 'con cuidado', from: 'careful → carefully' },
    patiently: { en: 'patiently', es: 'con paciencia', from: 'patient → patiently' },
    peacefully: { en: 'peacefully', es: 'tranquilamente', from: 'peaceful → peacefully' },
    calmly: { en: 'calmly', es: 'con calma', from: 'calm → calmly' },
    gently: { en: 'gently', es: 'suavemente', from: 'gentle → gently' },
    well: { en: 'well', es: 'bien', from: 'good → well (irregular)' },
    high: { en: 'high', es: 'muy alto', from: 'high → high (irregular)' },
    energetically: { en: 'energetically', es: 'con energía', from: 'energetic → energetically' }
  };

  // pose: pose del humano; move: se desplaza; prop: objeto que se dibuja; spot: dónde ocurre
  const ACTIONS = {
    walk: { verb: ['walk', 'walking', 'walked', 'caminar'], en: 'walking', es: 'está caminando', move: 1, advs: ['slowly', 'quickly'] },
    run: { verb: ['run', 'running', 'ran', 'correr'], en: 'running', es: 'está corriendo', move: 1, advs: ['fast', 'quickly'] },
    walkDog: { verb: ['walk', 'walking', 'walked', 'pasear'], en: 'walking the dog', es: 'está paseando al perro', move: 1, advs: ['happily', 'slowly'], obj: 'dog' },
    ride: { verb: ['ride', 'riding', 'rode', 'montar'], en: 'riding a bicycle', es: 'está montando en bicicleta', move: 1, advs: ['fast', 'carefully'], obj: 'bicycle' },
    jump: { verb: ['jump', 'jumping', 'jumped', 'saltar'], en: 'jumping', es: 'está saltando', pose: 'brazos arriba', advs: ['high', 'happily'] },
    dance: { verb: ['dance', 'dancing', 'danced', 'bailar'], en: 'dancing', es: 'está bailando', pose: 'brazos arriba', advs: ['happily', 'well'] },
    wave: { verb: ['wave', 'waving', 'waved', 'saludar'], en: 'waving', es: 'está saludando', pose: 'saludo', advs: ['happily'] },
    read: { verb: ['read', 'reading', 'read', 'leer'], en: 'reading a book', es: 'está leyendo un libro', pose: 'de pie', advs: ['quietly', 'calmly'], obj: 'book' },
    eat: { verb: ['eat', 'eating', 'ate', 'comer'], en: 'eating an ice cream', es: 'está comiendo un helado', pose: 'de pie', advs: ['slowly', 'happily'], obj: 'iceCream' },
    drink: { verb: ['drink', 'drinking', 'drank', 'beber'], en: 'drinking coffee', es: 'está tomando café', pose: 'de pie', advs: ['slowly', 'calmly'], obj: 'coffee' },
    sing: { verb: ['sing', 'singing', 'sang', 'cantar'], en: 'singing', es: 'está cantando', pose: 'de pie', advs: ['loudly', 'well'] },
    sleep: { verb: ['sleep', 'sleeping', 'slept', 'dormir'], en: 'sleeping on the bench', es: 'está durmiendo en la banca', pose: 'de pie', advs: ['peacefully', 'quietly'], spot: 'bench' },
    sit: { verb: ['sit', 'sitting', 'sat', 'sentarse'], en: 'sitting on the bench', es: 'está sentado/a en la banca', pose: 'de pie', advs: ['calmly', 'quietly'], spot: 'bench' },
    phone: { verb: ['talk', 'talking', 'talked', 'hablar'], en: 'talking on the phone', es: 'está hablando por teléfono', pose: 'de pie', advs: ['loudly', 'quietly'], obj: 'phone' },
    play: { verb: ['play', 'playing', 'played', 'jugar'], en: 'playing with a ball', es: 'está jugando con una pelota', pose: 'manos en cintura', advs: ['happily', 'energetically'], obj: 'ball' },
    water: { verb: ['water', 'watering', 'watered', 'regar'], en: 'watering the flowers', es: 'está regando las flores', pose: 'de pie', advs: ['carefully', 'gently'], obj: 'wateringCan' },
    paint: { verb: ['paint', 'painting', 'painted', 'pintar'], en: 'painting a picture', es: 'está pintando un cuadro', pose: 'de pie', advs: ['carefully', 'well'], obj: 'painting' },
    kite: { verb: ['fly', 'flying', 'flew', 'volar'], en: 'flying a kite', es: 'está volando una cometa', pose: 'saludo', advs: ['happily', 'high'], obj: 'kite' },
    sweep: { verb: ['sweep', 'sweeping', 'swept', 'barrer'], en: 'sweeping the sidewalk', es: 'está barriendo la acera', pose: 'de pie', advs: ['carefully', 'quickly'], obj: 'broom' },
    photo: { verb: ['take', 'taking', 'took', 'tomar'], en: 'taking a photo', es: 'está tomando una foto', pose: 'de pie', advs: ['carefully'], obj: 'camera' },
    listen: { verb: ['listen', 'listening', 'listened', 'escuchar'], en: 'listening to music', es: 'está escuchando música', pose: 'de pie', advs: ['happily', 'calmly'], obj: 'music' },
    stretch: { verb: ['stretch', 'stretching', 'stretched', 'estirarse'], en: 'stretching', es: 'se está estirando', pose: 'brazos arriba', advs: ['slowly', 'carefully'] },
    fish: { verb: ['fish', 'fishing', 'fished', 'pescar'], en: 'fishing in the pond', es: 'está pescando en el estanque', pose: 'de pie', advs: ['patiently', 'quietly'], obj: 'fishingRod', spot: 'pond' },
    feed: { verb: ['feed', 'feeding', 'fed', 'alimentar'], en: 'feeding the ducks', es: 'está alimentando a los patos', pose: 'de pie', advs: ['gently', 'happily'], spot: 'pond' },
    wait: { verb: ['wait', 'waiting', 'waited', 'esperar'], en: 'waiting for the bus', es: 'está esperando el autobús', pose: 'manos en cintura', advs: ['patiently'], spot: 'busStop' },
    carry: { verb: ['carry', 'carrying', 'carried', 'cargar'], en: 'carrying a bag', es: 'está cargando una bolsa', move: 1, advs: ['carefully', 'slowly'], obj: 'bag' },
    soccer: { verb: ['play', 'playing', 'played', 'jugar'], en: 'playing soccer', es: 'está jugando fútbol', pose: 'caminando', advs: ['energetically', 'well'] },
    shop: { verb: ['buy', 'buying', 'bought', 'comprar'], en: 'buying fruit', es: 'está comprando fruta', pose: 'de pie', advs: ['happily', 'carefully'], obj: 'bag' }
  };

  const NAMES = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Casey', 'Riley', 'Jamie', 'Morgan', 'Chris', 'Robin', 'Kim', 'Lee',
    'Max', 'Charlie', 'Drew', 'Jesse', 'Quinn', 'Avery', 'Rowan', 'Skyler', 'Emery', 'Parker', 'Reese', 'Sasha', 'Noa',
    'Dani', 'Ari', 'Remy', 'Jules', 'Blake'];

  const NUMBERS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
    'thirteen', 'fourteen', 'fifteen', 'sixteen'];
  const NUMEROS = ['cero', 'una', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce',
    'trece', 'catorce', 'quince', 'dieciséis'];

  /* ---------- Gramática ---------- */
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  function a(phrase) {
    if (/^(SUV|hour|honest)/.test(phrase)) return 'an ' + phrase;
    if (/^(uni|use|one|eu)/i.test(phrase)) return 'a ' + phrase;
    return (/^[aeiou]/i.test(phrase) ? 'an ' : 'a ') + phrase;
  }
  // «the X» o «a X» en inglés según el sustantivo
  const theEn = n => 'the ' + n.en;
  const aEn = n => n.the || n.pl ? theEn(n) : a(n.en);
  function el(n) { return n.pl ? (n.g === 'f' ? 'las' : 'los') : (n.g === 'f' || n.es === 'agua' ? (n.es === 'agua' ? 'el' : 'la') : 'el'); }
  function un(n) { return n.pl ? (n.g === 'f' ? 'unas' : 'unos') : n.g === 'f' ? 'una' : 'un'; }
  const elN = n => `${el(n)} ${n.es}`;
  const unN = n => n.the ? elN(n) : `${un(n)} ${n.es}`;
  function plural(w) {
    if (/ón$/.test(w)) return w.replace(/ón$/, 'ones');
    if (/[aeiouáéó]$/.test(w)) return w + 's';
    if (/z$/.test(w)) return w.replace(/z$/, 'ces');
    return w + 'es';
  }
  function adjEs(adj, n) {
    const base = n.g === 'f' ? adj.f : adj.m;
    return n.pl && !adj.inv && !/^de /.test(base) ? plural(base) : base;
  }
  // «de» + artículo con contracción (de el → del)
  function prepEs(prep, targetEs) {
    if (!prep.de) return `${prep.es} ${targetEs}`;
    return /^el /.test(targetEs) ? `${prep.es} del ${targetEs.slice(3)}` : `${prep.es} de ${targetEs}`;
  }
  const isVerb = (n, adj) => adj.estar ? (n.pl ? 'están' : 'está') : (n.pl ? 'son' : 'es');
  const beEn = n => n.pl ? 'are' : 'is';

  function colorName(hex) {
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
    const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
    let h = 0;
    if (d) {
      if (mx === r) h = 60 * (((g - b) / d) % 6);
      else if (mx === g) h = 60 * ((b - r) / d + 2);
      else h = 60 * ((r - g) / d + 4);
    }
    if (h < 0) h += 360;
    if (l > 0.9) return 'white';
    if (l < 0.16) return 'black';
    if (s < 0.18) return l > 0.75 ? 'white' : 'gray';
    if ((h >= 15 && h < 45 && l < 0.5) || ((h < 15 || h >= 345) && l < 0.4 && s < 0.6)) return 'brown';
    if (h >= 15 && h < 60 && l > 0.82) return 'beige';
    if (h < 12 || h >= 330) return l > 0.72 || (s < 0.35 && l > 0.55) ? 'pink' : 'red';
    if (h < 42) return 'orange';
    if (h < 68) return 'yellow';
    if (h < 172) return 'green';
    if (h < 255) return 'blue';
    if (h < 290) return 'purple';
    return 'pink';
  }

  /* ---------- Constructores de lecciones ---------- */
  // Cada lección: { cat, word, wordEs, en, es, extra, icon }
  const L = {
    noun(n, factEn, factEs) {
      if (n.pl) {
        return { cat: 'noun', word: n.en, wordEs: n.es, en: `These are ${n.en}.` + (factEn ? ' ' + factEn : ''),
          es: `${n.g === 'f' ? 'Estas' : 'Estos'} son ${n.es}.` + (factEs ? ' ' + factEs : ''), icon: n.icon };
      }
      const en = `This is ${aEn(n)}.` + (factEn ? ' ' + factEn : '');
      const es = `${n.the || n.pl ? (n.pl ? 'Estos son' : (n.g === 'f' ? 'Esta es' : 'Este es')) : 'Esto es'} ${unN(n)}.` + (factEs ? ' ' + factEs : '');
      return { cat: 'noun', word: n.en, wordEs: n.es, en, es, icon: n.icon };
    },
    theNoun(n, factEn, factEs) {
      return { cat: 'noun', word: n.en, wordEs: n.es, en: `This is the ${n.en}. ${factEn}`, es: `${n.g === 'f' ? 'Esta es' : 'Este es'} ${elN(n)}. ${factEs}`, icon: n.icon };
    },
    color(n, colorKey) {
      const c = COLORS[colorKey];
      if (n.pl) {
        return { cat: 'adj', word: c.en, wordEs: c.m, en: `The ${n.en} are ${c.en}.`, es: `${cap(elN(n))} son ${adjEs(c, n)}.`, icon: '🎨', extra: `color: ${c.en}` };
      }
      return { cat: 'adj', word: c.en, wordEs: c.m, en: `It is ${a(c.en + ' ' + n.en)}.`, es: `Es ${un(n)} ${n.es} ${adjEs(c, n)}.`, icon: '🎨', extra: `color: ${c.en}` };
    },
    adj(n, adjKey, subjEn, subjEs) {
      const adj = ADJ[adjKey];
      const sEn = subjEn || `The ${n.en}`, sEs = subjEs || cap(elN(n));
      return { cat: 'adj', word: adj.en, wordEs: adj.m, en: `${sEn} ${beEn(n)} ${adj.en}.`, es: `${sEs} ${isVerb(n, adj)} ${adjEs(adj, n)}.`, icon: '✨' };
    },
    number(n, count, thingN, subjEn, subjEs) {
      const numEn = NUMBERS[count] || String(count), numEs = count === 1 && thingN.g === 'm' ? 'un' : (NUMEROS[count] || String(count));
      const thingEn = count === 1 ? thingN.en.replace(/s$/, '') : thingN.en;
      const thingEs = count === 1 ? thingN.es.replace(/s$/, '') : thingN.es;
      return { cat: 'noun', word: numEn, wordEs: numEs, en: `${subjEn || 'The ' + n.en} has ${numEn} ${thingEn}.`,
        es: `${subjEs || cap(elN(n))} tiene ${numEs} ${thingEs}.`, icon: '🔢', extra: `number: ${count} = ${numEn}` };
    },
    prep(subjEn, subjEs, prepKey, target, beEnWord = 'is', beEsWord = 'está') {
      const p = PREP[prepKey];
      const tEn = target.the || (target.en.startsWith('the ') ? target.en : 'the ' + target.en);
      const tEs = target.esFull || elN(target);
      return { cat: 'prep', word: p.en, wordEs: p.es + (p.de ? ' de' : ''), en: `${subjEn} ${beEnWord} ${p.en} ${tEn}.`,
        es: `${subjEs} ${beEsWord} ${prepEs(p, tEs)}.`, icon: '📍' };
    },
    verb(name, act) {
      const [base, ing, past, inf] = act.verb;
      return { cat: 'verb', word: ing, wordEs: inf, en: `${name} is ${act.en}.`, es: `${name} ${act.es}.`, icon: '🏃',
        extra: `to ${base} · ${ing} · ${past}  (${inf})` };
    },
    adverb(name, act, advKey) {
      const adv = ADV[advKey];
      return { cat: 'adv', word: adv.en, wordEs: adv.es, en: `${name} is ${act.en} ${adv.en}.`, es: `${name} ${act.es} ${adv.es}.`, icon: '⚡', extra: adv.from };
    },
    tense(name, key, act, tense) {
      const t = TENSES[key].split('|');
      const [base, ing, past] = act.verb;
      const tn = TENSE_NAMES[tense];
      const forms = {
        cont: [`${name} is ${act.en} now.`, `${name} ${act.es} ahora.`, ing],
        simple: [`${name} ${t[0]} every day.`, `${name} ${t[4]} todos los días.`, t[0].split(' ')[0]],
        past: [`Yesterday, ${name} ${t[1]}.`, `Ayer, ${name} ${t[5]}.`, t[1].split(' ')[0]],
        fut: [`Tomorrow, ${name} ${t[2]}.`, `Mañana, ${name} ${t[6]}.`, 'will ' + t[2].split(' ')[1]],
        perf: [`${name} ${t[3]} today.`, `${name} ${t[7]} hoy.`, t[3].split(' ').slice(0, 2).join(' ')]
      }[tense];
      return { cat: 'verb', word: forms[2], wordEs: act.verb[3], en: forms[0], es: forms[1], icon: '⏳', tense: tn,
        extra: `${tn[0]} · ${tn[1]} — to ${base} · ${past} · ${ing}` };
    },
    free(cat, word, wordEs, en, es, icon, extra) {
      return { cat, word, wordEs, en, es, icon, extra };
    }
  };

  const CATS = {
    noun: { name: 'Vocabulary', es: 'Vocabulario', color: '#2e86de' },
    verb: { name: 'Verbs', es: 'Verbos', color: '#e67e22' },
    prep: { name: 'Prepositions', es: 'Preposiciones', color: '#8e44ad' },
    adj: { name: 'Adjectives', es: 'Adjetivos', color: '#27ae60' },
    adv: { name: 'Adverbs', es: 'Adverbios', color: '#c0392b' }
  };

  return { TENSES, TENSE_NAMES, PHRASES, OPPOSITES, timeWords, greeting, WEATHER, BUILDING_ZONE, N, BUILDINGS, COLORS, ADJ, PREP, ADV, ACTIONS, NAMES, NUMBERS, L, CATS, colorName, a, el, un, elN, unN, cap, adjEs, prepEs };
})();
