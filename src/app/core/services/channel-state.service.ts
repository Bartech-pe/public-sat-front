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

  getUserStatusesByChannel(channel: string): Observable<IBaseResponseDto<ChannelState[]>> {
    return this.http.get<IBaseResponseDto<ChannelState[]>>(`${this.url}/${channel}/statuses`);
  }

  /**
   * Cambiar el estado de correos entre asesores
   *
   */
  myChannelStateEmail(): Observable<ChannelState> {
    return this.http.put<ChannelState>(`${this.url}/myChannelStateEmail`, {});
  }
}
