import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { ChannelState } from '@models/channel-state.model';
import { Observable } from 'rxjs';
import { IBaseResponseDto } from '@interfaces/commons/base-response.interface';

@Injectable({
  providedIn: 'root',
})
export class ChannelStateService extends GenericCrudService<ChannelState> {
  constructor(http: HttpClient) {
    super(http, 'channel-states');
  }

  /**
   * Cambiar el estado de correos entre asesores
   *
   */
  channelStateEmail(): Observable<ChannelState[]> {
    return this.http.put<ChannelState[]>(`${this.url}/channelStateEmail`, {});
  }

  /**
   * Cambiar el estado de correos entre asesores
   *
   */
  channelStateChatsat(): Observable<ChannelState[]> {
    return this.http.put<ChannelState[]>(`${this.url}/channelStateChatsat`, {});
  }

  /**
   * Cambiar el estado de correos entre asesores
   *
   */
  channelStateWhatsapp(): Observable<ChannelState[]> {
    return this.http.put<ChannelState[]>(
      `${this.url}/channelStateWhatsapp`,
      {}
    );
  }

  getUserStatusesByChannel(
    channel: string
  ): Observable<IBaseResponseDto<ChannelState[]>> {
    return this.http.get<IBaseResponseDto<ChannelState[]>>(
      `${this.url}/${channel}/statuses`
    );
  }

  /**
   * Cambiar el estado de correos entre asesores
   *
   */
  myChannelStateByCategoryId(categoryId: number): Observable<ChannelState> {
    return this.http.get<ChannelState>(
      `${this.url}/stateByCategoryId/${categoryId}`
    );
  }
}
