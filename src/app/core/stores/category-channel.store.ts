import { createEntityStore } from './generic/createEntityStore';
import { CategoryChannel } from '@models/category-channel.model';
import { CategoryChannelService } from '@services/category-channel.service';

export const CategoryChannelStore = createEntityStore<CategoryChannel>({
  serviceToken: CategoryChannelService,
  entityName: 'CategoryChannel',
});
