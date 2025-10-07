import { Injectable } from '@angular/core';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { Role } from '@models/role.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class RoleService extends GenericCrudService<Role> {
  constructor(http: HttpClient) {
    super(http, 'roles');
  }
}
