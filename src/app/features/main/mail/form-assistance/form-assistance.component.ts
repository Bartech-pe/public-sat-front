import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  inject,
  OnInit,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ConsultType } from '@models/consult-type.modal';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { ButtonCancelComponent } from '@shared/buttons/button-cancel/button-cancel.component';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { ChannelAssistanceStore } from '@stores/channel-assistance.store';
import { ConsultTypeStore } from '@stores/consult-type.store';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TypeIdeDocStore } from '@stores/type-ide-doc.store';
import { TypeIdeDoc } from '@models/type-ide-doc.model';

@Component({
  selector: 'app-form-assistance',
  imports: [
    CommonModule,
    SelectModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonCancelComponent,
    ButtonSaveComponent,
    InputTextModule,
    TextareaModule,
  ],
  templateUrl: './form-assistance.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``,
})
export class FormAssistanceComponent implements OnInit {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  public readonly config = inject(DynamicDialogConfig);

  private readonly msg = inject(MessageGlobalService);

  readonly consultTypeStore = inject(ConsultTypeStore);

  readonly typeIdeDocStore = inject(TypeIdeDocStore);

  readonly store = inject(ChannelAssistanceStore);

  formData = new FormGroup({
    name: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    detail: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    consultTypeCode: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    categoryId: new FormControl<number | undefined>(2, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    communicationId: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    docIde: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    tipDoc: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  get loading(): boolean {
    return this.store.loading();
  }

  get consultTypeList(): ConsultType[] {
    return this.consultTypeStore.items().map((item) => ({
      ...item,
      label: `[${item.code}] ${item.name}`,
    }));
  }

  get typeIdeDocList(): TypeIdeDoc[] {
    return this.typeIdeDocStore.items();
  }

  ngOnInit(): void {
    const { communicationId } = this.config.data;
    this.formData.get('communicationId')?.setValue(communicationId);
    this.consultTypeStore.loadAll();
    this.typeIdeDocStore.loadAll();
  }

  private resetOnSuccessEffect = effect(() => {
    const item = this.store.selectedItem();
    const error = this.store.error();
    const action = this.store.lastAction();

    // Manejo de errores
    if (error) {
      console.log('error', error);
      this.msg.error(
        error ?? '¡Ups, ocurrió un error inesperado al guardar el rol!'
      );
      return; // Salimos si hay un error
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'created' || action === 'updated') {
      this.msg.success(
        action === 'created'
          ? '¡Atención cerrada exitosamente!'
          : '¡Atención cerrada exitosamente!'
      );

      this.formData.reset({
        name: undefined,
        detail: undefined,
        consultTypeCode: undefined,
        categoryId: 2,
        tipDoc: undefined,
        docIde: undefined,
      });

      this.store.clearSelected();
      this.ref.close(true);
      return;
    }
  });

  onCancel() {
    this.store.clearSelected();
    this.ref.close(false);
  }

  onSubmit() {
    const form = this.formData.value;
    this.store.create(form);
  }
}
