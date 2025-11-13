import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { EstadoAtencion } from '@models/estado-atencion.model';

@Injectable({
  providedIn: 'root',
})
export class EstadoAtencionService extends GenericCrudService<EstadoAtencion> {
  constructor(http: HttpClient) {
    super(http, 'estado-atencion');
  }
}
