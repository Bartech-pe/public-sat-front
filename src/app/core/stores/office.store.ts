import { Office } from '@models/office.model';
import { createEntityStore } from './generic/createEntityStore';
import { OfficeService } from '@services/office.service';

export const OfficeStore = createEntityStore<Office>({
  serviceToken: OfficeService,
  entityName: 'Office',
});
