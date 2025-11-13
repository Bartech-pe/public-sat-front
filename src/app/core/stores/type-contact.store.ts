import { createEntityStore } from './generic/createEntityStore';
import { TypeContact } from '@models/type-contact.modal';
import { TypeContactService } from '@services/type-contact.service';

export const TypeContactStore = createEntityStore<TypeContact>({
  serviceToken: TypeContactService,
  entityName: 'TypeContact',
});
