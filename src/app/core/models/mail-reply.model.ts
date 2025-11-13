export class ReplyCenterMail {
  mailAttentionId: number;
  content: string;

  constructor(data: Partial<ReplyCenterMail> = {}) {
    this.mailAttentionId = data.mailAttentionId ?? 0;
    this.content = data.content ?? '';
  }
}