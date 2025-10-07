import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '@models/user.model';
import { GenericCrudService } from '@services/generic/generic-crud.service';

@Injectable({ providedIn: 'root' })
export class UserService extends GenericCrudService<User> {
  constructor(http: HttpClient) {
    super(http, 'users');
  }
}
