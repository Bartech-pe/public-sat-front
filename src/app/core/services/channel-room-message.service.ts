import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@envs/environments';
import { Attachment } from '@features/main/omnichannel-inbox/chat-message-manager/chat-message-manager.component';
import { Observable } from 'rxjs';

export interface CreateChannelAgentMessageDto {
  channelRoomId?: number;
  assistanceId?: number;
  externalChannelRoomId?: string;
  phoneNumberReceiver?: string;
  phoneNumber?: string | null;
  message?: string;
  attachments: Attachment[];
  channel?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChannelRoomMessageService {
  private readonly url = `${environment.apiUrl}v1/channel-message`;

  constructor(private http: HttpClient) {}

  sendMessage(payload: CreateChannelAgentMessageDto): Observable<any> {
    try {
      return this.http.post<any>(`${this.url}/send`, payload);
    } catch (error) {
      console.log(error);
      throw new Error('No se pudo enviar el mensaje');
    }
  }
}
