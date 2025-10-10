import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CategoryChannel } from '@models/category-channel.model';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { ButtonCancelComponent } from '@shared/buttons/button-cancel/button-cancel.component';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { AssistanceStateStore } from '@stores/assistance-state.store';
import { CategoryChannelStore } from '@stores/category-channel.store';
import { ChannelStateStore } from '@stores/channel-state.store';
import { ColorPickerModule } from 'primeng/colorpicker';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-channel-state-form',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    ColorPickerModule,
    SelectModule,
    ButtonSaveComponent,
    ButtonCancelComponent,
  ],
  templateUrl: './channel-state-form.component.html',
  styles: ``,
})
export class ChannelStateFormComponent implements OnInit {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly msg = inject(MessageGlobalService);

  public readonly config = inject(DynamicDialogConfig);

  readonly categoryChannelStore = inject(CategoryChannelStore);

  readonly store = inject(ChannelStateStore);

  formData = new FormGroup({
    name: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
    }),
    color: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    categoryId: new FormControl<number | undefined>(
      {
        value: undefined,
        disabled: true,
      },
      {
        nonNullable: true,
        validators: [Validators.required],
      }
    ),
  });

  id!: number;

  get loading(): boolean {
    return this.store.loading();
  }

  get icon(): string {
    return this.formData.get('icon')?.value ?? '';
  }

  get listCategoryChannels(): CategoryChannel[] {
    return this.categoryChannelStore.items();
  }

  private resetOnSuccessEffect = effect(() => {
    const item = this.store.selectedItem();
    const error = this.store.error();
    const action = this.store.lastAction();

    // Manejo de errores
    if (error) {
      console.log('error', error);
      this.msg.error(
        error ?? '¡Ups, ocurrió un error inesperado al guardar el estado canal!'
      );
      return; // Salimos si hay un error
    }

    if (action === 'created' || action === 'updated') {
      this.msg.success(
        action === 'created'
          ? '¡Estado de canal creado exitosamente!'
          : '¡Estado de canal actualizado exitosamente!'
      );

      this.store.clearSelected();
      this.ref.close(true);
      return;
    }

    // Si hay un item seleccionado, se carga en el formulario
    if (item && this.id != item.id) {
      this.id = item.id;
      this.formData.setValue({
        name: item.name,
        description: item.description,
        color: item.color,
        categoryId: item.categoryId,
      });
    }
  });

  ngOnInit(): void {
    const { categoryId } = this.config.data;

    this.formData.patchValue({ categoryId });

    this.categoryChannelStore.loadAll();
  }

  onSubmit() {
    const form = this.formData.getRawValue();
    console.log('form', form);
    if (this.id) {
      this.store.update(this.id, { id: this.id, ...form });
    } else {
      this.store.create(form);
    }
  }

  onCancel() {
    this.ref.close();
  }
}
