export interface CampaignState {
  id: number;
  name: string;
  description?: string;
  color: string;
  status?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
