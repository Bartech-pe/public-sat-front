import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@envs/environments';
import { IBaseResponseDto } from '@interfaces/commons/base-response.interface';
import {
  Channels,
  ChatDetail,
  ChatListInbox,
  ChatStatus,
  getAdvisorsResponseDto,
  MessageStatus,
} from '@interfaces/features/main/omnichannel-inbox/omnichannel-inbox.interface';
import { Observable } from 'rxjs';
export interface ToogleBotServicesDto {
  channelroomId: number;
  active: boolean;
}
export interface GetChannelSummaryDto {
  messageStatus?: MessageStatus | null;
  chatStatus?: ChatStatus | null;
  channel: Channels;
  search?: string;
}

export interface changeChannelRoomStatusDto {
  channelRoomId: number;
  assistanceId: number;
  status: ChatStatus;
}

export interface CloseAssistanceDto {
  channelRoomId?: number;
  assistanceId?: number;
  phoneNumber?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChannelRoomService {
  private readonly url = `${environment.apiUrl}v1/channel-room`;

  constructor(private http: HttpClient) {}

  getChatData(
    channelRoomId: number,
    assistanceId: number,
    limit: number = 30,
    before?: Date | null
  ): Observable<ChatDetail> {
    let params = new HttpParams().set('limit', limit.toString());

    if (before) {
      params = params.set('before', before.toString());
    }

    return this.http.get<ChatDetail>(
      `${this.url}/${channelRoomId}/assistance/${assistanceId}/detail`,
      { params }
    );
  }

  getChatSummary(query: GetChannelSummaryDto): Observable<ChatListInbox[]> {
    let params = new HttpParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<ChatListInbox[]>(`${this.url}/summary`, {
      params: params,
    });
  }

  getAvailableAdvisorsFromInbox(
    channelRoomId: number
  ): Observable<getAdvisorsResponseDto[]> {
    return this.http.get<getAdvisorsResponseDto[]>(
      `${this.url}/${channelRoomId}/advisors`
    );
  }

  transferToAdvisor(
    channelRoomId: number,
    newAdvisorId: number
  ): Observable<any> {
    return this.http.post<getAdvisorsResponseDto[]>(
      `${this.url}/${channelRoomId}/reassign-advisor/${newAdvisorId}`,
      {}
    );
  }

  closeAssistance(
    channelRoomId: number,
    assistanceId: number
  ): Observable<IBaseResponseDto> {
    const payload: CloseAssistanceDto = {
      assistanceId,
      channelRoomId,
    };
    return this.http.put<IBaseResponseDto>(
      `${this.url}/assistances/assistance/close`,
      payload
    );
  }

  changeChannelRoomStatus(
    payload: changeChannelRoomStatusDto
  ): Observable<IBaseResponseDto> {
    return this.http.put<IBaseResponseDto>(
      `${this.url}/change-status`,
      payload
    );
  }

  toggleBotServices(payload: ToogleBotServicesDto): Observable<string> {
    try {
      return this.http.post<string>(`${this.url}/toggle-bot-services`, payload);
    } catch (error) {
      console.log(error);
      throw new Error('No se pudo conectar con el bot');
    }
  }
}
