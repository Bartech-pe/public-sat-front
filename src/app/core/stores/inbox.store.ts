import { createEntityStore } from './generic/createEntityStore';
import { Inbox } from '@models/inbox.model';
import { InboxService } from '@services/inbox.service';

export const InboxStore = createEntityStore<Inbox>({
  serviceToken: InboxService,
  entityName: 'Inbox',
});
