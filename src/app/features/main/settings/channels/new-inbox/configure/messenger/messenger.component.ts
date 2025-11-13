import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-messenger',
  imports: [ButtonModule, ToastModule],
  templateUrl: './messenger.component.html',
  providers: [MessageService],
  styles: ``
})
export class MessengerComponent {
  connectFacebook() {
    // Simulación de autenticación con Facebook OAuth
    console.log('Redirigiendo a Facebook para autenticación...');
    window.location.href = 'https://www.facebook.com/v12.0/dialog/oauth?...'; // Coloca tu URL OAuth
  }
}
