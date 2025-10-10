import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, inject, signal, ViewChild } from '@angular/core';
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
import { TemplateEmailStore } from '@stores/template-emial';
import { TemplateEmailService } from '@services/template-email.service';
import { TemplateEmail } from '@models/template-email.model';
import { NgxFileDropModule } from 'ngx-file-drop';
import { downloadEmailExcel } from '@utils/plantilla-excel';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { ButtonDetailComponent } from '@shared/buttons/button-detail/button-detail.component';
import { ButtonCancelComponent } from '@shared/buttons/button-cancel/button-cancel.component';
import { AttachmentsEmail } from '@models/campaign-email.model';
import { DialogModule } from 'primeng/dialog';
import { CampaignEmailService } from '@services/campaign-email.service';
import { Console } from 'console';
import { CampaignEmailConfigService } from '@services/campaign-email-config.service';
interface Contacto {
  nombre: string;
  email: string;
}

@Component({
  selector: 'app-manage-email',
  imports: [CommonModule, ReactiveFormsModule, NgxFileDropModule, NgxFileDropModule, InputTextModule, DropdownModule,
    FormsModule, FileUploadModule, TableModule,DialogModule, EditorModule, ButtonModule, ButtonDetailComponent,ButtonCancelComponent],
  providers: [MessageService],
  templateUrl: './manage-email.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ManageEmailComponent {
  contactos = signal<Contacto[]>([]);
  previewHtml = signal<string>('');
  adjuntos = signal<File[]>([]);


  readonly templateEmailStore = inject(TemplateEmailStore);
  readonly templateEmailService = inject(TemplateEmailService);
  readonly campaignEmailService = inject(CampaignEmailService);
  readonly campaignEmailConfigService = inject(CampaignEmailConfigService);
  // Plantillas predefinidas
  plantillas: TemplateEmail[] = [];

  visibletemplate: boolean = false;
  emailForm!: FormGroup;

  templateshtml = '';

  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);
  constructor(
    private messageService: MessageService,
    private msg: MessageGlobalService,
    public config: DynamicDialogConfig,
    private fb: FormBuilder,) {

  }

  loadData() {
    this.templateEmailService.getAll().subscribe((res) => {
      if (res) {
        this.plantillas = res.data;
      }
    });
  }
  previewData: any[] = [];
  nombreArchivo: string = '';
  columnas: string[] = [];

  ngOnInit(): void {
    this.loadData();
    this.emailForm = this.fb.group({
      name: ['', Validators.required],
      asunto: ['', [Validators.required, Validators.minLength(5)]],
      remitente: ['', [Validators.required, Validators.email]],
      plantilla: ['', Validators.required]
    });
  }

  private isExcelFile(file: File): boolean {
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    return validTypes.includes(file.type) ||
      file.name.endsWith('.xls') ||
      file.name.endsWith('.xlsx');
  }

  descargarPlantilla() {
    downloadEmailExcel();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
     this.previewData = [];
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (!this.isExcelFile(file)) {
        return;
      }
       this.nombreArchivo = file.name;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Primera hoja
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convertir hoja a JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (jsonData.length === 0) {
          this.msg.error('El archivo está vacío');
          return;
        }

        // Validar columnas obligatorias
        const requiredFields = ['CORREO', 'NOMBRE'];
        if (typeof jsonData[0] !== 'object' || jsonData[0] === null) {
          this.msg.error('Formato del Excel inválido');
          return;
        }
        const sheetHeaders = Object.keys(jsonData[0]);

        for (const field of requiredFields) {
          if (!sheetHeaders.includes(field)) {
            this.msg.error(
              `El campo obligatorio "${field}" no está presente en el archivo.`
            );
            return;
          }
        }

        this.previewData = jsonData;

      };

      reader.readAsArrayBuffer(file);

    }
  }

  onFileDropped(onFileDropped: any) {}

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  onDropZoneClick() {
    this.fileInput.nativeElement.click();
  }

  eliminarArchivo() {
    this.nombreArchivo = '';
    this.columnas = [];
    this.previewData = [];
  }

  uploadExcelFile(file: File) {}

  updatePlantillaHtml(template: string) {
    const currentPlantilla = this.emailForm.value.plantilla;
    if (currentPlantilla) {
      this.emailForm.patchValue({
        plantilla: { ...currentPlantilla, template }
      });
    }
  }

  verResultados(template:any){
    const formhtml = this.emailForm.value;
    this.visibletemplate = true;
    this.templateshtml = this.renderTemplate(formhtml.plantilla?.template, template)
  }

  onUploadAdjuntos(event: any) {
    const nuevosAdjuntos: FileList = event.files || event.target.files;
    this.adjuntos.set([...this.adjuntos(), ...nuevosAdjuntos]);
    this.msg.success(`${nuevosAdjuntos.length} archivo(s) adjunto(s).`);
  }

  async  saveCamping(){

   

    if (!this.previewData.length) {
      this.msg.error('No hay archivos adjuntos para procesar.');
      return;
    }

    try {
      // Espera que todos los archivos se conviertan a base64

      const archivos = this.adjuntos();
      
       const nuevosAdjuntos = archivos.length? await Promise.all(
          archivos.map(async (file, index) => ({
            fileName: file.name,
            fileTypeCode: this.getFileTypeCode(file.name),
            order: index + 1,
            base64: await this.fileToBase64(file),
          }))
        )
      : [];

      // Obtener datos del formulario
      const form = this.emailForm.value;

      let resquesCamping= {
        name:form.name,
        idTemplate:form.plantilla?.id,
        campaignStatus: 1,
        totalRegistration: this.previewData.length
      }

      this.campaignEmailConfigService.create(resquesCamping).subscribe( respose => {
        if(respose){
              const campaignEmails = this.previewData.map((contacto: any) => ({
                idCampaignEmailConfig:respose.id,
                processCode: 2, // Ejemplo, puedes hacerlo dinámico
                senderCode: 2, // Ejemplo, puedes hacerlo dinámico
                to: contacto.CORREO,
                cc: contacto.CORREO,
                bcc: '',
                subject: form.asunto,
                message: this.renderTemplate(form.plantilla?.template, contacto), // personaliza usando el nombre, etc.
                documentTypeCode: null,
                documentTypeValue: null,
                terminalName: 'TERMINAL-01',
                attachments: nuevosAdjuntos.length ? nuevosAdjuntos : [], // opcional
              }));


              this.campaignEmailService.sendCampaignEmail(campaignEmails).subscribe( res=>{
                console.log(res)
                    this.ref.close();
              })
        }
      })

    } catch (error) {
      console.log('Error procesando archivos:', error);
    }



  }

  
  // Convierte un archivo a base64
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64 = e.target.result.split(',')[1]; // quitamos el prefijo data:
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  getFileTypeCode(fileName: string): number {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 8;
      case 'jpg':
      case 'jpeg':
      case 'png': return 1;
      case 'xls':
      case 'xlsx': return 2;
      case 'doc':
      case 'docx': return 3;
      case 'txt': return 4;
      default: return 0; // desconocido
    }
  }

  // private renderTemplate(template: string, contacto: any): string {
  //   return template
  //     .replace(/{{\s*nombre\s*}}/gi, contacto.NOMBRE || '')
  //     .replace(/{{\s*email\s*}}/gi, contacto.CORREO || '')
  //     .replace(/{{\s*celular\s*}}/gi, contacto.CELULAR || '');
  // }

  private renderTemplate(template: string, contacto: any): string {
    // Buscar todas las variables entre corchetes como [NOMBRE], [CORREO], [CELULAR], etc.
    return template.replace(/\[([^\]]+)\]/g, (_, variable) => {
      const key = variable.trim().toUpperCase();
      // Si el contacto tiene una propiedad con ese nombre, la reemplaza, si no deja vacío
      return contacto[key] ?? '';
    });
  }

  removeAdjunto(file: File) {
    this.adjuntos.set(this.adjuntos().filter(f => f !== file));
     this.msg.success('Adjunto eliminado'+ file.name );
  }

 

  
}
