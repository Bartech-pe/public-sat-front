import { Oficina } from './oficina.model';
import { User } from './user.model';

export interface Cartera {
  id: number;
  name: string;
  description?: string;
  status: boolean;
  dateStart: Date;
  dateEnd: Date;
  idOficina: number;
  oficina: Oficina;
  amount: number;
  createdByUser?: User;
}
