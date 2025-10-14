import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { CitizenContact } from '@models/citizen.model';
import { CitizenService } from '@services/citizen.service';

@Component({
  selector: 'app-contact-details',
  imports: [
    CommonModule,
    FormsModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
    ButtonModule,
    ToggleSwitchModule,
    ReactiveFormsModule,
    ButtonSaveComponent,
  ],
  templateUrl: './contact-details.component.html',
  styles: ``,
})
export class ContactDetailsComponent implements OnInit {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly dialogService: DialogService = inject(DialogService);

  private readonly msg = inject(MessageGlobalService);

  private readonly service = inject(CitizenService);

  formData = new FormGroup({
    phone: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [],
    }),
    whatsapp: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.minLength(9)],
    }),
    email: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.email],
    }),
    isAdditional: new FormControl<boolean>(false, {
      nonNullable: true,
    }),
  });

  info?: { taxpayerName: string; tipDoc: string; docIde: string };

  ngOnInit(): void {
    const instance = this.dialogService.getInstance(this.ref);
    const data = instance.data;
    if (data) {
      this.info = data;
      console.log('data', data);
    }
  }

  get invalid() {
    const controls = ['phone', 'email', 'whatsapp'];

    const withValue = controls.filter(
      (name) => !!this.formData.get(name)?.value
    );

    // Caso 1: todos vacíos → inválido
    if (withValue.length === 0) return true;

    // Caso 2: al menos uno con valor inválido → inválido
    return withValue.some((name) => this.formData.get(name)?.invalid);
  }

  get isAdditional(): boolean {
    return this.formData.get('isAdditional')?.value!;
  }

  getCitizenContacts(): CitizenContact[] {
    return [
      {
        tipDoc: this.info?.tipDoc,
        docIde: this.info?.docIde,
        contactType: 'PHONE',
        isAdditional: this.isAdditional,
        value: this.formData.get('phone')?.value,
        status: true,
      },
      {
        tipDoc: this.info?.tipDoc,
        docIde: this.info?.docIde,
        contactType: 'EMAIL',
        isAdditional: this.isAdditional,
        value: this.formData.get('email')?.value,
        status: true,
      },
      {
        tipDoc: this.info?.tipDoc,
        docIde: this.info?.docIde,
        contactType: 'WHATSAPP',
        isAdditional: this.isAdditional,
        value: `wa.me/51${this.formData.get('whatsapp')?.value}`,
        status: true,
      },
    ]
      .map((item) => item as CitizenContact)
      .filter((item) => !!item.value);
  }

  onSubmit() {
    this.service.citizenContacts(this.getCitizenContacts()).subscribe({
      next: (data) => {
        this.msg.success('Contactos actualizados');
        this.ref.close(true);
      },
    });
  }
}
