export interface ChannelCount {
  total: number;         // Total de atenciones creadas hoy
  complete: number;      // Atenciones cerradas
  inComplete: number;    // Atenciones en progreso
  inQueque: number;      // En espera de verificación o en cola
  botCount?: any;      // Atendidas por bot
  agentCount?: any;    // Atendidas por agente
}