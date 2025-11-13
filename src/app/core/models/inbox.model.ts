import { VicidialCredentials } from '@features/main/settings/channels/inbox-form/inbox-form.component';
import { Channel } from './channel.model';
import { User } from './user.model';

export interface InboxCredential extends VicidialCredentials {
  businessId?: string;
  phoneNumber?: string;
  phoneNumberId?: string;
  accessToken?: string;
  expiresAt?: Date;
}

export interface Inbox extends InboxCredential {
  id: number;
  name: string;
  channelId?: number;
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
  inboxId: number;
  userId: number;
  inbox?: Inbox;
}
