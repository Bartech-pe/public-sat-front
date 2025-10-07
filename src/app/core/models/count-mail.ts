export interface MailCount {
  attendedCount: number;       // Correos atendidos hoy (stateId = 5)
  notAttendedToday: number;    // Correos no atendidos hoy
  notAttendedYesterday: number;// Correos no atendidos ayer
  recievedCount: number;       // Total de correos recibidos hoy
}