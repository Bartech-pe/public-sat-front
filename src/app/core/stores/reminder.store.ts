
import { createEntityStore } from './generic/createEntityStore';

import { Reminder } from '@models/reminder.model';
import { ReminderService } from '@services/reminder.service';

export const ReminderStore = createEntityStore<Reminder>({
  serviceToken: ReminderService,
  entityName: 'Reminder',
});
