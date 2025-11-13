import { Area } from '@models/area.model';
import { createEntityStore } from './createEntityStore';
import { AreaService } from '@services/area.service';

export const AreaStore = createEntityStore<Area>({
  serviceToken: AreaService,
  entityName: 'Area',
});
