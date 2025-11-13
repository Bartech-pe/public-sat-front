import { createEntityStore } from './createEntityStore';
import { EstadoCampania } from '@models/estado-campania.model';
import { EstadoCampaniaService } from '@services/estado-campania.service';

export const EstadoCampaniaStore = createEntityStore<EstadoCampania>({
  serviceToken: EstadoCampaniaService,
  entityName: 'EstadoCampania',
});
