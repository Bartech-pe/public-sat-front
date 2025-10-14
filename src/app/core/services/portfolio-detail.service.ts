import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import {
  PortfolioDetail,
  CaseInformation,
  ReasignCarteraDetalle,
} from '@models/portfolio-detail.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PortfolioDetailService extends GenericCrudService<PortfolioDetail> {
  constructor(http: HttpClient) {
    super(http, 'portfolio-details');
  }

  findAllByUserToken(portfolioId: number): Observable<PortfolioDetail[]> {
    return this.http.get<PortfolioDetail[]>(
      `${this.url}/detalleByUserToken/${portfolioId}`
    );
  }

  findAllByIdCartera(id: number): Observable<PortfolioDetail[]> {
    return this.http.get<PortfolioDetail[]>(`${this.url}/detalle/${id}`);
  }

  findAllByuserId(
    userId: number,
    portfolioId: number
  ): Observable<PortfolioDetail[]> {
    return this.http.get<PortfolioDetail[]>(
      `${this.url}/detalleByUserId/${userId}/${portfolioId}`
    );
  }

  reasigUser(dto: ReasignCarteraDetalle[]): Observable<PortfolioDetail[]> {
    return this.http.patch<PortfolioDetail[]>(`${this.url}/reasigUser`, {
      dtoList: dto,
    });
  }

  createOrUpdateInfoCaso(
    idDetalle: number,
    dto: CaseInformation
  ): Observable<CaseInformation> {
    return this.http.post<CaseInformation>(
      `${this.url}/createOrUpdateInfoCaso/${idDetalle}`,
      dto
    );
  }

  getByIdDetalleAsignar(id: number, portfolioId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.url}/portfolio-assignments/details/${id}/${portfolioId}`
    );
  }

  getByIdDetalleAsignado(id_user: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.url}/portfolio-assignments/details/${id_user}`
    );
  }

  createMultiple(detalles: any[]): Observable<any> {
    return this.http.post(
      `${this.url}/portfolio-assignments/multiple`,
      detalles
    );
  }
}
