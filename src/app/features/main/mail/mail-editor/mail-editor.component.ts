import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { MailService } from '@services/mail.service';
import { ButtonCancelComponent } from '@shared/buttons/button-cancel/button-cancel.component';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import {
  AutoCompleteCompleteEvent,
  AutoCompleteModule,
} from 'primeng/autocomplete';
import { CardModule } from 'primeng/card';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { EditorModule } from 'primeng/editor';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-mail-editor',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    EditorModule,
    InputTextModule,
    TextareaModule,
    AutoCompleteModule,
    CardModule,
    ButtonSaveComponent,
    ButtonCancelComponent,
  ],
  templateUrl: './mail-editor.component.html',
  styles: ``,
})
export class MailEditorComponent {
  private readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly config = inject(DynamicDialogConfig);

  private readonly msg = inject(MessageGlobalService);

  private readonly mailService = inject(MailService);

  private readonly datePipe = inject(DatePipe);

  formData = new FormGroup({
    to: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.email],
    }),
    subject: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    content: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  loading: boolean = false;

  emailList: any[] = [
    {
      name: 'Erik Huaman Guiop',
      email: 'erik.huaman@bartech.pe',
    },
    {
      name: 'Adela Rimarachin',
      email: 'adela.heredia@gmail.com',
    },
  ];

  emailItemsTo: any[] = [];

  ngOnInit(): void {
    const { mailId, replyId } = this.config.data;

    console.log(mailId, replyId);
  }

  searchEmailTo(event: AutoCompleteCompleteEvent) {
    this.emailItemsTo = this.emailList.filter(
      (item) =>
        item.name.includes(event.query) || item.email.includes(event.query)
    );
  }

  onCancel() {
    this.ref.close(false);
  }

  onSubmit() {
    const form = this.formData.value;

    // Crear FormData
    const formData = new FormData();
    formData.append('to', form.to!.trim()); // backend espera string, él mismo convierte en array
    formData.append('subject', form.subject!);
    formData.append('content', form.content!);

    this.mailService.sendEmailCenter(formData).subscribe({
      next: (res) => {
        this.ref.close(true);
        this.msg.success('Mensaje enviado correctamente.');
      },
      error: (err) => {
        console.error('Error al enviar', err);
        this.msg.error(err?.message || 'Ocurrio un error al enviar el mensaje');
      },
    });
  }
}
