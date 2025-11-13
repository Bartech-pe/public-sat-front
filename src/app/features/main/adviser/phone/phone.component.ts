import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  inject,
  OnInit,
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
import { CitizenInfo } from '@services/externalCitizen.service';
import { AuthStore } from '@stores/auth.store';
import {
  filter,
  interval,
  merge,
  Subject,
  Subscription,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { TextareaModule } from 'primeng/textarea';
import { FieldsetModule } from 'primeng/fieldset';
import { TableModule } from 'primeng/table';
import { TransferCallComponent } from './transfer-call/transfer-call.component';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TabsModule } from 'primeng/tabs';
import { AloSatStore } from '@stores/alo-sat.store';
import { ChannelState } from '@models/channel-state.model';
import { BtnCustomComponent } from '@shared/buttons/btn-custom/btn-custom.component';
import {
  ChannelPhoneState,
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
import { TimeElapsedPipe } from '@pipes/time-elapsed.pipe';
import { DurationPipe } from '@pipes/duration.pipe';
import { UnifiedQuerySistemComponent } from '../unified-query-system/unified-query-system.component';
import { CheckboxModule } from 'primeng/checkbox';
import { VicidialUserComponent } from '@features/main/settings/users/user-vicidial/user-vicidial.component';
import { UserStore } from '@stores/user.store';
import { CallDispoComponent } from './call-dispo/call-dispo.component';

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
    CheckboxModule,
    CardModule,
    TimeAgoPipe,
    TimeElapsedPipe,
    DurationPipe,
    ButtonSaveComponent,
    BtnCustomComponent,
    UnifiedQuerySistemComponent,
  ],
  templateUrl: './phone.component.html',
  styles: ``,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PhoneComponent implements OnInit {
  openModal: boolean = false;

  private readonly dialogService = inject(DialogService);

  private readonly msg = inject(MessageGlobalService);

  private readonly aloSatService = inject(AloSatService);

  private readonly authStore = inject(AuthStore);

  private readonly userStore = inject(UserStore);

  private readonly aloSatStore = inject(AloSatStore);

  private readonly socketService = inject(SocketService);

  readonly consultTypeStore = inject(ConsultTypeStore);

  readonly typeIdeDocStore = inject(TypeIdeDocStore);

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
    consultTypeCode: new FormControl<string | undefined>(undefined, {
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
    return this.consultTypeStore.items().map((item) => ({
      ...item,
      label: `[${item.code}] ${item.name}`,
    }));
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

  get isInDispo(): boolean {
    return this.userState?.id === ChannelPhoneState.DISPO;
  }

  get isInPark(): boolean {
    return this.isInCall && this.pauseCode === VicidialPauseCode.PARK;
  }

  get campaignId(): string | undefined {
    return this.formData.value.campaignId;
  }

  get isAloSat(): boolean {
    return this.authStore.user()?.officeId === 1;
  }

  get user(): User {
    return this.authStore.user()!;
  }

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

  get currentState(): any {
    let icon = 'heroicons-outline:pause';
    let label = 'PAUSADO';
    let textColor = 'text-red-600';
    let borderColor = 'bg-sky-50 border-sky-600';
    switch (this.userState?.id) {
      case ChannelPhoneState.PAUSED:
        icon = 'heroicons-outline:pause';
        label =
          this.userState?.name +
          (this.pauseCode
            ? ` - ${this.getPauseCodeValue(this.pauseCode)}`
            : '');
        textColor = 'text-sky-600';
        break;
      case ChannelPhoneState.DISPO:
        icon = 'icon-park-outline:check-one';
        label = this.userState?.name;
        textColor = 'text-teal-600';
        borderColor = 'bg-teal-50 border-teal-600';
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
        borderColor = 'bg-green-50 border-green-600';
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
      borderColor,
    };
  }

  pauseCodeList: { pauseCode: string; pauseCodeName: string }[] = [];

  pauseAgent: boolean = false;

  private keepAliveSub?: Subscription;

  private stateEffect = effect(() => {
    const state = this.aloSatStore.state();
    if (state) {
      if (state.id !== ChannelPhoneState.OFFLINE) {
        this.startKeepAlive();
      } else {
        this.stopKeepAlive();
      }
    }
  });

  private campaignIdEffect = effect(() => {
    const campaignId = this.aloSatStore.campaignId();
    if (campaignId) {
      this.formData.patchValue({
        campaignId,
      });

      this.loadPauseCodes(campaignId);
    }
  });

  private callInfoEffect = effect(() => {
    const callInfo = this.aloSatStore.callInfo();
    if (callInfo) {
      this.formDataAtencion
        .get('communicationId')
        ?.setValue(callInfo?.leadId as string);
    }
  });

  private citizenEffect = effect(() => {
    const citizen = this.aloSatStore.citizen();
    if (citizen) {
      this.formDataAtencion.get('tipDoc')?.setValue(citizen.vtipDoc);
      this.formDataAtencion.get('docIde')?.setValue(citizen.vdocIde);
      this.formDataAtencion.get('name')?.setValue(citizen.vcontacto);
    }
  });

  private _unsubscribe$ = new Subject<void>();

  ngOnInit(): void {
    this.consultTypeStore.loadAll();
    this.typeIdeDocStore.loadAll();
    if (this.isAloSat) {
      this.aloSatStore.getState();
      this.getCampaigns();
    }

    merge(
      this.socketService.onUserPhoneStateRequest(),
      this.socketService.onRequestPhoneCallSubject()
    )
      .pipe(
        takeUntil(this._unsubscribe$),
        filter((data) => data.userId === this.user.id),
        tap((data) => console.log('Socket event', data))
      )
      .subscribe(() => this.aloSatStore.getState());
  }

  ngOnDestroy(): void {
    this.stateEffect.destroy();
    this.campaignIdEffect.destroy();
    this.callInfoEffect.destroy();
    this.citizenEffect.destroy();
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
    this.stopKeepAlive();
  }

  startKeepAlive() {
    this.stopKeepAlive();

    this.keepAliveSub = interval(2000)
      .pipe(switchMap(() => this.aloSatService.confExtenCheck()))
      .subscribe();
  }

  stopKeepAlive() {
    this.keepAliveSub?.unsubscribe();
    this.keepAliveSub = undefined;
  }

  loadPauseCodes(campaignId: string) {
    this.aloSatService.findAllCampaignPauseCodes(campaignId).subscribe({
      next: (data) => {
        this.pauseCodeList = data;
      },
    });
  }

  getPauseCodeValue(code: string): string {
    return code == 'LOGIN'
      ? 'Inicial'
      : this.pauseCodeList.find(
          (p) => p.pauseCode.toLowerCase() === code.toLowerCase()
        )?.pauseCodeName!;
  }

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
      consultTypeCode: undefined,
      categoryId: 2,
      tipDoc: undefined,
      docIde: undefined,
    });
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

  clearInbound() {
    this.submitCampaign = false;
    this.inboundGroups = [];
    this.inboundGroupsSelected = [];
  }

  onSubmit() {
    if (!this.campaignId) {
      this.msg.error('El id de la campaña es obligatorio');
      return;
    }
    const inbounds = ` ${this.inboundGroupsSelected
      .map((item) => item.groupId)
      .join(' ')} -`;
    this.aloSatService.agentLogin(this.campaignId, inbounds).subscribe({
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
            this.clearInbound();
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
      data: {
        campaignId: this.campaignId,
        currentState: this.currentState,
      },
      modal: true,
      focusOnShow: false,
      dismissableMask: true,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      this.openModal = false;
      // this.aloSatStore.getState();
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
          !this.isInPark ? '¡Ciudadano en espera!' : '¡Llamada reanudada!'
        );
      },
    });
  }

  transferSurvey() {
    this.aloSatService.transferSurvey('d1').subscribe({
      next: (data) => {
        this.msg.success('¡Se transfirio el usuario a la encuesta!');
      },
    });
  }

  endAssistance() {
    this.openModal = true;
    const ref = this.dialogService.open(CallDispoComponent, {
      header: 'Resultado de llamada',
      styleClass: 'modal-lg',
      data: {
        campaignId: this.campaignId,
      },
      modal: true,
      focusOnShow: false,
      dismissableMask: true,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      this.openModal = false;
      // this.aloSatStore.getState();
    });
  }

  onSubmitAtencion() {
    const form = this.formDataAtencion.value;

    this.aloSatService
      .alosatAssistance(
        {
          ...form,
          contact: {
            docIde: form.docIde!,
            tipDoc: form.tipDoc!,
            value: this.callInfo?.phoneNumber!,
            contactType: 'PHONE',
            isAdditional: false,
          },
        },
        this.pauseAgent
      )
      .subscribe({
        next: (data) => {
          this.resetForm();
          this.msg.success('¡Resultado registrado y llamada finalizada!');
        },
      });
  }

  vicidialParams() {
    const user = this.authStore.user();
    if (user) {
      this.userStore.loadById(user.id);
      const ref = this.dialogService.open(VicidialUserComponent, {
        header: `Credenciales VICIdial | ${user.name}`,
        styleClass: 'modal-md',
        modal: true,
        focusOnShow: false,
        dismissableMask: false,
        closable: true,
      });
    }
  }
}
