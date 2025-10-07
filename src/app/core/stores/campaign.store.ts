
import { Campaign } from '@models/campaign.model';
import { createEntityStore } from './generic/createEntityStore';
import { CampaignService } from '@services/campaign.service';

export const CampaignStore = createEntityStore<Campaign>({
    serviceToken: CampaignService,
    entityName: 'Campaign',
});
