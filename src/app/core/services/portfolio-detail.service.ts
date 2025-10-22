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

  findAllByPortfolioId(
    portfolioId: number,
    limit?: number,
    offset?: number,
    q?: Record<string, any>
  ): Observable<PaginatedResponse<PortfolioDetail>> {
    const query = q ? `q=${encodeURIComponent(JSON.stringify(q))}` : '';
    const limitQ = limit ? `limit=${limit}&` : '';
    const offsetQ = limit ? `offset=${offset}&` : '';
    return this.http.get<PaginatedResponse<PortfolioDetail>>(
      `${this.url}/byPortfolioId/${portfolioId}?${limitQ}${offsetQ}${query}`
    );
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

  getByIdDetailCount(
    userId: number,
    portfolioId: number
  ): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(
      `${this.url}/portfolio-assignments/detail-count/${userId}/${portfolioId}`
    );
  }

  getByIdDetalleAsignado(userId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.url}/portfolio-assignments/details/${userId}`
    );
  }

  createMultiple(detalles: any[]): Observable<any> {
    return this.http.post(
      `${this.url}/portfolio-assignments/multiple`,
      detalles
    );
  }
}
