export const pauseCodeAgent = [
  { code: 'LUNCH', name: 'Almuerzo' },
  { code: 'MEET', name: 'Reunión' },
  { code: 'TRAIN', name: 'Capacitación' },
  { code: 'TECH', name: 'Problema técnico' },
  { code: 'ADMIN', name: 'Tarea administrativa' },
  { code: 'WRAPUP', name: 'Tiempo de post-llamada' },
];

export enum VicidialPauseCode {
  LOGIN = 'LOGIN', // Almuerzo
  LUNCH = 'LUNCH', // Almuerzo
  BREAK = 'BREAK', // Descanso corto
  MEET = 'MEET', // Reunión
  TRAIN = 'TRAIN', // Capacitación
  PERSN = 'PERSN', // Asunto personal
  TECH = 'TECH', // Problema técnico
  WRAP = 'WRAP', // Tiempo de post-llamada
  WRAPUP = 'WRAPUP', // Tiempo pausa de post-llamada
  ADMIN = 'ADMIN', // Tareas administrativas
  COACH = 'COACH', // Escucha o coaching
  QA = 'QA', // Control de calidad
}

export enum ChannelPhoneState {
  READY = 1,
  QUEUE = 19,
  INCALL = 17,
  PAUSED = 18,
  CLOSER = 15,
  OFFLINE = 16,
}
