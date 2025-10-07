export interface AttachmentsEmail {
      id?:number,              // id archivos
      fileName: string;        // nombre del archivo
      fileTypeCode: number;    // código de tipo (ej. PDF = 8)
      order: number;           // orden en que se adjunta
      base64: string;          // contenido en base64
}

export interface CampaignEmail {
      id?:number,                       // id campaña
      idCampaignEmailConfig?:number,
      processCode: number;              // código de proceso
      senderCode: number;               // código del remitente
      to: string;                       // destinatario principal
      cc?: string;                      // con copia
      bcc?: string;                     // con copia oculta
      subject: string;                  // asunto del correo
      message: string;                  // cuerpo HTML del correo
      documentTypeCode: number;         // código del tipo de documento
      documentTypeValue: string;        // valor del tipo de documento (ej. "Factura")
      terminalName: string;             // nombre de la terminal de envío
      attachments?: AttachmentsEmail[]; // lista de adjuntos
}

export interface CampaignEmailConfig {
      id?:number,              // id archivos
      name: string;        // nombre del archivo
      idTemplate: number;    // código de tipo (ej. PDF = 8)
      campaignStatus: number;           // orden en que se adjunta
      totalRegistration: number;          // contenido en base64
}