import { CategoryChannel } from './category-channel.model';

export interface PredefinedResponses {
  id: number;
  code: string;
  title: string;
  content: string;
  keywords: string[];
  categoryId: number;
  category?: CategoryChannel;
  createdAt?: Date;
  updatedAt?: Date;
}
