import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GenericCrudService } from './generic/generic-crud.service';
import { MessagePreview, SmsCampaign } from '@models/sms-campaign.model';

@Injectable({
  providedIn: 'root',
})
export class SmsCampaignService extends GenericCrudService<SmsCampaign> {
  constructor(http: HttpClient) {
    super(http, 'sms-campaigns');
  }
  readSMSExcel(file: File) {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<any>(`${this.url}/readSMSExcel`, formData);
  }
  getMessagePreview(body: MessagePreview) {
    return this.http.post<any>(`${this.url}/preview`, body);
  }
}
