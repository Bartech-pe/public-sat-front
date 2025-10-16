import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms'; // 👈 necesario para [(ngModel)]
import { GmailService } from '@services/gmail.service';
import { StepperModule } from 'primeng/stepper';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-email',
  imports: [
    ButtonModule,
    ToastModule,
    FormsModule,
    TextareaModule,
    StepperModule,
    ButtonSaveComponent,
  ],
  templateUrl: './email.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``,
})
export class EmailComponent {
  name: string = 'SAT - Mail';
  email: string = 'demo.correo.sat@gmail.com';
  clientId: string =
    '704373357101-c9p6e5jb86ar9co0c36t7j3ahf2mdav6.apps.googleusercontent.com';
  clientSecret: string = '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';
  topicName: string = 'email-notifications';
  projectId: string = 'giusen-lab';

  constructor(
    private msg: MessageGlobalService,
    private gmailService: GmailService
  ) {}

  ngOnInit() {
    console.log('📩 EmailComponent inicializado');
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

  createCredential(activateCallback: any) {
    this.gmailService
      .createCredential({
        name: this.name,
        email: this.email,
        clientId: this.clientId,
        clientSecret: this.clientSecret,
        topicName: this.topicName,
        projectId: this.projectId,
      })
      .subscribe({
        next: (res) => {
          console.log('✅ Credencial creada:', res);
          this.msg.success('Credencial creada correctamente');
          activateCallback(2);
        },
        error: (err) => {
          console.error('❌ Error creando credencial', err);
          this.msg.error(
            err?.error?.message || 'No se pudo crear la credencial'
          );
        },
      });
  }

  connectEmail() {
    this.gmailService.loginWithGoogle();
  }
}
