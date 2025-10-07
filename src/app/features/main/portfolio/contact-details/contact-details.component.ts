import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit } from '@angular/core';
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
import { PortfolioDetailStore } from '@stores/portfolio-detail.store';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { UserStore } from '@stores/user.store';
import { Department } from '@models/department.model';
import { Office } from '@models/office.model';
import { DepartmentStore } from '@stores/department.store';
import { OfficeStore } from '@stores/office.store';
import { SelectModule } from 'primeng/select';
import { User } from '@models/user.model';
import { ButtonModule } from 'primeng/button';

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
    ReactiveFormsModule,
    ButtonSaveComponent,
  ],
  templateUrl: './contact-details.component.html',
  styles: ``,
})
export class ContactDetailsComponent implements OnInit {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly store = inject(PortfolioDetailStore);

  readonly userStore = inject(UserStore);

  readonly officeStore = inject(OfficeStore);

  private readonly msg = inject(MessageGlobalService);

  formData = new FormGroup({
    officeId: new FormControl<number | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    userId: new FormControl<number | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    code: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    phone: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [],
    }),
    whatsapp: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [],
    }),
    email: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.email],
    }),
    channel: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    result: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  id?: number;

  get loading(): boolean {
    return this.store.loading();
  }

  get listUsers(): User[] {
    return this.userStore
      .items()
      .filter(
        (item) =>
          item.roleId !== 1 &&
          item.officeId === this.formData.get('officeId')?.value
      );
  }

  get listOffices(): Office[] {
    return this.officeStore.items();
  }

  listMetodos: MetodoContacto[] = [
    { type: 'Teléfono', label: 'Llamada telefónica' },
    { type: 'Whatsapp', label: 'Whatsapp' },
    { type: 'SMS', label: 'SMS' },
    { type: 'Email', label: 'Email' },
  ];

  listResultados: string[] = [
    'Contactado',
    'Enviado',
    'Sin respuesta/ No válido',
  ];

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
          ? '¡Rol creado exitosamente!'
          : '¡Rol actualizado exitosamente!'
      );

      this.store.clearSelected();
      this.ref.close(true);
      return;
    }

    // Si hay un item seleccionado, se carga en el formulario
    if (item && !this.id) {
      console.log('item', item);
      this.id = item.id;
      // this.formData.patchValue({
      //   phone1: item.phone1,
      //   phone2: item.phone2,
      //   phone3: item.phone3,
      //   phone4: item.phone4,
      //   whatsapp: item.whatsapp?.replace('wa.me/', ''),
      //   email: item.email,
      // });
    }
  });

  ngOnInit(): void {
    this.userStore.loadAll();
    this.officeStore.loadAll();
  }

  onSubmit() {
    // this.store.update(this.id, { id: this.id, ...form });
  }
}

interface MetodoContacto {
  type: string;
  label: string;
}
