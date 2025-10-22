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
import { filter, merge, Subscription, tap } from 'rxjs';
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
import { TimeAgoPipe } from '@pipes/time-ago.pipe';
import { ConsultTypeStore } from '@stores/consult-type.store';
import { TypeIdeDocStore } from '@stores/type-ide-doc.store';
import { ConsultType } from '@models/consult-type.modal';
import { TypeIdeDoc } from '@models/type-ide-doc.model';
import { ChannelAssistanceStore } from '@stores/channel-assistance.store';
import { ChannelAssistance } from '@models/channel-assistance.model';
import { ChannelAssistanceService } from '@services/channel-assistance.service';
import { TimeElapsedPipe } from '@pipes/time-elapsed.pipe';
import { DurationPipe } from '@pipes/duration.pipe';
import { UnifiedQuerySistemComponent } from '../unified-query-system/unified-query-system.component';
import { CheckboxModule } from 'primeng/checkbox';

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
    UnifiedQuerySistemComponent,
    TableModule,
    TabsModule,
    SelectModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ButtonModule,
    CardModule,
    TimeAgoPipe,
    TimeElapsedPipe,
    DurationPipe,
    ButtonSaveComponent,
    BtnCustomComponent,
    CheckboxModule,
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

  private readonly externalCitizenService = inject(ExternalCitizenService);

  private readonly authStore = inject(AuthStore);

  private readonly store = inject(ChannelAssistanceStore);

  private readonly aloSatStore = inject(AloSatStore);

  private readonly citizenAssistanceService = inject(CitizenAssistanceService);

  private readonly channelAssistanceService = inject(ChannelAssistanceService);

  private readonly omnicanalidadService = inject(OmnicanalidadService);

  private readonly saldomaticoService = inject(SaldomaticoService);

  private readonly socketService = inject(SocketService);

  readonly consultTypeStore = inject(ConsultTypeStore);

  readonly typeIdeDocStore = inject(TypeIdeDocStore);

  motivo: any;

  abandoned: boolean = false;

  formData = new FormGroup({
    campaignId: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  formDataAtencion = new FormGroup({
    name: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    detail: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    consultTypeId: new FormControl<number | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    categoryId: new FormControl<number | undefined>(1, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    communicationId: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    docIde: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    tipDoc: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  listCampaigns: any[] = [];

  inboundGroupsAlls: { groupId: string; groupName: string }[] = [];
  inboundGroups: { groupId: string; groupName: string }[] = [];
  inboundGroupsSelected: { groupId: string; groupName: string }[] = [];
  submitCampaign: boolean = false;

  get consultTypeList(): ConsultType[] {
    return this.consultTypeStore.items();
  }

  get typeIdeDocList(): TypeIdeDoc[] {
    return this.typeIdeDocStore.items();
  }

  get isLogged(): boolean {
    return !!this.userState && this.userState?.id !== ChannelPhoneState.OFFLINE;
  }

  get agentStatus(): string | undefined {
    return this.userState?.name;
  }

  get isInPaused(): boolean {
    return this.userState?.id === ChannelPhoneState.PAUSED;
  }

  get isInCall(): boolean {
    return this.userState?.id === ChannelPhoneState.INCALL;
  }

  get isInQueue(): boolean {
    return this.userState?.id === ChannelPhoneState.QUEUE;
  }

  get isInWrap(): boolean {
    return this.isInPaused && this.pauseCode === VicidialPauseCode.WRAP;
  }

  get isInPark(): boolean {
    return this.isInCall && this.pauseCode === VicidialPauseCode.PARK;
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

  tabSelected = 0;

  listtypeDeuda = [
    {
      code: 3,
      label: 'Multas administrativas',
    },
    {
      code: 1,
      label: 'Deudas tributarias',
    },
    {
      code: 2,
      label: 'Deudas no tributarias',
    },
  ];

  listtypeTributo = [
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

  searchText = signal<string | undefined>(undefined);

  tableComunicaciones: CitizenAssistance[] = [];

  tableChannelAssistances: ChannelAssistance[] = [];

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
      this.formDataAtencion
        .get('communicationId')
        ?.setValue(callInfo?.leadId as string);
    }
  });

  private lastCallInfoEffect = effect(() => {
    const lastCallInfo = this.aloSatStore.lastCallInfo();
    if (this.isInWrap) {
      this.formDataAtencion
        .get('communicationId')
        ?.setValue(lastCallInfo?.leadId as string);
    } else {
    }
  });

  private citizenEffect = effect(() => {
    const citizen = this.aloSatStore.citizen();
    if (citizen) {
      this.formDataAtencion.get('tipDoc')?.setValue(citizen.vtipDoc);
      this.formDataAtencion.get('docIde')?.setValue(citizen.vdocIde);
      this.searchText.set(citizen.vdocIde);
      this.formDataAtencion.get('name')?.setValue(citizen.vcontacto);
      this.search();
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
      if (this.isInWrap) {
        this.endAssistance();
      }
      return;
    }
  });

  ngOnInit(): void {
    this.consultTypeStore.loadAll();
    this.typeIdeDocStore.loadAll();
    if (this.isAloSat) {
      this.aloSatStore.getState();
      this.aloSatService.getCallInfo();
      this.getCampaigns();
    }

    merge(
      this.socketService.onUserPhoneStateRequest(),
      this.socketService.onRequestPhoneCallSubject()
    )
      .pipe(
        filter((data) => data.userId === this.user.id),
        tap((data) => console.log('Socket event', data))
      )
      .subscribe(() => this.aloSatStore.getState());
  }

  ngOnDestroy(): void {}

  selectedInboundGroupAll() {
    this.inboundGroupsSelected = this.inboundGroupsAlls;
    this.inboundGroups = [];
  }

  deletedInboundGroupAll() {
    this.inboundGroups = this.inboundGroupsAlls;
    this.inboundGroupsSelected = [];
  }

  selectedInboundGroup(group: { groupId: string; groupName: string }) {
    this.inboundGroupsSelected.push(group);
    this.inboundGroups = this.inboundGroups.filter(
      (g) => g.groupId !== group.groupId
    );
  }

  deletedInboundGroup(group: { groupId: string; groupName: string }) {
    this.inboundGroups.push(group);
    this.inboundGroupsSelected = this.inboundGroupsSelected.filter(
      (g) => g.groupId !== group.groupId
    );
  }

  resetForm() {
    this.formDataAtencion.reset({
      name: undefined,
      detail: undefined,
      consultTypeId: undefined,
      categoryId: 2,
      tipDoc: undefined,
      docIde: undefined,
    });
  }

  getAtenciones() {
    const searchText = this.searchText();
    if (searchText) {
      this.citizenAssistanceService.findByDocIde(searchText).subscribe({
        next: (data) => {
          this.tableComunicaciones = data;
        },
      });
      this.channelAssistanceService.findByDocIde(searchText).subscribe({
        next: (data) => {
          this.tableChannelAssistances = data;
        },
      });
    }
  }

  getChannelAssistances() {
    const searchText = this.searchText();
    if (searchText) {
      this.citizenAssistanceService.findByDocIde(searchText).subscribe({
        next: (data) => {
          this.tableComunicaciones = data;
        },
      });
    }
  }

  getImpuestoPredial() {
    const searchText = this.searchText();
    if (searchText) {
      this.saldomaticoService
        .impuestoPredialInfo(
          !isNaN(Number.parseInt(searchText)) && searchText.length == 8
            ? 2
            : searchText.length == 7
            ? 5
            : 1,
          searchText
        )
        .subscribe({
          next: (data) => {
            this.tableImpuestoPredial = data;
          },
        });
    }
  }

  getImpuestoVehicular(code?: string) {
    const searchText = this.searchText()!;
    this.saldomaticoService
      .impuestoVehicularInfo(
        !isNaN(Number.parseInt(searchText)) && searchText.length == 8
          ? 2
          : searchText.length == 7
          ? 5
          : 1,
        searchText
      )
      .subscribe({
        next: (data) => {
          this.tableImpuestoVehicular = data;
        },
      });
  }

  getPapeletaInfo() {
    const searchText = this.searchText()!;
    this.omnicanalidadService
      .consultarPapeleta(
        !isNaN(Number.parseInt(searchText)) && searchText.length == 8 ? 2 : 1,
        searchText
      )
      .subscribe({
        next: (data) => {
          this.tablePapeletas = data;
        },
      });
  }

  getDeuda() {
    const searchText = this.searchText()!;
    this.omnicanalidadService
      .consultarMultaAdm(
        !isNaN(Number.parseInt(searchText)) && searchText.length == 8 ? 2 : 1,
        searchText
      )
      .subscribe({
        next: (data) => {
          this.tableDeudas = data;
        },
      });
  }

  getTramites() {
    const searchText = this.searchText()!;
    this.omnicanalidadService
      .consultarTramite(
        !isNaN(Number.parseInt(searchText)) && searchText.length == 8 ? 2 : 1,
        searchText
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
    this.getAtenciones();
  }

  clear() {
    this.searchText.set(undefined);
    this.tableDeudas = [];
    this.tableImpuestoPredial = [];
    this.tablePapeletas = [];
    this.tableTramites = [];
    this.tableComunicaciones = [];
    this.tableChannelAssistances = [];
  }

  nextStep() {
    const { campaignId } = this.formData.value;
    if (!campaignId) {
      this.msg.error('El id de la campaña es obligatorio');
      return;
    }
    this.aloSatService
      .findInboundGroupsByCampaign(campaignId as string)
      .subscribe({
        next: (data) => {
          this.submitCampaign = true;
          this.inboundGroupsAlls = data;
          this.inboundGroups = data;
        },
      });
  }

  onSubmit() {
    const { campaignId } = this.formData.value;
    if (!campaignId) {
      this.msg.error('El id de la campaña es obligatorio');
      return;
    }
    this.aloSatService
      .agentLogin(
        campaignId as string,
        `${this.inboundGroupsSelected.map((item) => item.groupId).join(' ')} -`
      )
      .subscribe({
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
            this.submitCampaign = false;
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

  selectedItem: any = null;
  mostrarModal: boolean = false;

  abrirModal(item: any) {
    this.selectedItem = item;
    this.mostrarModal = true;
  }

  endCall() {
    this.aloSatService.endCall().subscribe({
      next: (data) => {
        this.msg.success('¡Llamada finalizada!');
      },
    });
  }

  parkCall() {
    this.aloSatService.parkCall(!this.isInPark!).subscribe({
      next: (data) => {
        this.msg.success(
          !this.isInPark ? '¡Ciudadano en espera!' : '¡Llamada Reanudada!'
        );
      },
    });
  }

  endAssistance() {
    this.aloSatService
      .pauseAgent(
        VicidialPauseCode.WRAPUP,
        this.isInWrap ? !this.abandoned : false
      )
      .subscribe({
        next: (data) => {
          this.msg.success('¡Atención finalizada!');
        },
      });
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  busqueda: string = '';

  filaExpandidaIndex: number | null = null;

  expandirFila(index: number) {
    this.filaExpandidaIndex = this.filaExpandidaIndex === index ? null : index;
  }

  get loadingCitizen(): boolean {
    return this.aloSatStore.loadingCitizen();
  }

  get citizen(): CitizenInfo | undefined {
    return this.aloSatStore.citizen();
  }

  get existCitizen(): boolean {
    return !!this.citizen;
  }

  get labelCall(): string {
    return this.loadingCitizen
      ? 'Reconociendo número entrante'
      : !this.existCitizen
      ? 'Número no registrado en el sistema'
      : 'Número registrado en el sistema';
  }

  buscarContribuyente() {
    if (!this.busqueda.trim()) {
      console.warn('Búsqueda vacía');
      return;
    }

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
        this.aloSatService.citizen = response[0];
      });

    // Aquí podrías invocar un servicio real para la búsqueda
  }

  onSubmitAtencion() {
    const form = this.formDataAtencion.value;

    this.store.create({
      ...form,
    } as ChannelAssistance);
  }
}

interface MetodoContacto {
  tipo: string;
  contacto: string;
  canal: string;
  label: string;
}
