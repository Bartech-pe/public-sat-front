// mail.model.ts
import { ReplyCenterMail } from "./mail-reply.model";

export class Mail {
  id: number;
  from: string;              
  to?: string;              
  subject: string;           
  body: string;              
  date: Date | null;        
  status?: 'open' | 'close' | 'unassigned'; 
  replies?: ReplyCenterMail[]; 
  advisor?: string;          
  createdBy?: number;
  updatedBy?: number;
  deletedBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;

  constructor(data: Partial<Mail> = {}) {
    this.id = data.id ?? 0;
    this.from = data.from ?? '';
    this.to = data.to ?? '';
    this.subject = data.subject ?? '';
    this.body = data.body ?? '';
    this.date = data.date ? new Date(data.date) : null;
    this.status = data.status;
    this.replies = data.replies?.map(r => new ReplyCenterMail(r));
    this.advisor = data.advisor ?? '';
    this.createdBy = data.createdBy;
    this.updatedBy = data.updatedBy;
    this.deletedBy = data.deletedBy;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : undefined;
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : undefined;
    this.deletedAt = data.deletedAt ? new Date(data.deletedAt) : undefined;
  }

  /**
   * Mapeo la entidad MailAttention del backend a este modelo frontend
   */
  static fromBackend(dto: any): Mail {
    return new Mail({
      id: dto.id,
      from: dto.emailCitizen,
      to: dto.advisorUserId?.toString() ?? '',      
      subject: dto.ticketCode,
      body: dto.threadGmailId,
      date: dto.createdAt ? new Date(dto.createdAt) : null,
      status: dto.stateId === 1 ? 'open' : 'close', 
      advisor: dto.advisorUserId?.toString() ?? '',
      createdBy: dto.createdBy,
      updatedBy: dto.updatedBy,
      deletedBy: dto.deletedBy,
      createdAt: dto.createdAt ? new Date(dto.createdAt) : undefined,
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : undefined,
      deletedAt: dto.deletedAt ? new Date(dto.deletedAt) : undefined,
      replies: dto.replies?.map((r: any) => new ReplyCenterMail(r)),
    });
  }
}
