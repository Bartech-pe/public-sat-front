import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChatRoom } from '@models/chatRoom.model';
import { ChatMessage } from '@models/chat-message.model';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PopoverModule } from 'primeng/popover';
@Component({
  selector: 'app-floating-chat',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PopoverModule,
  ],
  templateUrl: './floating-chat.component.html',
  styles: ``,
})
export class FloatingChatComponent {
  @Input() chat!: ChatRoom;
  @Input() messages: ChatMessage[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() openInFullChat = new EventEmitter<any>();

  newMessage: string = '';

  sendMessage() {
    if (this.newMessage.trim()) {
      const message: ChatMessage = {
        content: this.newMessage,
        type: 'text',
        isSender: true,
        isRead: false,
        chatRoomId: this.chat.id,
        createdAt: new Date().toISOString(),
      };

      // Puedes emitirlo o guardarlo en backend si deseas
      this.messages.push(message);
      this.newMessage = '';
    }
  }

  handleClose() {
    this.close.emit();
  }

  handleFullChat() {
    this.openInFullChat.emit(this.chat);
  }
}
