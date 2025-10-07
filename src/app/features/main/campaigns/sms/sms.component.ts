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

@Component({
  selector: 'app-sms',
  imports: [
    TableModule,
    InputTextModule,
    ButtonModule,
    FormsModule,
    BreadcrumbModule,
    ButtonSaveComponent,
    TagModule,
    ButtonCountComponent,
    ButtonDownloadComponent,
    ButtonEditComponent,
    PopoverModule,
  ],
  templateUrl: './sms.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``,
})
export class SmsComponent implements OnInit {
  listaCampaniasSMS: any[] = [];

  openModal: boolean = false;

  @ViewChild('op') op!: Popover;

  private readonly msg = inject(MessageGlobalService);
  private readonly dialogService = inject(DialogService);
  readonly smsStore = inject(SmsCampaningStore);

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

  downloadReport(item: any) {
    this.msg.success('Reporte descargado con éxito');
  }

  edit(id: number) {
    this.openModal = true;
    const ref = this.dialogService.open(FormSmsComponent, {
      header: 'Editar Campaña SMS - Excel',
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
  }
}
