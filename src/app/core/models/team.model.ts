import { User } from './user.model';

export interface Team {
  id: number;
  name: string;
  description: string;
  users?: User[];
  status?: boolean;
}

export interface TeamUser {
  name?: string;
  email?: string;
  avatarUrl?: string;
  idTeam: number;
  idUser: number;
}
