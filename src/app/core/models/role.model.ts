import { Screen } from './screen.model';

export interface Role {
  id: number;
  name: string;
  description?: string;
  RoleScreenOffice?: RoleScreenOffice;
  screens: Screen[];
  status: boolean;
}

export interface RoleScreenOffice {
  roleId: number;
  screenId: number;
  officeId: number;
  name?: string;
  url?: string;
  parentId?: number;
  parent?: Screen;
  markAll?: boolean;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}
