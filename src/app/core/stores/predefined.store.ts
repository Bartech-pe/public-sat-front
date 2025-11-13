
import { createEntityStore } from './createEntityStore';
import { PredefinedResponsesService } from '@services/predefined.service';
import { PredefinedResponses } from '@models/predefined.model';

export const PredefinedResponsesStore = createEntityStore<PredefinedResponses>({
  serviceToken: PredefinedResponsesService,
  entityName: 'PredefinedResponses',
});
