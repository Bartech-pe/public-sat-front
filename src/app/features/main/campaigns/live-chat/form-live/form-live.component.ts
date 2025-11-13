import { Component, CUSTOM_ELEMENTS_SCHEMA, effect, inject, OnInit } from '@angular/core';
import {  DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { StatusStore } from '@stores/status.store';
import { MessageGlobalService } from '@services/message-global.service';
import { DropdownModule } from 'primeng/dropdown';
import { EditorModule } from 'primeng/editor';
import { InputSwitchModule } from 'primeng/inputswitch';
@Component({
  selector: 'app-form-live',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    DropdownModule,
    EditorModule,
    InputSwitchModule,
    ButtonModule,],
  templateUrl: './form-live.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``
})
export class FormLiveComponent {

  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);
  private readonly msg = inject(MessageGlobalService);
  id!: number;
   formData = new FormGroup({
    title: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    message: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    inbox: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required] }),
    shipping_type: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required] }),
    url: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    time_page: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
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
