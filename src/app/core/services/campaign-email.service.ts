import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { CampaignEmail } from '@models/campaign-email.model';
import { Observable } from 'rxjs';
import { environment } from '@envs/environments';

@Injectable({
  providedIn: 'root',
})
export class CampaignEmailService extends GenericCrudService<CampaignEmail> {
  private baseUrl = `${environment.apiUrl}v1/campaign-email`;
  constructor(http: HttpClient) {
    super(http, 'campaign-email');
  }

  sendCampaignEmail(formData: any): Observable<any> {
      return this.http.post<any>(`${this.baseUrl}/bulk`, formData);
  }

 
  
}