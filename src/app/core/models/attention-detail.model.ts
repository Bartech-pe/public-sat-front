export interface AttentionDetail {
  recievedCount: number;  // cantidad de correos atendidos
  chat: number;           // cantidad de chats manuales
  chatbot: number;        // cantidad de chats con bot
  alosat: number;         // cantidad de llamadas atendidas (Vicidial)
  count: number;          // total combinado de atenciones
}