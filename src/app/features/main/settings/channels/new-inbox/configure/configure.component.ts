import { Component, computed, Signal } from '@angular/core';
import { TelegramComponent } from './telegram/telegram.component';
import { WhatsappComponent } from './whatsapp/whatsapp.component';
import { SmsComponent } from './sms/sms.component';
import { InstagramComponent } from './instagram/instagram.component';
import { MessengerComponent } from './messenger/messenger.component';
import { EmailComponent } from './email/email.component';
import { Channel } from '@models/channel.model';
import { StepperSignalState } from '@signals/settings/inboxes/components/stepper-signal.state';

@Component({
  selector: 'app-configure',
  imports: [
    TelegramComponent,
    WhatsappComponent,
    SmsComponent,
    InstagramComponent,
    MessengerComponent,
    EmailComponent
  ],
  templateUrl: './configure.component.html',
  styles: ``
})
export class ConfigureComponent {
  selectedWidget: Signal<Channel | undefined>

  constructor(private stepperSignal: StepperSignalState){
    this.selectedWidget = computed(() => this.stepperSignal.selectedWidget());
  }
}
