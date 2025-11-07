import { CampaignState } from './campaign-state.model';
import { CampaignType } from './campaign-type.model';
import { Department } from './department.model';
import { User } from './user.model';

export interface AudioCampaign {
  id: number;
  name: string;
  description: string;
  campaignTypeId: number;
  departmentId: number;
  campaignStateId: number;
  startDate?: Date;
  endDate?: Date;
  startTime?: Date;
  endTime?: Date;
  startDay?: number;
  endDay?: number;
  validUntil?: Date;
  status?: boolean;
  vdCampaignId?: string;
  applyHoliday?: boolean; // Se puede cambiar

  campaignType?: CampaignType;
  department?: Department;
  campaignState?: CampaignState;
  createdByUser?: User;
}

export interface CampaignResumen {
  list_id: number;
  list_name: string;
  campaign_id: string;
  campaign_name: string;
  total_leads: number;
  not_called: number;
  called: number;
  penetration: number; // porcentaje de avance
}

export interface CampaignDetalle {
  estado: string;
  nombre_estado: string;
  subtotal: number;
}

export interface CampaignData {
  resumen: CampaignResumen;
  detalle: CampaignDetalle[];
}

export interface CampaignResumenMultype {
  crm_campaign_id: string;
  total_leads: number;
  pending: number;
  generating: number;
  generated: number;
  uploading: number;
  uploaded: number;
  failed: number;
}
