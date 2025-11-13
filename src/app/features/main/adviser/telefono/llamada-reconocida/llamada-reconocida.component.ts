import { CommonModule, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-llamada-reconocida',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
  ],
  templateUrl: './llamada-reconocida.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LlamadaReconocidaComponent implements OnInit {

  mostrarTodoHistorial = false;

  pausaActiva: boolean = false;

  vistaSeleccionada: string = 'Comunicaciones';

  botonSeleccionado = false;

  ngOnInit(): void { }

  addNew() {}

  datosPorVista: { [key: string]: any[] } = {
    Deudas: [],
    Trámites: [],
    Medidas: [],
    Declaraciones: [],
    Notificaciones: [],
    Comunicaciones: [
      { fecha: '06/08/2025 14:30', tipo: 'consulta', canal: 'Teléfono', metodo: 'Tel1', contacto: 'juan@mail.com', resultado: 'compromiso de pago', usuario: 'Ana', acciones: '' },
      { fecha: '15/07/2025 17:46', tipo: 'cobranza', canal: 'Teléfono', metodo: 'Tel2', contacto: 'juan@mail.com', resultado: 'no contesta', usuario: 'Pedro', acciones: '' },
      { fecha: '11/05/2025 11:08', tipo: 'consulta', canal: 'Teléfono', metodo: 'Tel1', contacto: 'juan@mail.com', resultado: 'contacto exitoso', usuario: 'Miguel', acciones: '' },
      { fecha: '11/05/2025 16:20', tipo: 'consulta', canal: 'Teléfono', metodo: 'Tel2', contacto: 'juan@mail.com', resultado: 'Pendiente', usuario: 'Martín', acciones: '' },
      { fecha: '20/04/2025 09:17', tipo: 'cobranza', canal: 'Teléfono', metodo: 'Tel2', contacto: 'juan@mail.com', resultado: 'en proceso', usuario: 'Alva', acciones: '' },
    ],
  };

  selectedItem: any = null;
  mostrarModal: boolean = false;
  enPausa: boolean = false;

  abrirModal(item: any) {
    this.selectedItem = item;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  solicitarPausa() {
    this.enPausa = true;
  }


}
