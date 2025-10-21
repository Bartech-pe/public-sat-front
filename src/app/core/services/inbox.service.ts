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
  getUserStatus() {
    return this.http.get<IBaseResponseDto<{userStatus: string}>>(`${this.url}/general-status`);
  }

  /**
   * Cambia el estado de todos los inbox del usuario actual
   * @param status 'Disponible' | 'Fuera de línea'
   */
  changeAllUserStatus(isAvailable: boolean) {
    return this.http.put<IBaseResponseDto>(`${this.url}/inbox-users/change-all-status`, { isAvailable });
  }
}
