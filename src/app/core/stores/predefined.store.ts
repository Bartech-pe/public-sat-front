
import { createEntityStore } from './generic/createEntityStore';
import { PredefinedResponsesService } from '@services/predefined.service';
import { PredefinedResponses } from '@models/predefined-response.model';

export const PredefinedResponsesStore = createEntityStore<PredefinedResponses>({
  serviceToken: PredefinedResponsesService,
  entityName: 'PredefinedResponses',
});
