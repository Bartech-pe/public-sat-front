import { User } from './user.model';

export interface PortfolioDetail {
  id?: number;
  portfolioId?: number;
  userId?: number;
  user?: User;
  segment: string;
  profile: string;
  taxpayerName: string;
  taxpayerType?: string;
  tipDoc: string;
  docIde: string;
  code: string;
  debt: number;
  currentDebt?: number;
  // phone1?: string;
  // phone2?: string;
  // phone3?: string;
  // phone4?: string;
  // whatsapp?: string;
  // email?: string;
  status?: boolean;
  caseInformation?: CaseInformation;
  citizenContacts: CitizenContact[];
}

export interface CaseInformation {
  id?: number;
  commitmentDate?: Date;
  commitmentAmount?: number;
  observation?: string;
  followUp?: string;
}

export interface AsignacionPortfolioDetail {
  id?: number;
  portfoliodetailId?: number;
  portfolioId?: number;
  userId?: number;
  user?: User;
  segment: string;
  profile: string;
  taxpayerName: string;
  taxpayerType?: string;
  tipDoc: string;
  docIde: string;
  code: string;
  debt: number;
  pay?: number;
  // telefono1?: string;
  // telefono2?: string;
  // telefono3?: string;
  // telefono4?: string;
  // whatsapp?: string;
  // email?: string;
  // motivo?: string;
  status: boolean;
}

export interface ReasignCarteraDetalle {
  id: number;
  userId: number;
}

export interface CitizenContact {
  id?: number;
  tipDoc: string;
  docIde: string;
  contactType: 'PHONE' | 'EMAIL' | 'WHATSAPP';
  label?: string;
  value: string;
  isAdditional: boolean;
  status: boolean;
}
