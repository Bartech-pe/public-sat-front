import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PredefinedResponses } from '@models/predefined-response.model';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { PredefinedResponsesService } from '@services/predefined.service';
import { BtnCustomComponent } from '@shared/buttons/btn-custom/btn-custom.component';
import { DialogService } from 'primeng/dynamicdialog';
import { EditorModule } from 'primeng/editor';
import { Popover, PopoverModule } from 'primeng/popover';
import { FormForwardComponent } from '../form-forward/form-forward.component';
import { MailService } from '@services/mail.service';

interface Reply {
  id: number;
  from: string;
  body: string;
  date: Date;
  type: 'CIUDADANO' | 'ASESOR' | 'RESPUESTA_INTERNA' | 'REENVIO_INTERNO';
  replyTarget?: 'CIUDADANO' | 'Interno';
  attachments?: {
    name: string;
    size: number;
    url: string;
  }[];
}

@Component({
  selector: 'app-reply-mail',
  standalone: true,
  imports: [CommonModule, BtnCustomComponent, EditorModule, PopoverModule],
  templateUrl: './reply-mail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReplyMailComponent {
  @ViewChild('responses') responses!: Popover;

  @Input() mailId?: number;

  @Input() reply: any;

  @Output() forward = new EventEmitter<void>();

  private readonly sanitizer = inject(DomSanitizer);

  private readonly dialogService = inject(DialogService);

  private readonly msg = inject(MessageGlobalService);

  private readonly mailService = inject(MailService);

  private readonly predefinedResponsesService = inject(
    PredefinedResponsesService
  );

  predefinedResponseList: PredefinedResponses[] = [];

  attachments: any[] = [];

  replyTags: Record<
    string,
    { label: string; bg: string; border: string; text: string }
  > = {
    CIUDADANO: {
      label: 'Ciudadano',
      bg: 'bg-green-50',
      border: 'border-green-300',
      text: 'text-green-700',
    },
    ASESOR: {
      label: 'Asesor',
      bg: 'bg-blue-50',
      border: 'border-blue-300',
      text: 'text-blue-700',
    },
    REENVIO_INTERNO: {
      label: 'Reenvío Interno',
      bg: 'bg-yellow-50',
      border: 'border-yellow-300',
      text: 'text-yellow-700',
    },
    RESPUESTA_INTERNA: {
      label: 'Respuesta Interna',
      bg: 'bg-purple-50',
      border: 'border-purple-300',
      text: 'text-purple-700',
    },
  };

  replyMode: 'reply' | 'compose' | 'forward' | null = null;

  replyText = '';

  get replyTag() {
    return this.replyTags[this.reply.type];
  }

  get showReplyBtns(): boolean {
    return (
      this.reply.type === 'CIUDADANO' || this.reply.type === 'RESPUESTA_INTERNA'
    );
  }

  loadPredefinedResponseMail() {
    this.predefinedResponsesService.allMail().subscribe({
      next: (data) => {
        this.predefinedResponseList = data;
      },
    });
  }

  selectResponse(event: any) {
    this.responses.toggle(event);
  }

  insertResponse(response: PredefinedResponses) {
    console.log('response.content', response.content);
    this.replyText = this.replyText + response.content;
  }

  getReplyClass(reply: Reply): string {
    const tag = this.replyTags[reply.type];
    return `${tag.bg} ${tag.border} ${tag.text} border rounded-lg p-2`;
  }

  getSafeContent(body?: string | null): SafeHtml {
    // 🔹 Si viene vacío, devolvemos un fallback claro
    if (!body || body.trim() === '') {
      return this.sanitizer.bypassSecurityTrustHtml('<i>(sin contenido)</i>');
    }

    // 🔹 Limpiamos el contenido antes de confiarlo
    const cleaned = this.cleanBody(body);

    // 🔹 Retornamos como HTML seguro
    return this.sanitizer.bypassSecurityTrustHtml(cleaned);
  }

  cleanBody(raw: string): string {
    if (!raw) return '(sin contenido)';

    let cleaned = raw;

    // Patrones que no quieres mostrar
    const unwantedPatterns = [/Libre\s+de\s+virus.*avast\.com/gi, /<#.*?>/g];

    unwantedPatterns.forEach((pattern) => {
      cleaned = cleaned.replace(pattern, '');
    });

    // Quitar solo ">" que estén solos en la línea (dejando espacios o salto)
    cleaned = cleaned.replace(/^>\s*$/gm, '');

    return cleaned.trim() || '(sin contenido)';
  }

  onReplyClick() {
    this.replyMode = 'reply';
    this.replyText = '';
  }

  sendReply() {
    if (!this.replyText.trim() || !this.reply()) return;

    const mailId = this.reply()?.mailAttentionId;
    if (!mailId) return;

    // 🚫 ya no mandamos this.replyTarget al backend
    this.mailService.replyEmail(mailId, this.replyText).subscribe({
      next: (res) => {
        console.log('✅ Respuesta guardada en backend:', res);
        this.replyMode = null;
        this.replyText = '';
        this.attachments = [];
      },
      error: (err) => {
        console.error('❌ Error enviando reply', err);
      },
    });
  }

  forwardMail(id: number) {
    const ref = this.dialogService.open(FormForwardComponent, {
      header: 'Reenviar',
      styleClass: 'modal-2xl',
      data: {
        mailId: this.mailId,
        replyId: id,
      },
      focusOnShow: false,
      dismissableMask: false,
      draggable: true,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      if (res) {
        this.replyMode = null;
      }
    });
  }
}
