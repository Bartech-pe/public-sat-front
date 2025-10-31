import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ChannelPhoneState,
  pauseCodeAgent,
} from '@constants/pause-code-agent.constant';
import { AttentionDetail } from '@models/attention-detail.model';
import { ChannelCount } from '@models/channel-count.model';
import { ChannelState } from '@models/channel-state.model';
import { ChatAdvisor } from '@models/chat-advisor.model';
import { ChatWspAdvisor } from '@models/chat-wsp-advisor.model';
import { MailCount } from '@models/count-mail';
import { MailAdvisor } from '@models/mail-advisor.model';
import { StateDetailsByAdvisor } from '@models/state-detail-by-advisor.model';
import { User, VicidialUser } from '@models/user.model';
import { VicidialCount } from '@models/vicidial-count-box.model';
import { VicidialReport } from '@models/vicidial-report.model';
import { DurationPipe } from '@pipes/duration.pipe';
import { TimeElapsedPipe } from '@pipes/time-elapsed.pipe';
import { MonitorService } from '@services/monitor.service';
import { SocketService } from '@services/socket.service';
import { AloSatStore } from '@stores/alo-sat.store';
import { AccordionModule } from 'primeng/accordion';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ColorPickerModule } from 'primeng/colorpicker';
import { DialogModule } from 'primeng/dialog';
import { DialogService } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { merge, tap } from 'rxjs';
import { BtnCustomComponent } from '@shared/buttons/btn-custom/btn-custom.component';
import { AloSatService } from '@services/alo-sat.service';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CallService } from '@services/call.service';
import { PaginatorComponent } from '@shared/paginator/paginator.component';
import { SelectModule } from 'primeng/select';
import { ChannelStateService } from '@services/channel-state.service';
import { MailService } from '@services/mail.service';
import { Popover, PopoverModule } from 'primeng/popover';

type ViewType = 'alosat' | 'email' | 'chatsat' | 'whatsapp';

@Component({
  selector: 'app-monitoring-panel',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    InputTextModule,
    ColorPickerModule,
    ButtonModule,
    BreadcrumbModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    TabsModule,
    TagModule,
    AccordionModule,
    AvatarModule,
    BadgeModule,
    DialogModule,
    TableModule,
    SelectModule,
    TimeElapsedPipe,
    DurationPipe,
    PopoverModule,
    BtnCustomComponent,
    PaginatorComponent,
  ],
  templateUrl: './monitoring-panel.component.html',
  styles: ``,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MonitoringPanelComponent {
  @ViewChild('opStates') opStates!: Popover;
  @ViewChild('opAssistances') opAssistances!: Popover;

  private readonly dialogService = inject(DialogService);

  private readonly router = inject(Router);

  private readonly route = inject(ActivatedRoute);

  private readonly msg = inject(MessageGlobalService);

  private readonly monitorService = inject(MonitorService);

  private readonly callService = inject(CallService);

  private readonly socketService = inject(SocketService);

  private readonly aloSatStore = inject(AloSatStore);

  private readonly aloSatService = inject(AloSatService);

  private readonly channelStateService = inject(ChannelStateService);

  private readonly mailService = inject(MailService);

  value: number = 0;
  tablaActiva: 'estados' | 'atenciones' | null = null;
  popupAbierto: number | null = null;
  detalleAbierto = false;

  // Contadores
  viciCount: VicidialCount | null = null;

  aloSatCount: any[] = [];
  aloSatTotal: number = 0;
  aloSatQueueTotal: number = 0;
  saleTotal: number = 0;

  chatCount: ChannelCount | null = null;
  wspCount: ChannelCount | null = null;
  mailCount: MailCount | null = null;
  vicidialCount?: VicidialCount;
  //  Estados de carga / Contadores
  loadingVicidialDashboard = false;
  loadingChatCount = false;
  loadingWspCount = false;
  loadingMailCount = false;

  // Tablas de Asesores
  mailAdvisors: MailAdvisor[] = [];
  chatAdvisors: ChatAdvisor[] = [];
  wspAdvisors: ChatWspAdvisor[] = [];

  // Estados por asesor
  stateDetails: any[] = [];
  totalDurationStates: number = 0;
  loadingStateDetails = false;

  // Detalle de atención
  attentionDetail: AttentionDetail | null = null;
  loadingAttentionDetail = false;

  // Reporte Vicidial (Tabla)
  vicidialReport: VicidialReport[] = [];

  originalRoute: string = '';

  viewValue = signal<ViewType>('alosat');

  limitAlo = signal(10);
  offsetAlo = signal(0);
  totalItemsAlo: number = 0;

  limitEmail = signal(10);
  offsetEmail = signal(0);
  totalItemsEmail: number = 0;

  userMailStates: ChannelState[] = [];

  pauseCodeList: { pauseCode: string; pauseCodeName: string }[] = [];

  ngOnInit() {
    this.loadCounts();
    this.loadChannelStateEmails();
    this.loadPauseCodes();

    this.originalRoute = this.router.url.split('?')[0];
    console.log('Ruta original:', this.originalRoute);
    this.route.queryParams.subscribe((params) => {
      const view = params['view'] ?? 'alosat';
      this.viewValue.set(view);
    });
  }

  loadChannelStateEmails() {
    this.channelStateService.channelStateEmail().subscribe({
      next: (data) => {
        this.userMailStates = data;
      },
    });
  }

  changeChannelState(userId: number, stateId: number) {
    console.log('userId', userId);
    console.log('stateId', stateId);

    if (stateId) {
      this.mailService.changeEmailState(userId, stateId).subscribe({
        next: () => {
          this.msg.success('Estado actualizado');
          this.loadMailMonitoring();
        },
      });
    }
  }

  changeView(view: ViewType) {
    this.router.navigate([this.originalRoute], {
      queryParams: { view },
    });
  }

  loadCounts() {
    this.loadAlosatMonitoring();
    this.loadMailMonitoring();
    this.loadChatCount();
    this.loadWspCount();
    this.loadVicidialReport();
    this.loadChatAdvisors();
    this.loadWspAdvisors();

    this.monitorService.getMonitorVicidialCount().subscribe({
      next: (res) => (this.vicidialCount = res),
      error: (err) =>
        console.error('Error al obtener conteo Vicidial:', err.message),
    });

    merge(
      this.socketService.onUserPhoneStateRequest(),
      this.socketService.onRequestPhoneCallSubject()
    )
      .pipe(tap((data) => console.log('Socket event', data)))
      .subscribe(() => {
        this.loadAlosatMonitoring();
      });

    this.socketService.onEmailRequest().subscribe({
      next: () => {
        this.loadMailMonitoring();
      },
    });
  }

  /** VICIDIAL DASHBOARD */
  loadAlosatMonitoring(): void {
    this.callService.getStatesCountByNow().subscribe({
      next: (res: any) => {
        this.aloSatCount = res.calls;
        this.aloSatTotal = res.total;
        this.aloSatQueueTotal = res.queueTotal;
        this.saleTotal = res.saleTotal;
        // this.viciCount = {
        //   llamadasAtendidas: res.llamadas_tendidas,
        //   llamadasTotales: res.llamadas_totales,
        //   llamadasPerdidas: res.llamadas_perdidas,
        //   llamadasEnCola: res.llamadas_en_cola,
        // };
        // this.loadingVicidialDashboard = false;
      },
      error: (err) => {
        console.error('Error al cargar conteo Vicidial Dashboard:', err);
        this.loadingVicidialDashboard = false;
      },
    });
    this.aloSatStore.loadAllStates();
  }

  userList: VicidialUser[] = [];

  getEfectividad(calls: number = 0) {
    return this.saleTotal ? calls / this.saleTotal : undefined;
  }

  get usersOnline(): number {
    return this.userList.filter((user: any) => !user.isOffline).length;
  }

  get usersIncall(): number {
    return this.userList.filter((user: any) => user.inCall).length;
  }

  get usersReady(): number {
    return this.userList.filter(
      (user: VicidialUser) => user?.channelState?.id === ChannelPhoneState.READY
    ).length;
  }

  private callInfoEffect = effect(() => {
    const userStates = this.aloSatStore.userStates();
    if (userStates) {
      this.loadingVicidialDashboard = false;
      this.userList = userStates.map((item) => ({
        ...item,
        lastCall: item.user?.callHistory?.[0],
        duration: item.user?.callHistory?.[0]?.seconds ?? 0,
        tiempoTotalLlamadas: (item.user?.callHistory ?? []).reduce(
          (acc, debt) => acc + debt.seconds,
          0
        ),
        efectividad: this.getEfectividad(item.calls),
        phoneNumber: item.user?.callHistory?.[0]?.phoneNumber,
        isOffline: item.channelState?.id === ChannelPhoneState.OFFLINE,
        inCall: item.channelState?.id === ChannelPhoneState.INCALL,
        state: this.getState(item.channelState, item.pauseCode),
      }));
    }
  });

  getState(userState?: ChannelState, pauseCode?: string): any {
    let icon = 'heroicons-outline:pause';
    let label = userState?.name;
    let textColor = 'text-slate-600';
    switch (userState?.id) {
      case ChannelPhoneState.PAUSED:
        icon = 'heroicons-outline:pause';
        label =
          userState?.name +
          (pauseCode ? ` - ${this.getPauseCodeValue(pauseCode)}` : '');
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

  loadPauseCodes() {
    this.aloSatService.findAllCampaignPauseCodes().subscribe({
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

  /** CHATS / WSP / MAIL*/
  loadChatCount(): void {
    this.loadingChatCount = true;
    this.monitorService.getCountChat().subscribe({
      next: (res) => (this.chatCount = res),
      error: (err) => console.error('Error al cargar conteo de chats:', err),
      complete: () => (this.loadingChatCount = false),
    });
  }

  loadWspCount(): void {
    this.loadingWspCount = true;
    this.monitorService.getCountWSP().subscribe({
      next: (res) => (this.wspCount = res),
      error: (err) => console.error('Error al cargar conteo de WhatsApp:', err),
      complete: () => (this.loadingWspCount = false),
    });
  }

  /** TABLAS DE ASESORES */
  loadMailMonitoring(): void {
    this.monitorService.getMonitorAdvisorsMail().subscribe({
      next: (data) => {
        this.mailAdvisors = data;
      },
      error: (err) => console.error('Error cargando asesores de correo', err),
    });
    this.monitorService.getCountMail().subscribe({
      next: (res) => {
        this.mailCount = res;
      },
      error: (err) => console.error('Error al cargar conteo de correos:', err),
      complete: () => (this.loadingMailCount = false),
    });
  }

  loadChatAdvisors(): void {
    this.monitorService.getMonitorAdvisorsChat().subscribe({
      next: (data) => {
        this.chatAdvisors = data;
      },
      error: (err) => console.error('Error cargando asesores de chat', err),
    });
  }

  loadWspAdvisors(): void {
    this.monitorService.getMonitorAdvisorsChatWsp().subscribe({
      next: (data) => (this.wspAdvisors = data),
      error: (err) => console.error('Error cargando asesores de WhatsApp', err),
    });
  }

  loadVicidialReport(): void {
    this.monitorService.getMonitorVicidialReport().subscribe({
      next: (data) => (this.vicidialReport = data),
      error: (err) => console.error('Error cargando reporte Vicidial', err),
    });
  }

  /** ESTADOS DETALLADOS  */
  loadStateDetails(userId: number, e: any): void {
    this.monitorService.getStateDetailsByAdvisor(userId).subscribe({
      next: (data) => {
        this.stateDetails = data.states;
        this.opStates.toggle(e);
        this.totalDurationStates = data.total;
      },
      error: (err) => {
        console.error('Error al cargar detalles de estados', err);
      },
    });
  }

  /**  DETALLE DE ATENCIÓN  */
  loadAttentionDetail(userId: number, e: any): void {
    this.monitorService.getAttentionDetail(userId).subscribe({
      next: (data) => {
        this.attentionDetail = Array.isArray(data) ? data[0] : data;
        this.opAssistances.toggle(e);
      },
      error: (err) => {
        console.error('Error al obtener detalle de atención', err);
      },
    });
  }

  /**  POPUP Y DETALLE */
  toggleDetalle(): void {
    this.detalleAbierto = !this.detalleAbierto;
  }

  /** Abrir tabla de Atenciones */
  verAtenciones(userId: number): void {
    this.tablaActiva = 'atenciones';
    this.attentionDetail = null;
    this.loadingAttentionDetail = true;

    this.monitorService.getAttentionDetail(userId).subscribe({
      next: (data) => {
        this.attentionDetail = Array.isArray(data) ? data[0] : data;
        this.loadingAttentionDetail = false;
      },
      error: (err) => {
        console.error('Error al obtener detalle de atención', err);
        this.loadingAttentionDetail = false;
      },
    });
  }

  /**
   * Devuelve el color según tipo de estado y tiempo.
   * @param status Estado del asesor (ej: 'En llamada', 'Llamada en espera', 'Pausa', 'Disponible')
   * @param minutes Minutos transcurridos en ese estado
   */
  getColorByStatus(status: string, minutes: number): string {
    if (!status || isNaN(minutes)) return 'bg-gray-400';

    switch (status.toLowerCase()) {
      // 🟩 En llamada
      case 'en llamada':
        if (minutes < 5) return 'bg-green-400';
        if (minutes >= 5 && minutes < 10) return 'bg-green-600';
        return 'bg-red-500';

      // 🟨 Llamada en espera
      case 'llamada en espera':
        if (minutes < 3) return 'bg-yellow-300';
        return 'bg-yellow-500';

      // 🟧 Pausa
      case 'pausa':
        if (minutes < 5) return 'bg-orange-300';
        if (minutes >= 5 && minutes < 10) return 'bg-orange-500';
        return 'bg-orange-800';

      // 🟦 Disponible
      case 'disponible':
        if (minutes < 3) return 'bg-blue-300';
        return 'bg-blue-600';

      // Por defecto
      default:
        return 'bg-gray-400';
    }
  }

  /**
   * Devuelve un texto de tooltip según el estado y el tiempo.
   */
  getTooltipByStatus(status: string, minutes: number): string {
    if (!status || isNaN(minutes)) return 'Sin información de estado';

    switch (status.toLowerCase()) {
      case 'en llamada':
        if (minutes < 5) return 'Llamada menor a 5 minutos';
        if (minutes >= 5 && minutes < 10) return 'Llamada entre 5 y 10 minutos';
        return 'Llamada mayor a 10 minutos';

      case 'llamada en espera':
        if (minutes < 3) return 'En espera menor a 3 minutos';
        return 'En espera mayor a 3 minutos';

      case 'pausa':
        if (minutes < 5) return 'Pausa menor a 5 minutos';
        if (minutes >= 5 && minutes < 10) return 'Pausa entre 5 y 10 minutos';
        return 'Pausa mayor a 10 minutos';

      case 'disponible':
        if (minutes < 3) return 'Disponible menos de 3 minutos';
        return 'Disponible más de 3 minutos';

      default:
        return 'Estado desconocido';
    }
  }

  logoutUser(item: User) {
    this.msg.confirm(
      `<div class='px-4 py-2'>
          <p class='text-center'> ¿Está seguro de cerrar la sesión de <span class='uppercase font-bold'>${item.name}</span>? </p>
          <p class='text-center'> Esta acción no se puede deshacer. </p>
        </div>`,
      () => {
        this.aloSatService.agentLogoutByUserId(item.id).subscribe({
          next: (data) => {
            this.msg.success(`Se cerró la sesión de ${item.name}`);
          },
        });
      }
    );
  }
}
