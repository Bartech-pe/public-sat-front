import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { State } from '@models/state.model';
import { GenericCrudService } from '@services/generic/generic-crud.service';

@Injectable({
  providedIn: 'root',
})
export class StateService extends GenericCrudService<State> {
  constructor(http: HttpClient) {
    super(http, 'states');
  }
}
