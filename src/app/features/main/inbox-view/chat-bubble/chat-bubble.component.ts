import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  inject,
  OnDestroy,
  AfterViewInit,
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
import { UserService } from '@services/user.service';
import { NotificationService } from '@services/notification.service';

@Component({
  selector: 'app-chat-bubble',
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
  ],
  templateUrl: './chat-bubble.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [DialogService, MessageService],
  styles: ``,
})
export class ChatBubbleComponent {
  private isUserNearBottom = true;

  openInbox = false;
  openGroup = false;

  visible: boolean = false;

  @ViewChild('scrollContainer') private scrollContainer?: ElementRef;
  @ViewChild('emojiPopoverButones') emojiPopoverButones: any;

  readonly userService = inject(UserService);
  private readonly msg = inject(MessageGlobalService);
  readonly chatMessageService = inject(ChatMessageService);
  readonly dialogService = inject(DialogService); 
  readonly authStore = inject(AuthStore);
  readonly messageService = inject(MessageService);
  ref: DynamicDialogRef | undefined;

  readonly socketService = inject(SocketService);
  readonly chatService = inject(ChatService);
  readonly  notificationService= inject(NotificationService);

  limit = signal(10);
  offset = signal(0);

  searchTerm = '';

  unreadMessagesCount = 0; //Agregar nueva funcionalidad para notificaciones de mensajeria.

  chatSeleccionado: any = null;
  mensajesSeleccionado: ChatMessage[] = [];

  messageTotal: any[] = [];

  selectedUsers: any[] = [];
  filteredList: User[] = [];

  openedChats: any[] = [];

  formData = new FormGroup({
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  get id() {
    return null;
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
      if (msg.senderId != this.userCurrent.id) {
        msg.senderId = false;
        this.allNotification();
      }
    });

    

    // this.loadUnreadMessages();
    // setInterval(() => this.loadUnreadMessages(), 10000);
  }

  allNotification(){
    this.notificationService.findAllByuserId().subscribe((res:any) => {
      this.messageTotal = res.data;
    })
  }

  ngAfterViewInit(): void {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.addEventListener('scroll', () => {
        const threshold = 100;
        const position =
          this.scrollContainer!.nativeElement.scrollTop +
          this.scrollContainer!.nativeElement.clientHeight;
        const height = this.scrollContainer!.nativeElement.scrollHeight;
        this.isUserNearBottom = position > height - threshold;
      });
    }
  }

  sendMessage(chatText: string) {
    if (!chatText.trim()) return;

    const newMessage = {
      isSender: true,
      type: 'text',
      content: chatText,
      chatRoomId: this.selectedChatId,
      isRead: false,
    };

    this.chatMessageService
      .registerMessage(newMessage)
      .subscribe((response: any) => {
        response.isSender = true;

        if (this.chatSeleccionado) {
          this.chatSeleccionado.mensajesflotante =
            this.chatSeleccionado.mensajesflotante || [];
          this.chatSeleccionado.mensajesflotante.push(response);
          this.chatSeleccionado.newMessage = '';
        }

        this.socketService.sendMessage(response);

        setTimeout(() => this.scrollToBottom(), 100);
      });
  }

  // loadUnreadMessages(): void {
  //   this.chatService.getNewMessages().subscribe({
  //     next: (messages) => {
  //       this.unreadMessagesCount = messages.length;
  //     },
  //     error: (err) => {
  //       // console.error('Error al obtener mensajes no leídos', err);
  //     }
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

      const formData = new FormData();
      formData.append('file', file);
      formData.append('isSender', 'true');
      formData.append('type', 'image');
      formData.append('content', '');
      formData.append('resourceUrl', previewUrl);
      formData.append('chatRoomId', this.selectedChatId.toString());
      formData.append('isRead', 'false');
      formData.append('createdAt', new Date().toISOString());

      this.chatMessageService
        .registerMessageImagen(formData)
        .subscribe((response: any) => {
          if (response?.resourceUrl) {
            response.isSender = true;
            this.socketService.sendMessage(response);
          }
        });
    };

    reader.readAsDataURL(file);
  }

  private scrollToBottom(): void {
    if (!this.isUserNearBottom || !this.scrollContainer) return;

    try {
      this.scrollContainer.nativeElement.scrollTop =
        this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Error al hacer scroll:', err);
    }
  }

  listChatRoom: any[] = [];
  listMessageChatRoom: ChatMessage[] = [];

  users = signal<User[]>([]);

  get listUsers(): User[] {
    return this.users();
  }

  get userCurrent(): User {
    return this.authStore.user()!;
  }

  applyFilter() {
    const term = this.searchTerm.toLowerCase();
    this.filteredList = this.listUsers.filter((user) =>
      user.displayName.toLowerCase().includes(term)
    );
  }

  loadData() {
    this.userService.getAll().subscribe({
      next: (res) => {
        this.users.set(res.data);
      },
    });

    this.chatMessageService
      .getAllWithToken(this.limit(), this.offset())
      .subscribe((response: any) => {
        this.listChatRoom = response.data;
        this.filteredList = [...this.listUsers];
    });

    this.allNotification();
  }

  onCancel() {
    this.openGroup = false;
    this.ref?.close(false);
  }

  onSubmit() {
    const form = this.formData;
    const idUsuarioslist: number[] = this.selectedUsers.map((u) => u.id);

    if (idUsuarioslist.length === 0 || form.invalid) {
      return;
    }

    const currentUserId = this.userCurrent.id;
    const allUsers = [/* currentUserId, */ ...idUsuarioslist];

    const body: any = {
      userIds: allUsers,
      name: form.value.name,
      isGroup: true,
    };

    console.log('form', form.value);

    // if (allUsers.length > 2) {
    //   body.name = form.value.name || 'Grupo sin nombre';
    // }

    console.log('🟢 Enviando body a /chat/room/multiple:', body);
    console.log('🟢 Usuarios seleccionados:', idUsuarioslist);
    console.log('🟢 Usuario actual:', this.userCurrent.id);
    console.log('🟢 Body final:', body);

    this.chatMessageService.registerRoomGrupo(body).subscribe({
      next: (res) => {
        if (res) {
          this.loadData();
          this.openGroup = false;
          this.ref?.close(res);
        }
      },
      error: (err) => {
        console.error('❌ Error al crear grupo:', err);
      },
    });
  }

  infoUserGroup: any = {};
  infoUsers?: UserSender;

  viewMessages(chat: any) {
    this.infoUserGroup = null;
    this.infoUsers = undefined;
    this.listMessageChatRoom = [];
    this.selectedChatId = chat.id;
    this.openInbox = false;

    this.chatSeleccionado = {
      ...chat,
      mensajesflotante: [],
      minimized: false,
      newMessage: '',
    };

    if (chat.isGroup) {
      this.infoUserGroup = chat;
    } else {
      this.infoUsers = this.getMessageUser(chat);
    }

    this.chatMessageService.getRoomMessages(chat.id).subscribe((response) => {
      this.chatSeleccionado.mensajesflotante = response;
      this.listMessageChatRoom = response;

      setTimeout(() => {
        this.scrollToBottom();

        // Aquí nos aseguramos que scrollContainer ya esté en el DOM
        if (this.scrollContainer) {
          this.scrollContainer.nativeElement.addEventListener('scroll', () => {
            const threshold = 100;
            const position =
              this.scrollContainer!.nativeElement.scrollTop +
              this.scrollContainer!.nativeElement.clientHeight;
            const height = this.scrollContainer!.nativeElement.scrollHeight;
            this.isUserNearBottom = position > height - threshold;
          });
        }
      }, 0); // Espera al siguiente ciclo para asegurarte que el DOM está renderizado
    });
  }

  openFloatingChat(chat: any) {
    const exists = this.openedChats.find((c) => c.id === chat.id);
    if (!exists) {
      this.openedChats.push({
        ...chat,
        minimized: false,
        mensajesflotante: [],
        newMessage: '',
      });
    }
  }

  closeFloatingChat(index: number) {
    this.openedChats.splice(index, 1);
  }

  sendFloatingMessage(chat: any) {
    if (!chat.newMessage?.trim()) return;

    const message = {
      isSender: true,
      type: 'text',
      content: chat.newMessage,
      chatRoomId: chat.id,
      isRead: false,
    };

    chat.mensajesflotante.push(message);
    chat.newMessage = '';

    this.chatMessageService.registerMessage(message).subscribe((res) => {
      this.socketService.sendMessage(res);
    });
  }

  viewMessage(contact: any) {
    const body = {
      name: 'Nuevo Mensaje',
      userIds: [contact.id],
      isGroup: false,
    };

    const roomWithUser = this.listChatRoom.find((room) =>
      room.users.some((user: any) => user.id === contact.id)
    );

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

  toggleInbox() {
    this.openInbox = !this.openInbox;
    if (this.openInbox) {
      this.openGroup = false; // 👉 Cierra el grupo
    }
  }

  toggleGroup() {
    this.openGroup = !this.openGroup;
    if (this.openGroup) {
      this.openInbox = false; // 👉 Cierra el inbox
    }
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

  btnAgregarNuevoGrupo() {
    this.openInbox = false;
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

  ngOnDestroy() {}

  onReject() {
    this.messageService.clear('confirm');
    this.visible = false;
  }
}
