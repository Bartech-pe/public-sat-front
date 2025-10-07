import { ChannelAssistance } from '@models/channel-assistance.model';
import { createEntityStore } from './generic/createEntityStore';
import { ChannelAssistanceService } from '@services/channel-assistance.service';

export const ChannelAssistanceStore = createEntityStore<ChannelAssistance>({
  serviceToken: ChannelAssistanceService,
  entityName: 'ChannelAssistance',
});
