import { Injectable } from '@angular/core';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { HttpClient } from '@angular/common/http';
import { Inbox } from '@models/inbox.model';

@Injectable({
  providedIn: 'root',
})
export class InboxService extends GenericCrudService<Inbox> {
  constructor(http: HttpClient) {
    super(http, 'inboxs');
  }
}
