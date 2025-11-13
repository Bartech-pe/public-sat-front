import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { TipoCampania } from '@models/tipo-campania.model';
import { AreaCampania } from '@models/area-campania.model';
import { Campania } from '@models/campania.model';

@Injectable({
  providedIn: 'root',
})
export class GestionCampaniaService extends GenericCrudService<Campania> {
  constructor(http: HttpClient) {
    super(http, 'gestion-campania');
  }
}