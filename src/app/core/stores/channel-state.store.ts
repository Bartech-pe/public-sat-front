import { createEntityStore } from './generic/createEntityStore';
import { ChannelState } from '@models/channel-state.model';
import { ChannelStateService } from '@services/channel-state.service';

export const ChannelStateStore = createEntityStore<ChannelState>({
  serviceToken: ChannelStateService,
  entityName: 'ChannelState',
});
