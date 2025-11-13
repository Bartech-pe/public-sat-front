
import { createEntityStore } from './createEntityStore';
import { CarteraService } from '@services/cartera.service';
import { TipoCampania } from '@models/tipo-campania.model';
import { TipoCampaniaService } from '@services/tipo-campania.service';

export const TipoCampaniaStore = createEntityStore<TipoCampania>({
    serviceToken:  TipoCampaniaService,
    entityName: 'TipoCampania',
});
