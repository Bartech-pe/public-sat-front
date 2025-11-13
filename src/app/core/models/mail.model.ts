export class MailFilter {
  advisorEmailId?: number;
  stateId?: number;
  from?: string;
  to?: string;
  contains?: string;
  notContains?: string;
  date?: Date;

  constructor(data: Partial<MailFilter> = {}) {
    this.advisorEmailId = data.advisorEmailId;
    this.stateId = data.stateId;
    this.from = data.from;
    this.to = data.to;
    this.contains = data.contains;
    this.notContains = data.notContains;
    this.date = data.date ? new Date(data.date) : undefined;
  }
}
