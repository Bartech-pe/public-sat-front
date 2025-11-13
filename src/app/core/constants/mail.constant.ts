export type MailType =
  | 'inbox'
  | 'sent'
  | 'drafts'
  | 'noWish'
  | 'trash'
  | 'pendding'
  | 'open'
  | 'closed'
  | 'attention'
  | 'unassigned';

export enum MailEnum {
  INBOX = 'inbox',
  OPEN = 'open',
  SENT = 'sent',
  DRAFTS = 'drafts',
  SPAM = 'noWish',
  TRASH = 'trash',
  PENDDING = 'pendding',
  CLOSED = 'closed',
  ATTENTION = 'attention',
  UNASSIGNED = 'unassigned',
}

export enum MailStates {
  UNASSIGNED = 1,
  OPEN = 2,
  ATTENTION = 3,
  PENDDING = 4,
  SPAM = 5,
  CLOSED = 6,
}

export const mailEnumToState: Record<MailEnum, MailStates | null> = {
  [MailEnum.INBOX]: null, // INBOX no está en MailStates
  [MailEnum.OPEN]: MailStates.OPEN,
  [MailEnum.SENT]: null,
  [MailEnum.DRAFTS]: null,
  [MailEnum.SPAM]: MailStates.SPAM,
  [MailEnum.TRASH]: null,
  [MailEnum.PENDDING]: MailStates.PENDDING,
  [MailEnum.CLOSED]: MailStates.CLOSED,
  [MailEnum.ATTENTION]: MailStates.ATTENTION,
  [MailEnum.UNASSIGNED]: MailStates.UNASSIGNED,
};
