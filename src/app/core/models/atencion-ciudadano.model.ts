import { User } from './user.model';

export interface AtencionCiudadano {
  id?: number;
  metodo?: string;
  tipo?: string;
  canal?: string;
  contacto?: string;
  resultado?: string;
  observacion?: string;
  idCarteraDetalle?: number;
  docIde?: string;
  createdBy?: User;
  status?: boolean;
  verifPago?: boolean;
}
