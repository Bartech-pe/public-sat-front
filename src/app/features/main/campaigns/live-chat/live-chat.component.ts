import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { StatusStore } from '@stores/status.store';
import { Status } from '@models/estados.model';
import { MessageGlobalService } from '@services/message-global.service';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { FormLiveComponent } from './form-live/form-live.component';
import { TagModule } from 'primeng/tag';
import { ButtonEditComponent } from '@shared/buttons/button-edit/button-edit.component';
import { ButtonDeleteComponent } from '@shared/buttons/button-delete/button-delete.component';

interface Registro {
  id: number;
  nombre: string;
  plantilla: string;
  base1: string;
  arte2?: string;
  formato3: string;
  opcional4: string;
  registros: string;
  cargada: string;
  estado: string;
}

@Component({
  selector: 'app-live-chat',
  imports: [
    TableModule,
    InputTextModule,
    ButtonModule,
    FormsModule,
    BreadcrumbModule,
    TagModule,
    ButtonEditComponent,
    ButtonDeleteComponent
  ],
  templateUrl: './live-chat.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LiveChatComponent {
  breadcrumbItems = [
    { label: 'Inicio' },
    { label: 'Campaña' },
    { label: 'Live Chat' },
  ];

  registros: Registro[] = [
    {
      id: 5210,
      nombre: 'PREDAVENCIDO240625',
      plantilla: 'HTML',
      base1: 'Depurado',
      formato3: 'Descargar',
      opcional4: 'Descargar',
      registros: '(6562)',
      cargada: '25/06/2025 10:37 AM',
      estado: 'Aprobado',
    },
    {
      id: 5126,
      nombre: 'OTDEUDAS220824',
      plantilla: 'HTML',
      base1: '',
      formato3: '',
      opcional4: '',
      registros: '(0)',
      cargada: '20/06/2025 12:30 PM',
      estado: 'Pendiente',
    },
    {
      id: 5112,
      nombre: 'FRACTCRIB190625',
      plantilla: 'HTML',
      base1: 'Depurado',
      formato3: 'Descargar',
      opcional4: 'Descargar',
      registros: '(307/308)',
      cargada: '19/06/2025 03:48 PM',
      estado: 'Finalizado',
    },
    {
      id: 5110,
      nombre: 'MULTATRIB190625',
      plantilla: 'HTML',
      base1: 'Depurado',
      formato3: 'Descargar',
      opcional4: 'Descargar',
      registros: '(288/292)',
      cargada: '19/06/2025 03:42 PM',
      estado: 'Finalizado',
    },
    {
      id: 5109,
      nombre: 'PACAIDOS190625',
      plantilla: 'HTML',
      base1: 'Depurado',
      formato3: 'Descargar',
      opcional4: 'Descargar',
      registros: '(7037/7091)',
      cargada: '19/06/2025 03:35 PM',
      estado: 'Finalizado',
    },
    {
      id: 5108,
      nombre: 'VEHCAIDO190625',
      plantilla: 'HTML',
      base1: 'Depurado',
      formato3: 'Descargar',
      opcional4: 'Descargar',
      registros: '(17415/17581)',
      cargada: '19/06/2025 03:24 PM',
      estado: 'Finalizado',
    },
    {
      id: 5080,
      nombre: 'FRACTCRIB170625',
      plantilla: 'HTML',
      base1: 'Depurado',
      formato3: 'Descargar',
      opcional4: 'Descargar',
      registros: '(315/315)',
      cargada: '17/06/2025 12:00 PM',
      estado: 'Finalizado',
    },

    // Datos agregados ficticios
    {
      id: 5075,
      nombre: 'INACTIVOS150625',
      plantilla: 'HTML',
      base1: 'Depurado',
      formato3: 'Descargar',
      opcional4: 'Descargar',
      registros: '(458/500)',
      cargada: '15/06/2025 10:10 AM',
      estado: 'Finalizado',
    },
    {
      id: 5074,
      nombre: 'PENDIENTES140625',
      plantilla: 'HTML',
      base1: '',
      formato3: '',
      opcional4: '',
      registros: '(0)',
      cargada: '14/06/2025 03:15 PM',
      estado: 'Pendiente',
    },
    {
      id: 5073,
      nombre: 'MOROSOS130625',
      plantilla: 'HTML',
      base1: 'Depurado',
      formato3: 'Descargar',
      opcional4: 'Descargar',
      registros: '(980/1000)',
      cargada: '13/06/2025 09:45 AM',
      estado: 'Finalizado',
    },
  ];

  home = { icon: 'pi pi-home', routerLink: '/' };
  openModal: boolean = false;

  private readonly msg = inject(MessageGlobalService);
  private readonly dialogService = inject(DialogService);
  openNew() {
    this.openModal = true;
    const ref = this.dialogService.open(FormLiveComponent, {
      header: 'Crear una campaña de Live Chat',
      styleClass: 'modal-lg',
      modal: true,
      dismissableMask: false,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      this.openModal = false;
    });
  }
}
