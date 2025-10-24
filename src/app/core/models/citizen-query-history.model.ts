import { User } from './user.model';


export enum QueryType {
  TICKETS_BY_PLATE = 'tickets_by_plate',
  TICKETS_BY_DNI = 'tickets_by_dni',
  TICKETS_BY_RUC = 'tickets_by_ruc',
  INFRACTION_CODE = 'infraction_code',
  TAXES_BY_PLATE = 'taxes_by_plate',
  TAXES_BY_DNI = 'taxes_by_dni',
  TAXES_BY_RUC = 'taxes_by_ruc',
  TAXES_BY_TAXPAYER_CODE = 'taxes_by_taxpayer_code',
  CAPTURE_ORDER_BY_PLATE = 'capture_order_by_plate',
  PROCEDURE_BY_NUMBER = 'procedure_by_number',
}

export enum DocumentType {
  PLATE = 'plate',
  DNI = 'dni',
  RUC = 'ruc',
  INFRACTION_CODE = 'infraction_code',
  TAXPAYER_CODE = 'taxpayer_code',
  PROCEDURE_NUMBER = 'procedure_number',
}


export interface ChannelQueryHistory {
  id: number;
  queryType: QueryType;
  documentType: DocumentType;
  documentValue: string;
  attentionId: number;
  status: boolean;
  createdBy?: number | null;
  updatedBy?: number | null;
  deletedBy?: number | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt?: Date | string | null;
}
