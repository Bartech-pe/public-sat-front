import { Injectable } from '@angular/core';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { HttpClient } from '@angular/common/http';
import { Office } from '@models/office.model';

@Injectable({
  providedIn: 'root',
})
export class OfficeService extends GenericCrudService<Office> {
  constructor(http: HttpClient) {
    super(http, 'offices');
  }
}
