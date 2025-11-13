import { CommonModule } from '@angular/common';

import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  Inject,
  inject,
  OnInit,
  PLATFORM_ID,
  TransferState,
} from '@angular/core';
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
  DynamicDialogRef,
  DynamicDialogModule,
  DynamicDialogConfig,
} from 'primeng/dynamicdialog';
import { GeneralServicio } from '@services/servicioGeneral.service';
import { MessageGlobalService } from '@services/message-global.service';
import { Select } from 'primeng/select';
import { SliderModule } from 'primeng/slider';
import { RadioButton } from 'primeng/radiobutton';
import { AsignarCarteraComponent } from '../asignar-cartera/asignar-cartera.component';
import { TransferirCarteraComponent } from '../transferir-cartera/transferir-cartera.component';
import { DatePicker } from 'primeng/datepicker';
import { FieldsetModule } from 'primeng/fieldset';
interface General {
  name: string;
  id: number;
}

@Component({
  selector: 'app-edit-briefcase',
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
  templateUrl: './edit-briefcase.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``,
})
export class EditBriefcaseComponent implements OnInit {
  detalleCartera: any[] = [];
  detalleCarteraFiltrado: any[] = [];

  listEstados: General[] | undefined;
  selectestados: string = '';
  selectSegmento: string = '';
  selectPerfil: string = '';

  filtroEstado: string = '';
  filtroRangoFecha: Date[] = [];

  idCartera: number = 0;

  filtroNombre: string = '';
  tipoAsignacion: '1' | '2' | '3' = '1';
  tipoList: { value: string; label: string }[] = [
    // {
    //   value: '1',
    //   label: 'Visualización',
    // },
    {
      value: '2',
      label: 'Asignación',
    },
    {
      value: '3',
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
  constructor(
    public config: DynamicDialogConfig,
    private dialogService: DialogService,
    private msg: MessageGlobalService,
    private fb: FormBuilder,
    private generalServicio: GeneralServicio
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
      this.idCartera = this.config.data;
      this.loadAll();
    }

    // Aquí puedes cargar la cartera con ese ID si es necesario
  }

  loadAll() {
    this.generalServicio.getByIdDetalle(this.idCartera).subscribe((res) => {
       console.log(res)
      this.detalleCartera = res;

      this.detalleCarteraFiltrado = [...res];

      const uniqueSegmentos = [
        ...new Set(res.map((item: any) => item.segmento)),
      ];
      this.listSegmentos = uniqueSegmentos.map((segmento) => ({
        name: segmento,
      }));

      const uniquePerfilS = [...new Set(res.map((item: any) => item.perfil))];
      this.listPerfil = uniquePerfilS.map((perfil) => ({
        name: perfil,
      }));


       const uniqueSectorista = [...new Set(res.map((item: any) => item.user.name))];
      this.listSectorista = uniqueSectorista.map((perfil) => ({
        name: perfil,
      }));



      console.log(this.listSegmentos);
    });
  }

  filtrar() {
    const filtroNombre = this.filtroNombre?.toLowerCase() || '';

    this.detalleCarteraFiltrado = this.detalleCartera.filter((item) => {
      const coincideSegmento =
        !this.selectSegmento || item.segmento === this.selectSegmento;

      const coincidePerfil =
        !this.selectPerfil || item.perfil === this.selectPerfil;

      const coincidePrecio =
        !this.rangoPrecio?.length ||
        (item.deuda >= this.rangoPrecio[0] &&
          item.deuda <= this.rangoPrecio[1]);

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
        item.contribuyente?.toLowerCase().includes(filtroNombre) ||
        item.codigo?.toLowerCase().includes(filtroNombre);

      return (
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
    this.selectestados = '';
    this.selectSegmento = '';
    this.selectPerfil = '';
    this.rangoPrecio = [0, 1000000];
    this.filtroRangoFecha = [];
    this.filtroNombre = '';
    this.detalleCarteraFiltrado = [...this.detalleCartera];
  }

  selectTipoAsignacion() {
    console.log('Seleccionaste:', this.tipoAsignacion);
  }

  mostrarRegistro() {
    console.log(this.selectedRows);
    if (!this.selectedRows || this.selectedRows.length === 0) {
      this.msg.error('Debe seleccionar un caso como minimo.');
      return;
    }
    if (this.tipoAsignacion == '2') {
      const ref = this.dialogService.open(AsignarCarteraComponent, {
        data: {
          id_cartera: this.idCartera,
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
    } else if (this.tipoAsignacion == '3') {
      const ref = this.dialogService.open(TransferirCarteraComponent, {
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
          this.loadAll()
        }
      });
    }
  }
}
