import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
  signal,
} from '@angular/core';
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
import { EndedCallsComponent } from './ended-calls/ended-calls.component';
import { TabsModule } from 'primeng/tabs';
import { SupervisionComponent } from './supervision/supervision.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

type ViewType = 'supervisor' | 'ended-calls';

@Component({
  selector: 'app-call-management',
  imports: [
    CommonModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    FormsModule,
    BreadcrumbModule,
    SelectModule,
    DatePickerModule,
    CardModule,
    TabsModule,
    EndedCallsComponent,
    SupervisionComponent,
  ],
  templateUrl: './call-management.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``,
})
export class CallManagementComponent implements OnInit {
  openModal: boolean = false;

  private readonly router = inject(Router);

  private readonly route = inject(ActivatedRoute);

  private readonly msg = inject(MessageGlobalService);

  private readonly dialogService = inject(DialogService);

  originalRoute: string = '';

  viewValue = signal<ViewType>('supervisor');

  ngOnInit(): void {
    this.originalRoute = this.router.url.split('?')[0];
    console.log('Ruta original:', this.originalRoute);
    this.route.queryParams.subscribe((params) => {
      const view = params['view'] ?? 'supervisor';
      this.viewValue.set(view);
    });
  }

  changeView(view: ViewType) {
    this.router.navigate([this.originalRoute], {
      queryParams: { view },
    });
  }

  openNew() {
    this.openModal = true;
    const ref = this.dialogService.open(FormLlamadasComponent, {
      header: 'Campaña de llamadas',
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
