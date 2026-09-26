'use strict';

/*
 * Las 1000 palabras esenciales del inglés de English Town, agrupadas por tema.
 * Formato de tema:   ## clave|Tema en inglés|Tema en español|zonas|icono
 * Formato de palabra: inglés|tipo|español|extra|icono
 *   tipos: n = sustantivo contable, u = incontable, v = verbo, a = adjetivo, d = adverbio,
 *          p = preposición, r = pronombre/determinante, c = conjunción, q = pregunta,
 *          x = expresión, m = número
 *   extra: verbos → pasado,participio,yo presente,yo pasado (vacío = regular)
 *          otros  → ejemplo «inglés~español» (opcional en sustantivos y adjetivos)
 */
const PALABRAS_TXT = `
## basics|Basics & Greetings|Básico y saludos|plaza,any|👋
hello|x|hola|Hello! Nice to meet you.~¡Hola! Mucho gusto.|👋
hi|x|hola (informal)|Hi, Sam!~¡Hola, Sam!|🙋
goodbye|x|adiós|Goodbye! See you tomorrow.~¡Adiós! Nos vemos mañana.|👋
bye|x|chao|Bye, see you later!~¡Chao, nos vemos luego!|👋
please|x|por favor|Water, please.~Agua, por favor.|🙏
thanks|x|gracias|Thanks for your help.~Gracias por tu ayuda.|🙏
thank you|x|gracias|Thank you very much!~¡Muchas gracias!|🙏
sorry|x|lo siento / perdón|I'm sorry, I'm late.~Lo siento, llegué tarde.|😔
excuse me|x|disculpe|Excuse me, where is the bank?~Disculpe, ¿dónde está el banco?|🙋
welcome|x|bienvenido|Welcome to our town!~¡Bienvenido a nuestro pueblo!|🤗
yes|x|sí|Yes, I understand.~Sí, entiendo.|✅
no|x|no|No, thank you.~No, gracias.|❌
okay|x|está bien / vale|Okay, let's go!~¡Vale, vamos!|👌
maybe|x|quizás|Maybe tomorrow.~Quizás mañana.|🤷
of course|x|claro|Of course you can!~¡Claro que puedes!|👍
good morning|x|buenos días|Good morning, teacher!~¡Buenos días, profesor!|🌅
good afternoon|x|buenas tardes|Good afternoon, everyone.~Buenas tardes a todos.|🌤️
good evening|x|buenas noches (al llegar)|Good evening! How are you?~¡Buenas noches! ¿Cómo estás?|🌆
good night|x|buenas noches (al despedirse)|Good night, sleep well.~Buenas noches, que duermas bien.|🌙
I|r|yo|I am a student.~Yo soy estudiante.|🙋
you|r|tú / usted / ustedes|You are my friend.~Tú eres mi amigo.|👉
he|r|él|He is my brother.~Él es mi hermano.|👦
she|r|ella|She is my sister.~Ella es mi hermana.|👧
it|r|eso / lo|It is a big dog.~Es un perro grande.|👇
we|r|nosotros|We are happy.~Nosotros estamos felices.|👫
they|r|ellos / ellas|They live here.~Ellos viven aquí.|👨‍👩‍👧
me|r|me / mí|Can you help me?~¿Me puedes ayudar?|🙋
him|r|lo / él|I see him every day.~Lo veo todos los días.|👦
her|r|la / su (de ella)|I call her on Sundays.~La llamo los domingos.|👧
us|r|nos / nosotros|Come with us.~Ven con nosotros.|👫
them|r|los / ellos|I like them.~Me gustan (ellos).|👥
my|r|mi|This is my house.~Esta es mi casa.|🏠
your|r|tu / su|Is this your bag?~¿Es esta tu bolsa?|👜
his|r|su (de él)|His car is red.~Su carro es rojo.|🚗
our|r|nuestro|Our school is big.~Nuestra escuela es grande.|🏫
their|r|su (de ellos)|Their dog is small.~Su perro es pequeño.|🐕
mine|r|mío|This book is mine.~Este libro es mío.|📖
yours|r|tuyo|Is this pen yours?~¿Es tuyo este bolígrafo?|🖊️
myself|r|yo mismo|I did it myself.~Lo hice yo mismo.|💪
this|r|este / esto|This is my friend.~Este es mi amigo.|👇
that|r|ese / eso / que|That is a nice car.~Ese es un buen carro.|👉
these|r|estos|These apples are sweet.~Estas manzanas son dulces.|🍎
those|r|esos|Those birds are loud.~Esos pájaros son ruidosos.|🐦
a|r|un / una|I have a cat.~Tengo un gato.|1️⃣
an|r|un / una (antes de vocal)|I eat an apple.~Como una manzana.|🍎
the|r|el / la / los / las|The sun is hot.~El sol está caliente.|☀️
some|r|algunos / algo de|I want some water.~Quiero algo de agua.|💧
any|r|algún / nada de|Do you have any questions?~¿Tienes alguna pregunta?|❓
all|r|todo / todos|All the kids are here.~Todos los niños están aquí.|💯
every|r|cada / todos|I run every day.~Corro todos los días.|🔁
each|r|cada uno|Each student has a book.~Cada estudiante tiene un libro.|☝️
many|r|muchos|There are many cars.~Hay muchos carros.|🚗
much|r|mucho|How much is it?~¿Cuánto cuesta?|💰
more|r|más|I want more rice.~Quiero más arroz.|➕
most|r|la mayoría / lo más|Most people like music.~A la mayoría de la gente le gusta la música.|📊
few|r|pocos|I have few friends here.~Tengo pocos amigos aquí.|🤏
other|r|otro|The other door is open.~La otra puerta está abierta.|🔀
another|r|otro más|Can I have another cookie?~¿Me das otra galleta?|🍪
something|r|algo|I want something to eat.~Quiero algo de comer.|❔
nothing|r|nada|There is nothing here.~No hay nada aquí.|🚫
everything|r|todo|Everything is fine.~Todo está bien.|✨
someone|r|alguien|Someone is at the door.~Alguien está en la puerta.|🚪
everyone|r|todos|Everyone is happy.~Todos están felices.|😀
nobody|r|nadie|Nobody is here.~No hay nadie aquí.|🫥
and|c|y|Bread and milk.~Pan y leche.|➕
or|c|o|Tea or coffee?~¿Té o café?|🔀
but|c|pero|I am tired but happy.~Estoy cansado pero feliz.|↔️
because|c|porque|I eat because I am hungry.~Como porque tengo hambre.|💡
so|c|así que / tan|It's cold, so I wear a coat.~Hace frío, así que me pongo un abrigo.|➡️
if|c|si|If it rains, I stay home.~Si llueve, me quedo en casa.|🤔
when|c|cuando|Call me when you arrive.~Llámame cuando llegues.|⏰
than|c|que (comparación)|A dog is bigger than a cat.~Un perro es más grande que un gato.|⚖️
what|q|qué|What is your name?~¿Cuál es tu nombre?|❓
who|q|quién|Who is she?~¿Quién es ella?|🧑
where|q|dónde|Where is the park?~¿Dónde está el parque?|📍
why|q|por qué|Why are you sad?~¿Por qué estás triste?|🤔
how|q|cómo|How are you?~¿Cómo estás?|🙂
which|q|cuál|Which color do you like?~¿Qué color te gusta?|🎨
whose|q|de quién|Whose bag is this?~¿De quién es esta bolsa?|👜
how many|q|cuántos|How many brothers do you have?~¿Cuántos hermanos tienes?|🔢
how much|q|cuánto|How much is the ticket?~¿Cuánto cuesta el boleto?|💵
there is|x|hay (singular)|There is a cat on the roof.~Hay un gato en el techo.|👆
there are|x|hay (plural)|There are three cars.~Hay tres carros.|👆
name|n|el nombre|My name is Alex.~Mi nombre es Alex.|🏷️
not|x|no (negación)|I am not tired.~No estoy cansado.|🚫
can|x|poder (saber hacer)|I can swim.~Puedo nadar.|💪
could|x|podría / podía|Could you help me?~¿Podrías ayudarme?|🙏
will|x|(futuro) -ré|I will call you tomorrow.~Te llamaré mañana.|🔮
would|x|(condicional) -ría|I would like a coffee.~Me gustaría un café.|☕
should|x|debería|You should sleep more.~Deberías dormir más.|👉
must|x|deber (obligación)|You must stop at a red light.~Debes parar en rojo.|⚠️
might|x|podría (posibilidad)|It might rain today.~Podría llover hoy.|🌦️
let's|x|vamos a (propuesta)|Let's go to the park!~¡Vamos al parque!|🏃
sure|x|claro / seguro|Sure, no problem!~¡Claro, no hay problema!|👍
hey|x|oye / ey|Hey! Look at this!~¡Oye! ¡Mira esto!|🙋
congratulations|x|felicitaciones|Congratulations on your new job!~¡Felicitaciones por tu nuevo trabajo!|🎉
## numbers|Numbers|Números|school,any|🔢
zero|m|cero|0|0️⃣
one|m|uno|1|1️⃣
two|m|dos|2|2️⃣
three|m|tres|3|3️⃣
four|m|cuatro|4|4️⃣
five|m|cinco|5|5️⃣
six|m|seis|6|6️⃣
seven|m|siete|7|7️⃣
eight|m|ocho|8|8️⃣
nine|m|nueve|9|9️⃣
ten|m|diez|10|🔟
eleven|m|once|11|🔢
twelve|m|doce|12|🔢
thirteen|m|trece|13|🔢
fourteen|m|catorce|14|🔢
fifteen|m|quince|15|🔢
sixteen|m|dieciséis|16|🔢
seventeen|m|diecisiete|17|🔢
eighteen|m|dieciocho|18|🔢
nineteen|m|diecinueve|19|🔢
twenty|m|veinte|20|🔢
thirty|m|treinta|30|🔢
forty|m|cuarenta|40|🔢
fifty|m|cincuenta|50|🔢
sixty|m|sesenta|60|🔢
seventy|m|setenta|70|🔢
eighty|m|ochenta|80|🔢
ninety|m|noventa|90|🔢
hundred|m|cien|100|💯
thousand|m|mil|1000|🔢
million|m|millón|1000000|🔢
first|m|primero|1st|🥇
second|m|segundo|2nd|🥈
third|m|tercero|3rd|🥉
last|a|último|He is the last in line.~Él es el último de la fila.|🔚
half|n|la mitad|Half of the cake is gone.~La mitad del pastel ya no está.|🌗
number|n|el número|What is your phone number?~¿Cuál es tu número de teléfono?|🔢
## colors|Colors & Shapes|Colores y formas|any|🎨
color|n|el color|What color is it?~¿De qué color es?|🎨
red|a|rojo||🔴
blue|a|azul||🔵
green|a|verde||🟢
yellow|a|amarillo||🟡
orange|a|naranja (color y fruta)||🟠
purple|a|morado||🟣
pink|a|rosado||🩷
brown|a|marrón||🟤
black|a|negro||⚫
white|a|blanco||⚪
gray|a|gris||🩶
gold|a|dorado||🥇
silver|a|plateado||🥈
light|a|claro / ligero|It is light blue.~Es azul claro.|💡
dark|a|oscuro|The room is dark.~La habitación está oscura.|🌑
circle|n|el círculo||⭕
triangle|n|el triángulo||🔺
line|n|la línea||➖
shape|n|la forma|A circle is a shape.~Un círculo es una forma.|🔷
## people|People & Family|Personas y familia|house,any|👨‍👩‍👧
person|n|la persona||🧑
people|n|la gente|Many people live here.~Mucha gente vive aquí.|👥
man|n|el hombre||👨
woman|n|la mujer||👩
boy|n|el niño||👦
girl|n|la niña||👧
child|n|el niño / la niña|The child is playing.~El niño está jugando.|🧒
children|n|los niños|The children are at school.~Los niños están en la escuela.|🧒
baby|n|el bebé||👶
family|n|la familia||👨‍👩‍👧
mother|n|la madre||👩
father|n|el padre||👨
mom|n|la mamá||👩
dad|n|el papá||👨
parents|n|los padres|My parents are nice.~Mis padres son amables.|👪
brother|n|el hermano||👦
sister|n|la hermana||👧
son|n|el hijo||👦
daughter|n|la hija||👧
grandmother|n|la abuela||👵
grandfather|n|el abuelo||👴
grandparents|n|los abuelos|I visit my grandparents.~Visito a mis abuelos.|👵
aunt|n|la tía||👩
uncle|n|el tío||👨
cousin|n|el primo / la prima||🧑
husband|n|el esposo||🤵
wife|n|la esposa||👰
friend|n|el amigo||🤝
neighbor|n|el vecino||🏘️
guest|n|el invitado||🙋
king|n|el rey||🤴
queen|n|la reina||👸
doctor|n|el médico||🧑‍⚕️
nurse|n|el enfermero / la enfermera||🧑‍⚕️
teacher|n|el profesor||🧑‍🏫
student|n|el estudiante||🧑‍🎓
police officer|n|el policía||👮
firefighter|n|el bombero||🧑‍🚒
farmer|n|el granjero||🧑‍🌾
driver|n|el conductor||🧑‍✈️
worker|n|el trabajador||👷
artist|n|el artista||🧑‍🎨
singer|n|el cantante||🎤
dentist|n|el dentista||🦷
waiter|n|el mesero||🤵
boss|n|el jefe||💼
life|u|la vida|Life is beautiful.~La vida es bella.|🌱
age|u|la edad|What is your age?~¿Cuál es tu edad?|🎂
birthday|n|el cumpleaños|Happy birthday!~¡Feliz cumpleaños!|🎂
party|n|la fiesta|Let's have a party!~¡Hagamos una fiesta!|🎉
wedding|n|la boda||💒
kid|n|el chico / el niño||🧒
adult|n|el adulto||🧑
pilot|n|el piloto||🧑‍✈️
scientist|n|el científico||🧑‍🔬
soldier|n|el soldado||💂
manager|n|el gerente||👔
## body|Body & Health|Cuerpo y salud|hospital,pharmacy,gym|🧍
body|n|el cuerpo||🧍
head|n|la cabeza||🗣️
face|n|la cara||🙂
hair|u|el pelo|She has long hair.~Ella tiene el pelo largo.|💇
eye|n|el ojo||👁️
ear|n|la oreja||👂
nose|n|la nariz||👃
mouth|n|la boca||👄
tooth|n|el diente||🦷
teeth|n|los dientes|Brush your teeth.~Cepíllate los dientes.|🦷
tongue|n|la lengua||👅
lip|n|el labio||👄
neck|n|el cuello||🧣
shoulder|n|el hombro||💪
arm|n|el brazo||💪
hand|n|la mano||✋
finger|n|el dedo||☝️
leg|n|la pierna||🦵
knee|n|la rodilla||🦵
foot|n|el pie||🦶
feet|n|los pies|My feet are cold.~Mis pies están fríos.|🦶
back|n|la espalda||🔙
stomach|n|el estómago||🤰
heart|n|el corazón||❤️
blood|u|la sangre|Blood is red.~La sangre es roja.|🩸
bone|n|el hueso||🦴
skin|u|la piel|The sun is bad for your skin.~El sol es malo para tu piel.|🖐️
brain|n|el cerebro||🧠
health|u|la salud|Health is important.~La salud es importante.|💚
medicine|u|la medicina|Take your medicine.~Toma tu medicina.|💊
pill|n|la pastilla||💊
hospital|n|el hospital||🏥
pharmacy|n|la farmacia||💊
headache|n|el dolor de cabeza|I have a headache.~Tengo dolor de cabeza.|🤕
fever|n|la fiebre|The baby has a fever.~El bebé tiene fiebre.|🤒
pain|u|el dolor|I have pain in my back.~Tengo dolor de espalda.|🤕
sick|a|enfermo||🤒
healthy|a|sano||💪
tired|a|cansado||😴
hungry|a|hambriento|I am hungry.~Tengo hambre.|😋
thirsty|a|sediento|I am thirsty.~Tengo sed.|🥤
strong|a|fuerte||💪
weak|a|débil||😩
toe|n|el dedo del pie||🦶
chin|n|la barbilla||🙂
chest|n|el pecho||🫁
cough|n|la tos|I have a bad cough.~Tengo mucha tos.|😷
## clothes|Clothes|Ropa|clothes,house|👕
clothes|n|la ropa|I buy new clothes.~Compro ropa nueva.|👚
shirt|n|la camisa||👔
T-shirt|n|la camiseta||👕
pants|n|los pantalones|These pants are blue.~Estos pantalones son azules.|👖
jeans|n|los jeans|I like my jeans.~Me gustan mis jeans.|👖
shorts|n|los pantalones cortos|I wear shorts in summer.~Uso pantalones cortos en verano.|🩳
skirt|n|la falda||👗
dress|n|el vestido||👗
coat|n|el abrigo||🧥
jacket|n|la chaqueta||🧥
sweater|n|el suéter||🧶
shoe|n|el zapato||👞
shoes|n|los zapatos|My shoes are new.~Mis zapatos son nuevos.|👟
boots|n|las botas|I wear boots in winter.~Uso botas en invierno.|🥾
socks|n|los calcetines|I need clean socks.~Necesito calcetines limpios.|🧦
hat|n|el sombrero||👒
cap|n|la gorra||🧢
glasses|n|las gafas|I wear glasses.~Uso gafas.|👓
scarf|n|la bufanda||🧣
gloves|n|los guantes|Wear gloves, it's cold.~Ponte guantes, hace frío.|🧤
bag|n|la bolsa||👜
backpack|n|la mochila||🎒
pocket|n|el bolsillo||👖
ring|n|el anillo||💍
umbrella|n|el paraguas||☂️
uniform|n|el uniforme||🥋
pajamas|n|la pijama|I sleep in my pajamas.~Duermo en pijama.|🛌
button|n|el botón||🔘
size|n|la talla / el tamaño|What size are you?~¿Qué talla eres?|📏
belt|n|el cinturón||🪢
necklace|n|el collar||📿
earrings|n|los aretes|Her earrings are gold.~Sus aretes son dorados.|💎
## food|Food & Drinks|Comida y bebidas|market,supermarket,restaurant,bakery,cafe|🍎
food|u|la comida|The food is delicious.~La comida está deliciosa.|🍽️
water|u|el agua|I drink water.~Bebo agua.|💧
milk|u|la leche|Milk is white.~La leche es blanca.|🥛
coffee|u|el café|I drink coffee in the morning.~Tomo café por la mañana.|☕
tea|u|el té|Tea is hot.~El té está caliente.|🍵
juice|u|el jugo|Orange juice, please.~Jugo de naranja, por favor.|🧃
soda|n|el refresco||🥤
bread|u|el pan|I buy bread at the bakery.~Compro pan en la panadería.|🍞
butter|u|la mantequilla|Bread and butter.~Pan con mantequilla.|🧈
cheese|u|el queso|I like cheese.~Me gusta el queso.|🧀
egg|n|el huevo||🥚
rice|u|el arroz|Rice and beans.~Arroz y frijoles.|🍚
beans|n|los frijoles|Beans are healthy.~Los frijoles son sanos.|🫘
pasta|u|la pasta|I cook pasta.~Cocino pasta.|🍝
soup|u|la sopa|The soup is hot.~La sopa está caliente.|🍲
salad|n|la ensalada||🥗
meat|u|la carne|I don't eat meat.~No como carne.|🥩
sandwich|n|el sándwich||🥪
pizza|n|la pizza||🍕
hamburger|n|la hamburguesa||🍔
fries|n|las papas fritas|Fries are salty.~Las papas fritas son saladas.|🍟
fruit|u|la fruta|Fruit is good for you.~La fruta es buena para ti.|🍉
apple|n|la manzana||🍎
banana|n|el plátano||🍌
grapes|n|las uvas|Grapes are sweet.~Las uvas son dulces.|🍇
strawberry|n|la fresa||🍓
lemon|n|el limón||🍋
watermelon|n|la sandía||🍉
pineapple|n|la piña||🍍
cherry|n|la cereza||🍒
vegetable|n|la verdura||🥦
potato|n|la papa||🥔
tomato|n|el tomate||🍅
carrot|n|la zanahoria||🥕
onion|n|la cebolla||🧅
corn|u|el maíz|Corn is yellow.~El maíz es amarillo.|🌽
salt|u|la sal|Pass the salt, please.~Pásame la sal, por favor.|🧂
sugar|u|el azúcar|No sugar, thanks.~Sin azúcar, gracias.|🍬
cake|n|el pastel||🎂
cookie|n|la galleta||🍪
chocolate|u|el chocolate|I love chocolate.~Me encanta el chocolate.|🍫
ice cream|u|el helado|Ice cream is cold.~El helado está frío.|🍦
candy|u|los dulces|Kids like candy.~A los niños les gustan los dulces.|🍬
honey|u|la miel|Honey is sweet.~La miel es dulce.|🍯
breakfast|n|el desayuno|I eat breakfast at seven.~Desayuno a las siete.|🍳
lunch|n|el almuerzo|Lunch is at noon.~El almuerzo es al mediodía.|🥪
dinner|n|la cena|Dinner is ready.~La cena está lista.|🍽️
meal|n|la comida (plato)||🍛
plate|n|el plato||🍽️
cup|n|la taza||☕
glass|n|el vaso||🥛
bottle|n|la botella||🍾
fork|n|el tenedor||🍴
knife|n|el cuchillo||🔪
spoon|n|la cuchara||🥄
menu|n|el menú||📋
restaurant|n|el restaurante||🍽️
market|n|el mercado||🏪
supermarket|n|el supermercado||🛒
bakery|n|la panadería||🥐
delicious|a|delicioso||😋
sweet|a|dulce||🍬
salty|a|salado||🧂
sour|a|agrio||🍋
fresh|a|fresco||🌿
cereal|u|el cereal|I eat cereal for breakfast.~Como cereal en el desayuno.|🥣
yogurt|u|el yogur|Yogurt with fruit.~Yogur con fruta.|🥛
oil|u|el aceite|Cook with a little oil.~Cocina con un poco de aceite.|🫒
pepper|u|la pimienta|Salt and pepper.~Sal y pimienta.|🌶️
dessert|n|el postre||🍮
snack|n|el refrigerio||🥨
nut|n|la nuez||🥜
sausage|n|la salchicha||🌭
## home|Home|La casa|house|🏠
house|n|la casa||🏠
home|n|el hogar|Welcome home!~¡Bienvenido a casa!|🏡
room|n|la habitación||🚪
bedroom|n|el dormitorio||🛏️
bathroom|n|el baño||🛁
kitchen|n|la cocina||🍳
living room|n|la sala||🛋️
garden|n|el jardín||🌷
yard|n|el patio||🏡
garage|n|el garaje||🚗
door|n|la puerta||🚪
window|n|la ventana||🪟
wall|n|la pared||🧱
floor|n|el piso / el suelo||🟫
roof|n|el techo||🏠
stairs|n|las escaleras|Go up the stairs.~Sube las escaleras.|🪜
chimney|n|la chimenea||🧱
key|n|la llave||🔑
bed|n|la cama||🛏️
table|n|la mesa||🪑
chair|n|la silla||🪑
sofa|n|el sofá||🛋️
lamp|n|la lámpara||💡
clock|n|el reloj||🕰️
mirror|n|el espejo||🪞
picture|n|el cuadro / la foto||🖼️
shelf|n|el estante||📚
box|n|la caja||📦
towel|n|la toalla||🧻
soap|u|el jabón|Wash your hands with soap.~Lávate las manos con jabón.|🧼
shower|n|la ducha||🚿
bath|n|el baño (tina)||🛁
toilet|n|el inodoro||🚽
sink|n|el lavabo||🚰
fridge|n|el refrigerador||🧊
oven|n|el horno||♨️
stove|n|la estufa||🔥
pot|n|la olla||🍲
pan|n|la sartén||🍳
blanket|n|la cobija||🛏️
pillow|n|la almohada||🛏️
light bulb|n|el bombillo||💡
candle|n|la vela||🕯️
trash|u|la basura|Take out the trash.~Saca la basura.|🗑️
trash can|n|el bote de basura||🗑️
mailbox|n|el buzón||📫
letter|n|la carta||✉️
gift|n|el regalo||🎁
toy|n|el juguete||🧸
doll|n|la muñeca||🪆
ball|n|la pelota||⚽
phone|n|el teléfono||📱
computer|n|la computadora||💻
television|n|el televisor||📺
camera|n|la cámara||📷
radio|n|el radio||📻
money|u|el dinero|I need money.~Necesito dinero.|💰
wallet|n|la billetera||👛
paper|u|el papel|A piece of paper.~Un pedazo de papel.|📄
thing|n|la cosa|I have many things to do.~Tengo muchas cosas que hacer.|📦
curtain|n|la cortina||🪟
carpet|n|la alfombra||🟥
closet|n|el armario||🚪
drawer|n|el cajón||🗄️
apartment|n|el apartamento||🏢
## town|Town & Transport|Pueblo y transporte|any|🏙️
town|n|el pueblo||🏘️
city|n|la ciudad||🏙️
street|n|la calle||🛣️
road|n|la carretera||🛣️
sidewalk|n|la acera||🚶
corner|n|la esquina||📐
crosswalk|n|el paso de peatones||🚸
traffic light|n|el semáforo||🚦
bridge|n|el puente||🌉
building|n|el edificio||🏢
store|n|la tienda||🏬
shop|n|la tienda pequeña||🏪
bank|n|el banco||🏦
school|n|la escuela||🏫
library|n|la biblioteca||📚
church|n|la iglesia||⛪
museum|n|el museo||🏛️
cinema|n|el cine||🎬
hotel|n|el hotel||🏨
office|n|la oficina||🏢
post office|n|la oficina de correos||📮
police station|n|la estación de policía||🚓
fire station|n|la estación de bomberos||🚒
park|n|el parque||🏞️
square|n|la plaza / el cuadrado||⛲
farm|n|la granja||🚜
zoo|n|el zoológico||🦁
airport|n|el aeropuerto||🛫
station|n|la estación||🚉
bus stop|n|la parada de autobús||🚏
car|n|el carro||🚗
bus|n|el autobús||🚌
taxi|n|el taxi||🚕
truck|n|el camión||🚚
bike|n|la bicicleta||🚲
motorcycle|n|la moto||🏍️
train|n|el tren||🚆
plane|n|el avión||✈️
boat|n|el bote||⛵
ship|n|el barco||🚢
ticket|n|el boleto||🎫
map|n|el mapa||🗺️
way|n|el camino|This is the way to school.~Este es el camino a la escuela.|🧭
place|n|el lugar|This is a nice place.~Este es un lugar bonito.|📍
address|n|la dirección|What is your address?~¿Cuál es tu dirección?|🏷️
sign|n|el letrero||🪧
streetlight|n|la farola||💡
fountain|n|la fuente||⛲
bench|n|la banca||🪑
tower|n|la torre||🗼
trip|n|el viaje|Have a good trip!~¡Buen viaje!|🧳
tourist|n|el turista||📸
left|n|la izquierda|Turn left.~Gira a la izquierda.|⬅️
right|n|la derecha / correcto|Turn right. That's right!~Gira a la derecha. ¡Correcto!|➡️
straight|d|derecho|Go straight.~Sigue derecho.|⬆️
north|n|el norte||🧭
south|n|el sur||🧭
neighborhood|n|el barrio||🏘️
village|n|el pueblito / la aldea||🛖
parking lot|n|el estacionamiento||🅿️
gas station|n|la gasolinera||⛽
subway|n|el metro||🚇
## animals|Animals|Animales|farm,park,petshop|🐾
animal|n|el animal||🐾
dog|n|el perro||🐕
cat|n|el gato||🐈
bird|n|el pájaro||🐦
fish|n|el pez / el pescado||🐠
horse|n|el caballo||🐎
cow|n|la vaca||🐄
pig|n|el cerdo||🐖
sheep|n|la oveja||🐑
goat|n|la cabra||🐐
chicken|n|la gallina / el pollo||🐔
duck|n|el pato||🦆
rabbit|n|el conejo||🐇
mouse|n|el ratón||🐭
lion|n|el león||🦁
tiger|n|el tigre||🐅
elephant|n|el elefante||🐘
monkey|n|el mono||🐒
bear|n|el oso||🐻
snake|n|la serpiente||🐍
frog|n|la rana||🐸
bee|n|la abeja||🐝
butterfly|n|la mariposa||🦋
ant|n|la hormiga||🐜
spider|n|la araña||🕷️
wolf|n|el lobo||🐺
fox|n|el zorro||🦊
turtle|n|la tortuga||🐢
whale|n|la ballena||🐋
shark|n|el tiburón||🦈
giraffe|n|la jirafa||🦒
owl|n|el búho||🦉
pet|n|la mascota||🐾
tail|n|la cola||🐒
wing|n|el ala||🪽
egg shell|n|la cáscara de huevo||🥚
penguin|n|el pingüino||🐧
deer|n|el venado||🦌
parrot|n|el loro||🦜
insect|n|el insecto||🐞
## nature|Nature & Weather|Naturaleza y clima|park,farm|🌳
nature|u|la naturaleza|I love nature.~Me encanta la naturaleza.|🌿
tree|n|el árbol||🌳
flower|n|la flor||🌸
grass|u|el césped|The grass is green.~El césped es verde.|🌱
leaf|n|la hoja||🍃
plant|n|la planta||🪴
forest|n|el bosque||🌲
mountain|n|la montaña||⛰️
hill|n|la colina||⛰️
river|n|el río||🏞️
lake|n|el lago||🏞️
sea|n|el mar||🌊
ocean|n|el océano||🌊
beach|n|la playa||🏖️
island|n|la isla||🏝️
sand|u|la arena|The sand is hot.~La arena está caliente.|🏖️
rock|n|la roca||🪨
stone|n|la piedra||🪨
pond|n|el estanque||🦆
sky|n|el cielo||🌤️
sun|n|el sol||☀️
moon|n|la luna||🌙
star|n|la estrella||⭐
cloud|n|la nube||☁️
rain|u|la lluvia|I like the rain.~Me gusta la lluvia.|🌧️
snow|u|la nieve|Snow is white.~La nieve es blanca.|❄️
wind|u|el viento|The wind is strong.~El viento es fuerte.|💨
weather|u|el clima|The weather is nice today.~El clima está agradable hoy.|🌦️
storm|n|la tormenta||⛈️
rainbow|n|el arcoíris||🌈
ice|u|el hielo|Ice is cold.~El hielo es frío.|🧊
fire|u|el fuego|Fire is hot.~El fuego es caliente.|🔥
air|u|el aire|Fresh air.~Aire fresco.|🌬️
earth|n|la Tierra||🌍
world|n|el mundo||🌎
land|u|la tierra (suelo)|The land is dry.~La tierra está seca.|🟫
sunny|a|soleado|It is sunny today.~Hoy está soleado.|☀️
cloudy|a|nublado|It is cloudy.~Está nublado.|☁️
rainy|a|lluvioso|It is a rainy day.~Es un día lluvioso.|🌧️
windy|a|con viento|It is windy.~Hace viento.|💨
hot|a|caliente / caluroso||🥵
warm|a|tibio / cálido||🌡️
cool|a|fresco||😎
cold|a|frío||🥶
wet|a|mojado||💦
dry|a|seco||🏜️
desert|n|el desierto||🏜️
planet|n|el planeta||🪐
jungle|n|la selva||🌴
sunset|n|el atardecer||🌇
## time|Time & Calendar|Tiempo y calendario|plaza|🕰️
time|u|el tiempo / la hora|What time is it?~¿Qué hora es?|⏰
hour|n|la hora|The movie is two hours long.~La película dura dos horas.|⏰
minute|n|el minuto|Wait a minute, please.~Espera un minuto, por favor.|⏱️
day|n|el día|Have a nice day!~¡Que tengas un buen día!|📅
night|n|la noche|I sleep at night.~Duermo de noche.|🌙
morning|n|la mañana|I drink coffee in the morning.~Tomo café por la mañana.|🌅
afternoon|n|la tarde|We play in the afternoon.~Jugamos por la tarde.|🌤️
evening|n|la noche (temprano)|We eat dinner in the evening.~Cenamos por la noche.|🌆
noon|n|el mediodía|Lunch is at noon.~El almuerzo es al mediodía.|🕛
midnight|n|la medianoche|I go to bed at midnight.~Me acuesto a medianoche.|🕛
week|n|la semana|A week has seven days.~Una semana tiene siete días.|📅
weekend|n|el fin de semana|I rest on the weekend.~Descanso el fin de semana.|🎉
month|n|el mes|A year has twelve months.~Un año tiene doce meses.|🗓️
year|n|el año|Happy New Year!~¡Feliz Año Nuevo!|📆
today|d|hoy|Today is Monday.~Hoy es lunes.|📅
tomorrow|d|mañana|See you tomorrow.~Nos vemos mañana.|➡️
yesterday|d|ayer|I was here yesterday.~Estuve aquí ayer.|⬅️
tonight|d|esta noche|Let's go out tonight.~Salgamos esta noche.|🌙
now|d|ahora|I am busy now.~Estoy ocupado ahora.|⏱️
later|d|más tarde|See you later!~¡Nos vemos más tarde!|⏳
soon|d|pronto|The bus comes soon.~El autobús viene pronto.|🔜
early|d|temprano|I wake up early.~Me despierto temprano.|🌅
late|a|tarde / atrasado|I am late.~Llego tarde.|⌛
ago|d|hace (tiempo)|Two days ago.~Hace dos días.|⏪
Monday|n|el lunes||📅
Tuesday|n|el martes||📅
Wednesday|n|el miércoles||📅
Thursday|n|el jueves||📅
Friday|n|el viernes||📅
Saturday|n|el sábado||📅
Sunday|n|el domingo||📅
January|n|enero||❄️
February|n|febrero||💘
March|n|marzo||🌱
April|n|abril||🌷
May|n|mayo||🌼
June|n|junio||☀️
July|n|julio||🏖️
August|n|agosto||🌻
September|n|septiembre||🍂
October|n|octubre||🎃
November|n|noviembre||🍁
December|n|diciembre||🎄
spring|n|la primavera|Flowers grow in spring.~Las flores crecen en primavera.|🌸
summer|n|el verano|It is hot in summer.~Hace calor en verano.|☀️
autumn|n|el otoño|Leaves fall in autumn.~Las hojas caen en otoño.|🍂
winter|n|el invierno|It is cold in winter.~Hace frío en invierno.|⛄
season|n|la estación del año|Summer is my favorite season.~El verano es mi estación favorita.|🔄
holiday|n|las vacaciones / el feriado|We go to the beach on holiday.~Vamos a la playa en vacaciones.|🏖️
calendar|n|el calendario|Look at the calendar.~Mira el calendario.|📅
date|n|la fecha|What's the date today?~¿Qué fecha es hoy?|📆
o'clock|x|en punto|It's five o'clock.~Son las cinco en punto.|🕔
quarter|n|el cuarto|A quarter past two.~Las dos y cuarto.|🕒
future|u|el futuro|The future is bright.~El futuro es brillante.|🔮
past|u|el pasado|Forget the past.~Olvida el pasado.|📜
moment|n|el momento|Just a moment, please.~Un momento, por favor.|⏱️
schedule|n|el horario|Check the bus schedule.~Revisa el horario del autobús.|🗓️
## school|School & Work|Escuela y trabajo|school,library,office,bank|🏫
class|n|la clase|The class starts at nine.~La clase empieza a las nueve.|🧑‍🏫
classroom|n|el salón de clase||🏫
lesson|n|la lección|Today we have an English lesson.~Hoy tenemos una lección de inglés.|📘
homework|u|la tarea|I do my homework.~Hago mi tarea.|📝
test|n|el examen|I have a test tomorrow.~Tengo un examen mañana.|📝
question|n|la pregunta|Can I ask a question?~¿Puedo hacer una pregunta?|❓
answer|n|la respuesta|That is the right answer.~Esa es la respuesta correcta.|💬
book|n|el libro||📖
notebook|n|el cuaderno||📓
pen|n|el bolígrafo||🖊️
pencil|n|el lápiz||✏️
eraser|n|el borrador||🧽
desk|n|el escritorio||🪑
board|n|el tablero||📋
page|n|la página||📄
word|n|la palabra||🔤
sentence|n|la oración||💬
story|n|la historia / el cuento|Tell me a story.~Cuéntame una historia.|📚
language|n|el idioma||🗣️
English|u|el inglés|I speak English.~Hablo inglés.|🇬🇧
Spanish|u|el español|She speaks Spanish.~Ella habla español.|🇪🇸
math|u|las matemáticas|Math is easy.~Las matemáticas son fáciles.|➗
science|u|la ciencia|I like science.~Me gusta la ciencia.|🔬
history|u|la historia|History is interesting.~La historia es interesante.|🏛️
art|u|el arte|Art is fun.~El arte es divertido.|🎨
music|u|la música|I listen to music.~Escucho música.|🎵
idea|n|la idea|That is a good idea!~¡Es una buena idea!|💡
example|n|el ejemplo||📌
problem|n|el problema|No problem!~¡No hay problema!|⚠️
mistake|n|el error|Everyone makes mistakes.~Todos cometen errores.|❌
job|n|el trabajo (empleo)|She has a new job.~Ella tiene un trabajo nuevo.|💼
company|n|la empresa||🏢
meeting|n|la reunión|The meeting is at ten.~La reunión es a las diez.|👥
email|n|el correo electrónico||📧
internet|u|el internet|I use the internet.~Uso internet.|🌐
information|u|la información|I need more information.~Necesito más información.|ℹ️
news|u|las noticias|I read the news.~Leo las noticias.|📰
price|n|el precio||🏷️
list|n|la lista||📋
group|n|el grupo||👥
team|n|el equipo||🤝
plan|n|el plan|What is your plan for today?~¿Cuál es tu plan para hoy?|🗺️
university|n|la universidad||🎓
dictionary|n|el diccionario||📕
subject|n|la materia||📚
ruler|n|la regla||📏
scissors|n|las tijeras|Cut the paper with scissors.~Corta el papel con tijeras.|✂️
## hobbies|Hobbies & Sports|Pasatiempos y deportes|field,gym,cinema|⚽
game|n|el juego|Let's play a game!~¡Juguemos un juego!|🎮
sport|n|el deporte||🏅
soccer|u|el fútbol|We play soccer.~Jugamos fútbol.|⚽
basketball|u|el baloncesto|He plays basketball.~Él juega baloncesto.|🏀
tennis|u|el tenis|Tennis is fun.~El tenis es divertido.|🎾
swimming|u|la natación|Swimming is good exercise.~La natación es buen ejercicio.|🏊
exercise|u|el ejercicio|Exercise is healthy.~El ejercicio es sano.|🏋️
movie|n|la película||🎬
song|n|la canción||🎶
guitar|n|la guitarra||🎸
piano|n|el piano||🎹
drum|n|el tambor||🥁
photo|n|la foto||📸
painting|n|la pintura (cuadro)||🖼️
kite|n|la cometa||🪁
fun|u|la diversión|Have fun!~¡Diviértete!|🥳
hobby|n|el pasatiempo||🎨
race|n|la carrera|She won the race!~¡Ella ganó la carrera!|🏁
winner|n|el ganador|You are the winner!~¡Tú eres el ganador!|🏆
prize|n|el premio||🏆
goal|n|el gol / la meta|My goal is to learn English.~Mi meta es aprender inglés.|🥅
field|n|el campo / la cancha||🏟️
gym|n|el gimnasio||🏋️
player|n|el jugador||🧑‍🦱
concert|n|el concierto||🎤
video game|n|el videojuego||🎮
chess|u|el ajedrez|Do you play chess?~¿Juegas ajedrez?|♟️
## verbs|Verbs|Verbos|any|🏃
be|v|ser / estar|was,been,soy,fui|🟰
have|v|tener|had,had,tengo,tuve|🤲
do|v|hacer|did,done,hago,hice|✅
go|v|ir|went,gone,voy,fui|🚶
come|v|venir|came,come,vengo,vine|🏃
get|v|conseguir / obtener|got,gotten,consigo,conseguí|🤲
make|v|hacer / fabricar|made,made,hago,hice|🛠️
say|v|decir|said,said,digo,dije|💬
tell|v|contar / decir|told,told,cuento,conté|🗣️
see|v|ver|saw,seen,veo,vi|👀
look|v|mirar|,,miro,miré|👀
watch|v|mirar / observar|,,observo,observé|📺
hear|v|oír|heard,heard,oigo,oí|👂
listen|v|escuchar|,,escucho,escuché|🎧
know|v|saber / conocer|knew,known,sé,supe|🧠
think|v|pensar|thought,thought,pienso,pensé|🤔
want|v|querer|,,quiero,quise|🙏
need|v|necesitar|,,necesito,necesité|❗
like|v|gustar|,,me gusta,me gustó|👍
love|v|amar / encantar|,,amo,amé|❤️
feel|v|sentir|felt,felt,siento,sentí|💭
give|v|dar|gave,given,doy,di|🎁
take|v|tomar / llevar|took,taken,tomo,tomé|✋
bring|v|traer|brought,brought,traigo,traje|🧺
put|v|poner|put,put,pongo,puse|📥
use|v|usar|,,uso,usé|🛠️
find|v|encontrar|found,found,encuentro,encontré|🔍
lose|v|perder|lost,lost,pierdo,perdí|😕
keep|v|guardar / mantener|kept,kept,guardo,guardé|🗄️
leave|v|salir / dejar|left,left,salgo,salí|🚪
stay|v|quedarse|,,me quedo,me quedé|🏠
live|v|vivir|,,vivo,viví|🏡
work|v|trabajar|,,trabajo,trabajé|💼
play|v|jugar / tocar|,,juego,jugué|⚽
study|v|estudiar|,,estudio,estudié|📚
learn|v|aprender|,,aprendo,aprendí|🧠
teach|v|enseñar|taught,taught,enseño,enseñé|🧑‍🏫
read|v|leer|read,read,leo,leí|📖
write|v|escribir|wrote,written,escribo,escribí|✍️
speak|v|hablar (un idioma)|spoke,spoken,hablo,hablé|🗣️
talk|v|hablar / conversar|,,hablo,hablé|💬
ask|v|preguntar / pedir|,,pregunto,pregunté|❓
call|v|llamar|,,llamo,llamé|📞
help|v|ayudar|,,ayudo,ayudé|🤝
try|v|intentar|,,intento,intenté|🎯
start|v|empezar|,,empiezo,empecé|▶️
begin|v|comenzar|began,begun,comienzo,comencé|🏁
finish|v|terminar|,,termino,terminé|🏁
stop|v|parar|,,paro,paré|🛑
open|v|abrir|,,abro,abrí|📂
close|v|cerrar|,,cierro,cerré|📁
walk|v|caminar|,,camino,caminé|🚶
run|v|correr|ran,run,corro,corrí|🏃
jump|v|saltar|,,salto,salté|🦘
swim|v|nadar|swam,swum,nado,nadé|🏊
fly|v|volar|flew,flown,vuelo,volé|🕊️
drive|v|conducir|drove,driven,conduzco,conduje|🚗
ride|v|montar (en bici)|rode,ridden,monto,monté|🚲
sit|v|sentarse|sat,sat,me siento,me senté|🪑
stand|v|estar de pie|stood,stood,estoy de pie,estuve de pie|🧍
sleep|v|dormir|slept,slept,duermo,dormí|😴
wake up|v|despertarse|woke up,woken up,me despierto,me desperté|⏰
eat|v|comer|ate,eaten,como,comí|🍽️
drink|v|beber|drank,drunk,bebo,bebí|🥤
cook|v|cocinar|,,cocino,cociné|🍳
buy|v|comprar|bought,bought,compro,compré|🛒
sell|v|vender|sold,sold,vendo,vendí|🏷️
pay|v|pagar|paid,paid,pago,pagué|💳
cost|v|costar|cost,cost,cuesta,costó|💲
wear|v|llevar puesto|wore,worn,llevo,llevé|👕
wash|v|lavar|,,lavo,lavé|🧼
sweep|v|barrer|swept,swept,barro,barrí|🧹
build|v|construir|built,built,construyo,construí|🏗️
break|v|romper|broke,broken,rompo,rompí|💥
fix|v|arreglar|,,arreglo,arreglé|🔧
cut|v|cortar|cut,cut,corto,corté|✂️
draw|v|dibujar|drew,drawn,dibujo,dibujé|✏️
paint|v|pintar|,,pinto,pinté|🎨
sing|v|cantar|sang,sung,canto,canté|🎤
dance|v|bailar|,,bailo,bailé|💃
laugh|v|reír|,,me río,me reí|😂
cry|v|llorar|,,lloro,lloré|😢
smile|v|sonreír|,,sonrío,sonreí|😊
wave|v|saludar con la mano|,,saludo,saludé|👋
meet|v|conocer / reunirse|met,met,conozco,conocí|🤝
visit|v|visitar|,,visito,visité|🏘️
travel|v|viajar|,,viajo,viajé|✈️
arrive|v|llegar|,,llego,llegué|🛬
return|v|regresar|,,regreso,regresé|↩️
move|v|mover / mudarse|,,me muevo,me moví|↔️
carry|v|cargar|,,cargo,cargué|🛍️
throw|v|lanzar|threw,thrown,lanzo,lancé|🤾
catch|v|atrapar|caught,caught,atrapo,atrapé|🧤
push|v|empujar|,,empujo,empujé|👐
pull|v|jalar|,,jalo,jalé|🪢
turn|v|girar|,,giro,giré|↪️
cross|v|cruzar|,,cruzo,crucé|🚸
wait|v|esperar|,,espero,esperé|⏳
show|v|mostrar|showed,shown,muestro,mostré|👉
send|v|enviar|sent,sent,envío,envié|📤
remember|v|recordar|,,recuerdo,recordé|🧠
forget|v|olvidar|forgot,forgotten,olvido,olvidé|💭
understand|v|entender|understood,understood,entiendo,entendí|💡
believe|v|creer|,,creo,creí|🙏
hope|v|esperar (desear)|,,espero,esperé|🤞
win|v|ganar|won,won,gano,gané|🏆
choose|v|elegir|chose,chosen,elijo,elegí|☑️
become|v|convertirse en|became,become,me convierto,me convertí|🦋
grow|v|crecer|grew,grown,crezco,crecí|🌱
change|v|cambiar|,,cambio,cambié|🔄
happen|v|pasar / suceder|,,pasa,pasó|❗
feed|v|alimentar|fed,fed,alimento,alimenté|🍞
climb|v|trepar / escalar|,,escalo,escalé|🧗
fall|v|caer|fell,fallen,me caigo,me caí|🍂
hold|v|sostener|held,held,sostengo,sostuve|🤲
kiss|v|besar|,,beso,besé|😘
hug|v|abrazar|,,abrazo,abracé|🤗
knock|v|tocar (la puerta)|,,toco,toqué|✊
rest|v|descansar|,,descanso,descansé|🛋️
relax|v|relajarse|,,me relajo,me relajé|😌
save|v|ahorrar / salvar|,,ahorro,ahorré|🐷
spend|v|gastar / pasar (tiempo)|spent,spent,gasto,gasté|💸
borrow|v|pedir prestado|,,pido prestado,pedí prestado|🤝
enjoy|v|disfrutar|,,disfruto,disfruté|😄
agree|v|estar de acuerdo|,,estoy de acuerdo,estuve de acuerdo|🤝
decide|v|decidir|,,decido,decidí|⚖️
explain|v|explicar|,,explico,expliqué|🧑‍🏫
follow|v|seguir|,,sigo,seguí|👣
invite|v|invitar|,,invito,invité|💌
practice|v|practicar|,,practico,practiqué|🔁
share|v|compartir|,,comparto,compartí|🤲
touch|v|tocar|,,toco,toqué|👆
## adjectives|Adjectives|Adjetivos|any|✨
good|a|bueno||👍
bad|a|malo||👎
big|a|grande||🐘
small|a|pequeño||🐭
little|a|pequeñito||🤏
large|a|amplio / grande||🏟️
tall|a|alto||🦒
short|a|bajo / corto||📏
long|a|largo||📏
high|a|alto (altura)||🏔️
low|a|bajo (altura)||⬇️
new|a|nuevo||✨
old|a|viejo||👴
young|a|joven||👶
happy|a|feliz||😀
sad|a|triste||😢
angry|a|enojado||😠
afraid|a|asustado|I am afraid of spiders.~Tengo miedo de las arañas.|😨
surprised|a|sorprendido||😮
bored|a|aburrido||🥱
excited|a|emocionado||🤩
worried|a|preocupado||😟
nice|a|amable / agradable||😊
kind|a|amable||🤗
friendly|a|amigable||🙂
funny|a|gracioso||😂
beautiful|a|bonito / hermoso||🌸
pretty|a|lindo||🌼
ugly|a|feo||👹
clean|a|limpio||🧼
dirty|a|sucio||💩
easy|a|fácil||✅
difficult|a|difícil||🧩
hard|a|duro / difícil||🪨
soft|a|suave||🧸
fast|a|rápido||⚡
slow|a|lento||🐢
quick|a|veloz||💨
busy|a|ocupado||📆
free|a|libre / gratis||🆓
full|a|lleno||🈵
empty|a|vacío||🫙
closed|a|cerrado||📁
wrong|a|incorrecto||✖️
true|a|verdadero||✔️
important|a|importante||❗
interesting|a|interesante||🤔
boring|a|aburrido (cosa)||😴
great|a|genial / grande||🌟
wonderful|a|maravilloso||🤩
terrible|a|terrible||😱
expensive|a|caro||💎
cheap|a|barato||🏷️
rich|a|rico||💰
poor|a|pobre||🪙
heavy|a|pesado||🏋️
thin|a|delgado||🥢
fat|a|gordo||🐷
quiet|a|tranquilo / silencioso||🤫
loud|a|ruidoso||📢
same|a|mismo|We have the same shoes.~Tenemos los mismos zapatos.|🟰
different|a|diferente||🔀
far|a|lejano||🔭
ready|a|listo||✅
possible|a|posible||👍
favorite|a|favorito||⭐
real|a|real||✔️
safe|a|seguro||🛡️
dangerous|a|peligroso||⚠️
alone|a|solo||🧍
together|d|juntos|Let's play together.~Juguemos juntos.|🤝
lucky|a|afortunado||🍀
famous|a|famoso||🌟
perfect|a|perfecto||💯
simple|a|sencillo||🔹
modern|a|moderno||🏙️
round|a|redondo||⚪
deep|a|profundo||🌊
wide|a|ancho||↔️
bright|a|brillante||🌟
sleepy|a|con sueño||😪
brave|a|valiente||🦁
smart|a|inteligente||🧠
lazy|a|perezoso||🦥
polite|a|educado||🎩
careful|a|cuidadoso||🧐
cute|a|tierno / lindo||🥰
fantastic|a|fantástico||🤩
strange|a|extraño||🤨
## adverbs|Adverbs|Adverbios|any|⚡
slowly|d|despacio|He walks slowly.~Él camina despacio.|🐢
quickly|d|rápidamente|She runs quickly.~Ella corre rápidamente.|⚡
carefully|d|con cuidado|Drive carefully.~Conduce con cuidado.|🧐
happily|d|alegremente|They play happily.~Ellos juegan alegremente.|😄
quietly|d|en silencio|Read quietly, please.~Lee en silencio, por favor.|🤫
loudly|d|en voz alta|He sings loudly.~Él canta en voz alta.|📢
well|d|bien|You speak English well.~Hablas inglés bien.|👍
badly|d|mal|I sing badly.~Canto mal.|👎
very|d|muy|It is very cold.~Hace mucho frío.|‼️
too|d|también / demasiado|I like it too.~A mí también me gusta.|➕
also|d|también|I also speak Spanish.~También hablo español.|➕
only|d|solo|I have only one brother.~Solo tengo un hermano.|☝️
just|d|justo / solo|I just arrived.~Acabo de llegar.|⏱️
really|d|realmente|I really like it.~Realmente me gusta.|💯
always|d|siempre|I always eat breakfast.~Siempre desayuno.|🔁
usually|d|normalmente|I usually walk to school.~Normalmente camino a la escuela.|📅
often|d|a menudo|We often go to the park.~A menudo vamos al parque.|🔂
sometimes|d|a veces|Sometimes it rains.~A veces llueve.|🌦️
never|d|nunca|I never drink coffee.~Nunca tomo café.|🚫
again|d|otra vez|Say it again.~Dilo otra vez.|🔁
already|d|ya|I have already eaten.~Ya he comido.|✔️
still|d|todavía|She is still here.~Ella todavía está aquí.|⏸️
yet|d|aún|I haven't finished yet.~Aún no he terminado.|⏳
here|d|aquí|Come here!~¡Ven aquí!|📍
there|d|allí|The bank is there.~El banco está allí.|👉
everywhere|d|en todas partes|There are birds everywhere.~Hay pájaros en todas partes.|🌍
away|d|lejos|Go away!~¡Vete!|🏃
outside|d|afuera|Let's play outside.~Juguemos afuera.|🌳
inside|d|adentro|Come inside, it's cold.~Entra, hace frío.|🏠
up|d|arriba|Look up!~¡Mira arriba!|⬆️
down|d|abajo|Sit down, please.~Siéntate, por favor.|⬇️
gently|d|suavemente|Touch the cat gently.~Toca al gato suavemente.|🪶
patiently|d|con paciencia|She waits patiently.~Ella espera con paciencia.|⏳
easily|d|fácilmente|I can do it easily.~Puedo hacerlo fácilmente.|✅
almost|d|casi|It's almost ten.~Son casi las diez.|🤏
enough|d|suficiente|I have enough money.~Tengo suficiente dinero.|✔️
probably|d|probablemente|It will probably rain.~Probablemente lloverá.|🤔
## prepositions|Prepositions|Preposiciones|any|📍
in|p|en / dentro de|The cat is in the box.~El gato está en la caja.|📦
on|p|sobre / en|The book is on the table.~El libro está sobre la mesa.|📚
under|p|debajo de|The ball is under the bed.~La pelota está debajo de la cama.|⬇️
over|p|por encima de|The plane flies over the city.~El avión vuela sobre la ciudad.|✈️
above|p|encima de|The lamp is above the table.~La lámpara está encima de la mesa.|⬆️
below|p|debajo de / por debajo|The fish swim below the boat.~Los peces nadan debajo del bote.|🐟
next to|p|al lado de|The bank is next to the café.~El banco está al lado de la cafetería.|↔️
near|p|cerca de|I live near the park.~Vivo cerca del parque.|📍
behind|p|detrás de|The dog is behind the house.~El perro está detrás de la casa.|🔙
in front of|p|delante de|The car is in front of the school.~El carro está delante de la escuela.|🔜
between|p|entre|The bench is between two trees.~La banca está entre dos árboles.|↔️
across from|p|enfrente de|The school is across from the park.~La escuela está enfrente del parque.|↕️
at|p|en (lugar / hora)|I am at home. See you at five.~Estoy en casa. Nos vemos a las cinco.|📍
to|p|a / hacia|I go to school.~Voy a la escuela.|➡️
from|p|de / desde|I am from Mexico.~Soy de México.|⬅️
with|p|con|Coffee with milk.~Café con leche.|🤝
without|p|sin|Tea without sugar.~Té sin azúcar.|🚫
for|p|para / por|This gift is for you.~Este regalo es para ti.|🎁
of|p|de|A cup of tea.~Una taza de té.|☕
about|p|sobre / acerca de|A book about animals.~Un libro sobre animales.|📖
into|p|hacia dentro de|She walks into the store.~Ella entra a la tienda.|🚪
out of|p|fuera de|He runs out of the house.~Él sale corriendo de la casa.|🏃
through|p|a través de|We walk through the park.~Caminamos a través del parque.|🚶
around|p|alrededor de|We walk around the lake.~Caminamos alrededor del lago.|🔄
along|p|a lo largo de|Walk along the street.~Camina a lo largo de la calle.|➡️
across|p|al otro lado / a través|Walk across the street.~Cruza la calle.|🚸
before|p|antes de|Wash your hands before dinner.~Lávate las manos antes de cenar.|⏮️
after|p|después de|We play after school.~Jugamos después de la escuela.|⏭️
during|p|durante|Don't talk during the movie.~No hables durante la película.|🎬
until|p|hasta|Wait until five.~Espera hasta las cinco.|⏳
by|p|junto a / en (transporte)|I go by bus.~Voy en autobús.|🚌
off|p|fuera de (bajar de)|Get off the bus here.~Bájate del autobús aquí.|🚏
`;

const DOUBLE = new Set(['run', 'swim', 'sit', 'get', 'put', 'stop', 'begin', 'shop', 'plan', 'cut', 'win', 'hug', 'drop', 'jog', 'dig', 'hit', 'set', 'chat', 'forget']);

const PALABRAS = (() => {
  const themes = [];
  const words = [];
  let cur = null;
  PALABRAS_TXT.split('\n').forEach(line => {
    line = line.trim();
    if (!line) return;
    if (line.startsWith('## ')) {
      const [key, name, es, zones, icon] = line.slice(3).split('|');
      cur = { key, name, es, zones: zones.split(','), icon, words: [] };
      themes.push(cur);
      return;
    }
    const [en, t, es, extra = '', icon = ''] = line.split('|');
    const w = { id: `${cur.key}:${en}`, en, t, es, icon, theme: cur.key };
    if (t === 'v') {
      const [past, pp, yoPres, yoPast] = extra.split(',');
      w.past = past || regularPast(en);
      w.pp = pp || w.past;
      w.ing = ingForm(en);
      w.s = thirdPerson(en);
      w.yoPres = yoPres;
      w.yoPast = yoPast;
    } else if (t === 'm') {
      w.value = extra;
    } else if (extra.includes('~')) {
      [w.exEn, w.exEs] = extra.split('~');
    }
    cur.words.push(w);
    words.push(w);
  });

  function regularPast(v) {
    if (v.includes(' ')) { const [a, ...b] = v.split(' '); return [regularPast(a), ...b].join(' '); }
    if (/e$/.test(v)) return v + 'd';
    if (/[^aeiou]y$/.test(v)) return v.slice(0, -1) + 'ied';
    if (DOUBLE.has(v)) return v + v.slice(-1) + 'ed';
    return v + 'ed';
  }
  function ingForm(v) {
    if (v.includes(' ')) { const [a, ...b] = v.split(' '); return [ingForm(a), ...b].join(' '); }
    if (v === 'be') return 'being';
    if (v === 'lie') return 'lying';
    if (/ie$/.test(v)) return v.slice(0, -2) + 'ying';
    if (/[^e]e$/.test(v) && v !== 'see' && v !== 'free') return v.slice(0, -1) + 'ing';
    if (DOUBLE.has(v)) return v + v.slice(-1) + 'ing';
    return v + 'ing';
  }
  function thirdPerson(v) {
    if (v.includes(' ')) { const [a, ...b] = v.split(' '); return [thirdPerson(a), ...b].join(' '); }
    if (v === 'be') return 'is';
    if (v === 'have') return 'has';
    if (v === 'do' || v === 'go') return v + 'es';
    if (/(s|sh|ch|x|z|o)$/.test(v)) return v + 'es';
    if (/[^aeiou]y$/.test(v)) return v.slice(0, -1) + 'ies';
    return v + 's';
  }

  return { themes, words, byId: Object.fromEntries(words.map(w => [w.id, w])) };
})();
