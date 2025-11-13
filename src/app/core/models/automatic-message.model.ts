import { CategoryChannel } from './category-channel.model';

export interface AutomaticMessage {
  id: number;
  name: string;
  message_descriptions?: string[];
  descriptions: any[];
  categoryId: number;
  category?: CategoryChannel;
  status: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
