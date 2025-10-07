import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { ButtonCancelComponent } from '@shared/buttons/button-cancel/button-cancel.component';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { DepartmentStore } from '@stores/department.store';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'app-department-form',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    ToggleSwitchModule,
    ButtonModule,
    ButtonCancelComponent,
    ButtonSaveComponent,
  ],
  templateUrl: './department-form.component.html',
  styles: ``,
})
export class DepartmentFormComponent implements OnInit {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly dialogService = inject(DialogService);

  private readonly msg = inject(MessageGlobalService);

  readonly store = inject(DepartmentStore);

  formData = new FormGroup({
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
    }),
    status: new FormControl<boolean>(true, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  id!: number;

  get loading(): boolean {
    return this.store.loading();
  }

  private resetOnSuccessEffect = effect(() => {
    const item = this.store.selectedItem();
    const error = this.store.error();
    const action = this.store.lastAction();

    // Manejo de errores
    if (error) {
      console.log('error', error);
      this.msg.error(
        error ?? '¡Ups, ocurrió un error inesperado al guardar el área!'
      );
      return; // Salimos si hay un error
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'created' || action === 'updated') {
      this.msg.success(
        action === 'created'
          ? '¡Área creado exitosamente!'
          : '¡Área actualizado exitosamente!'
      );

      this.formData.reset({
        name: '',
        description: undefined,
        status: true,
      });

      this.store.clearSelected();
      this.ref.close(true);
      return;
    }

    // Si hay un item seleccionado, se carga en el formulario
    if (item) {
      this.id = item.id ?? null;
      this.formData.setValue({
        name: item.name ?? '',
        description: item.description ?? '',
        status: item.status!,
      });
    } else {
      // No hay item seleccionado, se resetea el formulario
      this.formData.reset({
        name: '',
        description: '',
        status: true,
      });
    }
  });

  ngOnInit(): void {}

  get isActive(): boolean {
    return this.formData.get('status')?.value as boolean;
  }

  onCancel() {
    this.store.clearSelected();
    this.ref.close(false);
  }

  onSubmit() {
    const form = this.formData.value;
    if (this.id) {
      this.store.update(this.id, { id: this.id, ...form });
    } else {
      this.store.create(form);
    }
  }
}
