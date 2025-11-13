import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  inject,
  OnInit,
} from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ColorPickerModule } from 'primeng/colorpicker';
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
import { TextareaModule } from 'primeng/textarea';
import { EstadoCampaniaStore } from '@stores/estado-campania.store';
import { SelectModule } from 'primeng/select';
import { EstadoAtencionStore } from '@stores/estado-atencion.store';
import { EstadoTelefonicoStore } from '@stores/estado-telefonico.store';
import { ButtonCancelComponent } from '@shared/buttons/button-cancel/button-cancel.component';
@Component({
  selector: 'app-state-form',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    ColorPickerModule,
    ButtonModule,
    TextareaModule,
    SelectModule,
    ButtonCancelComponent,
  ],
  templateUrl: './state-form.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``,
})
export class StateFormComponent implements OnInit {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);
  private readonly msg = inject(MessageGlobalService);
  public readonly config = inject(DynamicDialogConfig);
  readonly storeCampania = inject(EstadoCampaniaStore);
  readonly storeAtencion = inject(EstadoAtencionStore);
  readonly storeCanal = inject(EstadoTelefonicoStore);

  formDataCampania = new FormGroup({
    nombre: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    descripcion: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
    }),
    color: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  formDataAtencion = new FormGroup({
    nombre: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    descripcion: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
    }),
    color: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  formDataCanal = new FormGroup({
    nombre: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    descripcion: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
    }),
    color: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    categoria: new FormControl<number | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  id!: number;
  tipoEstado!: number;

  listaCategoria = [
    { id: 1, name: 'Telefónico' },
    { id: 2, name: 'Email' },
    { id: 3, name: 'ChatSAT' },
    { id: 4, name: 'WhatsApp' },
  ];

  get loadingCampania(): boolean {
    return this.storeCampania.loading();
  }

  get loadingAtencion(): boolean {
    return this.storeAtencion.loading();
  }

  get loadingCanal(): boolean {
    return this.storeAtencion.loading();
  }

  // Atención
  private resetOnSuccessEffect1 = effect(() => {
    const item = this.storeAtencion.selectedItem();
    const error = this.storeAtencion.error();
    const action = this.storeAtencion.lastAction();

    // Manejo de errores
    if (error) {
      console.log('error', error);
      this.msg.error(
        error ??
          '¡Ups, ocurrió un error inesperado al guardar el ¡Estado Atención!'
      );
      return; // Salimos si hay un error
    }

    if (action === 'created' || action === 'updated') {
      this.msg.success(
        action === 'created'
          ? '¡Estado de Atención creado exitosamente!'
          : '¡Estado de Atención actualizado exitosamente!'
      );

      this.formDataAtencion.reset({
        nombre: '',
        descripcion: '',
        color: '',
      });

      this.storeAtencion.clearSelected();
      this.ref.close(true);
      return;
    }

    // Si hay un item seleccionado, se carga en el formulario
    if (item) {
      this.id = item.id ?? null;
      let colorValue = item.color ?? '';
      if (colorValue.startsWith('#') && colorValue.length === 9) {
        colorValue = colorValue.substring(0, 7);
      }
      this.formDataAtencion.setValue({
        nombre: item.nombre ?? '',
        descripcion: item.descripcion ?? '',
        color: colorValue,
      });
    } else {
      this.formDataAtencion.reset({
        nombre: '',
        descripcion: '',
        color: '',
      });
    }
  });

  // Canales
  private resetOnSuccessEffect2 = effect(() => {
    const item = this.storeCanal.selectedItem();
    const error = this.storeCanal.error();
    const action = this.storeCanal.lastAction();

    // Manejo de errores
    if (error) {
      console.log('error', error);
      this.msg.error(
        error ??
          '¡Ups, ocurrió un error inesperado al guardar el ¡Estado Canal!'
      );
      return; // Salimos si hay un error
    }

    if (action === 'created' || action === 'updated') {
      this.msg.success(
        action === 'created'
          ? '¡Estado Canal creado exitosamente!'
          : '¡Estado Canal actualizado exitosamente!'
      );

      this.formDataCanal.reset({
        nombre: '',
        descripcion: '',
        color: '',
        categoria: undefined,
      });

      this.storeCanal.clearSelected();
      this.ref.close(true);
      return;
    }

    if (item) {
      this.id = item.id ?? null;
      let colorValue = item.color ?? '';
      if (colorValue.startsWith('#') && colorValue.length === 9) {
        colorValue = colorValue.substring(0, 7);
      }
      this.formDataCanal.setValue({
        nombre: item.nombre ?? '',
        descripcion: item.descripcion ?? '',
        color: colorValue,
        categoria: item.categoria ?? undefined,
      });
    } else {
      this.formDataCanal.reset({
        nombre: '',
        descripcion: '',
        color: '',
        categoria: undefined,
      });
    }
  });

  // Campaña
  private resetOnSuccessEffect3 = effect(() => {
    const item = this.storeCampania.selectedItem();
    const error = this.storeCampania.error();
    const action = this.storeCampania.lastAction();

    // Manejo de errores
    if (error) {
      console.log('error', error);
      this.msg.error(
        error ??
          '¡Ups, ocurrió un error inesperado al guardar el ¡Estado Campaña!'
      );
      return; // Salimos si hay un error
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'created' || action === 'updated') {
      this.msg.success(
        action === 'created'
          ? '¡Estado Campaña creado exitosamente!'
          : '¡Estado Campaña actualizado exitosamente!'
      );

      this.formDataCampania.reset({
        nombre: '',
        descripcion: '',
        color: '',
      });

      this.storeCampania.clearSelected();
      this.ref.close(true);
      return;
    }

    // Si hay un item seleccionado, se carga en el formulario
    if (item) {
      this.id = item.id ?? null;
      let colorValue = item.color ?? '';
      if (colorValue.startsWith('#') && colorValue.length === 9) {
        colorValue = colorValue.substring(0, 7);
      }
      this.formDataCampania.setValue({
        nombre: item.nombre ?? '',
        descripcion: item.descripcion ?? '',
        color: colorValue,
      });
    } else {
      // No hay item seleccionado, se resetea el formulario
      this.formDataCampania.reset({
        nombre: '',
        descripcion: '',
        color: '',
      });
    }
  });

  ngOnInit(): void {
    this.tipoEstado = this.config.data;
  }

  save() {
    if (this.tipoEstado == 2) {
      const form = this.formDataCampania.value;
      if (this.id) {
        this.storeCampania.update(this.id, { id: this.id, ...form });
      } else {
        this.storeCampania.create(form);
      }
    } else if (this.tipoEstado == 1) {
      const form = this.formDataAtencion.value;
      if (this.id) {
        this.storeAtencion.update(this.id, { id: this.id, ...form });
      } else {
        this.storeAtencion.create(form);
      }
    } else {
      const form = this.formDataCanal.value;
      if (this.id) {
        this.storeCanal.update(this.id, { id: this.id, ...form });
      } else {
        this.storeCanal.create(form);
      }
    }
  }

  onCancel() {
    this.ref.close();
  }
}
