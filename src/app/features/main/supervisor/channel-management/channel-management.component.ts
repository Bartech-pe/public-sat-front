import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { AccordionModule } from 'primeng/accordion';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { DialogModule } from 'primeng/dialog';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { TableModule } from 'primeng/table';
import { GlobalService } from '@services/global-app.service';
import { DialogService } from 'primeng/dynamicdialog';
import { AssignSupervisorComponent } from './assign-supervisor/assign-supervisor.component';
import { UserStore } from '@stores/user.store';
import { User } from '@models/user.model';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { ChannelStateStore } from '@stores/channel-state.store';
import { ChannelState } from '@models/channel-state.model';

@Component({
  selector: 'app-channel-management',
  imports: [
    CardModule,
    InputTextModule,
    Select,
    ButtonModule,
    TabsModule,
    TagModule,
    AccordionModule,
    CommonModule,
    AvatarModule,
    BadgeModule,
    DialogModule,
    ToggleSwitch,
    TableModule,
  ],
  templateUrl: './channel-management.component.html',
  styles: ``,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ChannelManagementComponent implements OnInit {
  private readonly dialogService = inject(DialogService);

  private readonly msg = inject(MessageGlobalService);

  private readonly userStore = inject(UserStore);

  get listaAsesores(): User[] {
    return this.userStore.items();
  }

  listadoInteracciones = [
    {
      id: '106',
      tipo: 'chat',
      contribuyente: 'Contribuyente F',
      estado: true,
      fecha: '17/05/2025',
    },
    {
      id: '109',
      tipo: 'telefónico',
      contribuyente: 'Contribuyente F',
      estado: false,
      fecha: '15/04/2025',
    },
  ];

  listaEstados = [
    { id: 1, name: 'En Llamada' },
    { id: 2, name: 'Fuera de Línea' },
    { id: 3, name: 'Disponible' },
    { id: 4, name: 'Pausa' },
  ];

  listadoLlamadasEspera = [
    {
      id: '106',
      contribuyente: 'Contribuyente F',
      category: 'Tributario',
      tiempoCola: '2 minutos',
    },
    {
      id: '109',
      contribuyente: 'No Tributario',
      category: 'Contribuyente A',
      tiempoCola: '3 minutos',
    },
  ];

  value: number = 0;
  asesorSeleccionado: string = '';
  estadoAsesor: string = '';
  checked: boolean = false;
  displayAsignarCanal: boolean = false;
  displayVerHistorial: boolean = false;
  displayCambiarEstado: boolean = false;

  readonly storeCanal = inject(ChannelStateStore);

  get totalItemsCanal(): number {
    return this.storeCanal.totalItems();
  }

  get listadoEstadosCanal(): ChannelState[] {
    return this.storeCanal.items();
  }

  get estadosTelefonico(): ChannelState[] {
    return this.listadoEstadosCanal.filter((m) => m.categoryId === 1);
  }

  get estadosEmail(): ChannelState[] {
    return this.listadoEstadosCanal.filter((m) => m.categoryId === 2);
  }

  get estadosChat(): ChannelState[] {
    return this.listadoEstadosCanal.filter((m) => m.categoryId === 3);
  }

  get estadosWhatsApp(): ChannelState[] {
    return this.listadoEstadosCanal.filter((m) => m.categoryId === 4);
  }

  loading = false;
  ngOnInit(): void {
    this.cargarAsesores();
    // medio segundo
    this.loadData();
  }

  getInitial(user: User) {
    const words = user.displayName.split(' ');
    return words[0][0] + (words[1] ? words[1][0] : '');
  }

  cargarAsesores() {
    const query = { officeId: 1 };
    this.userStore.loadAll(undefined, undefined, query);
    console.log('entroe');
  }

  loadData() {
    this.storeCanal.loadAll();
  }

  panelAbierto(event: any) {
    console.log('Panel abierto:', event);
  }

  panelCerrado(event: any) {
    console.log('Panel cerrado:', event);
  }

  modalAsignarCanal(asesor: any) {
    const ref = this.dialogService.open(AssignSupervisorComponent, {
      data: asesor,
      header: 'Asignar Canal - ' + asesor.name,
      styleClass: 'modal-lg',
      modal: true,
      dismissableMask: false,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      if (res) {
        this.cargarAsesores();
        this.msg.success(
          'Canal asignado exitosamente al asesor ' + asesor.name
        );
      }
    });
  }

  modalVerHistorial(asesor: string) {
    this.displayVerHistorial = true;
    this.asesorSeleccionado = asesor;
  }

  modalCambiarEstado(item: any) {
    console.log('ITEM', item);
    console.log('ITEM tab', this.value);
    this.displayCambiarEstado = true;
    this.asesorSeleccionado = item.name;
    this.estadoAsesor = item.status;
  }

  edit(item: any) {}

  remove(item: any) {}
}
