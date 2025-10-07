import { MensajeAutomatico } from '@models/mensaje-automatico.model';
import { createEntityStore } from './generic/createEntityStore';
import { MensajeAutomaticoService } from '@services/mensaje-automatico.service';

export const MensajeAutomaticoStore = createEntityStore<MensajeAutomatico>({
  serviceToken: MensajeAutomaticoService,
  entityName: 'MensajeAutomatico',
});
