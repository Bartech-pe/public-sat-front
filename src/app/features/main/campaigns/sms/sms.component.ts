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
import { TagModule } from 'primeng/tag';
import { Popover, PopoverModule } from 'primeng/popover';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { SmsCampaignStore } from '@stores/sms-campaign.store';
import { ButtonCountComponent } from '@shared/buttons/button-count/button-count.component';
import { MessagePreview } from '@models/sms-campaign.model';
import { SmsCampaignService } from '@services/sms-campaign.service';
import { Dialog } from 'primeng/dialog';
import { ButtonProgressComponent } from '@shared/buttons/button-progress/button-progress.component';
import { PaginatorComponent } from '@shared/paginator/paginator.component';

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
    PaginatorComponent,
    Dialog,
    ButtonProgressComponent,
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
  readonly smsStore = inject(SmsCampaignStore);

  listPreview: any[] = [];
  readonly smsCampaignService = inject(SmsCampaignService);
  ngOnInit() {
    this.loadData();
  }

  limit = signal(10);
  offset = signal(0);
  total = signal(0);

  private loadData() {
    this.smsStore.loadAll(this.limit(), this.offset());
  }

  smsCampanias() {
    return this.smsStore.items().sort((a, b) => b.id - a.id);
  }

  get getTotalItems(): number
  {
    return this.smsStore.totalItems()
  }

  onPageChange(event: { limit: number; offset: number }) {
    this.limit.set(event.limit);
    this.offset.set(event.offset);
    this.loadData();
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
    this.smsCampaignService.getMessagePreviewDetails(item.id).subscribe((res) => {
      this.listPreview = res.messages;
      this.response=res;
    });
  }
  response:any;
  downloadReport(item: any) {
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
