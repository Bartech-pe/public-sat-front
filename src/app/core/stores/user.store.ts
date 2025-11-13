import { User } from "@models/user.model";
import { createEntityStore } from "./createEntityStore";
import { UserService } from "@services/user.service";

export const UserStore = createEntityStore<User>({
  serviceToken: UserService,
  entityName: 'User',
});