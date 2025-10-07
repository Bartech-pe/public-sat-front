import { createEntityStore } from './generic/createEntityStore';
import { PortfolioDetail } from '@models/portfolio-detail.model';
import { PortfolioDetailService } from '@services/portfolio-detail.service';

export const PortfolioDetailStore = createEntityStore<PortfolioDetail>({
    serviceToken: PortfolioDetailService,
    entityName: 'PortfolioDetail',
});
