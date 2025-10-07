import { Department } from './department.model';

export interface Office {
  id: number;
  name: string;
  departmentId: number;
  department: Department;
  description?: string;
  status: boolean;
}
