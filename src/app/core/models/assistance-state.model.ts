import { CategoryChannel } from './category-channel.model';

export interface AssistanceState {
  id: number;
  name: string;
  description: string;
  tipo: boolean;
  color: string;
  icon: string;
  categoryId: number;
  category?: CategoryChannel;
  createdAt?: Date;
  updatedAt?: Date;
}
