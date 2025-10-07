import { Component, inject, OnInit } from '@angular/core';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { DialogService } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { EmailTemplateComponent } from './email-template/email-template.component';
import { ManageEmailComponent } from './manage-email/manage-email.component';
import { CampaignEmailConfigService } from '@services/campaign-email-config.service';
import { CampaignEmailConfigStore } from '@stores/campaign-email-config.store';

@Component({
  selector: 'app-mail',
  imports: [TableModule, ButtonSaveComponent],
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

  
}
