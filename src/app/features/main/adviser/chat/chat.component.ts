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
import { MessageGlobalService } from '@services/generic/message-global.service';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'app-chat',
  imports: [
    ToggleSwitchModule,
    ButtonModule,
    SelectModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    TagModule,
    DatePickerModule,
    TextareaModule,
    TableModule,
    BreadcrumbModule
  ],
  templateUrl: './chat.component.html',
  styles: ``,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ChatComponent implements OnInit {
  formData = new FormGroup({
    idAtencion: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    fechaHora: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    numeroOrigen: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    duración: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    asesor: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    idtipoConsulta: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    descriptionConsulta: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    resultado: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    codigoResultado: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  breadcrumbItems = [
    { label: 'Inicio' },
    { label: 'Asesor Telefónico' },
    { label: 'Chat' },
  ];

  home = { icon: 'pi pi-home', routerLink: '/' };

  fecha: Date = new Date();
  estado: string = 'Disponible';

  private readonly msg = inject(MessageGlobalService);

  listaTipoConsulta = [
    { id: 1, name: 'Papeletas' },
    { id: 2, name: 'Multas' },
    { id: 3, name: 'Tramites' },
    { id: 4, name: 'Otro' },
  ];

  listaCodigoResultado = [
    { id: 1, name: 'Resuelto' },
    { id: 2, name: 'Pendiente' },
  ];

  constructor() {}

  ngOnInit(): void {
    // Aquí puedes inicializar cualquier lógica necesaria al cargar el componente
  }

  addNew() {}

  fueraLinea() {
    this.estado = 'Fuera de Línea';
    this.msg.success('¡Estado fuera de línea activado!');
  }

  finalizarPausa() {
    this.estado = 'Disponible';
    this.msg.success('¡Estado disponible activado!');
  }

  onSubmit() {}
}
