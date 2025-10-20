import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonCustomSquareComponent } from '@shared/buttons/btn-custom-square/btn-custom-square.component';
import { TitleSatComponent } from '@shared/title-sat/title-sat.component';
import { AuthStore } from '@stores/auth.store';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { ChipModule } from 'primeng/chip';
import { DialogService } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { PhoneFormatPipe } from '@pipes/phone-format.pipe';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { TooltipModule } from 'primeng/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { CompleteManagementComponent } from './complete-management/complete-management.component';
import { SelectModule } from 'primeng/select';
import { PortfolioDetailService } from '@services/portfolio-detail.service';
import { Office } from '@models/office.model';
import { PortfolioDetail } from '@models/portfolio-detail.model';
import { Portfolio } from '@models/portfolio.model';
import { PortfolioStore } from '@stores/portfolio.store';
import { PortfolioDetailStore } from '@stores/portfolio-detail.store';
import { CitizenContact } from '@models/citizen.model';
import { PaginatorComponent } from '@shared/paginator/paginator.component';
@Component({
  selector: 'app-assignments',
  imports: [
    CommonModule,
    TitleSatComponent,
    CardModule,
    DividerModule,
    TooltipModule,
    TableModule,
    FormsModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
    PhoneFormatPipe,
    ButtonModule,
    ChipModule,
    ButtonCustomSquareComponent,
    CompleteManagementComponent,
    PaginatorComponent,
  ],
  providers: [MessageGlobalService],
  templateUrl: './assignments.component.html',
  styles: ``,
})
export class AssignmentsComponent implements OnInit {
  createButtonLabel: string = 'área';

  private readonly dialogService = inject(DialogService);

  private readonly router = inject(Router);

  private readonly route = inject(ActivatedRoute);

  private readonly msg = inject(MessageGlobalService);

  private readonly store = inject(AuthStore);

  readonly portfolioStore = inject(PortfolioStore);

  readonly portfolioDetailStore = inject(PortfolioDetailStore);

  readonly portfolioDetailService = inject(PortfolioDetailService);

  openModal: boolean = false;

  get name(): string | undefined {
    return this.store.user()?.name;
  }

  get userId(): number | undefined {
    return this.store.user()?.id;
  }

  get office(): Office | undefined {
    return this.store.user()?.office;
  }

  get officeFullName() {
    return !!this.office
      ? `| ${this.office?.department?.name} : ${this.office?.name}`
      : '';
  }

  get portfolioList(): Portfolio[] {
    return this.portfolioStore.items();
  }

  portfolioId?: number;

  get portfolioSelected(): Portfolio | undefined {
    return this.portfolioList.find((p) => p.id === this.portfolioId);
  }

  limit = signal(5);
  offset = signal(0);
  totalItems: number = 0;
  portfolioDetailManaged: number = 0;

  portfolioDetail: PortfolioDetail[] = [];

  get cardItems() {
    return [
      {
        label: 'asignados',
        total: this.totalAsignado,
      },
      {
        label: 'gestionados',
        total: this.portfolioDetailManaged,
      },
      {
        label: 'sin gestionar',
        total: this.totalAsignado - this.portfolioDetailManaged,
      },
      // {
      //   label: 'Cerrado',
      //   total: 45,
      // },
    ];
  }

  get totalAsignado(): number {
    return this.totalItems;
  }

  get totalSinGestionar(): number {
    return this.portfolioDetail.filter((item) => !item.status).length;
  }

  get totalGestionado(): number {
    return this.portfolioDetail.filter((item) => item.status).length;
  }

  estados = [
    { label: 'Todos', value: '' },
    { label: 'Sin Gestionar', value: 'Abierto' },
    { label: 'Gestionado', value: 'En proceso' },
  ];

  segmento: { label: string; value: string }[] = [];

  perfil = [
    { label: 'Perfil', value: '' },
    { label: '1_Normal', value: 'Normal' },
    { label: '2_BajaMora', value: 'BajaMora' },
    { label: '3_AltaMora', value: 'AltaMora' },
  ];

  filtroRangoFecha: Date[] = [];

  // NUEVAS PROPIEDADES PARA FILTROS
  tipoContribSelected = signal<string | undefined>(undefined);
  segmentSelected = signal<string | undefined>(undefined);
  profileSelected = signal<string | undefined>(undefined);
  debtFrom = signal<string | undefined>(undefined);
  debtTo = signal<string | undefined>(undefined);
  searchText = signal<string | undefined>(undefined);
  estadoSelected = signal<string | undefined>(undefined);

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

  // GETTER PARA DATOS FILTRADOS
  get portfolioDetailFiltered(): PortfolioDetail[] {
    let filtered = [...this.portfolioDetail];

    // Filtro por texto de búsqueda
    const searchTerm = this.searchText()?.toLowerCase().trim();
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.code?.toLowerCase().includes(searchTerm) ||
          item.taxpayerName?.toLowerCase().includes(searchTerm) ||
          item.citizenContacts.some((co) => co.value.includes(searchTerm))
      );
    }

    // Filtro por tipo de contribuyente
    const tipoContrib = this.tipoContribSelected();
    if (tipoContrib) {
      filtered = filtered.filter((item) => item.taxpayerType === tipoContrib);
    }
    // Filtro por estado
    const estado = this.estadoSelected();
    if (estado && estado !== '') {
      if (estado === 'Abierto') {
        filtered = filtered.filter((item) => !item.status);
      } else if (estado === 'En proceso') {
        filtered = filtered.filter((item) => item.status);
      }
    }

    // Filtro por segment
    const segment = this.segmentSelected();
    if (segment) {
      filtered = filtered.filter((item) => item.segment === segment);
    }

    // Filtro por profile
    const profile = this.profileSelected();
    if (profile) {
      filtered = filtered.filter((item) => item.profile === profile);
    }

    // Filtro por rango de deuda
    const desde = parseFloat(this.debtFrom()!);
    const hasta = parseFloat(this.debtTo()!);

    if (!isNaN(desde)) {
      filtered = filtered.filter((item) => item.currentDebt! >= desde);
    }

    if (!isNaN(hasta)) {
      filtered = filtered.filter((item) => item.currentDebt! <= hasta);
    }

    return filtered;
  }

  originalRoute: string = '';

  idSelected?: number;
  type?: string;

  ngOnInit(): void {
    this.originalRoute = this.router.url.split('?')[0];
    console.log('Ruta original:', this.originalRoute);
    this.route.queryParams.subscribe((params) => {
      const portfolio = params['portfolio'];
      this.type = params['type'];
      this.idSelected = params['id'];

      if (portfolio && !isNaN(portfolio)) {
        this.portfolioId = Number(portfolio);

        this.loadDataPortfolioDetail();
        // Si existe type=GestiónCompleta pero no id → limpiar queryParams
        if (this.type === 'GestiónCompleta' && !this.idSelected) {
          this.router.navigate([this.originalRoute], { replaceUrl: true });
        }
      }
    });
    this.loadPortfolios();
  }

  get portfolioDetailSelect(): PortfolioDetail | undefined {
    return this.portfolioDetail.find((d) => d.id == this.idSelected);
  }

  loadPortfolios() {
    this.portfolioStore.loadAll();
  }

  loadDataPortfolioDetail() {
    this.portfolioDetailService
      .findAllByUserToken(this.portfolioId!, this.limit(), this.offset())
      .subscribe({
        next: (res) => {
          this.portfolioDetail = res.data;
          this.totalItems = res.total ?? 0;
          this.portfolioDetailManaged = res.managed;
        },
      });
  }

  onPageChange(event: { limit: number; offset: number }) {
    this.limit.set(event.limit);
    this.offset.set(event.offset);
    this.loadDataPortfolioDetail();
  }

  selectPortfolio() {
    this.router.navigate([this.originalRoute], {
      queryParams: {
        portfolio: this.portfolioId,
      },
    });
  }

  cleanWhatsapp(whatsapp: string): string {
    if (!whatsapp) return '';
    // Elimina cualquier prefijo wa.me/, http://wa.me/, https://wa.me/
    return whatsapp.replace(/^https?:\/\/?wa\.me\//, '').replace('wa.me/', '');
  }

  copyEmail(email: string) {
    if (!email) return;
    navigator.clipboard
      .writeText(email)
      .then(() => {
        // Aquí podrías mostrar un toast de PrimeNG si quieres
        this.msg.success(
          'El email fue copiado correctamente.',
          'Texto Copiado',
          2000
        );
      })
      .catch((err) => {
        console.error('Error al copiar el email', err);
      });
  }

  calcularDiasRestantes(fechaVencimiento: Date): string {
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diff = vencimiento.getTime() - hoy.getTime();
    const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return dias > 0 ? dias.toString() : 'Vencido';
  }

  completeManagement(item: PortfolioDetail) {
    this.router.navigate([this.originalRoute], {
      queryParams: {
        portfolio: this.portfolioId,
        type: 'GestiónCompleta',
        id: item?.id,
      },
    });
  }

  closeCompleteManagement() {
    this.router.navigate([this.originalRoute], {
      queryParams: {
        portfolio: this.portfolioId,
      },
      replaceUrl: true,
    });
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
}
