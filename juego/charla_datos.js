'use strict';
/* ============================================================================
   ENGLISH TALK (JUEGO 3) · DATOS
   ----------------------------------------------------------------------------
   30 escenas de la vida diaria × 10 frases clave = las 300 frases más útiles
   del inglés americano. Cada escena es una conversación: la otra persona dice
   algo (npc) y TÚ respondes con la frase clave (tu). Las frases clave son las
   que se aprenden, se practican y se repasan.

   Formato de cada intercambio: [npcEn, npcEs, tuEn, tuEs]
   escena: fondo de CalleDib.ESC (cafe, escuela, casa, parada, puesto, ...)
============================================================================ */
const Charla = (() => {
  const E = (id, o) => Object.assign({ id }, o);

  const ESCENAS = [
    E('vecino', {
      titulo: { en: 'Meet your new neighbor', es: 'Conoce a tu nuevo vecino' },
      lugar: '🏠 Frente a tu casa', escena: 'casa', color: '#ff7043',
      npc: { nombre: 'Jake', sexo: 'm', edad: 'adulto', rol: 'person', emoji: '🙋🏻‍♂️', tono: 0.95 },
      dialogo: [
        ['Hi there! I just moved in next door.', '¡Hola! Me acabo de mudar a la casa de al lado.', 'Hi! Nice to meet you.', '¡Hola! Mucho gusto.'],
        ["I'm Jake. What's your name?", 'Soy Jake. ¿Cómo te llamas?', 'My name is Alex.', 'Me llamo Alex.'],
        ['Cool. How are you doing today?', 'Genial. ¿Cómo estás hoy?', "I'm doing great, thanks. And you?", 'Estoy muy bien, gracias. ¿Y tú?'],
        ["Pretty good! I'm still unpacking boxes.", '¡Bastante bien! Todavía estoy desempacando cajas.', 'Do you need any help?', '¿Necesitas ayuda?'],
        ["That's so nice of you. Where are you from?", 'Qué amable. ¿De dónde eres?', "I'm from Colombia.", 'Soy de Colombia.'],
        ['Awesome! How long have you lived here?', '¡Increíble! ¿Cuánto tiempo llevas viviendo aquí?', "I've lived here for two years.", 'He vivido aquí por dos años.'],
        ['Is it a quiet neighborhood?', '¿Es un barrio tranquilo?', "Yes, it's really quiet and safe.", 'Sí, es muy tranquilo y seguro.'],
        ['Good to know. Is there a store nearby?', 'Qué bueno saberlo. ¿Hay una tienda cerca?', "There's a supermarket around the corner.", 'Hay un supermercado a la vuelta de la esquina.'],
        ['Thanks a lot! You are very kind.', '¡Muchas gracias! Eres muy amable.', "You're welcome.", 'De nada.'],
        ['Well, I should get back to work.', 'Bueno, debería volver al trabajo.', 'See you around!', '¡Nos vemos por ahí!']
      ]
    }),
    E('cafe', {
      titulo: { en: 'Coffee with a friend', es: 'Un café con tu amiga' },
      lugar: '☕ En el café', escena: 'cafe', color: '#6d4c41',
      npc: { nombre: 'Emma', sexo: 'f', edad: 'joven', rol: 'person', emoji: '👩🏼', tono: 1.15 },
      dialogo: [
        ['Hey! Long time no see!', '¡Hola! ¡Cuánto tiempo sin verte!', "I know! It's so good to see you.", '¡Lo sé! Qué bueno verte.'],
        ['What have you been up to?', '¿Qué has estado haciendo?', "Not much. I've been really busy with work.", 'No mucho. He estado muy ocupado con el trabajo.'],
        ['What do you want to drink?', '¿Qué quieres tomar?', "I'd like a coffee, please.", 'Me gustaría un café, por favor.'],
        ['Do you want something to eat too?', '¿Quieres algo de comer también?', "No, thanks. I'm not hungry.", 'No, gracias. No tengo hambre.'],
        ['So, how is your family?', 'Y bueno, ¿cómo está tu familia?', "They're fine, thank you for asking.", 'Están bien, gracias por preguntar.'],
        ['I started a new job last month!', '¡Empecé un trabajo nuevo el mes pasado!', "That's awesome! Congratulations!", '¡Qué genial! ¡Felicitaciones!'],
        ['Thanks! But it is a little stressful.', '¡Gracias! Pero es un poco estresante.', "Don't worry. You'll do great.", 'No te preocupes. Te irá muy bien.'],
        ['I really missed hanging out with you.', 'De verdad extrañaba salir contigo.', 'Me too. We should do this more often.', 'Yo también. Deberíamos hacer esto más seguido.'],
        ["Let me get the check. It's my treat.", 'Déjame pedir la cuenta. Yo invito.', 'Are you sure? Thank you so much!', '¿Estás segura? ¡Muchísimas gracias!'],
        ['Text me when you get home, okay?', 'Escríbeme cuando llegues a casa, ¿sí?', 'Sure. Talk to you later!', 'Claro. ¡Hablamos luego!']
      ]
    }),
    E('colegio', {
      titulo: { en: 'First day at school', es: 'Primer día en el colegio' },
      lugar: '🏫 En el colegio', escena: 'escuela', color: '#1565c0',
      npc: { nombre: 'Mr. Brown', sexo: 'm', edad: 'adulto', rol: 'teacher', emoji: '👨🏻‍🏫', tono: 0.9 },
      dialogo: [
        ['Good morning! Welcome to our class.', '¡Buenos días! Bienvenido a nuestra clase.', 'Good morning, Mr. Brown.', 'Buenos días, señor Brown.'],
        ['Are you the new student?', '¿Eres el estudiante nuevo?', "Yes, I am. It's my first day.", 'Sí, soy yo. Es mi primer día.'],
        ['Great. Please take a seat.', 'Muy bien. Por favor, toma asiento.', 'Where can I sit?', '¿Dónde me puedo sentar?'],
        ['Right there, next to the window.', 'Justo ahí, al lado de la ventana.', 'Okay, thank you.', 'Está bien, gracias.'],
        ['Do you have a pencil and a notebook?', '¿Tienes un lápiz y un cuaderno?', 'Sorry, I forgot my pencil.', 'Lo siento, olvidé mi lápiz.'],
        ['No problem. You can borrow one.', 'No hay problema. Puedes pedir uno prestado.', 'Can I borrow a pencil, please?', '¿Me puedes prestar un lápiz, por favor?'],
        ['Today we are going to read a story.', 'Hoy vamos a leer una historia.', 'What page are we on?', '¿En qué página vamos?'],
        ['We are on page twelve.', 'Vamos en la página doce.', "I'm sorry, I don't understand.", 'Lo siento, no entiendo.'],
        ['Let me explain it again, slowly.', 'Déjame explicarlo otra vez, despacio.', 'Could you repeat that, please?', '¿Podría repetir eso, por favor?'],
        ['See you tomorrow. Do your homework!', 'Nos vemos mañana. ¡Haz tu tarea!', 'Have a nice day!', '¡Que tenga un buen día!']
      ]
    }),
    E('bus', {
      titulo: { en: 'At the bus stop', es: 'En la parada del bus' },
      lugar: '🚏 En la parada', escena: 'parada', color: '#00897b',
      npc: { nombre: 'Rita', sexo: 'f', edad: 'adulto', rol: 'driver', emoji: '👩🏽‍✈️', tono: 1.05 },
      dialogo: [
        ['Good morning! Where are you going?', '¡Buenos días! ¿A dónde vas?', "I'm going downtown.", 'Voy al centro.'],
        ['This bus goes downtown. Hop on!', 'Este bus va al centro. ¡Súbete!', 'How much is the ticket?', '¿Cuánto cuesta el pasaje?'],
        ["It's two dollars.", 'Son dos dólares.', 'Can I pay with a card?', '¿Puedo pagar con tarjeta?'],
        ['Sure, just tap it here.', 'Claro, solo acércala aquí.', 'How long does it take?', '¿Cuánto tiempo tarda?'],
        ['About twenty minutes.', 'Unos veinte minutos.', 'Can you tell me when to get off?', '¿Me puede decir cuándo bajarme?'],
        ['Of course. Which stop do you need?', 'Por supuesto. ¿Qué parada necesitas?', 'I need to get off at Main Street.', 'Necesito bajarme en Main Street.'],
        ['No problem. Have a seat in the front.', 'No hay problema. Siéntate adelante.', 'Is this seat taken?', '¿Este asiento está ocupado?'],
        ["No, it's free.", 'No, está libre.', "I'm running late for work.", 'Voy tarde para el trabajo.'],
        ["Here's your stop: Main Street!", '¡Aquí es tu parada: Main Street!', 'Excuse me, this is my stop.', 'Disculpe, esta es mi parada.'],
        ['Have a good one!', '¡Que te vaya bien!', 'Thanks for the ride!', '¡Gracias por traerme!']
      ]
    }),
    E('fruta', {
      titulo: { en: 'Shopping for fruit', es: 'Comprando fruta' },
      lugar: '🍎 En el puesto de frutas', escena: 'puesto', color: '#43a047', ch: { toldo: ['#43a047', '#ffffff'], letrero: 'FRUIT & VEG' },
      npc: { nombre: 'Tom', sexo: 'm', edad: 'mayor', rol: 'farmer', emoji: '👨🏻‍🌾', tono: 0.85 },
      dialogo: [
        ['Hi! Can I help you?', '¡Hola! ¿Te puedo ayudar?', "I'm just looking, thanks.", 'Solo estoy mirando, gracias.'],
        ['Take your time. Everything is fresh today.', 'Tómate tu tiempo. Todo está fresco hoy.', 'How much are the apples?', '¿Cuánto cuestan las manzanas?'],
        ["They're a dollar a pound.", 'Cuestan un dólar la libra.', "I'll take two pounds, please.", 'Me llevo dos libras, por favor.'],
        ['Anything else?', '¿Algo más?', 'Do you have any bananas?', '¿Tiene bananos?'],
        ["Sorry, we're out of bananas today.", 'Lo siento, hoy se nos acabaron los bananos.', 'Oh, no worries.', 'Ah, no te preocupes.'],
        ['We have great strawberries, though.', 'Pero tenemos unas fresas buenísimas.', 'Can I try one?', '¿Puedo probar una?'],
        ['Sure, go ahead.', 'Claro, adelante.', "Mmm, they're delicious!", '¡Mmm, están deliciosas!'],
        ['So, is that everything?', 'Entonces, ¿eso es todo?', "Yes, that's all. How much is it?", 'Sí, eso es todo. ¿Cuánto es?'],
        ["That's five dollars total.", 'Son cinco dólares en total.', 'Here you go.', 'Aquí tiene.'],
        ["Here's your change. Have a nice day!", 'Aquí está su cambio. ¡Que tenga un lindo día!', 'Thanks, you too!', '¡Gracias, igualmente!']
      ]
    }),
    E('doctor', {
      titulo: { en: 'At the doctor', es: 'En el médico' },
      lugar: '🏥 En la clínica', escena: 'clinica', color: '#00acc1',
      npc: { nombre: 'Dr. Lee', sexo: 'f', edad: 'adulto', rol: 'doctor', emoji: '👩🏻‍⚕️', tono: 1.0 },
      dialogo: [
        ['Hello. What seems to be the problem?', 'Hola. ¿Cuál parece ser el problema?', "I don't feel well.", 'No me siento bien.'],
        ['I see. What are your symptoms?', 'Ya veo. ¿Cuáles son tus síntomas?', 'I have a headache.', 'Tengo dolor de cabeza.'],
        ['Do you have a fever?', '¿Tienes fiebre?', 'I think I have a fever.', 'Creo que tengo fiebre.'],
        ['How long have you felt this way?', '¿Hace cuánto te sientes así?', 'Since yesterday.', 'Desde ayer.'],
        ['Does anything else hurt?', '¿Te duele algo más?', 'My throat hurts too.', 'También me duele la garganta.'],
        ['Are you allergic to any medicine?', '¿Eres alérgico a algún medicamento?', "No, I'm not allergic to anything.", 'No, no soy alérgico a nada.'],
        ["Okay. I'll give you some medicine.", 'Bien. Te daré un medicamento.', 'How often should I take it?', '¿Cada cuánto debo tomarlo?'],
        ['Twice a day, after meals.', 'Dos veces al día, después de las comidas.', 'Should I stay home from work?', '¿Debería quedarme en casa sin ir al trabajo?'],
        ['Yes, get some rest and drink lots of water.', 'Sí, descansa y toma mucha agua.', 'Okay, I will. Thank you, doctor.', 'Está bien, lo haré. Gracias, doctora.'],
        ['Feel better soon!', '¡Que te mejores pronto!', 'I hope so. Bye!', 'Eso espero. ¡Adiós!']
      ]
    }),
    E('restaurante', {
      titulo: { en: 'Dinner at a restaurant', es: 'Cena en un restaurante' },
      lugar: '🍽️ En el restaurante', escena: 'cafe', color: '#c62828',
      npc: { nombre: 'Hugo', sexo: 'm', edad: 'joven', rol: 'waiter', emoji: '🤵🏻', tono: 1.0 },
      dialogo: [
        ['Good evening! How many people?', '¡Buenas noches! ¿Cuántas personas?', 'A table for two, please.', 'Una mesa para dos, por favor.'],
        ['Right this way. Here are your menus.', 'Por aquí. Aquí están sus menús.', 'Can I see the menu, please?', '¿Puedo ver el menú, por favor?'],
        ['Are you ready to order?', '¿Están listos para ordenar?', 'Not yet. We need a few more minutes.', 'Todavía no. Necesitamos unos minutos más.'],
        ['Take your time.', 'Tómense su tiempo.', 'What do you recommend?', '¿Qué me recomienda?'],
        ['The chicken is our most popular dish.', 'El pollo es nuestro plato más popular.', "I'll have the chicken, please.", 'Quiero el pollo, por favor.'],
        ['Great choice. Anything to drink?', 'Excelente elección. ¿Algo de tomar?', "Can I get a glass of water?", '¿Me trae un vaso de agua?'],
        ['Here you go. How is everything?', 'Aquí tiene. ¿Qué tal todo?', 'Everything is great, thank you.', 'Todo está muy bien, gracias.'],
        ['Would you like some dessert?', '¿Le gustaría algún postre?', "No, thanks. I'm full.", 'No, gracias. Estoy lleno.'],
        ["Okay. Anything else I can get you?", 'Bien. ¿Algo más que les pueda traer?', 'Can we get the check, please?', '¿Nos trae la cuenta, por favor?'],
        ['Thank you! Please come again.', '¡Gracias! Vuelvan pronto.', 'Keep the change.', 'Quédese con el cambio.']
      ]
    }),
    E('planes', {
      titulo: { en: 'Weekend plans', es: 'Planes para el fin de semana' },
      lugar: '🌳 En el parque', escena: 'jardin', color: '#7cb342',
      npc: { nombre: 'Mia', sexo: 'f', edad: 'joven', rol: 'person', emoji: '👩🏽', tono: 1.2 },
      dialogo: [
        ['Hey! What are you doing this weekend?', '¡Hola! ¿Qué vas a hacer este fin de semana?', "I don't have any plans yet.", 'Todavía no tengo planes.'],
        ['Do you want to go to the beach on Saturday?', '¿Quieres ir a la playa el sábado?', "Sure, I'd love to!", '¡Claro, me encantaría!'],
        ['Awesome! What time is good for you?', '¡Genial! ¿A qué hora te queda bien?', 'How about ten in the morning?', '¿Qué tal a las diez de la mañana?'],
        ['Perfect. Should I pick you up?', 'Perfecto. ¿Paso por ti?', "That would be great.", 'Eso sería genial.'],
        ['Do you want to invite Sam too?', '¿Quieres invitar a Sam también?', "That's a great idea.", 'Es una gran idea.'],
        ['Will you bring some snacks?', '¿Traerás algo de comer?', "Sure, I'll bring sandwiches.", 'Claro, yo llevo sándwiches.'],
        ['What if it rains?', '¿Y si llueve?', "Then let's go to the movies instead.", 'Entonces vamos al cine mejor.'],
        ['Good plan. Are you free on Sunday too?', 'Buen plan. ¿También estás libre el domingo?', "Sorry, I'm busy on Sunday.", 'Lo siento, el domingo estoy ocupado.'],
        ['No problem. Saturday it is!', 'No hay problema. ¡Queda el sábado!', "I can't wait!", '¡No puedo esperar!'],
        ['Me neither! See you Saturday.', '¡Yo tampoco! Nos vemos el sábado.', 'See you then!', '¡Nos vemos entonces!']
      ]
    }),
    E('direcciones', {
      titulo: { en: 'Asking for directions', es: 'Pidiendo direcciones' },
      lugar: '🗺️ En la calle', escena: 'parada', color: '#5e35b1',
      npc: { nombre: 'Officer Diaz', sexo: 'm', edad: 'adulto', rol: 'police officer', emoji: '👮🏽‍♂️', tono: 0.9 },
      dialogo: [
        ['Hello! You look a little lost.', '¡Hola! Pareces un poco perdido.', "Excuse me, I'm lost.", 'Disculpe, estoy perdido.'],
        ['No problem. Where do you want to go?', 'No hay problema. ¿A dónde quieres ir?', 'How do I get to the train station?', '¿Cómo llego a la estación del tren?'],
        ['Go straight for two blocks.', 'Sigue derecho dos cuadras.', 'Go straight for two blocks?', '¿Seguir derecho dos cuadras?'],
        ['Yes. Then turn left at the bank.', 'Sí. Luego gira a la izquierda en el banco.', 'Turn left at the bank. Got it.', 'Girar a la izquierda en el banco. Entendido.'],
        ['The station is on your right.', 'La estación está a tu derecha.', 'Is it far from here?', '¿Queda lejos de aquí?'],
        ["No, it's only a five-minute walk.", 'No, está a solo cinco minutos a pie.', 'Can I walk there?', '¿Puedo ir caminando?'],
        ['Sure. It is close.', 'Claro. Está cerca.', 'Is there a restroom near here?', '¿Hay un baño cerca de aquí?'],
        ["There's one inside the station.", 'Hay uno dentro de la estación.', 'Could you show me on the map?', '¿Me lo podría mostrar en el mapa?'],
        ['Sure. We are here, and the station is here.', 'Claro. Estamos aquí y la estación está aquí.', 'Thank you so much for your help.', 'Muchísimas gracias por su ayuda.'],
        ['Anytime. Be safe!', 'Cuando quieras. ¡Cuídate!', 'Have a good day, officer.', 'Que tenga un buen día, oficial.']
      ]
    }),
    E('ropa', {
      titulo: { en: 'At the clothing store', es: 'En la tienda de ropa' },
      lugar: '👕 En la tienda de ropa', escena: 'puesto', color: '#8e24aa', ch: { toldo: ['#8e24aa', '#f3e5f5'], letrero: 'CLOTHES' },
      npc: { nombre: 'Lily', sexo: 'f', edad: 'joven', rol: 'person', emoji: '👩🏻‍💼', tono: 1.15 },
      dialogo: [
        ['Hi! Are you looking for anything special?', '¡Hola! ¿Buscas algo en especial?', "I'm looking for a jacket.", 'Estoy buscando una chaqueta.'],
        ['We have lots of jackets over here.', 'Tenemos muchas chaquetas por aquí.', 'Do you have this in blue?', '¿Tiene esta en azul?'],
        ['Yes, we do. What size are you?', 'Sí, la tenemos. ¿Qué talla eres?', "I'm a medium.", 'Soy talla mediana.'],
        ['Here is a medium in blue.', 'Aquí hay una mediana en azul.', 'Can I try it on?', '¿Me la puedo probar?'],
        ['Of course. The fitting room is over there.', 'Claro. El probador está allá.', "It's a little too small.", 'Me queda un poco pequeña.'],
        ['Let me get you a large.', 'Déjame traerte una grande.', 'This one fits perfectly.', 'Esta me queda perfecta.'],
        ['It looks great on you!', '¡Te queda muy bien!', 'How much does it cost?', '¿Cuánto cuesta?'],
        ["It's forty dollars, but it's on sale today.", 'Cuesta cuarenta dólares, pero hoy está en oferta.', "That's a good price. I'll take it.", 'Es un buen precio. Me la llevo.'],
        ['Would you like a bag?', '¿Quiere una bolsa?', "No, thanks. I don't need a bag.", 'No, gracias. No necesito bolsa.'],
        ['Thanks for shopping with us!', '¡Gracias por comprar con nosotros!', 'Thank you. Bye!', 'Gracias. ¡Adiós!']
      ]
    }),
    E('trabajo', {
      titulo: { en: 'A day at work', es: 'Un día en el trabajo' },
      lugar: '💼 En la oficina', escena: 'banca', color: '#455a64',
      npc: { nombre: 'Kevin', sexo: 'm', edad: 'adulto', rol: 'boss', emoji: '👨🏻‍💼', tono: 0.9 },
      dialogo: [
        ['Good morning! How was your weekend?', '¡Buenos días! ¿Cómo estuvo tu fin de semana?', 'It was great. How about yours?', 'Estuvo genial. ¿Y el tuyo?'],
        ['Pretty relaxing. Are you ready for the meeting?', 'Bastante relajado. ¿Listo para la reunión?', 'What time is the meeting?', '¿A qué hora es la reunión?'],
        ["It's at ten o'clock in room B.", 'Es a las diez en la sala B.', "I'll be there.", 'Allí estaré.'],
        ['Did you finish the report?', '¿Terminaste el informe?', "I'm almost done with it.", 'Ya casi lo termino.'],
        ['Great. Can you send it to me by noon?', 'Muy bien. ¿Me lo puedes enviar antes del mediodía?', "No problem. I'll send it to you.", 'No hay problema. Te lo envío.'],
        ['Do you have any questions about the project?', '¿Tienes alguna pregunta sobre el proyecto?', 'I have a quick question.', 'Tengo una pregunta rápida.'],
        ['Sure, go ahead.', 'Claro, adelante.', 'When is the deadline?', '¿Cuál es la fecha de entrega?'],
        ['The deadline is next Friday.', 'La fecha de entrega es el próximo viernes.', 'Let me check my schedule.', 'Déjame revisar mi agenda.'],
        ['Thanks for all your hard work.', 'Gracias por todo tu esfuerzo.', 'I appreciate it.', 'Lo aprecio.'],
        ['Are you going home now?', '¿Ya te vas a casa?', "Yes, I'm heading out. See you tomorrow.", 'Sí, ya me voy. Nos vemos mañana.']
      ]
    }),
    E('fiesta', {
      titulo: { en: 'A birthday party', es: 'Una fiesta de cumpleaños' },
      lugar: '🎉 En la fiesta', escena: 'escenario', color: '#e91e63', ch: { telon: '#ad1457' },
      npc: { nombre: 'Sofia', sexo: 'f', edad: 'joven', rol: 'singer', emoji: '👩🏻‍🎤', tono: 1.2 },
      dialogo: [
        ['Hey, you made it! Welcome to my party!', '¡Hola, viniste! ¡Bienvenido a mi fiesta!', 'Happy birthday!', '¡Feliz cumpleaños!'],
        ['Aww, thank you!', '¡Ay, gracias!', 'This is for you.', 'Esto es para ti.'],
        ['A gift? You shouldn\'t have!', '¿Un regalo? ¡No tenías que hacerlo!', 'I hope you like it.', 'Espero que te guste.'],
        ['I love it! Thank you so much!', '¡Me encanta! ¡Muchísimas gracias!', "I'm glad you like it.", 'Me alegra que te guste.'],
        ['Do you want something to drink?', '¿Quieres algo de tomar?', "Sure, I'll have some juice.", 'Claro, tomaré un jugo.'],
        ['Come on, let me introduce you to my friends.', 'Ven, déjame presentarte a mis amigos.', "It's a pleasure to meet you all.", 'Es un placer conocerlos a todos.'],
        ['Do you like the music?', '¿Te gusta la música?', 'This song is great!', '¡Esta canción está buenísima!'],
        ['Do you want to dance?', '¿Quieres bailar?', "Sure, let's dance!", '¡Claro, bailemos!'],
        ['Thanks for coming tonight.', 'Gracias por venir esta noche.', 'Thanks for inviting me.', 'Gracias por invitarme.'],
        ['Get home safe!', '¡Llega bien a casa!', 'I had a great time.', 'La pasé muy bien.']
      ]
    }),
    E('telefono', {
      titulo: { en: 'A phone call', es: 'Una llamada telefónica' },
      lugar: '📱 En casa, al teléfono', escena: 'casa', color: '#3949ab',
      npc: { nombre: 'Grandma Rose', sexo: 'f', edad: 'mayor', rol: 'grandmother', emoji: '👵🏼', tono: 1.05 },
      dialogo: [
        ['Hello? Is that you, sweetie?', '¿Hola? ¿Eres tú, cariño?', "Hi, Grandma! It's me.", '¡Hola, abuela! Soy yo.'],
        ['Can you hear me okay?', '¿Me escuchas bien?', "Sorry, I can't hear you very well.", 'Lo siento, no te escucho muy bien.'],
        ['Is that better now?', '¿Así está mejor?', 'Yes, now I can hear you.', 'Sí, ahora sí te escucho.'],
        ['I was thinking about you. How are you?', 'Estaba pensando en ti. ¿Cómo estás?', "I'm fine. I miss you.", 'Estoy bien. Te extraño.'],
        ['I miss you too, dear. When are you visiting?', 'Yo también te extraño, querido. ¿Cuándo vienes a visitarme?', "I'll visit you next week.", 'Te visitaré la próxima semana.'],
        ['Wonderful! I will bake a cake.', '¡Maravilloso! Haré un pastel.', "That sounds delicious.", 'Suena delicioso.'],
        ['Can you call your mom too?', '¿Puedes llamar a tu mamá también?', "Okay, I'll call her later.", 'Está bien, la llamo más tarde.'],
        ['Oh, someone is at the door.', 'Ay, alguien está en la puerta.', 'Do you want me to call you back?', '¿Quieres que te devuelva la llamada?'],
        ['Yes, please. In ten minutes.', 'Sí, por favor. En diez minutos.', 'Sure, talk to you soon.', 'Claro, hablamos pronto.'],
        ['I love you, sweetie.', 'Te quiero, cariño.', 'I love you too. Bye!', 'Yo también te quiero. ¡Adiós!']
      ]
    }),
    E('banco', {
      titulo: { en: 'At the bank', es: 'En el banco' },
      lugar: '🏦 En el banco', escena: 'banca', color: '#2e7d32',
      npc: { nombre: 'Mr. Clark', sexo: 'm', edad: 'mayor', rol: 'person', emoji: '👨🏼‍💼', tono: 0.85 },
      dialogo: [
        ['Next, please! How can I help you?', '¡El siguiente, por favor! ¿En qué le puedo ayudar?', "I'd like to open an account.", 'Me gustaría abrir una cuenta.'],
        ['Sure. Do you have an ID?', 'Claro. ¿Tiene una identificación?', 'Yes, here is my ID.', 'Sí, aquí está mi identificación.'],
        ['Please fill out this form.', 'Por favor, llene este formulario.', 'Do you have a pen?', '¿Tiene un bolígrafo?'],
        ['Here you go. Sign at the bottom.', 'Aquí tiene. Firme abajo.', 'Where do I sign?', '¿Dónde firmo?'],
        ['Right here, please.', 'Justo aquí, por favor.', 'I also want to deposit some money.', 'También quiero depositar algo de dinero.'],
        ['How much would you like to deposit?', '¿Cuánto le gustaría depositar?', 'Two hundred dollars, please.', 'Doscientos dólares, por favor.'],
        ['Done. Would you like a receipt?', 'Listo. ¿Desea un recibo?', 'Yes, please.', 'Sí, por favor.'],
        ['Is there anything else?', '¿Hay algo más?', 'Is there an ATM near here?', '¿Hay un cajero automático cerca de aquí?'],
        ['Yes, right outside the door.', 'Sí, justo afuera de la puerta.', 'Thank you for your help.', 'Gracias por su ayuda.'],
        ['My pleasure. Have a nice day!', 'Con gusto. ¡Que tenga un buen día!', 'You too. Goodbye!', 'Igualmente. ¡Adiós!']
      ]
    }),
    E('deporte', {
      titulo: { en: 'Playing soccer', es: 'Jugando fútbol' },
      lugar: '⚽ En la cancha', escena: 'cancha', color: '#f4511e',
      npc: { nombre: 'Coach Zoe', sexo: 'f', edad: 'adulto', rol: 'player', emoji: '🏃🏽‍♀️', tono: 1.1 },
      dialogo: [
        ['Hey! Do you want to play with us?', '¡Hola! ¿Quieres jugar con nosotros?', 'Can I join you?', '¿Puedo unirme?'],
        ['Of course! Are you good at soccer?', '¡Claro! ¿Eres bueno para el fútbol?', "I'm not very good, but I'll try.", 'No soy muy bueno, pero lo intentaré.'],
        ["That's the spirit! You're on my team.", '¡Esa es la actitud! Estás en mi equipo.', 'What position should I play?', '¿En qué posición debo jugar?'],
        ['You can play defense.', 'Puedes jugar en la defensa.', 'Pass me the ball!', '¡Pásame el balón!'],
        ['Nice pass! Now shoot!', '¡Buen pase! ¡Ahora patea!', 'Goal! We scored!', '¡Gol! ¡Anotamos!'],
        ["Wow, great job! Are you tired?", '¡Guau, muy bien! ¿Estás cansado?', "I'm a little tired. Can we take a break?", 'Estoy un poco cansado. ¿Podemos tomar un descanso?'],
        ['Sure. Drink some water.', 'Claro. Toma un poco de agua.', "I'm so thirsty.", 'Tengo mucha sed.'],
        ['Okay, back to the game. Hurry up!', 'Bueno, de vuelta al juego. ¡Apúrate!', "I'm coming!", '¡Ya voy!'],
        ['We won! Good game, everyone!', '¡Ganamos! ¡Buen partido a todos!', 'That was so much fun!', '¡Eso fue muy divertido!'],
        ['We play every Saturday. Come again!', 'Jugamos todos los sábados. ¡Vuelve!', 'Count me in!', '¡Cuenten conmigo!']
      ]
    }),
    E('hora', {
      titulo: { en: 'Time and schedules', es: 'La hora y los horarios' },
      lugar: '🕰️ En la relojería', escena: 'relojeria', color: '#795548',
      npc: { nombre: 'Mr. Oscar', sexo: 'm', edad: 'mayor', rol: 'person', emoji: '👴🏻', tono: 0.8 },
      dialogo: [
        ['Hello, young friend!', '¡Hola, joven amigo!', 'Excuse me, what time is it?', 'Disculpe, ¿qué hora es?'],
        ["It's a quarter to three.", 'Son las tres menos cuarto.', 'Oh no, I have to hurry.', 'Ay no, tengo que apurarme.'],
        ['Where do you need to be?', '¿Dónde necesitas estar?', 'I have an appointment at three.', 'Tengo una cita a las tres.'],
        ["Don't worry, you still have time.", 'No te preocupes, todavía tienes tiempo.', "That's a relief.", 'Qué alivio.'],
        ['Is your watch broken?', '¿Tu reloj está dañado?', 'My watch stopped working.', 'Mi reloj dejó de funcionar.'],
        ['Let me take a look. When did it stop?', 'Déjame ver. ¿Cuándo se detuvo?', 'It stopped this morning.', 'Se detuvo esta mañana.'],
        ['It needs a new battery.', 'Necesita una batería nueva.', 'When will it be ready?', '¿Cuándo estará listo?'],
        ['It will be ready tomorrow.', 'Estará listo mañana.', 'What time do you open?', '¿A qué hora abren?'],
        ['We open at nine and close at six.', 'Abrimos a las nueve y cerramos a las seis.', "I'll come back tomorrow morning.", 'Volveré mañana en la mañana.'],
        ['Perfect. Do not be late!', 'Perfecto. ¡No llegues tarde!', "I'll be on time.", 'Llegaré a tiempo.']
      ]
    }),
    E('farmacia', {
      titulo: { en: 'At the pharmacy', es: 'En la farmacia' },
      lugar: '💊 En la farmacia', escena: 'clinica', color: '#26a69a',
      npc: { nombre: 'Nurse Nora', sexo: 'f', edad: 'adulto', rol: 'nurse', emoji: '👩🏾‍⚕️', tono: 1.05 },
      dialogo: [
        ['Hi there. What can I get for you?', 'Hola. ¿Qué te puedo dar?', 'I need something for a cold.', 'Necesito algo para el resfriado.'],
        ['Do you have a cough?', '¿Tienes tos?', 'Yes, I have a bad cough.', 'Sí, tengo mucha tos.'],
        ['Try this cough syrup.', 'Prueba este jarabe para la tos.', 'Do I need a prescription?', '¿Necesito una receta médica?'],
        ["No, you don't need one for this.", 'No, para este no la necesitas.', 'How many times a day should I take it?', '¿Cuántas veces al día debo tomarlo?'],
        ['Three times a day.', 'Tres veces al día.', 'Can I take it with food?', '¿Lo puedo tomar con comida?'],
        ['Yes, that is fine.', 'Sí, está bien.', 'Does it make you sleepy?', '¿Da sueño?'],
        ['It might make you a little sleepy.', 'Te podría dar un poco de sueño.', "Okay, I'll take it at night.", 'Bien, lo tomaré en la noche.'],
        ['Do you need anything else?', '¿Necesitas algo más?', 'Do you sell tissues?', '¿Venden pañuelos desechables?'],
        ['Yes, aisle three.', 'Sí, en el pasillo tres.', 'Great, thank you.', 'Perfecto, gracias.'],
        ['Take care of yourself!', '¡Cuídate mucho!', 'Thanks, I will.', 'Gracias, lo haré.']
      ]
    }),
    E('aeropuerto', {
      titulo: { en: 'At the airport', es: 'En el aeropuerto' },
      lugar: '✈️ En el aeropuerto', escena: 'banca', color: '#1e88e5',
      npc: { nombre: 'Captain Ana', sexo: 'f', edad: 'adulto', rol: 'pilot', emoji: '👩🏽‍✈️', tono: 1.0 },
      dialogo: [
        ['Good morning. May I see your passport?', 'Buenos días. ¿Puedo ver su pasaporte?', 'Here is my passport.', 'Aquí está mi pasaporte.'],
        ['Where are you flying today?', '¿A dónde vuela hoy?', "I'm flying to New York.", 'Vuelo a Nueva York.'],
        ['Do you have any bags to check?', '¿Tiene maletas para documentar?', 'I have one suitcase.', 'Tengo una maleta.'],
        ['Would you like a window or an aisle seat?', '¿Prefiere ventana o pasillo?', "I'd like a window seat, please.", 'Quisiera un asiento de ventana, por favor.'],
        ['Here is your boarding pass.', 'Aquí está su pase de abordar.', 'What gate do I go to?', '¿A qué puerta debo ir?'],
        ['Gate twelve. Boarding starts at nine.', 'Puerta doce. El abordaje empieza a las nueve.', 'Is the flight on time?', '¿El vuelo está a tiempo?'],
        ["Yes, it's on time.", 'Sí, está a tiempo.', 'How long is the flight?', '¿Cuánto dura el vuelo?'],
        ['About five hours.', 'Unas cinco horas.', 'Where can I get something to eat?', '¿Dónde puedo comer algo?'],
        ['There are restaurants past security.', 'Hay restaurantes después del control de seguridad.', 'Thank you for the information.', 'Gracias por la información.'],
        ['Have a nice flight!', '¡Que tenga un buen vuelo!', 'Thanks! Have a great day.', '¡Gracias! Que tenga un gran día.']
      ]
    }),
    E('hotel', {
      titulo: { en: 'Checking in at a hotel', es: 'Registrándote en el hotel' },
      lugar: '🏨 En el hotel', escena: 'banca', color: '#6a1b9a',
      npc: { nombre: 'Daniel', sexo: 'm', edad: 'joven', rol: 'waiter', emoji: '🧑🏻‍💼', tono: 1.0 },
      dialogo: [
        ['Welcome to the Grand Hotel!', '¡Bienvenido al Grand Hotel!', 'I have a reservation.', 'Tengo una reservación.'],
        ['What name is it under?', '¿A nombre de quién está?', "It's under the name Garcia.", 'Está a nombre de García.'],
        ['Found it. Two nights, right?', 'La encontré. Dos noches, ¿cierto?', "Yes, that's right.", 'Sí, así es.'],
        ['Here is your room key. Room 305.', 'Aquí está la llave. Habitación 305.', 'What floor is it on?', '¿En qué piso está?'],
        ["It's on the third floor.", 'Está en el tercer piso.', 'Is breakfast included?', '¿El desayuno está incluido?'],
        ['Yes, from seven to ten.', 'Sí, de siete a diez.', "What's the Wi-Fi password?", '¿Cuál es la contraseña del wifi?'],
        ["It's on the back of your key card.", 'Está atrás de tu tarjeta llave.', 'What time is checkout?', '¿A qué hora es la salida?'],
        ['Checkout is at noon.', 'La salida es al mediodía.', 'Could I get an extra towel?', '¿Me podrían dar una toalla extra?'],
        ["Sure, I'll send one up.", 'Claro, le subo una.', 'Could you call a taxi for me tomorrow?', '¿Me podría pedir un taxi para mañana?'],
        ['Of course. Enjoy your stay!', 'Por supuesto. ¡Disfrute su estadía!', 'Thank you very much.', 'Muchas gracias.']
      ]
    }),
    E('disculpas', {
      titulo: { en: 'Saying sorry', es: 'Pedir disculpas' },
      lugar: '☕ En la cafetería', escena: 'cafe', color: '#f57c00',
      npc: { nombre: 'Ben', sexo: 'm', edad: 'joven', rol: 'person', emoji: '🧑🏽', tono: 1.0 },
      dialogo: [
        ['Hey! I waited for you for an hour.', '¡Oye! Te esperé una hora.', "I'm so sorry I'm late.", 'Lo siento mucho, llegué tarde.'],
        ['What happened?', '¿Qué pasó?', 'I missed the bus.', 'Perdí el bus.'],
        ['You could have called me.', 'Me hubieras llamado.', 'My phone died.', 'Se me descargó el celular.'],
        ['Oh, I see.', 'Ah, ya veo.', "It won't happen again.", 'No volverá a pasar.'],
        ["Okay, it's fine. Don't worry about it.", 'Bueno, está bien. No te preocupes.', 'Thanks for understanding.', 'Gracias por entender.'],
        ['Oops! You spilled my coffee.', '¡Uy! Me regaste el café.', 'Oh no! It was an accident.', '¡Ay no! Fue un accidente.'],
        ["It's okay, it happens.", 'Está bien, pasa.', 'Let me buy you another one.', 'Déjame comprarte otro.'],
        ["You don't have to.", 'No tienes que hacerlo.', 'I insist.', 'Insisto.'],
        ['Thanks. You are a good friend.', 'Gracias. Eres un buen amigo.', 'No hard feelings?', '¿Sin rencores?'],
        ['No hard feelings. We are cool.', 'Sin rencores. Estamos bien.', "I'm glad we're cool.", 'Me alegra que estemos bien.']
      ]
    }),
    E('familia', {
      titulo: { en: 'Talking about family', es: 'Hablando de la familia' },
      lugar: '📸 En la banca del parque', escena: 'jardin', color: '#d81b60',
      npc: { nombre: 'Grandma Lucy', sexo: 'f', edad: 'mayor', rol: 'grandmother', emoji: '👵🏽', tono: 1.05 },
      dialogo: [
        ['Look at my photos! Do you have a big family?', '¡Mira mis fotos! ¿Tienes una familia grande?', 'I have a big family.', 'Tengo una familia grande.'],
        ['How many brothers and sisters do you have?', '¿Cuántos hermanos y hermanas tienes?', 'I have two brothers and one sister.', 'Tengo dos hermanos y una hermana.'],
        ['Are you the oldest?', '¿Eres el mayor?', "No, I'm the youngest.", 'No, soy el menor.'],
        ['Do you live with your parents?', '¿Vives con tus papás?', 'I live with my parents.', 'Vivo con mis papás.'],
        ['What does your mom do?', '¿A qué se dedica tu mamá?', 'My mom is a teacher.', 'Mi mamá es profesora.'],
        ['And your dad?', '¿Y tu papá?', 'My dad works at a hospital.', 'Mi papá trabaja en un hospital.'],
        ['Do you look like your mom?', '¿Te pareces a tu mamá?', 'People say I look like my dad.', 'La gente dice que me parezco a mi papá.'],
        ['Are you married?', '¿Estás casado?', "No, I'm single.", 'No, soy soltero.'],
        ['Do you have any pets?', '¿Tienes mascotas?', 'I have a dog named Max.', 'Tengo un perro llamado Max.'],
        ['Family is the most important thing.', 'La familia es lo más importante.', 'I totally agree.', 'Estoy totalmente de acuerdo.']
      ]
    }),
    E('hobbies', {
      titulo: { en: 'Hobbies and free time', es: 'Pasatiempos y tiempo libre' },
      lugar: '🎨 En el taller de arte', escena: 'atril', color: '#00838f',
      npc: { nombre: 'Clara', sexo: 'f', edad: 'joven', rol: 'artist', emoji: '👩🏽‍🎨', tono: 1.15 },
      dialogo: [
        ['What do you like to do in your free time?', '¿Qué te gusta hacer en tu tiempo libre?', 'I like to read and listen to music.', 'Me gusta leer y escuchar música.'],
        ['Cool! What kind of music do you like?', '¡Genial! ¿Qué tipo de música te gusta?', 'I love pop music.', 'Me encanta la música pop.'],
        ['Do you play any instruments?', '¿Tocas algún instrumento?', 'I play the guitar a little.', 'Toco un poco la guitarra.'],
        ['I love painting. Do you like art?', 'Me encanta pintar. ¿Te gusta el arte?', "I'm not good at painting.", 'No soy bueno pintando.'],
        ["It's easy. Do you want to try?", 'Es fácil. ¿Quieres intentarlo?', 'Sure, why not?', 'Claro, ¿por qué no?'],
        ['How often do you exercise?', '¿Qué tan seguido haces ejercicio?', 'I go to the gym three times a week.', 'Voy al gimnasio tres veces por semana.'],
        ['Do you like watching movies?', '¿Te gusta ver películas?', 'My favorite movie is Toy Story.', 'Mi película favorita es Toy Story.'],
        ['What do you do on weekends?', '¿Qué haces los fines de semana?', 'I usually hang out with my friends.', 'Normalmente salgo con mis amigos.'],
        ['Have you ever been to a concert?', '¿Alguna vez has ido a un concierto?', "No, I've never been to one.", 'No, nunca he ido a uno.'],
        ["Let's go together sometime!", '¡Vamos juntos algún día!', 'That sounds like fun!', '¡Suena divertido!']
      ]
    }),
    E('cine', {
      titulo: { en: 'At the movies', es: 'En el cine' },
      lugar: '🎬 En el cine', escena: 'escenario', color: '#4a148c', ch: { telon: '#4a148c' },
      npc: { nombre: 'Leo', sexo: 'm', edad: 'joven', rol: 'person', emoji: '🧑🏻', tono: 1.05 },
      dialogo: [
        ['Hi! What movie do you want to see?', '¡Hola! ¿Qué película quieres ver?', 'Two tickets for the action movie, please.', 'Dos boletas para la película de acción, por favor.'],
        ['The next show is at seven thirty.', 'La próxima función es a las siete y media.', 'What time does it end?', '¿A qué hora termina?'],
        ['It ends around nine forty-five.', 'Termina como a las diez menos cuarto.', "Let's get some popcorn.", 'Compremos palomitas de maíz.'],
        ['Good idea! Small or large?', '¡Buena idea! ¿Pequeña o grande?', "Let's get a large one to share.", 'Compremos una grande para compartir.'],
        ['Where do you want to sit?', '¿Dónde te quieres sentar?', "Let's sit in the middle.", 'Sentémonos en el medio.'],
        ['Shh! The movie is starting.', '¡Shh! La película está empezando.', 'Can you move over a little?', '¿Te puedes correr un poquito?'],
        ['Sure. Can you see the screen?', 'Claro. ¿Ves la pantalla?', 'Now I can see. Thanks.', 'Ahora sí veo. Gracias.'],
        ['So, what did you think of the movie?', 'Y bueno, ¿qué te pareció la película?', 'It was amazing!', '¡Estuvo increíble!'],
        ['The ending was so sad.', 'El final fue muy triste.', 'I almost cried.', 'Casi lloro.'],
        ['We should watch the next one too.', 'Deberíamos ver la siguiente también.', "Definitely. I'm in!", 'Definitivamente. ¡Me apunto!']
      ]
    }),
    E('emergencia', {
      titulo: { en: 'An emergency', es: 'Una emergencia' },
      lugar: '🚨 En la calle', escena: 'parada', color: '#d32f2f',
      npc: { nombre: 'Firefighter Max', sexo: 'm', edad: 'adulto', rol: 'firefighter', emoji: '👨🏼‍🚒', tono: 0.85 },
      dialogo: [
        ['Hey, are you okay?', 'Oye, ¿estás bien?', 'Help! I need help!', '¡Ayuda! ¡Necesito ayuda!'],
        ['Calm down. What happened?', 'Cálmate. ¿Qué pasó?', 'Someone stole my wallet.', 'Alguien se robó mi billetera.'],
        ['Are you hurt?', '¿Estás herido?', "No, I'm not hurt.", 'No, no estoy herido.'],
        ['Good. Did you see who did it?', 'Bien. ¿Viste quién fue?', 'He ran that way.', 'Corrió por allá.'],
        ['We need to report it to the police.', 'Tenemos que reportarlo a la policía.', 'Please call the police.', 'Por favor, llame a la policía.'],
        ['They are on their way. What was in your wallet?', 'Ya vienen en camino. ¿Qué tenías en la billetera?', 'My ID and my credit cards.', 'Mi identificación y mis tarjetas de crédito.'],
        ['You should cancel your cards right away.', 'Deberías cancelar tus tarjetas de inmediato.', 'Can I use your phone?', '¿Puedo usar su teléfono?'],
        ['Sure, here you go.', 'Claro, aquí tienes.', "It's an emergency.", 'Es una emergencia.'],
        ['Everything will be okay. Stay calm.', 'Todo va a estar bien. Mantén la calma.', 'Thank you for staying with me.', 'Gracias por quedarse conmigo.'],
        ['Be careful out there.', 'Ten cuidado por ahí.', "I'll be more careful.", 'Tendré más cuidado.']
      ]
    }),
    E('animo', {
      titulo: { en: 'Cheering up a friend', es: 'Animando a un amigo' },
      lugar: '🌳 En el parque', escena: 'jardin', color: '#5c6bc0',
      npc: { nombre: 'Ryan', sexo: 'm', edad: 'joven', rol: 'person', emoji: '🧑🏾', tono: 0.95 },
      dialogo: [
        ['Hey...', 'Hola...', 'What\'s wrong? You look sad.', '¿Qué pasa? Te ves triste.'],
        ["I didn't get the job.", 'No me dieron el trabajo.', "I'm sorry to hear that.", 'Siento mucho escuchar eso.'],
        ['I really wanted it.', 'De verdad lo quería.', 'I know how you feel.', 'Sé cómo te sientes.'],
        ['Maybe I am not good enough.', 'Tal vez no soy lo suficientemente bueno.', "Don't say that. You're very talented.", 'No digas eso. Tienes mucho talento.'],
        ['You really think so?', '¿De verdad lo crees?', "Of course. Don't give up.", 'Por supuesto. No te rindas.'],
        ['I guess there are other jobs.', 'Supongo que hay otros trabajos.', 'Everything happens for a reason.', 'Todo pasa por una razón.'],
        ['Thanks for listening.', 'Gracias por escucharme.', "I'm here for you.", 'Aquí estoy para ti.'],
        ['Can we do something fun?', '¿Podemos hacer algo divertido?', "Let's grab something to eat.", 'Vamos a comer algo.'],
        ['I feel a little better now.', 'Ya me siento un poco mejor.', 'Cheer up! Tomorrow is a new day.', '¡Ánimo! Mañana es un nuevo día.'],
        ["You're the best.", 'Eres el mejor.', "That's what friends are for.", 'Para eso están los amigos.']
      ]
    }),
    E('clase', {
      titulo: { en: 'In English class', es: 'En la clase de inglés' },
      lugar: '📚 En el salón', escena: 'escuela', color: '#0277bd',
      npc: { nombre: 'Ms. Taylor', sexo: 'f', edad: 'adulto', rol: 'teacher', emoji: '👩🏼‍🏫', tono: 1.05 },
      dialogo: [
        ['Any questions so far?', '¿Alguna pregunta hasta ahora?', 'I have a question.', 'Tengo una pregunta.'],
        ['Go ahead.', 'Adelante.', 'What does "awesome" mean?', '¿Qué significa "awesome"?'],
        ['It means really, really good.', 'Significa muy, muy bueno.', 'How do you say "gato" in English?', '¿Cómo se dice "gato" en inglés?'],
        ['We say "cat".', 'Decimos "cat".', 'How do you spell it?', '¿Cómo se deletrea?'],
        ['C-A-T.', 'C-A-T.', 'Can you speak more slowly, please?', '¿Puede hablar más despacio, por favor?'],
        ['Sure. Is this clear now?', 'Claro. ¿Ya está claro?', 'Now I understand.', 'Ahora entiendo.'],
        ['Great! Please open your books.', '¡Muy bien! Por favor abran sus libros.', 'Can you write it on the board?', '¿Lo puede escribir en el tablero?'],
        ['Of course. Who wants to read?', 'Por supuesto. ¿Quién quiere leer?', 'Can I try?', '¿Puedo intentarlo?'],
        ['Excellent reading! Is it difficult?', '¡Excelente lectura! ¿Es difícil?', "It's hard, but I'm learning.", 'Es difícil, pero estoy aprendiendo.'],
        ['Keep practicing every day!', '¡Sigue practicando todos los días!', 'Thank you, teacher.', 'Gracias, profesora.']
      ]
    }),
    E('panaderia', {
      titulo: { en: 'At the bakery', es: 'En la panadería' },
      lugar: '🥐 En la panadería', escena: 'puesto', color: '#f9a825', ch: { toldo: ['#f9a825', '#fff8e1'], letrero: 'BAKERY' },
      npc: { nombre: 'Ms. Rosie', sexo: 'f', edad: 'adulto', rol: 'person', emoji: '👩🏼‍🍳', tono: 1.1 },
      dialogo: [
        ['Good morning! Everything is fresh from the oven.', '¡Buenos días! Todo está recién salido del horno.', 'It smells so good in here!', '¡Huele muy rico aquí!'],
        ['Thank you! What would you like?', '¡Gracias! ¿Qué te gustaría?', "I'd like a loaf of bread.", 'Quisiera un pan grande.'],
        ['White or whole wheat?', '¿Blanco o integral?', 'Whole wheat, please.', 'Integral, por favor.'],
        ['Anything sweet today?', '¿Algo dulce hoy?', 'What kind of cookies do you have?', '¿Qué tipo de galletas tiene?'],
        ['Chocolate chip and oatmeal.', 'De chispas de chocolate y de avena.', "I'll take six chocolate chip cookies.", 'Me llevo seis galletas de chispas de chocolate.'],
        ['Is it for a special day?', '¿Es para un día especial?', "It's for my mom's birthday.", 'Es para el cumpleaños de mi mamá.'],
        ['Then you need a cake!', '¡Entonces necesitas un pastel!', 'Can I order a cake for Friday?', '¿Puedo encargar un pastel para el viernes?'],
        ['Sure. What should it say?', 'Claro. ¿Qué debe decir?', 'Please write "Happy Birthday, Mom".', 'Por favor escriba "Feliz cumpleaños, mamá".'],
        ['No problem. Pick it up Friday at noon.', 'No hay problema. Recógelo el viernes al mediodía.', 'Do I pay now or later?', '¿Pago ahora o después?'],
        ['You can pay when you pick it up.', 'Puedes pagar cuando lo recojas.', "Perfect. See you on Friday!", 'Perfecto. ¡Nos vemos el viernes!']
      ]
    }),
    E('granja', {
      titulo: { en: 'A trip to the farm', es: 'Un paseo a la granja' },
      lugar: '🐄 En la granja', escena: 'granja', color: '#689f38',
      npc: { nombre: 'Farmer Grace', sexo: 'f', edad: 'adulto', rol: 'farmer', emoji: '👩🏼‍🌾', tono: 1.0 },
      dialogo: [
        ['Welcome to the farm! Is this your first time here?', '¡Bienvenido a la granja! ¿Es tu primera vez aquí?', 'Yes, this is my first time.', 'Sí, es mi primera vez.'],
        ['What do you think?', '¿Qué te parece?', "It's beautiful here!", '¡Es hermoso aquí!'],
        ['We have cows, pigs, and chickens.', 'Tenemos vacas, cerdos y gallinas.', 'Can I take a picture?', '¿Puedo tomar una foto?'],
        ['Sure! Do you want to feed the animals?', '¡Claro! ¿Quieres alimentar a los animales?', "Yes! I'd love to.", '¡Sí! Me encantaría.'],
        ['Be careful, the goat is hungry.', 'Ten cuidado, la cabra tiene hambre.', 'Is it safe?', '¿Es seguro?'],
        ["Yes, he is friendly.", 'Sí, es amistoso.', 'What time do you wake up?', '¿A qué hora te levantas?'],
        ['At five in the morning, every day.', 'A las cinco de la mañana, todos los días.', 'That sounds like hard work.', 'Eso suena a trabajo duro.'],
        ['It is, but I love it.', 'Lo es, pero me encanta.', 'I prefer the countryside to the city.', 'Prefiero el campo a la ciudad.'],
        ['Take some fresh eggs home!', '¡Llévate unos huevos frescos!', "That's so kind of you.", 'Qué amable de tu parte.'],
        ['Come back anytime!', '¡Vuelve cuando quieras!', "I'll definitely come back.", 'Sin duda volveré.']
      ]
    }),
    E('cocina', {
      titulo: { en: 'Cooking together', es: 'Cocinando juntos' },
      lugar: '🍳 En la casa de tu amiga', escena: 'casa', color: '#ef6c00',
      npc: { nombre: 'Chloe', sexo: 'f', edad: 'joven', rol: 'person', emoji: '👩🏻‍🦰', tono: 1.15 },
      dialogo: [
        ['Welcome! Make yourself at home.', '¡Bienvenido! Siéntete como en casa.', 'Your house is really nice.', 'Tu casa es muy bonita.'],
        ["Thanks! Let's make dinner together.", '¡Gracias! Hagamos la cena juntos.', 'What are we cooking?', '¿Qué vamos a cocinar?'],
        ['Pasta with tomato sauce.', 'Pasta con salsa de tomate.', 'What can I do to help?', '¿Qué puedo hacer para ayudar?'],
        ['Can you cut the onions?', '¿Puedes cortar las cebollas?', 'Where is the knife?', '¿Dónde está el cuchillo?'],
        ['In the top drawer.', 'En el cajón de arriba.', "I'm not a good cook.", 'No soy buen cocinero.'],
        ["Don't worry, it's easy.", 'No te preocupes, es fácil.', 'Can I taste it?', '¿Puedo probarlo?'],
        ['Sure. How is it?', 'Claro. ¿Cómo está?', 'It needs a little more salt.', 'Le falta un poco de sal.'],
        ['Dinner is ready! Help yourself.', '¡La cena está lista! Sírvete.', 'This is delicious!', '¡Esto está delicioso!'],
        ['Would you like some more?', '¿Quieres un poco más?', "I'm full, but it was amazing.", 'Estoy lleno, pero estuvo increíble.'],
        ["I'll wash the dishes.", 'Yo lavo los platos.', 'Let me help you clean up.', 'Déjame ayudarte a limpiar.']
      ]
    }),
    E('despedida', {
      titulo: { en: 'Saying goodbye', es: 'Despedirse' },
      lugar: '🚏 En la estación', escena: 'parada', color: '#00695c',
      npc: { nombre: 'Noah', sexo: 'm', edad: 'joven', rol: 'person', emoji: '👱🏻‍♂️', tono: 1.0 },
      dialogo: [
        ['So, this is it. My train leaves soon.', 'Bueno, llegó el momento. Mi tren sale pronto.', "I can't believe you're leaving.", 'No puedo creer que te vas.'],
        ['I know. Time flies.', 'Lo sé. El tiempo vuela.', "I'm going to miss you.", 'Te voy a extrañar.'],
        ["I'll miss you too.", 'Yo también te extrañaré.', 'Keep in touch, okay?', 'Seguimos en contacto, ¿sí?'],
        ['Of course. I will text you every day.', 'Claro. Te escribiré todos los días.', 'Call me when you get there.', 'Llámame cuando llegues.'],
        ['I promise.', 'Lo prometo.', 'Have a safe trip!', '¡Que tengas un buen viaje!'],
        ['Thanks for everything.', 'Gracias por todo.', 'It was a pleasure.', 'Fue un placer.'],
        ['Will you visit me?', '¿Vendrás a visitarme?', "I'll visit you as soon as I can.", 'Te visitaré tan pronto como pueda.'],
        ["Don't forget about me!", '¡No te olvides de mí!', 'I will never forget you.', 'Nunca te olvidaré.'],
        ['Come here. Give me a hug.', 'Ven acá. Dame un abrazo.', 'Take care of yourself.', 'Cuídate mucho.'],
        ['Goodbye, my friend!', '¡Adiós, amigo!', 'Goodbye! See you soon.', '¡Adiós! Nos vemos pronto.']
      ]
    }),
    E('opiniones', {
      titulo: { en: 'Sharing opinions', es: 'Dando opiniones' },
      lugar: '☕ En la terraza del café', escena: 'cafe', color: '#00897b',
      npc: { nombre: 'Olivia', sexo: 'f', edad: 'adulto', rol: 'person', emoji: '👩🏾', tono: 1.05 },
      dialogo: [
        ['What do you think about this city?', '¿Qué piensas de esta ciudad?', 'In my opinion, it is a great city.', 'En mi opinión, es una gran ciudad.'],
        ["I think it's too expensive.", 'Yo creo que es muy cara.', "You're right about that.", 'En eso tienes razón.'],
        ['Do you prefer summer or winter?', '¿Prefieres el verano o el invierno?', 'I prefer summer.', 'Prefiero el verano.'],
        ['Really? I love the snow.', '¿En serio? Me encanta la nieve.', "I don't like cold weather.", 'No me gusta el clima frío.'],
        ['Is it better to live in the city or the country?', '¿Es mejor vivir en la ciudad o en el campo?', 'It depends.', 'Depende.'],
        ['Do you think English is hard?', '¿Crees que el inglés es difícil?', "I don't think so.", 'No lo creo.'],
        ['Social media is bad for us.', 'Las redes sociales son malas para nosotros.', "I don't agree with you.", 'No estoy de acuerdo contigo.'],
        ['Why not?', '¿Por qué no?', 'Let me think about it.', 'Déjame pensarlo.'],
        ['Take your time.', 'Tómate tu tiempo.', "That's a good point.", 'Ese es un buen punto.'],
        ['I like talking with you.', 'Me gusta hablar contigo.', 'Me too. It was nice talking to you.', 'A mí también. Fue un gusto hablar contigo.']
      ]
    }),
    E('mudanza', {
      titulo: { en: 'Helping a friend move', es: 'Ayudando a un amigo a mudarse' },
      lugar: '📦 En la mudanza', escena: 'mudanza', color: '#8d6e63',
      npc: { nombre: 'Sam', sexo: 'm', edad: 'joven', rol: 'worker', emoji: '🧑🏻‍🔧', tono: 1.0 },
      dialogo: [
        ['Thanks for coming! I have so many boxes.', '¡Gracias por venir! Tengo muchísimas cajas.', 'Where should I put this box?', '¿Dónde pongo esta caja?'],
        ['Put it in the kitchen, please.', 'Ponla en la cocina, por favor.', 'This box is really heavy.', 'Esta caja está muy pesada.'],
        ['Can you lift it with me?', '¿La puedes levantar conmigo?', 'Can you give me a hand?', '¿Me echas una mano?'],
        ["Sure. On three. One, two, three!", 'Claro. A la cuenta de tres. ¡Uno, dos, tres!', 'Be careful! It might break.', '¡Cuidado! Se puede romper.'],
        ['Phew. Where is the tape?', 'Uf. ¿Dónde está la cinta?', "I have no idea.", 'No tengo ni idea.'],
        ['Oh, here it is.', 'Ah, aquí está.', 'Let me know if you need anything.', 'Avísame si necesitas algo.'],
        ['Can you open the door for me?', '¿Me puedes abrir la puerta?', 'Sure, no problem.', 'Claro, no hay problema.'],
        ['We are almost done!', '¡Ya casi terminamos!', "Let's take a break.", 'Tomemos un descanso.'],
        ["Good idea. Want some pizza?", 'Buena idea. ¿Quieres pizza?', "I'm starving!", '¡Me muero de hambre!'],
        ['I owe you one.', 'Te debo una.', "Don't mention it.", 'No hay de qué.']
      ]
    }),
    E('compras', {
      titulo: { en: 'At the supermarket', es: 'En el supermercado' },
      lugar: '🛒 En el supermercado', escena: 'puesto', color: '#c62828', ch: { toldo: ['#c62828', '#ffffff'], letrero: 'MARKET' },
      npc: { nombre: 'Max', sexo: 'm', edad: 'adulto', rol: 'worker', emoji: '🧔🏻', tono: 0.9 },
      dialogo: [
        ['Hi! Do you need help finding anything?', '¡Hola! ¿Necesitas ayuda para encontrar algo?', 'Where can I find the milk?', '¿Dónde encuentro la leche?'],
        ["It's in aisle five, next to the eggs.", 'Está en el pasillo cinco, al lado de los huevos.', 'Do you sell rice here?', '¿Venden arroz aquí?'],
        ['Yes, in aisle two.', 'Sí, en el pasillo dos.', 'Is this on sale?', '¿Esto está en oferta?'],
        ['Yes, buy one, get one free.', 'Sí, lleve dos y pague uno.', "That's a great deal.", 'Es una muy buena oferta.'],
        ['Do you have a shopping list?', '¿Tienes una lista de compras?', 'I forgot my shopping list.', 'Olvidé mi lista de compras.'],
        ['Ha! That happens to everyone.', '¡Ja! Eso le pasa a todo el mundo.', 'We need some bread and cheese.', 'Necesitamos pan y queso.'],
        ['Anything else?', '¿Algo más?', "That's it for today.", 'Eso es todo por hoy.'],
        ['The checkout is over there.', 'La caja está por allá.', 'Do you take credit cards?', '¿Aceptan tarjetas de crédito?'],
        ['Yes, we do. Paper or plastic?', 'Sí. ¿Bolsa de papel o de plástico?', 'Paper, please.', 'De papel, por favor.'],
        ['Have a great day!', '¡Que tengas un gran día!', 'You too. Take care!', 'Igualmente. ¡Cuídate!']
      ]
    })
  ];

  // Cada día se visitan 3 escenas (30 frases). Se repasan las más falladas.
  const POR_DIA = 3;
  return { ESCENAS, POR_DIA };
})();
