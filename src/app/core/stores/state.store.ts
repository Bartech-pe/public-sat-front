import { State } from '@models/state.model';
import { createEntityStore } from './generic/createEntityStore';
import { StateService } from '@services/state.service';

export const StateStore = createEntityStore<State>({
  serviceToken: StateService,
  entityName: 'State',
});
