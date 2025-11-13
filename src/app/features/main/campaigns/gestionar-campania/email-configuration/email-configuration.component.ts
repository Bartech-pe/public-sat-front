import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadModule } from 'primeng/fileupload';
import { TableModule } from 'primeng/table';
import { EditorModule } from 'primeng/editor';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import * as XLSX from 'xlsx';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DropdownModule } from 'primeng/dropdown';

interface Contacto {
  nombre: string;
  email: string;
}

interface Plantilla {
  nombre: string;
  html: string;
}

@Component({
  selector: 'app-email-configuration',
  imports: [CommonModule,ReactiveFormsModule,   InputTextModule,DropdownModule,
    FormsModule, FileUploadModule, TableModule, EditorModule, ButtonModule],
  providers: [MessageService],
  templateUrl: './email-configuration.component.html',
   schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EmailConfigurationComponent {

  contactos = signal<Contacto[]>([]);
  previewHtml = signal<string>('');
  adjuntos = signal<File[]>([]);

  // Plantillas predefinidas
  plantillas: Plantilla[] = [
    { nombre: 'Bienvenida', html: '<h1>¡Hola </p>' },
    { nombre: 'Promoción', html: '<h1>Oferta para </p>' },
    { nombre: 'Personalizada', html: '<p>Escribe tu plantilla aquí...</p>' }
  ];
  emailForm!: FormGroup;

  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);
  constructor(private messageService: MessageService,public config: DynamicDialogConfig,  private fb: FormBuilder,) {
   
  }

  ngOnInit(): void {
    this.emailForm = this.fb.group({
      asunto: ['', [Validators.required, Validators.minLength(5)]],
      remitente: ['', [Validators.required, Validators.email]],
      plantilla: [this.plantillas[0], Validators.required]
    });


  }

  updatePlantillaHtml(html: string) {
    const currentPlantilla = this.emailForm.value.plantilla;
    if (currentPlantilla) {
      this.emailForm.patchValue({
        plantilla: { ...currentPlantilla, html }
      });
    }
  }

  onUploadContactos(event: any) {
    const file = event.files[0];
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const excelData = XLSX.utils.sheet_to_json(worksheet, { header: ['nombre', 'email'], range: 1 });

      this.contactos.set(excelData.map((row: any) => ({
        nombre: row.nombre || 'Desconocido',
        email: row.email || 'sin@email.com'
      })));

      this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Contactos cargados correctamente.' });
    };
    reader.readAsBinaryString(file);
  }

  onUploadAdjuntos(event: any) {
    const nuevosAdjuntos = event.files;
    this.adjuntos.set([...this.adjuntos(), ...nuevosAdjuntos]);
    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: `${nuevosAdjuntos.length} archivo(s) adjunto(s).` });
  }

  removeAdjunto(file: File) {
    this.adjuntos.set(this.adjuntos().filter(f => f !== file));
    this.messageService.add({ severity: 'info', summary: 'Adjunto eliminado', detail: file.name });
  }

  previsualizarCorreo() {
    if (!this.emailForm.valid) {
      this.messageService.add({ severity: 'warn', summary: 'Error', detail: 'Completa el formulario correctamente.' });
      return;
    }
    if (this.contactos().length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Carga contactos primero.' });
      return;
    }

    const contactoEjemplo = this.contactos()[0];
    const plantillaSeleccionada = this.emailForm.value.plantilla?.html || '';
    let htmlPersonalizado = plantillaSeleccionada;
    htmlPersonalizado = htmlPersonalizado.replace(/{{nombre}}/g, contactoEjemplo.nombre);
    htmlPersonalizado = htmlPersonalizado.replace(/{{email}}/g, contactoEjemplo.email);
    this.previewHtml.set(htmlPersonalizado);
  }
}
