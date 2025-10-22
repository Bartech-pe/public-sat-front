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
import { Department } from '@models/department.model';
import { Office } from '@models/office.model';
import { Role } from '@models/role.model';
import { VicidialUser } from '@models/user.model';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { ButtonCancelComponent } from '@shared/buttons/button-cancel/button-cancel.component';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { DepartmentStore } from '@stores/department.store';
import { OfficeStore } from '@stores/office.store';
import { RoleStore } from '@stores/role.store';
import { UserStore } from '@stores/user.store';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { FieldsetModule } from 'primeng/fieldset';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { KeyFilterModule } from 'primeng/keyfilter';
import { AloSatService } from '@services/alo-sat.service';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-user-form',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ToggleSwitchModule,
    FieldsetModule,
    ButtonModule,
    SelectModule,
    KeyFilterModule,
    TooltipModule,
    CheckboxModule,
    ButtonCancelComponent,
    ButtonSaveComponent,
  ],
  templateUrl: './user-form.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``,
})
export class UserFormComponent implements OnInit {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly msg = inject(MessageGlobalService);

  readonly store = inject(UserStore);

  readonly departmentStore = inject(DepartmentStore);

  readonly officeStore = inject(OfficeStore);

  private readonly aloSatService = inject(AloSatService);

  formData = new FormGroup({
    name: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    displayName: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    email: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
    }),
    departmentId: new FormControl<number | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    officeId: new FormControl<number | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    roleId: new FormControl<number | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    vicidial: new FormGroup({
      username: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(20)],
      }),
      userPass: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(100),
        ],
      }),
      phoneLogin: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      phonePass: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(100),
        ],
      }),
      userLevel: new FormControl<number | undefined>(undefined, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      userGroup: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [Validators.required],
      }),
    }),
    status: new FormControl<boolean>(true, {
      nonNullable: true,
    }),
  });

  id!: number;
  vicidialId!: number;

  isVicidialUser: boolean = false;

  submited: boolean = false;

  readonly roleStore = inject(RoleStore);

  get listUsers(): Role[] {
    return this.roleStore.items();
  }

  get loading(): boolean {
    return this.store.loading();
  }

  get listDepartments(): Department[] {
    return this.departmentStore.items();
  }

  get listOffices(): Office[] {
    return this.officeStore
      .items()
      .filter(
        (item) => item.departmentId === this.formData.get('departmentId')?.value
      );
  }

  get isAloSat(): boolean {
    return this.formData.get('officeId')?.value == 1;
  }

  listUserGroups: { userGroup: string; groupName: string }[] = [];

  listLevel = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  editVicidialUser: boolean = false;

  private resetOnSuccessEffect = effect(() => {
    const item = this.store.selectedItem();
    const error = this.store.error();
    const action = this.store.lastAction();

    // Manejo de errores
    if (error) {
      console.log('error', error);
      this.msg.error(
        error ?? '¡Ups, ocurrió un error inesperado al guardar el usuario!'
      );
      return; // Salimos si hay un error
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'created' || action === 'updated') {
      this.msg.success(
        action === 'created'
          ? '¡Usuario creado exitosamente!'
          : '¡Usuario actualizado exitosamente!'
      );

      this.resetForm();

      this.store.clearSelected();
      this.ref.close(true);
      return;
    }

    // Si hay un item seleccionado, se carga en el formulario
    if (item && this.id != item.id) {
      this.id = item.id;
      this.formData.patchValue({
        name: item.name,
        displayName: item.displayName,
        email: item.email,
        password: item.password,
        departmentId: item?.office?.departmentId,
        officeId: item.officeId,
        roleId: item.roleId,
        status: item.status!,
      });
      if (item.vicidial) {
        this.vicidialId = item.vicidial.id;
        this.formData.patchValue({
          vicidial: {
            username: item.vicidial.username,
            userPass: item.vicidial.userPass,
            phoneLogin: item.vicidial.phoneLogin,
            phonePass: item.vicidial.phonePass,
            userLevel: item.vicidial.userLevel,
            userGroup: item.vicidial.userGroup,
          },
        });
        this.formData.get('vicidial')?.enable();
        this.isVicidialUser = true;
      }
    }
  });

  ngOnInit(): void {
    this.formData.get('vicidial')?.disable();
    this.roleStore.loadAll();
    this.departmentStore.loadAll();
    this.officeStore.loadAll();
    this.getUserGroups();

    this.formData.get('roleId')!.valueChanges.subscribe((roleId) => {
      const departmentControl = this.formData.get('departmentId')!;
      const officeControl = this.formData.get('officeId')!;

      if (roleId === 1) {
        // 🔒 Deshabilitar y quitar validadores
        departmentControl.setValue(undefined);
        departmentControl.disable();
        departmentControl.clearValidators();
        departmentControl.updateValueAndValidity();

        officeControl.setValue(undefined);
        officeControl.disable();
        officeControl.clearValidators();
        officeControl.updateValueAndValidity();
      } else {
        // 🔓 Habilitar y volver a agregar validadores

        departmentControl.enable();
        departmentControl.setValidators([Validators.required]);
        departmentControl.updateValueAndValidity();

        officeControl.enable();
        officeControl.setValidators([Validators.required]);
        officeControl.updateValueAndValidity();
      }
    });
  }

  getUserGroups() {
    this.aloSatService.findAllUserGroups().subscribe({
      next: (data) => {
        this.listUserGroups = data;
      },
    });
  }

  resetForm() {
    this.formData.reset({
      name: '',
      displayName: undefined,
      email: undefined,
      password: undefined,
      departmentId: undefined,
      officeId: undefined,
      roleId: undefined,
      status: true,
    });
  }

  get isActive(): boolean {
    return this.formData.get('status')?.value as boolean;
  }

  changeDepartment() {
    this.formData.get('officeId')?.setValue(undefined);
  }

  changeOffice() {
    if (this.isAloSat) {
      this.formData.get('vicidial')?.enable();
    } else {
      this.formData.get('vicidial')?.disable();
    }
  }

  get invalid(): boolean {
    return this.formData.invalid;
  }

  changeEmail() {
    if (!this.editVicidialUser) {
      this.formData
        .get('vicidial.username')
        ?.setValue(
          this.formData
            .get('email')
            ?.value?.replaceAll('@', '')
            .replaceAll('.', '')
        );
    }
  }

  changeVicidialUsername() {
    this.editVicidialUser =
      this.formData
        .get('email')
        ?.value?.replaceAll('@', '')
        .replaceAll('.', '') != this.formData.get('vicidial.username')?.value;
  }

  cleanUsername() {
    const control = this.formData.get('vicidial.username');
    if (!control) return;
    const value = control.value!;
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, '');
    // Solo actualiza si el valor cambió
    if (value !== cleaned) {
      this.formData
        .get('vicidial.username')
        ?.setValue(cleaned, { emitEvent: false });
    }
    this.changeVicidialUsername();
  }

  toggleVicidial() {
    if (this.isVicidialUser) {
      this.formData.get('vicidial')?.enable();
    } else {
      this.formData.get('vicidial')?.disable();
    }
  }

  onCancel() {
    this.store.clearSelected();
    this.ref.close(false);
  }

  onSubmit() {
    this.submited = true;
    const { departmentId, vicidial, ...form } = this.formData.value;
    if (this.id) {
      this.store.update(this.id, {
        id: this.id,
        ...form,
        vicidial: vicidial
          ? ({ ...vicidial, id: this.vicidialId } as VicidialUser)
          : undefined,
      });
    } else {
      this.store.create({
        ...form,
        vicidial: vicidial ? ({ ...vicidial } as VicidialUser) : undefined,
      });
    }
  }
}
