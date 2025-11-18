import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { AssistanceState } from '@models/assistance-state.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AssistanceStateService extends GenericCrudService<AssistanceState> {
  constructor(http: HttpClient) {
    super(http, 'assistance-states');
  }

  /**
   * Cambiar el estado de correos entre asesores
   *
   */
  assistanceStateEmail(): Observable<(AssistanceState & { count: number })[]> {
    return this.http.get<(AssistanceState & { count: number })[]>(
      `${this.url}/assistanceStateEmail`,
      {}
    );
  }
}
