import { merge, tap } from 'rxjs';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { MenuModule } from 'primeng/menu';
import { ActualCall, AMIFilter } from '@models/supervise';
import { ButtonSplitComponent } from '@shared/buttons/button-split/button-split.component';
import { IButtonSplit } from '@interfaces/button.interface';
import { EscuchaVivoComponent } from '../paneles-supervision/escucha-vivo/escucha-vivo.component';
import { IntervenirLlamadaComponent } from '../paneles-supervision/intervenir-llamada/intervenir-llamada.component';
import { ControlGrabacionComponent } from '../paneles-supervision/control-grabacion/control-grabacion.component';
import { AmiService } from '@services/ami.service';
import { groupBy } from '@utils/array.util';
import { AmiSocketService } from '@services/ami-socket.service';
import { MessageService } from 'primeng/api';
import { SocketService } from '@services/socket.service';
import { AloSatStore } from '@stores/alo-sat.store';
import { VicidialUser } from '@models/user.model';
import {
  ChannelPhoneState,
  pauseCodeAgent,
  VicidialPauseCode,
} from '@constants/pause-code-agent.constant';
import { ChannelState } from '@models/channel-state.model';
import { CommonModule } from '@angular/common';
import { TimeElapsedPipe } from '@pipes/time-elapsed.pipe';

@Component({
  selector: 'app-supervision',
  templateUrl: './supervision.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    FormsModule,
    MenuModule,
    BreadcrumbModule,
    CheckboxModule,
    Select,
    DatePickerModule,
    CardModule,
    ControlGrabacionComponent,
    ButtonSplitComponent,
    EscuchaVivoComponent,
    IntervenirLlamadaComponent,
    TimeElapsedPipe,
  ],
})
export class SupervisionComponent implements OnInit {
  private readonly socketService = inject(SocketService);

  private readonly aloSatStore = inject(AloSatStore);

  userList: VicidialUser[] = [];

  estadoOptions: ChannelState[] = [];

  constructor(
    private AmiService: AmiService,
    private amiSocketService: AmiSocketService,
    private messageService: MessageService
  ) {}

  private callInfoEffect = effect(() => {
    const userStates = this.aloSatStore.userStates();
    if (userStates) {
      this.userList = userStates.map((item) => ({
        ...item,
        lastCall: item.user?.callHistory?.[0],
        duration: item.user?.callHistory?.[0]?.seconds ?? 0,
        phoneNumber: item.user?.callHistory?.[0]?.phoneNumber,
        isOffline: item.channelState?.id === ChannelPhoneState.OFFLINE,
        inCall: item.channelState?.id === ChannelPhoneState.INCALL,
        state: this.getState(item.channelState, item.pauseCode),
      }));

      this.estadoOptions = this.userList
        .map((item) => item.channelState)
        .filter((item) => !!item);

      this.getActiveCall();
    }
  });

  get filteredItems(): any[] {
    return this.userList.filter((item) => {
      const matchesState =
        !this.activeStateFilter ||
        this.activeStateFilter.id === item.channelState?.id;

      const matchesSearch =
        !this.activeSearch() ||
        item.user.name
          .toLowerCase()
          .includes(this.activeSearch().toLowerCase());

      return matchesState && matchesSearch;
    });
  }

  getState(userState?: ChannelState, pauseCode?: string): any {
    let icon = 'heroicons-outline:pause';
    let label = userState?.name;
    let textColor = 'text-slate-600';
    switch (userState?.id) {
      case ChannelPhoneState.PAUSED:
        icon = 'heroicons-outline:pause';
        label =
          userState?.name +
          (!!pauseCode
            ? ` - ${this.getPauseCodeValue(pauseCode)}`
            : ' - Inicial');
        textColor = 'text-sky-600';
        break;
      case ChannelPhoneState.DISPO:
        icon = 'icon-park-outline:check-one';
        label = userState?.name;
        textColor = 'text-teal-600';
        break;
      case ChannelPhoneState.QUEUE:
        icon = 'fluent:people-queue-20-regular';
        label = userState?.name;
        textColor = 'text-orange-600';
        break;
      case ChannelPhoneState.INCALL:
        icon = 'line-md:phone-call-loop';
        label = userState?.name;
        textColor = 'text-green-600';
        break;
      case ChannelPhoneState.READY:
        icon = 'heroicons-outline:check-circle';
        label = userState?.name;
        textColor = 'text-green-600';
        break;
      case ChannelPhoneState.OFFLINE:
        icon = 'heroicons-outline:status-offline';
        break;
    }
    return {
      id: userState?.id,
      icon,
      label,
      textColor,
    };
  }

  getPauseCodeValue(code: string): string {
    return pauseCodeAgent.find((p) => p.code === code)?.name!;
  }

  items = signal<ActualCall[]>([]);

  activeStateFilter?: ChannelState;
  activeSearch = signal<string>('');

  showListen = false;
  showInterupt = false;
  showControl = false;
  timeoutRef: any;
  limit = signal<number>(50);
  offset = signal<number>(0);
  minutes = signal<number>(0);
  itemListen!: ActualCall;
  itemInterrupt!: ActualCall;
  itemControl!: ActualCall;
  enLlamada = signal<number>(0);
  disponible = signal<number>(0);
  fueraLinea = signal<number>(0);
  pausa = signal<number>(0);

  activeAlert = signal<boolean>(false);

  menuItems: IButtonSplit[] = [
    {
      label: 'Escuchar en vivo',
      icon: 'mdi:headphones',
      action: (item: ActualCall) => this.onLiveListen(item),
    },
    {
      label: 'Interrumpir llamada',
      icon: 'mdi:phone-cancel',
      action: (item: ActualCall) => this.onInterruptCall(item),
    },
    // {
    //   label: 'Control de grabación',
    //   icon: 'mdi:record-circle',
    //   action: (item: ActualCall) => this.onControlRecording(item),
    // },
  ];

  ngOnInit() {
    this.aloSatStore.loadAllStates();
    merge(
      this.socketService.onUserPhoneStateRequest(),
      this.socketService.onRequestPhoneCallSubject()
    )
      .pipe(tap((data) => console.log('Socket event', data)))
      .subscribe(() => this.aloSatStore.loadAllStates());
  }

  onLiveListen(item: any) {
    this.showListen = true;
    this.itemListen = item;
  }

  onInterruptCall(item: ActualCall) {
    this.showInterupt = true;
    this.itemInterrupt = item;
  }

  onControlRecording(item: ActualCall) {
    this.showControl = true;
    this.itemControl = item;
  }

  getActiveCall() {
    const grouped = groupBy(this.userList, (item) => item.channelState?.id!);
    this.disponible.set((grouped[ChannelPhoneState.READY] || []).length);
    this.enLlamada.set((grouped[ChannelPhoneState.INCALL] || []).length);
    this.fueraLinea.set((grouped[ChannelPhoneState.OFFLINE] || []).length);
    this.pausa.set((grouped[ChannelPhoneState.PAUSED] || []).length);
  }

  Alert() {
    if (!this.minutes || this.minutes() <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Ingrese minutos válidos',
      });
      return;
    }
    if (this.timeoutRef) {
      clearTimeout(this.timeoutRef);
    }
    const ms = this.minutes() * 60 * 1000;
    this.messageService.add({
      severity: 'info',
      summary: 'Alerta programada',
      detail: `Se activará en ${this.minutes()} minutos`,
    });

    this.timeoutRef = setTimeout(() => {
      this.messageService.add({
        severity: 'success',
        summary: '¡Alerta!',
        detail: 'Se cumplió el tiempo programado',
      });
    }, ms);
  }
}
