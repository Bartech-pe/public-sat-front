import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DetalleCartera } from '@models/detalleCartera.model';
import { Oficina } from '@models/oficina.model';
import { CarteraDetalleService } from '@services/detalleCartera.service';
import { ButtonCustomSquareComponent } from '@shared/buttons/btn-custom-square/btn-custom-square.component';
import { ButtonCustomComponent } from '@shared/buttons/btn-custom/btn-custom.component';
import { TitleSatComponent } from '@shared/title-sat/title-sat.component';
import { AuthStore } from '@stores/auth.store';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { DialogService } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { PhoneFormatPipe } from '@pipes/phone-format.pipe';
import { MessageGlobalService } from '@services/message-global.service';
import { TooltipModule } from 'primeng/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { GestionCompletaComponent } from './gestion-completa/gestion-completa.component';
import { SelectModule } from 'primeng/select';
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
    SelectModule,
    InputTextModule,
    DatePickerModule,
    PhoneFormatPipe,
    ButtonModule,
    ButtonCustomComponent,
    ButtonCustomSquareComponent,
    GestionCompletaComponent,
  ],
  providers: [MessageGlobalService],
  templateUrl: './assignments.component.html',
  styles: ``,
})
export class AssignmentsComponent implements OnInit {
  createButtonLabel: string = 'Crear área';

  private readonly dialogService = inject(DialogService);

  private readonly router = inject(Router);

  private readonly route = inject(ActivatedRoute);

  private readonly msg = inject(MessageGlobalService);

  private readonly store = inject(AuthStore);

  readonly carteraDetalleService = inject(CarteraDetalleService);

  get name(): string | undefined {
    return this.store.user()?.name;
  }

  get iduser(): number | undefined {
    return this.store.user()?.id;
  }

  get oficina(): Oficina | undefined {
    return this.store.user()?.oficina;
  }

  detalleCartera: DetalleCartera[] = [];

  get cardItems() {
    return [
      {
        label: 'Total asignados',
        total: this.totalAsignado,
      },
      {
        label: 'Sin gestionar',
        total: this.totalSinGestionar,
      },
      {
        label: 'Gestionado',
        total: this.totalGestionado,
      },
      // {
      //   label: 'Cerrado',
      //   total: 45,
      // },
    ];
  }

  get totalAsignado(): number {
    return this.detalleCartera.length;
  }

  get totalSinGestionar(): number {
    return this.detalleCartera.filter((item) => !item.status).length;
  }

  get totalGestionado(): number {
    return this.detalleCartera.filter((item) => item.status).length;
  }

  estados = [
    { label: 'Sin Gestionar', value: 'Abierto' },
    { label: 'Gestionado', value: 'En proceso' },
  ];

  filtroRangoFecha: Date[] = [];

  // NUEVAS PROPIEDADES PARA FILTROS
  tipoContribSelected = signal<string | undefined>(undefined);
  segmentoSelected = signal<string | undefined>(undefined);
  perfilSelected = signal<string | undefined>(undefined);
  deudaDesde = signal<string | undefined>(undefined);
  deudaHasta = signal<string | undefined>(undefined);
  searchText = signal<string | undefined>(undefined);
  estadoSelected = signal<string | undefined>(undefined);

  get tipoContribuyentes(): string[] {
    return Array.from(
      new Set(this.detalleCartera.map((d) => d.tipoContribuyente!))
    );
  }

  get perfiles(): string[] {
    return Array.from(new Set(this.detalleCartera.map((d) => d.perfil!)));
  }

  get segmentos(): string[] {
    return Array.from(new Set(this.detalleCartera.map((d) => d.segmento!)));
  }

  // GETTER PARA DATOS FILTRADOS
  get detalleCarteraFiltrada(): DetalleCartera[] {
    let filtered = [...this.detalleCartera];

    // Filtro por texto de búsqueda
    const searchTerm = this.searchText()?.toLowerCase().trim();
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.codigo?.toLowerCase().includes(searchTerm) ||
          item.contribuyente?.toLowerCase().includes(searchTerm)
      );
    }

    // Filtro por tipo de contribuyente
    const tipoContrib = this.tipoContribSelected();
    if (tipoContrib) {
      filtered = filtered.filter(
        (item) => item.tipoContribuyente === tipoContrib
      );
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

    // Filtro por segmento
    const segmento = this.segmentoSelected();
    if (segmento) {
      filtered = filtered.filter((item) => item.segmento === segmento);
    }

    // Filtro por perfil
    const perfil = this.perfilSelected();
    if (perfil) {
      filtered = filtered.filter((item) => item.perfil === perfil);
    }

    // Filtro por rango de deuda
    const desde = parseFloat(this.deudaDesde()!);
    const hasta = parseFloat(this.deudaHasta()!);

    if (!isNaN(desde)) {
      filtered = filtered.filter(
        (item) => item.deuda - (item.pago || 0) >= desde
      );
    }

    if (!isNaN(hasta)) {
      filtered = filtered.filter(
        (item) => item.deuda - (item.pago || 0) <= hasta
      );
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
      this.type = params['type'];
      this.idSelected = params['id'];

      // Si existe type=GestiónCompleta pero no id → limpiar queryParams
      if (this.type === 'GestiónCompleta' && !this.idSelected) {
        this.router.navigate([this.originalRoute], { replaceUrl: true });
      }
    });
    this.loadData();
  }

  get carteraDetalleSelect(): DetalleCartera | undefined {
    return this.detalleCartera.find((d) => d.id == this.idSelected);
  }

  loadData() {
    this.carteraDetalleService.findAllByUserToken().subscribe({
      next: (data) => {
        this.detalleCartera = data;
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

  gestionCompleta(item: DetalleCartera) {
    this.router.navigate([this.originalRoute], {
      queryParams: { type: 'GestiónCompleta', id: item?.id },
    });
  }

  closeGestionCompleta() {
    this.router.navigate([this.originalRoute], { replaceUrl: true });
    this.loadData();
  }

  actualizarItem(item: any): void {
    // Simula una actualización, aumenta la deuda en 10%
    const nuevoValor = item.deuda * 1.1;
    item.deuda = parseFloat(nuevoValor.toFixed(2)); // Redondea a 2 decimales

    // para cuando se necesite hacer una llamada a una API
    // this.Servicio.actualizarDeuda(item.id, item.deuda).subscribe(...)
  }
}
