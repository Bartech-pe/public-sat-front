export class ForwardCenterMail {
  mailAttentionId: number;
  from: string;

  constructor(data: Partial<ForwardCenterMail> = {}) {
    this.mailAttentionId = data.mailAttentionId ?? 0;
    this.from = data.from ?? '';
  }
}