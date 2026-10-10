'use strict';

/* ============================================================================
   ENGLISH STREET (Juego 2)  ·  juego/calle_datos.js
   ----------------------------------------------------------------------------
   Los personajes de la calle, lo que dicen y qué palabras enseña cada uno.
   Cada palabra de las 1000 (PALABRAS) tiene un solo dueño: el personaje que
   la enseña. Si una palabra no aparece en ninguna lista `solo`, la enseña el
   dueño de su tema (DUENO_TEMA), así nunca queda ninguna sin enseñar.

   Estilos (cómo se practican las palabras en calle_motor.js):
     charla · fotos · tienda · cuerpo · colores · mudanza · ciudad · animales
     naturaleza · tiempo · escuela · deporte · mimo · mago
============================================================================ */
const Calle = (() => {
  const T = (en, es) => ({ en, es });

  /* ---------- Saludos y despedidas que sirven para cualquiera ----------
     npc: lo que dice · ok: respuestas correctas · bad: respuestas absurdas · resp: cómo reacciona */
  const SALUDOS = [
    { npc: T('Hello! How are you today?', '¡Hola! ¿Cómo estás hoy?'),
      ok: [T("I'm fine, thank you!", '¡Estoy bien, gracias!'), T('Very well, thanks. And you?', 'Muy bien, gracias. ¿Y tú?')],
      bad: [T("I'm a sandwich.", 'Soy un sándwich.'), T('Goodbye!', '¡Adiós!'), T('It is blue.', 'Es azul.')],
      resp: T("I'm great, thanks for asking!", '¡Estoy genial, gracias por preguntar!') },
    { npc: T('Hi there! Nice to meet you.', '¡Hola! Mucho gusto.'),
      ok: [T('Nice to meet you, too!', '¡Mucho gusto también!')],
      bad: [T('See you yesterday!', '¡Nos vemos ayer!'), T("It's eleven o'clock.", 'Son las once.'), T('I like rice.', 'Me gusta el arroz.')],
      resp: T('Welcome to English Street!', '¡Bienvenido a English Street!') },
    { npc: T("Hey! What's your name?", '¡Hola! ¿Cómo te llamas?'),
      ok: [T('My name is {nombre}.', 'Me llamo {nombre}.'), T("I'm {nombre}. And you?", 'Soy {nombre}. ¿Y tú?')],
      bad: [T('My name is Tuesday.', 'Me llamo martes.'), T("I'm in the kitchen.", 'Estoy en la cocina.'), T('Yes, please.', 'Sí, por favor.')],
      resp: T('{nombre}! What a nice name!', '¡{nombre}! ¡Qué nombre tan bonito!') },
    { npc: T('Welcome! Are you new in town?', '¡Bienvenido! ¿Eres nuevo en el pueblo?'),
      ok: [T("Yes, I am. I'm learning English!", 'Sí. ¡Estoy aprendiendo inglés!')],
      bad: [T("No, I'm a cat.", 'No, soy un gato.'), T("Yes, it's raining.", 'Sí, está lloviendo.'), T('Two apples.', 'Dos manzanas.')],
      resp: T("That's wonderful! I can help you.", '¡Qué maravilla! Yo te puedo ayudar.') },
    { npc: T('Hello, friend! Are you ready to learn?', '¡Hola, amigo! ¿Listo para aprender?'),
      ok: [T("Yes, I'm ready!", '¡Sí, estoy listo!'), T("Of course! Let's go!", '¡Claro! ¡Vamos!')],
      bad: [T("No, I'm purple.", 'No, soy morado.'), T('The door is closed.', 'La puerta está cerrada.'), T('Good night!', '¡Buenas noches!')],
      resp: T("Great! Let's start.", '¡Genial! Empecemos.') },
    { npc: T('{saludo}! How is your day?', '¡{saludoEs}! ¿Cómo va tu día?'),
      ok: [T("It's a great day, thanks!", 'Es un gran día, ¡gracias!'), T('Pretty good, thank you!', 'Bastante bien, ¡gracias!')],
      bad: [T("It's my brother.", 'Es mi hermano.'), T("I'm twelve shoes.", 'Soy doce zapatos.'), T('See you later!', '¡Hasta luego!')],
      resp: T("I'm happy to hear that!", '¡Me alegra oír eso!') }
  ];
  // Solo cuando ya se conocían
  const REENCUENTROS = [
    { npc: T('Hi again! Good to see you!', '¡Hola otra vez! ¡Qué gusto verte!'),
      ok: [T('Good to see you, too!', '¡Qué gusto verte a ti también!')],
      bad: [T('Nice to meet you, banana.', 'Mucho gusto, banana.'), T("I'm under the table.", 'Estoy debajo de la mesa.'), T('No, thanks. Bye!', 'No, gracias. ¡Adiós!')],
      resp: T('I have new words for you today!', '¡Hoy tengo palabras nuevas para ti!') },
    { npc: T('Oh, you came back! Did you practice?', '¡Oh, volviste! ¿Practicaste?'),
      ok: [T('Yes, I practiced a lot!', '¡Sí, practiqué mucho!'), T('Yes, every day!', '¡Sí, todos los días!')],
      bad: [T("Yes, I'm a chair.", 'Sí, soy una silla.'), T('The sky is green.', 'El cielo es verde.'), T('Hello, goodbye!', '¡Hola, adiós!')],
      resp: T("Excellent! Let's learn more.", '¡Excelente! Aprendamos más.') }
  ];
  const DESPEDIDAS = [
    { npc: T('Thank you! Have a nice day!', '¡Gracias! ¡Que tengas un buen día!'),
      ok: [T('Thanks, you too!', '¡Gracias, igualmente!')],
      bad: [T('Good morning!', '¡Buenos días!'), T('Nice to meet you, door.', 'Mucho gusto, puerta.'), T("I'm hungry, banana.", 'Tengo hambre, banana.')] },
    { npc: T('See you tomorrow!', '¡Nos vemos mañana!'),
      ok: [T('See you! Bye!', '¡Nos vemos! ¡Chao!'), T('Bye! See you tomorrow!', '¡Adiós! ¡Hasta mañana!')],
      bad: [T('Hello! How are you?', '¡Hola! ¿Cómo estás?'), T('Yes, the apple.', 'Sí, la manzana.'), T("I'm the window.", 'Soy la ventana.')] },
    { npc: T('Goodbye! Come back soon.', '¡Adiós! Vuelve pronto.'),
      ok: [T('Bye! I will!', '¡Adiós! ¡Lo haré!'), T('Goodbye! Thank you!', '¡Adiós! ¡Gracias!')],
      bad: [T('Welcome to my house!', '¡Bienvenido a mi casa!'), T('Three o’clock, please.', 'Las tres, por favor.'), T('No, it is a dog.', 'No, es un perro.')] },
    { npc: T('Take care!', '¡Cuídate!'),
      ok: [T('Thanks! You too!', '¡Gracias! ¡Tú también!')],
      bad: [T('Nice to meet you!', '¡Mucho gusto!'), T('Under the bed.', 'Debajo de la cama.'), T('Twenty bananas.', 'Veinte bananas.')] },
    { npc: T('It was nice to talk to you.', 'Fue un gusto hablar contigo.'),
      ok: [T('Same here! Goodbye!', '¡Igualmente! ¡Adiós!'), T('Thank you! Bye!', '¡Gracias! ¡Chao!')],
      bad: [T('Good morning, chair!', '¡Buenos días, silla!'), T("I'm sorry, I'm a pizza.", 'Lo siento, soy una pizza.'), T('Yes, the red one.', 'Sí, el rojo.')] }
  ];

  // Reacciones
  const BIEN = [T('Perfect!', '¡Perfecto!'), T('Great job!', '¡Muy bien hecho!'), T("That's right!", '¡Correcto!'), T('Excellent!', '¡Excelente!'),
    T('Well done!', '¡Bien hecho!'), T('Exactly!', '¡Exacto!'), T('You got it!', '¡Lo lograste!'), T('Wonderful!', '¡Maravilloso!'), T('Nice!', '¡Bien!'), T('Super!', '¡Súper!')];
  const MAL = [T('Hmm, not quite. Try again!', 'Mmm, no exactamente. ¡Inténtalo otra vez!'), T('Oops! Try again.', '¡Uy! Inténtalo de nuevo.'),
    T('Almost! One more time.', '¡Casi! Una vez más.'), T("No, that's not it. Try again!", 'No, no es eso. ¡Otra vez!')];

  /* ---------- Los personajes ----------
     rol: oficio para la ropa (MundoDatos.ROPA o `ropa`) · acc: accesorio extra (calle_dibujos.js)
     escena: fondo que se dibuja · emoji: retrato del cuadro de diálogo · tono: voz más grave o aguda */
  const PERSONAJES = {
    vecina: {
      nombre: 'Mrs. Rosa', titulo: T('Your neighbor', 'Tu vecina'), emoji: '👵', rol: 'neighbor', sexo: 'f', edad: 'mayor', tono: 1.2,
      escena: 'casa', color: '#e91e63', estilo: 'charla', temas: ['basics'],
      conoce: T("Oh, hello! I'm Rosa, your neighbor. Welcome to English Street!", '¡Oh, hola! Soy Rosa, tu vecina. ¡Bienvenido a English Street!'),
      ensena: [T("Let's practice some useful words. You use them every day!", 'Practiquemos palabras útiles. ¡Las usas todos los días!'),
        T('My cat and I have new words for you.', 'Mi gato y yo tenemos palabras nuevas para ti.'),
        T('Come, sit with me. Let me teach you something.', 'Ven, siéntate conmigo. Déjame enseñarte algo.')],
      charlas: [
        { npc: T('Would you like some tea?', '¿Quieres un poco de té?'),
          ok: [T('Yes, please!', '¡Sí, por favor!'), T('No, thank you.', 'No, gracias.')],
          bad: [T("Yes, I'm tea.", 'Sí, soy té.'), T('Good night, car!', '¡Buenas noches, carro!')],
          resp: T('You are so polite!', '¡Qué educado eres!') },
        { npc: T('Can you help me with my bags?', '¿Me ayudas con mis bolsas?'),
          ok: [T('Of course!', '¡Claro!'), T('Sure, no problem!', '¡Seguro, no hay problema!')],
          bad: [T("I'm sorry, I'm a dog.", 'Lo siento, soy un perro.'), T('It is Monday.', 'Es lunes.')],
          resp: T('Thank you, dear!', '¡Gracias, querido!') }
      ]
    },
    abuela: {
      nombre: 'Grandma Lucy', titulo: T('Grandmother in the park', 'Abuela del parque'), emoji: '👵🏽', rol: 'grandmother', sexo: 'f', edad: 'mayor', tono: 1.05,
      escena: 'banca', color: '#8e44ad', estilo: 'fotos', temas: ['people'],
      conoce: T("Hello, dear! I'm Lucy. Do you want to see my photos?", '¡Hola, querido! Soy Lucy. ¿Quieres ver mis fotos?'),
      ensena: [T('Look at my photo album. These are the people in my life.', 'Mira mi álbum de fotos. Estas son las personas de mi vida.'),
        T('I have more photos! Look.', '¡Tengo más fotos! Mira.')],
      charlas: [
        { npc: T('Do you have a big family?', '¿Tienes una familia grande?'),
          ok: [T('Yes, I have a big family.', 'Sí, tengo una familia grande.'), T('No, my family is small.', 'No, mi familia es pequeña.')],
          bad: [T('Yes, I have a big pizza.', 'Sí, tengo una pizza grande.'), T("It's on the table.", 'Está en la mesa.')],
          resp: T('Family is very important.', 'La familia es muy importante.') }
      ]
    },
    frutero: {
      nombre: 'Mr. Tom', titulo: T('Fruit seller', 'Vendedor de frutas'), emoji: '👨🏻‍🌾', rol: 'person', sexo: 'm', edad: 'adulto', tono: 0.95,
      ropa: { top: 'camisa', topColor: '#43a047', bottom: 'pantalón', bottomColor: '#5d4037' }, acc: 'strawHat',
      escena: 'puesto', letrero: 'FRUIT & VEG', toldo: ['#43a047', '#ffffff'], color: '#43a047', estilo: 'tienda', temas: ['food'],
      solo: ['fruit', 'apple', 'banana', 'grapes', 'strawberry', 'lemon', 'watermelon', 'pineapple', 'cherry', 'vegetable', 'potato', 'tomato',
        'carrot', 'onion', 'corn', 'salad', 'nut', 'fresh', 'sour', 'sweet'],
      conoce: T("Hi! I'm Tom. Fresh fruit and vegetables here!", '¡Hola! Soy Tom. ¡Aquí hay frutas y verduras frescas!'),
      ensena: [T('Look at my fruit and vegetables. Everything is fresh today!', 'Mira mis frutas y verduras. ¡Todo está fresco hoy!'),
        T('I have new things today. Look!', 'Hoy tengo cosas nuevas. ¡Mira!')],
      pide: [T('Can you hand me the {w}, please?', '¿Me pasas {el} {es}, por favor?'), T('A customer wants the {w}. Can you give it to me?', 'Un cliente quiere {el} {es}. ¿Me {lo} das?'),
        T('Pass me the {w}, please.', 'Pásame {el} {es}, por favor.')],
      charlas: [
        { npc: T('What would you like?', '¿Qué te gustaría?'),
          ok: [T("I'd like some fruit, please.", 'Quisiera algo de fruta, por favor.')],
          bad: [T("I'd like a shower, please.", 'Quisiera una ducha, por favor.'), T("I'm from the moon.", 'Soy de la luna.')],
          resp: T("Good choice! Let's see what I have.", '¡Buena elección! Veamos qué tengo.') }
      ]
    },
    carnicero: {
      nombre: 'Mr. Max', titulo: T('Butcher and grocer', 'Carnicero y tendero'), emoji: '🧔🏻', rol: 'person', sexo: 'm', edad: 'adulto', tono: 0.8,
      ropa: { top: 'camisa', topColor: '#fafafa', bottom: 'pantalón', bottomColor: '#37474f' }, acc: 'apron',
      escena: 'puesto', letrero: 'BUTCHER', toldo: ['#c62828', '#ffffff'], color: '#c62828', estilo: 'tienda', temas: ['food'],
      solo: ['food', 'meat', 'sausage', 'hamburger', 'egg', 'cheese', 'butter', 'milk', 'yogurt', 'rice', 'beans', 'salt', 'pepper', 'oil',
        'sugar', 'honey', 'salty', 'market', 'supermarket'],
      conoce: T("Good day! I'm Max, the butcher. I also sell milk, eggs and more.", '¡Buen día! Soy Max, el carnicero. También vendo leche, huevos y más.'),
      ensena: [T('Look at my shop. Meat, cheese, eggs... everything!', 'Mira mi tienda. Carne, queso, huevos... ¡de todo!'),
        T('Let me show you more food.', 'Déjame mostrarte más comida.')],
      pide: [T('Quick! Hand me the {w}, please!', '¡Rápido! Pásame {el} {es}, por favor.'), T('I need the {w}. Can you give it to me?', 'Necesito {el} {es}. ¿Me {lo} das?'),
        T('The lady wants the {w}. Pass it to me, please.', 'La señora quiere {el} {es}. Pásame{lo}, por favor.')],
      charlas: [
        { npc: T('Can I help you?', '¿Te puedo ayudar?'),
          ok: [T('Yes, please. I need some food.', 'Sí, por favor. Necesito algo de comida.'), T("Yes! I'm hungry.", '¡Sí! Tengo hambre.')],
          bad: [T("Yes, I'm a lamp.", 'Sí, soy una lámpara.'), T('It is raining in my pocket.', 'Está lloviendo en mi bolsillo.')],
          resp: T('You came to the right place!', '¡Viniste al lugar correcto!') }
      ]
    },
    panadera: {
      nombre: 'Ms. Lily', titulo: T('Baker', 'Panadera'), emoji: '👩🏼‍🍳', rol: 'person', sexo: 'f', edad: 'adulto', tono: 1.15,
      ropa: { top: 'camisa', topColor: '#fff8e1', bottom: 'pantalón', bottomColor: '#8d6e63' }, acc: 'chefHat',
      escena: 'puesto', letrero: 'BAKERY', toldo: ['#f9a825', '#fff8e1'], color: '#f9a825', estilo: 'tienda', temas: ['food', 'numbers'],
      solo: ['bread', 'cake', 'cookie', 'chocolate', 'candy', 'dessert', 'snack', 'cereal', 'bakery', 'delicious',
        'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'half'],
      conoce: T("Hello! I'm Lily, the baker. Mmm, smell the bread!", '¡Hola! Soy Lily, la panadera. ¡Mmm, huele el pan!'),
      ensena: [T("Let's count and learn. I love numbers and cookies!", 'Contemos y aprendamos. ¡Me encantan los números y las galletas!'),
        T('Everything is fresh from the oven. Look!', 'Todo está recién salido del horno. ¡Mira!')],
      pide: [T('Can you pass me the {w}, please?', '¿Me pasas {el} {es}, por favor?'), T('I need the {w} for my order.', 'Necesito {el} {es} para mi pedido.')],
      charlas: [
        { npc: T('Do you like sweet things?', '¿Te gustan las cosas dulces?'),
          ok: [T('Yes, I love cake!', '¡Sí, me encanta el pastel!'), T('A little, yes.', 'Un poco, sí.')],
          bad: [T('Yes, I love the bus stop.', 'Sí, me encanta la parada del bus.'), T('No, I am a Tuesday.', 'No, soy un martes.')],
          resp: T('Me too! Sugar makes me happy.', '¡Yo también! El azúcar me pone feliz.') }
      ]
    },
    mesero: {
      nombre: 'Hugo', titulo: T('Waiter at the café', 'Mesero del café'), emoji: '🤵🏻', rol: 'waiter', sexo: 'm', edad: 'joven', tono: 1.0,
      escena: 'cafe', color: '#1565c0', estilo: 'tienda', temas: ['food'],
      solo: ['water', 'coffee', 'tea', 'juice', 'soda', 'pasta', 'soup', 'sandwich', 'pizza', 'fries', 'ice cream', 'breakfast', 'lunch',
        'dinner', 'meal', 'plate', 'cup', 'glass', 'bottle', 'fork', 'knife', 'spoon', 'menu', 'restaurant'],
      conoce: T("Welcome to the café! I'm Hugo, your waiter.", '¡Bienvenido al café! Soy Hugo, tu mesero.'),
      ensena: [T('Here is the menu. Let me show you some things.', 'Aquí está el menú. Déjame mostrarte algunas cosas.'),
        T("Today's special is... new words!", 'El especial de hoy es... ¡palabras nuevas!')],
      pide: [T('Table five wants the {w}. Can you hand it to me?', 'La mesa cinco quiere {el} {es}. ¿Me {lo} pasas?'),
        T('Please give me the {w}.', 'Por favor, dame {el} {es}.'), T('Where is the {w}? Pass it to me, please.', 'Busca {el} {es} y pásame{lo}, por favor.')],
      charlas: [
        { npc: T('Are you ready to order?', '¿Listo para pedir?'),
          ok: [T("Yes. I'd like a juice, please.", 'Sí. Quisiera un jugo, por favor.'), T('Can I see the menu, please?', '¿Puedo ver el menú, por favor?')],
          bad: [T("Yes, I'd like a bed, please.", 'Sí, quisiera una cama, por favor.'), T('My knee is blue.', 'Mi rodilla es azul.')],
          resp: T('Of course! Coming right up.', '¡Claro! Ya mismo.') }
      ]
    },
    enfermera: {
      nombre: 'Nurse Nora', titulo: T('Nurse', 'Enfermera'), emoji: '👩🏾‍⚕️', rol: 'nurse', sexo: 'f', edad: 'adulto', tono: 1.1, acc: 'nurseCap',
      escena: 'clinica', color: '#00acc1', estilo: 'cuerpo', temas: ['body'],
      conoce: T("Hi, I'm Nora, the nurse. Let's learn about the body!", 'Hola, soy Nora, la enfermera. ¡Aprendamos sobre el cuerpo!'),
      ensena: [T('A healthy body is a happy body. Look!', 'Un cuerpo sano es un cuerpo feliz. ¡Mira!'),
        T('Today we will check more parts of the body.', 'Hoy revisaremos más partes del cuerpo.')],
      charlas: [
        { npc: T("What's the matter? How do you feel?", '¿Qué te pasa? ¿Cómo te sientes?'),
          ok: [T("I feel great, thank you!", '¡Me siento genial, gracias!'), T('I have a little headache.', 'Tengo un poco de dolor de cabeza.')],
          bad: [T('I feel purple, thank you.', 'Me siento morado, gracias.'), T('I am a spoon.', 'Soy una cuchara.')],
          resp: T("Okay. Let's check your body.", 'Bien. Revisemos tu cuerpo.') }
      ]
    },
    tendera: {
      nombre: 'Ms. Mia', titulo: T('Clothes shop', 'Tienda de ropa'), emoji: '👩🏻‍💼', rol: 'person', sexo: 'f', edad: 'joven', tono: 1.15,
      ropa: { top: 'vestido', topColor: '#8e24aa' },
      escena: 'puesto', letrero: 'CLOTHES', toldo: ['#8e24aa', '#f3e5f5'], color: '#8e24aa', estilo: 'tienda', temas: ['clothes'],
      conoce: T("Hello! I'm Mia. Do you need new clothes?", '¡Hola! Soy Mia. ¿Necesitas ropa nueva?'),
      ensena: [T('Look at these beautiful clothes!', '¡Mira esta ropa tan bonita!'), T('New clothes arrived today. Look!', 'Hoy llegó ropa nueva. ¡Mira!')],
      pide: [T('Can you hand me the {w}? A customer wants to try it.', '¿Me pasas {el} {es}? Un cliente se {lo} quiere probar.'),
        T('Pass me the {w}, please.', 'Pásame {el} {es}, por favor.')],
      charlas: [
        { npc: T('Are you looking for something?', '¿Buscas algo?'),
          ok: [T('Yes, I need new clothes.', 'Sí, necesito ropa nueva.'), T("I'm just looking, thanks.", 'Solo estoy mirando, gracias.')],
          bad: [T('Yes, I need a cow.', 'Sí, necesito una vaca.'), T('The moon is my sister.', 'La luna es mi hermana.')],
          resp: T('Great! Let me help you.', '¡Genial! Déjame ayudarte.') }
      ]
    },
    pintora: {
      nombre: 'Clara', titulo: T('Street artist', 'Artista callejera'), emoji: '👩🏽‍🎨', rol: 'artist', sexo: 'f', edad: 'joven', tono: 1.2,
      escena: 'atril', color: '#ff7043', estilo: 'colores', temas: ['colors'],
      conoce: T("Hi! I'm Clara. I paint the whole street with colors!", '¡Hola! Soy Clara. ¡Pinto toda la calle de colores!'),
      ensena: [T('Colors make me happy. Look!', 'Los colores me hacen feliz. ¡Mira!'), T("Let's play with colors and shapes.", 'Juguemos con colores y formas.')],
      pide: [T('Can you give me the {w} paint, please?', '¿Me das la pintura {es}, por favor?')],
      charlas: [
        { npc: T("What's your favorite color?", '¿Cuál es tu color favorito?'),
          ok: [T('My favorite color is blue.', 'Mi color favorito es el azul.'), T('I like green!', '¡Me gusta el verde!')],
          bad: [T('My favorite color is Monday.', 'Mi color favorito es el lunes.'), T('I like my elbow.', 'Me gusta mi codo.')],
          resp: T('What a beautiful color!', '¡Qué color tan bonito!') }
      ]
    },
    mudanza: {
      nombre: 'Sam', titulo: T('New neighbor (moving in)', 'Vecino nuevo (de mudanza)'), emoji: '🧑🏻', rol: 'person', sexo: 'm', edad: 'joven', tono: 1.0,
      ropa: { top: 'camiseta', topColor: '#ff8f00', bottom: 'pantalón', bottomColor: '#3f6fb5' }, acc: 'cap',
      escena: 'mudanza', color: '#ff8f00', estilo: 'mudanza', temas: ['home', 'prepositions'],
      conoce: T("Hi! I'm Sam. I'm moving into this house. Can you help me?", '¡Hola! Soy Sam. Me estoy mudando a esta casa. ¿Me ayudas?'),
      ensena: [T('So many things! Let me show you.', '¡Cuántas cosas! Déjame mostrarte.'), T('More boxes, more things. Look!', 'Más cajas, más cosas. ¡Mira!')],
      pide: [T('Can you pass me the {w}, please?', '¿Me pasas {el} {es}, por favor?'), T('Where is the {w}? Give it to me, please.', 'Busca {el} {es} y dáme{lo}, por favor.')],
      charlas: [
        { npc: T('Can you help me move these boxes?', '¿Me ayudas a mover estas cajas?'),
          ok: [T('Sure! I can help you.', '¡Claro! Te puedo ayudar.'), T('Of course!', '¡Por supuesto!')],
          bad: [T('Sure! I am a box.', '¡Claro! Soy una caja.'), T("It's sunny in my soup.", 'Hace sol en mi sopa.')],
          resp: T("Thanks! You're very kind.", '¡Gracias! Eres muy amable.') }
      ]
    },
    conductora: {
      nombre: 'Ana', titulo: T('Bus driver', 'Conductora de bus'), emoji: '👩🏽‍✈️', rol: 'driver', sexo: 'f', edad: 'adulto', tono: 1.05,
      ropa: { top: 'camisa', topColor: '#1e88e5', bottom: 'pantalón', bottomColor: '#263238' }, acc: 'driverCap',
      escena: 'parada', color: '#1e88e5', estilo: 'ciudad', temas: ['town'],
      conoce: T("Hello! I'm Ana, the bus driver. I know every place in town!", '¡Hola! Soy Ana, la conductora del bus. ¡Conozco todos los lugares del pueblo!'),
      ensena: [T("Let's learn the town. Look!", 'Aprendamos sobre el pueblo. ¡Mira!'), T('All aboard! New places today.', '¡Todos a bordo! Lugares nuevos hoy.')],
      charlas: [
        { npc: T('Where do you want to go?', '¿A dónde quieres ir?'),
          ok: [T('To the park, please.', 'Al parque, por favor.'), T('I want to go downtown.', 'Quiero ir al centro.')],
          bad: [T('To my nose, please.', 'A mi nariz, por favor.'), T('I want to go blue.', 'Quiero ir azul.')],
          resp: T("Okay! Let's go.", '¡Bien! Vamos.') }
      ]
    },
    granjera: {
      nombre: 'Farmer Grace', titulo: T('Farmer', 'Granjera'), emoji: '👩🏼‍🌾', rol: 'farmer', sexo: 'f', edad: 'adulto', tono: 1.1,
      escena: 'granja', color: '#6d8b3a', estilo: 'animales', temas: ['animals'],
      conoce: T("Howdy! I'm Grace. I love animals. Come and see!", '¡Hola! Soy Grace. Amo a los animales. ¡Ven a ver!'),
      ensena: [T('Look at my animals!', '¡Mira mis animales!'), T('More animals came to the farm today.', 'Hoy llegaron más animales a la granja.')],
      charlas: [
        { npc: T('Do you have a pet?', '¿Tienes una mascota?'),
          ok: [T('Yes, I have a dog.', 'Sí, tengo un perro.'), T("No, I don't have a pet.", 'No, no tengo mascota.')],
          bad: [T('Yes, I have a Thursday.', 'Sí, tengo un jueves.'), T("No, it's my spoon.", 'No, es mi cuchara.')],
          resp: T('Animals are great friends.', 'Los animales son grandes amigos.') }
      ]
    },
    jardinero: {
      nombre: 'Luis', titulo: T('Gardener', 'Jardinero'), emoji: '👨🏽‍🌾', rol: 'person', sexo: 'm', edad: 'adulto', tono: 0.9,
      ropa: { top: 'camiseta', topColor: '#2e7d32', bottom: 'pantalón', bottomColor: '#6d4c41' }, acc: 'strawHat',
      escena: 'jardin', color: '#2e7d32', estilo: 'naturaleza', temas: ['nature'],
      conoce: T("Hello! I'm Luis, the gardener. Nature is beautiful!", '¡Hola! Soy Luis, el jardinero. ¡La naturaleza es hermosa!'),
      ensena: [T('Look around you. Nature is everywhere!', 'Mira a tu alrededor. ¡La naturaleza está en todas partes!'), T('The weather changes every day. Look!', 'El clima cambia cada día. ¡Mira!')],
      charlas: [
        { npc: T("How's the weather today?", '¿Cómo está el clima hoy?'),
          ok: [T("It's a beautiful day!", '¡Es un día hermoso!'), T("It's a little cold.", 'Hace un poco de frío.')],
          bad: [T("It's a beautiful fork!", '¡Es un tenedor hermoso!'), T('My aunt is a cloud.', 'Mi tía es una nube.')],
          resp: T('I love this weather!', '¡Me encanta este clima!') }
      ]
    },
    relojero: {
      nombre: 'Mr. Oscar', titulo: T('Clockmaker', 'Relojero'), emoji: '👴🏻', rol: 'person', sexo: 'm', edad: 'mayor', tono: 0.85,
      ropa: { top: 'suéter', topColor: '#6d4c41', bottom: 'pantalón', bottomColor: '#37474f', glasses: 'redondas' },
      escena: 'relojeria', color: '#6d4c41', estilo: 'tiempo', temas: ['time'],
      conoce: T("Tick tock! I'm Oscar, the clockmaker. Time is important!", '¡Tic tac! Soy Oscar, el relojero. ¡El tiempo es importante!'),
      ensena: [T("Let's learn about time.", 'Aprendamos sobre el tiempo.'), T('Tick tock, tick tock... more words about time!', 'Tic tac, tic tac... ¡más palabras del tiempo!')],
      charlas: [
        { npc: T('Excuse me, do you have the time?', 'Disculpa, ¿tienes la hora?'),
          ok: [T("Yes, it's ten o'clock.", "Sí, son las diez."), T("Sorry, I don't have a watch.", 'Lo siento, no tengo reloj.')],
          bad: [T("Yes, it's a banana.", 'Sí, es una banana.'), T('No, I have a horse.', 'No, tengo un caballo.')],
          resp: T('Thank you! Time flies!', '¡Gracias! ¡El tiempo vuela!') }
      ]
    },
    profesor: {
      nombre: 'Mr. Ben', titulo: T('Teacher', 'Profesor'), emoji: '👨🏻‍🏫', rol: 'teacher', sexo: 'm', edad: 'adulto', tono: 0.95,
      escena: 'escuela', color: '#3949ab', estilo: 'escuela', temas: ['school', 'numbers'],
      conoce: T("Good day! I'm Mr. Ben, the teacher. Welcome to class!", '¡Buen día! Soy el profesor Ben. ¡Bienvenido a clase!'),
      ensena: [T('Open your eyes and your ears. New lesson!', 'Abre los ojos y los oídos. ¡Nueva lección!'), T('Class is starting. Look at this!', 'La clase empieza. ¡Mira esto!')],
      pide: [T('Can you give me the {w}, please?', '¿Me das {el} {es}, por favor?'), T('Pass me the {w}, please.', 'Pásame {el} {es}, por favor.')],
      charlas: [
        { npc: T('Did you do your homework?', '¿Hiciste tu tarea?'),
          ok: [T('Yes, I did!', '¡Sí, la hice!'), T('Not yet, sorry.', 'Todavía no, perdón.')],
          bad: [T('Yes, I did a giraffe.', 'Sí, hice una jirafa.'), T('No, my homework is a cat.', 'No, mi tarea es un gato.')],
          resp: T("Good! Let's start the class.", '¡Bien! Empecemos la clase.') }
      ]
    },
    entrenadora: {
      nombre: 'Coach Zoe', titulo: T('Sports coach', 'Entrenadora'), emoji: '🏃🏽‍♀️', rol: 'player', sexo: 'f', edad: 'joven', tono: 1.15, acc: 'whistle',
      ropa: { top: 'camiseta', topColor: '#e53935', bottom: 'shorts', bottomColor: '#212121' },
      escena: 'cancha', color: '#e53935', estilo: 'deporte', temas: ['hobbies', 'adverbs'],
      conoce: T("Hey! I'm Coach Zoe. Are you ready to move?", '¡Hey! Soy la entrenadora Zoe. ¿Listo para moverte?'),
      ensena: [T('Sports, games and fun. Look!', 'Deportes, juegos y diversión. ¡Mira!'), T("New day, new game! Let's go!", '¡Nuevo día, nuevo juego! ¡Vamos!')],
      pide: [T('Pass me the {w}, quickly!', '¡Pásame {el} {es}, rápido!'), T('Can you give me the {w}, please?', '¿Me das {el} {es}, por favor?')],
      charlas: [
        { npc: T('Do you like sports?', '¿Te gustan los deportes?'),
          ok: [T('Yes, I love soccer!', '¡Sí, me encanta el fútbol!'), T('Yes, I like swimming.', 'Sí, me gusta nadar.')],
          bad: [T('Yes, I love my pillow.', 'Sí, me encanta mi almohada.'), T('No, I am a lemon.', 'No, soy un limón.')],
          resp: T("Awesome! Let's play!", '¡Genial! ¡A jugar!') }
      ]
    },
    mimo: {
      nombre: 'Leo the Mime', titulo: T('Street mime', 'Mimo callejero'), emoji: '🎭', rol: 'person', sexo: 'm', edad: 'joven', tono: 1.1, acc: 'mimeHat',
      ropa: { top: 'camiseta', topColor: '#fafafa', bottom: 'pantalón', bottomColor: '#212121' },
      escena: 'escenario', telon: '#c62828', color: '#212121', estilo: 'mimo', temas: ['verbs'],
      conoce: T("Shh! I'm Leo, the mime. I don't talk much... I act! Watch me!", '¡Shh! Soy Leo, el mimo. No hablo mucho... ¡actúo! ¡Mírame!'),
      ensena: [T('Watch me carefully!', '¡Mírame con atención!'), T('New show! New actions!', '¡Nuevo show! ¡Nuevas acciones!')],
      charlas: [
        { npc: T('Do you like my show?', '¿Te gusta mi show?'),
          ok: [T('Yes, it is very funny!', '¡Sí, es muy divertido!'), T('I love it!', '¡Me encanta!')],
          bad: [T('Yes, it is very Tuesday!', '¡Sí, es muy martes!'), T('I love the toilet.', 'Me encanta el inodoro.')],
          resp: T('Thank you! Now, watch this...', '¡Gracias! Ahora, mira esto...') }
      ]
    },
    mago: {
      nombre: 'The Great Maya', titulo: T('Magician', 'Maga'), emoji: '🎩', rol: 'person', sexo: 'f', edad: 'adulto', tono: 1.0, acc: 'topHat',
      ropa: { top: 'abrigo', topColor: '#4a148c', bottom: 'pantalón', bottomColor: '#212121' },
      escena: 'escenario', telon: '#4a148c', color: '#6a1b9a', estilo: 'mago', temas: ['adjectives'],
      conoce: T("Abracadabra! I'm the Great Maya. And this is Pip, my magic pet!", '¡Abracadabra! Soy la Gran Maya. ¡Y este es Pip, mi mascota mágica!'),
      ensena: [T('Pip can change! Watch the magic.', '¡Pip puede cambiar! Mira la magia.'), T('More magic today! Look at Pip.', '¡Más magia hoy! Mira a Pip.')],
      charlas: [
        { npc: T('Do you believe in magic?', '¿Crees en la magia?'),
          ok: [T('Yes, I do!', '¡Sí, creo!'), T('Maybe a little!', '¡Quizás un poco!')],
          bad: [T('Yes, I am a chair.', 'Sí, soy una silla.'), T('No, I am a tomato.', 'No, soy un tomate.')],
          resp: T('Then watch this!', '¡Entonces mira esto!') }
      ]
    }
  };

  // Quién enseña las palabras que no están en ninguna lista `solo`
  const DUENO_TEMA = {
    basics: 'vecina', people: 'abuela', numbers: 'profesor', colors: 'pintora', body: 'enfermera', clothes: 'tendera', food: 'mesero',
    home: 'mudanza', town: 'conductora', animals: 'granjera', nature: 'jardinero', time: 'relojero', school: 'profesor',
    hobbies: 'entrenadora', verbs: 'mimo', adjectives: 'mago', adverbs: 'entrenadora', prepositions: 'mudanza'
  };

  // Ruta del primer día (después cada día se arma según lo que falta por aprender)
  const PRIMER_DIA = ['vecina', 'frutero', 'panadera', 'enfermera', 'mimo', 'mago'];
  const POR_DIA = 6;          // encuentros por día
  const NUEVAS = 5;           // palabras nuevas por encuentro

  /* ---------- Ayudas para frases ---------- */
  const SONIDOS = { dog: 'woof woof', cat: 'meow', cow: 'moo', pig: 'oink oink', sheep: 'baa', duck: 'quack quack', chicken: 'cluck cluck',
    horse: 'neigh', lion: 'roar', owl: 'hoo hoo', bee: 'buzz', snake: 'hiss', frog: 'ribbit', mouse: 'squeak', wolf: 'awoo', bird: 'tweet tweet',
    goat: 'meh', monkey: 'ooh ooh ah ah', elephant: 'pawoo', parrot: 'hello, hello', tiger: 'grrr', bear: 'grrr' };

  // Verbos que no se pueden actuar: frase propia (los demás usan «Look at me! I can …!»)
  const VERBO_FRASE = {
    be: T('I want to be a star!', '¡Quiero ser una estrella!'), have: T('I have a red hat.', 'Tengo un sombrero rojo.'),
    do: T('I do my homework every day.', 'Hago mi tarea todos los días.'), get: T('I get a gift!', '¡Recibo un regalo!'),
    make: T('I make a cake.', 'Hago un pastel.'), say: T('I say hello to everyone.', 'Le digo hola a todos.'),
    tell: T('I tell a funny story.', 'Cuento una historia divertida.'), know: T('I know the answer!', '¡Sé la respuesta!'),
    think: T('I think... I think...', 'Pienso... pienso...'), want: T('I want an ice cream.', 'Quiero un helado.'),
    need: T('I need help!', '¡Necesito ayuda!'), like: T('I like music.', 'Me gusta la música.'), love: T('I love my family.', 'Amo a mi familia.'),
    feel: T('I feel happy today.', 'Me siento feliz hoy.'), use: T('I use a phone.', 'Uso un teléfono.'), keep: T('I keep my money in a box.', 'Guardo mi dinero en una caja.'),
    become: T('The caterpillar becomes a butterfly.', 'La oruga se convierte en mariposa.'), happen: T('What happened?', '¿Qué pasó?'),
    believe: T('I believe you.', 'Te creo.'), hope: T('I hope it is sunny tomorrow.', 'Espero que mañana haga sol.'),
    remember: T('I remember your name!', '¡Recuerdo tu nombre!'), forget: T('Oh no! I forget my keys.', '¡Oh no! Olvido mis llaves.'),
    understand: T('I understand English!', '¡Entiendo inglés!'), agree: T('I agree with you.', 'Estoy de acuerdo contigo.'),
    decide: T('I decide to stay.', 'Decido quedarme.'), cost: T('It costs five dollars.', 'Cuesta cinco dólares.'),
    lose: T('I lose my hat!', '¡Pierdo mi sombrero!'), find: T('I find a coin!', '¡Encuentro una moneda!'),
    live: T('I live in a big house.', 'Vivo en una casa grande.'), stay: T('I stay here.', 'Me quedo aquí.'), leave: T('I leave the room.', 'Salgo del cuarto.'),
    change: T('I change my clothes.', 'Me cambio de ropa.'), choose: T('I choose the red one.', 'Escojo el rojo.'), win: T('I win the race!', '¡Gano la carrera!'),
    save: T('I save money.', 'Ahorro dinero.'), spend: T('I spend my money.', 'Gasto mi dinero.'), borrow: T('Can I borrow your pen?', '¿Me prestas tu lápiz?'),
    enjoy: T('I enjoy the music.', 'Disfruto la música.'), explain: T('I explain the game.', 'Explico el juego.'), follow: T('Follow me!', '¡Sígueme!'),
    invite: T('I invite you to my party.', 'Te invito a mi fiesta.'), practice: T('I practice every day.', 'Practico todos los días.'),
    share: T('I share my cookie.', 'Comparto mi galleta.'), learn: T('I learn English.', 'Aprendo inglés.'), study: T('I study at night.', 'Estudio de noche.'),
    teach: T('I teach a class.', 'Enseño una clase.'), work: T('I work every day.', 'Trabajo todos los días.'),
    meet: T('Nice to meet you!', '¡Mucho gusto en conocerte!'), visit: T('I visit my grandma.', 'Visito a mi abuela.'), return: T('I return the book.', 'Devuelvo el libro.'),
    arrive: T('I arrive at school.', 'Llego a la escuela.'), send: T('I send a letter.', 'Envío una carta.'), show: T('I show you a photo.', 'Te muestro una foto.'),
    wait: T('I wait for the bus.', 'Espero el bus.'), grow: T('The plant grows.', 'La planta crece.'), pay: T('I pay for the bread.', 'Pago el pan.'),
    buy: T('I buy some apples.', 'Compro unas manzanas.'), sell: T('I sell flowers.', 'Vendo flores.'), relax: T('I relax on the sofa.', 'Me relajo en el sofá.'),
    rest: T('I rest after work.', 'Descanso después del trabajo.'), call: T('I call my friend.', 'Llamo a mi amigo.'), ask: T('Can I ask a question?', '¿Puedo hacer una pregunta?')
  };

  return { SALUDOS, REENCUENTROS, DESPEDIDAS, BIEN, MAL, PERSONAJES, DUENO_TEMA, PRIMER_DIA, POR_DIA, NUEVAS, SONIDOS, VERBO_FRASE };
})();
