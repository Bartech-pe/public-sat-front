import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { EmailCampaign } from '@models/email-campaign.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EmailCampaignService extends GenericCrudService<EmailCampaign> {
  constructor(http: HttpClient) {
    super(http, 'email-campaigns');
  }

  sendCampaignEmail(formData: any): Observable<any> {
    return this.http.post<any>(`${this.url}/bulk`, formData);
  }

  getEmailTemplate(id: number): Observable<any> {
    return this.http.get<any>(`${this.url}/progress/${id}`);
  }
}
