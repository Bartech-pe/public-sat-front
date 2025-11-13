import { Status } from '@models/estados.model';
import { createEntityStore } from './createEntityStore';
import { StatusService } from '@services/status.service';

export const StatusStore = createEntityStore<Status>({
  serviceToken: StatusService,
  entityName: 'Status',
});
