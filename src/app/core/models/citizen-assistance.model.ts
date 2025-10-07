import { User } from './user.model';

export interface CitizenAssistance {
  id?: number;
  method?: string;
  type?: string;
  channel?: string;
  contact?: string;
  result?: string;
  observation?: string;
  portfolioDetailId?: number;
  tipDoc?: string;
  docIde?: string;
  createdBy?: User;
  status?: boolean;
  verifyPayment?: boolean;
}
