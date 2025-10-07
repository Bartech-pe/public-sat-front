import { createEntityStore } from './generic/createEntityStore';
import { ConsultType } from '@models/consult-type.modal';
import { ConsultTypeService } from '@services/consult-type.service';

export const ConsultTypeStore = createEntityStore<ConsultType>({
  serviceToken: ConsultTypeService,
  entityName: 'ConsultType',
});
