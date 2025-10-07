import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { ChannelState } from '@models/channel-state.model';
import { Observable } from 'rxjs';

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
  myChannelStateEmail(): Observable<ChannelState> {
    return this.http.put<ChannelState>(`${this.url}/myChannelStateEmail`, {});
  }
}
