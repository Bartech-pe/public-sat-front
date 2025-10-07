
import { Portfolio } from '@models/portfolio.model';
import { createEntityStore } from './generic/createEntityStore';
import { PortfolioService } from '@services/portfolio.service';

export const PortfolioStore = createEntityStore<Portfolio>({
    serviceToken: PortfolioService,
    entityName: 'Portfolio',
});
