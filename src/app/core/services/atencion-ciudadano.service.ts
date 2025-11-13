import { Injectable } from '@angular/core';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { HttpClient } from '@angular/common/http';
import { AtencionCiudadano } from '@models/atencion-ciudadano.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AtencionCiudadanoService extends GenericCrudService<AtencionCiudadano> {
  constructor(http: HttpClient) {
    super(http, 'atencion-ciudadano');
  }

  findByCarteraDetalle(
    idCarteraDetalle: number
  ): Observable<AtencionCiudadano[]> {
    return this.http.get<AtencionCiudadano[]>(
      `${this.url}/findByCarteraDetalle/${idCarteraDetalle}`
    );
  }

  findVerificacionByCarteraDetalle(
    idCarteraDetalle: number
  ): Observable<AtencionCiudadano[]> {
    return this.http.get<AtencionCiudadano[]>(
      `${this.url}/findVerificacionByCarteraDetalle/${idCarteraDetalle}`
    );
  }

  findByDocIde(docIde: string): Observable<AtencionCiudadano[]> {
    return this.http.get<AtencionCiudadano[]>(
      `${this.url}/findByDocIde/${docIde}`
    );
  }
}
