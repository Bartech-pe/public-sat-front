import { CitizenContact } from './citizen.model';
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
  status: boolean;
}

export interface ReasignCarteraDetalle {
  id: number;
  userId: number;
}
