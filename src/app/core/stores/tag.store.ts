
import { createEntityStore } from './generic/createEntityStore';
import { Tag } from '@models/tag.model';
import { TagService } from '@services/tag.service';

export const TagStore = createEntityStore<Tag>({
  serviceToken: TagService,
  entityName: 'Tag',
});
