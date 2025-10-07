import { CitizenAssistanceService } from '@services/citizen-assistance.service';
import { createEntityStore } from './generic/createEntityStore';
import { CitizenAssistance } from '@models/citizen-assistance.model';

export const CitizenAssistanceStore = createEntityStore<CitizenAssistance>({
  serviceToken: CitizenAssistanceService,
  entityName: 'CitizenAssistance',
});
