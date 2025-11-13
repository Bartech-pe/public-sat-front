import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-sms',
  imports: [
    DropdownModule,
    InputMaskModule,
    InputTextModule,
    FormsModule,
    ButtonModule,
    ConfirmDialogModule,
    ToastModule,
    CheckboxModule
  ],
  templateUrl: './sms.component.html',
  providers: [ConfirmationService, MessageService],
  styles: ``
})
export class SmsComponent {
 providers = [
    { label: 'Twilio', value: 'twilio' },
    { label: 'Otro proveedor', value: 'other' }
  ];

  selectedProvider = signal('');
  inboxName = signal('');
  phone = signal('');
  useTwilio = signal(false);
  accountSid = signal('');
  useApiAuth = signal(false);
  authToken = signal('');

  onProviderChange(e: any) {
    this.selectedProvider.set(e.value);
  }

  onInboxNameChange(e: Event) {
    this.inboxName.set((e.target as HTMLInputElement).value);
  }

  onPhoneChange(e: Event) {
    this.phone.set((e.target as HTMLInputElement).value);
  }

  onUseTwilioChange(e: any) {
    this.useTwilio.set(e.checked);
  }

  onAccountSidChange(e: Event) {
    this.accountSid.set((e.target as HTMLInputElement).value);
  }

  onUseApiAuthChange(e: any) {
    this.useApiAuth.set(e.checked);
  }

  onAuthTokenChange(e: Event) {
    this.authToken.set((e.target as HTMLInputElement).value);
  }

  confirmPhone(event: Event) {
    // lógica de confirmación
  }

  createChannel() {
    console.log({
      provider: this.selectedProvider(),
      inboxName: this.inboxName(),
      phone: this.phone(),
      useTwilio: this.useTwilio(),
      accountSid: this.accountSid(),
      useApiAuth: this.useApiAuth(),
      authToken: this.authToken()
    });
  }
}
