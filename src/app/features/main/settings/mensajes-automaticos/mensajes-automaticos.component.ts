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
import { MensajeAutomatico } from '@models/mensaje-automatico.model';
import { MessageGlobalService } from '@services/message-global.service';
import { BtnEditSquareComponent } from '@shared/buttons/btn-edit-square/btn-edit-square.component';
import { ButtonCancelComponent } from '@shared/buttons/button-cancel/button-cancel.component';
import { MensajeAutomaticoStore } from '@stores/mensaje-automatico.store';
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
  selector: 'app-mensajes-automaticos',
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
    ButtonCancelComponent
  ],
  templateUrl: './mensajes-automaticos.component.html',
  styles: ``,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MensajesAutomaticosComponent implements OnInit {
  private readonly msg = inject(MessageGlobalService);
  private readonly dialogService = inject(DialogService);
  private readonly storeMensaje = inject(MensajeAutomaticoStore);
  public readonly ref = inject<DynamicDialogRef | null>(DynamicDialogRef, {
    optional: true,
  });

  formData = new FormGroup({
    nombre: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    descripcion: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    estado: new FormControl<boolean>(true, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  openModal: boolean = false;
  value: number = 0;
  displayEditarMensaje: boolean = false;
  submited: boolean = false;
  id!: number;
  mensajeSeleccionado!: MensajeAutomatico | null;

  get totalItemsMensajesAut(): number {
    return this.storeMensaje.totalItems();
  }

  get listadoMensajesAut(): MensajeAutomatico[] {
    return this.storeMensaje.items();
  }

  get mensajesChat(): MensajeAutomatico[] {
    return this.listadoMensajesAut.filter((m) => m.tipo === 1);
  }

  get mensajesCorreo(): MensajeAutomatico[] {
    return this.listadoMensajesAut.filter((m) => m.tipo === 2);
  }

  get mensajesWhatsApp(): MensajeAutomatico[] {
    return this.listadoMensajesAut.filter((m) => m.tipo === 3);
  }

  get mensajesTelegram(): MensajeAutomatico[] {
    return this.listadoMensajesAut.filter((m) => m.tipo === 4);
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
        nombre: item.nombre ?? '',
        descripcion: item.descripcion ?? '',
        estado: item.estado!,
      });
    }
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.storeMensaje.loadAll();
  }

  onEdit(item: MensajeAutomatico): void {
    this.mensajeSeleccionado = item;
    this.id = item.id ?? null;

    this.formData.patchValue({
      nombre: item.nombre ?? '',
      descripcion: item.descripcion ?? '',
      estado: item.estado ?? true,
    });

    this.displayEditarMensaje = true;
  }

  resetForm() {
    this.formData.reset({
      nombre: '',
      descripcion: undefined,
      estado: true,
    });
  }

  get isActive(): boolean {
    return this.formData.get('estado')?.value as boolean;
  }

  onSubmit() {
    this.submited = true;
    const form = this.formData.value;
    if (this.id) {
      this.storeMensaje.update(this.id, { id: this.id, ...form });
    }
  }
}
