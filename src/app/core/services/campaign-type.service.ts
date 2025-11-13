import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { CampaignType } from '@models/campaign-type.model';

@Injectable({
  providedIn: 'root',
})
export class CampaignTypeService extends GenericCrudService<CampaignType> {
  constructor(http: HttpClient) {
    super(http, 'campaign-types');
  }
}