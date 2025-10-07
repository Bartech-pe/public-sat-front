import { CategoryChannel } from './category-channel.model';

export interface AutomaticMessage {
  id: number;
  name: string;
  description?: string;
  categoryId: number;
  category?: CategoryChannel;
  status: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
