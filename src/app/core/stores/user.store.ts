import { createEntityStore } from './generic/createEntityStore';
import { UserService } from '@services/user.service';
import { User } from '@models/user.model';

export const UserStore = createEntityStore<User>({
  serviceToken: UserService,
  entityName: 'User',
});
