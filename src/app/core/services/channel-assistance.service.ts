import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { ChannelAssistance } from '@models/channel-assistance.model';

@Injectable({
  providedIn: 'root',
})
export class ChannelAssistanceService extends GenericCrudService<ChannelAssistance> {
  constructor(http: HttpClient) {
    super(http, 'channel-assistances');
  }
}
