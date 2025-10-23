import { CampaignState } from './campaign-state.model';
import { CampaignType } from './campaign-type.model';
import { Department } from './department.model';
import { User } from './user.model';

export interface Campaign {
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

export  interface CampaignData {
  campaign_name: string;
  campaign_id: string;
  list_name: string;
  list_id: string;
  not_called: number;
  total_leads: number;
  penetration: number;
  called: string;
}
