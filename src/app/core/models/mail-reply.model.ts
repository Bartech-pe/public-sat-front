export interface Reply {
  id: number;
  from: string;
  body: string;
  date: Date;
  type: 'CIUDADANO' | 'ASESOR' | 'RESPUESTA_INTERNA' | 'REENVIO_INTERNO';
  replyTarget?: 'CIUDADANO' | 'Interno';
  attachments?: {
    name: string;
    size: number;
    url: string;
  }[];
}