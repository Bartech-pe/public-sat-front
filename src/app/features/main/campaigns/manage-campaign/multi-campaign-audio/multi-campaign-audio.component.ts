import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Department } from '@models/department.model';
import { VicidialService } from '@services/vicidial.service';
import { ButtonCancelComponent } from '@shared/buttons/button-cancel/button-cancel.component';
import { DepartmentStore } from '@stores/department.store';
import { NgxFileDropModule } from 'ngx-file-drop';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { FieldsetModule } from 'primeng/fieldset';

import { TableModule } from 'primeng/table';
import * as XLSX from 'xlsx';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { MessageGlobalService } from '@services/generic/message-global.service';


@Component({
  selector: 'app-multi-campaign-audio',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgxFileDropModule,
    ButtonModule,
    FieldsetModule,
    InputTextModule,
    DropdownModule,
    ButtonCancelComponent,
    DropdownModule,
    TableModule,
    FileUploadModule
  ],
  templateUrl: './multi-campaign-audio.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

})
export class MultiCampaignAudioComponent implements OnInit{
// Datos mock (reemplaza con tu servicio)

 listCampaignVicidial:any=[];

  selectedCampaign: any;
  selectedArea:any;
  listId: string = '';
  name: string = '';
  variable: string = '';
  contact: string = '';
  description: string = '';
  messageText: string = '';
  excelHeaders: string[] = [];  // Headers extraídos del Excel
  excelData: any[] = [];  // Datos para preview (primer fila mock)
  loading = false;
  previewData: { [key: string]: string } = {};  // Para preview del mensaje
  
  readonly departmentStore = inject(DepartmentStore);
  get departmentList(): Department[] {
      return this.departmentStore.items();
  }

   private readonly msg = inject(MessageGlobalService);
  constructor(
    
    private vicidialService: VicidialService, 
  ) {}

  ngOnInit() {this.loadData();}

  loadData() {
    this.departmentStore.loadAll();
    this.vicidialService.getlistCampaniaAll().subscribe(res=>{
      this.listCampaignVicidial = res;
    })

  }

  // Parse Excel en upload
  onFileUploads(event: any) {

  }
  onFileUpload(event: any) {

    const file = event.files[0];

    if (!file) return;

    this.loading = true;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Extrae headers (primera fila)
    const rawHeaders = jsonData[0];
    this.excelHeaders = Array.isArray(rawHeaders) ? (rawHeaders as string[]) : [];

     
      this.excelData = jsonData.slice(1);
      this.previewData = this.excelData[0] || {};  // Usa primera fila para preview

      this.loading = false;
     
    };
    reader.readAsArrayBuffer(file);
  }

  @ViewChild('mensajeInput') mensajeInput!: ElementRef<HTMLTextAreaElement>
  insertVariable(event: any) {
    const variable = event.value;
    if (!variable || !this.mensajeInput) return;

    const textarea = this.mensajeInput.nativeElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentMessage = this.messageText || '';

    // Inserta la variable donde está el cursor
    const newMessage =
      currentMessage.substring(0, start) +
     `[${variable}]`
      currentMessage.substring(end);

    // Actualiza el formControl
    this.messageText = newMessage;

    // Vuelve a enfocar y coloca el cursor al final del texto insertado
    setTimeout(() => {
      textarea.focus();
      const cursorPosition = start + variable.length + 2;
      textarea.setSelectionRange(cursorPosition, cursorPosition);
    });

    this.updatePreview();
  }

  insertVariableIphone(event: any){
      const variableIphone = event.value;

      if (!variableIphone) return;

      // Validar que sea numérico
      const esNumerico = /^[0-9]+$/.test(variableIphone);

      // Validar longitud máxima de 9 dígitos
      const longitudValida = variableIphone.toString().length <= 9;

      if (!esNumerico) {
  
        this.msg.warn('El valor debe ser numérico');
        this.contact = '';
        return;
      }

      if (!longitudValida) {
        this.msg.warn('El número no puede tener más de 9 dígitos');
        this.contact = '';
        return;
      }
  }

  // Preview del mensaje con variables resueltas
  updatePreview() {
    let preview = this.messageText;
    this.excelHeaders.forEach(header => {
      preview = preview.replace(new RegExp(`{{${header}}}`, 'g'), this.previewData[header] || '[Sin dato]');
    });
    //this.previewData.messagePreview = preview;  // Para binding en HTML
  }

  // Submit form (mock: envía a API)
  submitForm() {
    if (!this.selectedCampaign || this.excelHeaders.length === 0 || !this.selectedArea || !this.listId || !this.name || !this.description) {
     
      return;
    }


  }

  onCancel(){

  }
}
