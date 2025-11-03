import { AssistanceState } from './assistance-state.model';
import { User } from './user.model';

export interface MailDto {
  id: number;
  from?: string;
  name?: string;
  to?: string;
  toName?: string;
  subject?: string;
  content?: string;
  body?: string;
  date?: string;
  state?: AssistanceState;
  advisor?: User;
  isRead: boolean;
  isSender?: boolean;
  mailAttentionId?: number;
  attachments: any[];

  selected?: boolean;
}
