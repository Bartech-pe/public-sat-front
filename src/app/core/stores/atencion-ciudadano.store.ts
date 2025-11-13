import { AtencionCiudadanoService } from '@services/atencion-ciudadano.service';
import { createEntityStore } from './createEntityStore';
import { AtencionCiudadano } from '@models/atencion-ciudadano.model';

export const AtencionCiudadanoStore = createEntityStore<AtencionCiudadano>({
  serviceToken: AtencionCiudadanoService,
  entityName: 'AtencionCiudadano',
});
