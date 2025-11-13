import { CommonModule, DatePipe } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  inject,
  Input,
  OnInit,
  signal,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { AccordionModule } from 'primeng/accordion';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DetalleCartera } from '@models/detalleCartera.model';
import { FieldsetModule } from 'primeng/fieldset';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageGlobalService } from '@services/message-global.service';
import { AtencionCiudadanoStore } from '@stores/atencion-ciudadano.store';
import { AtencionCiudadano } from '@models/atencion-ciudadano.model';
import { AtencionCiudadanoService } from '@services/atencion-ciudadano.service';
import { ButtonCustomComponent } from '@shared/buttons/btn-custom/btn-custom.component';
import { DatePickerModule } from 'primeng/datepicker';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { OmnicanalidadService } from '@services/api-sat/omnicanalidad.service';
import { SaldomaticoService } from '@services/api-sat/saldomatico.service';
import { DetalleCarteraStore } from '@stores/detalleCartera.store';
import { CarteraDetalleService } from '@services/detalleCartera.service';
import { PhoneFormatPipe } from '@pipes/phone-format.pipe';

@Component({
  selector: 'app-gestion-completa',
  imports: [
    CardModule,
    InputTextModule,
    ButtonModule,
    TabsModule,
    TagModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    SelectModule,
    TextareaModule,
    FieldsetModule,
    AccordionModule,
    CommonModule,
    AvatarModule,
    BadgeModule,
    DialogModule,
    TableModule,
    CheckboxModule,
    IconFieldModule,
    InputIconModule,
    ButtonModule,
    DatePickerModule,
    ButtonSaveComponent,
    ButtonCustomComponent,
    DatePipe,
    PhoneFormatPipe,
  ],
  templateUrl: './gestion-completa.component.html',
  styles: ``,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class GestionCompletaComponent implements OnInit {
  // public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly msg = inject(MessageGlobalService);

  private readonly store = inject(AtencionCiudadanoStore);

  private readonly carteraDetalleService = inject(CarteraDetalleService);

  private readonly atencionCiudadanoService = inject(AtencionCiudadanoService);

  private readonly omnicanalidadService = inject(OmnicanalidadService);

  private readonly saldomaticoService = inject(SaldomaticoService);

  _detalleCartera?: DetalleCartera;

  @Input() set detalleCartera(val: DetalleCartera) {
    this._detalleCartera = val;
    this.precargarDatos();
  }

  tabSelected = 0;

  get detalleCartera(): DetalleCartera | undefined {
    return this._detalleCartera;
  }

  recordatorio: boolean = false;
  pagoVerificado: boolean = false;

  formData = new FormGroup({
    idCarteraDetalle: new FormControl<number | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    metodo: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    tipo: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    canal: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    contacto: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    resultado: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    observacion: new FormControl<string | undefined>(undefined),
    informacionCaso: new FormGroup({
      fechaCompromiso: new FormControl<Date | undefined>(undefined, {
        nonNullable: true,
      }),
      montoCompromiso: new FormControl<number | undefined>(undefined, {
        nonNullable: true,
      }),
      observacion: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
      }),
      seguimiento: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
      }),
    }),
    recordatorio: new FormGroup({
      fecha: new FormControl<Date | undefined>(undefined, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      hora: new FormControl<Date | undefined>(undefined, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      tipo: new FormControl<number | undefined>(undefined, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      idTipoRecordatorio: new FormControl<number | undefined>(undefined, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      nota: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [Validators.required],
      }),
    }),
  });

  get loading(): boolean {
    return false;
  }

  listMetodos: MetodoContacto[] = [];

  listResultadosAll = [
    {
      tipo: ['Teléfono'],
      label: 'Contacto',
    },
    {
      tipo: ['Teléfono'],
      label: 'No contesta',
    },
    {
      tipo: ['Teléfono', 'WhatsApp'],
      label: 'No pertenece',
    },
    {
      tipo: ['Teléfono'],
      label: 'No existe',
    },
    {
      tipo: ['Teléfono'],
      label: 'Fuera de servicio',
    },
    {
      tipo: ['WhatsApp', 'Email'],
      label: 'Enviado',
    },
    {
      tipo: ['WhatsApp'],
      label: 'Contactado',
    },
    {
      tipo: ['WhatsApp'],
      label: 'No tiene',
    },
    {
      tipo: ['Email'],
      label: 'Rechazado',
    },
  ];

  get listResultados(): string[] {
    return this.listResultadosAll
      .filter((r) =>
        this.formData.get('metodo')?.value
          ? r.tipo.includes(this.formData.get('canal')?.value as string)
          : false
      )
      .map((r) => r.label);
  }

  listTipos: string[] = ['Gestión', 'Consulta', 'Trámite', 'Queja', 'Otros'];

  listObservacion = [
    'Malcriado',
    'Trámite',
    'Mínima intención de pago',
    'Exclusión de pago',
  ];

  listTipoRecordatorio = [
    {
      id: 1,
      label: 'Pago',
    },
  ];

  listTipoDeuda = [
    {
      code: 1,
      label: 'Deudas tributarias',
    },
    {
      code: 2,
      label: 'Deudas no tributarias',
    },
    {
      code: 3,
      label: 'Multas administrativas',
    },
  ];

  listTipoTributo = [
    {
      code: 1,
      label: 'Impuesto predial',
    },
    {
      code: 2,
      label: 'Impuesto vehicular',
    },
  ];

  tipoDeuda = 3;
  tipoTributo = 1;

  tableDeudas: any[] = [];

  tableImpuestoPredial: any[] = [];

  tablePapeletas: any[] = [];

  tableTramites: any[] = [];

  searchText = signal('');

  tableComunicaciones: AtencionCiudadano[] = [];

  tableVerificaciones: AtencionCiudadano[] = [];

  private resetOnSuccessEffect = effect(() => {
    const item = this.store.selectedItem();
    const error = this.store.error();
    const action = this.store.lastAction();

    // Manejo de errores
    if (error) {
      console.log('error', error);
      this.msg.error(
        error ?? '¡Ups, ocurrió un error inesperado al guardar la atención!'
      );
      return; // Salimos si hay un error
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'created' || action === 'updated') {
      this.msg.success(
        action === 'created'
          ? this.pagoVerificado
            ? '¡Verificación de pago registrada exitosamente!'
            : '¡Atención registrada exitosamente!'
          : this.pagoVerificado
          ? '¡Verificación de pago actualizada exitosamente!'
          : '¡Atención actualizada exitosamente!'
      );

      this.store.clearSelected();
      this.pagoVerificado = false;
      // this.ref.close(true);
      this.resetForm();
      this.getAtenciones();
      return;
    }
  });

  ngOnInit(): void {
    // this.detalleCartera = instance.data;
  }

  cleanWhatsapp(whatsapp: string): string {
    if (!whatsapp) return '';
    // Elimina cualquier prefijo wa.me/, http://wa.me/, https://wa.me/
    return whatsapp.replace(/^https?:\/\/?wa\.me\//, '').replace('wa.me/', '');
  }

  precargarDatos() {
    console.log('detalleCartera', this.detalleCartera);
    if (this.detalleCartera) {
      this.formData.patchValue({
        idCarteraDetalle: this.detalleCartera.id,
      });

      if (this.detalleCartera.informacionCaso) {
        this.formData.patchValue({
          informacionCaso: {
            fechaCompromiso:
              this.detalleCartera.informacionCaso.fechaCompromiso,
            montoCompromiso:
              this.detalleCartera.informacionCaso.montoCompromiso,
            observacion: this.detalleCartera.informacionCaso.observacion,
            seguimiento: this.detalleCartera.informacionCaso.seguimiento,
          },
        });
      }

      this.listMetodos = this.getMetodos(this.detalleCartera);

      this.formData.get('recordatorio')?.disable();
      this.getAtenciones();
    }
  }

  getMetodos(d: DetalleCartera): MetodoContacto[] {
    const metodos = [
      { key: 'telefono1', tipo: 'Tel. 1', canal: 'Teléfono' },
      { key: 'telefono2', tipo: 'Tel. 2', canal: 'Teléfono' },
      { key: 'telefono3', tipo: 'Tel. 3', canal: 'Teléfono' },
      { key: 'telefono4', tipo: 'Tel. 4', canal: 'Teléfono' },
      { key: 'email', tipo: 'Email', canal: 'Email' },
      { key: 'whatsapp', tipo: 'WhatsApp', canal: 'WhatsApp' },
    ] as const;

    return metodos
      .filter((m) => d[m.key as keyof DetalleCartera])
      .map((m) => ({
        tipo: m.tipo,
        canal: m.canal,
        label: `${m.tipo} | ${d[m.key as keyof DetalleCartera] as string}`,
        contacto: d[m.key as keyof DetalleCartera] as string,
      }));
  }

  selectMetodo(tipo: string) {
    const metodo = this.listMetodos.find((m) => m.tipo == tipo);
    this.formData.get('canal')?.setValue(metodo?.canal);
    this.formData.get('contacto')?.setValue(metodo?.contacto);
  }

  resetForm() {
    this.formData.reset({
      idCarteraDetalle: this.detalleCartera?.id,
      metodo: undefined,
      tipo: undefined,
      canal: undefined,
      contacto: undefined,
      resultado: undefined,
      observacion: undefined,
      informacionCaso: {
        fechaCompromiso: undefined,
        montoCompromiso: undefined,
        observacion: undefined,
        seguimiento: undefined,
      },
      recordatorio: {
        fecha: undefined,
        hora: undefined,
        idTipoRecordatorio: undefined,
        nota: undefined,
        tipo: undefined,
      },
    });
    this.recordatorio = false;
  }

  getAtenciones() {
    if (this.detalleCartera?.id) {
      this.atencionCiudadanoService
        .findByCarteraDetalle(this.detalleCartera.id)
        .subscribe({
          next: (data) => {
            this.tableComunicaciones = data;
          },
        });
      this.atencionCiudadanoService
        .findVerificacionByCarteraDetalle(this.detalleCartera.id)
        .subscribe({
          next: (data) => {
            this.tableVerificaciones = data;
          },
        });
    }
  }

  deleteItemAtencion(item: AtencionCiudadano, verif: boolean = false) {
    this.msg.confirm(
      `<div class='px-4 py-2'>
        <p class='text-center'> ¿Está seguro de eliminar la ${
          verif ? 'verificación de pago' : 'comunicación'
        }? </p>
        <p class='text-center'> Esta acción no se puede deshacer. </p>
      </div>`,
      () => {
        this.atencionCiudadanoService.delete(item.id!).subscribe({
          next: (data) => {
            this.getAtenciones();
          },
        });
      }
    );
  }

  selectRecordatorio(event: any) {
    this.formData.get('recordatorio')?.enable();
  }

  getImpuestoPredial() {
    this.saldomaticoService
      .impuestoPredialInfo(
        !isNaN(Number.parseInt(this.searchText())) &&
          this.searchText().length == 8
          ? 2
          : 1,
        Number.parseInt(this.searchText())
      )
      .subscribe({
        next: (data) => {
          this.tableImpuestoPredial = data;
        },
      });
  }

  getPapeletaInfo() {
    this.omnicanalidadService
      .consultarPapeleta(
        !isNaN(Number.parseInt(this.searchText())) &&
          this.searchText().length == 8
          ? 2
          : 1,
        Number.parseInt(this.searchText())
      )
      .subscribe({
        next: (data) => {
          this.tablePapeletas = data;
        },
      });
  }

  getDeuda() {
    this.omnicanalidadService
      .consultarMultaAdm(
        !isNaN(Number.parseInt(this.searchText())) &&
          this.searchText().length == 8
          ? 2
          : 1,
        Number.parseInt(this.searchText())
      )
      .subscribe({
        next: (data) => {
          this.tableDeudas = data;
        },
      });
  }

  getTramites() {
    this.omnicanalidadService
      .consultarTramite(
        !isNaN(Number.parseInt(this.searchText())) &&
          this.searchText().length == 8
          ? 2
          : 1,
        Number.parseInt(this.searchText())
      )
      .subscribe({
        next: (data) => {
          this.tableTramites = data;
        },
      });
  }

  search() {
    this.getDeuda();
    this.getImpuestoPredial();
    this.getPapeletaInfo();
    this.getTramites();
  }

  clear() {
    this.searchText.set('');
  }

  onCancel() {
    this.store.clearSelected();
    // this.ref.close(false);
  }

  onSubmit() {
    if (!this.pagoVerificado) {
      const { informacionCaso, recordatorio, ...form } = this.formData.value;

      const infoCaso =
        informacionCaso?.fechaCompromiso ||
        informacionCaso?.montoCompromiso ||
        informacionCaso?.observacion ||
        informacionCaso?.seguimiento;

      this.store.create({
        ...form,
        verifPago: false,
      } as AtencionCiudadano);

      if (infoCaso) {
        this.carteraDetalleService
          .createOrUpdateInfoCaso(this.detalleCartera?.id!, informacionCaso)
          .subscribe({
            next: (data) => console.log('data', data),
          });
      }
    } else {
      this.store.create({
        idCarteraDetalle: this.detalleCartera?.id!,
        resultado: 'Verificación de pago',
        verifPago: true,
      } as AtencionCiudadano);
    }
  }
}

interface MetodoContacto {
  tipo: string;
  contacto: string;
  canal: string;
  label: string;
}
