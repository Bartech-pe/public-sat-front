import { Department } from '@models/department.model';
import { createEntityStore } from './generic/createEntityStore';
import { DepartmentService } from '@services/department.service';

export const DepartmentStore = createEntityStore<Department>({
  serviceToken: DepartmentService,
  entityName: 'Department',
});
