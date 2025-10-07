import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonCancelComponent } from '@shared/buttons/button-cancel/button-cancel.component';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { FieldsetModule } from 'primeng/fieldset';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { EditorModule } from 'primeng/editor';
@Component({
  selector: 'app-email-template',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    FormsModule,
    TableModule,
    InputTextModule,
    BreadcrumbModule,
    // DatePicker,
    DropdownModule,
    FieldsetModule,
    ButtonCancelComponent,
    EditorModule
  ],
  templateUrl: './email-template.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``
})
export class EmailTemplateComponent {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  listVariable = [
    { id: '{{nombre}}', name: 'Nombre del cliente' },
    { id: '{{email}}', name: 'Correo electrónico' },
    { id: '{{fecha}}', name: 'Fecha actual' },
  ];

  editorModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],        // texto
      [{ list: 'ordered' }, { list: 'bullet' }],       // listas
      ['link', 'image'],                               // links e imágenes
      [{ align: [] }],                                 // alineación
      [{ color: [] }, { background: [] }],             // colores
      ['blockquote', 'code-block'],                    // blockquote, código
      ['clean'],                                       // limpiar formato
      ['table'],                                       // tablas (si está habilitado)
    ],
  };

  formData!: FormGroup;


  constructor(private fb: FormBuilder) {
    this.formData = this.fb.group({
      name: ['', Validators.required],
      variable: [null],
      template: ['<p>Bienvenido {{nombre}}</p>', Validators.required],
    });
  }

   insertVariable() {
    const variable = this.formData.get('variable')?.value;
    if (!variable) return;

    const currentValue = this.formData.get('template')?.value || '';
    const newValue = currentValue + ' ' + variable;
    this.formData.patchValue({ template: newValue });
  }

  saveTemplate(){
       console.log('form', this.formData.value);

    if (this.formData.valid) {
      const request = this.formData.getRawValue();

    }
  }

   onCancel() {
    this.ref.close();
  }
}
