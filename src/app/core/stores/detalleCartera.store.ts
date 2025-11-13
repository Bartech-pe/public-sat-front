import { createEntityStore } from './createEntityStore';
import { DetalleCartera } from '@models/detalleCartera.model';
import { CarteraDetalleService } from '@services/detalleCartera.service';

export const DetalleCarteraStore = createEntityStore<DetalleCartera>({
    serviceToken: CarteraDetalleService,
    entityName: 'DetalleCartera',
});
