import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Status } from '@models/estados.model';
import { GenericCrudService } from '@services/generic/generic-crud.service';

@Injectable({
  providedIn: 'root',
})
export class StatusService extends GenericCrudService<Status> {
  constructor(http: HttpClient) {
    super(http, 'status');
  }
}
