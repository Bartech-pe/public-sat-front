import { Component, CUSTOM_ELEMENTS_SCHEMA, effect, inject, OnInit } from '@angular/core';
import {  DynamicDialogRef } from 'primeng/dynamicdialog';
import { TextareaModule } from 'primeng/textarea';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { MessageGlobalService } from '@services/message-global.service';
import { PredefinedResponsesStore } from '@stores/predefined.store';
import { InputTextModule } from 'primeng/inputtext';
@Component({
  selector: 'app-form-predefined',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    ButtonModule,
  ],
  templateUrl: './form-predefined.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``
})
export class FormPredefinedComponent {

  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);
  private readonly msg = inject(MessageGlobalService);

  readonly store = inject(PredefinedResponsesStore);

   formData = new FormGroup({
    code: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    message: new FormControl<string | undefined>(undefined, {
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
          error ?? '¡Ups, ocurrió un error inesperado al guardar el ¡Respuestas predefinidas!'
        );
        return; // Salimos si hay un error
      }

      // Si se ha creado o actualizado correctamente
      if (action === 'created' || action === 'updated') {
        this.msg.success(
          action === 'created'
            ? '¡Respuestas predefinidas creado exitosamente!'
            : '¡Respuestas predefinidas actualizado exitosamente!'
        );

        this.formData.reset({
          code: '',
          message: ''
        });

        this.store.clearSelected();
        this.ref.close(true);
        return;
      }

      // Si hay un item seleccionado, se carga en el formulario
      if (item) {
        this.id = item.id ?? null;
        this.formData.setValue({
          code: item.code ?? '',
          message: item.message ?? ''
        });
      } else {
        // No hay item seleccionado, se resetea el formulario
        this.formData.reset({
          code: '',
          message: ''
        });
      }
  });

  ngOnInit(): void {}

  save() {

      const form = this.formData.value;
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
