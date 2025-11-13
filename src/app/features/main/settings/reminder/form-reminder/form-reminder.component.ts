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
import { MessageGlobalService } from '@services/generic/message-global.service';
import { InputTextModule } from 'primeng/inputtext';
import { ReminderStore } from '@stores/reminder.store';
import { DatePickerModule } from 'primeng/datepicker';
@Component({
  selector: 'app-form-reminder',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    ButtonModule,
    DatePickerModule
  ],
  templateUrl: './form-reminder.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``
})
export class FormReminderComponent {

  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);
  private readonly msg = inject(MessageGlobalService);

  readonly store = inject(ReminderStore);

    formData = new FormGroup({
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    date: new FormControl<Date | null>(null, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    hour: new FormControl<Date | null>(null, {
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
          error ?? '¡Ups, ocurrió un error inesperado al guardar el ¡¡Recordatorio!'
        );
        return; // Salimos si hay un error
      }

      // Si se ha creado o actualizado correctamente
      if (action === 'created' || action === 'updated') {
        this.msg.success(
          action === 'created'
            ? '¡Recordatorio creado exitosamente!'
            : '¡¡Recordatorio actualizado exitosamente!'
        );

        this.formData.reset({
          name: '',
          description: '',
          date: null,
          hour: null
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
          date: item.date ? new Date(item.date) : null,
          hour: item.hour ? new Date(item.hour) : null,
        });
      } else {
        // No hay item seleccionado, se resetea el formulario
        this.formData.reset({
          name: '',
          description: '',
          date: null,
          hour: null
        });
      }
  });

  ngOnInit(): void {}

  save() {

        const form = this.formData.value;

        const payload = {
          ...form,
          date: form.date ? form.date.toISOString() : '',
          hour: form.hour ? form.hour.toISOString() : '',
        };

        if (this.id) {
          this.store.update(this.id, { id: this.id, ...payload });
        } else {
          this.store.create(payload);
        }

  }

  onCancel() {
    this.ref.close();
  }
}
