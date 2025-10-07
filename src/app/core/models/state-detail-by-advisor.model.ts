export interface StateDetailsByAdvisor {
  user: string;               // nombre de usuario vicidial
  fecha: string;              // fecha en formato YYYY-MM-DD
  tiempo_pausa: string;       // tiempo total en pausa
  tiempo_espera: string;      // tiempo total en espera
  tiempo_llamadas: string;    // tiempo total en llamadas
  tiempo_dispo: string;       // tiempo total en dispo
  tiempo_unknown: string;     // tiempo desconocido o no categorizado
  tiempo_total: string;       // suma total de los tiempos
}
