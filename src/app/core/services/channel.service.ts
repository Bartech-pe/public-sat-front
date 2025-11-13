import { Injectable } from '@angular/core';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { Status } from '@models/estados.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChannelService extends GenericCrudService<Status> {
  constructor(http: HttpClient) {
    super(http, 'channels');
  }
}
