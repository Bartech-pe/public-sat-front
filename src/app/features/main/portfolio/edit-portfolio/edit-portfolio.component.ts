import { CommonModule } from '@angular/common';

import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'angular-calendar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import {
  DialogService,
  DynamicDialogModule,
  DynamicDialogConfig,
} from 'primeng/dynamicdialog';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { Select } from 'primeng/select';
import { SliderModule } from 'primeng/slider';
import { RadioButton } from 'primeng/radiobutton';
import { AssignPortfolioComponent } from '../assign-portfolio/assign-portfolio.component';
import { TransferPortfolioComponent } from '../transfer-portfolio/transfer-portfolio.component';
import { FieldsetModule } from 'primeng/fieldset';
import { PortfolioDetail } from '@models/portfolio-detail.model';
import { PortfolioDetailService } from '@services/portfolio-detail.service';
import { PaginatorComponent } from '@shared/paginator/paginator.component';
import { CitizenContact } from '@models/citizen.model';
import { InputNumberModule } from 'primeng/inputnumber';
interface General {
  name: string;
  id: number;
}

@Component({
  selector: 'app-edit-portfolio',
  imports: [
    DynamicDialogModule,
    CommonModule,
    FormsModule,
    TableModule,
    InputTextModule,
    InputNumberModule,
    CalendarModule,
    FieldsetModule,
    ButtonModule,
    SliderModule,
    RadioButton,
    Select,
    PaginatorComponent,
  ],
  templateUrl: './edit-portfolio.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``,
})
export class EditPortfolioComponent implements OnInit {
  detalleCartera: any[] = [];
  detalleCarteraFiltrado: any[] = [];

  listEstados: General[] | undefined;
  selectestados: string = '';
  selectSegmento: string = '';
  selectPerfil: string = '';

  filtroEstado: string = '';
  filtroRangoFecha: Date[] = [];

  portfolioId?: number;

  officeId?: number;

  limit = signal(10);
  offset = signal(0);
  totalItems: number = 0;

  portfolioDetail: PortfolioDetail[] = [];

  filtroNombre: string = '';
  tipoAsignacion: '1' | '2' | null = null;

  tipoList: { value: string; label: string }[] = [
    {
      value: '1',
      label: 'Reasignación',
    },
    // {
    //   value: '2',
    //   label: 'Transferencia',
    // },
  ];

  get labelAsignacion(): string | undefined {
    return this.tipoList.find((item) => item.value == this.tipoAsignacion)
      ?.label;
  }

  estados = [
    { label: 'Todos', value: undefined },
    { label: 'Sin Gestionar', value: false },
    { label: 'Gestionado', value: true },
  ];

  get taxpayerTypes(): string[] {
    return Array.from(
      new Set(this.portfolioDetail.map((d) => d.taxpayerType!))
    );
  }

  get profiles(): string[] {
    return Array.from(new Set(this.portfolioDetail.map((d) => d.profile!)));
  }

  get segments(): string[] {
    return Array.from(new Set(this.portfolioDetail.map((d) => d.segment!)));
  }

  tipoContribSelected = signal<string | undefined>(undefined);
  segmentSelected = signal<string | undefined>(undefined);
  profileSelected = signal<string | undefined>(undefined);
  debtFrom = signal<number | undefined>(undefined);
  debtTo = signal<number | undefined>(undefined);
  searchText = signal<string | undefined>(undefined);
  estadoSelected = signal<boolean | undefined>(undefined);

  selectedRows: PortfolioDetail[] = [];

  constructor(
    public config: DynamicDialogConfig,
    private dialogService: DialogService,
    private msg: MessageGlobalService,
    private portfolioDetailService: PortfolioDetailService
  ) {}

  ngOnInit(): void {
    this.listEstados = [
      { name: 'Sin Asignar', id: 1 },
      { name: 'Asignado', id: 2 },
    ];

    if (this.config.data) {
      const { portfolioId, officeId } = this.config.data;
      this.portfolioId = portfolioId;
      this.officeId = officeId;
      this.loadDataPortfolioDetail();
    }

    // Aquí puedes cargar la cartera con ese ID si es necesario
  }

  toggleSeleccion(value: '1' | '2') {
    this.tipoAsignacion = this.tipoAsignacion === value ? null : value;
  }

  loadDataPortfolioDetail() {
    this.portfolioDetailService
      .findAllByPortfolioId(this.portfolioId!, this.limit(), this.offset(), {
        search: this.searchText()?.toLowerCase().trim(),
        taxpayerType: this.tipoContribSelected()?.toLowerCase().trim(),
        status: this.estadoSelected(),
        segment: this.segmentSelected()?.toLowerCase().trim(),
        profile: this.profileSelected()?.toLowerCase().trim(),
        range: this.debtFrom()
          ? {
              from: this.debtFrom(),
              to: this.debtTo(),
            }
          : undefined,
      })
      .subscribe({
        next: (res) => {
          this.portfolioDetail = res.data;
          this.totalItems = res.total ?? 0;
        },
      });
  }

  onPageChange(event: { limit: number; offset: number }) {
    console.log('event', event);
    this.selectedRows = [];
    this.limit.set(event.limit);
    this.offset.set(event.offset);
    this.loadDataPortfolioDetail();
  }

  mostrarRegistro() {
    console.log(this.selectedRows);
    if (!this.selectedRows || this.selectedRows.length === 0) {
      this.msg.error('Debe seleccionar un caso como minimo.');
      return;
    }
    if (this.tipoAsignacion == '1') {
      const ref = this.dialogService.open(AssignPortfolioComponent, {
        data: {
          portfolioId: this.portfolioId,
          selectedRows: this.selectedRows,
          officeId: this.officeId,
        },
        header:
          'Reasignar ' + this.selectedRows.length + ' Casos Seleccionados',
        styleClass: 'modal-lg',
        modal: true,
        dismissableMask: false,
        closable: true,
      });
      ref.onClose.subscribe((res) => {
        if (res) {
          this.selectedRows = [];
          this.loadDataPortfolioDetail();
        }
      });
    } else if (this.tipoAsignacion == '2') {
      const ref = this.dialogService.open(TransferPortfolioComponent, {
        header:
          'Trasnferir a PRICOS ' +
          this.selectedRows.length +
          ' Casos Seleccionados',
        styleClass: 'modal-lg',
        modal: true,
        dismissableMask: false,
        closable: true,
      });
      ref.onClose.subscribe((res) => {
        if (res) {
          this.loadDataPortfolioDetail();
        }
      });
    }
  }

  getPhoneContacts(contacts: CitizenContact[]): CitizenContact[] {
    return contacts
      .filter((item) => item.contactType === 'PHONE')
      .map((item, i) => ({ ...item, label: `Teléfono ${i + 1}` }));
  }

  getWhatsappContacts(contacts: CitizenContact[]): CitizenContact[] {
    return contacts
      .filter((item) => item.contactType === 'WHATSAPP')
      .map((item, i) => ({ ...item, label: `Whatsapp ${i + 1}` }));
  }

  getEmailContacts(contacts: CitizenContact[]): CitizenContact[] {
    return contacts
      .filter((item) => item.contactType === 'EMAIL')
      .map((item, i) => ({ ...item, label: `Email ${i + 1}` }));
  }

  onDebtChange(type: 'from' | 'to', event: any) {
    const debtFrom = this.debtFrom() ?? 0;
    const debtTo = this.debtTo() ?? 0;

    // Si debtTo queda por debajo, lo forzamos a debtFrom
    if (debtTo <= debtFrom) {
      this.debtTo.set(debtFrom + 100);
    }
  }

  search() {
    this.loadDataPortfolioDetail();
  }

  clear() {
    this.searchText.set(undefined);
    this.tipoContribSelected.set(undefined);
    this.estadoSelected.set(undefined);
    this.segmentSelected.set(undefined);
    this.profileSelected.set(undefined);
    this.debtFrom.set(undefined);
    this.debtTo.set(undefined);
    this.loadDataPortfolioDetail();
  }
}
