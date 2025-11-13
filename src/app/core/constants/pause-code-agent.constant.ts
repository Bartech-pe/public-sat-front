export const pauseCodeAgent = [
  { code: 'LUNCH', name: 'Almuerzo' },
  { code: 'MEET', name: 'Reunión' },
  { code: 'TRAIN', name: 'Capacitación' },
  { code: 'TECH', name: 'Problema técnico' },
  { code: 'ADMIN', name: 'Tarea administrativa' },
];

export enum VicidialPauseCode {
  LOGIN = 'LOGIN', // Almuerzo
  LUNCH = 'LUNCH', // Almuerzo
  BREAK = 'BREAK', // Descanso corto
  MEET = 'MEET', // Reunión
  TRAIN = 'TRAIN', // Capacitación
  PERSN = 'PERSN', // Asunto personal
  TECH = 'TECH', // Problema técnico
  WRAP = 'WRAP', // Tiempo de post-llamada / wrap-up
  ADMIN = 'ADMIN', // Tareas administrativas
  COACH = 'COACH', // Escucha o coaching
  QA = 'QA', // Control de calidad
}
