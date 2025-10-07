import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { Campaign } from '@models/campaign.model';

@Injectable({
  providedIn: 'root',
})
export class CampaignService extends GenericCrudService<Campaign> {
  constructor(http: HttpClient) {
    super(http, 'campaigns');
  }
}
