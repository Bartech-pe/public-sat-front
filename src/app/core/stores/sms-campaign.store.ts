import { SmsCampaignService } from '@services/sms-campaign.service';

import { SmsCampaign } from '@models/sms-campaign.model';
import { createEntityStore } from './createEntityStore';

export const SmsCampaignStore = createEntityStore<SmsCampaign>({
  serviceToken: SmsCampaignService,
  entityName: 'SmsCampaign',
});
