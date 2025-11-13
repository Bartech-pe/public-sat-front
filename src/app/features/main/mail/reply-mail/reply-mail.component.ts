import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
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
import { environment } from '@envs/environments';
import { MailViewerComponent } from '../mail-viewer/mail-viewer.component';
import { escapeRegex, fileIcons } from '@utils/mail.utils';
import { TimeAgoPipe } from '@pipes/time-ago.pipe';
import { FormsModule } from '@angular/forms';

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
  imports: [
    CommonModule,
    FormsModule,
    BtnCustomComponent,
    EditorModule,
    PopoverModule,
    MailViewerComponent,
    BtnCustomComponent,
    TimeAgoPipe,
  ],
  templateUrl: './reply-mail.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ReplyMailComponent {
  mediaUrl: string = environment.apiUrl;

  @ViewChild('responses') responses!: Popover;

  @Input() mailId?: number;

  @Input() reply: any;

  @Output() forward = new EventEmitter<void>();

  private readonly dialogService = inject(DialogService);

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

  replyMode: 'reply' | 'compose' | 'forward' | undefined = undefined;

  replyText = '';

  get replyTag() {
    return this.replyTags[this.reply.type];
  }

  get showReplyBtns(): boolean {
    return (
      this.reply.type === 'CIUDADANO' || this.reply.type === 'RESPUESTA_INTERNA'
    );
  }

  cancelReply() {
    this.replyMode = undefined;
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

  getSafeContent(
    body?: string,
    attachments: any[] = [],
    dateReply?: string
  ): string {
    // Si viene vacío, devolvemos un fallback claro
    if (!body || body.trim() === '') {
      return '<i>(sin contenido)</i>';
    }

    // Limpia el contenido (tu función existente)
    const cleaned = this.cleanBody(body);

    // Usaremos cleanHtml para aplicar los reemplazos incrementalmente
    let cleanHtml = cleaned;

    // Normalizar base URL (quita slash final si lo tiene)
    const base = this.mediaUrl ? this.mediaUrl.replace(/\/$/, '') : '';

    attachments.forEach((att) => {
      // Soportar varias claves posibles: attachmentGmailId, cid, id, etc.
      const cidId = att.cid;
      const publicUrl = att.publicUrl;

      if (cidId && publicUrl) {
        // Construir URL segura uniendo sin duplicar '/'
        const realUrl = `${base}/${publicUrl.replace(/^\//, '')}`;

        // Escapar id para usar en RegExp
        const escaped = escapeRegex(cidId);

        // Buscamos cualquier aparición de cid:ID (global)
        const regex = new RegExp(`cid:${escaped}`, 'g');

        if (cleanHtml.includes(`cid:${escaped}`)) {
          att.inMessage = true;
        } else {
          att.realUrl = realUrl;
        }

        // Reemplazamos en cleanHtml (no en cleaned)
        cleanHtml = cleanHtml.replace(regex, realUrl);
      }
    });

    return cleanHtml;
  }

  hasAttachments(attachments: any[]) {
    return attachments.filter((a) => !a.inMessage).length != 0;
  }

  getAttachments(attachments: any[]): any[] {
    return attachments.filter((a) => !a.inMessage);
  }

  getReplyContent(reply: any): string {
    const chain: any[] = [];

    // Recorremos hacia atrás para obtener toda la cadena
    let current = reply;
    while (current) {
      chain.unshift(current); // insertamos al inicio para invertir el orden
      current = current.repliedTo;
    }

    // Ahora la lista está en orden: [mensaje original, respuesta1, respuesta2, ...]
    let html = '';

    for (const msg of chain) {
      const safe = this.getSafeContent(msg.content, msg.attachments);

      const date = new Date(msg.date);
      const formattedDate = date.toLocaleDateString('es-PE', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const formattedTime = date.toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit',
      });

      if (!html) {
        // mensaje más antiguo, solo contenido
        html = `
        <div class="gmail_quote gmail_quote_container">
          <div dir="ltr" class="gmail_attr">
            El ${formattedDate} a las ${formattedTime}, ${msg.name || msg.from} 
            (<a href="mailto:${msg.from}">${msg.from}</a>) escribió:
          </div>
          <blockquote class="gmail_quote gmail_quote_block">
            ${safe}
          </blockquote>
        </div>`;
      } else {
        // mensaje que responde a otro
        html = `
        <div class="gmail_quote">
          <div dir="ltr" class="gmail_attr">
            El ${formattedDate} a las ${formattedTime}, ${msg.name || msg.from} 
            (<a href="mailto:${msg.from}">${msg.from}</a>) escribió:
          </div>
          <blockquote class="gmail_quote gmail_quote_block">
            ${safe}
            ${html}
          </blockquote>
        </div>`;

        //         return `
        //   ${quoted}
        //   <div class="gmail_quote gmail_quote_container">
        //     <div dir="ltr" class="gmail_attr">
        //       El ${formatted}, ${reply.name} <a href="mailto:${reply.from}">${reply.from}</a> escribió:
        //     </div>
        //     <blockquote class="gmail_quote">
        //       ${html}
        //     </blockquote>
        //   </div>
        // `;
      }
    }

    return html;
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

  sendReply(threadId: number, mailAttentionId: number) {
    if (!this.replyText.trim()) return;

    // ya no mandamos this.replyTarget al backend
    this.mailService
      .replyEmail(mailAttentionId, this.replyText, threadId)
      .subscribe({
        next: (res) => {
          console.log('✅ Respuesta guardada en backend:', res);
          this.cancelReply();
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
        this.cancelReply();
      }
    });
  }

  // iconMapper.ts
  obtenerIconoPorMime(mimetype: string): string {
    // Devuelve un ícono genérico si no hay coincidencia
    return fileIcons[mimetype] || 'mdi:file';
  }
}
