import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { StepsModule } from 'primeng/steps';
import { StepperModule } from 'primeng/stepper';
import { SkillStore } from '@stores/skill.store';
import { SelectModule } from 'primeng/select';
import { ButtonCancelComponent } from '@shared/buttons/button-cancel/button-cancel.component';

@Component({
  selector: 'app-skill-form',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SelectModule,
    InputTextModule,
    TextareaModule,
    ToggleSwitchModule,
    ButtonModule,
    StepperModule,
    StepsModule,
    ButtonCancelComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './skill-form.component.html',
  styles: ``,
})
export class SkillFormComponent implements OnInit {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly msg = inject(MessageGlobalService);

  readonly store = inject(SkillStore);

  formData = new FormGroup({
    name: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    category: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    status: new FormControl<boolean>(true, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  listCategorias = [
    'Todas las categorías',
    'Tributaria',
    'No tributaria',
    'Administrativa',
  ];

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
        error ?? '¡Ups, ocurrió un error inesperado al guardar la habilidad!'
      );
      return; // Salimos si hay un error
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'created' || action === 'updated') {
      this.msg.success(
        action === 'created'
          ? '¡Habilidad creada exitosamente!'
          : '¡Habilidad actualizada exitosamente!'
      );

      this.formData.reset({
        name: '',
        description: undefined,
        status: true,
      });

      this.store.clearSelected();
      this.ref.close(true);
      return;
    }

    // Si hay un item seleccionado, se carga en el formulario
    if (item) {
      this.id = item.id;
      this.formData.setValue({
        name: item.name ?? '',
        category: item.category ?? '',
        description: item.description ?? '',
        status: item.status!,
      });
    } else {
      // No hay item seleccionado, se resetea el formulario
      this.formData.reset({
        name: '',
        description: '',
        status: true,
      });
    }
  });

  ngOnInit(): void {}

  get isActive(): boolean {
    return this.formData.get('status')?.value as boolean;
  }

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
