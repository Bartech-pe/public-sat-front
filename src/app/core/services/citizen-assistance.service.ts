import { Injectable } from '@angular/core';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { HttpClient } from '@angular/common/http';
import { CitizenAssistance } from '@models/citizen-assistance.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CitizenAssistanceService extends GenericCrudService<CitizenAssistance> {
  constructor(http: HttpClient) {
    super(http, 'citizen-assistances');
  }

  findByPortfolioDetail(
    portfolioDetailId: number
  ): Observable<CitizenAssistance[]> {
    return this.http.get<CitizenAssistance[]>(
      `${this.url}/findByPortfolioDetail/${portfolioDetailId}`
    );
  }

  findVerificacionByPortfolioDetail(
    portfolioDetailId: number
  ): Observable<CitizenAssistance[]> {
    return this.http.get<CitizenAssistance[]>(
      `${this.url}/findVerificacionByPortfolioDetail/${portfolioDetailId}`
    );
  }

  findByDocIde(docIde: string): Observable<CitizenAssistance[]> {
    return this.http.get<CitizenAssistance[]>(
      `${this.url}/findByDocIde/${docIde}`
    );
  }
}
