import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@envs/environments';
import { IBaseResponseDto } from '@interfaces/commons/base-response.interface';
import { Observable } from 'rxjs';
export interface AssignAttentionDetailDto {
  attentionId?: number;
  consultTypeId?: number;
  attentionDetail?: string;
}
@Injectable({
  providedIn: 'root',
})
export class ChannelAttentionService {
  private readonly url = `${environment.apiUrl}v1/channel-room`;

  constructor(private http: HttpClient) {}

  getMessagesFromAssistance(assistanceId: number): Observable<any> {
    try {
      return this.http.get<any>(`${this.url}/assistances/${assistanceId}`);
    } catch (error) {
      console.log(error);
      throw new Error('No se pudo enviar el mensaje');
    }
  }

  getAssistances(channelRoomId: number): Observable<any> {
    try {
      return this.http.get<any>(
        `${this.url}/assistances/${channelRoomId}/assistance/retrieve`
      );
    } catch (error) {
      console.log(error);
      throw new Error('No se pudo enviar el mensaje');
    }
  }


  assignAttentionDetail(
    payload: AssignAttentionDetailDto
  ): Observable<IBaseResponseDto> {
    return this.http.put<IBaseResponseDto>(
      `${this.url}/assistances/${payload.attentionId}/attention-detail`,
      payload
    );
  }

  sendEmailWithConversation(assintanceId: number): Observable<any> {
    try {
      return this.http.post<any>(
        `${this.url}/assistances/${assintanceId}/send-to-email`,
        {}
      );
    } catch (error) {
      console.log(error);
      throw new Error('No se pudo enviar el mensaje');
    }
  }
}
