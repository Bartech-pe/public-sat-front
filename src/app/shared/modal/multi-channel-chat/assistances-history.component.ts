import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ViewChild, ElementRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { BadgeModule } from 'primeng/badge';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { ChannelAttentionService } from '@services/channel-attention.service';
import { ChannelAttentionStatus, ChannelAttentionStatusTag, ChannelAttentionStatusTagType, ChannelLogo, ChannelMessage, ChannelStatusTag, ChatDetail } from '@interfaces/features/main/omnichannel-inbox/omnichannel-inbox.interface';

export interface MessagesResponseDto {
  channelRoomId: number;
  assistanceId: number;
  messages: ChannelMessage[];
}

export interface ChannelAssistanceDto {
  assistanceId: number;
  channelRoomId: number;
  lastMessage: ChannelMessage;
  channel?: string;
  startDate?: string;
  endDate?: string;
  status?: ChannelAttentionStatus;
  user?: string;
  citizen?: string;
  messages?: ChannelMessage[];
  hasMore?: boolean;
}

@Component({
  selector: 'app-assistances-history-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    BadgeModule,
    ScrollPanelModule,
    DividerModule,
    TooltipModule,
    SkeletonModule,
    TagModule
  ],
  templateUrl: './assistances-history.component.html',
  styleUrls: ['./assistances-history.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

})
export class AssistancesHistoryModalComponent implements OnInit, OnChanges {
  @Input() visible: boolean = false;
  @Input() channelRoomId: number | null = null;
  @Input() loading: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  // Estado interno
  searchTerm: string = '';
  asistenciaSeleccionada: ChannelAssistanceDto | null = null;
  asistencias: ChannelAssistanceDto[] = [];
  asistenciasFiltradas: ChannelAssistanceDto[] = [];
  isSearching: boolean = false;
  isLoadingOlderMessages: boolean = false;
  scrollLocked: boolean = false;
  lastScrollTop: number = 0;
  scrollDirection: 'up' | 'down' = 'down';
  scrollThreshold: number = 100;
  bottomThreshold: number = 200;
  isNearBottom: boolean = true;
  showScrollButton: boolean = false;
  unreadMessagesCount: number = 0;

  constructor(private ChannelAttentionService: ChannelAttentionService) {}

  ngOnInit(): void {
    this.inicializarDatos();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && !this.visible) {
      this.limpiarEstado();
    }
  }

  // Getters para templates
  get tituloModal(): string {
    return `Historial de asistencias`;
  }

  get totalAsistencias(): number {
    return this.asistencias?.length || 0;
  }

  get totalFiltradas(): number {
    return this.asistenciasFiltradas?.length || 0;
  }

  get hayAsistencias(): boolean {
    return this.totalAsistencias > 0;
  }

  get hayResultadosFiltro(): boolean {
    return this.totalFiltradas > 0;
  }

  get mostrarSinResultados(): boolean {
    return !this.loading && !this.hayResultadosFiltro && !!this.searchTerm.trim();
  }

  get mostrarSinAsistencias(): boolean {
    return !this.loading && !this.hayAsistencias && !this.searchTerm.trim();
  }

  inicializarDatos() {
    if (this.channelRoomId) {
      this.loading = true;
      this.ChannelAttentionService.getAssistances(this.channelRoomId).subscribe({
        next: (response: { success: boolean; data: ChannelAssistanceDto[]; message: string }) => {
          if (response.success) {
            this.asistencias = response.data.map(assistance => ({
              ...assistance,
              hasMore: true // Asumimos que hay más mensajes inicialmente
            }));
            this.aplicarFiltros();
          }
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
    }
  }

  private limpiarEstado(): void {
    this.asistenciaSeleccionada = null;
    this.searchTerm = '';
    this.isSearching = false;
    this.isLoadingOlderMessages = false;
    this.showScrollButton = false;
    this.unreadMessagesCount = 0;
  }

  onHide(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.limpiarEstado();
  }

  onShow(): void {
    this.inicializarDatos();
  }

  onSearchChange(): void {
    this.isSearching = true;
    setTimeout(() => {
      this.aplicarFiltros();
      this.isSearching = false;
    }, 300);
  }

  limpiarBusqueda(): void {
    this.searchTerm = '';
    this.aplicarFiltros();
  }

  private aplicarFiltros(): void {
    const termino = this.searchTerm.toLowerCase().trim();
    if (!termino) {
      this.asistenciasFiltradas = [...this.asistencias];
      return;
    }

    this.asistenciasFiltradas = this.asistencias.filter(asistencia => {
      return (
        asistencia.assistanceId.toString().includes(termino) ||
        asistencia.user?.toLowerCase().includes(termino) ||
        asistencia.channel?.toLowerCase().includes(termino) ||
        asistencia.lastMessage?.content?.toLowerCase().includes(termino)
      );
    });
  }

  seleccionarAsistencia(asistencia: ChannelAssistanceDto): void {
    this.asistenciaSeleccionada = asistencia;
    this.loading = true;
    this.ChannelAttentionService.getMessagesFromAssistance(asistencia.assistanceId).subscribe({
      next: (response: { success: boolean; data: MessagesResponseDto; message: string }) => {
        if (response.success) {
          this.asistenciaSeleccionada!.messages = response.data.messages;
          this.scrollToBottomInstant();
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  esAsistenciaSeleccionada(asistencia: ChannelAssistanceDto): boolean {
    return this.asistenciaSeleccionada?.assistanceId === asistencia.assistanceId;
  }

  obtenerUltimoMensaje(asistencia: ChannelAssistanceDto): ChannelMessage | null {
    return asistencia.lastMessage || null;
  }

  obtenerPreviewMensaje(mensaje: ChannelMessage): string {
    const maxLength = 60;
    if (mensaje.content?.trim()) {
      const contenido = mensaje.content.replace(/\n/g, ' ').trim();
      return contenido.length > maxLength
        ? contenido.substring(0, maxLength) + '...'
        : contenido;
    }
    if (mensaje.attachments?.length) {
      const archivos = mensaje.attachments.length;
      return `${archivos} archivo${archivos > 1 ? 's' : ''} adjunto${archivos > 1 ? 's' : ''}`;
    }
    return 'Sin contenido';
  }

  obtenerTipoMensajeSender(mensaje: ChannelMessage): string {
    if (mensaje.sender.fromCitizen) return 'Ciudadano';
    return mensaje.sender.isAgent ? 'Agente' : 'Bot';
  }

  obtenerIconoArchivo(extension: string): string {
    const iconMap: { [key: string]: string } = {
      'pdf': 'mdi:file-pdf-box',
      'doc': 'mdi:file-word',
      'docx': 'mdi:file-word',
      'xls': 'mdi:file-excel',
      'xlsx': 'mdi:file-excel',
      'txt': 'mdi:file-document',
      'zip': 'mdi:folder-zip',
      'rar': 'mdi:folder-zip',
      'jpg': 'mdi:image',
      'jpeg': 'mdi:image',
      'png': 'mdi:image',
      'gif': 'mdi:image'
    };
    return iconMap[extension?.toLowerCase()] || 'mdi:file';
  }

  formatearTamanoArchivo(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  formatearFechaCompleta(fecha: string): string {
    try {
      return new Date(fecha).toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return fecha;
    }
  }

  getChannelStatusTagSeverity(status?: ChannelAssistanceDto['status']): string {
    if (!status) return 'secondary';
    return ChannelAttentionStatusTagType[status];
  }

  getChannelStatusTag(status?: ChannelAssistanceDto['status']): string {
    if (!status) return 'En proceso';
    return ChannelAttentionStatusTag[status];
  }

  getChannelIcon(channel?: ChatDetail['channel']): string {
    if (!channel) return 'fxemoji:question';
    return ChannelLogo[channel];
  }

  onScroll(event: Event): void {
    const element = event.target as HTMLElement;
    if (!element) return;

    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;

    this.scrollDirection = scrollTop > this.lastScrollTop ? 'down' : 'up';
    this.lastScrollTop = scrollTop;

    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
    this.isNearBottom = distanceFromBottom <= this.bottomThreshold;

    if (this.isNearBottom) {
      this.showScrollButton = false;
      this.unreadMessagesCount = 0;
    } else {
      this.showScrollButton = true;
    }

    if (this.scrollLocked || !this.asistenciaSeleccionada?.hasMore || this.isLoadingOlderMessages) {
      return;
    }

    const isNearTop = scrollTop <= this.scrollThreshold;
    const isScrollingUp = this.scrollDirection === 'up';

    if (isNearTop && isScrollingUp && this.asistenciaSeleccionada?.messages?.length) {
      this.loadOlderMessages();
    }
  }

  private loadOlderMessages(): void {
    if (!this.asistenciaSeleccionada || !this.asistenciaSeleccionada.hasMore || this.isLoadingOlderMessages) {
      return;
    }

    const oldestMessage = this.asistenciaSeleccionada.messages![0];
    if (!oldestMessage) return;

    this.isLoadingOlderMessages = true;
    this.scrollLocked = true;

    const messagesContainer = this.messagesContainer.nativeElement;
    const oldScrollHeight = messagesContainer.scrollHeight;
    const oldScrollTop = messagesContainer.scrollTop;

    this.ChannelAttentionService.getMessagesFromAssistance(
      this.asistenciaSeleccionada.assistanceId
    ).subscribe({
      next: (response: { success: boolean; data: MessagesResponseDto; message: string }) => {
        if (response.success && response.data.messages.length > 0) {
          this.asistenciaSeleccionada!.messages = [...response.data.messages, ...this.asistenciaSeleccionada!.messages!];
          this.asistenciaSeleccionada!.hasMore = response.data.messages.length === 15; // Suponemos 15 como límite por página

          requestAnimationFrame(() => {
            const newScrollHeight = messagesContainer.scrollHeight;
            const heightDifference = newScrollHeight - oldScrollHeight;
            messagesContainer.scrollTop = oldScrollTop + heightDifference;

            setTimeout(() => {
              this.scrollLocked = false;
            }, 100);
          });
        } else {
          this.asistenciaSeleccionada!.hasMore = false;
          this.scrollLocked = false;
        }
        this.isLoadingOlderMessages = false;
      },
      error: () => {
        this.isLoadingOlderMessages = false;
        this.scrollLocked = false;
      }
    });
  }

  handleScrollDown(): void {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.style.scrollBehavior = 'smooth';
      element.scrollTop = element.scrollHeight;
      this.showScrollButton = false;
      this.unreadMessagesCount = 0;
      this.isNearBottom = true;

      setTimeout(() => {
        element.style.scrollBehavior = 'auto';
      }, 500);
    }
  }

  private scrollToBottomInstant(): void {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.style.scrollBehavior = 'auto';
      element.scrollTop = element.scrollHeight;
      this.isNearBottom = true;
    }
  }
}
