import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, HostListener, inject, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdvisorChangedDto, BotStatusChangedDto, ChannelLogo, ChannelMessage, ChannelRoomNewMessageDto, ChannelRoomViewStatusDto, Channels, ChannelStatusIcon, ChannelStatusTag, ChatListInbox, ChatStatus, LastMessageReceived, MessageStatus } from '@interfaces/features/main/omnichannel-inbox/omnichannel-inbox.interface';
import { ChannelRoomAssistance, ChannelRoomSocketService } from '@services/channel-room-socket.service';
import { ChannelRoomService, GetChannelSummaryDto } from '@services/channel-room.service';
import { PhoneFormatPipe } from '@pipes/phone-format.pipe';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { IconField } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { SelectButtonModule } from 'primeng/selectbutton';
import { debounceTime, last, Subject, switchMap } from 'rxjs';
import { AuthStore } from '@stores/auth.store';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { timeStamp } from 'console';
import { TooltipModule } from 'primeng/tooltip';


interface SummaryFilters{
  chatStatus?: string | null
  messageStatus?: string | null
  search?: string | null
}
interface FilterOptions{
  label: string | null,
  value: string | null,
  icon: string | null
}

@Component({
  selector: 'app-chat-list',
  imports: [
    ButtonModule,
    CommonModule,
    FormsModule,
    InputTextModule,
    IconField,
    // ButtonChannelComponent,
    PhoneFormatPipe,
    ToastModule,
    DividerModule,
    SelectButtonModule,
    TooltipModule,
    AvatarModule,
    OverlayBadgeModule
  ],
  templateUrl: './chat-list.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [MessageService],
  styles: `
   .card-custom {
        position: relative;
        overflow: hidden;

    }
    :host ::ng-deep .p-selectbutton	.p-togglebutton{
        padding: 4px !important;
    }
    :host ::ng-deep .p-selectbutton .p-togglebutton-checked .p-togglebutton-content{
        background: var(--sat-principal);
        color: white !important;
    }


    :host ::ng-deep .p-toast .p-toast-message {
      margin: 0 0 1rem 0 !important;   /* separación entre toasts */
      padding: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
      border: none !important;
    }

    :host ::ng-deep .p-toast .p-toast-message-content {
      padding: 0 !important;
      background: transparent !important;
    }
    :host ::ng-deep .p-toast .p-toast-close-button {
      display: none !important;
    }
    .card-custom::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        width: 6px;
        height: 100%;
        background-color: var(--color-sky-700, #ef4444); /* Color por defecto: rojo */
        z-index: 1;
        transition: all 0.1s ease-in-out;
    }

    .card-custom.notification-red {
        --notification-color: #ef4444;
    }

    .card-custom.notification-green {
        --notification-color: #22c55e;
    }

    .card-custom.notification-blue {
        --notification-color: #3b82f6;
    }

    .card-custom.notification-yellow {
        --notification-color: #eab308;
    }

    .card-custom.notification-purple {
        --notification-color: #a855f7;
    }

    .card-custom.notification-orange {
        --notification-color: #f97316;
    }

    .card-custom.no-notification::before {
        display: none;
    }

    /* Animación hover */
    .card-notification:hover::before {
        width: 7px;
    }
    @keyframes shimmer {
      0% {
        background-position: -200px 0;
      }
      100% {
        background-position: calc(200px + 100%) 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    .animate-shimmer {
      background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
      background-size: 200px 100%;
      animation: shimmer 1.5s infinite;
    }

    /* Smooth transitions para hover effects */
    .transition-all {
      transition: all 0.2s ease-in-out;
    }

    .hover\\:shadow-sm:hover {
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    }
    `
})
export class ChatListComponent implements OnInit {

  private readonly msg = inject(MessageGlobalService);

  @ViewChild('scrollContainer', { static: true }) scrollContainer!: ElementRef;

  chatListInbox: ChatListInbox[] = [];
  canScroll = false;
  isDragging = false;
  startX = 0;
  scrollStart = 0;
  search: string = "";
  isLoading: boolean = false;
  selectedFilter: FilterOptions | null = { label: 'Todos', value: 'all', icon: 'pi pi-envelope' };
  filterOptions: FilterOptions[] = [
    { label: 'Todos', value: 'all', icon: 'pi pi-envelope' },
    { label: 'No leídos', value: 'unread', icon: 'pi pi-envelope' },
    { label: 'Leídos', value: 'read', icon: 'pi pi-check' },
    { label: 'No resueltos', value: 'pendiente', icon: 'pi pi-exclamation-circle' },
    { label: 'Prioridad', value: 'prioridad', icon: 'pi pi-star' },
    { label: 'Finalizados', value: 'completado', icon: 'pi pi-check-circle' }
  ];
  channel : Channels = 'all';
  counterSeconds = 0;
  formattedTime = '00:00';
  private timer: any;
  private filters$ = new Subject<void>();
  private readonly authStore = inject(AuthStore);


  constructor(
    private channelRoomService: ChannelRoomService,
    private messageService: MessageService,
    private channelRoomSocketService: ChannelRoomSocketService,
    private router: Router,
    private route: ActivatedRoute
  ){
      this.filters$
      .pipe(
        debounceTime(300),
        switchMap(() => {

          this.isLoading = true;
          const filters = this.onChangeFilter();
          return this.channelRoomService.getChatSummary(filters);
        })
      )
      .subscribe(res => {
        this.chatListInbox = res;
        this.isLoading = false;
      });

  }

  ngOnInit(): void {
      console.log(this.authStore.user()?.role?.name == 'administrador')

    this.route.queryParamMap.subscribe((params) => {
      if (!params.get('channel')) {
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { channel: 'all' }
        });
        return
      }
      const channel = (params.get('channel')) as Channels;
      const lastChannel = this.channel
      this.channel = channel
      if(channel !== lastChannel){
        this.loadChatList()
      }
    });

    this.loadChatList()

    this.channelRoomSocketService.onChannelRoomStatusChanged().subscribe((payload) => {
      if (!payload || !this.chatListInbox.length) return;

      this.chatListInbox = this.chatListInbox
        .map((x) => {
          if (x.channelRoomId === payload.channelRoomId && x.attention.id === payload.assistanceId) {
            return { ...x, status: payload.status };
          }
          return x;
        })
        .filter((x) => {
          if (x.channelRoomId === payload.channelRoomId && x.attention.id === payload.assistanceId) {
            return false; // se quita
          }
          return true;
        });
    });


    this.channelRoomSocketService.onChatViewedReplies().subscribe((message: ChannelRoomViewStatusDto) => {
      if(this.chatListInbox.length){
        const index = this.chatListInbox.findIndex(c => c.channelRoomId === message.channelRoomId);
        this.chatListInbox[index] = {
          ...this.chatListInbox[index],
          unreadCount: this.chatListInbox[index].unreadCount - message.readCount,
          lastMessage: {
            ...this.chatListInbox[index].lastMessage,
            status: 'read'
          }
        }
      }
    })

    this.channelRoomSocketService.onNewMessage().subscribe((message: ChannelRoomNewMessageDto) => {
        this.updateChatList(message);
    });

    this.channelRoomSocketService.onAttentionDetailModified().subscribe((message: ChannelRoomAssistance) => {
      const index = this.chatListInbox.findIndex(c => c.attention.id === message.assistanceId);
      this.chatListInbox[index] = {
        ...this.chatListInbox[index],
        attention: {...this.chatListInbox[index].attention, attentionDetail: 'Value', consultTypeId: 0}
      };
    });

    this.channelRoomSocketService.onAdvisorChanged().subscribe((message: AdvisorChangedDto) => {
      const hasChannelRoomWithAdvisorChanged = this.chatListInbox.some(x => x.channelRoomId == message.channelRoomId)
      if(hasChannelRoomWithAdvisorChanged)
      {
        this.loadChatList()
      }else{
        if(message.id == this.authStore.user()?.id)
        {
            this.msg.info("Se te ha asignado un nuevo chat.", "¡Tienes un nuevo chat!", 8000);
            this.loadChatList();
        }
      }
    });

    this.channelRoomSocketService.onBotRepliesStatusChanged().subscribe((message: BotStatusChangedDto) => {
      const index = this.chatListInbox.findIndex(c => c.channelRoomId === message.channelRoomId);
      this.chatListInbox[index] = {
        ...this.chatListInbox[index],
        botStatus: message.botReplies ? "active": "paused"
      };
    });

    this.channelRoomSocketService.onAdvisorRequest().subscribe((payload: ChannelRoomAssistance) => {
      const index = this.chatListInbox.findIndex(c => c.channelRoomId === payload.channelRoomId && c.attention.id === payload.assistanceId);
      if(this.authStore.user()?.id === payload.userId)
      {

        this.showHelpRequest(payload);
        // this.msg.confirm('Un ciudadano solicitó un asesor, ¿Desea darle seguimiento?',
        //   ()=>{
        //
        //   },
        //   ()=>{},
        //   'Asesor solicitado.'
        // )
      }
      this.chatListInbox[index] = {
        ...this.chatListInbox[index],
        botStatus: "paused",
        status: 'prioridad'
      };
    })

  }
  loadChatList() {
      this.filters$.next();
  }

  onChangeFilter(): GetChannelSummaryDto {
  const filters: GetChannelSummaryDto = {
    channel: this.channel,
    messageStatus: null,
    chatStatus: 'pendiente',
    search: this.search,
  };

  if (this.selectedFilter) {
    const value = this.selectedFilter.value as string;

    if (['pendiente', 'completado', 'prioridad'].includes(value)) {
      filters.chatStatus = value as ChatStatus;
      filters.messageStatus = null; // ignorar messageStatus si chatStatus existe
    } else if (['unread', 'read'].includes(value)) {
      filters.messageStatus = value as MessageStatus;
      filters.chatStatus = null;
    }
  }

  return filters;
}


  updateChatList(message: ChannelRoomNewMessageDto) {
    try {
      console.log("se recibió un nuevo mensaje", message)

      let hasAttachment = false;
      const index = this.chatListInbox.findIndex(c => c.channelRoomId == message.channelRoomId
        && c.attention.id == message.attention.id
      );
      if(message?.attachments)
      {
        hasAttachment = message.attachments.length > 0
      }

      if (index > -1 ) {
        const chat = this.chatListInbox[index];
        chat.unreadCount += 1;
        chat.channel = message.channel,
        chat.botStatus = message.botStatus,
        chat.status = message.status,
        chat.attention.id = message.attention.id,
        chat.lastMessage = {
          citizen: {
            id: message.message.sender.id,
            phone: message.message.sender.phone,
            fullName: message.message.sender.fullName,
            name: message.message.sender.fullName || message.message.sender.alias || message.message.sender.phone,
            avatar: message.message.sender.avatar,
          },
          attention: message.attention,
          channelRoomId: message.channelRoomId,
          hasAttachment: hasAttachment,
          id: message.message.id,
          externalMessageId: message.message.externalMessageId,
          message: message.message.message,
          status: message.message.status,
          time: message.message.time,
          fromMe: message.message.fromMe
        };

        this.chatListInbox.splice(index, 1);
        this.chatListInbox.unshift(chat);

      } else {
        if((
            ['supervisor', 'administrador']
              .includes(this.authStore.user()?.role?.name??'') || this.authStore.user()?.id == message.advisor.id)
            && message.status !== 'completado' && (['unread', 'all'].includes(this.selectedFilter?.value?? '') || this.selectedFilter?.value == message.status))
        {
          console.log("paso exitosamente", message)
          let model : ChatListInbox = {
            unreadCount : message.unreadCount || 1,
            channelRoomId: message.channelRoomId,
            externalRoomId: message.externalRoomId,
            channel : message.channel,
            botStatus : message.botStatus,
            status : message.status,
            advisor: message.advisor,
            attention : message.attention,
            lastMessage : {
              citizen: {
                id: message.message.sender.id,
                phone: message.message.sender.phone,
                fullName: message.message.sender.fullName,
                name: message.message.sender.fullName || message.message.sender.alias || message.message.sender.phone,
                avatar: message.message.sender.avatar,
              },
              hasAttachment: hasAttachment,
              id: message.message.id,
              externalMessageId: message.message.externalMessageId,
              message: message.message.message,
              status: message.message.status,
              time: message.message.time,
              fromMe: message.message.fromMe
            }
          };
          this.chatListInbox.unshift(model);
        }
      }
    } catch (error) {
      console.log(error)
      this.loadChatList()
    }
  }


  showHelpRequest(data: ChannelRoomAssistance) {
    this.messageService.add({
    key: 'helpRequest',
      severity: 'info',
      summary: '¡Un ciudadano necesita tu ayuda!',
      detail: 'Un cliente está esperando atención inmediata.',
      sticky: true,
      closable: false,
      data: data
    });
  }

  onAttend(message: ChannelRoomAssistance, closeFn?: Function) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { channelRoomId: message.channelRoomId, assistanceId: message.assistanceId, channel:this.channel}
    });

    if (typeof closeFn === 'function') {
      closeFn();
    } else {
      this.messageService.clear('helpRequest');
    }
  }

  trackByChat(index: number, chat: ChatListInbox): string {
    return String(chat.attention.id);
  }
  ngAfterViewInit() {
    this.checkScroll();
  }

  getChannelIcon(channel: ChatListInbox['channel']): string {
    return ChannelLogo[channel] || 'fxemoji:question';
  }

  getChannelStatusIcon(channel: ChatListInbox['status']): string {
    return ChannelStatusIcon[channel] || 'fxemoji:question';
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScroll();
  }

  checkScroll() {
    const el = this.scrollContainer.nativeElement;
    this.canScroll = el.scrollWidth > el.clientWidth;
  }

  scrollLeft() {
    this.scrollContainer.nativeElement.scrollBy({ left: -150, behavior: 'smooth' });
  }

  scrollRight() {
    this.scrollContainer.nativeElement.scrollBy({ left: 150, behavior: 'smooth' });
  }

  startDrag(event: MouseEvent | TouchEvent) {
    this.isDragging = true;
    this.startX = this.getClientX(event);
    this.scrollStart = this.scrollContainer.nativeElement.scrollLeft;
  }

  onDrag(event: MouseEvent | TouchEvent) {
    if (!this.isDragging) return;
    const x = this.getClientX(event);
    const walk = x - this.startX;
    this.scrollContainer.nativeElement.scrollLeft = this.scrollStart - walk;
  }

  stopDrag() {
    this.isDragging = false;
  }

  navigateToChat(channelRoomId: number, assistanceId: number)
  {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { channelRoomId, channel:this.channel, assistanceId}
      });
  }
  formatId(id: number, length: number = 5): string {
    return id.toString().padStart(length, '0');
  }
  private getClientX(event: MouseEvent | TouchEvent): number {
    return event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
  }

  getElapsedSeconds(message: any): number {
    if (!message?.data?.createdAt) return 0;
    return Math.floor((Date.now() - message.data.createdAt) / 1000);
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }


}
