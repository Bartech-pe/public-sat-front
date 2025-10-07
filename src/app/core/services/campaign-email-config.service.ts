import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { CampaignEmailConfig } from '@models/campaign-email.model';
import { Observable } from 'rxjs';
import { environment } from '@envs/environments';

@Injectable({
  providedIn: 'root',
})
export class CampaignEmailConfigService extends GenericCrudService<CampaignEmailConfig> {
  private baseUrl = `${environment.apiUrl}v1/campaing-email-config`;
  constructor(http: HttpClient) {
    super(http, 'campaing-email-config');
  }

  sendCampaignEmail(formData: any): Observable<any> {
      return this.http.post<any>(`${this.baseUrl}/bulk`, formData);
  }

 
  
}