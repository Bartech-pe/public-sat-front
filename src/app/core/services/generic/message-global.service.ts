import { inject, Injectable } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class MessageGlobalService {
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  toast(
    severity: 'success' | 'info' | 'warn' | 'error',
    summary: string,
    detail: string,
    life: number = 3000
  ) {
    this.messageService.add({
      severity,
      summary,
      detail,
      life,
    });
  }

  confirm(
    message: string,
    acceptCallback: () => void,
    rejectCallback?: () => void,
    header: string = 'Confirmar',
  ) {
    this.confirmationService.confirm({
      message,
      header,
      acceptLabel: '¡De acuerdo!',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-primary p-button-sm !px-2 !py-1.5 !rounded-full',
      rejectButtonStyleClass: 'p-button-contrast p-button-sm !px-2 !py-1.5',
      rejectVisible: !!rejectCallback,
      accept: acceptCallback,
      reject: rejectCallback,
    });
  }

  error(msg: string, summary: string = 'Error', life?: number) {
    this.toast('error', summary, msg, life);
  }

  info(msg: string, summary: string = 'Info', life?: number) {
    this.toast('info', summary, msg, life);
  }

  success(msg: string, summary: string = 'Éxito', life?: number) {
    this.toast('success', summary, msg, life);
  }

  warn(msg: string, summary: string = 'Aviso', life?: number) {
    this.toast('warn', summary, msg, life);
  }
}
