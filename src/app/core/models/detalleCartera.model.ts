import { User } from './user.model';

export interface DetalleCartera {
  id?: number;
  id_cartera?: number;
  idUser?: number;
  user?: User;
  segmento: string;
  perfil: string;
  contribuyente: string;
  tipoContribuyente?: string;
  codigo: string;
  deuda: number;
  pago?: number;
  status?: boolean;
  fecha: Date;
  telefono1?: string;
  telefono2?: string;
  telefono3?: string;
  telefono4?: string;
  whatsapp?: string;
  email?: string;
  estadoCaso?: string;
  informacionCaso?: InformacionCaso;
}

export interface InformacionCaso {
  id?: number;
  fechaCompromiso?: Date;
  montoCompromiso?: number;
  observacion?: string;
  seguimiento?: string;
}

export interface AsignacionDetalleCartera {
  id?: number;
  id_cartera_detalle?: number;
  id_cartera?: number;
  id_user?: number;
  sectorista: string;
  segmento: string;
  perfil: string;
  contribuyente: string;
  codigo: string;
  deuda?: number;
  pago?: number;
  fecha: Date;
  telefono1?: string;
  telefono2?: string;
  telefono3?: string;
  telefono4?: string;
  whatsapp?: string;
  email?: string;
  motivo?: string;
  status: boolean;
}

export interface ReasignCarteraDetalle {
  id: number;
  idUser: number;
}
