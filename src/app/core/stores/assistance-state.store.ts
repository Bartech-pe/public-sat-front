import { createEntityStore } from './generic/createEntityStore';
import { AssistanceState } from '@models/assistance-state.model';
import { AssistanceStateService } from '@services/assistance-state.service';

export const AssistanceStateStore = createEntityStore<AssistanceState>({
  serviceToken: AssistanceStateService,
  entityName: 'AssistanceState',
});
