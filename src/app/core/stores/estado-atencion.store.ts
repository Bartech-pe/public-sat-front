import { createEntityStore } from './createEntityStore';
import { EstadoAtencion } from '@models/estado-atencion.model';
import { EstadoAtencionService } from '@services/estado-atencion.service';

export const EstadoAtencionStore = createEntityStore<EstadoAtencion>({
  serviceToken: EstadoAtencionService,
  entityName: 'EstadoAtencion',
});
