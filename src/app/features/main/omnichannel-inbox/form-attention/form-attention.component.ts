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

@Component({
  selector: 'app-form-attention',
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
  templateUrl: './form-attention.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``,
})
export class FormAttentionComponent implements OnInit {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  public readonly config = inject(DynamicDialogConfig);

  private readonly msg = inject(MessageGlobalService);

  readonly consultTypeStore = inject(ConsultTypeStore);

  formData = new FormGroup({
    attentionDetail: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    consultTypeId: new FormControl<number | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    })
  });

  get consultTypeList(): ConsultType[] {
    return this.consultTypeStore.items();
  }

  ngOnInit(): void {
    const { attentionDetail, consultTypeId } = this.config.data;
    if(attentionDetail && consultTypeId)
    {
      this.formData.get('attentionDetail')?.setValue(attentionDetail);
      this.formData.get('consultTypeId')?.setValue(consultTypeId);
    }
    this.consultTypeStore.loadAll();
  }

  // private resetOnSuccessEffect = effect(() =>
  // {
  //   this.formData.reset({
  //     detail: undefined,
  //     consultTypeId: undefined,
  //   });

  //   this.ref.close(this.formData);
  //   return;
  // });

  onCancel() {
    this.ref.close(false);
  }

  onSubmit() {
    this.ref.close(this.formData.value);
  }
}
