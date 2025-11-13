import {  EmailCampaign } from '@models/email-campaign.model';
import { createEntityStore } from './generic/createEntityStore';
import { EmailCampaignService } from '@services/email-campaign.service';

export const EmailCampaignStore = createEntityStore<EmailCampaign>({
  serviceToken:  EmailCampaignService,
  entityName: 'EmailCampaign',
});
