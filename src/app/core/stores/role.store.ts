import { createEntityStore } from './generic/createEntityStore';
import { Role } from '@models/role.model';
import { RoleService } from '@services/role.service';

export const RoleStore = createEntityStore<Role>({
  serviceToken: RoleService,
  entityName: 'Role',
});
