// Datos públicos (lo que se ve en la red)
export type Perfil = {
  id: string;
  usuario: string;
  nombre: string;
  bio?: string;
  avatarColor: string;
  privado: boolean;
  verificado?: boolean;
  creado: string;
};

export type Medio = {
  uri: string | number | { uri: string }; // number/objeto = imagen incluida en la app
  tipo: 'imagen' | 'video';
  alt?: string;
  memeArriba?: string;
  memeAbajo?: string;
};

export type Post = {
  id: string;
  autor: string;
  texto: string;
  tipo: 'texto' | 'foto' | 'video' | 'meme';
  medios: Medio[];
  respuestaA?: string;
  grupoId?: string;
  oculto?: boolean;
  abreEl?: string; // Cápsula del tiempo: fecha en que se desvela el texto
  creado: string;
};

export type Grupo = {
  id: string;
  nombre: string;
  descripcion: string;
  privado: boolean;
  creador: string;
  creado: string;
};

export type Notificacion = {
  id: string;
  tipo: 'me_gusta' | 'respuesta' | 'mencion' | 'seguidor' | 'compartido' | 'grupo' | 'moderacion' | 'ring';
  debateId?: string;
  actor?: string;
  postId?: string;
  texto?: string;
  denunciaId?: string;
  leida: boolean;
  creado: string;
};

export type MotivoDenuncia =
  | 'odio' | 'acoso' | 'violencia' | 'sexual' | 'menores' | 'spam' | 'falso' | 'derechos_autor' | 'otro';

export type Denuncia = {
  id: string;
  denunciante: string;
  objetivo: { tipo: 'post' | 'perfil' | 'grupo'; id: string };
  motivo: MotivoDenuncia;
  detalle?: string;
  estado: 'pendiente' | 'revisada' | 'retirado' | 'desestimada';
  decisionMotivada?: string;
  creado: string;
};

// Datos personales: se guardan APARTE (esquema "privado" en la base de datos)
export type DatosPersonales = {
  userId: string;
  email: string;
  fechaNacimiento: string; // AAAA-MM-DD
  pais: string;
  borradoProgramado?: string;
};

export type Consentimiento = {
  tipo: 'terminos' | 'privacidad' | 'cookies' | 'analitica' | 'marketing';
  versionDoc: string;
  aceptado: boolean;
  fecha: string;
};

// ---------------------------------------------------------------- Funciones exclusivas
// El Ring: debate por rondas entre dos personas; el público vota quién gana
export type Debate = {
  id: string;
  tema: string;
  retador: string;
  rival: string | null; // null = reto abierto, cualquiera puede aceptarlo
  turnos: { autor: string; texto: string; creado: string }[];
  votos: { userId: string; por: string }[];
  finVotacion?: string;
  creado: string;
};

// Duelo de memes semanal: los memes con el hashtag del tema compiten por parejas
export type Duelo = {
  tema: string;
  hashtag: string;
  fin: string;
  votos: { userId: string; ganador: string; perdedor: string }[];
  campeonAnterior?: { userId: string; tema: string };
};

// Predicciones: se apuestan puntos sin valor económico (no se compran ni se canjean)
export type Prediccion = {
  id: string;
  pregunta: string;
  opciones: string[];
  cierre: string;
  resultado?: number;
  apuestas: { userId: string; opcion: number; puntos: number }[];
  creado: string;
};

// ---------------------------------------------------------------- Mensajes privados
export type Mensaje = {
  id: string;
  autor: string;
  texto?: string;
  rachi?: boolean; // envío de Rachi para mantener la racha del chat
  creado: string;
};

export type Chat = {
  id: string;
  tipo: 'directo' | 'grupo';
  nombre?: string; // solo grupos
  miembros: string[];
  mensajes: Mensaje[];
  creado: string;
};

// ---------------------------------------------------------------- Seguridad de la cuenta
export type Seguridad = {
  dosPasos: boolean;
  llaveAcceso: boolean;
  alertasInicio: boolean;
  sesiones: { id: string; dispositivo: string; lugar: string; ultima: string; actual?: boolean }[];
  actividad: { id: string; evento: string; fecha: string }[];
};
