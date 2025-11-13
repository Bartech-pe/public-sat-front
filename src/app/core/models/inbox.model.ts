import { Channel } from './channel.model';
import { User } from './user.model';

export interface InboxCredential {
  businessId?: string;
  phoneNumber?: string;
  phoneNumberId?: string;
  accessToken?: string;
  expiresAt?: Date;
}

export interface Inbox extends InboxCredential {
  id: number;
  name: string;
  idChannel?: number;
  channel?: Channel;
  avatarUrl?: string;
  widgetColor?: string;
  status?: boolean;
  checked?: boolean;
  users?: User[];
}

export interface InboxUser {
  name?: string;
  email?: string;
  avatarUrl?: string;
  idInbox: number;
  idUser: number;
  inbox?: Inbox;
}
