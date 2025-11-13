import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ChannelsComponent } from '../new-inbox/channels/channels.component';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageGlobalService } from '@services/message-global.service';
import { Channel } from '@models/channel.model';
import { WhatsappComponent } from '../new-inbox/configure/whatsapp/whatsapp.component';
import { TelegramComponent } from '../new-inbox/configure/telegram/telegram.component';
import { SmsComponent } from '../new-inbox/configure/sms/sms.component';
import { InstagramComponent } from '../new-inbox/configure/instagram/instagram.component';
import { MessengerComponent } from '../new-inbox/configure/messenger/messenger.component';
import { EmailComponent } from '../new-inbox/configure/email/email.component';
import { InboxUserFormComponent } from '../inbox-user-form/inbox-user-form.component';
import { ChatwebComponent } from '../new-inbox/configure/chatweb/chatweb.component';

interface Credentials {
  id: number;
  inboxId: number;
  accessToken: string | null;
  phoneNumberId: string | null;
  businessId: string | null;
  phoneNumber: string;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ChannelData {
  id: number;
  name: string;
  avatarUrl: string | null;
  widgetColor: string | null;
  idChannel: number;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  channel: Channel;
  credentials: Credentials;
}
@Component({
  selector: 'app-inbox-form',
  imports: [
    CommonModule,
    ChannelsComponent,
    WhatsappComponent,
    TelegramComponent,
    SmsComponent,
    InstagramComponent,
    MessengerComponent,
    EmailComponent,
    InboxUserFormComponent,
    ChatwebComponent
  ],
  templateUrl: './inbox-form.component.html',
  styles: ``,
})
export class InboxFormComponent implements OnInit {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);
  public readonly config = inject(DynamicDialogConfig);
  private readonly msg = inject(MessageGlobalService);

  activeStep = 1;

  channel!: Channel;
  channelData: ChannelData | null = null;

  ngOnInit(): void {
    if(this.config.data){
      this.channel = this.config.data.channel
      this.channelData = this.config.data
      this.activeStep = 2;

      console.log("__________", this.channel);
    }
  }

  channelChange(c: Channel) {
    if (c) {
      this.channel = c;
      this.activeStep = 2;
    }
  }

  inboxChange(showAgents: boolean) {
    if (showAgents) {
      this.activeStep = 3;
    } else {
      this.ref.close(true);
    }
  }
}
