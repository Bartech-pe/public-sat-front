import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { DialogService } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { EmailTemplateComponent } from './email-template/email-template.component';
import { ManageEmailComponent } from './manage-email/manage-email.component';
import { EmailCampaignService } from '@services/email-campaign.service';
import { EmailCampaignStore } from '@stores/email-campaign.store';
import { TagModule } from 'primeng/tag';
import { BtnDeleteComponent } from '@shared/buttons/btn-delete/btn-delete.component';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ButtonCountComponent } from '@shared/buttons/button-count/button-count.component';
import { PaginatorComponent } from '@shared/paginator/paginator.component';
@Component({
  selector: 'app-mail',
  imports: [
    TableModule,
    ButtonSaveComponent,
    TagModule,
    ButtonCountComponent,
    BtnDeleteComponent,
    Dialog,
    ButtonModule,
    PaginatorComponent,
    RippleModule,
  ],
  templateUrl: './mail.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``,
})
export class MailComponent implements OnInit {
  private readonly msg = inject(MessageGlobalService);
  private readonly dialogService = inject(DialogService);

  readonly emailCampaignStore = inject(EmailCampaignStore);
  readonly emailCampaignService = inject(EmailCampaignService);

  listaCampaniasSMS: any[] = [];
  openModal: boolean = true;
  openModalEmail: boolean = true;
  visible: boolean = false;
  listPreview: any[] = [];
  expandedRows: { [key: string]: boolean } = {};
  limit = signal(10);
  offset = signal(0);
  total = signal(0);

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.emailCampaignService.getAll(this.limit(), this.offset()).subscribe((res) => {
      this.total.set(res?.total??0);
      this.listaCampaniasSMS = res.data;
    });
  }


  onPageChange(event: { limit: number; offset: number }) {
    this.limit.set(event.limit);
    this.offset.set(event.offset);
    this.loadData();
  }

  openNew() {
    this.openModalEmail = true;
    const ref = this.dialogService.open(ManageEmailComponent, {
      header: 'Nueva Campaña - Correo',
      styleClass: 'modal-6xl',
      modal: true,
      dismissableMask: false,
      closable: true,
    });
    ref.onClose.subscribe((res) => {
      this.openModalEmail = false;
    });
  }

  openTemplate() {
    this.openModal = true;
    const ref = this.dialogService.open(EmailTemplateComponent, {
      header: 'Configuración de plantilla de correo electrónico',
      styleClass: 'modal-6xl',
      modal: true,
      dismissableMask: false,
      closable: true,
    });
    ref.onClose.subscribe((res) => {
       this.openModal = false;
       this.loadData();
    });
  }

  getStatusLabel(status: number): string {
    switch (status) {
      case 1:
        return 'Aprobado';
      case 2:
        return 'Cancelado';
      case 3:
        return 'Finalizado';
      default:
        return 'Desconocido';
    }
  }

  getStatusSeverity(status: number): string {
    switch (status) {
      case 1:
        return 'success'; // Verde (Aprobado)
      case 2:
        return 'danger'; // Rojo (Cancelado)
      case 3:
        return 'info'; // Azul (Finalizado)
      default:
        return 'secondary';
    }
  }

  edit(registro: any) {}

  visibleTemplate = false;
  selectedMessage: string = '';

  showTemplate(item: any) {
    this.selectedMessage = item.message;
    this.visibleTemplate = true;
  }

  remove(registro: any) {
    this.msg.confirm(
      `<div class='px-4 py-2'>
            <p class='text-center'> ¿Está seguro de eliminar la campaña <span class='uppercase font-bold'>${registro.name}</span>? </p>
            <p class='text-center'> Esta acción no se puede deshacer. </p>
          </div>`,
      () => {
        console.log("???????????????????????",registro.id)
        this.emailCampaignService.delete(registro.id);
      }
    );
  }

  verResultados(registro: any) {
    this.visible = true;
    this.emailCampaignService.getEmailTemplate(registro.id).subscribe((res) => {
      this.listPreview = res.data;
    });
  }
}
