import { Component, inject, OnInit } from '@angular/core';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { DialogService } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { EmailTemplateComponent } from './email-template/email-template.component';
import { ManageEmailComponent } from './manage-email/manage-email.component';
import { CampaignEmailConfigService } from '@services/campaign-email-config.service';
import { CampaignEmailConfigStore } from '@stores/campaign-email-config.store';
import { TagModule } from 'primeng/tag';
import { EditorModule } from 'primeng/editor';
import { BtnDeleteComponent } from '@shared/buttons/btn-delete/btn-delete.component';
import { ButtonDetailComponent } from '@shared/buttons/button-detail/button-detail.component';
import { ButtonEditComponent } from '@shared/buttons/button-edit/button-edit.component';

@Component({
  selector: 'app-mail',
  imports: [TableModule, ButtonSaveComponent,TagModule,ButtonEditComponent, BtnDeleteComponent,ButtonDetailComponent],
  templateUrl: './mail.component.html',
  styles: ``,
})
export class MailComponent implements OnInit {
  private readonly msg = inject(MessageGlobalService);
  private readonly dialogService = inject(DialogService);

  readonly templateEmailStore = inject(CampaignEmailConfigStore);
  readonly templateEmailService = inject(CampaignEmailConfigService);
  
  listaCampaniasSMS: any[] = [];
  openModal:boolean = true;
  openModalEmail:boolean = true;
  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
     this.templateEmailService.getAll().subscribe(res=>{
      console.log(res)
       this.listaCampaniasSMS  = res.data;
     })
  }

  openNew() {
    this.openModalEmail = true;
    const ref = this.dialogService.open(ManageEmailComponent, {
      header: 'Configuración de Campaña de Correo',
      styleClass: 'modal-6xl',
      modal: true,
      dismissableMask: false,
      closable: true,
    });
    ref.onClose.subscribe((res) => {
      this.openModalEmail = false;
    });
  }


  openTemplate(){
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

  edit(registro: any) {

  }
  remove(registro: any) {
    
  }
  verResultados(registro: any) {
    
  }

  
}
