import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-send-audio-campaign',
  imports: [
    CommonModule,
  ],
  templateUrl: './send-audio-campaign.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SendAudioCampaignComponent { }
