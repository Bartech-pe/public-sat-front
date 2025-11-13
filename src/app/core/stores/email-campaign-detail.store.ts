import { EmailCampaignDetail } from '@models/email-campaign.model';
import { createEntityStore } from './generic/createEntityStore';
import { EmailCampaignDetailService } from '@services/email-campaign-detail.service';

export const EmailCampaignDetailStore = createEntityStore<EmailCampaignDetail>({
  serviceToken: EmailCampaignDetailService,
  entityName: 'EmailCampaignDetail',
});
