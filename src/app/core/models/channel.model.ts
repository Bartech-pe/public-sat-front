import { User } from './user.model';

export interface Channel {
  id?: number;
  name: string;
  description?: string;
  logo?: string;
  users?: User[];
  status?: boolean;
}

export interface UserChannel {
  id: number;
  idChannel: number;
  idUser: number;
}
