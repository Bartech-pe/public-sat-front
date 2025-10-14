import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { FormSmsComponent } from './form-sms/form-sms.component';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { ButtonEditComponent } from '@shared/buttons/button-edit/button-edit.component';
import { TagModule } from 'primeng/tag';
import { Popover, PopoverModule } from 'primeng/popover';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { SmsCampaningStore } from '@stores/sms-campaing.store';
import { ButtonDownloadComponent } from '@shared/buttons/button-download/button-download.component';
import { ButtonCountComponent } from '@shared/buttons/button-count/button-count.component';
import { MessagePreview } from '@models/sms-campaing';
import { parse } from 'path';
import { SmsCampaingService } from '@services/sms-campania.service';
import { Dialog } from 'primeng/dialog';
import { ButtonCancelComponent } from '@shared/buttons/button-cancel/button-cancel.component';
import { ButtonDetailComponent } from '@shared/buttons/button-detail/button-detail.component';
import { ButtonProgressComponent } from '@shared/buttons/button-progress/button-progress.component';

@Component({
  selector: 'app-sms',
  imports: [
    TableModule,
    InputTextModule,
    ButtonModule,
    FormsModule,
    BreadcrumbModule,
    ButtonSaveComponent,
    ButtonSaveComponent,
    TagModule,
    ButtonCountComponent,
    PopoverModule,
    ButtonCancelComponent,
    Dialog,
    ButtonProgressComponent
  ],
  templateUrl: './sms.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``,
})
export class SmsComponent implements OnInit {
  listaCampaniasSMS: any[] = [];

  openModal: boolean = false;
  visible: boolean = false;
  @ViewChild('op') op!: Popover;

  private readonly msg = inject(MessageGlobalService);
  private readonly dialogService = inject(DialogService);
  readonly smsStore = inject(SmsCampaningStore);

  listPreview: any[] = [];
  readonly smsCampaingService = inject(SmsCampaingService);
  ngOnInit() {
    this.loadData();
  }

  limit = signal(100);
  offset = signal(0);

  private loadData() {
    this.smsStore.loadAll(this.limit(), this.offset());
  }

  smsCampanias() {
    return this.smsStore.items().sort((a, b) => b.id - a.id);
  }

  openNew() {
    this.openModal = true;
    const ref = this.dialogService.open(FormSmsComponent, {
      header: 'Nueva Campaña - SMS',
      styleClass: 'modal-6xl',
      modal: true,
      dismissableMask: false,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      this.openModal = false;
      if (res) {
        this.loadData(); // método que vuelve a consultar las campañas
      }
    });
  }

  viewdata(item: any) {
    const request: MessagePreview = {
      rows: JSON.parse(item.excel_data),
      message: item.message,
      contact: item.contact ?? '',
    };
    this.smsCampaingService.getMessagePreview(request).subscribe((res) => {
      this.listPreview = res;
    });
  }

  downloadReport(item: any) {
    // this.msg.success('Reporte descargado con éxito');
    console.log(item);
    this.viewdata(item);
    this.visible = true;
  }

  edit(id: number) {
    this.openModal = true;
    const ref = this.dialogService.open(FormSmsComponent, {
      header: 'Editar Campaña SMS',
      styleClass: 'modal-6xl',
      modal: true,
      dismissableMask: false,
      closable: true,
      data: id,
    });

    ref.onClose.subscribe((res) => {
      this.openModal = false;
      if (res) {
        this.loadData(); // método que vuelve a consultar las campañas
      }
    });
  }

  count(item: any) {
    this.op.toggle(event);
    this.viewdata(item);
  }
}
