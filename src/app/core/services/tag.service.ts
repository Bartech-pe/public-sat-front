import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { Tag } from '@models/tag.model';

@Injectable({
  providedIn: 'root',
})
export class TagService extends GenericCrudService<Tag> {
  constructor(http: HttpClient) {
    super(http, 'tags');
  }
}
