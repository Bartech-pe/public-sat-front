import { Injectable } from '@angular/core';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { HttpClient } from '@angular/common/http';
import { ConsultType } from '@models/consult-type.modal';

@Injectable({
  providedIn: 'root',
})
export class ConsultTypeService extends GenericCrudService<ConsultType> {
  constructor(http: HttpClient) {
    super(http, 'consult-types');
  }
}
