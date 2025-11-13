import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { CampaignState } from '@models/campaign-state.model';

@Injectable({
  providedIn: 'root',
})
export class CampaignStateService extends GenericCrudService<CampaignState> {
  constructor(http: HttpClient) {
    super(http, 'campaign-states');
  }
}
