import { Area } from './area.model';

export interface Oficina {
  id: number;
  name: string;
  idArea: number;
  area: Area;
  description?: string;
  status: boolean;
}
