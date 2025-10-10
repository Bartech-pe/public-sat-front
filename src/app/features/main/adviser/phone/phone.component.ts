import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { BreakComponent } from './break/break.component';
import { CommonModule } from '@angular/common';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AloSatService } from '@services/alo-sat.service';
import { SelectModule } from 'primeng/select';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import {
  CitizenInfo,
  ExternalCitizenService,
} from '@services/externalCitizen.service';
import { AuthStore } from '@stores/auth.store';
import { Subscription } from 'rxjs';
import { CallTimerService } from '@services/call-timer.service';
import { TextareaModule } from 'primeng/textarea';
import { FieldsetModule } from 'primeng/fieldset';
import { TableModule } from 'primeng/table';
import { TransferCallComponent } from './transfer-call/transfer-call.component';
import { OmnicanalidadService } from '@services/api-sat/omnicanalidad.service';
import { SaldomaticoService } from '@services/api-sat/saldomatico.service';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TabsModule } from 'primeng/tabs';
import { CitizenAssistanceStore } from '@stores/citizen-assistance.store';
import { CitizenAssistanceService } from '@services/citizen-assistance.service';
import { CitizenAssistance } from '@models/citizen-assistance.model';
import { AloSatStore } from '@stores/alo-sat.store';
import { ChannelState } from '@models/channel-state.model';
import { BtnCustomComponent } from '@shared/buttons/btn-custom/btn-custom.component';
import {
  ChannelPhoneState,
  pauseCodeAgent,
  VicidialPauseCode,
} from '@constants/pause-code-agent.constant';
import { CardModule } from 'primeng/card';
import { SocketService } from '@services/socket.service';
import { User } from '@models/user.model';

@Component({
  selector: 'app-phone',
  imports: [
    CommonModule,
    BreadcrumbModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    SelectModule,
    TextareaModule,
    FieldsetModule,
    TableModule,
    TabsModule,
    SelectModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ButtonModule,
    CardModule,
    ButtonSaveComponent,
    BtnCustomComponent,
  ],
  templateUrl: './phone.component.html',
  styles: ``,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PhoneComponent implements OnInit {
  openModal: boolean = false;

  showConfigDialog: boolean = false;
  showInfoDialog: boolean = false;

  private readonly dialogService = inject(DialogService);

  private readonly msg = inject(MessageGlobalService);

  private readonly aloSatService = inject(AloSatService);

  private externalCitizenService = inject(ExternalCitizenService);

  private readonly authStore = inject(AuthStore);

  private readonly store = inject(CitizenAssistanceStore);

  private readonly aloSatStore = inject(AloSatStore);

  private readonly citizenAssistanceService = inject(CitizenAssistanceService);

  private readonly omnicanalidadService = inject(OmnicanalidadService);

  private readonly saldomaticoService = inject(SaldomaticoService);

  private readonly socketService = inject(SocketService);

  motivo: any;

  formData = new FormGroup({
    idCampaign: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  formDataAtencion = new FormGroup({
    metodo: new FormControl<string | undefined>('Teléfono', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    tipo: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    canal: new FormControl<string | undefined>('Telefónico'),
    resultado: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    observacion: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
    }),
  });

  listCampaigns: any[] = [];

  listMetodos: MetodoContacto[] = [
    {
      tipo: 'Teléfono',
      canal: 'Telefónico',
      label: 'Telefónico',
      contacto: '',
    },
  ];

  listTipos = ['Consulta', 'Tramite', 'Queja', 'Otros'];

  listResultados = [
    'No contesta',
    'Contacto exitoso',
    'Número equivocado',
    'Otro',
  ];

  get isLogged(): boolean {
    return !!this.userState && this.userState?.id !== ChannelPhoneState.OFFLINE;
  }

  get agentStatus(): string | undefined {
    return this.userState?.name;
  }

  get isInPaused(): boolean {
    return this.userState?.id === ChannelPhoneState.PAUSED;
  }

  get isInCall(): boolean | undefined {
    return this.userState?.id === ChannelPhoneState.INCALL;
  }

  get isInQueue(): boolean | undefined {
    return this.userState?.id === ChannelPhoneState.QUEUE;
  }

  get isInWrap(): boolean | undefined {
    return this.isInPaused && this.pauseCode === VicidialPauseCode.WRAP;
  }

  getPauseCodeValue(code: string): string {
    return pauseCodeAgent.find((p) => p.code === code)?.name!;
  }

  get estado(): any {
    let icon = 'heroicons-outline:pause';
    let label = 'PAUSADO';
    let textColor = 'text-red-600';
    switch (this.userState?.id) {
      case ChannelPhoneState.PAUSED:
        icon = 'heroicons-outline:pause';
        label =
          this.userState?.name +
          (this.pauseCode
            ? ` - ${this.getPauseCodeValue(this.pauseCode)}`
            : ' - Inicial');
        textColor = 'text-sky-600';
        break;
      case ChannelPhoneState.CLOSER:
        icon = 'icon-park-outline:check-one';
        label = this.userState?.name;
        textColor = 'text-teal-600';
        break;
      case ChannelPhoneState.QUEUE:
        icon = 'lsvg-spinners:12-dots-scale-rotate';
        label = this.userState?.name;
        textColor = 'text-orange-600';
        break;
      case ChannelPhoneState.INCALL:
        icon = 'svg-spinners:bars-scale';
        label = this.userState?.name;
        textColor = 'text-green-600';
        break;
      case ChannelPhoneState.READY:
        icon = 'svg-spinners:gooey-balls-1';
        label = this.userState?.name;
        textColor = 'text-green-600';
        break;
      default:
        icon = 'line-md:loading-alt-loop';
        label = 'DESCONECTADO';
        textColor = 'text-red-600';
        break;
    }
    return {
      icon,
      label,
      textColor,
    };
  }

  get isAloSat(): boolean {
    return this.authStore.user()?.officeId === 1;
  }

  get user(): User {
    return this.authStore.user()!;
  }

  private callTimerService = inject(CallTimerService);

  callTimer: string = '00:00:00';
  private sub!: Subscription;

  tabSelected = 0;

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

  tableComunicaciones: CitizenAssistance[] = [];

  get userState(): ChannelState | undefined {
    return this.aloSatStore.state();
  }

  get pauseCode(): string | undefined {
    return this.aloSatStore.pauseCode();
  }

  get callInfo(): any | undefined {
    return this.aloSatStore.callInfo();
  }

  get lastCallInfo(): any | undefined {
    return this.aloSatStore.lastCallInfo();
  }

  private callInfoEffect = effect(() => {
    const callInfo = this.aloSatStore.callInfo();
    if (this.isInCall && callInfo) {
      this.callTimerService.start(callInfo.entryDate);
    } else {
      this.callTimerService.reset(0);
    }
  });

  private lastCallInfoEffect = effect(() => {
    const lastCallInfo = this.aloSatStore.lastCallInfo();
    if (this.isInWrap) {
      this.callTimerService.reset(lastCallInfo?.seconds);
    } else {
      this.callTimerService.reset(0);
    }
  });

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
          ? '¡Atención registrada exitosamente!'
          : '¡Atención actualizada exitosamente!'
      );

      this.store.clearSelected();
      this.resetForm();
      this.getAtenciones();
      return;
    }
  });

  ngOnInit(): void {
    if (this.isAloSat) {
      // this.aloSatService.startKeepalive();
      // this.aloSatService.agentStatus();
      this.aloSatStore.getState();
      this.aloSatService.getCallInfo();
      this.getCampaigns();
      this.sub = this.callTimerService.time$.subscribe((time) => {
        this.callTimer = time;
      });
    }

    this.socketService.onUserPhoneStateRequest().subscribe({
      next: (data: { userId: number }) => {
        console.log('onUserPhoneStateRequest', data);
        if (data.userId === this.user.id) {
          this.aloSatStore.getState();
        }
      },
    });

    this.socketService.onRequestPhoneCallSubject().subscribe({
      next: (data: { userId: number }) => {
        console.log('onRequestPhoneCallSubject', data);
        if (data.userId === this.user.id) {
          this.aloSatStore.getState();
        }
      },
    });
  }

  ngOnDestroy(): void {
    this.aloSatService.stopKeepalive();
    this.sub?.unsubscribe();
  }

  resetForm() {
    this.formDataAtencion.reset({
      metodo: 'Teléfono',
      tipo: undefined,
      canal: 'Telefónico',
      resultado: undefined,
      observacion: undefined,
    });
  }

  getAtenciones() {
    if (this.citizen?.vdocIde) {
      this.citizenAssistanceService
        .findByDocIde(this.citizen?.vdocIde)
        .subscribe({
          next: (data) => {
            this.tableComunicaciones = data;
          },
        });
    }
  }

  getImpuestoPredial() {
    this.saldomaticoService
      .impuestoPredialInfo(
        !isNaN(Number.parseInt(this.searchText())) &&
          this.searchText().length == 8
          ? 2
          : 1,
        this.searchText()
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
        this.searchText()
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
        this.searchText()
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
        this.searchText()
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

  onSubmit() {
    const { idCampaign } = this.formData.value;
    if (!idCampaign) {
      this.msg.error('El id de la campaña es obligatorio');
      return;
    }
    this.aloSatService.agentLogin(idCampaign as string).subscribe({
      next: (data) => {
        this.aloSatStore.getState();
      },
    });
  }

  agentRelogin() {
    this.aloSatService.agentRelogin().subscribe({
      next: (data) => {
        this.aloSatStore.getState();
      },
    });
  }

  getStatus() {
    this.aloSatService.agentStatus().subscribe({
      next: (data) => {
        this.aloSatService.status = data;
      },
    });
  }

  onLogout() {
    this.msg.confirm(
      `
      <div class='px-4'>
        <p class='text-center'> ¿Está seguro de cerrar la conexión del agente? </p>
      </div>
      `,
      () => {
        this.aloSatService.agentLogout().subscribe({
          next: (data) => {
            console.log('data', data);
            this.aloSatStore.getState();
          },
        });
      },
      undefined,
      'Desconectar agente'
    );
  }

  getCampaigns() {
    this.aloSatService.getCampaignsByUser().subscribe({
      next: (data) => {
        this.listCampaigns = data;
      },
    });
  }

  requestPause() {
    this.openModal = true;
    const ref = this.dialogService.open(BreakComponent, {
      header: 'Solicitar Pausa',
      styleClass: 'modal-lg',
      modal: true,
      focusOnShow: false,
      dismissableMask: true,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      this.openModal = false;
      this.aloSatStore.getState();
    });
  }

  transferCall() {
    this.openModal = true;
    const ref = this.dialogService.open(TransferCallComponent, {
      header: `Transferir llamada | ${this.callInfo?.phoneNumber}`,
      styleClass: 'modal-sm',
      modal: true,
      focusOnShow: false,
      dismissableMask: true,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      this.openModal = false;
    });
  }

  changeAvailable() {
    this.aloSatService.resumeAgent().subscribe({
      next: (data) => {
        this.aloSatStore.getState();
      },
    });
  }

  addNew() {}

  vistaActual: 'estado' | 'llamada-nueva' | 'llamada-reconocida' = 'estado';

  abrirLlamadaNueva() {
    this.vistaActual = 'llamada-nueva';
  }

  abrirLlamadaReconocida() {
    this.vistaActual = 'llamada-reconocida';
  }

  volverEstado() {
    this.vistaActual = 'estado';
  }

  mostrarTodoHistorial = false;

  pausaActiva: boolean = false;

  vistaSeleccionada: string = 'Comunicaciones';

  botonSeleccionado = false;

  datosPorVista: { [key: string]: any[] } = {
    Deudas: [],
    Trámites: [],
    Medidas: [],
    Declaraciones: [],
    Notificaciones: [],
    Comunicaciones: [
      {
        fecha: '06/08/2025 14:30',
        tipo: 'consulta',
        canal: 'Teléfono',
        metodo: 'Tel1',
        contacto: 'juan@mail.com',
        resultado: 'compromiso de pago',
        usuario: 'Ana',
        acciones: '',
      },
      {
        fecha: '15/07/2025 17:46',
        tipo: 'cobranza',
        canal: 'Teléfono',
        metodo: 'Tel2',
        contacto: 'juan@mail.com',
        resultado: 'no contesta',
        usuario: 'Pedro',
        acciones: '',
      },
      {
        fecha: '11/05/2025 11:08',
        tipo: 'consulta',
        canal: 'Teléfono',
        metodo: 'Tel1',
        contacto: 'juan@mail.com',
        resultado: 'contacto exitoso',
        usuario: 'Miguel',
        acciones: '',
      },
      {
        fecha: '11/05/2025 16:20',
        tipo: 'consulta',
        canal: 'Teléfono',
        metodo: 'Tel2',
        contacto: 'juan@mail.com',
        resultado: 'Pendiente',
        usuario: 'Martín',
        acciones: '',
      },
      {
        fecha: '20/04/2025 09:17',
        tipo: 'cobranza',
        canal: 'Teléfono',
        metodo: 'Tel2',
        contacto: 'juan@mail.com',
        resultado: 'en proceso',
        usuario: 'Alva',
        acciones: '',
      },
    ],
  };

  selectedItem: any = null;
  mostrarModal: boolean = false;

  abrirModal(item: any) {
    this.selectedItem = item;
    this.mostrarModal = true;
  }

  endCall() {
    this.aloSatService.endCall().subscribe({
      next: (data) => {
        this.msg.success('¡Atención Finalizada!');
      },
    });
  }

  endAssistance() {
    this.aloSatService.pauseAgent(VicidialPauseCode.WRAPUP).subscribe({
      next: (data) => {
        this.msg.success('¡Atención Finalizada!');
      },
    });
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  busqueda: string = '';

  filaExpandidaIndex: number | null = null;

  items = [
    {
      nombre: 'Juan Pérez',
      estado: 'Activo',
      detalles:
        'Llamado el 5 de agosto. Comentó que está satisfecho con el servicio.',
    },
    {
      nombre: 'Ana López',
      estado: 'Pendiente',
      detalles: 'Se dejó mensaje de voz. Seguir intentando el contacto.',
    },
  ];

  expandirFila(index: number) {
    this.filaExpandidaIndex = this.filaExpandidaIndex === index ? null : index;
  }

  get loadingCitizen(): boolean {
    return this.aloSatService.loadingCitizen;
  }

  get citizen(): CitizenInfo {
    return this.aloSatService.citizen;
  }

  get existCitizen(): boolean {
    return this.aloSatService.existCitizen;
  }

  get labelCall(): string {
    return this.loadingCitizen
      ? 'Reconociendo número entrante'
      : this.isInWrap
      ? 'Última llamada hace 2 minutos...'
      : !this.existCitizen
      ? 'Número no registrado en el sistema'
      : 'Número registrado en el sistema';
  }

  buscarContribuyente() {
    if (!this.busqueda.trim()) {
      console.warn('Búsqueda vacía');
      return;
    }

    console.log('this.busqueda', this.busqueda);

    this.externalCitizenService
      .getCitizenInformation({
        psiTipConsulta: 2,
        piValPar1:
          !isNaN(Number.parseInt(this.busqueda)) && this.busqueda.length == 8
            ? 2
            : 1,
        pvValPar2: this.busqueda,
      })
      .subscribe((response) => {
        console.log(response);
        let reponseHardCoded = [
          {
            vcontacto: 'A. CRISANTO Z. S.A.C. CONTRATISTAS GENERALES',
            vnumTel: '999935494',
            vtipDoc: 'RUC',
            vdocIde: '20101279554 ',
          },
        ];
        this.aloSatService.citizen = response[0] ?? reponseHardCoded[0];
      });

    // Aquí podrías invocar un servicio real para la búsqueda
  }

  onSubmitAtencion() {
    const form = this.formDataAtencion.value;

    this.store.create({
      ...form,
      contacto: this.callInfo?.phoneNumber,
      tipDoc: this.citizen?.vtipDoc,
      docIde: this.citizen?.vdocIde,
    } as CitizenAssistance);
  }
}

interface MetodoContacto {
  tipo: string;
  contacto: string;
  canal: string;
  label: string;
}
