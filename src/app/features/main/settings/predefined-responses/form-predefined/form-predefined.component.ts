import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  inject,
  OnInit,
} from '@angular/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
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
import { PredefinedResponsesStore } from '@stores/predefined.store';
import { InputTextModule } from 'primeng/inputtext';
import { CategoryChannelStore } from '@stores/category-channel.store';
import { CategoryChannel } from '@models/category-channel.model';
import { SelectModule } from 'primeng/select';
import { ChipModule } from 'primeng/chip';
import { EditorModule } from 'primeng/editor';
import { ButtonCancelComponent } from '@shared/buttons/button-cancel/button-cancel.component';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
@Component({
  selector: 'app-form-predefined',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SelectModule,
    InputTextModule,
    TextareaModule,
    ChipModule,
    EditorModule,
    ButtonModule,
    ButtonCancelComponent,
    ButtonSaveComponent,
  ],
  templateUrl: './form-predefined.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``,
})
export class FormPredefinedComponent {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);
  private readonly msg = inject(MessageGlobalService);

  readonly store = inject(PredefinedResponsesStore);

  readonly categoryChannelStore = inject(CategoryChannelStore);

  get listCategoryChannels(): CategoryChannel[] {
    return this.categoryChannelStore.items().filter((item) => item.id !== 1);
  }

  formData = new FormGroup({
    title: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    content: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    keywords: new FormControl<string[]>([], {
      nonNullable: true,
      validators: [],
    }),
    categoryId: new FormControl<number | undefined>(undefined, {
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
        error ??
          '¡Ups, ocurrió un error inesperado al guardar la ¡Respuesta predefinida!'
      );
      return; // Salimos si hay un error
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'created' || action === 'updated') {
      this.msg.success(
        action === 'created'
          ? '¡Respuesta predefinida creada exitosamente!'
          : '¡Respuesta predefinida actualizada exitosamente!'
      );

      this.store.clearSelected();
      this.ref.close(true);
      return;
    }

    // Si hay un item seleccionado, se carga en el formulario
    if (item) {
      this.id = item.id;
      this.formData.setValue({
        // code: item.code,
        title: item.title,
        content: item.content,
        keywords: item.keywords,
        categoryId: item.categoryId,
      });
    }
  });

  ngOnInit(): void {}

  onSubmit() {
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
