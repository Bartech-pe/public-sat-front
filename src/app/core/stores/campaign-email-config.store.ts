import {  CampaignEmailConfig } from '@models/campaign-email.model';
import { createEntityStore } from './generic/createEntityStore';
import { CampaignEmailConfigService } from '@services/campaign-email-config.service';

export const CampaignEmailConfigStore = createEntityStore<CampaignEmailConfig>({
  serviceToken:  CampaignEmailConfigService,
  entityName: 'CampaignEmailConfig',
});
