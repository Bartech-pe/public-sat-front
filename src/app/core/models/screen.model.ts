import { Role, RoleScreen } from './role.model';

export interface Screen {
  id: number;
  name: string;
  description: string;
  url: string;
  icon?: string;
  idParent?: number;
  RoleScreen?: RoleScreen;
  roles: Role[];
  items: Screen[];
  status?: boolean;
}
