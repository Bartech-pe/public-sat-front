export enum ReminderStatus {
  SUCCESS = 'success',
  WARNING = 'warning',
  INFO = 'info',
  DANGER = 'danger',
}

export interface Reminder {
  id: number;
  name: string;
  description?: string;
  userId?: number;
  reminderAt?: Date;
  status?: boolean;
  severity?: ReminderStatus;
  date?: string;
  hour?: string;
}

export interface CreateReminderDto {
  name: string;
  description?: string;
  reminderAt: Date;
}
