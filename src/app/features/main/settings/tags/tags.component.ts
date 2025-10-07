import { Component, effect, inject, signal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ColorPickerModule } from 'primeng/colorpicker';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';

import { MessageGlobalService } from '@services/generic/message-global.service';
import { CommonModule } from '@angular/common';
import { ButtonEditComponent } from '@shared/buttons/button-edit/button-edit.component';
import { BtnDeleteComponent } from '@shared/buttons/btn-delete/btn-delete.component';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { TagFormComponent } from './tag-form/tag-form.component';
import { TagStore } from '@stores/tag.store';
import { Tag } from '@models/tag.model';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-tags',
  imports: [
    TableModule,
    CardModule,
    InputTextModule,
    CommonModule,
    ColorPickerModule,
    ButtonModule,
    FormsModule,
    ButtonSaveComponent,
    ButtonEditComponent,
    BtnDeleteComponent,
    ButtonSaveComponent,
  ],
  templateUrl: './tags.component.html',
  styles: ``,
})
export class TagsComponent {
  openModal: boolean = false;

  private readonly msg = inject(MessageGlobalService);
  private readonly dialogService = inject(DialogService);

  readonly store = inject(TagStore);

  limit = signal(10);
  offset = signal(0);

  get totalItems(): number {
    return this.store.totalItems();
  }

  get listPredefinedResponses(): Tag[] {
    return this.store.items();
  }

  private resetOnSuccessEffect = effect(() => {
    const error = this.store.error();
    const action = this.store.lastAction();

    // Manejo de errores
    if (!this.openModal && error) {
      console.log('error', error);
      this.msg.error(
        error ?? '¡Ups, ocurrió un error inesperado al eliminar la Etiqueta!'
      );
      return; // Salimos si hay un error
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'deleted') {
      this.msg.success('¡Etiqueta eliminado exitosamente!');
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
    const ref = this.dialogService.open(TagFormComponent, {
      header: 'Nueva Etiqueta ',
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
    const ref = this.dialogService.open(TagFormComponent, {
      header: 'Editar Etiqueta - ' + state.name,
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
