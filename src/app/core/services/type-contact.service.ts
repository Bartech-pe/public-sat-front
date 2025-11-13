import { Injectable } from '@angular/core';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { HttpClient } from '@angular/common/http';
import { TypeContact } from '@models/type-contact.modal';

@Injectable({
  providedIn: 'root',
})
export class TypeContactService extends GenericCrudService<TypeContact> {
  constructor(http: HttpClient) {
    super(http, 'type-contacts');
  }
}
