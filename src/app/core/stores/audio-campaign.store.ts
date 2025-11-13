import { AudioCampaign } from '@models/audio-campaign.model';
import { createEntityStore } from './generic/createEntityStore';
import { AudioCampaignService } from '@services/audio-campaign.service';

export const AudioCampaignStore = createEntityStore<AudioCampaign>({
  serviceToken: AudioCampaignService,
  entityName: 'AudioCampaign',
});
