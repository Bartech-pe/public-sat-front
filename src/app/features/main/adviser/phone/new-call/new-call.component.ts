import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
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
import { MessageGlobalService } from '@services/generic/message-global.service';
import { BtnCustomComponent } from '@shared/buttons/btn-custom/btn-custom.component';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { DialogService } from 'primeng/dynamicdialog';
import { AloSatService } from '@services/alo-sat.service';
import { KeyFilterModule } from 'primeng/keyfilter';

@Component({
  selector: 'app-new-call',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    KeyFilterModule,
    BtnCustomComponent,
  ],
  templateUrl: './new-call.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class NewCallComponent implements OnInit {
  formData = new FormGroup({
    phoneNumber: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    phoneCode: new FormControl<string | undefined>('1', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  private readonly msg = inject(MessageGlobalService);

  public readonly ref = inject(DynamicDialogRef);

  private readonly dialogService = inject(DialogService);

  private readonly aloSatService = inject(AloSatService);

  submited: boolean = false;

  campaignId: string = '';

  ngOnInit(): void {
    const instance = this.dialogService.getInstance(this.ref);

    const data = instance.data;

    if (data) {
      const { campaignId } = data;
      this.campaignId = campaignId;
    }
  }

  onSubmit() {
    this.submited = true;
    const { phoneNumber, phoneCode } = this.formData.value;

    this.aloSatService.manualDialing(phoneNumber!, phoneCode!).subscribe({
      next: (data) => {
        this.msg.success('¡Marcación exitosa!');
        this.ref.close(true);
        this.resetForm();
      },
    });
  }

  resetForm() {
    this.formData.reset({
      phoneNumber: undefined,
      phoneCode: '1',
    });
  }

  onCancel() {
    this.ref.close();
    this.formData.reset();
  }
}
