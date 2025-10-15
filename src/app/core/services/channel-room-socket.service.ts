import { Injectable, OnDestroy } from '@angular/core';
import { environment } from '@envs/environments';
import {
  AdvisorChangedDto,
  BotStatusChangedDto,
  ChannelRoomNewMessageDto,
  ChannelRoomViewStatusDto,
  ChatStatus,
} from '@interfaces/features/main/omnichannel-inbox/omnichannel-inbox.interface';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

export interface ChannelRoomAssistance {
  channelRoomId?: number;
  assistanceId: number;
  citizenId?: number;
  userId?: number;
}
export interface changeChannelRoomStatusDto extends ChannelRoomAssistance {
  status: ChatStatus;
}

@Injectable({
  providedIn: 'root',
})
export class ChannelRoomSocketService implements OnDestroy {
  private socket: Socket;
  private newMessageSubject = new Subject<ChannelRoomNewMessageDto>();
  private newAdvisorSubject = new Subject<AdvisorChangedDto>();
  private newBotStatusSubject = new Subject<BotStatusChangedDto>();
  private newChannelViewedStatus = new Subject<ChannelRoomViewStatusDto>();
  private newChannelRoomStatusChangeSubject =
    new Subject<changeChannelRoomStatusDto>();
  private requestAdvisorSubject = new Subject<ChannelRoomAssistance>();
  private attentionDetailModifiedSubject = new Subject<ChannelRoomAssistance>();

  constructor() {
    this.socket = io(environment.apiUrl);

    this.socket.on('connect', () => {
      console.log('Omnichannel webSocket connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`Omnichannel webSocket disconnected: ${reason}`);
    });

    this.socket.on(
      'chat.viewed.reply',
      (viewedStatusReply: ChannelRoomViewStatusDto) => {
        this.newChannelViewedStatus.next(viewedStatusReply);
      }
    );

    this.socket.on(
      'chat.status.change',
      (payload: changeChannelRoomStatusDto) => {
        this.newChannelRoomStatusChangeSubject.next(payload);
      }
    );

    this.socket.on('chat.advisor.change', (payload: AdvisorChangedDto) => {
      this.newAdvisorSubject.next(payload);
    });

    this.socket.on('chat.advisor.request', (paload: ChannelRoomAssistance) => {
      this.requestAdvisorSubject.next(paload);
    });

    this.socket.on('chat.attention.detail.modified', (payload: ChannelRoomAssistance) => {
      this.attentionDetailModifiedSubject.next(payload);
    });

    this.socket.on('chat.botStatus.change', (payload: BotStatusChangedDto) => {
      this.newBotStatusSubject.next(payload);
    });

    this.socket.on('message.incoming', (message: ChannelRoomNewMessageDto) => {
      this.newMessageSubject.next(message);
    });
  }
  ngOnDestroy(): void {
    this.socket.disconnect();
  }

  connectSocket() {
    if (!this.socket.connected) {
      this.socket.connect();
    }
  }

  disconnectSocket() {
    if (this.socket.connected) {
      this.socket.disconnect();
    }
  }
  /**
   * Observable que puedes suscribirte desde cualquier componente
   */
  onNewMessage(): Observable<ChannelRoomNewMessageDto> {
    return this.newMessageSubject.asObservable();
  }

  onChatViewedReplies(): Observable<ChannelRoomViewStatusDto> {
    return this.newChannelViewedStatus.asObservable();
  }

  onAdvisorChanged(): Observable<AdvisorChangedDto> {
    return this.newAdvisorSubject.asObservable();
  }

  onAttentionDetailModified(): Observable<ChannelRoomAssistance> {
    return this.attentionDetailModifiedSubject.asObservable();
  }

  onChannelRoomStatusChanged(): Observable<changeChannelRoomStatusDto> {
    return this.newChannelRoomStatusChangeSubject.asObservable();
  }

  onAdvisorRequest(): Observable<ChannelRoomAssistance> {
    return this.requestAdvisorSubject.asObservable();
  }

  onBotRepliesStatusChanged(): Observable<BotStatusChangedDto> {
    return this.newBotStatusSubject.asObservable();
  }

  onChatViewed(chatroomId: number) {
    this.socket.emit('chat.viewed', chatroomId);
  }

  enableTypingIndicator(data: ChannelRoomAssistance) {
    this.socket.emit('chat.status.typing.indicator', data);
  }
}
