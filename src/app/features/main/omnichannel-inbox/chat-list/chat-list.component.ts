import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, HostListener, inject, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdvisorChangedDto, BotStatusChangedDto, ChannelAttentionStatusReverseTag, ChannelAttentionStatusTag, ChannelLogo, ChannelMessage, ChannelRoomNewMessageDto, ChannelRoomViewStatusDto, Channels, ChannelStatusIcon, ChannelStatusTag, ChatListInbox, ChatStatus, LastMessageReceived, MessageStatus } from '@interfaces/features/main/omnichannel-inbox/omnichannel-inbox.interface';
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
import { debounceTime, firstValueFrom, last, Subject, switchMap, takeUntil } from 'rxjs';
import { AuthStore } from '@stores/auth.store';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { MenuItem, MessageService, ToastMessageOptions } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { timeStamp } from 'console';
import { TooltipModule } from 'primeng/tooltip';
import { MenuModule } from 'primeng/menu';
import { InboxService } from '@services/inbox.service';
import { IBaseResponseDto } from '@interfaces/commons/base-response.interface';
import { ChannelStateService } from '@services/channel-state.service';
import { ChannelState } from '@models/channel-state.model';
import { MarkdownPipe } from '@pipes/markdown.pipe';


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
    MenuModule,
    // ButtonChannelComponent,
    // MarkdownPipe,
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
  styleUrls: ['./chat-list.component.scss']
})
export class ChatListComponent implements OnInit, OnDestroy {

  private readonly msg = inject(MessageGlobalService);
  private readonly authStore = inject(AuthStore);


  @ViewChild('scrollContainer', { static: true }) scrollContainer!: ElementRef;

  chatListInbox: ChatListInbox[] = [];
  canScroll = false;
  isDragging = false;
  startX = 0;
  scrollStart = 0;
  availableChannels: string[] = [];
  search: string = "";
  statusColor: string = "#484848ff";
  userStatus= 'Fuera de línea';
  statusOptions: MenuItem[] = [];


  isLoading: boolean = false;
  selectedFilter: FilterOptions | null = { label: 'No leídos', value: 'unread', icon: 'pi pi-envelope' };
  filterOptions: FilterOptions[] = [
    { label: 'Disponibles ', value: 'all', icon: 'pi pi-envelope' },
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
  private destroy$ = new Subject<void>();

  constructor(
    private channelRoomService: ChannelRoomService,
    private messageService: MessageService,
    private channelStateService : ChannelStateService,
    private channelRoomSocketService: ChannelRoomSocketService,
    private inboxService: InboxService,
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
          }),
          takeUntil(this.destroy$)  // AGREGAR ESTO
        )
        .subscribe(res => {
          this.chatListInbox = res;
          this.isLoading = false;
        });

  }

  async ngOnInit() {
      await this.getAvailableChannelsByUser()

      this.route.queryParamMap
        .pipe(takeUntil(this.destroy$))
        .subscribe(async (params) => {
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
        await this.getUserStatusesByChannel(this.channel)
        await this.getCurrrentStatusByUser(this.channel)
        if(channel !== lastChannel){
          this.loadChatList()
        }
      });

      this.loadChatList()


      if(this.availableChannels.length > 0 || ['administrador', 'supervisor'].includes(this.authStore.user()?.role?.name?? ''))
      {
        this.channelRoomSocketService.onChannelRoomStatusChanged()
        .pipe(takeUntil(this.destroy$))
        .subscribe((payload) => {
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


        this.channelRoomSocketService.onChatViewedReplies()
        .pipe(takeUntil(this.destroy$))
        .subscribe((message: ChannelRoomViewStatusDto) => {
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

        this.channelRoomSocketService.onNewMessage()
        .pipe(takeUntil(this.destroy$))
        .subscribe((message: ChannelRoomNewMessageDto) => {
          if(!this.availableChannels.includes(message.channel) && !['administrador', 'supervisor'].includes(this.authStore.user()?.role?.name?? '')) return
          this.updateChatList(message);
        });

        this.channelRoomSocketService.onAttentionDetailModified()
        .pipe(takeUntil(this.destroy$))
        .subscribe((message: ChannelRoomAssistance) => {
          const index = this.chatListInbox.findIndex(c => c.attention.id === message.assistanceId);
          this.chatListInbox[index] = {
            ...this.chatListInbox[index],
            attention: {...this.chatListInbox[index]?.attention, attentionDetail: 'Value', consultTypeId: 0}
          };
        });

        this.channelRoomSocketService.onAdvisorChanged()
        .pipe(takeUntil(this.destroy$))
        .subscribe((message: AdvisorChangedDto) => {
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

        this.channelRoomSocketService.onBotRepliesStatusChanged()
        .pipe(takeUntil(this.destroy$))
        .subscribe((message: BotStatusChangedDto) => {
          const index = this.chatListInbox.findIndex(c => c.channelRoomId === message.channelRoomId);
          this.chatListInbox[index] = {
            ...this.chatListInbox[index],
            botStatus: message.botReplies ? "active": "paused"
          };
        });

        this.channelRoomSocketService.onAdvisorRequest()
        .pipe(takeUntil(this.destroy$))
        .subscribe((payload: ChannelRoomAssistance) => {
          const index = this.chatListInbox.findIndex(c => c.channelRoomId === payload.channelRoomId && c.attention.id === payload.assistanceId);
          if(this.authStore.user()?.id === payload.userId || ['supervisor','administrador'].includes(this.authStore.user()?.role?.name??''))
          {
            if(this.authStore.user()?.id === payload.userId )
            {
              this.showHelpRequest(payload);
            }
            this.loadChatList();
          }
          this.chatListInbox[index] = {
            ...this.chatListInbox[index],
            botStatus: "paused",
            status: 'prioridad'
          };
        })
      }


    }
    loadChatList() {
        this.filters$.next();
    }

    onChangeFilter(): GetChannelSummaryDto {
      const filters: GetChannelSummaryDto = {
        channel: this.channel,
        messageStatus: 'unread',
        chatStatus: 'pendiente',
        search: this.search,
        allChats: false
      };

      if (this.selectedFilter) {
        const filter = this.selectedFilter.value as string;

        switch (filter) {
          case 'all':
            filters.allChats = true
            filters.chatStatus = null;
            filters.messageStatus = null
            break;
          case 'pendiente':
          case 'completado':
          case 'prioridad':
            filters.allChats = false;
            filters.chatStatus = filter as ChatStatus;
            filters.messageStatus = null
            break;
          case 'unread':
          case 'read':
            filters.allChats = false;
            filters.chatStatus = null
            filters.messageStatus = filter as MessageStatus;
            break;
          default:
            break;
        }
      }
      return filters;
    }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.timer) {
      clearInterval(this.timer);
    }

    this.chatListInbox = [];
    this.search = '';

    this.isLoading = false;
    this.canScroll = false;
    this.isDragging = false;
    this.counterSeconds = 0;

    this.selectedFilter = null;
    this.channel = 'all' as Channels;
    this.formattedTime = '00:00';

    this.filters$.complete();

    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.innerHTML = '';
    }

  }

  updateChatList(message: ChannelRoomNewMessageDto) {
    try {

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

        if (
          (this.channel == message.channel || this.channel == 'all') &&
          (this.selectedFilter?.value == 'all' && message?.advisor?.id == null ) &&
          (
            this.selectedFilter?.value === 'all' ||
            this.authStore.user()?.id === message?.advisor?.id ||
            ['supervisor', 'administrador'].includes(this.authStore.user()?.role?.name ?? '')
          ) &&
          message?.attention?.status !== 'closed' &&
          (
            this.selectedFilter?.value === 'all' || (
              message.advisor?.id != null &&
              (
                ['unread', 'all'].includes(this.selectedFilter?.value ?? '') ||
                this.selectedFilter?.value === this.getChannelAttentionStatusReverseTag(message.attention.status)
              )
            )
          )
        )
        {
          let model : ChatListInbox = {
            unreadCount : message.unreadCount || 1,
            channelRoomId: message.channelRoomId,
            externalRoomId: message.externalRoomId,
            channel : message.channel,
            botStatus : message.botStatus,
            status : message.status,
            advisor: message?.advisor,
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
      console.error(error)
      this.loadChatList()
    }
  }
  isToday(date: Date | string): boolean {
    const d = new Date(date);
    const today = new Date();
    return d.getDate() === today.getDate() &&
          d.getMonth() === today.getMonth() &&
          d.getFullYear() === today.getFullYear();
  }

  showHelpRequest(data: ChannelRoomAssistance) {
    this.messageService.add({
    key: 'helpRequest',
    severity: 'info',
    summary: '¡Un ciudadano necesita tu ayuda!',
    detail: 'Un ciudadano está esperando atención inmediata.',
    sticky: true,
    closable: false,
    data: data
    });
  }

  onAttend(message: ToastMessageOptions, closeFn?: Function) {
    try {
      this.messageService.clear('helpRequest');

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          channelRoomId: message.data.channelRoomId,
          assistanceId: message.data.assistanceId,
          channel: this.channel
        }
      });
    } catch (err) {
      console.error('Error en onAttend:', err);
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

  getChannelStatusIcon(channel: ChatListInbox['attention']['status']): string {
    return ChannelStatusIcon[channel] || 'fxemoji:question';
  }

  getChannelStatusLabel(channel: ChatListInbox['attention']['status']): string {
    return ChannelAttentionStatusTag[channel] || '';
  }

  getChannelAttentionStatusReverseTag(status: ChatListInbox['attention']['status']): string {
    return ChannelAttentionStatusReverseTag[status] || 'pendiente';
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
  getUserRole(){
    return this.authStore.user()?.role?.name?? ''
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

  async getCurrrentStatusByUser(channel: string): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.inboxService.getUserStatus(channel)
      );

      const statusLabel = this.statusOptions.find(
        (x: MenuItem) =>
          x.id === response.data?.userStatus || x.label === response.data?.userStatus
      );
      this.userStatus = statusLabel?.label ?? 'Fuera de línea';
      this.statusColor = response?.data?.color?? '#484848ff';
    } catch (error) {
      console.error('Error al obtener el estado del usuario:', error);
    }
  }

  async getUserStatusesByChannel(channel: string): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.channelStateService.getUserStatusesByChannel(channel)
      );

      if (response?.data && response.data.length > 0) {
        this.statusOptions = response.data.map((channelState: ChannelState) => ({
          id: channelState.id.toString(),
          label: channelState.name,
          value: channelState.id,
          command: () => this.changeUserStatus(null, channelState.id),
        }));
      } else {
        this.statusOptions = [
          {
            id: 'Disponible',
            label: 'Disponible',
            value: 'available',
            icon: 'pi pi-envelope',
            command: () => this.changeUserStatus(true),
          },
          {
            id: 'Fuera de línea',
            label: 'Fuera de línea',
            value: 'unavailable',
            icon: 'pi pi-envelope',
            command: () => this.changeUserStatus(false),
          },
        ];
      }
    } catch (error) {
      console.error('Error al obtener estados por canal:', error);
    }
  }

  async getAvailableChannelsByUser() {
    try {
      const response = await firstValueFrom(this.inboxService.getAvailableChannelsByUser());
      if (response?.success && response?.data?.length) {
        this.availableChannels = response.data.filter(x =>
          ['whatsapp', 'chatsat', 'telegram'].includes(x)
        );
      }
    } catch (err) {
      console.error('❌ Error al obtener canales:', err);
    }
  }


  getUserStatuses()
  {

  }

  changeUserStatus(isAvailable: boolean | null = null , statusId: number | null = null)
  {
    this.inboxService.changeAllUserStatus({
      channel: this.channel,
      channelStateId: statusId,
      isAvailable
    }).subscribe(response => {
      if(response.success)
      {
        this.msg.success("Su estado ha sido actualizado correctamente.", "Estado del asesor", 5000)
        this.getCurrrentStatusByUser(this.channel)
        return
      }else{
        if(response?.error)
        {
          console.error(response.error)
          this.msg.error("Su estado no ha podido ser actualizado, por favor contacte a soporte", "Estado del asesor", 5000)
          return
        }
        this.msg.warn("Su estado no ha podido ser actualizado", "Estado del asesor", 5000)
      }
    });
  }

}
