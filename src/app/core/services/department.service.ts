import { Injectable } from '@angular/core';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { HttpClient } from '@angular/common/http';
import { Department } from '@models/department.model';

@Injectable({
  providedIn: 'root',
})
export class DepartmentService extends GenericCrudService<Department> {
  constructor(http: HttpClient) {
    super(http, 'departments');
  }
}
