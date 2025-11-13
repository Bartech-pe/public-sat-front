import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { EstadoCampania } from '@models/estado-campania.model';

@Injectable({
  providedIn: 'root',
})
export class EstadoCampaniaService extends GenericCrudService<EstadoCampania> {
  constructor(http: HttpClient) {
    super(http, 'estado-campania');
  }
}
