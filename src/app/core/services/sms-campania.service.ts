import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GenericCrudService } from './generic/generic-crud.service';
import { MessagePreview, SmsCampaing } from '@models/sms-campaing';

@Injectable({
  providedIn: 'root'
})
export class SmsCampaingService extends GenericCrudService<SmsCampaing>{

constructor(http: HttpClient) {
    super(http, 'gestion-sms-campania');
  }
  readSMSExcel(file: File) {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<any>(`${this.url}/readSMSExcel`, formData);
  }
  getMessagePreview(body:MessagePreview){
      return this.http.post<any>(`${this.url}/preview`, body);
  }


}
