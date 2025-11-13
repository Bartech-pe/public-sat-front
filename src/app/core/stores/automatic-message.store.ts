import { AutomaticMessage } from '@models/automatic-message.model';
import { createEntityStore } from './generic/createEntityStore';
import { AutomaticMessageService } from '@services/automatic-message.service';

export const AutomaticMessageStore = createEntityStore<AutomaticMessage>({
  serviceToken: AutomaticMessageService,
  entityName: 'AutomaticMessage',
});
