import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { PredefinedResponses } from '@models/predefined.model';

@Injectable({
  providedIn: 'root',
})
export class TagsService extends GenericCrudService<PredefinedResponses> {
  constructor(http: HttpClient) {
    super(http, 'tags');
  }
}
