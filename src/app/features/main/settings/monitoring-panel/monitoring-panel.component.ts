import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BtnDeleteSquareComponent } from '@shared/buttons/btn-delete-square/btn-delete-square.component';
import { BtnEditSquareComponent } from '@shared/buttons/btn-edit-square/btn-edit-square.component';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { AccordionModule } from 'primeng/accordion';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ColorPickerModule } from 'primeng/colorpicker';
import { DialogModule } from 'primeng/dialog';
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
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MonitoringPanelComponent {

  value: number = 0;
  tablaActiva: 'estado' | 'sesion' | null = null;
  detalleAbierto = false;

  toggleTabla(tabla: 'estado' | 'sesion') {
    this.tablaActiva = this.tablaActiva === tabla ? null : tabla;
  }

  toggleDetalle() {
  this.detalleAbierto = !this.detalleAbierto;
  }

  aloSatData = [
    { id: 1, asesor: 'Juan Pérez', duracion: '05:32', estado: 'Finalizado' },
    { id: 2, asesor: 'María López', duracion: '12:10', estado: 'En curso' },
  ];

  correoData = [
    { id: 1, remitente: 'cliente1@test.com', asunto: 'Consulta deuda', fecha: '2025-09-24' },
    { id: 2, remitente: 'cliente2@test.com', asunto: 'Reclamo servicio', fecha: '2025-09-23' },
  ];

  chatSatData = [
    { id: 1, usuario: 'Carlos Gómez', mensaje: '¿Cuál es mi deuda?', hora: '10:15' },
    { id: 2, usuario: 'Ana Torres', mensaje: 'Necesito ayuda con mi cuenta', hora: '11:05' },
  ];

  chatbotData = [
    { id: 1, bot: 'SATBot', respuesta: 'Su deuda es S/ 250', confianza: 98 },
    { id: 2, bot: 'SATBot', respuesta: 'Puede pagar en la web', confianza: 95 },
  ];

  // Guarda el popup abierto para una fila específica
  popupAbierto: number | null = null;

  togglePopup(index: number) {
    this.popupAbierto = this.popupAbierto === index ? null : index;
  }

  cerrarPopup() {
    this.popupAbierto = null;
  }
}
