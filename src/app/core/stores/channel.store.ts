import { createEntityStore } from './generic/createEntityStore';
import { Channel } from '@models/channel.model';
import { ChannelService } from '@services/channel.service';

export const ChannelStore = createEntityStore<Channel>({
  serviceToken: ChannelService,
  entityName: 'Channel',
});
