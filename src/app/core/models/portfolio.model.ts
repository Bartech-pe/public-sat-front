import { Office } from './office.model';
import { PortfolioDetail } from './portfolio-detail.model';
import { User } from './user.model';

export interface Portfolio {
  id: number;
  name: string;
  description?: string;
  status: boolean;
  dateStart: Date;
  dateEnd: Date;
  officeId: number;
  office?: Office;
  amount: number;
  createdByUser?: User;
  detalles: PortfolioDetail[]
}
