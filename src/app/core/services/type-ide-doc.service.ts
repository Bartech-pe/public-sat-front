import { Injectable } from '@angular/core';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { HttpClient } from '@angular/common/http';
import { TypeIdeDoc } from '@models/type-ide-doc.model';

@Injectable({
  providedIn: 'root',
})
export class TypeIdeDocService extends GenericCrudService<TypeIdeDoc> {
  constructor(http: HttpClient) {
    super(http, 'type-ide-docs');
  }
}
