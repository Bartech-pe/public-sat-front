import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms'; // 👈 necesario para [(ngModel)]
import { GmailService } from '@services/gmail.service';

@Component({
  selector: 'app-email',
  imports: [ButtonModule, ToastModule, FormsModule],
  templateUrl: './email.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [MessageService],
  styles: ``
})
export class EmailComponent {
  email: string = 'demo.correo.sat@gmail.com';
  clientId: string = '704373357101-c9p6e5jb86ar9co0c36t7j3ahf2mdav6.apps.googleusercontent.com';
  clientSecret: string = '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';
  topicName: string = 'email-notifications';
  projectId: string = 'giusen-lab';

  constructor(
    private messageService: MessageService,
    private gmailService: GmailService
  ) {}

  ngOnInit() {
    console.log('📩 EmailComponent inicializado');
  }

  createCredential() {
    this.gmailService.createCredential({
      email: this.email,
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      topicName: this.topicName,
      projectId: this.projectId
    }).subscribe({
      next: res => {
        console.log('✅ Credencial creada:', res);
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Credencial creada correctamente' });
      },
      error: err => {
        console.error('❌ Error creando credencial', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || 'No se pudo crear la credencial' });
      }
    });
  }

  connectEmail() {
    this.gmailService.loginWithGoogle();
  }

}
