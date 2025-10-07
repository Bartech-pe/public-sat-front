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

  private readonly MonitorService = inject(MonitorService);

  value: number = 0;
  tablaActiva: 'estado' | 'sesion' | 'ver' | null = null;
  popupAbierto: number | null = null;
  detalleAbierto = false;

  // === Contadores ===
  viciCount: VicidialCount | null = null;
  chatCount: ChannelCount | null = null;
  wspCount: ChannelCount | null = null;
  mailCount: MailCount | null = null;
  vicidialCount?: VicidialCount;
  // === Estados de carga === Contadores
  loadingVicidialDashboard = false;
  loadingChatCount = false;
  loadingWspCount = false;
  loadingMailCount = false;

  // === Tablas de Asesores ===
  mailAdvisors: MailAdvisor[] = [];
  chatAdvisors: ChatAdvisor[] = [];
  wspAdvisors: ChatWspAdvisor[] = [];

  // === Reporte Vicidial (Tabla) ===
  vicidialReport: VicidialReport[] = [];

  // === Propiedades ===
  attentionDetail?: AttentionDetail;
  loadingAttentionDetail = false;

  ngOnInit() {
    this.loadCounts();
  }

  loadCounts() {
    // === Contadores principales === 
    this.loadVicidialDashboard();
    this.loadChatCount();
    this.loadWspCount();
    this.loadMailCount();

    // llamada a los 7 contadores / ALÓ SAT data (Vicidial)
    this.MonitorService.getMonitorVicidialCount().subscribe({
      next: (res) => (this.vicidialCount = res),
      error: (err) =>
        console.error('Error al obtener conteo Vicidial:', err.message),
    });

    // === Tablas de asesores === Vicidial
    this.loadVicidialReport();
    this.loadMailAdvisors();
    this.loadChatAdvisors();
    this.loadWspAdvisors();
  }

  loadVicidialDashboard(): void {
    this.loadingVicidialDashboard = true;
    this.MonitorService.getMonitorVicidialCountDashBoard().subscribe({
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

  loadChatCount(): void {
    this.loadingChatCount = true;
    this.MonitorService.getCountChat().subscribe({
      next: (res) => {
        this.chatCount = res;
        this.loadingChatCount = false;
      },
      error: (err) => {
        console.error('Error al cargar conteo de chats:', err);
        this.loadingChatCount = false;
      },
    });
  }

  loadWspCount(): void {
    this.loadingWspCount = true;
    this.MonitorService.getCountWSP().subscribe({
      next: (res) => {
        this.wspCount = res;
        this.loadingWspCount = false;
      },
      error: (err) => {
        console.error('Error al cargar conteo de WhatsApp:', err);
        this.loadingWspCount = false;
      },
    });
  }

  loadMailCount(): void {
    this.loadingMailCount = true;
    this.MonitorService.getCountMail().subscribe({
      next: (res) => {
        this.mailCount = res;
        this.loadingMailCount = false;
      },
      error: (err) => {
        console.error('Error al cargar conteo de correos:', err);
        this.loadingMailCount = false;
      },
    });
  }


  /** Correos abiertos por asesor */
  loadMailAdvisors(): void {
    this.MonitorService.getMonitorAdvisorsMail().subscribe({
      next: (data) => (this.mailAdvisors = data),
      error: (err) => console.error('Error cargando asesores de correo', err),
    });
  }

  /** Chats abiertos por asesor */
  loadChatAdvisors(): void {
    this.MonitorService.getMonitorAdvisorsChat().subscribe({
      next: (data) => (this.chatAdvisors = data),
      error: (err) => console.error('Error cargando asesores de chat', err),
    });
  }

  /** Chats WSP abiertos por asesor */
  loadWspAdvisors(): void {
    this.MonitorService.getMonitorAdvisorsChatWsp().subscribe({
      next: (data) => (this.wspAdvisors = data),
      error: (err) => console.error('Error cargando asesores de WhatsApp', err),
    });
  }

  /** Reporte Vicidial (tabla de llamadas y estados) */
  loadVicidialReport(): void {
    this.MonitorService.getMonitorVicidialReport().subscribe({
      next: (data) => (this.vicidialReport = data),
      error: (err) => console.error('Error cargando reporte Vicidial', err),
    });
  }

  // === Estados por asesor ===
  stateDetails: StateDetailsByAdvisor | null = null;
  loadingStateDetails = false;

  loadStateDetails(agentId: number, start: string, finish: string): void {
    this.loadingStateDetails = true;

    this.MonitorService.getStateDetailsByAdvisor(agentId, start, finish).subscribe({
      next: (data) => {
        this.stateDetails = data[0]; // suponiendo que viene un array con un solo registro
        this.loadingStateDetails = false;
      },
      error: (err) => {
        console.error('Error al cargar detalles de estados', err);
        this.loadingStateDetails = false;
      },
    });
  }

  // === Cambiar tabla activa ===
  toggleTabla(tabla: 'estado' | 'sesion' | 'ver'): void {
    this.tablaActiva = this.tablaActiva === tabla ? null : tabla;

    if (this.tablaActiva === 'estado') {
      const agente = 1;
      const hoy = new Date().toISOString().split('T')[0];
      this.loadStateDetails(agente, hoy, hoy);
    }

    if (this.tablaActiva === 'ver') {
      const userId = 1; // 🔹 Puedes reemplazarlo por el ID real del usuario logueado
      this.loadAttentionDetail(userId);
    }
  }

  // === Método para cargar detalle de atención ===
  loadAttentionDetail(userId: number): void {
    this.loadingAttentionDetail = true;

    this.MonitorService.getAttentionDetail(userId).subscribe({
      next: (data) => {
        this.attentionDetail = data;
        this.loadingAttentionDetail = false;
      },
      error: (err) => {
        console.error('Error al obtener detalle de atención', err);
        this.loadingAttentionDetail = false;
      },
    });
  }

  toggleDetalle() {
    this.detalleAbierto = !this.detalleAbierto;
  }

  togglePopup(index: number) {
    this.popupAbierto = this.popupAbierto === index ? null : index;
  }

  cerrarPopup() {
    this.popupAbierto = null;
  }
}
