import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  CitizenInfo,
  ExternalCitizenService,
} from '@services/externalCitizen.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-new-call',
  imports: [FormsModule, ButtonModule, CommonModule],
  templateUrl: './new-call.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class NewCallComponent implements OnInit {
  busqueda: string = '';

  vistaSeleccionada: string = 'Comunicaciones';

  botonSeleccionado = false;

  pausaActiva = false;

  filaExpandidaIndex: number | null = null;
  citizen: CitizenInfo | null = null;

  datosPorVista: { [key: string]: any[] } = {
    Deudas: [],
    Trámites: [],
    Medidas: [],
    Declaraciones: [],
    Notificaciones: [],
    Comunicaciones: [
      {
        fecha: '02/01/2025',
        tipo: 'Trámite',
        canal: 'Email',
        metodo: 'Correo',
        contacto: 'juan@mail.com',
        resultado: 'Pendiente',
        usuario: 'Ana',
        acciones: '',
      },
      {
        fecha: '02/01/2025',
        tipo: 'Trámite',
        canal: 'Email',
        metodo: 'Correo',
        contacto: 'juan@mail.com',
        resultado: 'Pendiente',
        usuario: 'Ana',
        acciones: '',
      },
      {
        fecha: '02/01/2025',
        tipo: 'Trámite',
        canal: 'Email',
        metodo: 'Correo',
        contacto: 'juan@mail.com',
        resultado: 'Pendiente',
        usuario: 'Ana',
        acciones: '',
      },
      {
        fecha: '02/01/2025',
        tipo: 'Trámite',
        canal: 'Email',
        metodo: 'Correo',
        contacto: 'juan@mail.com',
        resultado: 'Pendiente',
        usuario: 'Ana',
        acciones: '',
      },
      {
        fecha: '02/01/2025',
        tipo: 'Trámite',
        canal: 'Email',
        metodo: 'Correo',
        contacto: 'juan@mail.com',
        resultado: 'Pendiente',
        usuario: 'Ana',
        acciones: '',
      },
    ],
  };

  items = [
    {
      nombre: 'Juan Pérez',
      estado: 'Activo',
      detalles:
        'Llamado el 5 de agosto. Comentó que está satisfecho con el servicio.',
    },
    {
      nombre: 'Ana López',
      estado: 'Pendiente',
      detalles: 'Se dejó mensaje de voz. Seguir intentando el contacto.',
    },
  ];

  constructor(private externalCitizenService: ExternalCitizenService) {}

  ngOnInit(): void {}

  expandirFila(index: number) {
    this.filaExpandidaIndex = this.filaExpandidaIndex === index ? null : index;
  }

  buscarContribuyente() {
    if (!this.busqueda.trim()) {
      console.warn('Búsqueda vacía');
      return;
    }

    this.externalCitizenService
      .getCitizenInformation({
        psiTipConsulta: 2,
        piValPar1: 2,
        pvValPar2: this.busqueda,
      })
      .subscribe((response) => {
        console.log(response);
        let reponseHardCoded = [
          {
            vcontacto: 'A. CRISANTO Z. S.A.C. CONTRATISTAS GENERALES',
            vnumTel: '999935494',
            vtipDoc: 'RUC',
            vdocIde: '20101279554 ',
          },
        ];
        this.citizen = reponseHardCoded[0];
      });

    // Aquí podrías invocar un servicio real para la búsqueda
  }
}
