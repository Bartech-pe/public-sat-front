export interface EmailCampaignAttachments {
  id?: number; // id archivos
  filename: string; // nombre del archivo
  mimeType: number; // código de tipo (ej. PDF = 8)
  order: number; // orden en que se adjunta
  publicUrl: string; // url del contenido
}

export interface EmailCampaignDetail {
  id?: number; // id campaña
  emailCampaignId?: number;
  processCode: number; // código de proceso
  senderCode: number; // código del remitente
  to: string; // destinatario principal
  cc?: string; // con copia
  bcc?: string; // con copia oculta
  subject: string; // asunto del correo
  message: string; // cuerpo HTML del correo
  documentTypeCode: number; // código del tipo de documento
  documentTypeValue: string; // valor del tipo de documento (ej. "Factura")
  terminalName: string; // nombre de la terminal de envío
  attachments?: EmailCampaignAttachments[]; // lista de adjuntos
}

export interface EmailCampaign {
  id?: number; // id archivos
  name: string; // nombre del archivo
  templateId: number; // código de tipo (ej. PDF = 8)
  campaignStatus: number; // orden en que se adjunta
  totalRegistered: number; // contenido en base64
}
