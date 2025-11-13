import { Injectable } from '@angular/core';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { HttpClient } from '@angular/common/http';
import { Channel } from '@models/channel.model';

@Injectable({
  providedIn: 'root'
})
export class ChannelService extends GenericCrudService<Channel> {
  constructor(http: HttpClient) {
    super(http, 'channels');
  }
}
