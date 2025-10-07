import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Department } from '@models/department.model';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { ButtonCancelComponent } from '@shared/buttons/button-cancel/button-cancel.component';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { DepartmentStore } from '@stores/department.store';
import { OfficeStore } from '@stores/office.store';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'app-office-form',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    ToggleSwitchModule,
    ButtonModule,
    SelectModule,
    ButtonCancelComponent,
    ButtonSaveComponent,
  ],
  templateUrl: './office-form.component.html',
  styles: ``,
})
export class OfficeFormComponent implements OnInit {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly dialogService = inject(DialogService);

  private readonly msg = inject(MessageGlobalService);

  readonly areaStore = inject(DepartmentStore);

  readonly store = inject(OfficeStore);

  formData = new FormGroup({
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
    }),
    departmentId: new FormControl<number | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
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

  get listDepartments(): Department[] {
    return this.areaStore.items();
  }

  private resetOnSuccessEffect = effect(() => {
    const item = this.store.selectedItem();
    const error = this.store.error();
    const action = this.store.lastAction();

    // Manejo de errores
    if (error) {
      console.log('error', error);
      this.msg.error(
        error ?? '¡Ups, ocurrió un error inesperado al guardar la office!'
      );
      return; // Salimos si hay un error
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'created' || action === 'updated') {
      this.msg.success(
        action === 'created'
          ? '¡office creado exitosamente!'
          : '¡office actualizado exitosamente!'
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
        departmentId: item.departmentId,
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

  ngOnInit(): void {
    this.areaStore.loadAll();
  }

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
