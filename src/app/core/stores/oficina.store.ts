import { Oficina } from '@models/oficina.model';
import { createEntityStore } from './createEntityStore';
import { OficinaService } from '@services/oficina.service';

export const OficinaStore = createEntityStore<Oficina>({
  serviceToken: OficinaService,
  entityName: 'Oficina',
});
