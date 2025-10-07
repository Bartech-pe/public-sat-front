export class CenterEmail {
  to: string[];
  subject: string;
  content: string;
  mailAttentionId?: number;

  constructor(data: Partial<CenterEmail> = {}) {
    this.to = data.to ?? [];
    this.subject = data.subject ?? '';
    this.content = data.content ?? '';
    this.mailAttentionId = data.mailAttentionId;
  }
}