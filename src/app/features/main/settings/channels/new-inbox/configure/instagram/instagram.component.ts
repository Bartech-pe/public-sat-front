import { Component } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-instagram',
  imports: [ButtonModule, ToastModule],
  templateUrl: './instagram.component.html',
  providers: [ConfirmationService, MessageService],
  styles: ``
})
export class InstagramComponent {
  connectInstagram() {
    // Aquí iría la lógica de redirección a Instagram OAuth
    console.log('Redirigiendo a Instagram para autenticación...');
    window.location.href = 'https://www.instagram.com/oauth/authorize?...'; // reemplazar con URL real
  }

}
