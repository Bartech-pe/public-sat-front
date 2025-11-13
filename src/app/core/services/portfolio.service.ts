import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { Portfolio } from '@models/portfolio.model';
import { Observable } from 'rxjs';
import { environment } from '@envs/environments';

@Injectable({
  providedIn: 'root',
})
export class PortfolioService extends GenericCrudService<Portfolio> {
  
  private baseUrl = `${environment.apiUrl}v1/portfolios`;
  
  constructor(http: HttpClient) {
    super(http, 'portfolios');
  }

  createPortfolio(data: any, file: File): Observable<any> {
    console.log(file);
    
    const formData = new FormData();

    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });

    formData.append('file', file, file.name);

    return this.http.post(this.baseUrl, formData);
  }

}
