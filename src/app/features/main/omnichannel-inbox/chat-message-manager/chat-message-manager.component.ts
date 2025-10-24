import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ViewChild,
  ElementRef,
  inject,
  OnDestroy,
  NgZone,
} from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { FormsModule } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { TagModule } from 'primeng/tag';
import { ContextMenuService, MenuItem, MessageService } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { DialogModule } from 'primeng/dialog';
import { ProgressBarModule } from 'primeng/progressbar';
import {
  AdvisorChangedDto,
  ChannelAttentionStatus,
  ChannelAttentionStatusReverse,
  ChannelAttentionStatusTag,
  ChannelAttentionStatusTagType,
  ChannelCitizenSummariesDto,
  ChannelLogo,
  ChannelMessage,
  Channels,
  ChannelStatusTag,
  ChatDetail,
  ChatStatus,
  getAdvisorsResponseDto,
} from '@interfaces/features/main/omnichannel-inbox/omnichannel-inbox.interface';
import {
  changeChannelRoomStatusDto,
  ChannelRoomService,
  ToogleBotServicesDto,
} from '@services/channel-room.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ChannelRoomAssistance,
  ChannelRoomSocketService,
} from '@services/channel-room-socket.service';
import {
  ChannelRoomMessageService,
  CreateChannelAgentMessageDto,
} from '@services/channel-room-message.service';
import { PhoneFormatPipe } from '@pipes/phone-format.pipe';
import { AdvisorComponent, TransferToAdvisorResponseDto } from '@shared/modal/advisor/advisor.component';
import { MarkdownPipe } from '@pipes/markdown.pipe';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { DropdownModule } from 'primeng/dropdown';
import { AssistancesHistoryModalComponent } from '@shared/modal/multi-channel-chat/assistances-history.component';
import { IBaseResponseDto } from '@interfaces/commons/base-response.interface';
import { ChannelAttentionService } from '@services/channel-attention.service';
import { PredefinedResponses } from '@models/predefined-response.model';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PredefinedResponsesService } from '@services/predefined.service';
import { DialogService } from 'primeng/dynamicdialog';
import { FormAssistanceComponent } from '@features/main/mail/form-assistance/form-assistance.component';
import { FormAttentionComponent } from '../form-attention/form-attention.component';
import { Subject, takeUntil, timestamp } from 'rxjs';
import { TooltipModule } from 'primeng/tooltip';
import { AuthStore } from '@stores/auth.store';
import { ThemeUtils } from '@primeng/themes';

export interface Attachment {
  type: 'file' | 'image';
  extension?: string | null;
  content?: string | null;
  name?: string | null;
}

interface AttachmentPreview extends Attachment {
  file: File;
  preview?: string;
  loading?: boolean;
  id: string;
}

@Component({
  selector: 'app-chat-message-manager',
  imports: [
    CardModule,
    ButtonModule,
    AssistancesHistoryModalComponent,
    MenuModule,
    InputTextModule,
    DividerModule,
    DropdownModule,
    FormsModule,
    SelectButtonModule,
    PhoneFormatPipe,
    CommonModule,
    AvatarModule,
    OverlayBadgeModule,
    AdvisorComponent,
    MarkdownPipe,
    TooltipModule,
    TagModule,
    DialogModule,
    ProgressBarModule,
    OverlayPanelModule,
  ],
  templateUrl: './chat-message-manager.component.html',
  providers: [ContextMenuService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrl: './chat-message-manager.component.scss',
})
export class ChatMessageManagerComponent implements OnDestroy {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('fileInput') private fileInput!: ElementRef;
  private readonly msg = inject(MessageGlobalService);
  private readonly dialogService = inject(DialogService);
  private readonly authStore = inject(AuthStore);

  chatDetail: ChatDetail | null = null;
  advisors: getAdvisorsResponseDto[] = [];
  channelRoomId: number | null = null;
  assintanceId: number | null = null;
  messageText: string = '';
  completionEventReceived: boolean = false;
  isLoading: boolean = false;
  showTransferModal = false;
  showChaneStatusModal = false;
  chatDeleted = false;
  attachments: AttachmentPreview[] = [];
  showAttachmentsDialog = false;
  typingIndicatorEmitted = false;
  isDragOver = false;
  uploadingFiles = false;
  isBotBlocked = false
  private isInitialLoad = false;
  private hasScrolledToBottom = false;
  private isLoadingOlderMessages = false;
  private scrollThreshold = 100;
  private lastScrollTop = 0;
  private scrollDirection = 'down';
  private scrollLocked = false; // Nueva propiedad para bloquear scroll durante carga
  showImageModal = false;
  selectedImage: Attachment | null = null;
  selectedNewStatus: ChatStatus | null = null;
  updatingStatus = false;
  newMessages = false;
  showScrollButton = false;
  unreadMessagesCount = 0;
  private typingTimeout?: ReturnType<typeof setTimeout>;
  private TYPING_INDICATOR_DELAY = 3000;
  private isNearBottom = true;
  private bottomThreshold = 150;
  statusOptions = [
    { label: 'Completado', value: 'completado' },
    { label: 'Pendiente', value: 'pendiente' },
    { label: 'Prioridad', value: 'prioridad' },
  ];
  private readonly MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
  showHistorial = false;
  // NUEVA PROPIEDAD para respuestas predefinidas
  predefinedResponses: PredefinedResponses[] = [];
  private destroy$ = new Subject<void>();
  items: MenuItem[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private channelRoomService: ChannelRoomService,
    private channelRoomMessageService: ChannelRoomMessageService,
    private channelAttentionService: ChannelAttentionService,
    private channelRoomSocketService: ChannelRoomSocketService,
    private predefinedResponsesService: PredefinedResponsesService,
    private ngZone: NgZone
  ) {
  }



  abrirHistorial() {
    this.showHistorial = true;
  }

  handleEvent(event: boolean) {
    this.showHistorial = event;
  }
  ngOnInit() {
    this.route.queryParamMap
    .pipe(takeUntil(this.destroy$))
    .subscribe((params) => {
      this.completionEventReceived = false;
      if (!params.get('channelRoomId') || !params.get('assistanceId')) {
        this.chatDetail = null;
        return;
      }
      const channelRoomId = params.get('channelRoomId');
      this.channelRoomId = Number(channelRoomId);
      const assintanceId = params.get('assistanceId');
      this.assintanceId = Number(assintanceId);
      this.loadChatData();
    });
    setInterval(() => {
      this.ngZone.run(() => {}); // fuerza change detection
    }, 1000);

    this.channelRoomSocketService
    .onChannelRoomStatusChanged()
    .pipe(takeUntil(this.destroy$))
    .subscribe((payload) => {
        if (
          payload &&
          this.chatDetail &&
          this.chatDetail?.channelRoomId === payload.channelRoomId &&
          this.chatDetail.attention.id === payload.assistanceId
        ) {
          this.chatDetail.status = payload.status;
          this.chatDetail.attention.status = payload.attentionStatus;
          if (payload.status === 'completado') {
            this.completionEventReceived = true;
            this.router.navigate([], {
              relativeTo: this.route,
              queryParams: {
                channel: this.route.snapshot.queryParams['channel'],
              },
              queryParamsHandling: '',
            });
          }
        }
      });
    this.channelRoomSocketService.onAttentionDetailModified()
      .pipe(takeUntil(this.destroy$))
      .subscribe((message: ChannelRoomAssistance) => {
        if(message.assistanceId == this.chatDetail?.attention.id)
        {
          this.loadChatData()
        }
      });

    this.channelRoomSocketService
    .onAdvisorRequest()
    .pipe(takeUntil(this.destroy$))
    .subscribe((payload: ChannelRoomAssistance) => {
        if (
          this.channelRoomId === payload.channelRoomId &&
          this.assintanceId === payload.assistanceId
        ) {
          this.chatDetail = {
            ...this.chatDetail,
            botStatus: 'paused',
            status: 'prioridad',
          } as ChatDetail;
        }
      });

    this.channelRoomSocketService
    .onAdvisorChanged()
    .pipe(takeUntil(this.destroy$))
    .subscribe((message: AdvisorChangedDto) => {
      let hasChannelRoomWithAdvisorChanged = message.channelRoomId == this.chatDetail?.channelRoomId && message.attentionId == this.chatDetail.attention.id;
      if(hasChannelRoomWithAdvisorChanged)
      {
        this.loadChatData();
      }
    });
    this.channelRoomSocketService
    .onNewMessage()
    .pipe(takeUntil(this.destroy$))
    .subscribe((message) => {
      let messageIncoming = message.message;

      if (
        this.channelRoomId === message.channelRoomId &&
        this.assintanceId === message.attention.id
      ) {
        this.chatDetail?.messages.push({
          id: messageIncoming.id,
          content: messageIncoming.message,
          externalMessageId: messageIncoming.externalMessageId,
          attachments: messageIncoming.attachments,
          sender: {
            id: messageIncoming.id,
            fromCitizen: messageIncoming.sender.fromCitizen,
            fullName: messageIncoming.sender.fullName,
            alias: messageIncoming.sender.alias,
            avatar: messageIncoming.sender.avatar,
            phone: messageIncoming.sender.phone,
            isAgent: messageIncoming.sender.isAgent,
          },
          status: messageIncoming.status,
          time: messageIncoming.time,
        });

        if (!this.isNearBottom) {
          this.unreadMessagesCount++;
        } else {
          requestAnimationFrame(() => {
            this.handleScrollDown();
          });
        }
        if(!this.chatDetail?.agentAssigned?.id) return
        this.channelRoomSocketService.onChatViewed(this.channelRoomId);
      }
    });
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    if (this.messagesContainer) {
      this.messagesContainer.nativeElement.innerHTML = '';
    }

    this.chatDetail = null;
    this.advisors = [];
    this.messageText = '';
    this.attachments = [];
    this.predefinedResponses = [];

    this.isLoading = false;
    this.showTransferModal = false;
    this.showChaneStatusModal = false;
    this.showAttachmentsDialog = false;
    this.showImageModal = false;
    this.showScrollButton = false;
    this.showHistorial = false;
    this.uploadingFiles = false;
    this.isDragOver = false;
    this.typingIndicatorEmitted = false;
    this.completionEventReceived = false;
    this.updatingStatus = false;
    this.newMessages = false;
    this.unreadMessagesCount = 0;
    this.isInitialLoad = false;
    this.hasScrolledToBottom = false;
    this.scrollLocked = false;
    this.isLoadingOlderMessages = false;
    this.isNearBottom = true;
    this.selectedImage = null;
    this.selectedNewStatus = null;
    this.channelRoomId = null;
    this.assintanceId = null;

    const links = document.querySelectorAll('a[href^="blob:"]');
    links.forEach(link => {
      window.URL.revokeObjectURL((link as HTMLAnchorElement).href);
    });

    this.items = [];

  }

  sendEmailWithConversation() {
    if (this.chatDetail?.attention.id) {
      this.channelAttentionService
        .sendEmailWithConversation(this.chatDetail?.attention.id)
        .subscribe((response: IBaseResponseDto) => {
          if (response.success) {
            this.msg.success(
              'La conversación fue enviada al usuario correctamente.',
              'Correo enviado',
              3000
            );
          } else {
            this.msg.error(
              response.error ??
                'Hubo un error con el servidor. Por favor, contacte a soporte para tener mayor información.',
              'Correo no enviado',
              3000
            );
          }
        });
    } else {
      this.msg.error(
        'No existe asistencia.',
        'Asegurese de estar en un chat para poder utilizar esta función',
        3000
      );
    }
  }
  // Método de scroll SOLO para infinite scroll hacia arriba
  onScroll(event: Event) {
    const element = event.target as HTMLElement;
    if (!element) return;

    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;

    // Detectar dirección del scroll
    this.scrollDirection = scrollTop > this.lastScrollTop ? 'down' : 'up';
    this.lastScrollTop = scrollTop;

    // Calcular si está cerca del final
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
    this.isNearBottom = distanceFromBottom <= this.bottomThreshold;

    // Mostrar/ocultar botón y resetear contador
    if (this.isNearBottom) {
      this.showScrollButton = false;
      this.unreadMessagesCount = 0;
    } else {
      this.showScrollButton = true;
    }

    // Solo procesar carga de mensajes si ya terminó la carga inicial y no está bloqueado
    if (this.isInitialLoad || !this.hasScrolledToBottom || this.scrollLocked) {
      return;
    }

    // Cargar mensajes anteriores
    const isNearTop = scrollTop <= this.scrollThreshold;
    const isScrollingUp = this.scrollDirection === 'up';

    if (
      isNearTop &&
      isScrollingUp &&
      this.chatDetail?.hasMore &&
      !this.isLoadingOlderMessages &&
      this.chatDetail.messages.length > 0
    ) {
      this.loadOlderMessages();
    }
  }

  private async loadOlderMessages() {
    if (
      !this.chatDetail ||
      !this.chatDetail.hasMore ||
      this.isLoadingOlderMessages
    ) {
      return;
    }

    const oldestMessage = this.chatDetail.messages[0];
    if (!oldestMessage) return;

    // BLOQUEAR SCROLL durante la carga
    this.isLoadingOlderMessages = true;
    this.scrollLocked = true;

    const messagesContainer = this.messagesContainer.nativeElement;
    const oldScrollHeight = messagesContainer.scrollHeight;
    const oldScrollTop = messagesContainer.scrollTop;

    try {
      this.channelRoomService
        .getChatData(
          this.channelRoomId as number,
          this.assintanceId as number,
          15,
          oldestMessage.timestamp
        )
        .subscribe({
          next: (response) => {
            if (response.messages && response.messages.length > 0) {
              this.chatDetail!.messages = [
                ...response.messages,
                ...this.chatDetail!.messages,
              ];
              this.chatDetail!.hasMore = response.hasMore;

              // Restaurar posición sin scroll automático
              requestAnimationFrame(() => {
                const newScrollHeight = messagesContainer.scrollHeight;
                const heightDifference = newScrollHeight - oldScrollHeight;
                messagesContainer.scrollTop = oldScrollTop + heightDifference;

                // DESBLOQUEAR SCROLL después de restaurar posición
                setTimeout(() => {
                  this.scrollLocked = false;
                }, 100);
              });
            } else {
              this.chatDetail!.hasMore = false;
              this.scrollLocked = false;
            }
          },
          error: (error) => {
            console.error('Error cargando mensajes:', error);
            this.scrollLocked = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudieron cargar los mensajes anteriores',
              life: 3000,
            });
          },
          complete: () => {
            this.isLoadingOlderMessages = false;
          },
        });
    } catch (error) {
      console.error('Error en loadOlderMessages:', error);
      this.isLoadingOlderMessages = false;
      this.scrollLocked = false;
    }
  }

  handleScrollDown() {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.style.scrollBehavior = 'smooth';
      element.scrollTop = element.scrollHeight;

      this.showScrollButton = false;
      this.unreadMessagesCount = 0;
      this.isNearBottom = true;

      setTimeout(() => {
        element.style.scrollBehavior = 'auto';
      }, 500);
    }
  }

  onTextareaKeydown(event: KeyboardEvent) {
    // Ctrl+Enter o Cmd+Enter para enviar mensaje
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      this.sendMessage();
    }
    // Enter solo para nueva línea (comportamiento por defecto)
  }
  onTextareaInput(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;

    // Emit typing indicator con debounce
    if (!this.typingIndicatorEmitted) {
      this.emitTypingIndicator();
    } else {
      // Reinicia el temporizador cada vez que el usuario sigue escribiendo
      clearTimeout(this.typingTimeout);
      this.typingTimeout = setTimeout(() => {
        this.typingIndicatorEmitted = false;
      }, this.TYPING_INDICATOR_DELAY);
    }

    // --- Auto resize textarea ---
    textarea.style.height = 'auto';
    const minHeight = 44;
    const maxHeight = 120;
    const newHeight = Math.min(
      Math.max(textarea.scrollHeight, minHeight),
      maxHeight
    );
    textarea.style.height = `${newHeight}px`;
  }

  private emitTypingIndicator() {
    this.channelRoomSocketService.enableTypingIndicator({
      channelRoomId: this.chatDetail?.channelRoomId as number,
      assistanceId: this.chatDetail?.attention.id as number,
      citizenId: this.chatDetail?.citizen?.id as number,
      userId: this.chatDetail?.agentAssigned?.id,
    });

    this.typingIndicatorEmitted = true;

    // auto desactivar después de delay
    this.typingTimeout = setTimeout(() => {
      this.typingIndicatorEmitted = false;
    }, this.TYPING_INDICATOR_DELAY);
  }

  // Método para ver imagen en tamaño completo
  viewFullImage(attachment: Attachment) {
    this.selectedImage = attachment;
    this.showImageModal = true;
  }

  // Método para cerrar el modal de imagen
  closeImageModal() {
    this.showImageModal = false;
    this.selectedImage = null;
  }

  // Método que se ejecuta cuando la imagen se carga (opcional)
  onImageLoad(event: Event) {
    const img = event.target as HTMLImageElement;
  }

  // Método para descargar archivo
  downloadAttachment(attachment: Attachment) {
    try {
      if (!attachment.content) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se puede descargar el archivo',
          life: 3000,
        });
        return;
      }

      const byteCharacters = atob(attachment.content);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      let mimeType = 'application/octet-stream';
      let fileName = 'archivo';

      if (attachment.type === 'image') {
        mimeType = `image/${attachment.extension || 'jpeg'}`;
        fileName = `imagen.${attachment.extension || 'jpg'}`;
      } else {
        // Determinar MIME type basado en extensión
        const ext = attachment.extension?.toLowerCase();
        fileName = `archivo.${ext || 'file'}`;

        switch (ext) {
          case 'pdf':
            mimeType = 'application/pdf';
            break;
          case 'doc':
            mimeType = 'application/msword';
            break;
          case 'docx':
            mimeType =
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            break;
          case 'xls':
            mimeType = 'application/vnd.ms-excel';
            break;
          case 'xlsx':
            mimeType =
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            break;
          case 'txt':
            mimeType = 'text/plain';
            break;
          case 'zip':
            mimeType = 'application/zip';
            break;
          case 'rar':
            mimeType = 'application/x-rar-compressed';
            break;
        }
      }

      const blob = new Blob([byteArray], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      this.messageService.add({
        severity: 'success',
        summary: 'Descarga iniciada',
        detail: `Se está descargando: ${fileName}`,
        life: 3000,
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error de descarga',
        detail: 'No se pudo descargar el archivo',
        life: 5000,
      });
    }
  }

  getChannelStatusTag(status?: ChatDetail['attention']['status']): string {
    if (!status) return 'secondary';
    return ChannelAttentionStatusTagType[status];
  }

  getChannelStatusTrad(status?: ChatDetail['attention']['status']): string {
    if (!status) return 'secondary';
    return ChannelAttentionStatusTag[status];
  }

  getChannelStatusReverse(status?: ChatStatus): ChannelAttentionStatus {
    if (!status) return 'in_progress';
    return ChannelAttentionStatusReverse[status];
  }

  loadChatData() {
    this.isInitialLoad = true;
    this.hasScrolledToBottom = false;
    this.scrollLocked = false;
    this.showScrollButton = false;
    this.unreadMessagesCount = 0;
    this.isNearBottom = true;
    this.isLoading = true;

    if (!this.channelRoomId || !this.assintanceId) {
      return;
    }

    this.channelRoomService
      .getChatData(
        this.channelRoomId as number,
        this.assintanceId as number,
        30
      )
      .subscribe({
        next: (response) => {
          this.chatDetail = response;
          this.loadPredefinedResponses();

          if (this.chatDetail.messages.length) {
            if(response?.agentAssigned?.id)
            {
              this.channelRoomSocketService.onChatViewed(response.channelRoomId);
            }

            requestAnimationFrame(() => {
              this.scrollToBottomInstant();

              setTimeout(() => {
                this.isInitialLoad = false;
                this.hasScrolledToBottom = true;
                this.isNearBottom = true;
              }, 300);
            });
          }
          this.items = this.getItemsByStatus(response.status);
        },
        error: (error) => {
          console.error('Error loading chat data:', error);
          this.isInitialLoad = false;
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  private getItemsByStatus(status: ChatStatus) {
    let commonItems = [
      { label: 'Enviar al correo', icon: 'pi pi-refresh', command: () => this.sendEmailWithConversation() },
      { label: 'Ver historial de chats', icon: 'pi pi-refresh', command: () => this.abrirHistorial() },
    ];
    if(this.chatDetail && !this.chatDetail?.attention?.attentionDetail && !this.chatDetail?.attention?.consultTypeId)
    {
      commonItems.unshift({ label: 'Detalle de atención', icon: 'pi pi-refresh', command: () => this.showFormDetail() })
    }

    if (status === 'completado') return commonItems;

    if (!this.chatDetail?.agentAssigned?.id) {
      let items = [
        { label: 'Finalizar Atención', icon: 'pi pi-check-circle', command: () => this.finalizeConversation() },
        ...commonItems,
      ];
      if(!['administrador','supervisor'].includes(this.authStore.user()?.role?.name??''))
      {
        items.splice(1, 0, { label: 'Asignarme este caso', icon: 'pi pi-users', command: () => this.assignMyself() })
      }else{
        items.splice(1, 0, { label: 'Transferir caso', icon: 'pi pi-users', command: () => this.openTransferModal()})
      }
      return items;
    }

    return [
      {
        label: 'Acciones del Chat',
        items: [
          { label: 'Finalizar Atención', icon: 'pi pi-check-circle', command: () => this.finalizeConversation() },
          { label: 'Transferir caso', icon: 'pi pi-users', command: () => this.openTransferModal() },
          { label: 'Establecer Prioridad', icon: 'pi pi-flag', command: () => this.openChannelStatusModal() },
          { separator: true },
          ...commonItems,
        ],
      },
    ];
  }


  private scrollToBottomSmooth() {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  private scrollToBottom() {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      // Scroll instantáneo sin animación
      element.style.scrollBehavior = 'auto';
      element.scrollTop = element.scrollHeight;
    }
  }

  get isLoadingMoreMessages(): boolean {
    return this.isLoadingOlderMessages;
  }

  private scrollToBottomInstant() {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.style.scrollBehavior = 'auto';
      element.scrollTop = element.scrollHeight;
      this.isNearBottom = true;
    }
  }

  getChannelIcon(channel?: ChatDetail['channel']): string {
    if (!channel) return 'fxemoji:question';
    return ChannelLogo[channel];
  }
  async sendMessage() {
    if (!this.messageText.trim() && this.attachments.length === 0) return;

    const messageToSend = this.messageText;
    const attachmentsToSend: Attachment[] = this.attachments.map((att) => ({
      type: att.type,
      extension: att.extension,
      content: att.content,
      name: att.file.name,
    }));

    const messageDto: CreateChannelAgentMessageDto = {
      channel: this.chatDetail?.channel!,
      assistanceId: this.chatDetail?.attention.id!,
      channelRoomId: this.chatDetail?.channelRoomId!,
      message: messageToSend,
      phoneNumberReceiver: this.chatDetail?.citizen?.phone!,
      externalChannelRoomId: this.chatDetail?.externalRoomId,
      phoneNumber: this.chatDetail?.agentAssigned?.phoneNumber,
      attachments: attachmentsToSend,
    };

    this.channelRoomMessageService.sendMessage(messageDto).subscribe({
      next: (res) => {
        this.messageText = '';
        this.attachments = [];

        const textarea = document.querySelector(
          'textarea'
        ) as HTMLTextAreaElement;
        if (textarea) {
          textarea.style.height = 'auto';
        }
        if (!this.isNearBottom) {
          this.unreadMessagesCount++;
        }

        requestAnimationFrame(() => {
          this.handleScrollDown();
        });
        // NO hacer scroll automático
      },
      error: (err) => {
        console.error('Error enviando mensaje:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo enviar el mensaje',
          life: 5000,
        });
      },
    });
  }

  openFileDialog() {
    this.fileInput.nativeElement.click();
  }

  openAttachmentsDialog() {
    this.showAttachmentsDialog = true;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
    }
    input.value = '';
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      this.isDragOver = false;
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    const files = Array.from(event.dataTransfer?.files || []);
    if (files.length > 0) {
      this.handleFiles(files);
      this.showAttachmentsDialog = true;
    }
  }

  private async handleFiles(files: File[]) {
    for (const file of files) {
      if (file.size > this.MAX_FILE_SIZE) {
        this.messageService.add({
          severity: 'error',
          summary: 'Archivo muy grande',
          detail: `El archivo "${file.name}" excede el límite de 20MB`,
          life: 5000,
        });
        continue;
      }

      const attachmentPreview: AttachmentPreview = {
        id: this.generateId(),
        file: file,
        type: this.getFileType(file),
        extension: this.getBlobFileExtension(file),
        content: null,
        loading: true,
      };

      this.attachments.push(attachmentPreview);

      try {
        const base64 = await this.fileToBase64(file);
        attachmentPreview.content = base64;
        attachmentPreview.loading = false;
      } catch (error) {
        console.error('Error converting file to base64:', error);
        this.removeAttachment(attachmentPreview.id);
        this.messageService.add({
          severity: 'error',
          summary: 'Error de conversión',
          detail: `No se pudo procesar el archivo "${file.name}"`,
          life: 5000,
        });
      }
    }
  }


  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  }

  private getFileType(file: File): 'file' | 'image' {
    return file.type.startsWith('image/') ? 'image' : 'file';
  }

  private getBlobFileExtension(file: File): string {
    return file.name.split('.').pop()?.toLowerCase() || '';
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  removeAttachment(id: string) {
    this.attachments = this.attachments.filter((att) => att.id !== id);
  }

  getFileIcon(extension: string): string {
    const ext = extension.toLowerCase();
    switch (ext) {
      case 'pdf':
        return 'vscode-icons:file-type-pdf2';
      case 'doc':
      case 'docx':
        return 'hugeicons:google-doc';
      case 'csv':
      case 'xls':
      case 'xlsx':
        return 'vscode-icons:file-type-excel2';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'fluent-color:image-28';
      case 'zip':
        return 'streamline-flex-color:zip-folder';
      default:
        return 'streamline-plump-color:email-attachment-document';
    }
  }

  getFileIconClass(extension: string): string {
    const ext = extension.toLowerCase();
    switch (ext) {
      case 'pdf':
        return 'pdf';
      case 'doc':
      case 'docx':
        return 'doc';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'image';
      default:
        return 'default';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  showFormDetail(reintentFinalization: boolean = false)
  {
    const ref = this.dialogService.open(FormAttentionComponent, {
      header: 'Registro de Atención',
      styleClass: 'modal-lg',
      modal: true,
      data:{
        attentionDetail: this.chatDetail?.attention?.attentionDetail,
        consultTypeId: this.chatDetail?.attention?.consultTypeId
      },
      focusOnShow: false,
      dismissableMask: false,
      closable: true,
    });

    ref.onClose.subscribe((res: {consultTypeId: number, attentionDetail: string}) => {
      if (res) {
        if(this.chatDetail)
        {
          this.chatDetail.attention = {
              ...this.chatDetail?.attention,
              attentionDetail: res.attentionDetail,
              consultTypeId: res.consultTypeId
          }
          this.channelAttentionService.assignAttentionDetail(
            {
              attentionId : this.chatDetail.attention.id,
              consultTypeId : res.consultTypeId,
              attentionDetail: res.attentionDetail
            }
          ).subscribe((response: IBaseResponseDto) =>{
            if(response.success){
              this.msg.success('El detalle de atención fue registrado correctamente.','Registro de detalle de atención.',3000)
              if(reintentFinalization){
                this.finalizeConversation()
              }
            }
          })
        }
      }
    });
  }

  finalizeConversation() {
    if(this.chatDetail && this.chatDetail.attention?.attentionDetail && this.chatDetail.attention?.consultTypeId)
    {
      this.msg.confirm(
        '¿Desea finalizar la conversación?',
        () => {
          if (this.chatDetail?.channelRoomId && this.chatDetail?.attention.id) {
            this.channelRoomService
              .closeAssistance(
                this.chatDetail?.channelRoomId,
                this.chatDetail?.attention.id
              )
              .subscribe({
                next: (response) => {
                  if (!response.success) {
                    this.messageService.add({
                      severity: 'error',
                      summary: 'Ha ocurrido un error.',
                      detail: response?.error ?? response?.message,
                      life: 5000,
                    });
                    return;
                  }
                  this.router.navigate([], {
                    relativeTo: this.route,
                    queryParams: {
                      channel: this.route.snapshot.queryParams['channel'],
                    },
                    queryParamsHandling: '',
                  });
                },
                error: (error) => {
                  this.messageService.add({
                    severity: 'error',
                    summary: 'Error del servidor',
                    detail: error.error,
                    life: 5000,
                  });
                },
              });
          }
        },
        () => {},
        'Finalizar asistencia'
      );
    }else{
      this.showFormDetail(true)
    }
  }

  openTransferModal() {
    if (!this.chatDetail?.channelRoomId) return;
    this.channelRoomService
      .getAvailableAdvisorsFromInbox(this.chatDetail.channelRoomId)
      .subscribe({
        next: (response) => {
          this.advisors = response;
          if (!response.length) {
            this.messageService.add({
              severity: 'error',
              summary: 'No hay agentes',
              detail: 'No se hallaron agentes disponibles para este canal',
              life: 5000,
            });
          }
          this.showTransferModal = true;
        },
        error: (error) => {
          this.showTransferModal = false;
          console.error('Error:', error);
        },
      });
  }

  openChannelStatusModal() {
    this.showChaneStatusModal = true;
    this.selectedNewStatus = null;
  }

  closeStatusModal() {
    this.showChaneStatusModal = false;
    this.selectedNewStatus = null;
    this.updatingStatus = false;
  }

  assignMyself()
  {
    if(!this.authStore?.user()?.id || !this.chatDetail?.channelRoomId) return
    this.channelRoomService.transferToAdvisor(this.chatDetail.channelRoomId, this.authStore.user()!.id)
      .subscribe((response: IBaseResponseDto) =>{
        if(response.success)
        {
          this.messageService.add({
            severity: 'success',
            summary: 'Asignación del caso',
            detail: "Te has asignado correctamente este caso.",
            life: 5000,
          });
          this.loadChatData();
          return
        }
        if(response?.error)
        {
          console.log(response.error)
        }
        this.msg.error("No se pudo transferirte este caso, por un error de servidor.", "Error de servidor", 3000)
    });
  }

  updateChatStatus() {
    if (!this.selectedNewStatus || !this.chatDetail) return;

    this.updatingStatus = true;

    let payload: changeChannelRoomStatusDto = {
      assistanceId: this.chatDetail.attention.id,
      channelRoomId: this.chatDetail.channelRoomId,
      status: this.selectedNewStatus,
      attentionStatus: this.getChannelStatusReverse(this.selectedNewStatus)
    };
    this.channelRoomService.changeChannelRoomStatus(payload).subscribe({
      next: (response) => {
        if (!response.success) {
          this.messageService.add({
            severity: 'error',
            summary: 'Ha ocurrido un error.',
            detail: response?.error ?? response?.message,
            life: 5000,
          });
        } else {
          this.messageService.add({
            severity: 'success',
            summary: 'Establecer estado de conversación',
            detail: response?.error ?? response?.message,
            life: 5000,
          });
        }
        this.closeStatusModal();
        return;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error del servidor',
          detail: error.error,
          life: 5000,
        });
        this.closeStatusModal();
      },
    });
  }

  onChannelStatusChange(message: string) {
    this.showChaneStatusModal = false;
  }

  onModalClose() {
    this.showTransferModal = false;
  }

  onCaseTransferred(message: string) {
    this.showTransferModal = false;
    if (message !== '') {
      this.messageService.add({
        severity: 'success',
        summary: 'Caso Transferido',
        detail: message,
        life: 5000,
      });
      this.clearChatParams()
      this.chatDetail = null;
    }
  }

  toggleBotService(active: boolean) {
    if (this.chatDetail != null) {
      if (this.chatDetail.botStatus === 'out') {
        console.warn('El bot está "out" y no se puede activar o pausar.');
        return;
      }

      const payload: ToogleBotServicesDto = {
        channelroomId: this.chatDetail.channelRoomId,
        active: active,
      };

      this.channelRoomService
        .toggleBotServices(payload)
        .subscribe((response) => {

          const updatedChatDetail: ChatDetail = {
            channelRoomId: this.chatDetail?.channelRoomId as number,
            attention: this.chatDetail?.attention!,
            externalRoomId: this.chatDetail?.externalRoomId as string,
            channel: this.chatDetail?.channel as Channels,
            status: this.chatDetail?.status as ChatStatus,
            citizen: this.chatDetail?.citizen as ChannelCitizenSummariesDto,
            agentAssigned: this.chatDetail?.agentAssigned,
            messages: this.chatDetail?.messages as ChannelMessage[],
            botStatus: payload.active ? 'active' : 'paused',
          };

          this.chatDetail = updatedChatDetail;
        });
    }
  }
  clearChatParams() {
    // Obtener parámetros actuales
    const queryParams = { ...this.router.routerState.snapshot.root.queryParams };

    delete queryParams['channelRoomId'];
    delete queryParams['assistanceId'];

    // Navegar sin recargar la página
    this.router.navigate([], {
      queryParams,
      replaceUrl: true, // no agrega una entrada al historial
    });
  }

  getMessageStatusIcon(status: string): string {
    switch (status) {
      case 'sent':
        return 'mdi:check';
      case 'delivered':
        return 'mdi:check-all';
      case 'read':
        return 'mdi:check-all';
      default:
        return 'mdi:check';
    }
  }

  get emptyMessage(): boolean {
    return !this.messageText?.trim() && this.attachments.length === 0;
  }

  formatId(id: number, length: number = 5): string {
    return id.toString().padStart(length, '0');
  }


  backToList() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { channel: this.route.snapshot.queryParams['channel'] },
      queryParamsHandling: '',
    });
  }

  loadPredefinedResponses(): void {
    switch (this.chatDetail?.channel) {
      case 'whatsapp':
        this.predefinedResponsesService.allWhatsapp().subscribe({
          next: (responses) => {
            this.predefinedResponses = responses;
          },
          error: (error) => {
            console.error('Error al cargar respuestas predefinidas:', error);
          },
        });
        break;
      case 'chatsat':
         this.predefinedResponsesService.allChatSat().subscribe({
          next: (responses) => {
            this.predefinedResponses = responses;
          },
          error: (error) => {
            console.error('Error al cargar respuestas predefinidas:', error);
          },
        });
        break;
      default:
        break;
    }
  }

  /**
   * NUEVO MÉTODO: Manejar la selección de respuesta predefinida
   */
  onResponseSelected(response: PredefinedResponses): void {
    if (this.messageText && this.messageText.trim() !== '') {
      // Si ya hay texto, agregar en nueva línea
      this.messageText += '\n' + response.content;
    } else {
      // Si está vacío, reemplazar
      this.messageText = response.content;
    }
  }
}
