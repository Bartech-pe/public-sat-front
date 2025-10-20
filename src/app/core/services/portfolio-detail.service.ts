import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import {
  PortfolioDetail,
  CaseInformation,
  ReasignCarteraDetalle,
} from '@models/portfolio-detail.model';
import { Observable } from 'rxjs';
import { PaginatedResponse } from '@interfaces/paginated-response.interface';

@Injectable({
  providedIn: 'root',
})
export class PortfolioDetailService extends GenericCrudService<PortfolioDetail> {
  constructor(http: HttpClient) {
    super(http, 'portfolio-details');
  }

  findAllByUserToken(
    portfolioId: number,
    limit?: number,
    offset?: number,
    q?: Record<string, any>
  ): Observable<PaginatedResponse<PortfolioDetail> & { managed: number }> {
    const query = q ? `q=${encodeURIComponent(JSON.stringify(q))}` : '';
    const limitQ = limit ? `limit=${limit}&` : '';
    const offsetQ = limit ? `offset=${offset}&` : '';
    return this.http.get<
      PaginatedResponse<PortfolioDetail> & { managed: number }
    >(
      `${this.url}/detailByUserToken/${portfolioId}?${limitQ}${offsetQ}${query}`
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
      `${this.url}/detailByUserId/${userId}/${portfolioId}`
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
