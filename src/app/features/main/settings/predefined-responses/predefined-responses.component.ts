import { Component, effect, inject, signal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ColorPickerModule } from 'primeng/colorpicker';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { DialogService } from 'primeng/dynamicdialog';

import { MessageGlobalService } from '@services/generic/message-global.service';
import { FormPredefinedComponent } from './form-predefined/form-predefined.component';
import { PredefinedResponsesStore } from '@stores/predefined.store';
import { PredefinedResponses } from '@models/predefined-response.model';
import { CommonModule } from '@angular/common';
import { PaginatorComponent } from '@shared/paginator/paginator.component';
import { ButtonEditComponent } from '@shared/buttons/button-edit/button-edit.component';
import { BtnDeleteComponent } from '@shared/buttons/btn-delete/btn-delete.component';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { CategoryChannelStore } from '@stores/category-channel.store';
import { CategoryChannel } from '@models/category-channel.model';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-predefined-responses',
  imports: [
    CommonModule,
    TabsModule,
    TableModule,
    InputTextModule,
    ColorPickerModule,
    ButtonModule,
    FormsModule,
    BreadcrumbModule,
    ButtonEditComponent,
    BtnDeleteComponent,
    ButtonSaveComponent,
  ],
  templateUrl: './predefined-responses.component.html',
  styles: ``,
})
export class PredefinedResponsesComponent {
  title: string = 'Respuestas predefinidas';
  descripcion: string =
    "Las respuestas predefinidas son plantillas preconfiguradas que le ayudan a responder rápidamente a una conversación. Los agentes pueden escribir el carácter '/' seguido por el código corto para insertar una respuesta predefinida durante una conversación.";

  createButtonLabel: string = 'Nueva respuesta';

  openModal: boolean = false;

  private readonly msg = inject(MessageGlobalService);

  private readonly dialogService = inject(DialogService);

  readonly categoryChannelStore = inject(CategoryChannelStore);

  readonly store = inject(PredefinedResponsesStore);

  get listCategoryChannels(): CategoryChannel[] {
    return this.categoryChannelStore.items().filter((item) => item.id !== 1);
  }

  activeTab: number = 0;

  limit = signal(10);
  offset = signal(0);

  get totalItems(): number {
    return this.store.totalItems();
  }

  get listPredefinedResponses(): PredefinedResponses[] {
    return this.store.items();
  }

  getPredefinedResponses(category: number) {
    return this.listPredefinedResponses.filter(
      (item) => item.categoryId === category
    );
  }

  private resetOnSuccessEffect = effect(() => {
    const error = this.store.error();
    const action = this.store.lastAction();

    // Manejo de errores
    if (!this.openModal && error) {
      console.log('error', error);
      this.msg.error(
        error ??
          '¡Ups, ocurrió un error inesperado al eliminar el respuesta predefinida!'
      );
      return; // Salimos si hay un error
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'deleted') {
      this.msg.success('¡Respuesta predefinida eliminada exitosamente!');
      this.store.clearAll();
      this.store.loadAll();
      return;
    }
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.categoryChannelStore.loadAll();
    this.store.loadAll(this.limit(), this.offset());
  }

  onPageChange(event: { limit: number; offset: number }) {
    this.limit.set(event.limit);
    this.offset.set(event.offset);
    this.loadData();
  }

  addNew() {
    this.openModal = true;
    const ref = this.dialogService.open(FormPredefinedComponent, {
      header: 'Nueva Respuesta Predefinida ',
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
    const ref = this.dialogService.open(FormPredefinedComponent, {
      header: 'Editar respuesta predefinida - ' + state.code,
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
        <p class='text-center'> ¿Está seguro de eliminar la respuesta <span class='uppercase font-bold'>${state.title}</span>? </p>
        <p class='text-center'> Esta acción no se puede deshacer. </p>
      </div>`,
      () => {
        this.store.delete(state.id);
      }
    );
  }
}
