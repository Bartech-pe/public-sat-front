import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { AutomaticMessage } from '@models/automatic-message.model';

@Injectable({
  providedIn: 'root',
})
export class AutomaticMessageService extends GenericCrudService<AutomaticMessage> {
  constructor(http: HttpClient) {
    super(http, 'automatic-messages');
  }
}
