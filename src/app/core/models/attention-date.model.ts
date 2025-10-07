export interface AttentionDate {
  date: string;           // fecha formateada (ej. "04 Oct")
  recieved: number;       // total combinado de correos recibidos
  recievedToday: number;  // correos recibidos en la fecha indicada
  recievedNext: number;   // correos recibidos al día siguiente
}