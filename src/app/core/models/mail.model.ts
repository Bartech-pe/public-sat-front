import { AssistanceState } from './assistance-state.model';
import { User } from './user.model';

export interface MailDto {
  id: number;
  from?: string;
  to?: string;
  subject?: string;
  content?: string;
  body?: string;
  date?: string;
  state?: AssistanceState;
  advisor?: User;
  replies?: {
    id: number;
    from: string;
    body?: string;
    content?: string;
    date?: string;
  }[];
  attachments: any[];

  selected?: boolean;
}
