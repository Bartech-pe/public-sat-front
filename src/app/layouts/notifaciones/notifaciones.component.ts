import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, inject, PLATFORM_ID } from '@angular/core';
import { RouterModule } from '@angular/router';
import { environment } from '@envs/environments';
import { ChatMessage } from '@models/chat-message.model';
import { ChatRoom } from '@models/chatRoom.model';
import { User } from '@models/user.model';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { ChatMessageService } from '@services/message.service';
import { SocketService } from '@services/socket.service';
import { ChatMessageButtonComponent } from '@shared/chat-message-button/chat-message-button.component';
import { ChatMessageListComponent } from '@shared/chat-message-list/chat-message-list.component';
import { FloatingChatButtonComponent } from '@shared/floating-chat-button/floating-chat-button.component';
import { AuthStore } from '@stores/auth.store';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Toast } from 'primeng/toast';
@Component({
  selector: 'app-notifaciones',
  imports: [
      CommonModule,
      RouterModule,
      Toast,
      ButtonModule,
      // ChatMessageButtonComponent,
      FloatingChatButtonComponent,
      ChatMessageListComponent
  ],
  templateUrl: './notifaciones.component.html',
  styles: ``
})
export class NotifacionesComponent {

openedChats: ChatRoom[] = [];
  readonly authStore = inject(AuthStore);
  private readonly msg = inject(MessageGlobalService);
  get userCurrent(): User {
      return  this.authStore.user()!;
  }
  newMessage: string = '';
  constructor(
    private chatMessageService: ChatMessageService,
    private socketService:SocketService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private messageService: MessageService ) {}

  ngOnInit() {
      this.openedChats = [];
        if (isPlatformBrowser(this.platformId)) {
          const stored = localStorage.getItem('openedChats');
          if (stored) {
              this.openedChats = JSON.parse(stored);

              // También notifica al servicio si quieres compartir
              this.chatMessageService.setSelectedChat(this.openedChats);

              // Opcional: volver a cargar los mensajes por cada chat
              this.openedChats.forEach(chat => {
                  this.chatMessageService.getRoomMessages(chat.id).subscribe((response:any) => {
                    chat.mensajesflotante = response;
                  });
              });
          }

          // Además, suscribirse por si hay cambios globales
          this.chatMessageService.getSelectedChats().subscribe((chats: any[]) => {
            this.openedChats = chats;
          });
        }

      if (this.socketService.isConnected) {
        this.socketService.registerUser(this.userCurrent.id);
      }

      //ejecutar evento solo cuando es supervisor

      if(this.userCurrent.roleId === environment.roleIdSupervisor){
          this.socketService.onAlertas((data) => {
            this.messageService.add({ key: 'confirm', sticky: true, severity: 'success', summary: data.mensaje });
          });
      }

      this.socketService.onMessage((msg) => {
            if(msg.senderId != this.userCurrent.id){
                msg.senderId = false;
            }
            //this.openedChats.push(msg);
            this.openedChats.forEach((element:any) => {
              if(element.id == msg.chatRoomId){
                element.mensajesflotante.push(msg);
              }
            });

           console.log(msg)
           console.log(this.openedChats)
      });

  }

  visible: boolean = false;

  toggleMinimizeChat(index: number) {
    this.openedChats[index].minimized = !this.openedChats[index].minimized;
  }

  getLastMessageNameUser(chat: any): string {
    if (!chat?.users?.length) return 'Sin Nombre';
    const otherUser = chat.users.find((user: any) => user.id !== this.userCurrent.id);
    return otherUser?.name || 'Sin Nombre';
  }

  showConfirm() {
        if (!this.visible) {
            this.messageService.add({ key: 'confirm', sticky: true, severity: 'success', summary: 'Can you send me the report?' });
            this.visible = true;
        }
  }

  onConfirm() {
        this.messageService.clear('confirm');
        this.visible = false;
  }

  onReject() {
        this.messageService.clear('confirm');
        this.visible = false;
  }

  closeFloatingChat(index: number) {
    this.openedChats.splice(index, 1);

    // Actualizar localStorage
    localStorage.setItem('openedChats', JSON.stringify(this.openedChats));

    // Actualizar el estado compartido si usas un servicio
    this.chatMessageService.setSelectedChat(this.openedChats);
  }

  sendMessage(chat: any,value:any) {

    if (!chat.trim()) return;

      let newMessage = {
          isSender: true,
          type:'text',
          content:chat,
          chatRoomId:value.id,
          isRead:false
      }
      value.mensajesflotante.push(newMessage);
      this.chatMessageService.registerMessage(newMessage).subscribe((response:any) =>{
          response.senderId= true;
          this.socketService.sendMessage(response);
      })
  }

  handleFile(file: File,value:any) {
        if (file.size > 10 * 1024 * 1024) {
          this.msg.error('¡Ups, El archivo es demasiado grande (máximo 10 MB)!');
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          const previewUrl = reader.result as string;

          // mensaje temporal (solo para mostrar en la interfaz)
          const newMessage: ChatMessage = {
            isSender: true,
            type: 'image',
            content: '',
            resourceUrl: previewUrl, // solo vista previa
            chatRoomId: value.id,
            isRead: false,
            createdAt: new Date().toISOString()
          };

         // this.listMessageChatRoom.push(newMessage);

          //Aquí creamos el FormData con todos los campos
          const formData = new FormData();
          formData.append('file', file);
          formData.append('isSender', 'true'); // string, aunque es boolean
          formData.append('type', 'image');
          formData.append('content', '');
          formData.append('resourceUrl', previewUrl); // opcional, por vista previa
          formData.append('chatRoomId', value.id.toString());
          formData.append('isRead', 'false');
          formData.append('createdAt', new Date().toISOString());

          this.chatMessageService.registerMessageImagen(formData).subscribe((response: any) => {

            if (response?.resourceUrl) {
              //newMessage.resourceUrl = response.resourceUrl;
              response.senderId= true;
              this.socketService.sendMessage(response);
            }
          });
        };
        reader.readAsDataURL(file);
    }
}
