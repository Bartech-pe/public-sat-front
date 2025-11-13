
import { createEntityStore } from './createEntityStore';
import { PredefinedResponsesService } from '@services/predefined.service';
import { Tags } from '@models/etiquetas.model';
import { TagsService } from '@services/etiquetas.service';

export const TagsStore = createEntityStore<Tags>({
  serviceToken: TagsService,
  entityName: 'Tags',
});
