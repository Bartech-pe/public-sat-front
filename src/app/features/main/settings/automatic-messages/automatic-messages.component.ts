import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AutomaticMessage } from '@models/automatic-message.model';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { BtnEditSquareComponent } from '@shared/buttons/btn-edit-square/btn-edit-square.component';
import { ButtonCancelComponent } from '@shared/buttons/button-cancel/button-cancel.component';
import { AutomaticMessageStore } from '@stores/automatic-message.store';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitch } from 'primeng/toggleswitch';

@Component({
  selector: 'app-automatic-messages',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    TabsModule,
    TagModule,
    CommonModule,
    AvatarModule,
    BadgeModule,
    DialogModule,
    ToggleSwitch,
    TableModule,
    TextareaModule,
    BtnEditSquareComponent,
    ButtonCancelComponent,
  ],
  templateUrl: './automatic-messages.component.html',
  styles: ``,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AutomaticMessagesComponent implements OnInit {
  private readonly msg = inject(MessageGlobalService);
  private readonly dialogService = inject(DialogService);
  private readonly storeMensaje = inject(AutomaticMessageStore);
  public readonly ref = inject<DynamicDialogRef | null>(DynamicDialogRef, {
    optional: true,
  });

  formData = new FormGroup({
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    status: new FormControl<boolean>(true, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  openModal: boolean = false;
  value: number = 0;
  displayEditarMensaje: boolean = false;
  submited: boolean = false;
  id!: number;
  mensajeSeleccionado!: AutomaticMessage | null;

  get totalItemsMensajesAut(): number {
    return this.storeMensaje.totalItems();
  }

  get listadoMensajesAut(): AutomaticMessage[] {
    return this.storeMensaje.items();
  }

  get mensajesChat(): AutomaticMessage[] {
    return this.listadoMensajesAut.filter((m) => m.categoryId === 1);
  }

  get mensajesCorreo(): AutomaticMessage[] {
    return this.listadoMensajesAut.filter((m) => m.categoryId === 2);
  }

  get mensajesWhatsApp(): AutomaticMessage[] {
    return this.listadoMensajesAut.filter((m) => m.categoryId === 3);
  }

  get mensajesTelegram(): AutomaticMessage[] {
    return this.listadoMensajesAut.filter((m) => m.categoryId === 4);
  }

  private resetOnSuccessEffect = effect(() => {
    const item = this.storeMensaje.selectedItem();
    const error = this.storeMensaje.error();
    const action = this.storeMensaje.lastAction();

    // Manejo de errores
    if (error) {
      console.log('error', error);
      this.msg.error(
        error ?? '¡Ups, ocurrió un error inesperado al guardar el mensaje!'
      );
      return; // Salimos si hay un error
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'created' || action === 'updated') {
      this.msg.success(
        action === 'created'
          ? 'Mensaje creado exitosamente!'
          : 'Mensaje actualizado exitosamente!'
      );

      this.resetForm();
      this.displayEditarMensaje = false;
      this.storeMensaje.clearSelected();
      this.resetForm();
      this.displayEditarMensaje = false;
      this.submited = false;
      this.mensajeSeleccionado = null;
      this.loadData();
      return;
    }

    // Si hay un item seleccionado, se carga en el formulario
    if (!this.submited && item) {
      this.id = item.id ?? null;
      this.formData.patchValue({
        name: item.name ?? '',
        description: item.description ?? '',
        status: item.status!,
      });
    }
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.storeMensaje.loadAll();
  }

  onEdit(item: AutomaticMessage): void {
    this.mensajeSeleccionado = item;
    this.id = item.id ?? null;

    this.formData.patchValue({
      name: item.name ?? '',
      description: item.description ?? '',
      status: item.status ?? true,
    });

    this.displayEditarMensaje = true;
  }

  resetForm() {
    this.formData.reset({
      name: '',
      description: undefined,
      status: true,
    });
  }

  get isActive(): boolean {
    return this.formData.get('status')?.value as boolean;
  }

  onSubmit() {
    this.submited = true;
    const form = this.formData.value;
    if (this.id) {
      this.storeMensaje.update(this.id, { id: this.id, ...form });
    }
  }
}
