import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PickerModule  } from '@ctrl/ngx-emoji-mart';
import { PopoverModule } from 'primeng/popover';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
@Component({
  selector: 'chat-message-button',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PopoverModule,
    PickerModule,
    OverlayPanelModule
  ],
  templateUrl: './chat-message-button.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``
})
export class ChatMessageButtonComponent {
  @Input() message: string = '';
  @Output() messageChange = new EventEmitter<string>();
  @Output() send = new EventEmitter<string>();
  @Output() fileUpload = new EventEmitter<File>();
  @Output() recordVoice = new EventEmitter<void>();
  @Output() emojiPick = new EventEmitter<string>();
  @ViewChild('emojiPopover') emojiPopover!: OverlayPanel;
  onSend() {
    const text = this.message.trim();
    if (!text) return;

    this.send.emit(text);
    this.message = '';
    this.messageChange.emit('');

    setTimeout(() => {
      const textarea = document.querySelector('textarea');
      if (textarea) {
        (textarea as HTMLTextAreaElement).style.height = 'auto';
      }
    });
  }

  onEmojiSelect(event: any) {
    this.message += event.emoji.native;
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSend();
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.fileUpload.emit(file);
    }
  }

  onEmojiClick(emoji: string) {
    this.message += emoji;
    this.messageChange.emit(this.message);
    this.emojiPick.emit(emoji);
  }

  startRecording() {
    this.recordVoice.emit();
  }

  autoResize(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto'; // Reinicia la altura
    textarea.style.height = textarea.scrollHeight + 'px'; // Ajusta a su contenido
  }

}
