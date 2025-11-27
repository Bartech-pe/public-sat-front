import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { environment } from '@envs/environments';
import { ForwardCenterMail } from '@models/mail-forward.model';
import { MailService } from '@services/mail.service';
import { ButtonCancelComponent } from '@shared/buttons/button-cancel/button-cancel.component';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { escapeRegex } from '@utils/mail.utils';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { EditorModule } from 'primeng/editor';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { MailViewerComponent } from '../mail-viewer/mail-viewer.component';
import {
  AutoCompleteCompleteEvent,
  AutoCompleteModule,
} from 'primeng/autocomplete';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { BtnCustomComponent } from '@shared/buttons/btn-custom/btn-custom.component';
import { EmailSignatureService } from '@services/email-signature.service';
import { MailEditorComponent } from '@shared/editor/mail-editor/mail-editor.component';

@Component({
  selector: 'app-form-forward',
  imports: [
    CommonModule,
    FormsModule,
    EditorModule,
    InputTextModule,
    TextareaModule,
    AutoCompleteModule,
    MailViewerComponent,
    MailEditorComponent,
    BtnCustomComponent,
  ],
  templateUrl: './form-forward.component.html',
  styles: ``,
})
export class FormForwardComponent implements OnInit {
  mediaUrl: string = environment.apiUrl;

  private readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly msg = inject(MessageGlobalService);

  private readonly config = inject(DynamicDialogConfig);

  private readonly mailService = inject(MailService);

  private readonly emailSignatureService = inject(EmailSignatureService);

  private readonly datePipe = inject(DatePipe);

  forwardTo?: string;
  forwardSubject?: string;
  forwardText?: string;
  forwardBody?: string;
  forwardFrom?: string;
  forwardMailAttentionId: number | null = null;

  emailItemsTo: any[] = [];

  searchEmailTo(event: AutoCompleteCompleteEvent) {
    this.mailService.getEmailCitizen(event.query).subscribe({
      next: (res) => {
        this.emailItemsTo = res;
      },
    });
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

  cleanBody(raw: string): string {
    if (!raw) return '(sin contenido)';

    let cleaned = raw;

    // Patrones que no quieres mostrar
    const unwantedPatterns = [/Libre\s+de\s+virus.*avast\.com/gi, /<#.*?>/g];

    unwantedPatterns.forEach((pattern) => {
      cleaned = cleaned.replace(pattern, '');
    });

    // 👇 Quitar solo ">" que estén solos en la línea (dejando espacios o salto)
    cleaned = cleaned.replace(/^>\s*$/gm, '');

    return cleaned.trim() || '(sin contenido)';
  }

  loading: boolean = false;

  get invalid(): boolean {
    return !this.forwardBody || !this.forwardTo;
  }

  ngOnInit(): void {
    const { mail } = this.config.data;

    this.forwardMailAttentionId = mail.mailAttentionId;
    this.forwardFrom = mail.from;
    this.forwardSubject = mail.subject;
    this.forwardText = this.getReplyContent(mail);
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
          <p>---------- Mensaje reenviado ----------</p>
          <div class="gmail_quote gmail_quote_container">
          <div dir="ltr" class="gmail_attr">
              <p>De: ${msg.from}</p>
              <p>Para: ${msg.to}</p>
              <p>Fecha: El ${formattedDate} a las ${formattedTime}</p>
              <p>Asunto: ${msg.subject}</p>
          <br>
          </div>
          ${safe}
          </div>`;
      } else {
        // mensaje que responde a otro
        html = `
          ${safe}
          <p>---------- Mensaje reenviado ----------</p>
          <div class="gmail_quote gmail_quote_container">
          <div dir="ltr" class="gmail_attr">
              <p>De: ${msg.from}</p>
              <p>Para: ${msg.to}</p>
              <p>Fecha: El ${formattedDate} a las ${formattedTime}</p>
              <p>Asunto: ${msg.subject}</p>
            </div>
          <br>
        ${html}</div>`;
      }
    }

    return html;
  }

  insertSignature() {
    this.emailSignatureService.findOneByTokenUserId().subscribe({
      next: (data) => {
        if (data?.content) {
          this.forwardBody += '<br><p>--</p><br>' + data?.content;
        }
      },
    });
  }

  onCancel() {
    // this.store.clearSelected();
    this.ref.close(false);
  }

  onSubmit() {
    if (!this.forwardTo?.trim() || !this.forwardMailAttentionId) {
      alert('Falta el destinatario o el ID del correo para reenviar');
      return;
    }

    // Solo enviamos lo que el backend necesita
    const payload: ForwardCenterMail = {
      mailAttentionId: this.forwardMailAttentionId,
      from: this.forwardTo,
      message: this.forwardBody,
    };

    this.mailService.forwardEmail(payload).subscribe({
      next: (res) => {
        this.ref.close(true);
        this.msg.success('Mensaje reenviado correctamente.');
      },
      error: (err) => {
        console.error('Error al enviar', err);
        this.msg.error(
          err?.message || 'Ocurrio un error al reenviar el mensaje'
        );
      },
    });
  }
}
