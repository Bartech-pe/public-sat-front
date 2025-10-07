import { CampaignState } from '@models/campaign-state.model';
import { createEntityStore } from './generic/createEntityStore';
import { CampaignStateService } from '@services/campaign-state.service';

export const CampaignStateStore = createEntityStore<CampaignState>({
  serviceToken: CampaignStateService,
  entityName: 'CampaignState',
});
