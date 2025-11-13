import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { EstadoTelefonico } from '@models/estado-telefonico.model';

@Injectable({
  providedIn: 'root',
})
export class EstadoTelefonicoService extends GenericCrudService<EstadoTelefonico> {
  constructor(http: HttpClient) {
    super(http, 'estado-canal');
  }
}
