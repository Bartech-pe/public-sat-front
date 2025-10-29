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
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ConsConsultasComponent } from '@features/main/reports/cons-consultas/cons-consultas.component';
import { AutomaticMessage } from '@models/automatic-message.model';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { BtnDeleteComponent } from '@shared/buttons/btn-delete/btn-delete.component';
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
    BtnDeleteComponent,
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
    descriptions: new FormArray<FormControl<string>>([
      new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required],
      })
    ]),
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

  get mensajesTelefonico(): AutomaticMessage[] {
    return this.listadoMensajesAut.filter((m) => m.categoryId === 1);
  }

  get mensajesCorreo(): AutomaticMessage[] {
    return this.listadoMensajesAut.filter((m) => m.categoryId === 2);
  }

  get mensajesChatsat(): AutomaticMessage[] {
    return this.listadoMensajesAut.filter((m) => m.categoryId === 3);
  }

  get mensajesWhatsapp(): AutomaticMessage[] {
    return this.listadoMensajesAut.filter((m) => m.categoryId === 4);
  }

  // Getter para acceder al FormArray
  get descriptions(): FormArray<FormControl<string>> {
    return this.formData.get('descriptions') as FormArray<FormControl<string>>;
  }

  // Agregar un nuevo campo de descripción
  addDescription(): void {
    this.descriptions.push(
      new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required],
      })
    );
  }

  // Eliminar un campo de descripción
  removeDescription(index: number): void {
    if (this.descriptions.length > 1) {
      this.descriptions.removeAt(index);
    }
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
      return;
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
      // Limpiar el FormArray antes de cargar nuevos datos
      this.descriptions.clear();

      // Si description es un array, cargar cada elemento
      if (Array.isArray(item.message_descriptions)) {
        item.message_descriptions.forEach((desc: string) => {
          this.descriptions.push(
            new FormControl<string>(desc, {
              nonNullable: true,
              validators: [Validators.required],
            })
          );
        });
      } else if (item.message_descriptions) {
        // Si es un string, agregarlo como único elemento
        this.descriptions.push(
          new FormControl<string>(item.message_descriptions, {
            nonNullable: true,
            validators: [Validators.required],
          })
        );
      } else {
        // Si no hay description, agregar un campo vacío
        this.descriptions.push(
          new FormControl<string>('', {
            nonNullable: true,
            validators: [Validators.required],
          })
        );
      }

      this.formData.patchValue({
        name: item.name ?? '',
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
    // Limpiar el FormArray
    this.descriptions.clear();

    // Cargar las descripciones
    if (Array.isArray(item.descriptions)) {
      item.descriptions.forEach((desc: any) => {
        this.descriptions.push(
          new FormControl<string>(desc.description, {
            nonNullable: true,
            validators: [Validators.required],
          })
        );
      });
    } else if (item.descriptions) {
      this.descriptions.push(
        new FormControl<string>(item.descriptions, {
          nonNullable: true,
          validators: [Validators.required],
        })
      );
    } else {
      this.descriptions.push(
        new FormControl<string>('', {
          nonNullable: true,
          validators: [Validators.required],
        })
      );
    }
    this.formData.patchValue({
      name: item.name ?? '',
      status: item.status ?? true,
    });
    console.log(this.formData)

    this.displayEditarMensaje = true;
  }

  resetForm() {
    // Limpiar el FormArray
    this.descriptions.clear();

    // Agregar un campo vacío
    this.descriptions.push(
      new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required],
      })
    );

    this.formData.patchValue({
      name: '',
      status: true,
    });
  }

  get isActive(): boolean {
    return this.formData.get('status')?.value as boolean;
  }

  onSubmit() {
    this.submited = true;
    const form = this.formData.value;
    console.log(form);
    if (this.id) {
      this.storeMensaje.update(this.id, {
        id: this.id,
        name: form.name,
        message_descriptions: form.descriptions,
        status: form.status
      });
    }
  }
}
