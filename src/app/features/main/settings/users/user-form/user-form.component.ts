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
import { Area } from '@models/area.model';
import { Oficina } from '@models/oficina.model';
import { Role } from '@models/role.model';
import { UserVicidial } from '@models/user.model';
import { MessageGlobalService } from '@services/message-global.service';
import { AreaStore } from '@stores/area.store';
import { OficinaStore } from '@stores/oficina.store';
import { RoleStore } from '@stores/role.store';
import { UserStore } from '@stores/user.store';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { FieldsetModule } from 'primeng/fieldset';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'app-user-form',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    PasswordModule,
    ToggleSwitchModule,
    FieldsetModule,
    ButtonModule,
    SelectModule,
  ],
  templateUrl: './user-form.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``,
})
export class UserFormComponent implements OnInit {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly msg = inject(MessageGlobalService);

  readonly store = inject(UserStore);

  readonly areaStore = inject(AreaStore);

  readonly oficinaStore = inject(OficinaStore);

  formData = new FormGroup({
    name: new FormControl<string>('', {
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
    idArea: new FormControl<number | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    idOficina: new FormControl<number | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    idRole: new FormControl<number | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    vicidial: new FormGroup({
      username: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      userPass: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      phoneLogin: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      phonePass: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [Validators.required],
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

  submited: boolean = false;

  readonly roleStore = inject(RoleStore);

  get listUsers(): Role[] {
    return this.roleStore.items();
  }

  get loading(): boolean {
    return this.store.loading();
  }

  get listAreas(): Area[] {
    return this.areaStore.items();
  }

  get listOficinas(): Oficina[] {
    return this.oficinaStore
      .items()
      .filter((item) => item.idArea === this.formData.get('idArea')?.value);
  }

  private loadedItem = false;

  listLevel = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  editUserVicidial: boolean = false;

  private resetOnSuccessEffect = effect(() => {
    const item = this.store.selectedItem();
    const error = this.store.error();
    const action = this.store.lastAction();

    // Manejo de errores
    if (error) {
      console.log('error', error);
      this.msg.error(
        error ?? '¡Ups, ocurrió un error inesperado al guardar el agente!'
      );
      return; // Salimos si hay un error
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'created' || action === 'updated') {
      this.msg.success(
        action === 'created'
          ? '¡Agente creado exitosamente!'
          : '¡Agente actualizado exitosamente!'
      );

      this.resetForm();

      this.store.clearSelected();
      this.ref.close(true);
      return;
    }

    // Si hay un item seleccionado, se carga en el formulario
    if (item && !this.loadedItem) {
      this.id = item.id;
      this.formData.patchValue({
        name: item.name,
        displayName: item.displayName,
        email: item.email,
        password: item.password,
        idArea: item?.oficina?.idArea,
        idOficina: item.idOficina,
        idRole: item.idRole,
        status: item.status!,
      });
      if (item.vicidial) {
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
      }
      this.configurePasswordValidators();
      this.loadedItem = true;
    }
  });

  ngOnInit(): void {
    this.formData.get('vicidial')?.disable();
    this.roleStore.loadAll();
    this.areaStore.loadAll();
    this.oficinaStore.loadAll();
    // Si es crear (no hay id todavía), aplicamos validadores desde el inicio
    if (!this.id) {
      this.configurePasswordValidators();
    }
  }

  /** Configura los validadores de password según si es crear o editar */
  private configurePasswordValidators() {
    const pwdCtrl = this.formData.get('password');
    if (!pwdCtrl) return;

    if (this.id) {
      // Editar → opcional (pero si escribe algo, mínimo 8 caracteres)
      pwdCtrl.setValidators([Validators.minLength(8)]);
    } else {
      // Crear → obligatorio + mínimo 8 caracteres
      pwdCtrl.setValidators([Validators.required, Validators.minLength(8)]);
    }
    pwdCtrl.updateValueAndValidity();
  }

  resetForm() {
    this.formData.reset({
      name: '',
      displayName: undefined,
      email: undefined,
      password: undefined,
      idArea: undefined,
      idOficina: undefined,
      idRole: undefined,
      status: true,
    });
  }

  get isActive(): boolean {
    return this.formData.get('status')?.value as boolean;
  }

  changeArea() {
    this.formData.get('idOficina')?.setValue(undefined);
  }

  changeOficina() {
    if (this.formData.get('idOficina')?.value == 1) {
      this.formData.get('vicidial')?.enable();
    } else {
      this.formData.get('vicidial')?.disable();
    }
  }

  get invalid(): boolean {
    return this.formData.invalid;
  }

  changeEmail() {
    if (!this.editUserVicidial) {
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
    this.editUserVicidial =
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

  onSubmit() {
    this.submited = true;
    const { idArea, vicidial, ...form } = this.formData.value;
    if (this.id) {
      this.store.update(this.id, {
        id: this.id,
        ...form,
        vicidial: vicidial ? ({ ...vicidial } as UserVicidial) : undefined,
      });
    } else {
      this.store.create({
        ...form,
        vicidial: vicidial ? ({ ...vicidial } as UserVicidial) : undefined,
      });
    }
  }
}
