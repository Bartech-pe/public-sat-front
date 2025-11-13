import { Injectable } from '@angular/core';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { HttpClient } from '@angular/common/http';
import { Area } from '@models/area.model';

@Injectable({
  providedIn: 'root',
})
export class AreaService extends GenericCrudService<Area> {
  constructor(http: HttpClient) {
    super(http, 'areas');
  }
}
