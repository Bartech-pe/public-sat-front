import { Component, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CardModule } from 'primeng/card';
import { UnifiedQuerySistemComponent } from '../../unified-query-system/unified-query-system.component';
import { ConsultTypeStore } from '@stores/consult-type.store';
import { TypeIdeDocStore } from '@stores/type-ide-doc.store';
import { ConsultType } from '@models/consult-type.modal';
import { TypeIdeDoc } from '@models/type-ide-doc.model';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CommonModule } from '@angular/common';
import { BtnCustomComponent } from '@shared/buttons/btn-custom/btn-custom.component';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { GenericAssistanceService } from '@services/generic-assistance.service';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { ButtonModule } from 'primeng/button';
import { TypeContactStore } from '@stores/type-contact.store';
import { TypeContact } from '@models/type-contact.modal';
import { DialogService } from 'primeng/dynamicdialog';
import { FormTypeContactComponent } from '../form-type-contact/form-type-contact.component';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { ReminderService } from '@services/reminder.service';
import { CreateReminderDto, Reminder } from '@models/reminder.model';

@Component({
  selector: 'app-register-assistance',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    SelectModule,
    InputTextModule,
    TextareaModule,
    DatePickerModule,
    ButtonModule,
    CheckboxModule,
    BtnCustomComponent,
    ButtonSaveComponent,
    UnifiedQuerySistemComponent,
  ],
  templateUrl: './register-assistance.component.html',
  styles: ``,
})
export class RegisterAssistanceComponent implements OnInit {
  private readonly dialogService = inject(DialogService);

  private readonly consultTypeStore = inject(ConsultTypeStore);

  private readonly typeContactStore = inject(TypeContactStore);

  private readonly typeIdeDocStore = inject(TypeIdeDocStore);

  private readonly genericAssistanceService = inject(GenericAssistanceService);
  private readonly reminderService = inject(ReminderService);

  private readonly msg = inject(MessageGlobalService);

  formDataAtencion = new FormGroup({
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
    docIde: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    tipDoc: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    contactType: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    contact: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  get consultTypeList(): ConsultType[] {
    return this.consultTypeStore.items().map((item) => ({
      ...item,
      label: `[${item.code}] ${item.name}`,
    }));
  }

  get typeIdeDocList(): TypeIdeDoc[] {
    return this.typeIdeDocStore.items();
  }

  get typeContactList(): TypeContact[] {
    return this.typeContactStore.items();
  }

  loading: boolean = false;
  minDate: Date = new Date();
  enableReminder: boolean = false;

  formReminder = new FormGroup({
    name: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    reminderAt: new FormControl<Date | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });
  ngOnInit(): void {
    this.consultTypeStore.loadAll();
    this.typeIdeDocStore.loadAll();
    this.typeContactStore.loadAll();
  }

  resetForm() {
    this.formDataAtencion.patchValue({
      name: undefined,
      detail: undefined,
      consultTypeCode: undefined,
      tipDoc: undefined,
      docIde: undefined,
      contactType: undefined,
      contact: undefined,
    });
    this.formReminder.patchValue({
      description: undefined,
      name: undefined,
      reminderAt: undefined,
    });
    this.enableReminder = false;
  }

  newConsultType() {
    const ref = this.dialogService.open(FormTypeContactComponent, {
      header: 'Nuevo tipo de contacto',
      styleClass: 'modal-md',
      modal: true,
      focusOnShow: false,
      dismissableMask: true,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      this.consultTypeStore.clearSelected();
      this.consultTypeStore.loadAll();
      // this.aloSatStore.getState();
    });
  }

  onSubmitAtencion() {
    const { contact, contactType, ...form } = this.formDataAtencion.value;

    if (this.enableReminder) {
      if (this.formReminder.invalid) {
        this.loading = false;
        this.msg.warn(
          'Formulario inválido, por favor llene los datos de recordatorio o desactive la opcion de establecer recordatorio.',
          'Registrar asistencia',
          2000
        );
        return;
      }
    }
    this.loading = true;

    this.genericAssistanceService
      .create({
        ...form,
        contact: {
          docIde: form.docIde!,
          tipDoc: form.tipDoc!,
          value: contact!,
          contactType: contactType!,
          isAdditional: false,
        },
      })
      .subscribe({
        next: (data) => {
          if (this.enableReminder) {
            const reminderDto: CreateReminderDto = {
              name: this.formReminder.value.name!,
              description: this.formReminder.value.description || undefined,
              reminderAt: this.formReminder.value.reminderAt!,
            };
            console.log(this.formReminder.value);
            this.reminderService.create(reminderDto).subscribe((x) => {});
          }
          this.loading = false;
          this.resetForm();
          this.msg.success('¡Resultado registrado y llamada finalizada!');
        },
        error: (e) => {
          this.loading = false;
          this.msg.error(
            e.message ?? 'Ocurrio un error al registrar la atención'
          );
        },
      });
  }
}
