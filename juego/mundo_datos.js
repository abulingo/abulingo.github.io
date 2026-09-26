'use strict';

/* ============================================================================
   DATOS DEL MUNDO DE ENGLISH TOWN  ·  juego/mundo_datos.js
   ----------------------------------------------------------------------------
   · ACCIONES: lo que hacen las personas del pueblo; cada una representa un
     verbo de la lista (cook, write, climb, pay…).
   · ROLES: quién es cada persona (mother, doctor, tourist…).
   · ESCENAS: grupos de objetos, personas y estructuras que se colocan juntos
     en un lote (el puesto de frutas, la venta de garaje, el zoológico…).
     Las posiciones son relativas al ancla de la escena (centro de su base).
     Las palabras se escriben en inglés: cada una es única entre las 1000.
   · LOTES: cuántos lotes hay de cada tipo y qué escenas prefieren.
============================================================================ */
const MundoDatos = (() => {
  const I = Ingles;

  /* ======================================================================
     ACCIONES NUEVAS (se suman a Ingles.ACTIONS y Ingles.TENSES)
     [clave, verbo, en, es, pose, prop, advs, tiempos]
  ====================================================================== */
  const NUEVAS = [
    ['cook', 'cook', 'cooking on the grill', 'está cocinando en la parrilla', 'sostener', 'spatula', ['carefully', 'happily'], 'cooks on the grill|cooked on the grill|will cook on the grill|has cooked on the grill|cocina en la parrilla|cocinó en la parrilla|cocinará en la parrilla|ha cocinado en la parrilla'],
    ['write', 'write', 'writing a report', 'está escribiendo un informe', 'sostener', 'clipboard', ['carefully', 'quickly'], 'writes a report|wrote a report|will write a report|has written a report|escribe un informe|escribió un informe|escribirá un informe|ha escrito un informe'],
    ['draw', 'draw', 'drawing with chalk', 'está dibujando con tiza', 'de pie', 'chalk', ['happily', 'carefully'], 'draws with chalk|drew with chalk|will draw with chalk|has drawn with chalk|dibuja con tiza|dibujó con tiza|dibujará con tiza|ha dibujado con tiza'],
    ['study', 'study', 'studying for a test', 'está estudiando para un examen', 'sostener', 'bookOpen', ['quietly', 'calmly'], 'studies for a test|studied for a test|will study for a test|has studied for a test|estudia para un examen|estudió para un examen|estudiará para un examen|ha estudiado para un examen'],
    ['teach', 'teach', 'teaching English', 'está enseñando inglés', 'señalar', 'pointer', ['patiently', 'well'], 'teaches English|taught English|will teach English|has taught English|enseña inglés|enseñó inglés|enseñará inglés|ha enseñado inglés'],
    ['learn', 'learn', 'learning English', 'está aprendiendo inglés', 'sostener', 'notebook', ['quickly', 'happily'], 'learns English|learned English|will learn English|has learned English|aprende inglés|aprendió inglés|aprenderá inglés|ha aprendido inglés'],
    ['watch', 'watch', 'watching the race', 'está mirando la carrera', 'manos en cintura', null, ['happily', 'calmly'], 'watches the race|watched the race|will watch the race|has watched the race|mira la carrera|miró la carrera|mirará la carrera|ha mirado la carrera'],
    ['look', 'look', 'looking at the map', 'está mirando el mapa', 'señalar', null, ['carefully', 'calmly'], 'looks at the map|looked at the map|will look at the map|has looked at the map|mira el mapa|miró el mapa|mirará el mapa|ha mirado el mapa'],
    ['see', 'see', 'seeing birds with binoculars', 'está viendo pájaros con binoculares', 'sostener', 'binoculars', ['quietly', 'patiently'], 'sees birds|saw birds|will see birds|has seen birds|ve pájaros|vio pájaros|verá pájaros|ha visto pájaros'],
    ['swim', 'swim', 'swimming', 'está nadando', 'brazos arriba', 'water', ['fast', 'well'], 'swims|swam|will swim|has swum|nada|nadó|nadará|ha nadado'],
    ['climb', 'climb', 'climbing a tree', 'está trepando un árbol', 'brazos arriba', null, ['carefully', 'high'], 'climbs a tree|climbed a tree|will climb a tree|has climbed a tree|trepa un árbol|trepó un árbol|trepará un árbol|ha trepado un árbol'],
    ['throw', 'throw', 'throwing a ball', 'está lanzando una pelota', 'brazo arriba', 'ballUp', ['high', 'energetically'], 'throws a ball|threw a ball|will throw a ball|has thrown a ball|lanza una pelota|lanzó una pelota|lanzará una pelota|ha lanzado una pelota'],
    ['catch', 'catch', 'catching a ball', 'está atrapando una pelota', 'brazos arriba', 'ballCatch', ['well', 'quickly'], 'catches a ball|caught a ball|will catch a ball|has caught a ball|atrapa una pelota|atrapó una pelota|atrapará una pelota|ha atrapado una pelota'],
    ['push', 'push', 'pushing a stroller', 'está empujando un cochecito', 'sostener', null, ['gently', 'slowly'], 'pushes a stroller|pushed a stroller|will push a stroller|has pushed a stroller|empuja un cochecito|empujó un cochecito|empujará un cochecito|ha empujado un cochecito'],
    ['pull', 'pull', 'pulling a wagon', 'está jalando un carrito', 'señalar', null, ['slowly', 'happily'], 'pulls a wagon|pulled a wagon|will pull a wagon|has pulled a wagon|jala un carrito|jaló un carrito|jalará un carrito|ha jalado un carrito'],
    ['wash', 'wash', 'washing the car', 'está lavando el carro', 'señalar', 'sponge', ['carefully', 'happily'], 'washes the car|washed the car|will wash the car|has washed the car|lava el carro|lavó el carro|lavará el carro|ha lavado el carro'],
    ['fix', 'fix', 'fixing a bike', 'está arreglando una bicicleta', 'señalar', 'wrench', ['carefully', 'patiently'], 'fixes a bike|fixed a bike|will fix a bike|has fixed a bike|arregla una bicicleta|arregló una bicicleta|arreglará una bicicleta|ha arreglado una bicicleta'],
    ['build', 'build', 'building a wall', 'está construyendo un muro', 'sostener', 'brick', ['carefully', 'slowly'], 'builds a wall|built a wall|will build a wall|has built a wall|construye un muro|construyó un muro|construirá un muro|ha construido un muro'],
    ['buildSand', 'build', 'building a sandcastle', 'está construyendo un castillo de arena', 'sostener', 'shovel', ['happily', 'carefully'], 'builds a sandcastle|built a sandcastle|will build a sandcastle|has built a sandcastle|construye un castillo de arena|construyó un castillo de arena|construirá un castillo de arena|ha construido un castillo de arena'],
    ['cut', 'cut', 'cutting flowers', 'está cortando flores', 'sostener', 'scissors', ['carefully', 'gently'], 'cuts flowers|cut flowers|will cut flowers|has cut flowers|corta flores|cortó flores|cortará flores|ha cortado flores'],
    ['open', 'open', 'opening a gift', 'está abriendo un regalo', 'sostener', 'gift', ['happily', 'quickly'], 'opens a gift|opened a gift|will open a gift|has opened a gift|abre un regalo|abrió un regalo|abrirá un regalo|ha abierto un regalo'],
    ['give', 'give', 'giving a gift', 'está dando un regalo', 'señalar', 'giftHand', ['happily', 'gently'], 'gives a gift|gave a gift|will give a gift|has given a gift|da un regalo|dio un regalo|dará un regalo|ha dado un regalo'],
    ['hold', 'hold', 'holding balloons', 'está sosteniendo globos', 'brazo arriba', 'balloons', ['carefully', 'happily'], 'holds balloons|held balloons|will hold balloons|has held balloons|sostiene globos|sostuvo globos|sostendrá globos|ha sostenido globos'],
    ['hug', 'hug', 'hugging a friend', 'está abrazando a un amigo', 'sostener', 'heart', ['happily', 'gently'], 'hugs a friend|hugged a friend|will hug a friend|has hugged a friend|abraza a un amigo|abrazó a un amigo|abrazará a un amigo|ha abrazado a un amigo'],
    ['laugh', 'laugh', 'laughing at a joke', 'se está riendo de un chiste', 'manos en cintura', 'haha', ['loudly', 'happily'], 'laughs at a joke|laughed at a joke|will laugh at a joke|has laughed at a joke|se ríe de un chiste|se rió de un chiste|se reirá de un chiste|se ha reído de un chiste'],
    ['cry', 'cry', 'crying', 'está llorando', 'de pie', 'tears', ['loudly', 'quietly'], 'cries|cried|will cry|has cried|llora|lloró|llorará|ha llorado'],
    ['smile', 'smile', 'smiling', 'está sonriendo', 'saludo', 'sparkle', ['happily', 'well'], 'smiles|smiled|will smile|has smiled|sonríe|sonrió|sonreirá|ha sonreído'],
    ['sell', 'sell', 'selling food', 'está vendiendo comida', 'señalar', null, ['happily', 'loudly'], 'sells food|sold food|will sell food|has sold food|vende comida|vendió comida|venderá comida|ha vendido comida'],
    ['pay', 'pay', 'paying for food', 'está pagando la comida', 'señalar', 'money', ['quickly', 'happily'], 'pays for food|paid for food|will pay for food|has paid for food|paga la comida|pagó la comida|pagará la comida|ha pagado la comida'],
    ['send', 'send', 'sending a letter', 'está enviando una carta', 'señalar', 'letter', ['carefully', 'happily'], 'sends a letter|sent a letter|will send a letter|has sent a letter|envía una carta|envió una carta|enviará una carta|ha enviado una carta'],
    ['knock', 'knock', 'knocking on the door', 'está tocando la puerta', 'brazo arriba', null, ['loudly', 'quietly'], 'knocks on the door|knocked on the door|will knock on the door|has knocked on the door|toca la puerta|tocó la puerta|tocará la puerta|ha tocado la puerta'],
    ['visit', 'visit', 'visiting a friend', 'está visitando a un amigo', 'sostener', 'bouquet', ['happily'], 'visits a friend|visited a friend|will visit a friend|has visited a friend|visita a un amigo|visitó a un amigo|visitará a un amigo|ha visitado a un amigo'],
    ['meet', 'meet', 'meeting a new colleague', 'está conociendo a un nuevo colega', 'señalar', null, ['happily', 'calmly'], 'meets a new colleague|met a new colleague|will meet a new colleague|has met a new colleague|conoce a un nuevo colega|conoció a un nuevo colega|conocerá a un nuevo colega|ha conocido a un nuevo colega'],
    ['travel', 'travel', 'traveling with a suitcase', 'está viajando con una maleta', 'de pie', 'suitcase', ['happily', 'calmly'], 'travels with a suitcase|traveled with a suitcase|will travel with a suitcase|has traveled with a suitcase|viaja con una maleta|viajó con una maleta|viajará con una maleta|ha viajado con una maleta'],
    ['arrive', 'arrive', 'arriving at the hotel', 'está llegando al hotel', 'saludo', 'suitcase', ['happily', 'quickly'], 'arrives at the hotel|arrived at the hotel|will arrive at the hotel|has arrived at the hotel|llega al hotel|llegó al hotel|llegará al hotel|ha llegado al hotel'],
    ['practice', 'practice', 'practicing the guitar', 'está practicando la guitarra', 'sostener', 'guitar', ['patiently', 'well'], 'practices the guitar|practiced the guitar|will practice the guitar|has practiced the guitar|practica la guitarra|practicó la guitarra|practicará la guitarra|ha practicado la guitarra'],
    ['help', 'help', 'helping a patient', 'está ayudando a un paciente', 'señalar', 'stethoscope', ['patiently', 'carefully'], 'helps a patient|helped a patient|will help a patient|has helped a patient|ayuda a un paciente|ayudó a un paciente|ayudará a un paciente|ha ayudado a un paciente'],
    ['show', 'show', 'showing the way', 'está mostrando el camino', 'señalar', null, ['patiently', 'calmly'], 'shows the way|showed the way|will show the way|has shown the way|muestra el camino|mostró el camino|mostrará el camino|ha mostrado el camino'],
    ['explain', 'explain', 'explaining the lesson', 'está explicando la lección', 'señalar', 'pointer', ['patiently', 'well'], 'explains the lesson|explained the lesson|will explain the lesson|has explained the lesson|explica la lección|explicó la lección|explicará la lección|ha explicado la lección'],
    ['ask', 'ask', 'asking for directions', 'está pidiendo indicaciones', 'señalar', 'mapHeld', ['politely', 'quietly'], 'asks for directions|asked for directions|will ask for directions|has asked for directions|pide indicaciones|pidió indicaciones|pedirá indicaciones|ha pedido indicaciones'],
    ['tell', 'tell', 'telling a story', 'está contando un cuento', 'sostener', 'bookOpen', ['happily', 'loudly'], 'tells a story|told a story|will tell a story|has told a story|cuenta un cuento|contó un cuento|contará un cuento|ha contado un cuento'],
    ['talk', 'talk', 'talking with a friend', 'está hablando con un amigo', 'manos en cintura', 'speech', ['happily', 'quietly'], 'talks with a friend|talked with a friend|will talk with a friend|has talked with a friend|habla con un amigo|habló con un amigo|hablará con un amigo|ha hablado con un amigo'],
    ['speak', 'speak', 'speaking into the microphone', 'está hablando por el micrófono', 'sostener', 'mic', ['loudly', 'well'], 'speaks into the microphone|spoke into the microphone|will speak into the microphone|has spoken into the microphone|habla por el micrófono|habló por el micrófono|hablará por el micrófono|ha hablado por el micrófono'],
    ['rest', 'rest', 'resting in a hammock', 'está descansando en una hamaca', 'de pie', null, ['peacefully', 'quietly'], 'rests in a hammock|rested in a hammock|will rest in a hammock|has rested in a hammock|descansa en una hamaca|descansó en una hamaca|descansará en una hamaca|ha descansado en una hamaca'],
    ['relax', 'relax', 'relaxing on the beach', 'se está relajando en la playa', 'de pie', null, ['peacefully', 'calmly'], 'relaxes on the beach|relaxed on the beach|will relax on the beach|has relaxed on the beach|se relaja en la playa|se relajó en la playa|se relajará en la playa|se ha relajado en la playa'],
    ['enjoy', 'enjoy', 'enjoying the concert', 'está disfrutando del concierto', 'brazos arriba', null, ['happily', 'energetically'], 'enjoys the concert|enjoyed the concert|will enjoy the concert|has enjoyed the concert|disfruta del concierto|disfrutó del concierto|disfrutará del concierto|ha disfrutado del concierto'],
    ['share', 'share', 'sharing a sandwich', 'está compartiendo un sándwich', 'señalar', 'sandwich', ['happily', 'gently'], 'shares a sandwich|shared a sandwich|will share a sandwich|has shared a sandwich|comparte un sándwich|compartió un sándwich|compartirá un sándwich|ha compartido un sándwich'],
    ['grow', 'grow', 'growing vegetables', 'está cultivando verduras', 'sostener', 'shovel', ['patiently', 'carefully'], 'grows vegetables|grew vegetables|will grow vegetables|has grown vegetables|cultiva verduras|cultivó verduras|cultivará verduras|ha cultivado verduras'],
    ['choose', 'choose', 'choosing a shirt', 'está eligiendo una camisa', 'señalar', null, ['carefully', 'slowly'], 'chooses a shirt|chose a shirt|will choose a shirt|has chosen a shirt|elige una camisa|eligió una camisa|elegirá una camisa|ha elegido una camisa'],
    ['touch', 'touch', 'touching a rabbit', 'está tocando un conejo', 'señalar', null, ['gently', 'carefully'], 'touches a rabbit|touched a rabbit|will touch a rabbit|has touched a rabbit|toca un conejo|tocó un conejo|tocará un conejo|ha tocado un conejo'],
    ['stand', 'stand', 'standing in line', 'está haciendo fila', 'de pie', null, ['patiently', 'quietly'], 'stands in line|stood in line|will stand in line|has stood in line|hace fila|hizo fila|hará fila|ha hecho fila'],
    ['win', 'win', 'winning the race', 'está ganando la carrera', 'brazos arriba', null, ['happily', 'fast'], 'wins the race|won the race|will win the race|has won the race|gana la carrera|ganó la carrera|ganará la carrera|ha ganado la carrera'],
    ['finish', 'finish', 'finishing the race', 'está terminando la carrera', 'brazos arriba', null, ['fast', 'happily'], 'finishes the race|finished the race|will finish the race|has finished the race|termina la carrera|terminó la carrera|terminará la carrera|ha terminado la carrera'],
    ['start', 'start', 'starting the race', 'está dando la salida de la carrera', 'brazo arriba', 'flag', ['loudly', 'energetically'], 'starts the race|started the race|will start the race|has started the race|da la salida|dio la salida|dará la salida|ha dado la salida'],
    ['stop', 'stop', 'stopping the cars', 'está deteniendo los carros', 'brazo arriba', 'stopSign', ['carefully', 'calmly'], 'stops the cars|stopped the cars|will stop the cars|has stopped the cars|detiene los carros|detuvo los carros|detendrá los carros|ha detenido los carros'],
    ['think', 'think', 'thinking about the next move', 'está pensando en la próxima jugada', 'sostener', 'thought', ['quietly', 'patiently'], 'thinks about the next move|thought about the next move|will think about the next move|has thought about the next move|piensa en la próxima jugada|pensó en la próxima jugada|pensará en la próxima jugada|ha pensado en la próxima jugada'],
    ['playChess', 'play', 'playing chess', 'está jugando ajedrez', 'sostener', null, ['quietly', 'well'], 'plays chess|played chess|will play chess|has played chess|juega ajedrez|jugó ajedrez|jugará ajedrez|ha jugado ajedrez'],
    ['use', 'use', 'using a computer', 'está usando una computadora', 'sostener', 'laptop', ['quickly', 'well'], 'uses a computer|used a computer|will use a computer|has used a computer|usa una computadora|usó una computadora|usará una computadora|ha usado una computadora'],
    ['work', 'work', 'working at the office', 'está trabajando en la oficina', 'sostener', 'clipboard', ['quickly', 'well'], 'works at the office|worked at the office|will work at the office|has worked at the office|trabaja en la oficina|trabajó en la oficina|trabajará en la oficina|ha trabajado en la oficina'],
    ['make', 'make', 'making sandwiches', 'está preparando sándwiches', 'sostener', 'sandwich', ['quickly', 'happily'], 'makes sandwiches|made sandwiches|will make sandwiches|has made sandwiches|prepara sándwiches|preparó sándwiches|preparará sándwiches|ha preparado sándwiches'],
    ['bring', 'bring', 'bringing the food', 'está trayendo la comida', 'sostener', 'tray', ['carefully', 'quickly'], 'brings the food|brought the food|will bring the food|has brought the food|trae la comida|trajo la comida|traerá la comida|ha traído la comida'],
    ['invite', 'invite', 'inviting friends to the party', 'está invitando a sus amigos a la fiesta', 'señalar', 'card', ['happily'], 'invites friends|invited friends|will invite friends|has invited friends|invita a sus amigos|invitó a sus amigos|invitará a sus amigos|ha invitado a sus amigos'],
    ['borrow', 'borrow', 'borrowing a book', 'está pidiendo prestado un libro', 'sostener', 'bookClosed', ['quietly', 'happily'], 'borrows a book|borrowed a book|will borrow a book|has borrowed a book|pide prestado un libro|pidió prestado un libro|pedirá prestado un libro|ha pedido prestado un libro'],
    ['return', 'return', 'returning a book', 'está devolviendo un libro', 'señalar', 'bookHand', ['quickly', 'happily'], 'returns a book|returned a book|will return a book|has returned a book|devuelve un libro|devolvió un libro|devolverá un libro|ha devuelto un libro'],
    ['save', 'save', 'saving money', 'está ahorrando dinero', 'sostener', 'piggy', ['carefully', 'patiently'], 'saves money|saved money|will save money|has saved money|ahorra dinero|ahorró dinero|ahorrará dinero|ha ahorrado dinero'],
    ['spend', 'spend', 'spending money', 'está gastando dinero', 'de pie', 'bags', ['quickly', 'happily'], 'spends money|spent money|will spend money|has spent money|gasta dinero|gastó dinero|gastará dinero|ha gastado dinero'],
    ['put', 'put', 'putting books on the cart', 'está poniendo libros en el carrito', 'señalar', 'bookHand', ['carefully', 'quietly'], 'puts books on the cart|put books on the cart|will put books on the cart|has put books on the cart|pone libros en el carrito|puso libros en el carrito|pondrá libros en el carrito|ha puesto libros en el carrito'],
    ['try', 'try', 'trying on a hat', 'se está probando un sombrero', 'de pie', 'hatOn', ['happily', 'carefully'], 'tries on a hat|tried on a hat|will try on a hat|has tried on a hat|se prueba un sombrero|se probó un sombrero|se probará un sombrero|se ha probado un sombrero'],
    ['move', 'move', 'moving boxes', 'está moviendo cajas', 'sostener', 'box', ['carefully', 'slowly'], 'moves boxes|moved boxes|will move boxes|has moved boxes|mueve cajas|movió cajas|moverá cajas|ha movido cajas'],
    ['eatPizza', 'eat', 'eating pizza', 'está comiendo pizza', 'sostener', 'pizzaSlice', ['slowly', 'happily'], 'eats pizza|ate pizza|will eat pizza|has eaten pizza|come pizza|comió pizza|comerá pizza|ha comido pizza'],
    ['playVideo', 'play', 'playing a video game', 'está jugando videojuegos', 'sostener', 'console', ['quietly', 'happily'], 'plays video games|played video games|will play video games|has played video games|juega videojuegos|jugó videojuegos|jugará videojuegos|ha jugado videojuegos'],
    ['feedChickens', 'feed', 'feeding the chickens', 'está alimentando a las gallinas', 'señalar', 'seeds', ['gently', 'happily'], 'feeds the chickens|fed the chickens|will feed the chickens|has fed the chickens|alimenta a las gallinas|alimentó a las gallinas|alimentará a las gallinas|ha alimentado a las gallinas'],
    ['playDrums', 'play', 'playing the drums', 'está tocando la batería', 'brazos arriba', 'sticks', ['loudly', 'energetically'], 'plays the drums|played the drums|will play the drums|has played the drums|toca la batería|tocó la batería|tocará la batería|ha tocado la batería'],
    ['wait2', 'wait', 'waiting for a patient', 'está esperando a un paciente', 'manos en cintura', null, ['patiently'], 'waits for a patient|waited for a patient|will wait for a patient|has waited for a patient|espera a un paciente|esperó a un paciente|esperará a un paciente|ha esperado a un paciente']
  ];
  // Verbo (palabra de la lista) que enseña cada acción del juego original
  const VERBO_ORIGINAL = { walk: 'walk', run: 'run', walkDog: 'walk', ride: 'ride', jump: 'jump', dance: 'dance', wave: 'wave', read: 'read', eat: 'eat',
    drink: 'drink', sing: 'sing', sleep: 'sleep', sit: 'sit', phone: 'call', play: 'play', water: null, paint: 'paint', kite: 'fly', sweep: 'sweep',
    photo: 'take', listen: 'listen', stretch: null, fish: null, feed: 'feed', wait: 'wait', carry: 'carry', soccer: 'play', shop: 'buy' };

  function registrarAcciones() {
    I.ADV.politely = I.ADV.politely || { en: 'politely', es: 'con amabilidad', from: 'polite → politely' };
    const porEn = Object.fromEntries(PALABRAS.words.map(w => [w.en, w]));
    Object.entries(I.ACTIONS).forEach(([k, a]) => { a.verbo = VERBO_ORIGINAL[k] || null; });
    // En el original "phone" enseñaba «talk»; aquí enseña «call» (llamar por teléfono)
    I.ACTIONS.phone.en = 'calling a friend'; I.ACTIONS.phone.es = 'está llamando a un amigo'; I.ACTIONS.phone.verb = ['call', 'calling', 'called', 'llamar'];
    I.TENSES.phone = 'calls a friend|called a friend|will call a friend|has called a friend|llama a un amigo|llamó a un amigo|llamará a un amigo|ha llamado a un amigo';
    NUEVAS.forEach(([k, verbo, en, es, pose, prop, advs, tiempos]) => {
      const w = porEn[verbo];
      I.ACTIONS[k] = { verb: [verbo, w.ing, w.past, w.es.split(' / ')[0]], en, es, pose, prop, advs, verbo };
      I.TENSES[k] = tiempos;
    });
  }

  /* ======================================================================
     ROLES: sexo (m, f o n = cualquiera), español (m / f), edad y ropa
  ====================================================================== */
  const ROLES = {
    person: ['n', 'una persona', 'una persona'], man: ['m', 'un hombre', ''], woman: ['f', '', 'una mujer'],
    boy: ['m', 'un niño', '', 'niño'], girl: ['f', '', 'una niña', 'niño'], child: ['n', 'un niño', 'una niña', 'niño'], kid: ['n', 'un chico', 'una chica', 'niño'],
    adult: ['n', 'un adulto', 'una adulta'], mother: ['f', '', 'madre'], father: ['m', 'padre', ''], mom: ['f', '', 'mamá'], dad: ['m', 'papá', ''],
    brother: ['m', 'hermano', '', 'niño'], sister: ['f', '', 'hermana', 'niño'], son: ['m', 'hijo', '', 'niño'], daughter: ['f', '', 'hija', 'niño'],
    grandmother: ['f', '', 'abuela', 'mayor'], grandfather: ['m', 'abuelo', '', 'mayor'], aunt: ['f', '', 'tía'], uncle: ['m', 'tío', ''],
    cousin: ['n', 'primo', 'prima', 'joven'], husband: ['m', 'esposo', ''], wife: ['f', '', 'esposa'], friend: ['n', 'amigo', 'amiga'],
    neighbor: ['n', 'vecino', 'vecina'], guest: ['n', 'invitado', 'invitada'], doctor: ['n', 'médico', 'médica'], nurse: ['n', 'enfermero', 'enfermera'],
    teacher: ['n', 'profesor', 'profesora'], student: ['n', 'estudiante', 'estudiante', 'joven'], 'police officer': ['n', 'policía', 'policía'],
    firefighter: ['n', 'bombero', 'bombera'], farmer: ['n', 'granjero', 'granjera'], driver: ['n', 'conductor', 'conductora'], worker: ['n', 'trabajador', 'trabajadora'],
    artist: ['n', 'artista', 'artista'], singer: ['n', 'cantante', 'cantante'], dentist: ['n', 'dentista', 'dentista'], waiter: ['m', 'mesero', ''],
    boss: ['n', 'jefe', 'jefa'], pilot: ['n', 'piloto', 'piloto'], scientist: ['n', 'científico', 'científica'], manager: ['n', 'gerente', 'gerente'],
    tourist: ['n', 'turista', 'turista'], player: ['n', 'jugador', 'jugadora', 'joven'], winner: ['n', 'ganador', 'ganadora', 'joven']
  };
  // Ropa y accesorios que identifican cada oficio
  const ROPA = {
    doctor: { top: 'abrigo', topColor: '#f5f5f5', acc: 'stethoscope' }, nurse: { top: 'camisa', topColor: '#4dd0e1', bottom: 'pantalón', bottomColor: '#4dd0e1' },
    'police officer': { top: 'camisa', topColor: '#1f3a60', bottom: 'pantalón', bottomColor: '#1a237e', acc: 'policeCap' },
    firefighter: { top: 'abrigo', topColor: '#c62828', bottom: 'pantalón', bottomColor: '#37474f', acc: 'fireHelmet' },
    farmer: { top: 'camisa', topColor: '#6d8b3a', bottom: 'pantalón', bottomColor: '#3f6fb5', acc: 'strawHat' },
    worker: { top: 'camiseta', topColor: '#ff6d00', bottom: 'pantalón', bottomColor: '#3f6fb5', acc: 'hardHat' },
    waiter: { top: 'camisa', topColor: '#fafafa', bottom: 'pantalón', bottomColor: '#212121', acc: 'bowTie' },
    pilot: { top: 'abrigo', topColor: '#1a237e', bottom: 'pantalón', bottomColor: '#1a237e', acc: 'pilotCap' },
    scientist: { top: 'abrigo', topColor: '#fafafa', glasses: 'redondas' }, teacher: { top: 'suéter', glasses: 'cuadradas' },
    boss: { top: 'camisa', topColor: '#eceff1', bottom: 'pantalón', bottomColor: '#263238', acc: 'tie' }, manager: { top: 'abrigo', topColor: '#37474f', bottom: 'pantalón', bottomColor: '#263238', acc: 'tie' },
    dentist: { top: 'abrigo', topColor: '#e0f7fa' }, artist: { acc: 'beret' }, tourist: { acc: 'sunHat' },
    player: { top: 'camiseta', topColor: '#1565c0', bottom: 'shorts', bottomColor: '#fafafa' }, winner: { top: 'camiseta', topColor: '#1565c0', bottom: 'shorts', bottomColor: '#fafafa', acc: 'medal' },
    singer: { top: 'vestido', topColor: '#8e24aa' }, husband: { top: 'abrigo', topColor: '#212121', bottom: 'pantalón', bottomColor: '#212121', acc: 'bowTie' },
    wife: { top: 'vestido', topColor: '#fafafa', acc: 'veil' }
  };
  // Grupos: varias personas dibujadas juntas que enseñan una palabra
  const GRUPOS = {
    children: { n: 3, edad: 'niño', en: 'These are children. They are playing together.', es: 'Estos son niños. Están jugando juntos.' },
    parents: { n: 2, edad: 'adulto', parejaMF: true, en: 'These are parents. They are waiting for their kids.', es: 'Estos son padres. Esperan a sus hijos.' },
    grandparents: { n: 2, edad: 'mayor', parejaMF: true, en: 'These are grandparents. They are sitting on the bench.', es: 'Estos son abuelos. Están sentados en la banca.' },
    people: { n: 3, edad: 'adulto', en: 'Look at all the people!', es: '¡Mira a toda la gente!' },
    team: { n: 3, edad: 'joven', ropa: { top: 'camiseta', topColor: '#c62828', bottom: 'shorts', bottomColor: '#fafafa' }, en: 'This is our soccer team.', es: 'Este es nuestro equipo de fútbol.' },
    group: { n: 3, edad: 'adulto', ropa: { acc: 'sunHat' }, en: 'A group of tourists is visiting the museum.', es: 'Un grupo de turistas visita el museo.' },
    guest: { n: 2, edad: 'adulto', en: 'These are the wedding guests.', es: 'Estos son los invitados de la boda.' }
  };
  // Personas con un estado (enfermas) en vez de un oficio
  const ESTADOS = {
    headache: { prop: 'headHold', en: n => `${n} has a headache.`, es: n => `${n} tiene dolor de cabeza.` },
    fever: { prop: 'thermometer', en: n => `${n} has a fever.`, es: n => `${n} tiene fiebre.` },
    cough: { prop: 'coughHand', en: n => `${n} has a bad cough.`, es: n => `${n} tiene una tos fuerte.` },
    pain: { prop: 'sling', en: n => `${n} has pain in the arm.`, es: n => `${n} tiene dolor en el brazo.` }
  };

  /* ======================================================================
     ESCENAS
  ====================================================================== */
  const P = (rol, act, x, y = 0, dir = 1, extra = {}) => Object.assign({ rol, act, x, y, dir }, extra);
  const G = (grupo, act, x, y = 0, extra = {}) => Object.assign({ grupo, act, x, y }, extra);
  const X = (palabra, obj, x, y = 0, s = 1, estado) => ({ palabra, obj, x, y, s, estado });
  // Reparte objetos en fila, centrados en xc, con su base en y
  function fila(lista, y, xc = 0, gap = 6) {
    const anchos = lista.map(([p, o, s = 1]) => Obj.O[o].w * s);
    const total = anchos.reduce((a, b) => a + b, 0) + gap * (lista.length - 1);
    let x = xc - total / 2;
    return lista.map(([p, o, s = 1], i) => { const it = X(p, o, x + anchos[i] / 2, y, s); x += anchos[i] + gap; return it; });
  }
  const base = (dibujo, w, h, extra = {}) => Object.assign({ dibujo, w, h, x: 0, y: 0 }, extra);
  const puesto = (w, color, titulo, palabras = [], x = 0) => base(g => Obj.puesto(g, w, color, titulo), w, 174, { x, palabras, caja: [-w / 2, -174, w, 54], fondo: true });
  const mesa = (w, estilo, x = 0) => base(g => Obj.mesa(g, w, estilo), w, 52, { x });

  const ESCENAS = [];
  const E = (id, lotes, def) => { ESCENAS.push(Object.assign({ id, lotes }, def)); };

  // ---------------- Mercado ----------------
  E('fruitStall', ['market'], { bases: [puesto(280, '#e53935', 'FRUIT', ['fruit'])],
    items: [...fila([['apple', 'apple'], ['banana', 'banana'], ['grapes', 'grapes'], ['strawberry', 'strawberry'], ['lemon', 'lemon'], ['cherry', 'cherry'], ['pineapple', 'pineapple']], -48, 0, 2), X('watermelon', 'watermelon', -178, 0)],
    gente: [P('person', 'sell', 172, 0, -1), P('woman', 'shop', 240, 0, -1)] });
  E('vegStall', ['market'], { bases: [puesto(260, '#43a047', 'VEGETABLES', ['vegetable'])],
    items: [...fila([['potato', 'potato'], ['tomato', 'tomato'], ['carrot', 'carrot'], ['onion', 'onion'], ['corn', 'corn']], -48, 0, 8), X(['price', 'cost'], 'priceTag', -162, 0)] });
  E('dairyStall', ['supermarket', 'market'], { bases: [puesto(260, '#1e88e5', 'DAIRY')],
    items: fila([['cheese', 'cheese'], ['egg', 'egg'], ['butter', 'butter'], ['milk', 'milk'], ['yogurt', 'yogurt']], -48, 0, 6),
    gente: [P('adult', 'sell', 162, 0, -1)] });
  E('pantryStall', ['supermarket', 'market'], { bases: [puesto(290, '#8d6e63', 'PANTRY')],
    items: fila([['rice', 'rice'], ['beans', 'beans'], ['salt', 'salt'], ['pepper', 'pepper'], ['sugar', 'sugar'], ['oil', 'oil'], ['honey', 'honey']], -48, 0, 5) });
  E('sweetsStall', ['market'], { bases: [puesto(260, '#ec407a', 'SWEETS')],
    items: fila([['candy', 'candy'], ['chocolate', 'chocolate'], ['nut', 'nut'], ['snack', 'snack'], ['cookie', 'cookie']], -48, 0, 6),
    gente: [P('kid', 'cry', 164, 0, -1)] });
  E('drinksStall', ['market'], { bases: [puesto(270, '#00acc1', 'DRINKS')],
    items: fila([['water', 'water'], ['juice', 'juice'], ['soda', 'soda'], ['bottle', 'bottle'], ['glass', 'glass'], ['ice', 'iceBucket']], -48, 0, 8) });
  E('plantStall', ['market', 'garden'], { bases: [puesto(220, '#7cb342', 'PLANTS')],
    items: fila([['flower', 'flowerPot'], ['plant', 'plant'], [null, 'flowerPot'], [null, 'plant']], -48, 0, 14),
    gente: [P('woman', 'spend', 150, 0, -1)] });
  E('foodTruckScene', ['market', 'field', 'parking'], { bases: [mesa(150, 'plegable', -225), mesa(160, 'plegable', 225)],
    items: [X('food', 'foodTruck', 0, 0), ...fila([['sandwich', 'sandwich'], ['meal', 'meal']], -50, -225, 12), ...fila([['hamburger', 'hamburger'], ['fries', 'fries'], ['sausage', 'sausage']], -50, 225, 8)],
    gente: [P('woman', 'pay', 345, 0, -1)] });

  // ---------------- Restaurante, cafetería, panadería ----------------
  E('restTable1', ['restaurant'], { bases: [mesa(170, 'mantel')], items: fila([['pizza', 'pizza'], ['salad', 'salad'], [null, 'glass']], -50, 0, 6), gente: [P('man', 'eatPizza', -125, 0, 1)] });
  E('restTable2', ['restaurant'], { bases: [mesa(170, 'mantel')], items: fila([['pasta', 'pasta'], ['soup', 'soup'], ['spoon', 'spoon']], -50, 0, 12) });
  E('restTable3', ['restaurant'], { bases: [mesa(170, 'mantel')], items: fila([['meat', 'meat'], ['fork', 'fork'], ['knife', 'knife'], ['plate', 'plate']], -50, 0, 6) });
  E('restBoards', ['restaurant'], { items: [X('menu', 'menu', -70, 0), X('dinner', 'dinnerSign', 10, 0)], gente: [P('waiter', 'bring', 95, 0, -1)] });
  E('cafeTable1', ['cafe'], { bases: [mesa(130, 'bistro')], items: fila([['coffee', 'coffee'], ['tea', 'tea'], ['cup', 'cup']], -52, 0, 4), gente: [P('woman', 'drink', -110, 0, 1)] });
  E('cafeTable2', ['cafe'], { bases: [mesa(130, 'bistro')], items: fila([['breakfast', 'breakfast'], ['cereal', 'cereal']], -52, 0, 6) });
  E('cafeTable3', ['cafe'], { bases: [mesa(110, 'bistro')], items: fila([['dessert', 'dessert'], [null, 'cup']], -52, 0, 10), gente: [P('friend', 'talk', -95, 0, 1), P('friend', 'talk', 95, 0, -1)] });
  E('cafeWifi', ['cafe'], { items: [X('internet', 'wifiSign', 0, 0)] });
  E('bakeryDisplay', ['bakery'], { bases: [mesa(170, 'plegable')], items: fila([['bread', 'bread'], ['cake', 'cake'], [null, 'bread', 0.8]], -50, 0, 6) });

  // ---------------- Tienda del hogar ----------------
  E('bathShowroom', ['homeStore'], { bases: [base(g => Obj.plataforma(g, 430, '#cfd8dc'), 430, 10, { suelo: true })],
    items: fila([['shower', 'shower'], ['bath', 'bath'], ['toilet', 'toilet'], ['sink', 'sink'], ['towel', 'towel'], ['soap', 'soap']], -10, 0, 8) });
  E('kitchenShowroom', ['homeStore'], { bases: [base(g => Obj.plataforma(g, 330, '#d7ccc8'), 330, 10, { suelo: true }), mesa(130, 'plegable', 110)],
    items: [...fila([['fridge', 'fridge'], ['stove', 'stove']], -10, -75, 10), ...fila([['pot', 'pot'], ['pan', 'pan']], -50, 110, 4)] });
  (() => {
    const colores = [['red', '#e53935'], ['blue', '#1e88e5'], ['green', '#43a047'], ['yellow', '#fdd835'], ['orange', '#fb8c00'], ['purple', '#8e24aa'], ['pink', '#f06292'],
      ['brown', '#795548'], ['black', '#212121'], ['white', '#fafafa'], ['gray', '#9e9e9e'], ['gold', '#d4af37'], ['silver', '#c0c0c0']];
    const items = colores.map(([p, c], i) => X(p, 'paintCan', -96 + (i < 7 ? i : i - 7 + 0.5) * 32, i < 7 ? -54 : -6, 1, { color: c }));
    E('paintShelf', ['homeStore', 'museum'], { bases: [base(g => Obj.estante(g, 240, 2, 96), 240, 96, { palabras: ['color'], fondo: true })], items });
  })();
  E('lightStand', ['homeStore'], { bases: [mesa(90, 'plegable')], items: [X('light bulb', 'lightBulb', 0, -50)] });

  // ---------------- Casas: ventas de garaje, tendederos y la vida en el patio ----------------
  E('yardSale1', ['house'], { items: [X('yard', 'yardSaleSign', -236, 0), X('bed', 'bed', -92, 0), X('closet', 'closet', 42, 0), X('drawer', 'drawer', 116, 0), X('mirror', 'mirror', 186, 0)] });
  E('yardSale2', ['house'], { items: [X('sofa', 'sofa', -112, 0), X('lamp', 'lamp', -22, 0), X('carpet', 'carpet', 68, 0), X('curtain', 'curtain', 166, 0)] });
  E('yardSale3', ['house'], { items: [X('table', 'table', -70, 0), X('clock', 'clock', -92, -50), X('radio', 'radio', -45, -50), X('chair', 'chair', 12, 0), X('picture', 'picture', 78, 0), X('shelf', 'shelf', 150, 0)] });
  E('yardSale4', ['house'], { bases: [mesa(176, 'plegable', -50)],
    items: [...fila([['camera', 'camera'], ['wallet', 'wallet'], ['candle', 'candle'], ['key', 'key'], ['phone', 'phone']], -50, -50, 2), X('television', 'television', 90, 0), X('box', 'box', 164, 0)] });
  E('clothesline1', ['house'], { bases: [base(g => Obj.tendedero(g, 320), 332, 92, { fondo: true })],
    items: [X('shirt', 'shirt', -116, -30), X('T-shirt', 'tshirt', -58, -36), X('pants', 'pants', 0, -20), X('jeans', 'jeans', 56, -20), X('shorts', 'shorts', 114, -50)] });
  E('clothesline2', ['house'], { bases: [base(g => Obj.tendedero(g, 280), 292, 92, { fondo: true })],
    items: [X('skirt', 'skirt', -96, -44), X('dress', 'dress', -32, -18), X('socks', 'socks', 32, -46), X('pajamas', 'pajamas', 96, -22)] });
  E('garageFix', ['house'], { items: [X('garage', 'garage', -70, 0), X('bike', 'bicycleObj', 100, 0)], gente: [P('uncle', 'fix', 180, 0, -1)] });
  E('birthdayParty', ['house', 'campground'], { bases: [mesa(170, 'plegable', 10)],
    items: [X('party', 'birthdayBanner', -210, 0), X('birthday', 'birthdayCake', -20, -50), X('gift', 'gift', 45, -50)],
    gente: [P('daughter', 'open', 140, 0, -1), P('aunt', 'give', 205, 0, -1), P('cousin', 'hold', 270, 0, -1), P('mom', 'invite', 335, 0, -1)] });
  E('carWash', ['house', 'parking'], { items: [X(null, 'parkedCar', -40, 0)], gente: [P('neighbor', 'wash', 150, 0, -1)] });
  E('movingDay', ['house', 'apartments'], { items: [X(null, 'box', -60, 0), X(null, 'box', -60, -38, 0.85), X(null, 'box', 0, 0)], gente: [P('man', 'move', 80, 0, -1)] });
  E('hammockRest', ['house', 'campground'], { items: [X(null, 'hammock', 0, 0)], gente: [P('dad', 'rest', 0, -26, 1, { sobre: true, tumbado: true })] });
  E('treeClimb', ['house', 'parkRiver'], { items: [X(null, 'treeObj', 0, 0)], gente: [P('boy', 'climb', 8, -40, 1, { sobre: true })] });
  E('chalkKids', ['house', 'parkRiver'], { items: [X(null, 'chalkDrawing', -30, 0)], gente: [P('girl', 'draw', 70, 0, -1)] });
  E('throwCatch', ['house', 'parkRiver'], { gente: [P('brother', 'throw', -80, 0, 1), P('sister', 'catch', 80, 0, -1)] });
  E('grillBBQ', ['house', 'campground'], { items: [X(null, 'grill', -45, 0)], gente: [P('father', 'cook', 40, 0, -1)] });
  E('petsYard', ['house'], { items: [X('dog', 'dogObj', -40, 0), X('cat', 'catObj', 40, 0)] });
  E('hugFriends', ['house', 'parkPond'], { gente: [P('friend', 'hug', -32, 0, 1), P('friend', 'hug', 32, 0, -1)] });
  E('laughAdults', ['house', 'plaza'], { gente: [P('adult', 'laugh', -40, 0, 1), P('man', 'laugh', 40, 0, -1)] });
  E('shareKids', ['house', 'parkRiver'], { gente: [P('kid', 'share', -40, 0, 1), P('child', 'share', 40, 0, -1)] });

  // ---------------- Parques ----------------
  E('icecreamScene', ['parkPond', 'plaza'], { items: [X('ice cream', 'icecreamCart', 0, 0)], gente: [P('kid', 'eat', 95, 0, -1), P('adult', 'pay', 160, 0, -1)] });
  E('kiteScene', ['parkPond', 'parkRiver', 'field'], { gente: [P('girl', 'kite', 0, 0, 1)] });
  E('artistScene', ['parkPond', 'parkRiver', 'museum'], { items: [X('painting', 'easel', 50, 0)], gente: [P('artist', 'paint', -30, 0, 1)] });
  E('chessScene', ['parkPond', 'plaza'], { items: [X('chess', 'chessTable', 0, 0)], gente: [P('man', 'think', -85, 0, 1), P('grandfather', 'playChess', 85, 0, -1)] });
  E('parkSigns', ['parkPond'], { items: [X('grass', 'grassSign', -140, 0), X('nature', 'natureSign', 0, 0), X('trash can', 'trashCan', 100, 0), X('trash', 'trash', 150, 0)] });
  E('birdWatch', ['parkPond', 'garden'], { gente: [P('adult', 'see', 0, 0, 1)] });
  E('picnicFamily', ['parkRiver', 'campground'], { items: [X('family', 'picnicBlanket', 0, 0), X('lunch', 'lunch', 150, 0)],
    gente: [P('mother', 'make', -75, -6, 1, { sobre: true }), P('son', 'eat', -15, -8, 1, { sobre: true }), P('daughter', 'listen', 40, -8, -1, { sobre: true }), P('father', 'read', 100, 0, -1)] });
  E('strollerScene', ['parkRiver', 'parkPond'], { items: [X('baby', 'stroller', -40, 0)], gente: [P('mom', 'push', 36, 0, -1)] });
  E('playground', ['parkRiver'], { items: [X(null, 'slideObj', -200, 0), X(null, 'swingObj', 130, 0)], grupos: [G('children', 'play', -30, 0)] });
  E('grandparentsBench', ['parkPond', 'parkRiver', 'plaza'], { items: [X(null, 'bench2', 0, 0)], grupos: [G('grandparents', 'sit', 0, 1, { sobre: true })] });
  E('storyTime', ['parkRiver', 'library'], { gente: [P('grandmother', 'tell', 0, 0, 1)] });
  E('videoGameKid', ['parkRiver', 'toyStore'], { gente: [P('boy', 'playVideo', 0, 0, 1)] });
  E('raceScene', ['parkRiver', 'field'], { items: [X('race', 'finishBanner', -170, 0), X('prize', 'trophy', 95, -50)], bases: [mesa(70, 'plegable', 95)],
    gente: [P('player', 'finish', -170, 0, 1, { sobre: true }), P('adult', 'start', 20, 0, 1)] });
  E('podiumScene', ['parkRiver', 'field'], { items: [X('first', 'podium', 0, 0)], gente: [P('winner', 'win', 0, -70, 1, { sobre: true }), P('friend', 'watch', 140, 0, -1)] });
  E('riverScene', ['parkRiver'], { items: [X('river', 'riverObj', 0, 0), X('bridge', 'bridgeObj', 0, 0)] });

  // ---------------- Escuela, biblioteca y tableros del tiempo ----------------
  E('classroom', ['school'], { items: [X('board', 'schoolBoard', 0, -128), X('desk', 'desk', 175, 0), X('classroom', 'classroomSign', 262, 0)],
    gente: [P('teacher', 'teach', -205, -128, 1), P('student', 'learn', -60, 0, 1), P('student', 'study', 20, 0, -1)] });
  E('suppliesTable1', ['school'], { bases: [mesa(260, 'plegable')],
    items: fila([['book', 'book'], ['notebook', 'notebook'], ['pen', 'pen'], ['pencil', 'pencil'], ['eraser', 'eraser'], ['ruler', 'ruler'], ['scissors', 'scissors']], -50, 0, 5) });
  E('suppliesTable2', ['school'], { bases: [mesa(270, 'plegable')],
    items: fila([['dictionary', 'dictionary'], ['page', 'page'], ['homework', 'homework'], ['test', 'test'], ['list', 'list'], ['story', 'story']], -50, 0, 4) });
  E('subjectsScene', ['school'], { items: [X('subject', 'subjectsBoard', 0, 0)] });
  E('shapesScene', ['school', 'toyStore'], { items: [X('shape', 'shapesBoard', 0, 0)] });
  E('worldMapScene', ['school', 'museum'], { items: [X('world', 'worldMap', 0, 0)] });
  E('parentsGate', ['school'], { grupos: [G('parents', 'wait', 0, 0)] });
  E('universityScene', ['school', 'plaza'], { items: [X('university', 'universitySign', 0, 0)] });
  E('bookCartScene', ['library'], { items: [X(null, 'bookCart', 0, 0)], gente: [P('woman', 'put', -100, 0, 1), P('student', 'borrow', 100, 0, -1), P('kid', 'return', 165, 0, -1)] });
  E('newsScene', ['library', 'plaza'], { items: [X('news', 'newsStand', 0, 0)], gente: [P('man', 'read', 90, 0, -1)] });
  E('daysScene', ['plaza', 'library', 'school'], { items: [X('week', 'daysBoard', 0, 0)] });
  E('monthsScene', ['plaza', 'library', 'school'], { items: [X('month', 'monthsBoard', 0, 0)] });
  E('seasonsScene', ['plaza', 'library', 'parkPond'], { items: [X('season', 'seasonsBoard', 0, 0)] });
  E('dayPartsScene', ['plaza', 'library', 'school'], { items: [X('morning', 'dayPartsBoard', 0, 0)] });
  E('clockScene', ['plaza', 'library', 'school'], { items: [X('hour', 'clockBoard', 0, 0)] });

  // ---------------- Hospital, farmacia ----------------
  E('faceScene', ['hospital'], { items: [X('face', 'faceChart', 0, 0)] });
  E('bodyScene', ['hospital'], { items: [X('body', 'bodyChart', 0, 0)] });
  E('insideScene', ['hospital', 'museum'], { items: [X('heart', 'insideChart', 0, 0)] });
  E('doctorNurse', ['hospital'], { gente: [P('doctor', 'help', -40, 0, 1), P('nurse', 'write', 40, 0, -1)] });
  E('patients', ['hospital'], { gente: [P(null, 'wait', -105, 0, 1, { estado: 'headache' }), P(null, 'wait', -35, 0, 1, { estado: 'fever' }), P(null, 'wait', 35, 0, -1, { estado: 'cough' }), P(null, 'wait', 105, 0, -1, { estado: 'pain' })] });
  E('dentistScene', ['hospital', 'pharmacy'], { items: [X(null, 'toothSign', -50, 0)], gente: [P('dentist', 'explain', 40, 0, -1)] });
  E('medicineScene', ['pharmacy'], { bases: [mesa(120, 'plegable')], items: [...fila([['medicine', 'medicine'], ['pill', 'pill']], -50, 0, 10), X('health', 'healthPoster', 110, 0)] });

  // ---------------- Tienda de ropa ----------------
  E('mannequins', ['clothesStore'], { items: [X('coat', 'mannequinWinter', -40, 0), X('sweater', 'mannequinCasual', 40, 0)], gente: [P('girl', 'try', 125, 0, -1)] });
  E('shoeScene', ['clothesStore'], { bases: [base(g => Obj.estante(g, 150, 2, 110), 150, 110, { fondo: true })],
    items: [X('shoe', 'shoe', -40, -61), X('shoes', 'shoes', 20, -61), X('boots', 'boots', -10, -6), X('size', 'sizeTag', 125, 0)] });
  E('accessoriesScene', ['clothesStore'], { bases: [mesa(290, 'plegable')],
    items: [...fila([['glasses', 'glasses'], ['ring', 'ring'], ['necklace', 'necklace'], ['earrings', 'earrings'], ['bag', 'bag'], ['backpack', 'backpack']], -50, 0, 5), X('umbrella', 'umbrella', 190, 0)] });
  E('rackScene', ['clothesStore'], { items: [X('clothes', 'clothesRack', -80, 0), X('uniform', 'uniformStand', 30, 0), X('jacket', 'jacketStand', 95, 0)], gente: [P('woman', 'choose', 175, 0, -1)] });

  // ---------------- Gimnasio, deportes ----------------
  E('poolScene', ['gym'], { items: [X('swimming', 'pool', 0, 0)], gente: [P('kid', 'swim', -30, -12, 1, { sobre: true, enAgua: true })] });
  E('exerciseScene', ['gym'], { items: [X('exercise', 'dumbbells', 0, 0)], gente: [P('man', 'stretch', -70, 0, 1), P('boy', 'jump', 70, 0, -1)] });
  E('sportScene', ['gym'], { items: [X('sport', 'sportsRack', 0, 0)] });
  E('basketballScene', ['gym', 'field', 'parkRiver'], { items: [X('basketball', 'basketballHoop', 0, 0)] });
  E('tennisScene', ['gym', 'field', 'parkPond'], { items: [X('tennis', 'tennisNet', 0, 0)] });

  // ---------------- Cine, hotel, tiendas, banco, correo, bomberos, policía ----------------
  E('ticketScene', ['cinema'], { items: [X('ticket', 'ticketBooth', -90, 0)], grupos: [G('people', 'stand', 70, 0)] });
  E('postersScene', ['cinema'], { items: [X('movie', 'moviePosters', 0, 0)] });
  E('luggageScene', ['hotel'], { items: [X('trip', 'luggage', 0, 0)], gente: [P('pilot', 'travel', -90, 0, 1), P('guest', 'arrive', 90, 0, -1)] });
  E('holidayScene', ['hotel'], { items: [X('holiday', 'holidayPoster', 0, 0)] });
  E('petsScene', ['petShop'], { bases: [mesa(190, 'plegable')],
    items: [...fila([['mouse', 'mouse'], ['fish', 'fishbowl'], ['turtle', 'turtle']], -50, 0, 6), X('pet', 'petSign', -165, 0), X('rabbit', 'rabbit', 140, 0)],
    gente: [P('child', 'touch', 205, 0, -1)] });
  E('dollhouseScene', ['toyStore'], { items: [X('room', 'dollhouse', 0, 0)] });
  E('toysScene', ['toyStore'], { bases: [mesa(200, 'plegable')], items: fila([['toy', 'toy'], ['doll', 'doll'], ['ball', 'ball'], ['game', 'boardGame']], -50, 0, 4) });
  E('moneyScene', ['bank'], { bases: [mesa(120, 'plegable')], items: [X('money', 'money', 0, -50)],
    gente: [P('kid', 'save', -110, 0, 1), P('woman', 'spend', 110, 0, -1), P('manager', 'work', 180, 0, -1)] });
  E('mailScene', ['postOffice'], { bases: [mesa(170, 'plegable')], items: fila([['letter', 'letter'], ['paper', 'paper'], ['address', 'package']], -50, 0, 6), gente: [P('grandfather', 'send', 140, 0, -1)] });
  E('fireScene', ['fireStation'], { items: [X(null, 'hydrant', 50, 0)], gente: [P('firefighter', 'wave', -30, 0, 1)] });
  E('policeScene', ['policeStation'], { gente: [P('police officer', 'show', 0, 0, 1)] });

  // ---------------- Museo, iglesia, oficina, apartamentos ----------------
  E('statuesScene', ['museum'], { items: [X('king', 'statueKing', -45, 0), X('queen', 'statueQueen', 45, 0)] });
  E('scienceScene', ['museum', 'school'], { bases: [mesa(120, 'plegable', -30)], items: [X('earth', 'globe', -55, -50), X(null, 'microscope', -5, -50), X('planet', 'planet', 80, 0)],
    gente: [P('scientist', 'explain', 160, 0, -1)] });
  E('galleryScene', ['museum'], { items: [X('desert', 'desertPainting', -110, 0), X('jungle', 'junglePainting', -30, 0)], grupos: [G('group', 'look', 100, 0)] });
  E('weddingScene', ['church'], { items: [X('wedding', 'weddingArch', 0, 0, 1)], gente: [P('wife', 'smile', -30, 0, 1, { sobre: true }), P('husband', 'wave', 30, 0, -1, { sobre: true })], grupos: [G('guest', 'wave', 180, 0)] });
  E('meetingScene', ['office'], { items: [X('meeting', 'meetingTable', 0, 0)], gente: [P('boss', 'meet', -125, 0, 1), P('manager', 'meet', 125, 0, -1)] });
  E('emailScene', ['office'], { bases: [mesa(100, 'plegable')], items: [X('email', 'emailLaptop', 0, -50)], gente: [P('worker', 'use', -85, 0, 1)] });
  E('officeSigns', ['office'], { items: [X('company', 'companySign', -80, 0), X('job', 'jobBoard', 100, 0)] });
  E('apartmentScene', ['apartments'], { items: [X('neighborhood', 'neighborhoodSign', 0, 0)], gente: [P('neighbor', 'phone', 130, 0, -1)] });

  // ---------------- Obra, estacionamiento, gasolinera ----------------
  E('roadWorkScene', ['construction'], { items: [X('road', 'roadWork', 0, 0)], gente: [P('worker', 'stop', 110, 0, -1)] });
  E('buildScene', ['construction'], { items: [X(null, 'bricks', -50, 0), X('plan', 'blueprint', 125, 0)], gente: [P('worker', 'build', 30, 0, -1)] });
  E('parkingScene', ['parking'], { items: [X('parking lot', 'parkingSign', -175, 0), X(null, 'parkedCar', 0, 0), X('motorcycle', 'motorcycle', 190, 0)] });
  E('gasScene', ['parking'], { items: [X('gas station', 'gasPump', 0, 0)], gente: [P('driver', 'wait', 75, 0, -1)] });

  // ---------------- Plaza ----------------
  E('mapScene', ['plaza'], { items: [X('map', 'mapBoard', 0, 0)], gente: [P('tourist', 'look', 135, 0, -1)] });
  E('infoScene', ['plaza'], { items: [X('information', 'infoKiosk', 0, 0)], gente: [P('tourist', 'ask', 80, 0, -1)] });
  E('welcomeScene', ['plaza'], { items: [X('town', 'welcomeSign', 0, 0)] });
  E('signpostScene', ['plaza'], { items: [X('airport', 'signpostA', -170, 0), X('way', 'signpostB', 0, 0), X('left', 'turnSign', 165, 0)] });
  E('soldierScene', ['plaza', 'museum'], { items: [X('soldier', 'statueSoldier', 0, 0)] });
  E('concertScene', ['plaza'], { bases: [base(g => escenario(g, 440), 480, 100, { fondo: true })],
    items: [X('piano', 'piano', -150, -34), X('song', 'musicStand', -60, -34), X('drum', 'drum', 150, -34), X('concert', 'concertBanner2', -380, 0)],
    gente: [P('singer', 'sing', 10, -34, 1, { sobre: true }), P('artist', 'practice', 75, -34, -1, { sobre: true }), P('person', 'speak', 290, 0, -1), P('girl', 'dance', 355, 0, -1)] });
  E('audienceScene', ['plaza'], { grupos: [G('people', 'enjoy', 0, 0)] });
  E('weatherScene', ['plaza'], { items: [X('weather', 'weatherBoard', 0, 0)] });
  E('photoScene', ['plaza', 'parkPond'], { gente: [P('tourist', 'photo', 0, 0, 1)] });
  E('scheduleScene', ['plaza'], { items: [X('schedule', 'busScheduleObj', 0, 0)] });
  E('subwayScene', ['plaza', 'parking', 'construction', 'apartments'], { items: [X('subway', 'subway', 0, 0)] });
  E('streetSignScene', ['plaza', 'construction', 'house'], { items: [X('street', 'streetSign', 0, 0)] });


  // ---------------- Zoológico ----------------
  E('zooSignScene', ['zoo'], { items: [X('zoo', 'zooSign', 0, 0)] });
  E('zooCats', ['zoo'], { bases: [base(g => recinto(g, 330, '#e6d3a3'), 330, 70, { fondo: true })], items: [X('lion', 'lion', -80, 0), X('tiger', 'tiger', 80, 0)] });
  E('zooBig', ['zoo'], { bases: [base(g => recinto(g, 360, '#cfe0a3'), 360, 70, { fondo: true })], items: [X('elephant', 'elephant', -90, 0), X('giraffe', 'giraffe', 110, 0)] });
  E('zooForest', ['zoo'], { bases: [base(g => recinto(g, 520, '#b5d19a'), 520, 70, { fondo: true })], items: fila([['bear', 'bear'], ['wolf', 'wolf'], ['fox', 'fox'], ['deer', 'deer']], 0, 0, 10) });
  E('zooSmall', ['zoo'], { bases: [base(g => recinto(g, 400, '#d9e8c4'), 400, 70, { fondo: true })], items: fila([['monkey', 'monkey'], ['snake', 'snake'], ['penguin', 'penguin'], ['owl', 'owl'], ['parrot', 'parrot']], 0, 0, 12) });

  // ---------------- Granja, jardín, campamento ----------------
  E('nestScene', ['farm'], { items: [X('egg shell', 'nest', 0, 0)], gente: [P('farmer', 'feedChickens', 70, 0, -1)] });
  E('windmillScene', ['farm'], { items: [X('wind', 'windmill', 0, 0)] });
  E('fieldScene', ['farm'], { items: [X('land', 'plowedField', 0, 0), X(null, 'scarecrow', 175, 0)] });
  E('wagonScene', ['farm'], { items: [X(null, 'wagon', 45, 0)], gente: [P('kid', 'pull', -20, 0, 1)] });
  E('gardenBeds', ['garden'], { items: [X('garden', 'gardenSign', -250, 0), X(null, 'gardenBed', -40, 0), X(null, 'gardenBed', 160, 0)], gente: [P('woman', 'grow', 300, 0, -1)] });
  E('gardenWork', ['garden'], { items: [X(null, 'flowerBedObj', 0, 0)], gente: [P('man', 'water', -100, 0, 1), P('aunt', 'cut', 100, 0, -1)] });
  E('bugs1', ['garden', 'parkPond'], { items: fila([['bee', 'beehive'], ['butterfly', 'butterflies'], ['ant', 'antHill']], 0, 0, 20) });
  E('bugs2', ['garden', 'parkRiver'], { items: fila([['spider', 'webPost'], ['insect', 'ladybugLeaf'], ['frog', 'frogPond'], ['bird', 'birdhouse']], 0, 0, 16) });
  E('rocksScene', ['garden', 'parkPond', 'campground'], { items: [...fila([['rock', 'rock'], ['stone', 'stone']], 0, -40, 16), X(['leaf', 'fall'], 'leaf', 105, 0)] });
  E('campScene', ['campground'], { items: [X(null, 'tent', -80, 0), X('fire', 'campfire', 40, 0)], gente: [P('friend', 'sing', 120, 0, -1)] });

  /* ---------- Escenas de la playa (franja de arena al sur) ---------- */
  const PLAYA = [
    { items: [X('beach', 'beachSign', 0, 0)] },
    { items: [X('sand', 'sandcastle', 0, 0)], gente: [P('child', 'buildSand', 75, 0, -1)] },
    { items: [X(null, 'beachUmbrella', 0, 0)], gente: [P('woman', 'relax', -10, -4, 1, { sobre: true, tumbado: true })] },
    { items: [X(null, 'shellsObj', 0, 0)] }
  ];

  /* ---------- Dibujos de apoyo que usan las escenas ---------- */
  function escenario(g, w) {
    Obj.rr(g, -w / 2, -34, w, 34, 4, '#4e342e'); Obj.rect(g, -w / 2, -38, w, 6, '#6d4c41');
    [-w / 2 - 22, w / 2 + 6].forEach(x => { Obj.rr(g, x, -96, 16, 60, 3, '#212121'); Obj.circle(g, x + 8, -80, 5, '#424242'); Obj.circle(g, x + 8, -56, 6, '#424242'); });
  }
  function recinto(g, w, color) {
    Obj.ell(g, 0, -18, w / 2, 26, color);
    for (let x = -w / 2 + 6; x <= w / 2 - 6; x += 24) Obj.rect(g, x - 3, -64, 6, 30, '#8d6e63');
    Obj.rect(g, -w / 2 + 6, -60, w - 12, 4, '#a1887f'); Obj.rect(g, -w / 2 + 6, -46, w - 12, 4, '#a1887f');
  }
  Obj.def('dogObj', 84, 56, (g, t) => Animales.dog(g, -4, 0, '#c8a27a', t, 'sit', 1));
  Obj.def('catObj', 60, 40, (g, t) => Animales.cat(g, -6, 0, '#9e9e9e', t));
  Obj.def('desk', 72, 66, g => {
    Obj.rect(g, -30, -44, 6, 44, '#546e7a'); Obj.rect(g, 24, -44, 6, 44, '#546e7a'); Obj.rr(g, -34, -50, 68, 8, 2, '#d7ccc8');
    Obj.rect(g, -26, -42, 52, 16, '#b0bec5'); Obj.rr(g, -14, -60, 20, 10, 2, '#1565c0'); Obj.rect(g, 10, -58, 12, 3, '#ffca28');
  });
  Obj.def('toothSign', 60, 110, g => {
    Obj.rect(g, -3, -60, 6, 60, '#546e7a');
    g.beginPath(); g.moveTo(-22, -104); g.quadraticCurveTo(0, -116, 22, -104); g.quadraticCurveTo(26, -84, 16, -60); g.quadraticCurveTo(10, -58, 8, -70);
    g.quadraticCurveTo(0, -82, -8, -70); g.quadraticCurveTo(-10, -58, -16, -60); g.quadraticCurveTo(-26, -84, -22, -104); g.fillStyle = '#fafafa'; g.fill();
    g.strokeStyle = '#90caf9'; g.lineWidth = 2; g.stroke(); Obj.text(g, '✦', 8, -100, 10, '#4fc3f7');
  });
  Obj.def('hydrant', 34, 46, g => {
    Obj.rr(g, -9, -38, 18, 36, 4, '#e53935'); Obj.ell(g, 0, -38, 10, 5, '#c62828'); Obj.rect(g, -15, -28, 30, 7, '#c62828'); Obj.rect(g, -12, -2, 24, 4, '#b71c1c'); Obj.circle(g, 0, -43, 3, '#c62828');
  });
  Obj.def('uniformStand', 56, 90, g => { Obj.line(g, [[0, 0], [0, -84]], '#546e7a', 3); Obj.line(g, [[-14, 0], [14, 0]], '#546e7a', 3); g.save(); g.translate(0, -10); Obj.O.uniform.d(g); g.restore(); },
    { partes: { button: [-4, -58, 8, 28] } });
  Obj.def('jacketStand', 56, 94, g => { Obj.line(g, [[0, 0], [0, -90]], '#546e7a', 3); Obj.line(g, [[-14, 0], [14, 0]], '#546e7a', 3); g.save(); g.translate(0, -14); Obj.O.jacket.d(g); g.restore(); });
  Obj.def('flowerBedObj', 120, 34, g => {
    Obj.rr(g, -56, -16, 112, 16, 8, '#4e8a3a');
    for (let i = 0; i < 8; i++) { const x = -48 + i * 14, y = -18 - (i % 3) * 5; Obj.line(g, [[x, -8], [x, y]], '#3d7a2e', 2); Obj.circle(g, x, y - 3, 6, ['#e63946', '#ffb703', '#b388eb', '#f28482'][i % 4]); Obj.circle(g, x, y - 3, 2, '#fff59d'); }
  });
  Obj.def('shellsObj', 70, 24, g => {
    [[-20, -6, '#f8bbd0'], [4, -8, '#ffe0b2'], [24, -5, '#fff']].forEach(([x, y, c], i) => {
      g.beginPath(); g.moveTo(x - 9, y + 4); g.quadraticCurveTo(x, y - 14, x + 9, y + 4); g.closePath(); g.fillStyle = c; g.fill();
      for (let k = -1; k <= 1; k++) Obj.line(g, [[x, y + 3], [x + k * 6, y - 6]], 'rgba(0,0,0,.15)', 1);
    });
  });
  Obj.def('busScheduleObj', 84, 136, (g, t, s) => Obj.O.busSchedule.d(g, t, s), { partes: Obj.O.busSchedule.partes });

  /* ======================================================================
     LOTES
  ====================================================================== */
  // 6 filas × 9 lotes = 54 lotes
  const LOTES = [
    ...Array(18).fill('house'),
    'apartments', 'school', 'library', 'hospital', 'pharmacy', 'supermarket', 'bakery', 'cafe', 'restaurant', 'clothesStore', 'gym', 'cinema',
    'hotel', 'petShop', 'toyStore', 'bank', 'postOffice', 'fireStation', 'policeStation', 'museum', 'church', 'office', 'homeStore',
    'parkPond', 'parkRiver', 'market', 'market', 'farm', 'farm', 'plaza', 'field', 'zoo', 'construction', 'parking', 'garden', 'campground'
  ];
  // Zona de cada tema para las burbujas (dónde flotan sus palabras abstractas)
  const ZONAS = {
    basics: ['plaza', 'house', 'cafe'], numbers: ['school', 'bank', 'market'], colors: ['homeStore', 'museum', 'parkPond'], people: ['parkRiver', 'house', 'plaza'],
    body: ['hospital', 'pharmacy', 'gym'], clothes: ['clothesStore', 'house'], food: ['market', 'restaurant', 'cafe', 'bakery', 'supermarket'],
    home: ['house', 'homeStore', 'apartments'], town: ['plaza', 'construction', 'parking'], animals: ['zoo', 'farm', 'petShop'],
    nature: ['parkPond', 'garden', 'campground', 'farm'], time: ['plaza', 'library', 'school'], school: ['school', 'library', 'office'],
    hobbies: ['field', 'gym', 'cinema'], verbs: ['parkRiver', 'parkPond', 'plaza', 'house', 'campground'], adjectives: ['house', 'parkPond', 'zoo', 'market'],
    adverbs: ['parkRiver', 'field', 'plaza'], prepositions: ['house', 'parkRiver', 'garden', 'plaza']
  };
  // Adjetivos que flotan junto al objeto que los muestra
  const CERCA_DE = {
    big: 'elephant', small: 'mouse', tall: 'giraffe', short: 'penguin', long: 'snake', high: 'mountain', old: 'grandfather', young: 'baby', new: 'bike',
    happy: 'birthday', sad: 'cry', angry: 'tiger', afraid: 'spider', surprised: 'gift', bored: 'stand', excited: 'win', worried: 'headache',
    delicious: 'pizza', sweet: 'candy', salty: 'fries', sour: 'lemon', fresh: 'fruit', hot: 'coffee', cold: 'ice', wet: 'swimming', dry: 'desert',
    clean: 'soap', dirty: 'trash', heavy: 'box', soft: 'pillow', hard: 'rock', fast: 'finish', slow: 'turtle', quick: 'fox', loud: 'drum', quiet: 'library',
    expensive: 'ring', cheap: 'price', rich: 'money', poor: 'piggy', tired: 'rest', hungry: 'restaurant', thirsty: 'water', sick: 'fever', healthy: 'health',
    strong: 'exercise', weak: 'pain', brave: 'firefighter', smart: 'scientist', lazy: 'hammock', cute: 'rabbit', famous: 'singer', dangerous: 'shark',
    safe: 'police officer', beautiful: 'flower', pretty: 'dress', ugly: 'frog', funny: 'monkey', friendly: 'dog', kind: 'nurse', polite: 'waiter',
    careful: 'road', deep: 'sea', wide: 'river', round: 'ball', bright: 'sun', sleepy: 'owl', busy: 'office', free: 'internet', full: 'bus', empty: 'glass',
    light: 'light bulb', dark: 'night', favorite: 'toy', modern: 'computer', simple: 'shape', wonderful: 'rainbow', perfect: 'first', lucky: 'winner',
    difficult: 'test', easy: 'lesson', interesting: 'museum', boring: 'schedule', important: 'doctor', same: 'socks', different: 'shoes', far: 'island',
    ready: 'meal', alone: 'owl', together: 'family', sunny: 'sun', cloudy: 'cloud', rainy: 'rain', windy: 'wind', warm: 'fire', cool: 'lake',
    gold: 'prize', slowly: 'turtle', quickly: 'run', carefully: 'build', happily: 'party', quietly: 'library', loudly: 'concert', gently: 'baby',
    patiently: 'fish', in: 'fish', on: 'chess', under: 'bench', over: 'bridge', above: 'balloon', below: 'sea', 'next to': 'bank', near: 'pond',
    behind: 'barn', 'in front of': 'school', between: 'river', 'across from': 'church', into: 'subway', 'out of': 'garage', through: 'forest', around: 'fountain',
    along: 'river', across: 'crosswalk', up: 'climb', down: 'slide', outside: 'garden', inside: 'house', here: 'map', there: 'lighthouse', away: 'plane', everywhere: 'town'
  };

  return { NUEVAS, registrarAcciones, ROLES, ROPA, GRUPOS, ESTADOS, ESCENAS, PLAYA, LOTES, ZONAS, CERCA_DE, fila, X, P, G };
})();
