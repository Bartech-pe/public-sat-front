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
import { MessageGlobalService } from '@services/generic/message-global.service';
import { TextareaModule } from 'primeng/textarea';
import { CampaignStateStore } from '@stores/campaign-state.store';
import { SelectModule } from 'primeng/select';
import { AssistanceStateStore } from '@stores/assistance-state.store';
import { ButtonCancelComponent } from '@shared/buttons/button-cancel/button-cancel.component';
import { ChannelStateStore } from '@stores/channel-state.store';
import { CategoryChannelStore } from '@stores/category-channel.store';
import { CategoryChannel } from '@models/category-channel.model';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';

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
    ButtonSaveComponent
  ],
  templateUrl: './state-form.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``,
})
export class StateFormComponent implements OnInit {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);
  private readonly msg = inject(MessageGlobalService);
  public readonly config = inject(DynamicDialogConfig);
  readonly storeCampania = inject(CampaignStateStore);
  readonly categoryChannelStore = inject(CategoryChannelStore);

  formCampaign = new FormGroup({
    name: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
    }),
    color: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  id!: number;
  tipoEstado!: number;

  get listCategoryChannels(): CategoryChannel[] {
    return this.categoryChannelStore.items();
  }

  get loadingCampania(): boolean {
    return this.storeCampania.loading();
  }

  // Campaña
  private resetOnSuccessEffect = effect(() => {
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

      this.storeCampania.clearSelected();
      this.ref.close(true);
      return;
    }

    // Si hay un item seleccionado, se carga en el formulario
    if (item) {
      this.id = item.id ?? null;
      this.formCampaign.setValue({
        name: item.name,
        description: item.description,
        color: item.color?.substring(0, 7) ?? '#000000',
      });
    }
  });

  ngOnInit(): void {
    this.tipoEstado = this.config.data;
    this.categoryChannelStore.loadAll();
    console.log('TIPO ESTADO', this.tipoEstado);
  }

  onSubmit() {
    const form = this.formCampaign.value;
    if (this.id) {
      this.storeCampania.update(this.id, { id: this.id, ...form });
    } else {
      this.storeCampania.create(form);
    }
  }

  onCancel() {
    this.ref.close();
  }
}
