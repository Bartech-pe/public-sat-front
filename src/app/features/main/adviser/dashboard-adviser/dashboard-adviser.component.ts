import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { AtencionDetalleComponent } from './atencion-detalle/atencion-detalle.component';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { Router, RouterModule } from '@angular/router';
import { CitizenAssistance } from '@models/citizen-assistance.model';
import { CitizenAssistanceService } from '@services/citizen-assistance.service';
import { map } from 'rxjs';

interface Atenciones {
  id?: string;
  nombre: string;
  pipeline: string;
  estado: string;
  fecha: string;
  prioridad: 'Alta' | 'Media' | 'Baja';
  propietario: string;
  fuente: string;
  abierto: boolean;
  resultado: string;
}

@Component({
  selector: 'app-dashboard-adviser',
  imports: [
    ToggleSwitchModule,
    ButtonModule,
    SelectModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    TagModule,
    TextareaModule,
    TableModule,
    SelectModule,
    BreadcrumbModule,
    TabsModule,
    InputIconModule,
    IconFieldModule,
    RouterModule,
  ],
  templateUrl: './dashboard-adviser.component.html',
  styles: ``,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DashboardAdviserComponent implements OnInit {
  title: string = 'Atención al ciudadano';

  descripcion: string = 'Lista de atenciones realizadas.';

  createButtonLabel: string = 'Nuevo usuario';
  private readonly msg = inject(MessageGlobalService);

  private readonly dialogService = inject(DialogService);

  private readonly citizenAssistanceService = inject(CitizenAssistanceService);

  formData = new FormGroup({
    idtipoConsulta: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    resultado: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  openModal: boolean = false;

  breadcrumbItems = [
    { label: 'Inicio' },
    { label: 'Gestión de Atención de Asesor' },
    { label: 'Dashboard' },
  ];

  home = { icon: 'pi pi-home', routerLink: '/' };

  listaTipoConsulta = [
    { id: 1, name: 'Papeletas' },
    { id: 2, name: 'Multas' },
    { id: 3, name: 'Tramites' },
    { id: 4, name: 'Otro' },
  ];

  activeTab: string = '0';

  tableAssistances: CitizenAssistance[] = [];

  tickets: Atenciones[] = [
    {
      id: 'dmfk32mkdm',
      nombre: 'Ticket de prueba',
      pipeline: 'Pipeline de asistencia',
      estado: 'Nuevo',
      fecha: '15 de ene. de 2025',
      prioridad: 'Alta',
      propietario: 'Carlos Ventura Bueno',
      fuente: 'Correo',
      abierto: false,
      resultado: 'Resuelto',
    },
    {
      id: 'dmf12fmkdm',
      nombre: 'Ticket abierto',
      pipeline: 'Soporte técnico',
      estado: 'En progreso',
      fecha: '12 de ene. de 2025',
      prioridad: 'Media',
      propietario: 'Carlos Ventura Bueno',
      fuente: 'Llamada',
      abierto: true,
      resultado: 'Sin Resolver',
    },
    {
      id: 'dmfkdf43dm',
      nombre: 'Ticket sin asignar',
      pipeline: 'Consultas',
      estado: 'Nuevo',
      fecha: '10 de ene. de 2025',
      prioridad: 'Baja',
      propietario: 'Carlos Ventura Bueno',
      fuente: 'ChatSAT',
      abierto: false,
      resultado: 'Resuelto',
    },
  ];

  atenciones = [
    {
      fecha: '15/12/24',
      canal: 'Tel',
      tipo: 'Papeleta',
      estado: true,
    },
    {
      fecha: '10/12/24',
      canal: 'Chat',
      tipo: 'Multa',
      estado: true,
    },
    {
      fecha: '05/12/24',
      canal: 'Email',
      tipo: 'Trámite',
      estado: false,
    },
    {
      fecha: '02/12/24',
      canal: 'Tel',
      tipo: 'Reclamo',
      estado: true,
    },
    {
      fecha: '28/11/24',
      canal: 'Chat',
      tipo: 'Multa',
      estado: false,
    },
  ];

  selectedAtencion!: Atenciones;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.getAtenciones();
  }

  fuction() {}

  verInfoDetalle() {}

  verHistorialCompleto() {}

  onSubmit() {
    if (this.formData.valid) {
      console.log(this.formData.value);
    } else {
      this.formData.markAllAsTouched();
    }
  }

  getAtenciones() {
    this.citizenAssistanceService
      .getAll()
      .pipe(map((res) => res.data))
      .subscribe({
        next: (data) => {
          this.tableAssistances = data;
        },
      });
  }

  nuevaAtencion() {}

  get filteredTickets() {
    if (this.activeTab === '1') {
      return this.tableAssistances.filter((item) => item.verifyPayment);
    }
    if (this.activeTab === '2') {
      return this.tableAssistances;
    }
    return this.tableAssistances.filter((item) => !item.verifyPayment);
  }

  onTabChange(event: string) {
    this.activeTab = event;
  }
}
