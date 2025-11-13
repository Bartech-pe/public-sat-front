import { Injectable } from '@angular/core';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { HttpClient } from '@angular/common/http';
import { CategoryChannel } from '@models/category-channel.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryChannelService extends GenericCrudService<CategoryChannel> {
  constructor(http: HttpClient) {
    super(http, 'category-channels');
  }
}
