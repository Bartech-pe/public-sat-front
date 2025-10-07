import { Role, RoleScreenOffice } from './role.model';

export interface Screen {
  id: number;
  name: string;
  description: string;
  path: string;
  icon?: string;
  parentId?: number;
  RoleScreenOffice?: RoleScreenOffice;
  roles: Role[];
  items: Screen[];
  status?: boolean;
}
