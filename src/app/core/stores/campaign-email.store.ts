import { CampaignEmail } from '@models/campaign-email.model';
import { createEntityStore } from './generic/createEntityStore';
import { CampaignEmailService } from '@services/campaign-email.service';

export const CampaignEmailStore = createEntityStore<CampaignEmail>({
  serviceToken:  CampaignEmailService,
  entityName: 'CampaignEmail',
});
