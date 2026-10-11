// Datos de ejemplo para el modo demostración. Personas ficticias.
import type { Estado } from './store';
import type { Perfil, Post } from './types';
import marca from './marca.json';

const h = (horas: number) => new Date(Date.now() - horas * 36e5).toISOString();
// Día local (AAAA-MM-DD) de hace n días
const dia = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

// Imágenes 3D propias de Lunaure (renderizadas para la app)
const img = {
  atardecer: require('../../assets/lux/atardecer.jpg'),
  ciudad: require('../../assets/lux/ciudad.jpg'),
  cafe: require('../../assets/lux/cafe.jpg'),
  meme: require('../../assets/lux/meme.jpg'),
  perfume: require('../../assets/lux/perfume.jpg'),
  portada: require('../../assets/lux/portada.jpg'),
};

const perfiles: Perfil[] = [
  { id: 'u_oficial', usuario: marca.nombre.toLowerCase(), nombre: marca.nombre, bio: `Cuenta oficial. ${marca.eslogan}.`, avatarColor: 'oro', privado: false, verificado: true, creado: h(2000) },
  { id: 'u_lucia', usuario: 'luciamartin', nombre: 'Lucía Martín', bio: 'Periodista. Café, fútbol y opiniones sin filtro.', avatarColor: 'perla', privado: false, creado: h(900) },
  { id: 'u_dani', usuario: 'dani_memes', nombre: 'Dani', bio: 'Hago memes para no llorar.', avatarColor: 'zafiro', privado: false, creado: h(800) },
  { id: 'u_sofia', usuario: 'sofi_viaja', nombre: 'Sofía R.', bio: 'Fotos de sitios a los que deberías ir.', avatarColor: 'orosa', privado: false, creado: h(700) },
  { id: 'u_marcos', usuario: 'marcosdev', nombre: 'Marcos', bio: 'Programo apps. A veces funcionan.', avatarColor: 'esmeralda', privado: false, creado: h(600) },
  { id: 'u_ana', usuario: 'anacocina', nombre: 'Ana García', bio: 'Recetas de abuela con trucos nuevos.', avatarColor: 'amatista', privado: false, creado: h(500) },
];

const posts: Post[] = [
  { id: 'p1', autor: 'u_oficial', tipo: 'foto', creado: h(0.4),
    texto: `Bienvenidos a ${marca.nombre}. ${marca.eslogan}: preséntate con #holamundo y trae a quien quieras, por ejemplo @luciamartin.`,
    medios: [{ uri: img.portada, tipo: 'imagen', alt: 'Media luna de oro sobre mármol negro, imagen de bienvenida de Lunaure' }] },
  { id: 'p2', autor: 'u_sofia', tipo: 'foto', creado: h(1.2),
    texto: 'No hay filtro que mejore esto. Atardecer dorado en la costa. #viajes #atardecer',
    medios: [{ uri: img.atardecer, tipo: 'imagen', alt: 'Atardecer naranja y violeta sobre el mar en calma, con un acantilado en sombra' }] },
  { id: 'p3', autor: 'u_dani', tipo: 'meme', creado: h(2),
    texto: 'Todos los lunes igual #memes #duelolunes',
    medios: [{ uri: img.meme, tipo: 'imagen', alt: 'Carita dorada sorprendida rodeada de estrellas', memeArriba: 'YO: ME ACUESTO PRONTO', memeAbajo: 'TAMBIÉN YO A LAS 3:00' }] },
  { id: 'p4', autor: 'u_lucia', tipo: 'texto', medios: [], creado: h(3),
    texto: '¿Penalti o no penalti? Abro tertulia. Yo digo que no. #futbol' },
  { id: 'p5', autor: 'u_marcos', tipo: 'foto', creado: h(5),
    texto: 'Programando de noche con estas vistas. ¿Alguien más en el grupo de #programacion? @dani_memes no vale',
    medios: [{ uri: img.ciudad, tipo: 'imagen', alt: 'Rascacielos iluminados de noche reflejados en el agua, con la luna llena' }] },
  { id: 'p6', autor: 'u_ana', tipo: 'foto', creado: h(7),
    texto: 'El café de sobremesa es sagrado, y en porcelana sabe mejor. Mañana subo receta de bizcocho. #cocina #cafe',
    medios: [{ uri: img.cafe, tipo: 'imagen', alt: 'Taza de porcelana con filo dorado y café con arte latte sobre mármol blanco' }] },
  { id: 'p7', autor: 'u_dani', tipo: 'texto', medios: [], creado: h(2.5), respuestaA: 'p4',
    texto: '@luciamartin penaltito clarísimo, no me hagas esto' },
  { id: 'p16', autor: 'u_sofia', tipo: 'foto', creado: h(8),
    texto: 'Regalo de cumpleaños que huele a vacaciones. ¿Os gustan los perfumes dulces o frescos? #lujo #regalos',
    medios: [{ uri: img.perfume, tipo: 'imagen', alt: 'Frasco de perfume de cristal con tapón de oro sobre mármol negro' }] },
  { id: 'p8', autor: 'u_lucia', tipo: 'texto', medios: [], creado: h(9),
    texto: 'Lo mejor de una red nueva: todavía nadie grita. Disfrutemos. #holamundo' },
  { id: 'p9', autor: 'u_marcos', tipo: 'texto', medios: [], creado: h(4), grupoId: 'g_prog',
    texto: 'Primera duda del grupo: ¿Expo o nativo puro para una app nueva? Yo voy con Expo.' },
  // Duelo de memes de la semana (#duelolunes)
  { id: 'p11', autor: 'u_marcos', tipo: 'meme', creado: h(8), texto: 'Mi aportación al #duelolunes',
    medios: [{ uri: img.ciudad, tipo: 'imagen', alt: 'Ciudad de noche', memeArriba: 'EL LUNES A LAS 8:00', memeAbajo: 'MI CEREBRO: CARGANDO...' }] },
  { id: 'p12', autor: 'u_ana', tipo: 'meme', creado: h(10), texto: 'Sin café no hay lunes #duelolunes',
    medios: [{ uri: img.cafe, tipo: 'imagen', alt: 'Taza de café', memeArriba: 'YO EL LUNES', memeAbajo: 'CAFÉ NÚMERO 4' }] },
  { id: 'p13', autor: 'u_sofia', tipo: 'meme', creado: h(12), texto: 'Cuando acaba el finde #duelolunes',
    medios: [{ uri: img.atardecer, tipo: 'imagen', alt: 'Atardecer', memeArriba: 'DOMINGO 23:59', memeAbajo: 'ADIÓS LIBERTAD' }] },
  // Cápsulas del tiempo: una sellada y otra ya abierta
  { id: 'p14', autor: 'u_ana', tipo: 'texto', medios: [], creado: h(30), abreEl: new Date(Date.now() + 20 * 864e5).toISOString(),
    texto: 'Predicción: el equipo que gane la Liga este año será el que menos goles encaje. Abriré esta cápsula al final de la temporada. #capsula' },
  { id: 'p15', autor: 'u_marcos', tipo: 'texto', medios: [], creado: h(24 * 40), abreEl: h(20),
    texto: 'Cápsula del tiempo: dentro de un mes la mitad de mis amigos programadores usarán IA para todo. #capsula' },
  { id: 'p10', autor: 'u_ana', tipo: 'texto', medios: [], creado: h(6), grupoId: 'g_cocina',
    texto: 'Bienvenidos al grupo. Regla única: si subes receta, pon cantidades.' },
];

export function semilla(): Estado {
  return {
    perfiles: Object.fromEntries(perfiles.map((p) => [p.id, p])),
    posts,
    grupos: [
      { id: 'g_prog', nombre: 'Programación en español', descripcion: 'Dudas, proyectos y memes de programadores.', privado: false, creador: 'u_marcos', creado: h(300) },
      { id: 'g_cocina', nombre: 'Recetas de casa', descripcion: 'Cocina de toda la vida, paso a paso.', privado: false, creador: 'u_ana', creado: h(200) },
      { id: 'g_futbol', nombre: 'Tertulia futbolera', descripcion: 'Aquí se discute de fútbol con respeto (más o menos).', privado: false, creador: 'u_lucia', creado: h(100) },
    ],
    miembros: [
      { grupoId: 'g_prog', userId: 'u_marcos', rol: 'admin' },
      { grupoId: 'g_prog', userId: 'u_dani', rol: 'miembro' },
      { grupoId: 'g_cocina', userId: 'u_ana', rol: 'admin' },
      { grupoId: 'g_futbol', userId: 'u_lucia', rol: 'admin' },
      { grupoId: 'g_futbol', userId: 'u_dani', rol: 'miembro' },
    ],
    seguidores: [
      { seguidor: 'u_lucia', seguido: 'u_dani' }, { seguidor: 'u_dani', seguido: 'u_lucia' },
      { seguidor: 'u_sofia', seguido: 'u_lucia' }, { seguidor: 'u_marcos', seguido: 'u_dani' },
    ],
    likes: [
      { userId: 'u_lucia', postId: 'p3' }, { userId: 'u_marcos', postId: 'p3' }, { userId: 'u_ana', postId: 'p3' },
      { userId: 'u_dani', postId: 'p2' }, { userId: 'u_lucia', postId: 'p2' }, { userId: 'u_dani', postId: 'p4' },
    ],
    compartidos: [{ userId: 'u_lucia', postId: 'p3', creado: h(1.5) }],
    guardados: [],
    bloqueos: [],
    silenciados: [],
    notificaciones: {},
    denuncias: [],
    apelaciones: [],
    sesion: null,
    // Datos privados inventados de las cuentas de ejemplo (se guardan aparte del perfil público)
    privado: {
      datos: Object.fromEntries(perfiles.map((p, i) => [p.id, {
        userId: p.id, email: `${p.usuario}@example.com`, pais: 'ES',
        fechaNacimiento: `${1985 + i * 3}-0${(i % 9) + 1}-1${i}`,
      }])),
      consentimientos: Object.fromEntries(perfiles.map((p) => [p.id, [
        { tipo: 'terminos', versionDoc: '0.1', aceptado: true, fecha: p.creado },
        { tipo: 'privacidad', versionDoc: '0.1', aceptado: true, fecha: p.creado },
        { tipo: 'analitica', versionDoc: '0.1', aceptado: p.id.length % 2 === 0, fecha: p.creado },
      ]])),
    },
    cookies: { decidido: false, analitica: false },
    debates: [
      { id: 'd1', tema: '¿Penalti o no penalti en el último minuto?', retador: 'u_lucia', rival: 'u_dani', creado: h(6), finVotacion: h(-18),
        turnos: [
          { autor: 'u_lucia', texto: 'No es penalti: el defensa tiene el brazo pegado al cuerpo y el balón le viene rebotado.', creado: h(5.8) },
          { autor: 'u_dani', texto: 'El brazo amplía el volumen del cuerpo. Reglamento en mano, es penalti.', creado: h(5.5) },
          { autor: 'u_lucia', texto: 'Si castigamos cada rebote, cada partido tendrá cinco penaltis. El espíritu de la norma es otro.', creado: h(5.2) },
          { autor: 'u_dani', texto: 'El espíritu no se pita. Se pita lo que dice la norma, y la norma es clara.', creado: h(5) },
          { autor: 'u_lucia', texto: 'Hasta el VAR tardó tres minutos. Si hay duda, no hay penalti.', creado: h(4.8) },
          { autor: 'u_dani', texto: 'Tardó porque buscaba el ángulo bueno, y cuando lo encontró, lo pitó.', creado: h(4.5) },
        ],
        votos: [{ userId: 'u_sofia', por: 'u_lucia' }, { userId: 'u_marcos', por: 'u_dani' }, { userId: 'u_ana', por: 'u_lucia' }] },
      { id: 'd2', tema: 'Tortilla de patatas: ¿con cebolla o sin cebolla?', retador: 'u_ana', rival: 'u_marcos', creado: h(72), finVotacion: h(40),
        turnos: [
          { autor: 'u_ana', texto: 'Con cebolla. Le da jugosidad y dulzor. Sin cebolla es un huevo frito con patatas.', creado: h(71) },
          { autor: 'u_marcos', texto: 'Sin cebolla: la patata es la protagonista y no hay que esconderla.', creado: h(70) },
          { autor: 'u_ana', texto: 'La cebolla no esconde nada, acompaña. Pregunta a cualquier abuela.', creado: h(69) },
          { autor: 'u_marcos', texto: 'Mi abuela la hace sin cebolla y está buenísima. Argumento derribado.', creado: h(68) },
          { autor: 'u_ana', texto: 'Excepción que confirma la regla. Con cebolla gana 7 de cada 10 cocinas.', creado: h(67) },
          { autor: 'u_marcos', texto: 'La mayoría no siempre tiene razón. Sin cebolla y punto.', creado: h(66) },
        ],
        votos: [{ userId: 'u_lucia', por: 'u_ana' }, { userId: 'u_dani', por: 'u_ana' }, { userId: 'u_sofia', por: 'u_marcos' }] },
      { id: 'd3', tema: '¿Es mejor viajar solo o acompañado?', retador: 'u_sofia', rival: null, creado: h(2), turnos: [], votos: [] },
    ],
    duelo: {
      tema: 'Los lunes', hashtag: 'duelolunes', fin: new Date(Date.now() + 3 * 864e5).toISOString(),
      votos: [
        { userId: 'u_lucia', ganador: 'p3', perdedor: 'p12' }, { userId: 'u_marcos', ganador: 'p3', perdedor: 'p13' },
        { userId: 'u_ana', ganador: 'p11', perdedor: 'p13' }, { userId: 'u_sofia', ganador: 'p12', perdedor: 'p11' },
      ],
      campeonAnterior: { userId: 'u_dani', tema: 'Los exámenes' },
    },
    // Días activos: Lucía lleva 11 días seguidos (hoy aún no), Dani tiene la racha congelada
    diasActivos: {
      u_lucia: Array.from({ length: 11 }, (_, i) => dia(i + 1)),
      u_dani: Array.from({ length: 6 }, (_, i) => dia(i + 2)),
      u_ana: Array.from({ length: 30 }, (_, i) => dia(i)),
      u_marcos: [dia(0), dia(1), dia(2)],
    },
    predicciones: [
      { id: 'pr1', pregunta: '¿Quién gana el clásico del domingo?', opciones: ['Real Madrid', 'Empate', 'Barça'], cierre: h(-72), creado: h(20),
        apuestas: [{ userId: 'u_dani', opcion: 2, puntos: 200 }, { userId: 'u_marcos', opcion: 0, puntos: 100 }, { userId: 'u_ana', opcion: 1, puntos: 50 }] },
      { id: 'pr2', pregunta: '¿Quién gana el próximo Benidorm Fest?', opciones: ['Una solista', 'Un grupo', 'Un solista'], cierre: h(-24 * 9), creado: h(30),
        apuestas: [{ userId: 'u_sofia', opcion: 0, puntos: 150 }, { userId: 'u_ana', opcion: 1, puntos: 100 }] },
      { id: 'pr3', pregunta: '¿Lloverá en Madrid el próximo sábado?', opciones: ['Sí', 'No'], cierre: h(30), resultado: 1, creado: h(24 * 8),
        apuestas: [{ userId: 'u_lucia', opcion: 1, puntos: 100 }, { userId: 'u_dani', opcion: 0, puntos: 150 }, { userId: 'u_sofia', opcion: 1, puntos: 50 }] },
    ],
    capsulaVotos: [
      { postId: 'p15', userId: 'u_dani', acierto: true }, { postId: 'p15', userId: 'u_lucia', acierto: true }, { postId: 'p15', userId: 'u_ana', acierto: false },
    ],
    chats: [],
    seguridad: {},
    asistente: {},
  };
}
