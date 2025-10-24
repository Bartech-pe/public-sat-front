import { CommonModule, DatePipe } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  inject,
  Input,
  OnInit,
  signal,
  ViewChild,
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
import { MessageGlobalService } from '@services/generic/message-global.service';
import { BtnCustomComponent } from '@shared/buttons/btn-custom/btn-custom.component';
import { DatePickerModule } from 'primeng/datepicker';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SaldomaticoService } from '@services/api-sat/saldomatico.service';
import { PhoneFormatPipe } from '@pipes/phone-format.pipe';
import { PortfolioDetailService } from '@services/portfolio-detail.service';
import { CitizenAssistanceStore } from '@stores/citizen-assistance.store';
import { CitizenAssistanceService } from '@services/citizen-assistance.service';
import { CitizenAssistance } from '@models/citizen-assistance.model';
import {
  CaseInformation,
  PortfolioDetail,
} from '@models/portfolio-detail.model';
import { OmnicanalidadService } from '@services/api-sat/omnicanalidad.service';
import { DialogService } from 'primeng/dynamicdialog';
import { ContactDetailsComponent } from './contact-details/contact-details.component';
import { DebtsComponent } from './debts/debts.component';
import {
  ChannelCitizenService,
  IGetAttentionsOfCitizen,
} from '@services/channel-citizen.service';
import { IBaseResponseDto } from '@interfaces/commons/base-response.interface';
import { ChannelAssistanceService } from '@services/channel-assistance.service';
import { ChannelAssistance } from '@models/channel-assistance.model';
import { CitizenContact } from '@models/citizen.model';
import { CitizenService } from '@services/citizen.service';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-complete-management',
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
    DatePipe,
    PhoneFormatPipe,
    TooltipModule,
    ButtonSaveComponent,
    BtnCustomComponent,
  ],
  templateUrl: './complete-management.component.html',
  styles: ``,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CompleteManagementComponent implements OnInit {
  @ViewChild('channelCommunication') canalSelect: any;

  private readonly msg = inject(MessageGlobalService);

  private readonly dialogService = inject(DialogService);

  private readonly store = inject(CitizenAssistanceStore);

  private readonly portfolioDetailService = inject(PortfolioDetailService);

  private readonly citizenAssistanceService = inject(CitizenAssistanceService);

  private readonly channelCitizenService = inject(ChannelCitizenService);

  private readonly channelAssistanceService = inject(ChannelAssistanceService);

  private readonly omnichannelidadService = inject(OmnicanalidadService);

  private readonly saldomaticoService = inject(SaldomaticoService);

  private readonly citizenService = inject(CitizenService);

  _portfolioDetail?: PortfolioDetail;

  debtList: any[] = [];
  vnomAdm?: string;
  totalDebt: number = 0;

  @Input() set portfolioDetailId(id: number) {
    this.precargarDatos(id);
  }
  channelSelected: string = '';

  listCanalesComunicacion = [
    { label: 'TELÉFONO', code: 'Teléfono' },
    { label: 'CORREO', code: 'email' },
    { label: 'CHATSAT', code: 'chatsat' },
    { label: 'WHATSAPP', code: 'whatsapp' },
  ];

  tabSelected = 0;

  portfolioDetail?: PortfolioDetail;

  get citizenContacts(): CitizenContact[] {
    return this.portfolioDetail?.citizenContacts ?? [];
  }

  get phoneContacts(): CitizenContact[] {
    const phones = this.citizenContacts.filter(
      (l) => l.contactType === 'PHONE'
    );

    return phones.map((item, i) => ({
      ...item,
      label: `Teléfono${phones.length > 1 ? ` ${i + 1}` : ''}`,
    }));
  }

  get whatsappContacts(): CitizenContact[] {
    const wsps = this.citizenContacts.filter(
      (l) => l.contactType === 'WHATSAPP'
    );

    return wsps.map((item, i) => ({
      ...item,
      label: `Whatsapp${wsps.length > 1 ? ` ${i + 1}` : ''}`,
    }));
  }

  get emailContacts(): CitizenContact[] {
    const emails = this.citizenContacts.filter(
      (l) => l.contactType === 'EMAIL'
    );

    return emails.map((item, i) => ({
      ...item,
      label: `Email${emails.length > 1 ? ` ${i + 1}` : ''}`,
    }));
  }

  recordatorio: boolean = false;
  pagoVerificado: boolean = false;

  formData = new FormGroup({
    portfolioDetailId: new FormControl<number | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    methodKey: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    method: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    type: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    channel: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    contact: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    result: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    observation: new FormControl<string | undefined>(undefined),
    caseInformation: new FormGroup({
      commitmentDate: new FormControl<Date | undefined>(undefined, {
        nonNullable: true,
      }),
      commitmentAmount: new FormControl<number | undefined>(undefined, {
        nonNullable: true,
      }),
      observation: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
      }),
      followUp: new FormControl<string | undefined>(undefined, {
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
      type: new FormControl<number | undefined>(undefined, {
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
      type: ['Teléfono'],
      label: 'Contacto',
    },
    {
      type: ['Teléfono'],
      label: 'No contesta',
    },
    {
      type: ['Teléfono', 'WhatsApp'],
      label: 'No pertenece',
    },
    {
      type: ['Teléfono'],
      label: 'No existe',
    },
    {
      type: ['Teléfono'],
      label: 'Fuera de servicio',
    },
    {
      type: ['WhatsApp', 'Email'],
      label: 'Enviado',
    },
    {
      type: ['WhatsApp'],
      label: 'Contactado',
    },
    {
      type: ['WhatsApp'],
      label: 'No tiene',
    },
    {
      type: ['Email'],
      label: 'Rechazado',
    },
  ];

  get listResultados(): string[] {
    return this.listResultadosAll
      .filter((r) =>
        this.formData.get('method')?.value
          ? r.type.includes(this.formData.get('channel')?.value as string)
          : false
      )
      .map((r) => r.label);
  }

  listTipos = ['Gestión', 'Trámite', 'Queja', 'Otros'];

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

  typeDeuda = 3;
  typeTributo = 1;

  tableDeudas: any[] = [];

  tableImpuestoPredial: any[] = [];

  tableImpuestoVehicular: any[] = [];

  tablePapeletas: any[] = [];

  tableTramites: any[] = [];

  allAttentions: IGetAttentionsOfCitizen[] = [];

  attentionsOfChannelSelected: IGetAttentionsOfCitizen[] = [];

  searchText = signal('');

  tableAllComunicaciones: CitizenAssistance[] = [];

  tableComunicaciones: CitizenAssistance[] = [];

  tableChannelAssistances: ChannelAssistance[] = [];

  tableVerificaciones: CitizenAssistance[] = [];

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

  ngOnInit(): void {}

  cleanWhatsapp(whatsapp: string): string {
    if (!whatsapp) return '';
    // Elimina cualquier prefijo wa.me/, http://wa.me/, https://wa.me/
    return whatsapp.replace(/^https?:\/\/?wa\.me\//, '').replace('wa.me/', '');
  }

  precargarDatos(id: number) {
    this.portfolioDetailService.findOne(id).subscribe({
      next: (data) => {
        this.portfolioDetail = data;
        this.formData.patchValue({
          portfolioDetailId: this.portfolioDetail.id,
        });

        if (this.portfolioDetail.caseInformation) {
          this.formData.patchValue({
            caseInformation: {
              commitmentDate:
                this.portfolioDetail.caseInformation.commitmentDate,
              commitmentAmount:
                this.portfolioDetail.caseInformation.commitmentAmount,
              observation: this.portfolioDetail.caseInformation.observation,
              followUp: this.portfolioDetail.caseInformation.followUp,
            },
          });
        }

        this.listMetodos = this.getMetodos(
          this.portfolioDetail.citizenContacts
        );

        this.formData.get('recordatorio')?.disable();
        this.getAtenciones();
        this.getAttentions(this.portfolioDetail.docIde);
        this.getDeudasInfo(this.portfolioDetail.code);
        this.getImpuestoPredial(this.portfolioDetail.code);
        this.getImpuestoVehicular(this.portfolioDetail.code);
        this.getDeuda(this.portfolioDetail.code);
        this.getPapeletaInfo(this.portfolioDetail.code);
        this.getTramites(this.portfolioDetail.code);
      },
    });
  }

  getAttentions(dni: string) {
    const response = this.channelCitizenService
      .getAssistancesByDocumentNumber(dni)
      .subscribe((response: IBaseResponseDto<IGetAttentionsOfCitizen[]>) => {
        if (response.success && response.data?.length) {
          let channelAttentions : CitizenAssistance[] = response.data?.map(attention => {
              return {
                channel: attention?.channel,
                type: attention?.type,
                method: 'CHAT',
                user: attention?.advisorIntervention ? attention.user : 'BOT',
                createdAt: attention?.startDate,
                result: 'Contacto'
              }
          });

          this.tableComunicaciones = [...channelAttentions, ...this.tableComunicaciones];
          this.tableAllComunicaciones = this.tableComunicaciones;
        }
      });
  }

  filterCommunications() {
    const filteredTable = this.tableAllComunicaciones.filter(
      (x) => x.channel == this.channelSelected
    );

    this.tableComunicaciones = [...filteredTable];
  }
  getDeudasInfo(code: string) {
    this.saldomaticoService.deudasInfo(5, code).subscribe({
      next: (data) => {
        this.vnomAdm = data[0]?.vnomAdm;
        this.debtList = this.agruparDatos(data);
        console.log('this.debtList', this.debtList);
        this.totalDebt = this.debtList.reduce(
          (acc, debt) => acc + debt.totalConcepto,
          0
        );
        console.log(' this.totalDebt', this.totalDebt);
        if (this.portfolioDetail?.currentDebt !== this.totalDebt) {
          this.portfolioDetailService
            .update(this.portfolioDetail?.id!, {
              id: this.portfolioDetail?.id!,
              currentDebt: this.totalDebt,
            })
            .subscribe({
              next: (data) => {
                console.log('completado');
              },
            });
        }
      },
    });
  }

  showDebts() {
    const ref = this.dialogService.open(DebtsComponent, {
      header: 'Detalle de la deuda',
      styleClass: 'modal-4xl',
      data: {
        items: this.debtList,
        total: this.totalDebt,
        name: this.vnomAdm ?? this.portfolioDetail?.taxpayerName,
        code: this.portfolioDetail?.code,
      },
      modal: false,
      position: 'bottom-right',
      focusOnShow: false,
      dismissableMask: false,
      closable: true,
      resizable: true,
      draggable: true,
    });
  }

  getMetodos(list: CitizenContact[]): MetodoContacto[] {
    const methods = [
      { key: 'PHONE', type: 'Tel.', channel: 'Teléfono' },
      { key: 'EMAIL', type: 'Email', channel: 'Email' },
      { key: 'WHATSAPP', type: 'WhatsApp', channel: 'WhatsApp' },
    ] as const;

    const phones = list.filter((l) => l.contactType === 'PHONE');
    const emails = list.filter((l) => l.contactType === 'EMAIL');
    const wsps = list.filter((l) => l.contactType === 'WHATSAPP');

    return [
      ...phones.map((l, i) => ({
        i: phones.length > 1 ? `${i + 1} ` : '',
        ...l,
      })),
      ...emails.map((l, i) => ({
        i: emails.length > 1 ? `${i + 1} ` : '',
        ...l,
      })),
      ...wsps.map((l, i) => ({
        i: wsps.length > 1 ? `${i + 1} ` : '',
        ...l,
      })),
    ].map((l, i) => {
      const mo = methods.find((m) => m.key == l.contactType);
      return {
        key: `${mo?.type}_${i}`,
        type: mo?.type,
        channel: mo?.channel,
        label: `${mo?.type} ${l?.i}| ${l.value as string}`,
        contact: l.value as string,
      } as MetodoContacto;
    });
  }

  selectMetodo(key: string) {
    const method = this.listMetodos.find((m) => m.key == key);
    this.formData.get('method')?.setValue(method?.type);
    this.formData.get('channel')?.setValue(method?.channel);
    this.formData.get('contact')?.setValue(method?.contact);
  }

  resetForm() {
    this.formData.reset({
      portfolioDetailId: this.portfolioDetail?.id,
      methodKey: undefined,
      method: undefined,
      type: undefined,
      channel: undefined,
      contact: undefined,
      result: undefined,
      observation: undefined,
      caseInformation: {
        commitmentDate: undefined,
        commitmentAmount: undefined,
        observation: undefined,
        followUp: undefined,
      },
      recordatorio: {
        fecha: undefined,
        hora: undefined,
        idTipoRecordatorio: undefined,
        nota: undefined,
        type: undefined,
      },
    });
    this.recordatorio = false;
  }

  getAtenciones() {
    if (this.portfolioDetail?.id) {
      this.citizenAssistanceService
        .findByPortfolioDetail(this.portfolioDetail.id)
        .subscribe({
          next: (data) => {
            this.tableComunicaciones = data;
          },
        });
      this.citizenAssistanceService
        .findVerificacionByPortfolioDetail(this.portfolioDetail.id)
        .subscribe({
          next: (data) => {
            this.tableVerificaciones = data;
          },
        });
    }
    if (this.portfolioDetail?.docIde) {
      this.channelAssistanceService
        .findByDocIde(this.portfolioDetail?.docIde)
        .subscribe({
          next: (data) => {
            this.tableChannelAssistances = data;
          },
        });
    }
  }

  deleteItemAtencion(item: CitizenAssistance, verif: boolean = false) {
    this.msg.confirm(
      `<div class='px-4 py-2'>
        <p class='text-center'> ¿Está seguro de eliminar la ${
          verif ? 'verificación de pago' : 'comunicación'
        }? </p>
        <p class='text-center'> Esta acción no se puede deshacer. </p>
      </div>`,
      () => {
        this.citizenAssistanceService.delete(item.id!).subscribe({
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

  getImpuestoPredial(code?: string) {
    this.saldomaticoService
      .impuestoPredialInfo(
        code
          ? 5
          : !isNaN(Number.parseInt(this.searchText())) &&
            this.searchText().length == 8
          ? 2
          : 1,
        code ?? this.searchText()
      )
      .subscribe({
        next: (data) => {
          this.tableImpuestoPredial = data;
        },
      });
  }

  getImpuestoVehicular(code?: string) {
    this.saldomaticoService
      .impuestoVehicularInfo(
        code
          ? 5
          : !isNaN(Number.parseInt(this.searchText())) &&
            this.searchText().length == 8
          ? 2
          : 1,
        code ?? this.searchText()
      )
      .subscribe({
        next: (data) => {
          this.tableImpuestoVehicular = data;
        },
      });
  }

  getPapeletaInfo(code?: string) {
    this.omnichannelidadService
      .consultarPapeleta(
        code
          ? 5
          : !isNaN(Number.parseInt(this.searchText())) &&
            this.searchText().length == 8
          ? 2
          : 1,
        code ?? this.searchText()
      )
      .subscribe({
        next: (data) => {
          this.tablePapeletas = data;
        },
      });
  }

  getDeuda(code?: string) {
    this.omnichannelidadService
      .consultarMultaAdm(
        code
          ? 5
          : !isNaN(Number.parseInt(this.searchText())) &&
            this.searchText().length == 8
          ? 2
          : 1,
        code ?? this.searchText()
      )
      .subscribe({
        next: (data) => {
          this.tableDeudas = data;
        },
      });
  }

  getTramites(code?: string) {
    this.omnichannelidadService
      .consultarTramite(
        code
          ? 5
          : !isNaN(Number.parseInt(this.searchText())) &&
            this.searchText().length == 8
          ? 2
          : 1,
        code ?? this.searchText()
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
    this.getImpuestoVehicular();
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
      const { caseInformation, recordatorio, methodKey, ...form } =
        this.formData.value;

      const infoCaso =
        caseInformation?.commitmentDate ||
        caseInformation?.commitmentAmount ||
        caseInformation?.observation ||
        caseInformation?.followUp;

      this.store.create({
        ...form,
        tipDoc: this.portfolioDetail?.tipDoc,
        docIde: this.portfolioDetail?.docIde,
        verifyPayment: false,
      } as CitizenAssistance);

      if (infoCaso) {
        this.portfolioDetailService
          .createOrUpdateInfoCaso(
            this.portfolioDetail?.id!,
            caseInformation as CaseInformation
          )
          .subscribe({
            next: (data) => console.log('data', data),
          });
      }
    } else {
      this.store.create({
        portfolioDetailId: this.portfolioDetail?.id!,
        result: 'Verificación de pago',
        verifyPayment: true,
      } as CitizenAssistance);
    }
  }

  updateContacts() {
    this.citizenService
      .getCitizenContactsByTipDocAndDocId(
        this.portfolioDetail?.tipDoc!,
        this.portfolioDetail?.docIde!
      )
      .subscribe({
        next: (data) => {
          if (this._portfolioDetail) {
            this._portfolioDetail.citizenContacts = data;
          }
        },
      });
  }

  contactDetails() {
    const ref = this.dialogService.open(ContactDetailsComponent, {
      header: 'Datos de contacto',
      styleClass: 'modal-md',
      data: {
        taxpayerName: this.portfolioDetail?.taxpayerName,
        tipDoc: this.portfolioDetail?.tipDoc,
        docIde: this.portfolioDetail?.docIde,
      },
      modal: true,
      focusOnShow: false,
      dismissableMask: false,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      if (res) {
        this.updateContacts();
      }
    });
  }

  removeContact(contact: CitizenContact) {
    this.msg.confirm(
      `<div class='px-4 py-0.5'>
        <p class='text-center'> ¿Está seguro de eliminar el contacto <span class='uppercase font-bold'>${contact.value}</span>? </p>
        <p class='text-center'> Esta acción no se puede deshacer. </p>
      </div>`,
      () => {
        this.citizenService.deleteContact(contact?.id!).subscribe({
          next: (data) => {
            this.msg.success('¡Contacto eliminado exitosamente!');
            this.updateContacts();
          },
        });
      }
    );
  }

  agruparDatos(data: Registro[]): EstructuraSalida[] {
    const resultado: Record<string, any> = {};

    for (const item of data) {
      const {
        concepto,
        referencia,
        ano,
        cuota,
        monto,
        documento,
        fechavencimiento,
        estado,
      } = item;

      if (!resultado[concepto]) resultado[concepto] = {};
      if (!resultado[concepto][referencia])
        resultado[concepto][referencia] = {};
      if (!resultado[concepto][referencia][ano]) {
        resultado[concepto][referencia][ano] = {
          total: 0,
          zero: false,
          cuotas: [],
        };
      }

      if (cuota === '0') {
        resultado[concepto][referencia][ano].total = monto;
        resultado[concepto][referencia][ano].documento = documento;
        resultado[concepto][referencia][ano].zero = true;
      } else {
        resultado[concepto][referencia][ano].cuotas.push({
          ano,
          cuota,
          monto,
          documento,
          fechavencimiento,
          estado,
        });
      }
    }

    // Transformar el objeto en una estructura jerárquica con totales
    return Object.entries(resultado as Record<string, any>).map(
      ([concepto, refs]) => {
        const referencias = Object.entries(refs as Record<string, any>).map(
          ([referencia, anos]) => {
            const anosArr = Object.entries(anos as Record<string, any>).map(
              ([ano, info]: any) => {
                const cuotas = info.cuotas;
                const totalAno = info.zero
                  ? info.total
                  : (info.cuotas as any[]).reduce(
                      (acc, debt) => acc + debt.monto,
                      0
                    );
                return {
                  ano: ano,
                  cuota: info.zero ? '0' : undefined,
                  documento: info.documento,
                  total: totalAno,
                  zero: info.zero,
                  cuotas: cuotas.sort((a: any, b: any) => a.cuota - b.cuota),
                };
              }
            );

            // Total por referencia = suma de los totales anuales
            const totalReferencia = anosArr.reduce(
              (sum, a) => sum + a.total,
              0
            );

            return { referencia, totalReferencia, anos: anosArr };
          }
        );

        // Total por concepto = suma de los totales por referencia
        const totalConcepto = referencias.reduce(
          (sum, r) => sum + r.totalReferencia,
          0
        );

        return { concepto, totalConcepto, referencias };
      }
    );
  }
}

interface MetodoContacto {
  key: string;
  type: string;
  contact: string;
  channel: string;
  label: string;
}

interface Registro {
  ano: string;
  cuota: string;
  concepto: string;
  referencia: string;
  monto: number;
  documento: string;
  fechavencimiento: string;
  estado: string;
}

interface EstructuraSalida {
  concepto: string;
  totalConcepto: number;
  referencias: {
    referencia: string;
    totalReferencia: number;
    anos: {
      ano: string;
      cuota?: string;
      documento: string;
      total: number;
      cuotas: {
        ano: string;
        cuota: string;
        monto: number;
        documento: string;
        fechavencimiento: string;
        estado: string;
      }[];
    }[];
  }[];
}
