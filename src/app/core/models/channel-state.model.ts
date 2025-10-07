import { CategoryChannel } from './category-channel.model';

export interface ChannelState {
  id: number;
  name: string;
  description?: string;
  tipo: boolean;
  categoryId: number;
  category?: CategoryChannel;
  color: string;
  createdAt?: Date;
  updatedAt?: Date;
}
