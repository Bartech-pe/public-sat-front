import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { AudioCampaign } from '@models/audio-campaign.model';

@Injectable({
  providedIn: 'root',
})
export class AudioCampaignService extends GenericCrudService<AudioCampaign> {
  constructor(http: HttpClient) {
    super(http, 'audio-campaigns');
  }
}
