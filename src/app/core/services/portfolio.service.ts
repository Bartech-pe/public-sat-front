import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { Portfolio } from '@models/portfolio.model';

@Injectable({
  providedIn: 'root',
})
export class PortfolioService extends GenericCrudService<Portfolio> {
  constructor(http: HttpClient) {
    super(http, 'portfolios');
  }
}
