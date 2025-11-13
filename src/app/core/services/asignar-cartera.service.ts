import { Injectable } from '@angular/core';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { HttpClient } from '@angular/common/http';
import { AsignarCarteraDetalle } from '@models/asignar-cartera-detalle.model';

@Injectable({
  providedIn: 'root',
})
export class SkillService extends GenericCrudService<AsignarCarteraDetalle> {
  constructor(http: HttpClient) {
    super(http, 'asignar-cartera');
  }
}
