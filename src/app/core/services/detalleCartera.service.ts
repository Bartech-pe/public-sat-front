import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import {
  DetalleCartera,
  InformacionCaso,
  ReasignCarteraDetalle,
} from '@models/detalleCartera.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CarteraDetalleService extends GenericCrudService<DetalleCartera> {
  constructor(http: HttpClient) {
    super(http, 'cartera-detalle');
  }

  findAllByUserToken(): Observable<DetalleCartera[]> {
    return this.http.get<DetalleCartera[]>(`${this.url}/detalleByUserToken`);
  }

  findAllByIdCartera(id: number): Observable<DetalleCartera[]> {
    return this.http.get<DetalleCartera[]>(`${this.url}/detalle/${id}`);
  }

  findAllByIdUser(id: number): Observable<DetalleCartera[]> {
    return this.http.get<DetalleCartera[]>(`${this.url}/detalleByUserId/${id}`);
  }

  reasigUser(dto: ReasignCarteraDetalle[]): Observable<DetalleCartera[]> {
    return this.http.patch<DetalleCartera[]>(`${this.url}/reasigUser`, {
      dtoList: dto,
    });
  }

  createOrUpdateInfoCaso(
    idDetalle: number,
    dto: InformacionCaso
  ): Observable<InformacionCaso> {
    return this.http.post<InformacionCaso>(
      `${this.url}/createOrUpdateInfoCaso/${idDetalle}`,
      dto
    );
  }
}
