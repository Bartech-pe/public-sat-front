import { createEntityStore } from './createEntityStore';
import { EstadoTelefonico } from '@models/estado-telefonico.model';
import { EstadoAtencionService } from '@services/estado-atencion.service';
import { EstadoTelefonicoService } from '@services/estado-telefonico.service';

export const EstadoTelefonicoStore = createEntityStore<EstadoTelefonico>({
  serviceToken: EstadoTelefonicoService,
  entityName: 'EstadoTelefonico',
});
