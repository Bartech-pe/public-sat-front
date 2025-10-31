import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { Inbox } from '@models/inbox.model';
import { IBaseResponseDto } from '@interfaces/commons/base-response.interface';




@Injectable({
  providedIn: 'root',
})
export class InboxService extends GenericCrudService<Inbox> {
  constructor(http: HttpClient) {
    super(http, 'inboxs');
  }

  /**
   * Obtiene el estado general del usuario actual
   */
  getUserStatus(channel:string) {
    return this.http.get<IBaseResponseDto<{userStatus: string, color?: string | null}>>(`${this.url}/${channel}/general-status`);
  }

  getUserStatusesByChannel(channel:string)
  {
    return this.http.get<IBaseResponseDto<any>>(`${this.url}/${channel}/statuses`);
  }

  getAvailableChannelsByUser() {
    return this.http.get<IBaseResponseDto<string[]>>(`${this.url}/available-channels`);
  }

  /**
   * Cambia el estado de todos los inbox del usuario actual
   * @param status 'Disponible' | 'Fuera de línea'
   */
  changeAllUserStatus(payload: {
        channel: string,
        isAvailable?: boolean | null,
        channelStateId?: number | null,
      }) {
    return this.http.put<IBaseResponseDto>(`${this.url}/inbox-users/change-all-status`, payload);
  }
}
