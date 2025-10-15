import { CommonModule } from '@angular/common';

import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
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
    ReactiveFormsModule,
    CalendarModule,
    FieldsetModule,
    ButtonModule,
    SliderModule,
    RadioButton,
    Select,
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

  portfolioId: number = 0;

  filtroNombre: string = '';
  tipoAsignacion: '1' | '2' | null = null;

  tipoList: { value: string; label: string }[] = [
    {
      value: '1',
      label: 'Asignación',
    },
    {
      value: '2',
      label: 'Transferencia',
    },
  ];

  get labelAsignacion(): string | undefined {
    return this.tipoList.find((item) => item.value == this.tipoAsignacion)
      ?.label;
  }

  rangoPrecio: number[] = [0, 1000000];
  formFiltros!: FormGroup;

  selectedRows: any[] = [];
  listSegmentos: any[] = [];
  listPerfil: any[] = [];
  listSectorista: any[] = [];
  selectSectorista: string = '';
  constructor(
    public config: DynamicDialogConfig,
    private dialogService: DialogService,
    private msg: MessageGlobalService,
    private fb: FormBuilder,
    private portfolioDetailService: PortfolioDetailService
  ) {
    this.formFiltros = this.fb.group({
      estado: [null],
      segmento: [null],
      perfil: [null],
      precio: [[0, 100000]],
      fecha: [null],
      nombre: [''],
    });
  }

  ngOnInit(): void {
    this.listEstados = [
      { name: 'Sin Asignar', id: 1 },
      { name: 'Asignado', id: 2 },
    ];

    if (this.config.data) {
      this.portfolioId = this.config.data;
      this.loadAll();
    }

    // Aquí puedes cargar la cartera con ese ID si es necesario
  }

  toggleSeleccion(value: '1' | '2') {
    this.tipoAsignacion = this.tipoAsignacion === value ? null : value;
  }

  loadAll() {
    this.portfolioDetailService
      .getByIdDetalle(this.portfolioId)
      .subscribe((res) => {
        console.log(res);
        this.detalleCartera = res;

        this.detalleCarteraFiltrado = [...res];

        const uniqueSegmentos = [
          ...new Set(res.map((item: any) => item.segment)),
        ];

        this.listSegmentos = uniqueSegmentos.map((segmento) => ({
          name: segmento,
        }));

        const uniquePerfilS = [
          ...new Set(res.map((item: any) => item.profile)),
        ];
        this.listPerfil = uniquePerfilS.map((perfil) => ({
          name: perfil,
        }));

        const uniqueSectorista = [
          ...new Set(res.map((item: any) => item.user.name)),
        ];
        this.listSectorista = uniqueSectorista.map((perfil) => ({
          name: perfil,
        }));
      });
  }

  filtrar() {
    const filtroNombre = this.filtroNombre?.toLowerCase() || '';

    this.detalleCarteraFiltrado = this.detalleCartera.filter((item) => {
      const coincideSectorista =
        !this.selectSectorista || item.user?.name === this.selectSectorista;

      const coincideSegmento =
        !this.selectSegmento || item.segment === this.selectSegmento;

      const coincidePerfil =
        !this.selectPerfil || item.profile === this.selectPerfil;

      const coincidePrecio =
        !this.rangoPrecio?.length ||
        (item.debt >= this.rangoPrecio[0] && item.debt <= this.rangoPrecio[1]);

      const coincideFecha =
        !this.filtroRangoFecha ||
        !this.filtroRangoFecha.length ||
        this.filtroRangoFecha.some(
          (fecha) =>
            item.fecha?.slice(0, 10) ===
            new Date(fecha).toISOString().slice(0, 10)
        );

      const coincideNombre =
        !filtroNombre ||
        item.taxpayerName?.toLowerCase().includes(filtroNombre) ||
        item.code?.toLowerCase().includes(filtroNombre);

      return (
        coincideSectorista &&
        coincideSegmento &&
        coincidePerfil &&
        coincidePrecio &&
        coincideFecha &&
        coincideNombre
      );
    });
  }

  onRangoFechaChange(fechasSeleccionadas: Date[]) {
    this.filtroRangoFecha = fechasSeleccionadas;
    this.filtrar(); // Aquí llamas a tu lógica
  }

  limpiarFiltro() {
    this.selectSectorista = '';
    this.selectSegmento = '';
    this.selectPerfil = '';
    this.rangoPrecio = [0, 1000000];
    this.filtroRangoFecha = [];
    this.filtroNombre = '';
    this.detalleCarteraFiltrado = [...this.detalleCartera];
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
          asignaciones: this.selectedRows,
        },
        header: 'Asignar ' + this.selectedRows.length + ' Casos Seleccionados',
        styleClass: 'modal-lg',
        modal: true,
        dismissableMask: false,
        closable: true,
      });

      ref.onClose.subscribe((res) => {
        if (res) {
          this.selectedRows = [];
          this.loadAll();
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
          this.loadAll();
        }
      });
    }
  }
}
