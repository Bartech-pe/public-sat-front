
import { createEntityStore } from './createEntityStore';
import { CarteraService } from '@services/cartera.service';
import { Campania } from '@models/campania.model';
import { GestionCampaniaService } from '@services/gestionar-campania.service';

export const GestionCampaniaStore = createEntityStore<Campania>({
    serviceToken: GestionCampaniaService,
    entityName: 'Campania',
});
