import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { ChatMessageButtonComponent } from '@shared/chat-message-button/chat-message-button.component';
import { ChatMessageListComponent } from '@shared/chat-message-list/chat-message-list.component';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PopoverModule } from 'primeng/popover';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { SplitButtonModule } from 'primeng/splitbutton';
import { DataViewModule } from 'primeng/dataview';
import { TableModule } from 'primeng/table';
import { UserStore } from '@stores/user.store';
import { User, UserSender } from '@models/user.model';
import { AuthStore } from '@stores/auth.store';
import { ChatMessageService } from '@services/message.service';
import { ChatMessage } from '@models/chat-message.model';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { SocketService } from '@services/socket.service';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { ButtonCancelComponent } from '@shared/buttons/button-cancel/button-cancel.component';
import { ChatService } from '@services/chat.service';
import { NotificationSupervisesComponent } from '@shared/notification-supervises/notification-supervises.component';

@Component({
  selector: 'app-inbox-view',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PopoverModule,
    TableModule,
    DataViewModule,
    OverlayPanelModule,
    SplitButtonModule,
    ChatMessageButtonComponent,
    ChatMessageListComponent,
    ButtonSaveComponent,
    ButtonCancelComponent,
    NotificationSupervisesComponent,
  ],
  templateUrl: './inbox-view.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [DialogService, MessageService],
  styles: ``,
})
export class InboxViewComponent implements OnInit, OnDestroy {
  openGroup = false;
  previewImage?: string;
  visible: boolean = false;

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  @ViewChild('emojiPopoverButones') emojiPopoverButones: any;
  @ViewChild('emojiPopoverNewMessage') emojiPopoverNewMessage: any;

  readonly storeUser = inject(UserStore);
  private readonly msg = inject(MessageGlobalService);
  readonly chatMessageService = inject(ChatMessageService);
  readonly dialogService = inject(DialogService);
  readonly authStore = inject(AuthStore);
  readonly messageService = inject(MessageService);

  ref: DynamicDialogRef | undefined;

  readonly socketService = inject(SocketService);
  readonly chatService = inject(ChatService);

  limit = signal(10);
  offset = signal(0);

  searchTerm = '';

  unreadMessagesCount = 0;

  private userIsAtBottom = true;

  selectedUsers: any[] = [];
  filteredList: User[] = [];

  formData = new FormGroup({
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  get id() {
    return null;
  }

  get loading(): boolean {
    return this.storeUser.loading();
  }

  get groupChats() {
    return this.listChatRoom.filter((chat) => chat.isGroup);
  }

  get directChats() {
    return this.listChatRoom.filter((chat) => !chat.isGroup);
  }

  ngOnInit(): void {
    this.loadData();

    if (this.socketService.isConnected) {
      this.socketService.registerUser(this.userCurrent.id);
    }

    this.socketService.onMessage((msg) => {
      // Normalizar senderId (si viene sender como objeto)
      msg.senderId = msg.senderId ?? msg.sender?.id ?? 0;

      // Calcular correctamente isSender (sin tocar senderId)
      msg.isSender = msg.senderId === this.userCurrent.id;

      // Push del mensaje normalizado al array
      this.listMessageChatRoom.push(msg);

      if (this.userIsAtBottom) {
        this.forceScrollToBottom = true;
      }
    });


    // this.loadUnreadMessages();
    // setInterval(() => this.loadUnreadMessages(), 10000);

    document.addEventListener(
      'click',
      this.closeGroupOnClickOutside.bind(this)
    );
  }

  sendMessage(chat: any) {
    if (!chat.trim()) return;

    let newMessage = {
      isSender: true,
      type: 'text',
      content: chat,
      chatRoomId: this.selectedChatId,
      isRead: false,
    };

    this.chatMessageService
      .registerMessage(newMessage)
      .subscribe((response: any) => {
        response.isSender = true;
        this.socketService.sendMessage(response);

        this.forceScrollToBottom = true; // 👈 esto asegura el scroll solo después de enviar
      });
  }

  enviarNotificacion() {}

  // loadUnreadMessages(): void {
  //   this.chatService.getNewMessages().subscribe({
  //     next: (messages) => {
  //       this.unreadMessagesCount = messages.length;
  //     },
  //     error: (err) => {
  //       // console.error('Error al obtener mensajes no leídos', err);
  //     },
  //   });
  // }

  handleFile(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      this.msg.error('¡El archivo es demasiado grande (máximo 10 MB)!');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const previewUrl = reader.result as string;

      // Mostramos la imagen localmente (si lo usas en tu UI)
      this.previewImage = previewUrl;

      // Armamos el FormData para el backend
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'image');
      formData.append('content', ''); // requerido aunque vacío
      formData.append('chatRoomId', this.selectedChatId.toString());
      formData.append('isRead', 'false');
      formData.append('isSender', 'true');

      this.chatMessageService.registerMessageImagen(formData).subscribe({
        next: (response: any) => {
          // el backend devuelve el mensaje completo con resourceUrl asignado
          if (response?.resourceUrl) {
            response.isSender = true;
            this.socketService.sendMessage(response);
          }
        },
        error: (error) => {
          console.error('Error al subir imagen:', error);
          this.msg.error('Error al enviar la imagen.');
        },
      });
    };

    reader.readAsDataURL(file);
  }


  ngAfterViewInit(): void {
    this.scrollContainer?.nativeElement?.addEventListener('scroll', () => {
      const el = this.scrollContainer.nativeElement;
      const threshold = 80; // puedes ajustar este valor
      const atBottom =
        Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight) < threshold;
      this.userIsAtBottom = atBottom;
    });
  }

  private forceScrollToBottom = false;

  ngAfterViewChecked(): void {
    if (this.forceScrollToBottom) {
      this.scrollToBottom();
      this.forceScrollToBottom = false;
    }
  }

  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop =
        this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  listChatRoom: any[] = [];
  listMessageChatRoom: ChatMessage[] = [];

  get listUsers(): User[] {
    return this.storeUser.items();
  }

  get userCurrent(): User {
    return this.authStore.user()!;
  }

  get listSupervises(): User[] {
    return this.storeUser.items().filter((user) => user.roleId === 2);
  }

  applyFilter() {
    const term = this.searchTerm.toLowerCase();
    this.filteredList = this.listUsers.filter((user) =>
      user.displayName.toLowerCase().includes(term)
    );
  }

  loadData() {
    this.storeUser.loadAll(this.limit(), this.offset());
    this.chatMessageService
      .getAllWithToken(this.limit(), this.offset())
      .subscribe((response: any) => {
        this.listChatRoom = response.data;
        this.filteredList = [...this.listUsers];
      });
  }

  onCancel() {
    this.openGroup = false;
  }

  onSubmit() {
    const form = this.formData;
    const idUsuarioslist: number[] = this.selectedUsers.map((u) => u.id);

    if (idUsuarioslist.length === 0 || form.invalid) {
      return;
    }

    const body = {
      name: form.value.name,
      userIds: idUsuarioslist,
      isGroup: true,
    };

    this.chatMessageService.registerRoomGrupo(body).subscribe({
      next: (res) => {
        if (res) {
          this.loadData();
          this.openGroup = false;
          // No usamos this.ref?.close() aquí
        }
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  infoUserGroup: any = {};
  openedChats: any[] = [];
  infoUsers?: UserSender;

  viewMessages(chat: any) {
    // Reiniciamos estados anteriores
    this.infoUserGroup = null;
    this.infoUsers = undefined;
    this.selectedChatId = chat.id;

    // Identificamos si es grupo o chat directo
    if (chat.isGroup) {
      this.infoUserGroup = chat;
    } else {
      this.infoUsers = this.getMessageUser(chat);
    }

    // Verificamos usuario actual antes de continuar
    const currentUserId = this.userCurrent?.id;
    if (!currentUserId) {
      console.warn('⚠️ No se encontró el usuario actual al cargar mensajes.');
      return;
    }

      // Obtenemos los mensajes y procesamos correctamente el "isSender"
      this.chatMessageService.getRoomMessages(chat.id).subscribe({
      next: (response) => {
        const currentUserId = this.userCurrent?.id ?? 0;

        this.listMessageChatRoom = response.map((msg: any) => ({
          ...msg,
          // normalizamos senderId si hace falta
          senderId: msg.senderId ?? msg.sender?.id ?? 0,
          // calculamos isSender basándonos en la id normalizada
          isSender: (msg.senderId ?? msg.sender?.id ?? 0) === currentUserId,
        }));

        // resto: openedChats, scroll, etc.
        const exists = this.openedChats.find((c) => c.id === chat.id);
        if (!exists) {
          const nuevoChat = {
            ...chat,
            mensajesflotante: this.listMessageChatRoom,
            minimized: false,
            newMessage: '',
          };
          this.openedChats.push(nuevoChat);
          localStorage.setItem('openedChats', JSON.stringify(this.openedChats));
          this.chatMessageService.setSelectedChat(this.openedChats);
        }

        setTimeout(() => {
          this.forceScrollToBottom = true;
        }, 100);
      },
      error: (err) => {
        console.error('❌ Error al cargar mensajes:', err);
        this.msg.error('Error al obtener los mensajes de la sala');
      },
    });
  }


  viewMessage(contact: any) {
    const body = {
      name: 'Nuevo Mensaje',
      userIds: [contact.id],
      isGroup: false,
    };

    const roomWithUser = this.listChatRoom.find(
      (room) =>
        !room.isGroup && room.users.some((user: any) => user.id === contact.id)
    );
    console.log(roomWithUser);
    if (roomWithUser) {
      this.viewMessages(roomWithUser);
    } else {
      this.chatMessageService.registerRoom(body).subscribe({
        next: (res) => {
          if (res) {
            this.loadData();
            this.viewMessages(res);
          }
        },
        error: (err) => {
          console.error(err);
        },
      });
    }
  }

  selectedChatId: number = 1;
  newMessage: string = '';
  items = [
    { label: 'Posponer', command: () => this.posponer() },
    { label: 'Marcar como pendiente', command: () => this.marcar() },
  ];

  posponer() {
    this.chatService.setEstado(this.selectedChatId, 'pospuesto');
  }

  marcar() {
    this.chatService.setEstado(this.selectedChatId, 'pendiente');
  }

  resolver() {
    this.chatService.setEstado(this.selectedChatId, null);
  }

  marcarPospuesto(chatId: number) {
    this.chatService.setEstado(chatId, 'pospuesto');
  }

  getEstado(chatId: number): string | null {
    return this.chatService.getEstado(chatId);
  }

  toggleGroup() {
    this.openGroup = !this.openGroup;
  }

  getMessageUser(chat: any): any {
    return chat?.users?.length ? chat.users[chat.users.length - 1] : null;
  }

  getLastMessageNameUser(chat: any): string {
    if (!chat?.users?.length) return 'Sin Nombre';
    const otherUser = chat.users.find(
      (user: any) => user.id !== this.userCurrent.id
    );
    return otherUser?.name || 'Sin Nombre';
  }

  getLastMessage(chat: any): string {
    return chat?.messages?.length
      ? chat.messages[chat.messages.length - 1].content
      : 'Sin mensajes';
  }

  enviarNotificacionesUser() {
    this.socketService.sendAlertas({
      mensaje: 'Tienes nuevos mensajes por revisar por favor',
      titulo: this.userCurrent.name,
    });
  }

  popoverPosition = {
    top: '0px',
    left: '0px',
  };

  @ViewChild('groupBtn', { read: ElementRef }) groupBtn!: ElementRef;

  btnAgregarNuevoGrupo(event: MouseEvent) {
    if (this.openGroup) {
      this.openGroup = false;
      return;
    }

    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();

    this.popoverPosition = {
      top: `${rect.bottom}px`,
      left: `${rect.left + 150}px`,
    };

    this.openGroup = true;
  }

  borrarMensaje(id: number) {
    console.log('Intentando borrar mensaje con ID:', id);
    this.chatMessageService.deleteMessage(id).subscribe({
      next: () => {
        this.msg.success('Mensaje eliminado');
        this.listMessageChatRoom = this.listMessageChatRoom.filter(
          (m) => m.id !== id
        );
      },
      error: () => this.msg.error('Error al eliminar el mensaje'),
    });
  }

  borrarSala(chatId: number) {
    this.chatMessageService.deleteRoom(chatId).subscribe({
      next: () => {
        this.msg.success('Sala eliminada');
        this.listChatRoom = this.listChatRoom.filter(
          (chat) => chat.id !== chatId
        );
      },
      error: () => this.msg.error('Error al eliminar la sala'),
    });
  }

  borrarGrupo(chatId: number) {
    this.chatMessageService.deleteUserGroup(chatId).subscribe({
      next: () => {
        this.msg.success('Grupo eliminado');
        this.listChatRoom = this.listChatRoom.filter(
          (chat) => chat.id !== chatId
        );
      },
      error: () => this.msg.error('Error al eliminar el grupo'),
    });
  }

  closeGroupOnClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (
      !target.closest('.p-popover') &&
      !target.closest('.group-popover-trigger')
    ) {
      this.openGroup = false;
    }
  }

  ngOnDestroy() {
    document.removeEventListener(
      'click',
      this.closeGroupOnClickOutside.bind(this)
    );
  }

  onReject() {
    this.messageService.clear('confirm');
    this.visible = false;
  }
  
}
