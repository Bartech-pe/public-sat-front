import { Component, CUSTOM_ELEMENTS_SCHEMA, effect, inject, OnInit } from '@angular/core';
import {  DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
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
import { DropdownModule } from 'primeng/dropdown';
import { EditorModule } from 'primeng/editor';
import { InputSwitchModule } from 'primeng/inputswitch';
@Component({
  selector: 'app-form-llamadas',
  imports: [
     CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    DropdownModule,
    EditorModule,
    InputSwitchModule,
    DatePickerModule,
    ButtonModule,
  ],
  templateUrl: './form-llamadas.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``
})
export class FormLlamadasComponent {
public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);
  private readonly msg = inject(MessageGlobalService);

  
  get loading(): boolean {
    return false /* this.store.loading() */;
  }

  id!: number;
   formData = new FormGroup({
    title: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    message: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
     inbox: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required] }),
    audience: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required] }),
    schedule_time: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    enable_campaign: new FormControl<boolean>(false, { nonNullable: true, validators: [Validators.required] }),
  });

  // Opciones de inbox
  inboxOptions = [
    { label: 'WhatsApp', value: 1 },
    { label: 'Messenger', value: 2 },
    { label: 'Telegram', value: 3 },
  ];

  // Opciones de tipo de envío
  shippingTypeOptions = [
    { label: 'Inmediato', value: 1 },
    { label: 'Programado', value: 2 },
  ];

  onCancel() {
    this.ref.close();
  }
}
