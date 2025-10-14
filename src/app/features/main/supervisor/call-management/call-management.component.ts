import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { DialogService } from 'primeng/dynamicdialog';

import { MessageGlobalService } from '@services/generic/message-global.service';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { FormLlamadasComponent } from './form-llamadas/form-llamadas.component';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { FinalizadasComponent } from './finalizadas/finalizadas.component';
import { TabsModule } from 'primeng/tabs';
import { SupervisionComponent } from './supervision/supervision.component';

@Component({
  selector: 'app-call-management',
  imports: [
    TableModule,
    InputTextModule,
    ButtonModule,
    FormsModule,
    BreadcrumbModule,
    SelectModule,
    DatePickerModule,
    FinalizadasComponent,
    TabsModule,
    SupervisionComponent,
  ],
  templateUrl: './call-management.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``,
})
export class CallManagementComponent {
  openModal: boolean = false;

  private readonly msg = inject(MessageGlobalService);
  private readonly dialogService = inject(DialogService);

  openNew() {
    this.openModal = true;
    const ref = this.dialogService.open(FormLlamadasComponent, {
      header: 'campaña de LLamadas',
      styleClass: 'modal-md',
      modal: true,
      dismissableMask: false,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      this.openModal = false;
    });
  }
}
