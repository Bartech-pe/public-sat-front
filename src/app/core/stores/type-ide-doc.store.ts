import { TypeIdeDocService } from '@services/type-ide-doc.service';
import { createEntityStore } from './generic/createEntityStore';
import { TypeIdeDoc } from '@models/type-ide-doc.model';

export const TypeIdeDocStore = createEntityStore<TypeIdeDoc>({
  serviceToken: TypeIdeDocService,
  entityName: 'TypeIdeDoc',
});
