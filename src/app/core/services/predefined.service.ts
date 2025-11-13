import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { PredefinedResponses } from '@models/predefined-response.model';
import { Observable } from 'rxjs';
import { IBaseResponseDto } from '@interfaces/commons/base-response.interface';

@Injectable({
  providedIn: 'root',
})
export class PredefinedResponsesService extends GenericCrudService<PredefinedResponses> {
  constructor(http: HttpClient) {
    super(http, 'predefined-response');
  }

  /**
   * Listar las respuestas predefinidas de email
   *
   */
  allMail(): Observable<PredefinedResponses[]> {
    return this.http.get<PredefinedResponses[]>(`${this.url}/allMail`);
  }

  /**
   * Listar las respuestas predefinidas de chatsat
   *
   */
  allChatSat(): Observable<PredefinedResponses[]> {
    return this.http.get<PredefinedResponses[]>(`${this.url}/allChatSat`);
  }

  allWhatsapp(): Observable<PredefinedResponses[]> {
    return this.http.get<PredefinedResponses[]>(`${this.url}/allWhatsapp`);
  }

  copyToOtherChannels(categoryChannelId: number): Observable<IBaseResponseDto> {
    return this.http.post<IBaseResponseDto>(`${this.url}/${categoryChannelId}/copy-to-other-channels`, {});
  }

}
