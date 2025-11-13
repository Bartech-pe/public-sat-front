import { Screen } from './screen.model';

export interface Role {
  id: number;
  name: string;
  description?: string;
  RoleScreen?: RoleScreen;
  screens: Screen[];
  status: boolean;
}

export interface RoleScreen {
  name?: string;
  url?: string;
  idRole: number;
  idParent?: number;
  parent?: Screen;
  idScreen: number;
  markAll?: boolean;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}
