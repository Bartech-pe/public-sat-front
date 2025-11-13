import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  inject,
  signal,
} from '@angular/core';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ColorPickerModule } from 'primeng/colorpicker';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { DialogService } from 'primeng/dynamicdialog';

import { MessageGlobalService } from '@services/message-global.service';
import { PredefinedResponsesStore } from '@stores/predefined.store';
import { PredefinedResponses } from '@models/predefined.model';
import { CommonModule } from '@angular/common';
import { PaginatorComponent } from '@shared/paginator/paginator.component';
import { ButtonEditComponent } from '@shared/buttons/button-edit/button-edit.component';
import { ButtonDeleteComponent } from '@shared/buttons/button-delete/button-delete.component';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { ReminderStore } from '@stores/reminder.store';
import { FormReminderComponent } from './form-reminder/form-reminder.component';
import { Reminder } from '@models/reminder.model';

@Component({
  selector: 'app-reminder',
  imports: [
    TableModule,
    InputTextModule,
    CommonModule,
    ColorPickerModule,
    ButtonModule,
    FormsModule,
    BreadcrumbModule,
    ButtonSaveComponent,
    ButtonEditComponent,
    ButtonDeleteComponent,
    ButtonSaveComponent,
  ],
  templateUrl: './reminder.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``,
})
export class ReminderComponent {
  title: string = 'Recordatorio';

  descripcion: string =
    'Los recordatorios te ayudan a organizar y dar seguimiento a tareas importantes dentro de tu flujo de atención. Puedes crear un recordatorio para un contacto o una conversación, especificando la fecha, hora y una breve descripción. Desde el panel lateral, puedes ver todos los recordatorios asignados y marcar aquellos que ya han sido atendidos. Esto garantiza que ninguna tarea quede pendiente y mejora la eficiencia de tu equipo.';

  createButtonLabel: string = 'Crear recordatorio';

  openModal: boolean = false;

  private readonly msg = inject(MessageGlobalService);
  private readonly dialogService = inject(DialogService);

  readonly store = inject(ReminderStore);

  limit = signal(10);
  offset = signal(0);

  get totalItems(): number {
    return this.store.totalItems();
  }

  get listRecordatorio(): Reminder[] {
    return this.store.items();
  }

  private resetOnSuccessEffect = effect(() => {
    const error = this.store.error();
    const action = this.store.lastAction();

    // Manejo de errores
    if (!this.openModal && error) {
      console.log('error', error);
      this.msg.error(
        error ??
          '¡Ups, ocurrió un error inesperado al eliminar la Recordatorio!'
      );
      return; // Salimos si hay un error
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'deleted') {
      this.msg.success('¡Recordatorio eliminado exitosamente!');
      this.store.clearAll();
      this.store.loadAll();
      return;
    }
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.store.loadAll(this.limit(), this.offset());
  }

  onPageChange(event: { limit: number; offset: number }) {
    this.limit.set(event.limit);
    this.offset.set(event.offset);
    this.loadData();
  }

  addNew() {
    this.openModal = true;
    const ref = this.dialogService.open(FormReminderComponent, {
      header: 'Añadir Recordatorio ',
      styleClass: 'modal-lg',
      modal: true,
      dismissableMask: false,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      this.openModal = false;
      if (res) {
        this.loadData();
      }
    });
  }

  edit(state: any) {
    this.store.loadById(state.id);
    this.openModal = true;
    const ref = this.dialogService.open(FormReminderComponent, {
      header: 'Editar Recordatorio - ' + state.name,
      styleClass: 'modal-lg',
      modal: true,
      dismissableMask: false,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      this.openModal = false;
      if (res) {
        this.loadData();
      }
    });
  }

  remove(state: any) {
    this.msg.confirm(
      `<div class='px-4 py-2'>
          <p class='text-center'> ¿Está seguro de eliminar el Estado <span class='uppercase font-bold'>${state.name}</span>? </p>
          <p class='text-center'> Esta acción no se puede deshacer. </p>
        </div>`,
      () => {
        this.store.delete(state.id);
      }
    );
  }
}
