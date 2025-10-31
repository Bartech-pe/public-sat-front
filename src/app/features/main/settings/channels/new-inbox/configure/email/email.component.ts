import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms'; // 👈 necesario para [(ngModel)]
import { GmailService } from '@services/gmail.service';
import { StepperModule } from 'primeng/stepper';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { TextareaModule } from 'primeng/textarea';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonCancelComponent } from '@shared/buttons/button-cancel/button-cancel.component';

@Component({
  selector: 'app-email',
  imports: [
    ButtonModule,
    ToastModule,
    FormsModule,
    TextareaModule,
    StepperModule,
    ButtonSaveComponent,
    ButtonCancelComponent,
  ],
  templateUrl: './email.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``,
})
export class EmailComponent {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly gmailService = inject(GmailService);

  id?: number;

  name?: string;
  email?: string;
  clientId?: string;
  clientSecret?: string;
  topicName?: string;
  projectId?: string;

  ngOnInit() {
    console.log('EmailComponent inicializado');
  }

  get invalid(): boolean {
    return (
      !this.name ||
      !this.email ||
      !this.clientId ||
      !this.clientSecret ||
      !this.topicName ||
      !this.projectId
    );
  }

  onCancel() {
    this.ref.close(false);
  }

  createCredential() {
    this.gmailService.createCredential({
      name: this.name!,
      email: this.email!,
      clientId: this.clientId!,
      clientSecret: this.clientSecret!,
      topicName: this.topicName!,
      projectId: this.projectId!,
    });
  }
}
