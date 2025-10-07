
import { createEntityStore } from './generic/createEntityStore';
import { CampaignType } from '@models/campaign-type.model';
import { CampaignTypeService } from '@services/campaign-type.service';

export const CampaignTypeStore = createEntityStore<CampaignType>({
    serviceToken:  CampaignTypeService,
    entityName: 'CampaignType',
});
