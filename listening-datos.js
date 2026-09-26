/* ============================================================================
   CONTENIDO DE LISTENING.HTML  ·  listening-datos.js
   ----------------------------------------------------------------------------
   Todo el texto de las actividades de escucha, separado por nivel (A1–B2).
   Los audios se generaron con Google Cloud TTS (voces Chirp3-HD en-US) con
   scripts/generar_audios_listening_actividades.py y viven en el bucket público
   "listening" de Supabase, carpeta actividades/. El nombre de cada archivo
   sale de los ids de aquí, así que si cambias un texto hay que regenerar
   su audio con el script.

   Formatos:
     dictados[nivel]   { id, titulo, es, voz, frases: [[inglés, español], ...] }
     conectada[nivel]  { id, titulo, patron, explica,
                         ejemplos: [{ lento, natural, es, trampas: [x, y] }] }
                         lento   = forma completa, dicha palabra por palabra
                         natural = como se dice de verdad (lo que suena)
                         trampas = frases parecidas para el ejercicio
     vocab[nivel]      [palabra, [3 distractores], 'frase con la *palabra*', español de la frase, español de la palabra]
     prediccion[nivel] { id, titulo, contexto, predice: { opciones, correctas },
                         lineas: [[voz, inglés, español]], preguntas: [[pregunta, español, [opciones], correcta]] }
     contar[nivel]     [lo que suena, forma completa]   (se cuentan las palabras de la forma completa)
     supervivencia     [[inglés, español]]
============================================================================ */
window.LISTENING_DATOS = {
  voces: {
    leda: 'en-US-Chirp3-HD-Leda', aoede: 'en-US-Chirp3-HD-Aoede', kore: 'en-US-Chirp3-HD-Kore',
    charon: 'en-US-Chirp3-HD-Charon', puck: 'en-US-Chirp3-HD-Puck', fenrir: 'en-US-Chirp3-HD-Fenrir'
  },
  // Velocidad a la que se generó el audio de cada nivel (la persona la baja o sube después).
  ritmo: { A1: 0.92, A2: 0.97, B1: 1.0, B2: 1.06 },

  /* ======================================================================
     DICTADO — 20 a 30 segundos de habla natural, frase por frase
  ====================================================================== */
  dictados: {
    A1: [
      { id: 'd-a1-1', titulo: 'My morning', es: 'Mi mañana', voz: 'leda', frases: [
        ['I wake up at seven every day.', 'Me despierto a las siete todos los días.'],
        ['I take a shower and get dressed.', 'Me ducho y me visto.'],
        ['Then I eat breakfast with my family.', 'Luego desayuno con mi familia.'],
        ['I usually have eggs and coffee.', 'Normalmente como huevos y tomo café.'],
        ['I leave for work at eight.', 'Salgo para el trabajo a las ocho.']] },
      { id: 'd-a1-2', titulo: 'My family', es: 'Mi familia', voz: 'charon', frases: [
        ['I have a small family.', 'Tengo una familia pequeña.'],
        ['My wife is a nurse at the hospital.', 'Mi esposa es enfermera en el hospital.'],
        ['We have two kids, a boy and a girl.', 'Tenemos dos hijos, un niño y una niña.'],
        ['My son is six and my daughter is nine.', 'Mi hijo tiene seis años y mi hija tiene nueve.'],
        ['On Sundays we visit their grandparents.', 'Los domingos visitamos a sus abuelos.']] },
      { id: 'd-a1-3', titulo: 'At the coffee shop', es: 'En la cafetería', voz: 'aoede', frases: [
        ['Hi, can I get a small coffee, please?', 'Hola, ¿me da un café pequeño, por favor?'],
        ['Do you want milk and sugar?', '¿Quiere leche y azúcar?'],
        ['Just milk, thanks.', 'Solo leche, gracias.'],
        ['That is three dollars.', 'Son tres dólares.'],
        ['Here you go. Have a nice day!', 'Aquí tiene. ¡Que tenga un buen día!']] },
      { id: 'd-a1-4', titulo: 'My apartment', es: 'Mi apartamento', voz: 'puck', frases: [
        ['I live in a small apartment in the city.', 'Vivo en un apartamento pequeño en la ciudad.'],
        ['It has one bedroom and a big kitchen.', 'Tiene un dormitorio y una cocina grande.'],
        ['My favorite room is the living room.', 'Mi cuarto favorito es la sala.'],
        ['There is a nice window next to the sofa.', 'Hay una ventana bonita al lado del sofá.'],
        ['I like to read there in the afternoon.', 'Me gusta leer ahí por la tarde.']] },
      { id: 'd-a1-5', titulo: 'The weekend', es: 'El fin de semana', voz: 'kore', frases: [
        ['On Saturday I play soccer with my friends.', 'El sábado juego fútbol con mis amigos.'],
        ['We meet at the park at ten.', 'Nos vemos en el parque a las diez.'],
        ['After the game, we eat pizza.', 'Después del partido comemos pizza.'],
        ['On Sunday I stay home and relax.', 'El domingo me quedo en casa y descanso.'],
        ['I watch movies and call my mom.', 'Veo películas y llamo a mi mamá.']] },
      { id: 'd-a1-6', titulo: 'The weather', es: 'El clima', voz: 'fenrir', frases: [
        ["It's cold today, so wear a jacket.", 'Hoy hace frío, así que ponte una chaqueta.'],
        ['It might rain in the afternoon.', 'Puede que llueva por la tarde.'],
        ["Don't forget your umbrella.", 'No olvides tu paraguas.'],
        ["Tomorrow it's going to be sunny.", 'Mañana va a estar soleado.'],
        ["Let's go to the beach!", '¡Vamos a la playa!']] }
    ],
    A2: [
      { id: 'd-a2-1', titulo: 'A trip to New York', es: 'Un viaje a Nueva York', voz: 'leda', frases: [
        ['Last summer, I went to New York with my sister.', 'El verano pasado fui a Nueva York con mi hermana.'],
        ['We stayed in a small hotel near the park.', 'Nos quedamos en un hotel pequeño cerca del parque.'],
        ['Every morning we walked around the city.', 'Cada mañana caminábamos por la ciudad.'],
        ['The food was great, but everything was expensive.', 'La comida era buenísima, pero todo era caro.'],
        ['I want to go back next year.', 'Quiero volver el próximo año.']] },
      { id: 'd-a2-2', titulo: 'A quick call', es: 'Una llamada rápida', voz: 'charon', frases: [
        ["Hey, it's me. Are you busy right now?", 'Oye, soy yo. ¿Estás ocupada ahora?'],
        ["I'm at the store and I forgot the list.", 'Estoy en la tienda y olvidé la lista.'],
        ['Do we need eggs or milk?', '¿Necesitamos huevos o leche?'],
        ["Okay, I'll get both, just in case.", 'Vale, compro las dos cosas, por si acaso.'],
        ["I'll be home in about twenty minutes.", 'Llego a casa en unos veinte minutos.']] },
      { id: 'd-a2-3', titulo: 'At the doctor', es: 'En el médico', voz: 'aoede', frases: [
        ['I had a bad headache yesterday.', 'Ayer tuve un dolor de cabeza fuerte.'],
        ['I also felt tired and a little dizzy.', 'También me sentía cansada y un poco mareada.'],
        ['The doctor told me to drink more water.', 'El médico me dijo que tomara más agua.'],
        ['She gave me some medicine for the pain.', 'Me dio una medicina para el dolor.'],
        ['I need to rest for a couple of days.', 'Necesito descansar un par de días.']] },
      { id: 'd-a2-4', titulo: 'My new job', es: 'Mi nuevo trabajo', voz: 'puck', frases: [
        ['I started a new job on Monday.', 'Empecé un trabajo nuevo el lunes.'],
        ['My office is downtown, so I take the bus.', 'Mi oficina está en el centro, así que tomo el bus.'],
        ['My coworkers are really friendly.', 'Mis compañeros son muy amables.'],
        ['We usually have lunch together at noon.', 'Normalmente almorzamos juntos al mediodía.'],
        ["I think I'm going to like it here.", 'Creo que me va a gustar estar aquí.']] },
      { id: 'd-a2-5', titulo: 'Weekend plans', es: 'Planes para el fin de semana', voz: 'kore', frases: [
        ['What are you doing this weekend?', '¿Qué vas a hacer este fin de semana?'],
        ["I'm going to visit my cousins in Miami.", 'Voy a visitar a mis primos en Miami.'],
        ["We're planning to rent a car and drive to the beach.", 'Pensamos alquilar un carro e ir a la playa.'],
        ['Do you want to come with us?', '¿Quieres venir con nosotros?'],
        ['Let me know by Friday.', 'Avísame antes del viernes.']] },
      { id: 'd-a2-6', titulo: 'At the restaurant', es: 'En el restaurante', voz: 'fenrir', frases: [
        ['Good evening. Do you have a reservation?', 'Buenas noches. ¿Tienen reserva?'],
        ['Yes, a table for four under Garcia.', 'Sí, una mesa para cuatro a nombre de García.'],
        ['Great. Follow me, please.', 'Perfecto. Síganme, por favor.'],
        ['Can we sit by the window?', '¿Podemos sentarnos junto a la ventana?'],
        ['Sure. Here are your menus.', 'Claro. Aquí tienen sus menús.']] }
    ],
    B1: [
      { id: 'd-b1-1', titulo: 'Our neighborhood', es: 'Nuestro barrio', voz: 'leda', frases: [
        ["We've been living in this neighborhood for almost three years.", 'Llevamos casi tres años viviendo en este barrio.'],
        ["At first, I didn't know anyone around here.", 'Al principio no conocía a nadie por aquí.'],
        ['Now I know most of my neighbors by name.', 'Ahora conozco a la mayoría de mis vecinos por su nombre.'],
        ["If we move, I'm going to miss this place.", 'Si nos mudamos, voy a extrañar este lugar.'],
        ['But we really need a bigger house.', 'Pero de verdad necesitamos una casa más grande.']] },
      { id: 'd-b1-2', titulo: 'A bad day', es: 'Un mal día', voz: 'charon', frases: [
        ["I was running late, so I didn't have time for breakfast.", 'Iba tarde, así que no tuve tiempo de desayunar.'],
        ["Then I realized I'd left my phone at home.", 'Luego me di cuenta de que había dejado el teléfono en casa.'],
        ['By the time I got to the office, the meeting had started.', 'Cuando llegué a la oficina, la reunión ya había empezado.'],
        ["My boss didn't say anything, but she wasn't happy.", 'Mi jefa no dijo nada, pero no estaba contenta.'],
        ["Tomorrow I'm setting two alarms.", 'Mañana voy a poner dos alarmas.']] },
      { id: 'd-b1-3', titulo: 'Sleep better', es: 'Dormir mejor', voz: 'aoede', frases: [
        ['If you want to sleep better, turn off your phone an hour before bed.', 'Si quieres dormir mejor, apaga el teléfono una hora antes de acostarte.'],
        ['Try to go to bed at the same time every night.', 'Intenta acostarte a la misma hora todas las noches.'],
        ['Avoid coffee after lunch.', 'Evita el café después del almuerzo.'],
        ['A short walk in the evening can also help.', 'Una caminata corta por la tarde también puede ayudar.'],
        ["You'll notice the difference in a week or two.", 'Notarás la diferencia en una o dos semanas.']] },
      { id: 'd-b1-4', titulo: 'A job interview', es: 'Una entrevista de trabajo', voz: 'puck', frases: [
        ['So, tell me a little about yourself.', 'Entonces, cuéntame un poco sobre ti.'],
        ["I've worked in customer service for five years.", 'He trabajado en atención al cliente durante cinco años.'],
        ['I enjoy solving problems and talking to people.', 'Disfruto resolviendo problemas y hablando con la gente.'],
        ['Why do you want to work with us?', '¿Por qué quieres trabajar con nosotros?'],
        ["I've heard great things about your company.", 'He oído cosas muy buenas de su empresa.']] },
      { id: 'd-b1-5', titulo: 'Less social media', es: 'Menos redes sociales', voz: 'kore', frases: [
        ['I used to spend hours on social media every day.', 'Antes pasaba horas en redes sociales todos los días.'],
        ["I didn't notice how much time I was wasting.", 'No me daba cuenta de cuánto tiempo estaba perdiendo.'],
        ['Last month I deleted two apps from my phone.', 'El mes pasado borré dos aplicaciones de mi teléfono.'],
        ['Now I read more and sleep better.', 'Ahora leo más y duermo mejor.'],
        ["Honestly, I don't miss them at all.", 'La verdad, no las extraño para nada.']] },
      { id: 'd-b1-6', titulo: 'At the airport', es: 'En el aeropuerto', voz: 'fenrir', frases: [
        ['Attention, please. This is an announcement for passengers to Chicago.', 'Atención, por favor. Este es un anuncio para los pasajeros a Chicago.'],
        ['Your flight has been delayed by almost an hour.', 'Su vuelo se ha retrasado casi una hora.'],
        ['Please stay near your gate and check the screens.', 'Por favor, permanezcan cerca de su puerta y revisen las pantallas.'],
        ['Free coffee is available at the café next to the gate.', 'Hay café gratis en la cafetería junto a la puerta.'],
        ['We apologize for the inconvenience.', 'Pedimos disculpas por las molestias.']] }
    ],
    B2: [
      { id: 'd-b2-1', titulo: 'Working from home', es: 'Trabajar desde casa', voz: 'leda', frases: [
        ['Working from home sounded like a dream at first.', 'Trabajar desde casa sonaba como un sueño al principio.'],
        ['After a few months, though, I started to feel pretty isolated.', 'Sin embargo, después de unos meses empecé a sentirme bastante aislada.'],
        ["I'd go days without talking to anyone face to face.", 'Pasaba días sin hablar con nadie cara a cara.'],
        ['Now I work from a coworking space twice a week.', 'Ahora trabajo desde un espacio de coworking dos veces por semana.'],
        ["It's made a huge difference to my mood.", 'Ha hecho una diferencia enorme en mi estado de ánimo.']] },
      { id: 'd-b2-2', titulo: 'A podcast about habits', es: 'Un podcast sobre hábitos', voz: 'charon', frases: [
        ["Welcome back to the show. Today we're talking about habits.", 'Bienvenidos de nuevo al programa. Hoy hablamos de hábitos.'],
        ['Most people try to change too many things at once.', 'La mayoría de la gente intenta cambiar demasiadas cosas a la vez.'],
        ["The trick is to start with something so small you can't fail.", 'El truco es empezar con algo tan pequeño que no puedas fallar.'],
        ['Once it becomes automatic, you can build on it.', 'Una vez que se vuelve automático, puedes construir sobre eso.'],
        ['It sounds obvious, but it actually works.', 'Suena obvio, pero de verdad funciona.']] },
      { id: 'd-b2-3', titulo: 'A complaint', es: 'Una queja', voz: 'aoede', frases: [
        ["I'm calling about an order I placed two weeks ago.", 'Llamo por un pedido que hice hace dos semanas.'],
        ['It was supposed to arrive last Tuesday, but it never showed up.', 'Se suponía que llegaría el martes pasado, pero nunca llegó.'],
        ['The tracking page says it was delivered, which is strange.', 'La página de seguimiento dice que se entregó, lo cual es raro.'],
        ["I'd like a refund, or at least a replacement.", 'Me gustaría un reembolso o, al menos, un reemplazo.'],
        ['Could you look into it and get back to me?', '¿Podría revisarlo y volver a contactarme?']] },
      { id: 'd-b2-4', titulo: 'The power of naps', es: 'El poder de las siestas', voz: 'puck', frases: [
        ['Scientists have found that short naps can improve memory.', 'Los científicos han descubierto que las siestas cortas pueden mejorar la memoria.'],
        ["In one study, people who napped learned faster than those who didn't.", 'En un estudio, quienes tomaron una siesta aprendieron más rápido que quienes no.'],
        ['The ideal nap seems to be around twenty minutes.', 'La siesta ideal parece ser de unos veinte minutos.'],
        ['Any longer, and you might wake up feeling groggy.', 'Si es más larga, podrías despertarte aturdido.'],
        ["So if you're feeling tired, a quick nap might be the answer.", 'Así que si te sientes cansado, una siesta rápida podría ser la respuesta.']] },
      { id: 'd-b2-5', titulo: 'Moving abroad', es: 'Mudarse al extranjero', voz: 'kore', frases: [
        ["Moving abroad was the hardest decision I've ever made.", 'Mudarme al extranjero fue la decisión más difícil que he tomado.'],
        ["I didn't speak the language, and I didn't know a soul.", 'No hablaba el idioma y no conocía a nadie.'],
        ["Looking back, I wouldn't change a thing.", 'Mirando atrás, no cambiaría nada.'],
        ['It forced me out of my comfort zone.', 'Me obligó a salir de mi zona de confort.'],
        ['If you ever get the chance, go for it.', 'Si alguna vez tienes la oportunidad, hazlo.']] },
      { id: 'd-b2-6', titulo: 'Local news', es: 'Noticias locales', voz: 'fenrir', frases: [
        ['City officials announced a new plan to reduce traffic downtown.', 'Las autoridades de la ciudad anunciaron un plan para reducir el tráfico en el centro.'],
        ['Starting next month, several streets will be closed to cars on weekends.', 'A partir del próximo mes, varias calles estarán cerradas a los carros los fines de semana.'],
        ['Local businesses are worried they might lose customers.', 'Los negocios locales temen perder clientes.'],
        ['Supporters say the change will make the area safer and quieter.', 'Quienes lo apoyan dicen que el cambio hará la zona más segura y tranquila.'],
        ['The plan will be reviewed after six months.', 'El plan se revisará después de seis meses.']] }
    ]
  },

  /* ======================================================================
     HABLA CONECTADA — formas débiles, enlaces, elisiones y reducciones
  ====================================================================== */
  conectada: {
    A1: [
      { id: 'c-a1-1', titulo: 'Contracciones con BE', patron: "I am → I'm · it is → it's",
        explica: 'En el inglés hablado casi nunca se dice «I am» o «it is» completos: se pegan en una sola sílaba (I\'m /aɪm/, it\'s /ɪts/). Si tu oído espera las dos palabras, la frase se te escapa.',
        ejemplos: [
          { lento: 'I am hungry.', natural: "I'm hungry.", es: 'Tengo hambre.', trampas: ['I have hungry.', 'I was hungry.'] },
          { lento: 'You are late.', natural: "You're late.", es: 'Llegas tarde.', trampas: ['Your late.', 'You were late.'] },
          { lento: 'He is my brother.', natural: "He's my brother.", es: 'Él es mi hermano.', trampas: ['His my brother.', 'He was my brother.'] },
          { lento: 'It is cold today.', natural: "It's cold today.", es: 'Hoy hace frío.', trampas: ['Is cold today.', 'It was cold today.'] },
          { lento: 'We are ready.', natural: "We're ready.", es: 'Estamos listos.', trampas: ['Where ready.', 'We were ready.'] }] },
      { id: 'c-a1-2', titulo: 'Negativos pegados', patron: "do not → don't · does not → doesn't",
        explica: 'El «not» se reduce a una /n/ casi muda al final del verbo. Fíjate en la vocal: «don\'t» suena /doʊnt/ y a veces la t final ni se oye.',
        ejemplos: [
          { lento: 'I do not know.', natural: "I don't know.", es: 'No sé.', trampas: ['I do know.', 'I didn\'t know.'] },
          { lento: 'She does not like coffee.', natural: "She doesn't like coffee.", es: 'A ella no le gusta el café.', trampas: ['She does like coffee.', 'She didn\'t like coffee.'] },
          { lento: 'It is not far.', natural: "It isn't far.", es: 'No está lejos.', trampas: ['It is far.', 'It wasn\'t far.'] },
          { lento: 'They are not here.', natural: "They aren't here.", es: 'No están aquí.', trampas: ['They are here.', 'They weren\'t here.'] },
          { lento: 'We do not have time.', natural: "We don't have time.", es: 'No tenemos tiempo.', trampas: ['We do have time.', 'We didn\'t have time.'] }] },
      { id: 'c-a1-3', titulo: 'TO débil: /tə/', patron: 'want to go → wantə go',
        explica: '«To» casi nunca suena /tu/: se vuelve una /tə/ rapidísima, pegada a la palabra anterior. Muchos estudiantes dicen «no la oí» y es porque dura un instante.',
        ejemplos: [
          { lento: 'I want to go home.', natural: 'I want to go home.', es: 'Quiero ir a casa.', trampas: ['I want go home.', 'I went to go home.'] },
          { lento: 'I need to eat.', natural: 'I need to eat.', es: 'Necesito comer.', trampas: ['I need eat.', 'I need two eggs.'] },
          { lento: 'We have to work today.', natural: 'We have to work today.', es: 'Tenemos que trabajar hoy.', trampas: ['We have two work today.', 'We have work today.'] },
          { lento: 'Nice to meet you.', natural: 'Nice to meet you.', es: 'Mucho gusto.', trampas: ['Nice meet you.', 'Nice to see you.'] },
          { lento: 'I like to read.', natural: 'I like to read.', es: 'Me gusta leer.', trampas: ['I like the red.', 'I like red.'] }] },
      { id: 'c-a1-4', titulo: 'AND, OR, OF débiles', patron: "and → 'n · of → ə · or → ər",
        explica: '«And» se reduce a /ən/ o solo /n/; «of» a /ə/ o /əv/; «or» a /ər/. En «a cup of coffee» casi suena «a cuppa coffee».',
        ejemplos: [
          { lento: 'Bread and butter.', natural: 'Bread and butter.', es: 'Pan con mantequilla.', trampas: ['Bread in butter.', 'Bread or butter.'] },
          { lento: 'A cup of coffee.', natural: 'A cup of coffee.', es: 'Una taza de café.', trampas: ['A cup a coffee.', 'A cop of coffee.'] },
          { lento: 'Tea or coffee?', natural: 'Tea or coffee?', es: '¿Té o café?', trampas: ['Tea and coffee?', 'Tea for coffee?'] },
          { lento: 'A lot of people.', natural: 'A lot of people.', es: 'Mucha gente.', trampas: ['Allow people.', 'A lot people.'] },
          { lento: 'Black and white.', natural: 'Black and white.', es: 'Blanco y negro.', trampas: ['Black in white.', 'Black or white.'] }] },
      { id: 'c-a1-5', titulo: "What's, where's, how's", patron: "what is → what's · where is → where's",
        explica: 'Las preguntas con «is» se contraen: «what\'s», «where\'s», «how\'s», «who\'s». La /s/ final es lo único que queda del «is».',
        ejemplos: [
          { lento: 'What is your name?', natural: "What's your name?", es: '¿Cómo te llamas?', trampas: ['What your name?', 'Was your name?'] },
          { lento: 'Where is the bathroom?', natural: "Where's the bathroom?", es: '¿Dónde está el baño?', trampas: ['Where the bathroom?', 'Wear the bathroom?'] },
          { lento: 'How is it going?', natural: "How's it going?", es: '¿Cómo te va?', trampas: ['How is going?', 'House it going?'] },
          { lento: 'Who is that?', natural: "Who's that?", es: '¿Quién es ese?', trampas: ['Whose hat?', 'Who that?'] },
          { lento: 'What is up?', natural: "What's up?", es: '¿Qué tal?', trampas: ['What sup?', 'Was up?'] }] }
    ],
    A2: [
      { id: 'c-a2-1', titulo: 'Enlace consonante + vocal', patron: 'turn it off → tur-ni-toff',
        explica: 'Cuando una palabra termina en consonante y la siguiente empieza en vocal, la consonante «salta» a la siguiente palabra. Por eso «turn it off» suena como una sola palabra: «turnitoff».',
        ejemplos: [
          { lento: 'Turn it off.', natural: 'Turn it off.', es: 'Apágalo.', trampas: ['Turn it on.', 'Turn off.'] },
          { lento: 'Pick it up.', natural: 'Pick it up.', es: 'Recógelo.', trampas: ['Pick up.', 'Pick a cup.'] },
          { lento: 'Come on in.', natural: 'Come on in.', es: 'Pasa, entra.', trampas: ['Come in.', 'Calm on in.'] },
          { lento: 'Get out of here.', natural: 'Get out of here.', es: 'Sal de aquí.', trampas: ['Get out here.', 'Get off of here.'] },
          { lento: 'Check it out.', natural: 'Check it out.', es: 'Míralo.', trampas: ['Check out.', 'Chuck it out.'] }] },
      { id: 'c-a2-2', titulo: 'CAN vs. CAN\'T', patron: 'can /kən/ · can\'t /kænt/',
        explica: 'Truco americano: «can» afirmativo casi no se oye (/kən/) y el verbo se lleva el acento. «Can\'t» se dice fuerte y largo (/kænt/), aunque la t final muchas veces no suene. Escucha la vocal y el acento, no la t.',
        ejemplos: [
          { lento: 'I can swim.', natural: 'I can swim.', es: 'Sé nadar.', trampas: ["I can't swim.", 'I can see him.'] },
          { lento: 'I cannot swim.', natural: "I can't swim.", es: 'No sé nadar.', trampas: ['I can swim.', 'I can seem.'] },
          { lento: 'She can drive.', natural: 'She can drive.', es: 'Ella sabe manejar.', trampas: ["She can't drive.", 'She can arrive.'] },
          { lento: 'We cannot come.', natural: "We can't come.", es: 'No podemos venir.', trampas: ['We can come.', 'We can calm.'] },
          { lento: 'Can you help me?', natural: 'Can you help me?', es: '¿Me puedes ayudar?', trampas: ["Can't you help me?", 'Could you help me?'] }] },
      { id: 'c-a2-3', titulo: 'Wanna, gonna, gotta', patron: 'want to → wanna · going to → gonna',
        explica: 'Son las reducciones más comunes del inglés americano. Nadie las escribe en un correo formal, pero todo el mundo las dice: want to → wanna, going to → gonna, got to → gotta.',
        ejemplos: [
          { lento: 'I want to eat.', natural: 'I wanna eat.', es: 'Quiero comer.', trampas: ['I want it.', 'I wanted to eat.'] },
          { lento: 'I am going to leave.', natural: "I'm gonna leave.", es: 'Me voy a ir.', trampas: ["I'm going to live.", "I'm gone to leave."] },
          { lento: 'I have got to go.', natural: 'I gotta go.', es: 'Me tengo que ir.', trampas: ['I got a goal.', 'I got to go home.'] },
          { lento: 'Do you want to dance?', natural: 'Do you wanna dance?', es: '¿Quieres bailar?', trampas: ['Do you want a dance?', 'Did you want to dance?'] },
          { lento: 'We are going to be late.', natural: "We're gonna be late.", es: 'Vamos a llegar tarde.', trampas: ['We were going to be late.', "We're going to be light."] }] },
      { id: 'c-a2-4', titulo: 'Él, ella, ellos sin H', patron: "him → 'im · her → 'er · them → 'em",
        explica: 'Los pronombres objeto pierden su primera consonante cuando no llevan acento: «tell him» suena «tellim», «like them» suena «likem».',
        ejemplos: [
          { lento: 'Tell him I am here.', natural: "Tell him I'm here.", es: 'Dile que estoy aquí.', trampas: ["Tell them I'm here.", "Tell me I'm here."] },
          { lento: 'Give her the book.', natural: 'Give her the book.', es: 'Dale el libro a ella.', trampas: ['Give him the book.', 'Give me the book.'] },
          { lento: 'I like them.', natural: 'I like them.', es: 'Me gustan.', trampas: ['I like him.', 'I liked them.'] },
          { lento: 'Call them later.', natural: 'Call them later.', es: 'Llámalos luego.', trampas: ['Call him later.', 'Call me later.'] },
          { lento: 'Ask her.', natural: 'Ask her.', es: 'Pregúntale a ella.', trampas: ['Ask him.', 'Ask for.'] }] },
      { id: 'c-a2-5', titulo: 'El -ed que casi no suena', patron: 'walked to → walk-t-to',
        explica: 'La terminación -ed del pasado suena /t/, /d/ o /ɪd/, y cuando la siguiente palabra empieza con consonante, se funde con ella. Si no la oyes, usa el contexto: «yesterday», «last week»…',
        ejemplos: [
          { lento: 'I walked to work.', natural: 'I walked to work.', es: 'Caminé al trabajo.', trampas: ['I walk to work.', 'I worked to work.'] },
          { lento: 'She played all day.', natural: 'She played all day.', es: 'Ella jugó todo el día.', trampas: ['She plays all day.', 'She play all day.'] },
          { lento: 'We needed help.', natural: 'We needed help.', es: 'Necesitábamos ayuda.', trampas: ['We need help.', 'We needed held.'] },
          { lento: 'I watched a movie.', natural: 'I watched a movie.', es: 'Vi una película.', trampas: ['I watch a movie.', 'I want a movie.'] },
          { lento: 'They wanted it.', natural: 'They wanted it.', es: 'Lo querían.', trampas: ['They want it.', 'They want to eat.'] }] }
    ],
    B1: [
      { id: 'c-b1-1', titulo: 'T y D que desaparecen', patron: 'next day → nex day · last night → las night',
        explica: 'Entre dos consonantes, la /t/ y la /d/ se suelen perder: «next day» suena «nex day», «just now» suena «jus now». La palabra está, pero no se pronuncia entera.',
        ejemplos: [
          { lento: 'See you next week.', natural: 'See you next week.', es: 'Nos vemos la próxima semana.', trampas: ['See you next weekend.', 'See you last week.'] },
          { lento: 'I left my phone.', natural: 'I left my phone.', es: 'Dejé mi teléfono.', trampas: ['I lift my phone.', 'I lost my phone.'] },
          { lento: 'It was the best day.', natural: 'It was the best day.', es: 'Fue el mejor día.', trampas: ['It was the best.', 'It was a bad day.'] },
          { lento: 'She just called.', natural: 'She just called.', es: 'Acaba de llamar.', trampas: ['She just calls.', 'She is cold.'] },
          { lento: 'I must go.', natural: 'I must go.', es: 'Debo irme.', trampas: ['I must know.', 'I miss go.'] }] },
      { id: 'c-b1-2', titulo: 'Didja, wouldja, couldja', patron: 'did you → didja · would you → wouldja',
        explica: 'Cuando una /d/ o /t/ va antes de «you», se funden en /dʒ/ o /tʃ/: «did you» → «didja», «could you» → «couldja», «what do you» → «whaddaya».',
        ejemplos: [
          { lento: 'Did you eat?', natural: 'Did you eat?', es: '¿Comiste?', trampas: ['Do you eat?', 'Did he eat?'] },
          { lento: 'Would you like some?', natural: 'Would you like some?', es: '¿Quieres un poco?', trampas: ['Do you like some?', 'Would you like sun?'] },
          { lento: 'Could you help me?', natural: 'Could you help me?', es: '¿Podrías ayudarme?', trampas: ['Can you help me?', 'Could you tell me?'] },
          { lento: 'What did you say?', natural: 'What did you say?', es: '¿Qué dijiste?', trampas: ['What do you say?', 'What did he say?'] },
          { lento: 'Do not you know?', natural: "Don't you know?", es: '¿No sabes?', trampas: ['Do you know?', "Didn't you know?"] }] },
      { id: 'c-b1-3', titulo: 'La T americana suave', patron: 'water → wader · a lot of → a lodda',
        explica: 'Entre vocales, la t americana se vuelve una /ɾ/ rápida, parecida a la r de «pero»: «water» ≈ «wara», «better» ≈ «bera», «get it» ≈ «gerit».',
        ejemplos: [
          { lento: 'Can I get a glass of water?', natural: 'Can I get a glass of water?', es: '¿Me da un vaso de agua?', trampas: ['Can I get a glass of wider?', 'Can I get a class of water?'] },
          { lento: 'It is getting better.', natural: "It's getting better.", es: 'Está mejorando.', trampas: ["It's getting bitter.", "It's getting butter."] },
          { lento: 'Put it on the table.', natural: 'Put it on the table.', es: 'Ponlo en la mesa.', trampas: ['Put in on the table.', 'Put on the table.'] },
          { lento: 'Wait a minute.', natural: 'Wait a minute.', es: 'Espera un momento.', trampas: ['Wait at a minute.', 'Weight a minute.'] },
          { lento: 'I will meet you later.', natural: "I'll meet you later.", es: 'Te veo más tarde.', trampas: ["I'll meet you ladder.", "I'll need you later."] }] },
      { id: 'c-b1-4', titulo: 'La H que se esconde', patron: "is he → izee · his → 'is",
        explica: 'En «he, his, her, have, him» la /h/ desaparece cuando la palabra no lleva acento: «Is he here?» suena «Izee here?», «What\'s his name?» suena «What\'sis name?».',
        ejemplos: [
          { lento: 'Is he here?', natural: 'Is he here?', es: '¿Está él aquí?', trampas: ['Is she here?', 'Is it here?'] },
          { lento: 'What is his name?', natural: "What's his name?", es: '¿Cómo se llama él?', trampas: ["What's the name?", "What's her name?"] },
          { lento: 'Where is her car?', natural: "Where's her car?", es: '¿Dónde está su carro (de ella)?', trampas: ["Where's the car?", "Where's his car?"] },
          { lento: 'Did he call?', natural: 'Did he call?', es: '¿Llamó él?', trampas: ['Did she call?', 'Did you call?'] },
          { lento: 'I have to tell him.', natural: 'I have to tell him.', es: 'Tengo que decirle.', trampas: ['I have to tell them.', 'I have to tell her.'] }] },
      { id: 'c-b1-5', titulo: 'Shoulda, coulda, woulda', patron: 'should have → shoulda',
        explica: '«Have» después de should, could, would, must o might se reduce a /ə/: «I should have known» suena «I shoulda known». Por eso muchos nativos lo escriben mal como «should of».',
        ejemplos: [
          { lento: 'I should have known.', natural: 'I shoulda known.', es: 'Debí haberlo sabido.', trampas: ['I should know.', "I shouldn't have known."] },
          { lento: 'You could have told me.', natural: 'You coulda told me.', es: 'Me lo podrías haber dicho.', trampas: ['You could tell me.', 'You can tell me.'] },
          { lento: 'I would have helped.', natural: 'I woulda helped.', es: 'Te habría ayudado.', trampas: ['I would help.', 'I will help.'] },
          { lento: 'We must have missed it.', natural: 'We musta missed it.', es: 'Seguro que nos lo perdimos.', trampas: ['We must miss it.', 'We missed it.'] },
          { lento: 'She might have left.', natural: 'She mighta left.', es: 'Puede que se haya ido.', trampas: ['She might leave.', 'She may left.'] }] }
    ],
    B2: [
      { id: 'c-b2-1', titulo: 'Whatcha, lemme, gimme', patron: 'what are you → whatcha · let me → lemme',
        explica: 'En conversación rápida, grupos enteros se funden en una sola palabra: «what are you» → «whatcha», «let me» → «lemme», «give me» → «gimme», «I got you» → «gotcha».',
        ejemplos: [
          { lento: 'What are you doing?', natural: 'Whatcha doing?', es: '¿Qué haces?', trampas: ['What did you do?', 'What do you do?'] },
          { lento: 'Let me see.', natural: 'Lemme see.', es: 'Déjame ver.', trampas: ['Let us see.', 'Lemon sea.'] },
          { lento: 'Give me a minute.', natural: 'Gimme a minute.', es: 'Dame un minuto.', trampas: ['Give him a minute.', 'Give it a minute.'] },
          { lento: 'I got you.', natural: 'Gotcha.', es: 'Entendido. / Te pillé.', trampas: ['Got it.', 'Got you?'] },
          { lento: 'Do not you worry.', natural: "Don'tcha worry.", es: 'No te preocupes.', trampas: ["Don't worry.", "Didn't you worry?"] }] },
      { id: 'c-b2-2', titulo: 'Kinda, sorta, outta, lotta', patron: 'kind of → kinda · out of → outta',
        explica: '«Of» se reduce a /ə/ y se pega a la palabra anterior: «kind of» → «kinda», «sort of» → «sorta», «out of» → «outta», «a lot of» → «a lotta».',
        ejemplos: [
          { lento: 'I am kind of tired.', natural: "I'm kinda tired.", es: 'Estoy algo cansado.', trampas: ["I'm kind and tired.", "I'm kind tired."] },
          { lento: 'It is sort of weird.', natural: "It's sorta weird.", es: 'Es un poco raro.', trampas: ["It's so weird.", "It's sort weird."] },
          { lento: 'We are out of time.', natural: "We're outta time.", es: 'Se nos acabó el tiempo.', trampas: ["We're out on time.", "We're out at nine."] },
          { lento: 'That is a lot of work.', natural: "That's a lotta work.", es: 'Es mucho trabajo.', trampas: ["That's a lot work.", "That's allowed to work."] },
          { lento: 'Get out of my way.', natural: 'Get outta my way.', es: 'Quítate de mi camino.', trampas: ['Get out my way.', 'Get on my way.'] }] },
      { id: 'c-b2-3', titulo: "Dunno, 'cause, 'bout", patron: "I don't know → I dunno · because → 'cause",
        explica: 'Algunas palabras pierden sílabas enteras: «I don\'t know» → «I dunno», «because» → «\'cause», «about» → «\'bout», «probably» → «prolly».',
        ejemplos: [
          { lento: 'I do not know.', natural: 'I dunno.', es: 'No sé.', trampas: ['I do now.', 'I know.'] },
          { lento: 'Because it is late.', natural: "'Cause it's late.", es: 'Porque es tarde.', trampas: ["Cuz it's light.", "Cause it's great."] },
          { lento: 'In about five minutes.', natural: "In 'bout five minutes.", es: 'En unos cinco minutos.', trampas: ['In but five minutes.', 'In five minutes.'] },
          { lento: 'I will probably stay.', natural: "I'll prolly stay.", es: 'Probablemente me quede.', trampas: ["I'll pretty stay.", 'I probably stayed.'] },
          { lento: 'I do not know what to do.', natural: 'I dunno what to do.', es: 'No sé qué hacer.', trampas: ["I don't know what you do.", 'I know what to do.'] }] },
      { id: 'c-b2-4', titulo: 'Preguntas sin auxiliar', patron: 'Are you coming? → You coming?',
        explica: 'En conversación informal se omite el auxiliar al inicio de la pregunta: «Are you coming?» → «You coming?», «Do you want coffee?» → «Want coffee?». La entonación que sube es la pista.',
        ejemplos: [
          { lento: 'Are you coming?', natural: 'You coming?', es: '¿Vienes?', trampas: ['You come in?', 'You come.'] },
          { lento: 'Have you got a minute?', natural: 'Got a minute?', es: '¿Tienes un minuto?', trampas: ['Got it, a minute.', 'Got a minute.'] },
          { lento: 'Do you want coffee?', natural: 'Want coffee?', es: '¿Quieres café?', trampas: ['Want some coffee.', 'Wanted coffee?'] },
          { lento: 'Is anybody home?', natural: 'Anybody home?', es: '¿Hay alguien en casa?', trampas: ['Nobody home?', 'Anybody hope?'] },
          { lento: 'Did you see that?', natural: 'See that?', es: '¿Viste eso?', trampas: ['See the hat?', 'Say that?'] }] },
      { id: 'c-b2-5', titulo: 'El ritmo del inglés', patron: 'las palabras de contenido marcan el ritmo',
        explica: 'El inglés acentúa las palabras con significado (sustantivos, verbos, adjetivos) y comprime todo lo demás. Por eso «What do you want to do?» suena «Whaddaya wanna do?»: solo «want» y «do» suenan claros.',
        ejemplos: [
          { lento: 'What do you want to do?', natural: 'Whaddaya wanna do?', es: '¿Qué quieres hacer?', trampas: ['What did you want to do?', 'What do you want to eat?'] },
          { lento: 'Where are you going?', natural: 'Where ya going?', es: '¿Adónde vas?', trampas: ['Where were you going?', 'Where are you coming?'] },
          { lento: 'I have been waiting for an hour.', natural: "I've been waiting for an hour.", es: 'Llevo una hora esperando.', trampas: ["I've been waiting for our hour.", 'I was waiting for an hour.'] },
          { lento: 'It is not that big of a deal.', natural: "It's not that big of a deal.", es: 'No es para tanto.', trampas: ["It's not a big deal.", "It's not that big idea."] },
          { lento: 'I went to the store to get some bread.', natural: 'I went to the store to get some bread.', es: 'Fui a la tienda a comprar pan.', trampas: ['I want to the store to get some bread.', 'I went to the store to get some red.'] }] }
    ]
  },

  /* ======================================================================
     VOCABULARIO POR EL OÍDO — la palabra siempre dentro de una frase
  ====================================================================== */
  vocab: {
    A1: [
      ['walk', ['work', 'woke', 'wall'], "Let's *walk* to the park.", 'Caminemos al parque.', 'caminar'],
      ['work', ['walk', 'word', 'week'], 'I *work* at a hospital.', 'Trabajo en un hospital.', 'trabajar'],
      ['thirteen', ['thirty', 'fourteen', 'three'], 'My sister is *thirteen*.', 'Mi hermana tiene trece años.', 'trece'],
      ['thirty', ['thirteen', 'dirty', 'forty'], 'The bus comes in *thirty* minutes.', 'El bus llega en treinta minutos.', 'treinta'],
      ['live', ['leave', 'love', 'life'], 'I *live* near the station.', 'Vivo cerca de la estación.', 'vivir'],
      ['leave', ['live', 'leaf', 'lift'], 'We *leave* at six.', 'Salimos a las seis.', 'salir, irse'],
      ['ship', ['sheep', 'chip', 'shop'], "There's a big *ship* in the port.", 'Hay un barco grande en el puerto.', 'barco'],
      ['sheep', ['ship', 'cheap', 'sleep'], 'The farmer has twenty *sheep*.', 'El granjero tiene veinte ovejas.', 'ovejas'],
      ['beach', ['peach', 'bench', 'bees'], 'I love the *beach*.', 'Me encanta la playa.', 'playa'],
      ['three', ['tree', 'free', 'through'], 'I have *three* brothers.', 'Tengo tres hermanos.', 'tres'],
      ['think', ['sink', 'thing', 'thank'], "I *think* it's a good idea.", 'Creo que es buena idea.', 'pensar, creer'],
      ['very', ['berry', 'every', 'vary'], 'The soup is *very* hot.', 'La sopa está muy caliente.', 'muy'],
      ['hungry', ['angry', 'hurry', 'honey'], 'Are you *hungry*?', '¿Tienes hambre?', 'con hambre'],
      ['kitchen', ['chicken', 'kitten', 'kitchens'], 'Mom is in the *kitchen*.', 'Mamá está en la cocina.', 'cocina'],
      ['chicken', ['kitchen', 'children', 'chick'], 'I want *chicken* and rice.', 'Quiero pollo y arroz.', 'pollo'],
      ['hot', ['hat', 'hut', 'hurt'], "Be careful, it's *hot*.", 'Cuidado, está caliente.', 'caliente'],
      ['bag', ['bug', 'back', 'big'], 'Where is my *bag*?', '¿Dónde está mi bolsa?', 'bolsa'],
      ['cup', ['cap', 'cop', 'cub'], 'Can I have a *cup* of tea?', '¿Me das una taza de té?', 'taza'],
      ['full', ['fool', 'fall', 'fill'], 'The bus is *full*.', 'El bus está lleno.', 'lleno'],
      ['pool', ['pull', 'pole', 'fool'], 'The kids are in the *pool*.', 'Los niños están en la piscina.', 'piscina'],
      ['seat', ['sit', 'sheet', 'set'], 'Is this *seat* free?', '¿Está libre este asiento?', 'asiento'],
      ['eat', ['it', 'heat', 'eight'], "Let's *eat* now.", 'Comamos ahora.', 'comer'],
      ['bed', ['bad', 'bet', 'bird'], "It's time for *bed*.", 'Es hora de ir a la cama.', 'cama'],
      ['man', ['men', 'main', 'mine'], 'That *man* is my uncle.', 'Ese hombre es mi tío.', 'hombre'],
      ['doctor', ['daughter', 'dollar', 'darker'], 'I need to see a *doctor*.', 'Necesito ver a un médico.', 'médico'],
      ['daughter', ['doctor', 'water', 'dollar'], 'My *daughter* is five.', 'Mi hija tiene cinco años.', 'hija'],
      ['water', ['waiter', 'writer', 'wider'], 'Can I have some *water*?', '¿Me da un poco de agua?', 'agua'],
      ['year', ['ear', 'here', 'yeah'], 'This *year* I want to learn English.', 'Este año quiero aprender inglés.', 'año'],
      ['word', ['world', 'work', 'ward'], 'What does this *word* mean?', '¿Qué significa esta palabra?', 'palabra'],
      ['coffee', ['copy', 'coffin', 'toffee'], 'I drink *coffee* every morning.', 'Tomo café todas las mañanas.', 'café']
    ],
    A2: [
      ['bought', ['brought', 'boat', 'bottle'], 'I *bought* a new phone.', 'Me compré un teléfono nuevo.', 'compré'],
      ['brought', ['bought', 'bread', 'broad'], 'She *brought* a cake to the party.', 'Ella trajo un pastel a la fiesta.', 'trajo'],
      ['world', ['word', 'wild', 'war'], "It's the best pizza in the *world*.", 'Es la mejor pizza del mundo.', 'mundo'],
      ['early', ['really', 'yearly', 'curly'], 'I get up *early* on weekdays.', 'Me levanto temprano entre semana.', 'temprano'],
      ['really', ['early', 'rarely', 'rally'], 'This movie is *really* good.', 'Esta película es muy buena.', 'realmente, muy'],
      ['walked', ['worked', 'woke', 'watched'], 'We *walked* home after dinner.', 'Caminamos a casa después de la cena.', 'caminamos'],
      ['worked', ['walked', 'worried', 'woke'], 'He *worked* late last night.', 'Él trabajó hasta tarde anoche.', 'trabajó'],
      ['called', ['cold', 'cooled', 'cord'], 'Your mom *called* this morning.', 'Tu mamá llamó esta mañana.', 'llamó'],
      ['cold', ['called', 'code', 'gold'], 'I have a bad *cold*.', 'Tengo un resfriado fuerte.', 'resfriado; frío'],
      ['bored', ['bird', 'bold', 'beard'], "I'm *bored*. Let's go out.", 'Estoy aburrido. Salgamos.', 'aburrido'],
      ['thought', ['taught', 'though', 'throat'], 'I *thought* you were busy.', 'Pensé que estabas ocupado.', 'pensé'],
      ['taught', ['thought', 'told', 'caught'], 'She *taught* me how to cook.', 'Ella me enseñó a cocinar.', 'enseñó'],
      ['caught', ['cut', 'coat', 'court'], 'I *caught* the last train.', 'Alcancé el último tren.', 'alcancé, atrapé'],
      ['pretty', ['party', 'petty', 'pity'], "It's *pretty* cold today.", 'Hoy hace bastante frío.', 'bastante; bonito'],
      ['party', ['pretty', 'potty', 'patty'], 'Are you coming to the *party*?', '¿Vienes a la fiesta?', 'fiesta'],
      ['heard', ['hard', 'head', 'hurt'], 'I *heard* a strange noise.', 'Oí un ruido extraño.', 'oí'],
      ['hurt', ['heart', 'hard', 'hut'], 'Did you *hurt* your hand?', '¿Te lastimaste la mano?', 'lastimar'],
      ['letter', ['ladder', 'later', 'lighter'], 'I wrote a *letter* to my grandma.', 'Le escribí una carta a mi abuela.', 'carta'],
      ['later', ['letter', 'ladder', 'lighter'], 'See you *later*!', '¡Nos vemos luego!', 'luego, más tarde'],
      ['weekend', ['weaken', 'wicked', 'weekday'], 'What did you do on the *weekend*?', '¿Qué hiciste el fin de semana?', 'fin de semana'],
      ['anything', ['everything', 'nothing', 'any time'], 'Do you need *anything*?', '¿Necesitas algo?', 'algo'],
      ['cheap', ['chip', 'jeep', 'sheep'], 'This hotel is *cheap*.', 'Este hotel es barato.', 'barato'],
      ['price', ['prize', 'press', 'rice'], "What's the *price* of this jacket?", '¿Cuál es el precio de esta chaqueta?', 'precio'],
      ['prize', ['price', 'rise', 'place'], 'She won first *prize*.', 'Ganó el primer premio.', 'premio'],
      ['rice', ['race', 'rise', 'nice'], "I'd like chicken with *rice*.", 'Quisiera pollo con arroz.', 'arroz'],
      ['glass', ['grass', 'class', 'gas'], 'Can I get a *glass* of water?', '¿Me da un vaso de agua?', 'vaso'],
      ['grass', ['glass', 'gas', 'grace'], 'The kids are playing on the *grass*.', 'Los niños juegan en el césped.', 'césped'],
      ['lunch', ['launch', 'bunch', 'lung'], "Let's have *lunch* together.", 'Almorcemos juntos.', 'almuerzo'],
      ['month', ['mouth', 'mount', 'much'], "I'll see you next *month*.", 'Te veo el próximo mes.', 'mes'],
      ['mouth', ['month', 'mouse', 'math'], 'Open your *mouth*, please.', 'Abra la boca, por favor.', 'boca']
    ],
    B1: [
      ['though', ['thought', 'throw', 'dough'], "It's cold. It's sunny, *though*.", 'Hace frío. Aunque está soleado.', 'aunque, sin embargo'],
      ['through', ['true', 'though', 'thorough'], 'We drove *through* the city.', 'Atravesamos la ciudad en carro.', 'a través de'],
      ["wouldn't", ["won't", "wasn't", 'wooden'], "I *wouldn't* do that if I were you.", 'Yo no haría eso si fuera tú.', 'no haría'],
      ["won't", ['want', "wasn't", 'went'], "I *won't* be late, I promise.", 'No llegaré tarde, lo prometo.', 'no (futuro)'],
      ["wasn't", ["won't", "isn't", "weren't"], "It *wasn't* my fault.", 'No fue mi culpa.', 'no era / no fue'],
      ['career', ['Korea', 'carrier', 'courier'], 'She wants a *career* in medicine.', 'Quiere una carrera en medicina.', 'carrera profesional'],
      ['comfortable', ['convertible', 'confident', 'competitive'], 'These shoes are really *comfortable*.', 'Estos zapatos son muy cómodos.', 'cómodo'],
      ['vegetable', ['available', 'festival', 'reliable'], 'Eat a *vegetable* with every meal.', 'Come una verdura en cada comida.', 'verdura'],
      ['interesting', ['interested', 'entering', 'interest'], "That's an *interesting* idea.", 'Es una idea interesante.', 'interesante'],
      ['probably', ['property', 'possibly', 'properly'], "It'll *probably* rain later.", 'Probablemente llueva más tarde.', 'probablemente'],
      ['actually', ['exactly', 'usually', 'actual'], '*Actually*, I changed my mind.', 'En realidad, cambié de opinión.', 'en realidad'],
      ['usually', ['actually', 'easily', 'visually'], 'I *usually* walk to work.', 'Normalmente camino al trabajo.', 'normalmente'],
      ['exactly', ['actually', 'extra', 'exact'], "That's *exactly* what I meant.", 'Eso es exactamente lo que quise decir.', 'exactamente'],
      ['schedule', ['school', 'scandal', 'shuttle'], "What's your *schedule* for tomorrow?", '¿Cuál es tu horario para mañana?', 'horario'],
      ['several', ['seven', 'severe', 'sever'], "I've been there *several* times.", 'He estado ahí varias veces.', 'varios'],
      ['neighbor', ['nature', 'labor', 'nearby'], 'My *neighbor* has a big dog.', 'Mi vecino tiene un perro grande.', 'vecino'],
      ['receipt', ['recipe', 'receive', 'reset'], 'Can I have a *receipt*, please?', '¿Me da un recibo, por favor?', 'recibo'],
      ['recipe', ['receipt', 'recipient', 'resume'], "This is my grandmother's *recipe*.", 'Esta es la receta de mi abuela.', 'receta'],
      ['clothes', ['coats', 'clouds', 'cloves'], 'I need to wash my *clothes*.', 'Necesito lavar mi ropa.', 'ropa'],
      ['thirsty', ['thirty', 'Thursday', 'first'], "I'm so *thirsty*.", 'Tengo mucha sed.', 'sediento'],
      ['Thursday', ['thirsty', 'Tuesday', 'thirty'], 'The meeting is on *Thursday*.', 'La reunión es el jueves.', 'jueves'],
      ['Tuesday', ['Thursday', 'today', 'twenty'], "I'm free on *Tuesday*.", 'Estoy libre el martes.', 'martes'],
      ['fifteen', ['fifty', 'sixteen', 'fourteen'], 'Give me *fifteen* minutes.', 'Dame quince minutos.', 'quince'],
      ['fifty', ['fifteen', 'fifth', 'filthy'], 'It costs *fifty* dollars.', 'Cuesta cincuenta dólares.', 'cincuenta'],
      ['advice', ['device', 'advance', 'a vice'], 'Can you give me some *advice*?', '¿Me puedes dar un consejo?', 'consejo'],
      ['quite', ['quiet', 'white', 'quit'], 'The test was *quite* easy.', 'El examen fue bastante fácil.', 'bastante'],
      ['quiet', ['quite', 'quit', 'diet'], 'Please be *quiet*.', 'Por favor, haz silencio.', 'callado, tranquilo'],
      ['desert', ['dessert', 'decent', 'deserve'], 'The *desert* is very dry.', 'El desierto es muy seco.', 'desierto'],
      ['dessert', ['desert', 'deserve', 'concert'], "What's for *dessert*?", '¿Qué hay de postre?', 'postre'],
      ['beard', ['bird', 'beer', 'bread'], 'My dad has a long *beard*.', 'Mi papá tiene una barba larga.', 'barba']
    ],
    B2: [
      ['figure out', ['fill out', 'find out', 'freak out'], "Let's *figure out* a plan.", 'Pensemos un plan.', 'descifrar, resolver'],
      ['find out', ['figure out', 'fall out', 'fill out'], 'Did you *find out* what happened?', '¿Averiguaste qué pasó?', 'averiguar'],
      ['run out', ['run into', 'rent out', 'ruin'], "We're about to *run out* of gas.", 'Estamos a punto de quedarnos sin gasolina.', 'quedarse sin'],
      ['put off', ['pull off', 'put on', 'pay off'], "Don't *put off* your homework.", 'No pospongas tu tarea.', 'posponer'],
      ['turn down', ['turn around', 'tear down', 'turn off'], 'Why did you *turn down* the offer?', '¿Por qué rechazaste la oferta?', 'rechazar'],
      ['looking forward to', ['looking for', 'looking after', 'looking up to'], "I'm *looking forward to* the weekend.", 'Tengo ganas de que llegue el fin de semana.', 'tener ganas de'],
      ['get along', ['get alone', 'go along', 'get a loan'], 'Do you *get along* with your boss?', '¿Te llevas bien con tu jefe?', 'llevarse bien'],
      ['made up', ['woke up', 'broke up', 'gave up'], 'They had a fight, but they *made up*.', 'Se pelearon, pero se reconciliaron.', 'reconciliarse'],
      ['give up', ['get up', 'give out', 'go up'], "Don't *give up* now.", 'No te rindas ahora.', 'rendirse'],
      ['deal with', ['feel with', 'dealt with', 'deliver'], "I'll *deal with* it tomorrow.", 'Me encargo de eso mañana.', 'encargarse de'],
      ['anyway', ['away', 'any day', 'and they'], "*Anyway*, let's get back to work.", 'En fin, volvamos al trabajo.', 'en fin, de todos modos'],
      ['whatever', ['whenever', 'wherever', 'whoever'], 'Order *whatever* you want.', 'Pide lo que quieras.', 'lo que sea'],
      ['whenever', ['whatever', 'wherever', 'however'], "Call me *whenever* you're free.", 'Llámame cuando estés libre.', 'cuando sea'],
      ['although', ['all of', 'also', 'all day'], '*Although* it was late, we kept working.', 'Aunque era tarde, seguimos trabajando.', 'aunque'],
      ['apparently', ['a parent', 'appearing', 'approximately'], '*Apparently*, the store is closed.', 'Al parecer, la tienda está cerrada.', 'al parecer'],
      ['eventually', ['actually', 'evidently', 'eventful'], '*Eventually*, everything worked out.', 'Al final, todo salió bien.', 'al final'],
      ['definitely', ['desperately', 'deafening', 'definite'], "I'm *definitely* coming.", 'Definitivamente voy.', 'definitivamente'],
      ['honestly', ['honesty', 'hopefully', 'honey'], "*Honestly*, I don't care.", 'Sinceramente, no me importa.', 'sinceramente'],
      ['hopefully', ['honestly', 'helpfully', 'happily'], "*Hopefully*, it won't rain.", 'Ojalá no llueva.', 'ojalá'],
      ['otherwise', ['other ways', 'others', 'all the ways'], "Hurry up, *otherwise* we'll miss it.", 'Date prisa, si no lo perderemos.', 'si no, de lo contrario'],
      ['available', ['valuable', 'variable', 'affordable'], 'Is the manager *available*?', '¿Está disponible el gerente?', 'disponible'],
      ['appointment', ['disappointment', 'apartment', 'a point meant'], "I have a doctor's *appointment*.", 'Tengo cita con el médico.', 'cita'],
      ['apartment', ['appointment', 'department', 'compartment'], 'Their *apartment* is downtown.', 'Su apartamento está en el centro.', 'apartamento'],
      ['environment', ['employment', 'entertainment', 'enrollment'], 'We need to protect the *environment*.', 'Tenemos que proteger el medio ambiente.', 'medio ambiente'],
      ['especially', ['specially', 'essentially', 'expertly'], 'I love fruit, *especially* mangoes.', 'Me encanta la fruta, especialmente los mangos.', 'especialmente'],
      ['literally', ['literary', 'liberally', 'little really'], 'It was *literally* the best day ever.', 'Fue literalmente el mejor día de mi vida.', 'literalmente'],
      ['basically', ['basic', 'beautifully', 'busily'], '*Basically*, we need more time.', 'Básicamente, necesitamos más tiempo.', 'básicamente'],
      ['temperature', ['temporary', 'temper', 'tempered'], 'The *temperature* dropped last night.', 'La temperatura bajó anoche.', 'temperatura'],
      ['interview', ['interval', 'internet', 'intervene'], 'I have a job *interview* tomorrow.', 'Mañana tengo una entrevista de trabajo.', 'entrevista'],
      ['opportunity', ['opposite', 'operating', 'opportunist'], 'This is a great *opportunity*.', 'Esta es una gran oportunidad.', 'oportunidad']
    ]
  },

  /* ======================================================================
     PREDICE Y ESCUCHA — anticipar, escuchar sin texto y revisar
  ====================================================================== */
  prediccion: {
    A1: [
      { id: 'p-a1-1', titulo: 'At the café', contexto: 'Ana entra a una cafetería y pide algo de tomar y de comer.',
        predice: { opciones: ['coffee', 'milk', 'dog', 'sugar', 'homework', 'cake'], correctas: ['coffee', 'milk', 'sugar', 'cake'] },
        lineas: [
          ['puck', 'Hi! What can I get you?', '¡Hola! ¿Qué te sirvo?'],
          ['leda', 'Hi. Can I have a coffee, please?', 'Hola. ¿Me das un café, por favor?'],
          ['puck', 'Sure. Small or large?', 'Claro. ¿Pequeño o grande?'],
          ['leda', 'Small, please. With milk, no sugar.', 'Pequeño, por favor. Con leche, sin azúcar.'],
          ['puck', 'Anything else?', '¿Algo más?'],
          ['leda', 'Yes, a piece of chocolate cake.', 'Sí, un pedazo de pastel de chocolate.'],
          ['puck', "Okay. That's five dollars.", 'Vale. Son cinco dólares.']],
        preguntas: [
          ['What size is the coffee?', '¿De qué tamaño es el café?', ['Small', 'Large', 'Medium'], 0],
          ['Does Ana want sugar?', '¿Ana quiere azúcar?', ['Yes', 'No', 'Two spoons'], 1],
          ['What else does she order?', '¿Qué más pide?', ['A cookie', 'Chocolate cake', 'A sandwich'], 1],
          ['How much is it?', '¿Cuánto cuesta?', ['Five dollars', 'Fifteen dollars', 'Nine dollars'], 0]] },
      { id: 'p-a1-2', titulo: 'The new neighbor', contexto: 'Tom conoce a su nueva vecina, que se está mudando al edificio.',
        predice: { opciones: ['name', 'from', 'next door', 'pizza', 'airplane', 'help'], correctas: ['name', 'from', 'next door', 'help'] },
        lineas: [
          ['charon', "Hi, I'm Tom. I live next door.", 'Hola, soy Tom. Vivo al lado.'],
          ['aoede', "Oh, hi! I'm Sara. Nice to meet you.", '¡Ah, hola! Soy Sara. Mucho gusto.'],
          ['charon', 'Nice to meet you too. Where are you from?', 'Igualmente. ¿De dónde eres?'],
          ['aoede', "I'm from Colombia. And you?", 'Soy de Colombia. ¿Y tú?'],
          ['charon', "I'm from here, from Chicago. Do you need any help?", 'Soy de aquí, de Chicago. ¿Necesitas ayuda?'],
          ['aoede', 'No, thanks. My brother is helping me.', 'No, gracias. Mi hermano me está ayudando.']],
        preguntas: [
          ['Where is Sara from?', '¿De dónde es Sara?', ['Colombia', 'Chicago', 'Canada'], 0],
          ['Where does Tom live?', '¿Dónde vive Tom?', ['Next door', 'In Colombia', 'At the school'], 0],
          ['Who is helping Sara?', '¿Quién ayuda a Sara?', ['Her brother', 'Tom', 'Her mother'], 0]] },
      { id: 'p-a1-3', titulo: 'Buying a T-shirt', contexto: 'Un cliente busca una camiseta en una tienda de ropa.',
        predice: { opciones: ['size', 'blue', 'price', 'soup', 'medium', 'teacher'], correctas: ['size', 'blue', 'medium'] },
        lineas: [
          ['kore', 'Hi, can I help you?', 'Hola, ¿te ayudo?'],
          ['fenrir', "Yes, I'm looking for a T-shirt.", 'Sí, busco una camiseta.'],
          ['kore', 'What size?', '¿Qué talla?'],
          ['fenrir', 'Medium, please. Do you have it in blue?', 'Mediana, por favor. ¿La tienen en azul?'],
          ['kore', "Yes, here you go. It's fifteen dollars.", 'Sí, aquí tienes. Son quince dólares.'],
          ['fenrir', "Great, I'll take it.", 'Genial, me la llevo.']],
        preguntas: [
          ['What is he looking for?', '¿Qué busca?', ['A T-shirt', 'A jacket', 'Shoes'], 0],
          ['What color does he want?', '¿Qué color quiere?', ['Blue', 'Black', 'Green'], 0],
          ['How much is it?', '¿Cuánto cuesta?', ['Fifteen dollars', 'Fifty dollars', 'Five dollars'], 0]] },
      { id: 'p-a1-4', titulo: 'Where is the bank?', contexto: 'Una turista pregunta en la calle cómo llegar al banco.',
        predice: { opciones: ['left', 'street', 'bank', 'pizza', 'next to', 'swim'], correctas: ['left', 'street', 'bank', 'next to'] },
        lineas: [
          ['leda', 'Excuse me, where is the bank?', 'Disculpe, ¿dónde está el banco?'],
          ['puck', "It's on Main Street.", 'Está en la calle Main.'],
          ['leda', 'Is it far?', '¿Está lejos?'],
          ['puck', "No, it's close. Go straight and turn left at the park.", 'No, está cerca. Siga derecho y gire a la izquierda en el parque.'],
          ['leda', 'Left at the park. Okay.', 'A la izquierda en el parque. Vale.'],
          ['puck', 'The bank is next to the pharmacy.', 'El banco está al lado de la farmacia.'],
          ['leda', 'Thank you so much!', '¡Muchas gracias!']],
        preguntas: [
          ['What street is the bank on?', '¿En qué calle está el banco?', ['Main Street', 'Park Street', 'First Street'], 0],
          ['Where does she turn left?', '¿Dónde gira a la izquierda?', ['At the park', 'At the school', 'At the bank'], 0],
          ["What's next to the bank?", '¿Qué hay al lado del banco?', ['The pharmacy', 'The park', 'The café'], 0]] }
    ],
    A2: [
      { id: 'p-a2-1', titulo: 'Saturday barbecue', contexto: 'Kate llama a su amigo Mike para invitarlo a algo el sábado.',
        predice: { opciones: ['Saturday', 'barbecue', 'time', 'drinks', 'homework', 'snow'], correctas: ['Saturday', 'barbecue', 'time', 'drinks'] },
        lineas: [
          ['aoede', 'Hey, Mike! What are you doing on Saturday?', '¡Hola, Mike! ¿Qué haces el sábado?'],
          ['charon', 'Nothing special. Why?', 'Nada especial. ¿Por qué?'],
          ['aoede', "We're having a barbecue at my place. Do you want to come?", 'Vamos a hacer una parrillada en mi casa. ¿Quieres venir?'],
          ['charon', 'Sounds great! What time?', '¡Suena genial! ¿A qué hora?'],
          ['aoede', 'Around four. Can you bring some drinks?', 'Como a las cuatro. ¿Puedes traer algo de tomar?'],
          ['charon', "Sure. I'll bring soda and some ice.", 'Claro. Llevo gaseosa y hielo.'],
          ['aoede', 'Perfect. See you then!', 'Perfecto. ¡Nos vemos!']],
        preguntas: [
          ["What's the plan?", '¿Cuál es el plan?', ['A barbecue', 'A movie', 'A birthday party'], 0],
          ['What time?', '¿A qué hora?', ['Around four', 'Around nine', 'At noon'], 0],
          ['What will Mike bring?', '¿Qué va a llevar Mike?', ['Soda and ice', 'A cake', 'Burgers'], 0]] },
      { id: 'p-a2-2', titulo: 'Hotel check-in', contexto: 'Un huésped llega a un hotel con una reserva.',
        predice: { opciones: ['reservation', 'nights', 'breakfast', 'password', 'tractor', 'homework'], correctas: ['reservation', 'nights', 'breakfast', 'password'] },
        lineas: [
          ['kore', 'Good evening. Welcome to the Grand Hotel.', 'Buenas noches. Bienvenido al Grand Hotel.'],
          ['fenrir', 'Hi. I have a reservation under Lopez.', 'Hola. Tengo una reserva a nombre de López.'],
          ['kore', 'Let me check. Yes, three nights, a double room.', 'Déjeme ver. Sí, tres noches, habitación doble.'],
          ['fenrir', "That's right. Is breakfast included?", 'Correcto. ¿El desayuno está incluido?'],
          ['kore', "Yes, it's from seven to ten in the restaurant.", 'Sí, es de siete a diez en el restaurante.'],
          ['fenrir', "Great. And what's the Wi-Fi password?", 'Genial. ¿Y cuál es la contraseña del wifi?'],
          ['kore', "It's on your key card. Enjoy your stay!", 'Está en su tarjeta llave. ¡Disfrute su estadía!']],
        preguntas: [
          ['How many nights?', '¿Cuántas noches?', ['Three', 'Two', 'Four'], 0],
          ['When is breakfast?', '¿A qué hora es el desayuno?', ['From seven to ten', 'From six to nine', 'From eight to eleven'], 0],
          ["Where's the Wi-Fi password?", '¿Dónde está la contraseña del wifi?', ['On the key card', 'In the restaurant', 'On the door'], 0]] },
      { id: 'p-a2-3', titulo: 'The lost phone', contexto: 'Una mujer no encuentra su teléfono después de un viaje en taxi.',
        predice: { opciones: ['phone', 'taxi', 'call', 'driver', 'giraffe', 'ice cream'], correctas: ['phone', 'taxi', 'call', 'driver'] },
        lineas: [
          ['leda', "Oh no, I can't find my phone!", '¡Ay no, no encuentro mi teléfono!'],
          ['puck', 'When did you last use it?', '¿Cuándo lo usaste por última vez?'],
          ['leda', 'In the taxi, I think. I called my mom.', 'En el taxi, creo. Llamé a mi mamá.'],
          ['puck', "Let's call it. Maybe someone will answer.", 'Llamémoslo. Quizás alguien conteste.'],
          ['leda', "Good idea. It's ringing.", 'Buena idea. Está sonando.'],
          ['puck', "Hello? Yes? The driver has it! He's coming back.", '¿Hola? ¿Sí? ¡Lo tiene el conductor! Viene de regreso.']],
        preguntas: [
          ['Where did she last use her phone?', '¿Dónde usó su teléfono por última vez?', ['In the taxi', 'At home', 'At the bank'], 0],
          ['Who did she call?', '¿A quién llamó?', ['Her mom', 'The driver', 'Her friend'], 0],
          ['Who has the phone?', '¿Quién tiene el teléfono?', ['The driver', 'A police officer', 'Her mom'], 0]] },
      { id: 'p-a2-4', titulo: 'At the doctor', contexto: 'Una paciente le cuenta al médico cómo se siente.',
        predice: { opciones: ['fever', 'throat', 'medicine', 'rest', 'guitar', 'beach'], correctas: ['fever', 'throat', 'medicine', 'rest'] },
        lineas: [
          ['charon', 'So, what seems to be the problem?', 'Bueno, ¿cuál parece ser el problema?'],
          ['aoede', 'I have a sore throat and a fever.', 'Me duele la garganta y tengo fiebre.'],
          ['charon', 'How long have you felt like this?', '¿Desde cuándo se siente así?'],
          ['aoede', "Since Monday. I can't sleep well.", 'Desde el lunes. No puedo dormir bien.'],
          ['charon', 'Okay. Drink lots of water and take this medicine twice a day.', 'Bien. Tome mucha agua y esta medicina dos veces al día.'],
          ['aoede', 'Do I need to stay home from work?', '¿Tengo que faltar al trabajo?'],
          ['charon', 'Yes, rest for two or three days.', 'Sí, descanse dos o tres días.']],
        preguntas: [
          ['What are her symptoms?', '¿Qué síntomas tiene?', ['Sore throat and fever', 'Headache and cough', 'Stomachache'], 0],
          ['Since when?', '¿Desde cuándo?', ['Since Monday', 'Since Sunday', 'Since last week'], 0],
          ['How often should she take the medicine?', '¿Cada cuánto debe tomar la medicina?', ['Twice a day', 'Once a day', 'Three times a day'], 0]] }
    ],
    B1: [
      { id: 'p-b1-1', titulo: 'A job offer', contexto: 'Una amiga le cuenta a otro que recibió una oferta de trabajo, pero tiene dudas.',
        predice: { opciones: ['salary', 'offer', 'commute', 'from home', 'volcano', 'pizza'], correctas: ['salary', 'offer', 'commute', 'from home'] },
        lineas: [
          ['kore', 'Guess what? I got the job offer from the design company!', '¿Adivina qué? ¡Me llegó la oferta de la empresa de diseño!'],
          ['fenrir', "That's amazing! Are you going to take it?", '¡Increíble! ¿La vas a aceptar?'],
          ['kore', "I'm not sure. The salary is better, but it's an hour away.", 'No estoy segura. El sueldo es mejor, pero queda a una hora.'],
          ['fenrir', 'Could you work from home some days?', '¿Podrías trabajar desde casa algunos días?'],
          ['kore', 'They said two days a week, maybe.', 'Dijeron que quizás dos días a la semana.'],
          ['fenrir', "Then I'd take it. You'd only commute three days.", 'Entonces yo la aceptaría. Solo viajarías tres días.'],
          ['kore', "True. I'll call them tomorrow and ask.", 'Es cierto. Mañana los llamo y pregunto.']],
        preguntas: [
          ["Why isn't she sure?", '¿Por qué no está segura?', ["It's far away", 'The salary is low', "She doesn't like design"], 0],
          ['How many days could she work from home?', '¿Cuántos días podría trabajar desde casa?', ['Two', 'Three', 'Five'], 0],
          ['What will she do tomorrow?', '¿Qué hará mañana?', ['Call the company', 'Start the job', 'Quit her job'], 0]] },
      { id: 'p-b1-2', titulo: 'A new apartment', contexto: 'Una chica encontró apartamento, pero hay un problema con el contrato.',
        predice: { opciones: ['lease', 'pets', 'landlord', 'cat', 'tennis', 'airport'], correctas: ['lease', 'pets', 'landlord', 'cat'] },
        lineas: [
          ['puck', 'So, did you find a new apartment?', 'Entonces, ¿encontraste apartamento nuevo?'],
          ['leda', "I did, but I haven't signed the lease yet.", 'Sí, pero todavía no he firmado el contrato.'],
          ['puck', "What's holding you back?", '¿Qué te frena?'],
          ['leda', "It's perfect, except it doesn't allow pets.", 'Es perfecto, salvo que no permite mascotas.'],
          ['puck', 'Oh no, and you have a cat.', 'Ay no, y tú tienes un gato.'],
          ['leda', 'Exactly. The landlord said he might make an exception.', 'Exacto. El dueño dijo que tal vez haga una excepción.'],
          ['puck', 'Fingers crossed!', '¡Crucemos los dedos!']],
        preguntas: [
          ['Has she signed the lease?', '¿Firmó el contrato?', ['Not yet', 'Yes', "She won't sign it"], 0],
          ["What's the problem?", '¿Cuál es el problema?', ['No pets allowed', "It's too expensive", "It's too small"], 0],
          ['What might the landlord do?', '¿Qué podría hacer el dueño?', ['Make an exception', 'Lower the rent', 'Sell the apartment'], 0]] },
      { id: 'p-b1-3', titulo: 'Wrong order', contexto: 'Un cliente recibe un plato equivocado en un restaurante.',
        predice: { opciones: ['ordered', 'chicken', 'sorry', 'dessert', 'passport', 'snow'], correctas: ['ordered', 'chicken', 'sorry', 'dessert'] },
        lineas: [
          ['charon', 'Excuse me, I ordered the chicken, but this is fish.', 'Disculpe, pedí el pollo, pero esto es pescado.'],
          ['aoede', "I'm so sorry about that. I'll fix it right away.", 'Lo siento mucho. Lo arreglo enseguida.'],
          ['charon', 'Thanks. And could we get some more bread?', 'Gracias. ¿Y nos podría traer más pan?'],
          ['aoede', 'Of course. Your chicken will be ready in about ten minutes.', 'Claro. Su pollo estará listo en unos diez minutos.'],
          ['charon', "That's fine.", 'Está bien.'],
          ['aoede', 'And dessert is on the house tonight, for the trouble.', 'Y el postre va por cuenta de la casa, por la molestia.']],
        preguntas: [
          ['What was wrong?', '¿Qué estaba mal?', ['It was the wrong dish', 'The food was cold', 'It was too salty'], 0],
          ['How long for the chicken?', '¿Cuánto tarda el pollo?', ['About ten minutes', 'About twenty minutes', 'Five minutes'], 0],
          ["What's free?", '¿Qué es gratis?', ['Dessert', 'Bread', 'Drinks'], 0]] },
      { id: 'p-b1-4', titulo: 'Spring break', contexto: 'Dos amigos deciden adónde ir en las vacaciones de primavera.',
        predice: { opciones: ['flights', 'mountains', 'hiking', 'cabin', 'dentist', 'homework'], correctas: ['flights', 'mountains', 'hiking', 'cabin'] },
        lineas: [
          ['leda', 'Have you decided where to go for spring break?', '¿Ya decidiste adónde ir en las vacaciones de primavera?'],
          ['puck', 'We were thinking about Mexico City, but flights are pretty expensive.', 'Pensábamos en Ciudad de México, pero los vuelos están bastante caros.'],
          ['leda', 'What about driving to the mountains instead?', '¿Y si mejor van en carro a las montañas?'],
          ['puck', "That could work. It'd be cheaper and we could go hiking.", 'Podría funcionar. Sería más barato y podríamos hacer senderismo.'],
          ['leda', "And if it rains, there are plenty of cozy cabins.", 'Y si llueve, hay muchas cabañas acogedoras.'],
          ['puck', "Okay, you've convinced me. Let's look for a cabin tonight.", 'Vale, me convenciste. Busquemos una cabaña esta noche.']],
        preguntas: [
          ['Why not Mexico City?', '¿Por qué no Ciudad de México?', ['The flights are expensive', 'The weather is bad', "They don't have time"], 0],
          ["What's the alternative?", '¿Cuál es la alternativa?', ['The mountains', 'The beach', 'Staying home'], 0],
          ['When will they look for a cabin?', '¿Cuándo buscarán una cabaña?', ['Tonight', 'Tomorrow', 'Next week'], 0]] }
    ],
    B2: [
      { id: 'p-b2-1', titulo: 'Team meeting', contexto: 'Una reunión de trabajo sobre el lanzamiento de una aplicación que va atrasado.',
        predice: { opciones: ['deadline', 'developer', 'bugs', 'finance', 'giraffe', 'vacation'], correctas: ['deadline', 'developer', 'bugs', 'finance'] },
        lineas: [
          ['fenrir', "Alright, let's get started. We're a bit behind on the new app launch.", 'Bien, empecemos. Vamos un poco atrasados con el lanzamiento de la app.'],
          ['kore', 'Yeah, the testing took longer than we expected.', 'Sí, las pruebas tomaron más de lo que esperábamos.'],
          ['fenrir', 'Do you think we can still make the June deadline?', '¿Crees que aún podemos cumplir con la fecha límite de junio?'],
          ['kore', "Honestly, it'd be tight. We'd need at least one more developer.", 'Sinceramente, estaría justo. Necesitaríamos al menos otro desarrollador.'],
          ['fenrir', 'Let me talk to finance and see what I can do.', 'Déjame hablar con finanzas y ver qué puedo hacer.'],
          ['kore', "In the meantime, we'll focus on the most critical bugs.", 'Mientras tanto, nos enfocaremos en los errores más críticos.']],
        preguntas: [
          ["What's behind schedule?", '¿Qué va atrasado?', ['The app launch', 'The budget', 'The hiring process'], 0],
          ['What do they need?', '¿Qué necesitan?', ['Another developer', 'More vacation', 'A new manager'], 0],
          ['Who will the manager talk to?', '¿Con quién hablará el jefe?', ['Finance', 'The client', 'Human resources'], 0]] },
      { id: 'p-b2-2', titulo: 'A podcast on learning', contexto: 'Fragmento de un podcast sobre cómo se aprende un idioma de verdad.',
        predice: { opciones: ['talent', 'research', 'input', 'level', 'recipe', 'passport'], correctas: ['talent', 'research', 'input', 'level'] },
        lineas: [
          ['charon', 'You know, a lot of people think learning a language is all about talent.', 'Saben, mucha gente cree que aprender un idioma es cuestión de talento.'],
          ['charon', 'But the research says otherwise.', 'Pero la investigación dice lo contrario.'],
          ['charon', 'What really matters is how much input you get, and whether you actually understand it.', 'Lo que de verdad importa es cuánto escuchas y lees, y si de verdad lo entiendes.'],
          ['charon', "So if you're watching shows way above your level, you're kind of wasting your time.", 'Así que si ves series muy por encima de tu nivel, en cierto modo pierdes el tiempo.'],
          ['charon', "Find stuff that's just a little bit hard, and stick with it.", 'Busca cosas que sean solo un poco difíciles, y no las sueltes.']],
        preguntas: [
          ['What matters most, according to the speaker?', 'Según él, ¿qué importa más?', ['Understandable input', 'Talent', 'Grammar rules'], 0],
          ['Watching shows way above your level is…', 'Ver series muy por encima de tu nivel es…', ['Not very useful', 'The best method', 'Necessary'], 0],
          ['What does he recommend?', '¿Qué recomienda?', ['Material that is a little hard', 'Only reading', 'Studying grammar first'], 0]] },
      { id: 'p-b2-3', titulo: 'Charged twice', contexto: 'Un cliente llama a servicio al cliente por un cobro en su tarjeta.',
        predice: { opciones: ['charged', 'order number', 'refund', 'business days', 'barbecue', 'mountain'], correctas: ['charged', 'order number', 'refund', 'business days'] },
        lineas: [
          ['aoede', 'Thanks for calling. How can I help you today?', 'Gracias por llamar. ¿En qué le puedo ayudar hoy?'],
          ['puck', 'Hi, I was charged twice for the same order.', 'Hola, me cobraron dos veces el mismo pedido.'],
          ['aoede', "I'm sorry to hear that. Could I get your order number?", 'Lamento oír eso. ¿Me da su número de pedido?'],
          ['puck', "Sure, it's four, seven, two, nine, one.", 'Claro, es cuatro, siete, dos, nueve, uno.'],
          ['aoede', "Got it. I see the duplicate charge. I'll refund it right now.", 'Listo. Veo el cobro duplicado. Se lo reembolso ahora mismo.'],
          ['puck', 'How long will it take to show up?', '¿Cuánto tardará en aparecer?'],
          ['aoede', 'Usually three to five business days.', 'Normalmente de tres a cinco días hábiles.']],
        preguntas: [
          ["What's the problem?", '¿Cuál es el problema?', ['He was charged twice', "The order didn't arrive", 'He got the wrong item'], 0],
          ["What's the solution?", '¿Cuál es la solución?', ['A refund', 'A replacement', 'A discount'], 0],
          ['How long will it take?', '¿Cuánto tardará?', ['Three to five business days', 'Twenty-four hours', 'Two weeks'], 0]] },
      { id: 'p-b2-4', titulo: 'Catching up', contexto: 'Dos amigos se encuentran después de mucho tiempo sin verse.',
        predice: { opciones: ['swamped', 'time off', 'camping', 'signal', 'dentist', 'lease'], correctas: ['swamped', 'time off', 'camping', 'signal'] },
        lineas: [
          ['leda', "Oh my gosh, it's been forever! How've you been?", '¡Dios mío, cuánto tiempo! ¿Cómo has estado?'],
          ['charon', "Pretty good! I've been swamped with work, but I finally took some time off.", '¡Bastante bien! He estado a tope de trabajo, pero por fin me tomé unos días.'],
          ['leda', 'Nice! Did you go anywhere?', '¡Qué bien! ¿Fuiste a algún lado?'],
          ['charon', 'Yeah, I went camping up north with my brother. No phone signal for a week.', 'Sí, fui a acampar al norte con mi hermano. Una semana sin señal.'],
          ['leda', 'That sounds amazing. I could really use a break like that.', 'Suena increíble. Me vendría muy bien un descanso así.'],
          ['charon', "You should totally go. I'll send you the spot.", 'Deberías ir, en serio. Te mando el lugar.']],
        preguntas: [
          ['How has he been?', '¿Cómo ha estado él?', ['Busy with work', 'Sick', 'Unemployed'], 0],
          ['Where did he go?', '¿Adónde fue?', ['Camping up north', 'To the beach', 'Abroad'], 0],
          ['What will he send her?', '¿Qué le va a mandar?', ['The location', 'Some photos', 'His tent'], 0]] }
    ]
  },

  /* ======================================================================
     CUENTA LAS PALABRAS — decodificar el habla rápida
  ====================================================================== */
  contar: {
    A1: [
      ["What's your name?", 'What is your name?'],
      ["I'm from Mexico.", 'I am from Mexico.'],
      ["She's my sister.", 'She is my sister.'],
      ["It's a big house.", 'It is a big house.'],
      ["I don't like tea.", 'I do not like tea.'],
      ["We're at home.", 'We are at home.'],
      ["They're very nice.", 'They are very nice.'],
      ["Where's the bank?", 'Where is the bank?'],
      ["I'm not hungry.", 'I am not hungry.'],
      ["Let's go to the park.", 'Let us go to the park.']
    ],
    A2: [
      ["I'm gonna call you later.", 'I am going to call you later.'],
      ['Do you wanna come with us?', 'Do you want to come with us?'],
      ["I didn't see it.", 'I did not see it.'],
      ["She's been to Paris.", 'She has been to Paris.'],
      ["We'll be there soon.", 'We will be there soon.'],
      ["What're you doing?", 'What are you doing?'],
      ["I've got a lot of work.", 'I have got a lot of work.'],
      ["He doesn't know her.", 'He does not know her.'],
      ["Where'd you go?", 'Where did you go?'],
      ["It's gonna rain.", 'It is going to rain.']
    ],
    B1: [
      ['I shoulda called you.', 'I should have called you.'],
      ['Whaddaya want for dinner?', 'What do you want for dinner?'],
      ["We'd better go now.", 'We had better go now.'],
      ['Didja finish the report?', 'Did you finish the report?'],
      ["They've already left.", 'They have already left.'],
      ["We've gotta go now.", 'We have got to go now.'],
      ['I dunno what happened.', 'I do not know what happened.'],
      ['Lemme think about it.', 'Let me think about it.'],
      ["She'd rather stay home.", 'She would rather stay home.'],
      ['You coulda asked me.', 'You could have asked me.']
    ],
    B2: [
      ['Whatcha gonna do about it?', 'What are you going to do about it?'],
      ["I'd've been there if I'd known.", 'I would have been there if I had known.'],
      ['Y\'know what I mean?', 'Do you know what I mean?'],
      ["Gimme a sec, I'll be right back.", 'Give me a second, I will be right back.'],
      ["It's kinda hard to explain.", 'It is kind of hard to explain.'],
      ["We're outta milk again.", 'We are out of milk again.'],
      ["You shouldn't've said that.", 'You should not have said that.'],
      ['Wouldja mind closing the door?', 'Would you mind closing the door?'],
      ["'Cause I didn't wanna go.", 'Because I did not want to go.'],
      ["How've ya been lately?", 'How have you been lately?']
    ]
  },

  /* Frases para no perder el hilo cuando hablas con una persona */
  supervivencia: [
    ['Sorry, could you say that again more slowly?', 'Perdón, ¿podrías repetirlo más despacio?'],
    ["Sorry, I didn't catch that.", 'Perdón, no te entendí.'],
    ['Could you repeat the last part?', '¿Podrías repetir la última parte?'],
    ['What does that word mean?', '¿Qué significa esa palabra?'],
    ['How do you spell that?', '¿Cómo se escribe?'],
    ['Do you mean today or tomorrow?', '¿Quieres decir hoy o mañana?'],
    ['Could you speak a little louder?', '¿Podrías hablar un poco más alto?'],
    ["Sorry, I'm still learning English.", 'Perdón, todavía estoy aprendiendo inglés.'],
    ['Let me see if I understand.', 'Déjame ver si entendí.'],
    ['Could you write it down for me?', '¿Me lo podrías escribir?']
  ]
};
