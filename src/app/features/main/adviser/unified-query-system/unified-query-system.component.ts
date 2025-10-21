import { Component, CUSTOM_ELEMENTS_SCHEMA, effect, inject, Input, OnInit, signal } from "@angular/core";
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogConfig, DynamicDialogModule } from 'primeng/dynamicdialog';
import { BreakComponent } from "../phone/break/break.component";
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
import { TransferCallComponent } from "../phone/transfer-call/transfer-call.component";
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

@Component({
  selector: 'app-unified-query-system',
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
    BtnCustomComponent,
    DynamicDialogModule
  ],
  providers: [DialogService],
  templateUrl: './unified-query-system.component.html',
  styles: ``,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class UnifiedQuerySistemComponent implements OnInit {

  @Input  () documentToSearch?: string;

  openModal: boolean = false;

  showConfigDialog: boolean = false;
  showInfoDialog: boolean = false;

  public readonly config = inject(DynamicDialogConfig, { optional: true });

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

  formData = new FormGroup({
    idCampaign: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  listCampaigns: any[] = [];

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

  searchText = signal('');

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

  ngOnInit(): void {
    const doc = this.documentToSearch || this.config?.data?.documentToSearch;
    if (doc) {
      this.searchText.set(doc);
      this.search();
    }
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

  getCampaigns() {
    this.aloSatService.getCampaignsByUser().subscribe({
      next: (data) => {
        this.listCampaigns = data;
      },
    });
  }
  getAtenciones() {
    if (this.searchText()) {
      this.citizenAssistanceService.findByDocIde(this.searchText()).subscribe({
        next: (data) => {
          this.tableComunicaciones = data;
        },
      });
      this.channelAssistanceService.findByDocIde(this.searchText()).subscribe({
        next: (data) => {
          this.tableChannelAssistances = data;
        },
      });
    }
  }

  getChannelAssistances() {
    if (this.searchText()) {
      this.citizenAssistanceService.findByDocIde(this.searchText()).subscribe({
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
          : this.searchText().length == 7
          ? 5
          : 1,
        this.searchText()
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
        !isNaN(Number.parseInt(this.searchText())) &&
          this.searchText().length == 8
          ? 2
          : this.searchText().length == 7
          ? 5
          : 1,
        this.searchText()
      )
      .subscribe({
        next: (data) => {
          this.tableImpuestoVehicular = data;
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
    this.getImpuestoVehicular();
    this.getPapeletaInfo();
    this.getTramites();
    this.getAtenciones();
  }

  clear() {
    this.searchText.set('');
    this.tableDeudas = [];
    this.tableImpuestoPredial = [];
    this.tablePapeletas = [];
    this.tableTramites = [];
    this.tableComunicaciones = [];
    this.tableChannelAssistances = [];
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
}
