import {
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
import { CalendarModule } from 'angular-calendar';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { FileUpload } from 'primeng/fileupload';
import { TextareaModule } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { Router } from '@angular/router';
import { Dialog } from 'primeng/dialog';
import { EditorModule } from 'primeng/editor';
import { MessageModule } from 'primeng/message';
import { MessageGlobalService } from '@services/generic/message-global.service';

@Component({
  selector: 'app-my-templates',
  imports: [
    FormsModule,
    ButtonModule,
    CalendarModule,
    DropdownModule,
    InputTextModule,
    InputTextModule,
    DatePickerModule,
    ReactiveFormsModule,
    FileUpload,
    TextareaModule,
    Select,
    Dialog,
    EditorModule,
    MessageModule,
  ],
  templateUrl: './my-templates.component.html',
  styles: [
    `
      .p-editor .p-editor-toolbar {
        background: #104275 !important;
        color: white;
      }
    `,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MyTemplatesComponent implements OnInit {
  fechaEnvio = new Date();
  horaEnvio = new Date();
  uploadedFiles: any[] = [];
  openEditor: boolean = false;
  text: string = '';

  remitentes = [
    { label: 'Prov: #01 - SAT CONTRIBUYENTES@SAT.GOB.PE', value: 'sat1' },
    { label: 'Prov: #04 - SAT CONTRIBUYENTES@SAT.GOB.PE', value: 'sat2' },
    { label: 'Prov: #05 - SAT CONTRIBUYENTES@SAT.GOB.PE', value: 'sat3' },
  ];

  formDataEncabezado = new FormGroup({
    asunto: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    idRemitente: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  formDataProgramEnvio = new FormGroup({
    fechaEnvio: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    horaEnvio: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  formDataPlantilla = new FormGroup({
    idPlantilla: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  formDataEnvioCampania = new FormGroup({
    idRemitente: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  private readonly msg = inject(MessageGlobalService);

  constructor(private router: Router) {}

  value!: string;

  ngOnInit(): void {}

  onUpload(event: any) {
    for (let file of event.files) {
      this.uploadedFiles.push(file);
    }
  }

  abrirEditor() {
    // window.open('/editor', '_blank');
    // this.router.navigate(['/editor']);
    this.openEditor = true;
  }

  onSubmit(form: any) {
    if (form.valid) {
      this.value = this.text;
      this.msg.success('Plantilla guardada con éxito');
      form.resetForm();
      this.openEditor = false;
    }
  }
}
