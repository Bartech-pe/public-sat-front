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
import { SelectModule } from 'primeng/select';
import { FieldsetModule } from 'primeng/fieldset';

import { TableModule } from 'primeng/table';
import * as XLSX from 'xlsx';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { DynamicDialogRef } from 'primeng/dynamicdialog';


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
    SelectModule,
    ButtonCancelComponent,
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
  previewData: any[] = [];

  campaign:any;
  
  readonly departmentStore = inject(DepartmentStore);
  get departmentList(): Department[] {
      return this.departmentStore.items();
  }

  private readonly msg = inject(MessageGlobalService);
  
   public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);
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
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      const jsonDataHeader = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length === 0) {
          this.msg.error('El archivo está vacío');
          return;
      }

      // Extrae headers (primera fila)
    const rawHeaders = jsonDataHeader[0];
    this.excelHeaders = Array.isArray(rawHeaders) ? (rawHeaders as string[]) : [];
    console.log(this.excelHeaders)
    this.previewData = jsonData;
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

  updatePreview() {
    let preview = this.messageText;
    // this.excelHeaders.forEach(header => {
    //   preview = preview.replace(new RegExp(`{{${header}}}`, 'g'), this.previewData[header] || '[Sin dato]');
    // });
  }

  private renderTemplate(template: string, contacto: any): string {
    // Buscar todas las variables entre corchetes como [NOMBRE], [CORREO], [CELULAR], etc.
    return template.replace(/\[([^\]]+)\]/g, (_, variable) => {
      const key = variable.trim().toUpperCase();
      // Si el contacto tiene una propiedad con ese nombre, la reemplaza, si no deja vacío
      return contacto[key] ?? '';
    });
  }


  submitForm() {

     if (!this.selectedCampaign || this.excelHeaders.length === 0 || !this.selectedArea || !this.listId || !this.name || !this.description) {
      this.msg.warn("AL CAMPOS REQUERIDOS")
      return;
    }

    let request = {
        list_id: this.listId,
        list_name: this.name,
        list_description: this.description,
        campaign_id: this.selectedCampaign,
        active: 'N',
        departmentId:this.selectedArea,
        campaign_name:this.campaign?.campaign_name,
    }


    const campaignEmails = this.previewData.map((contacto: any) => ({
       script_text: this.renderTemplate(this.messageText, contacto),
       phone_number:contacto[this.contact], 
       vicidial_lead_id: this.listId,
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(campaignEmails);
    const workbook: XLSX.WorkBook = {
      Sheets: { CampaignEmails: worksheet },
      SheetNames: ['CampaignEmails'],
    };
 
 
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const fileName = `campaign_emails_${new Date().getTime()}.xlsx`;
    const file = new File([excelBuffer], fileName, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });


    this.vicidialService.createlistaMultiple(request, file).subscribe({
         next: (res) => {
             this.msg.success('Leads guardados correctamente');
             this.onCancel();
         },
         error: (err) => {},
       });
  }

  onCampaignChange(event: any) {
      const selectedCampaingId = event.value;
      if(selectedCampaingId){
          this.campaign = this.listCampaignVicidial.find(
            (res: any) => res.campaign_id == selectedCampaingId
          );
      }
  }

  onCancel(){this.ref.close();}
}
