
import { Cartera } from '@models/cartera.model';
import { createEntityStore } from './createEntityStore';
import { CarteraService } from '@services/cartera.service';

export const CarteraStore = createEntityStore<Cartera>({
    serviceToken: CarteraService,
    entityName: 'Cartera',
});
