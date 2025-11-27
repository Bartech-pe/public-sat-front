import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  inject,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { environment } from '@envs/environments';
import { ChatMessage } from '@models/chat-message.model';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PopoverModule } from 'primeng/popover';
import { ChatMessageService } from '@services/message.service';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { DialogModule } from 'primeng/dialog';
@Component({
  selector: 'chat-message-list',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PopoverModule,
    OverlayPanelModule,
    DialogModule,
  ],
  templateUrl: './chat-message-list.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``,
})
export class ChatMessageListComponent {
  @Input() messages: ChatMessage[] = [];

  apiUrlImage = environment.apiUrl.replace(/\/$/, '');
  visibleImage: boolean = false;
  readonly chatMessageService: ChatMessageService = inject(ChatMessageService);

  selectedMessage: ChatMessage | null = null;

  @Output() deleteMessage = new EventEmitter<number>();
  @ViewChild('menu') menuOverlay!: OverlayPanel;

  onDeleteMessage(id: number) {
    this.deleteMessage.emit(id);
  }

  eliminarMensaje(msg: ChatMessage) {
    if (!msg?.id) return;

    this.chatMessageService.deleteMessage(msg.id).subscribe(() => {
      this.messages = this.messages.filter((m) => m.id !== msg.id);

      // Oculta el menú contextual
      this.menuOverlay?.hide();
    });
  }

  openMenu(event: MouseEvent, msg: ChatMessage) {
    this.selectedMessage = msg;
    this.menuOverlay.toggle(event);

    setTimeout(() => {
      const panelEl = this.menuOverlay.container as HTMLElement;
      if (panelEl) {
        panelEl.style.top = `${panelEl.offsetTop + 12}px`;
      }
    });
  }

  urlImage: any = '';
  clickImage(msg: any) {
    this.visibleImage = true;
    this.urlImage = this.apiUrlImage + msg.resourceUrl;
  }
}
