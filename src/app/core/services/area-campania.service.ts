import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AreaCampania } from '@models/area-campania.model';
import { GenericCrudService } from '@services/generic/generic-crud.service';

@Injectable({
  providedIn: 'root',
})
export class AreaCampaniaService extends GenericCrudService<AreaCampania> {
  constructor(http: HttpClient) {
    super(http, 'area-campania');
  }
}