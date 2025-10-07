import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ForwardCenterMail } from '@models/mail-forward.model';
import { MailService } from '@services/mail.service';
import { ButtonCancelComponent } from '@shared/buttons/button-cancel/button-cancel.component';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { EditorModule } from 'primeng/editor';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-form-forward',
  imports: [
    CommonModule,
    FormsModule,
    EditorModule,
    InputTextModule,
    TextareaModule,
    ButtonSaveComponent,
    ButtonCancelComponent,
  ],
  templateUrl: './form-forward.component.html',
  styles: ``,
})
export class FormForwardComponent implements OnInit {
  private readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly sanitizer = inject(DomSanitizer);

  private readonly config = inject(DynamicDialogConfig);

  private readonly mailService = inject(MailService);

  private readonly datePipe = inject(DatePipe);

  forwardTo?: string;
  forwardSubject?: string;
  forwardText?: string;
  forwardBody?: string;
  forwardFrom?: string;
  forwardMailAttentionId: number | null = null;

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

    // 👇 Quitar solo ">" que estén solos en la línea (dejando espacios o salto)
    cleaned = cleaned.replace(/^>\s*$/gm, '');

    return cleaned.trim() || '(sin contenido)';
  }

  loading: boolean = false;

  get invalid(): boolean {
    return !this.forwardBody;
  }

  ngOnInit(): void {
    const { mailId, replyId } = this.config.data;

    console.log(mailId, replyId);

    this.mailService.getMessageDetail(mailId).subscribe({
      next: (detail: any[]) => {
        if (!detail || detail.length === 0) return;

        // Convertimos todo en un hilo de mensajes
        const thread = detail
          .filter((d) => d.id <= replyId)
          .map((d) => ({
            id: d.id,
            mailAttentionId: d.mailAttentionId,
            from: d.from,
            subject: d.subject,
            body: d.content,
            createdAt: new Date(d.createdAt),
            attachments: d.files || [],
            type: d.type,
          }));

        this.forwardMailAttentionId = thread[0].mailAttentionId;
        this.forwardFrom = thread[0].from;
        this.forwardSubject = thread[0].subject;
        this.forwardText = thread
          .map(
            (d) => `
              <p>${this.datePipe.transform(
                d.createdAt,
                'dd MMM yyyy, h:mm a'
              )}</p>
              <div style='border-left: 1px solid #cccccc; padding-left: 8px;'>
              ${d.body}
              </div>
            `
          )
          .join('<br>');

        console.log('thread', thread);
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
        console.log('✅ Correo reenviado:', res);
        this.ref.close(true);
      },
      error: (err) => {
        console.error('❌ Error reenviando correo', err);
      },
    });
  }
}
