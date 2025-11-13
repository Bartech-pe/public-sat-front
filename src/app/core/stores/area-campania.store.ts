
import { createEntityStore } from './createEntityStore';
import { CarteraService } from '@services/cartera.service';
import { AreaCampania } from '@models/area-campania.model';
import { AreaCampaniaService } from '@services/area-campania.service';

export const AreaCampaniaStore = createEntityStore<AreaCampania>({
    serviceToken: AreaCampaniaService,
    entityName: 'AreaCampania',
});
