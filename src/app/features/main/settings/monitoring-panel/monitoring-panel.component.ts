import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AttentionDetail } from '@models/attention-detail.model';
import { ChannelCount } from '@models/channel-count.model';
import { ChatAdvisor } from '@models/chat-advisor.model';
import { ChatWspAdvisor } from '@models/chat-wsp-advisor.model';
import { MailCount } from '@models/count-mail';
import { MailAdvisor } from '@models/mail-advisor.model';
import { StateDetailsByAdvisor } from '@models/state-detail-by-advisor.model';
import { VicidialCount } from '@models/vicidial-count-box.model';
import { VicidialReport } from '@models/vicidial-report.model';
import { MonitorService } from '@services/monitor.service';
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


@Component({
  selector: 'app-monitoring-panel',
  imports: [
    TableModule,
    InputTextModule,
    ColorPickerModule,
    ButtonModule,
    FormsModule,
    BreadcrumbModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    TabsModule,
    TagModule,
    AccordionModule,
    CommonModule,
    AvatarModule,
    BadgeModule,
    DialogModule,
    TableModule,
  ],
  templateUrl: './monitoring-panel.component.html',
  styles: ``,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MonitoringPanelComponent {

  private readonly dialogService = inject(DialogService);

  private readonly monitorService = inject(MonitorService);

  value: number = 0;
  tablaActiva: 'estados' | 'atenciones' | null = null;
  popupAbierto: number | null = null;
  detalleAbierto = false;

  // Contadores 
  viciCount: VicidialCount | null = null;
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
  stateDetails: StateDetailsByAdvisor | null = null;
  loadingStateDetails = false;

  // Detalle de atención
  attentionDetail: AttentionDetail | null = null;
  loadingAttentionDetail = false;

  // Reporte Vicidial (Tabla) 
  vicidialReport: VicidialReport[] = [];

  ngOnInit() {
    this.loadCounts();
  }

  loadCounts() {
    this.loadVicidialDashboard();
    this.loadChatCount();
    this.loadWspCount();
    this.loadMailCount();
    this.loadVicidialReport();
    this.loadMailAdvisors();
    this.loadChatAdvisors();
    this.loadWspAdvisors();

    this.monitorService.getMonitorVicidialCount().subscribe({
      next: (res) => (this.vicidialCount = res),
      error: (err) => console.error('Error al obtener conteo Vicidial:', err.message),
    });
  }

  /** VICIDIAL DASHBOARD */
  loadVicidialDashboard(): void {
    this.loadingVicidialDashboard = true;
    this.monitorService.getMonitorVicidialCountDashBoard().subscribe({
      next: (res) => {
        this.viciCount = res;
        this.loadingVicidialDashboard = false;
      },
      error: (err) => {
        console.error('Error al cargar conteo Vicidial Dashboard:', err);
        this.loadingVicidialDashboard = false;
      },
    });
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

  loadMailCount(): void {
    this.loadingMailCount = true;
    this.monitorService.getCountMail().subscribe({
      next: (res) => (this.mailCount = res),
      error: (err) => console.error('Error al cargar conteo de correos:', err),
      complete: () => (this.loadingMailCount = false),
    });
  }

  /** TABLAS DE ASESORES */
  loadMailAdvisors(): void {
    this.monitorService.getMonitorAdvisorsMail().subscribe({
      next: (data) => (this.mailAdvisors = data),
      error: (err) => console.error('Error cargando asesores de correo', err),
    });
  }

  loadChatAdvisors(): void {
    this.monitorService.getMonitorAdvisorsChat().subscribe({
      next: (data) => (this.chatAdvisors = data),
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
  loadStateDetails(agentId: number, start: string, finish: string): void {
    this.loadingStateDetails = true;

    this.monitorService.getStateDetailsByAdvisor(agentId, start, finish).subscribe({
      next: (data) => {
        this.stateDetails = data[0];
        this.loadingStateDetails = false;
      },
      error: (err) => {
        console.error('Error al cargar detalles de estados', err);
        this.loadingStateDetails = false;
      },
    });
  }

  /**  DETALLE DE ATENCIÓN  */
  loadAttentionDetail(userId: number): void {
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

  /**  POPUP Y DETALLE */
  toggleDetalle(): void {
    this.detalleAbierto = !this.detalleAbierto;
  }

  // Controla qué popup está abierto por fila e identifica tipo ('atenciones' o 'estados')
  popupActivo: { index: number; tipo: 'atenciones' | 'estados' } | null = null;

  /** Alterna el popup (abre/cierra según el índice y tipo) */
  togglePopup(index: number, tipo: 'atenciones' | 'estados', userId: number) {
    // Si el mismo popup ya está abierto, se cierra
    if (this.popupActivo && this.popupActivo.index === index && this.popupActivo.tipo === tipo) {
      this.popupActivo = null;
      return;
    }

    // Abre el popup correspondiente
    this.popupActivo = { index, tipo };

    // Usa tus métodos originales para cargar los datos
    if (tipo === 'atenciones') {
      this.verAtenciones(userId);
    } else {
      this.verDetalleEstados(userId);
    }
  }

  /** Cierra el popup activo */
  cerrarPopup() {
    this.popupActivo = null;
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

  /** Abrir tabla de Detalle de Estados */
  verDetalleEstados(userId: number): void {
    this.tablaActiva = 'estados';
    this.stateDetails = null;
    this.loadingStateDetails = true;

    const hoy = new Date().toISOString().split('T')[0];

    this.monitorService.getStateDetailsByAdvisor(userId, hoy, hoy).subscribe({
      next: (data) => {
        this.stateDetails = data[0];
        this.loadingStateDetails = false;
      },
      error: (err) => {
        console.error('Error al obtener detalle de estados', err);
        this.loadingStateDetails = false;
      },
    });
  }

  /** Cerrar modal */
  cerrarModal(): void {
    this.tablaActiva = null;
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


}
