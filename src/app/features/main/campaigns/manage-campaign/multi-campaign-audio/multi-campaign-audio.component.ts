import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Department } from '@models/department.model';
import { VicidialService } from '@services/vicidial.service';
import { ButtonCancelComponent } from '@shared/buttons/button-cancel/button-cancel.component';
import { DepartmentStore } from '@stores/department.store';
import { NgxFileDropModule } from 'ngx-file-drop';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { FieldsetModule } from 'primeng/fieldset';

import { TableModule } from 'primeng/table';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { AudioStoreService } from '@services/audio-store.service';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { Workbook } from 'exceljs';

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
    FileUploadModule,
    ButtonSaveComponent,
  ],
  templateUrl: './multi-campaign-audio.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MultiCampaignAudioComponent implements OnInit {
  // Datos mock (reemplaza con tu servicio)

  listCampaignVicidial: any = [];

  selectedCampaign: any;
  selectedArea: any;
  listId: string = '';
  name: string = '';
  variable: string = '';
  contact: string = '';
  description: string = '';
  messageText: string = '';
  excelHeaders: string[] = []; // Headers extraídos del Excel
  excelData: any[] = []; // Datos para preview (primer fila mock)
  loading = false;
  previewData: any[] = [];

  campaign: any;

  readonly departmentStore = inject(DepartmentStore);
  get departmentList(): Department[] {
    return this.departmentStore.items();
  }

  private readonly msg = inject(MessageGlobalService);

  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);
  constructor(
    private vicidialService: VicidialService,
    private audioStoreService: AudioStoreService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.departmentStore.loadAll();
    this.vicidialService.getlistCampaniaAll().subscribe((res) => {
      this.listCampaignVicidial = res;
    });
  }

  // Parse Excel en upload
  selectedFile: File | null = null;

  async onFileUpload(event: any) {
    const file = event.files[0];
    this.selectedFile = event.files[0];
    if (!file) return;

    this.loading = true;

    const reader = new FileReader();
    reader.onload = async (e: any) => {
      const arrayBuffer = e.target.result;

      try {
        // ----------------------------------------------------
        // Leer archivo con ExcelJS
        // ----------------------------------------------------
        const workbook = new Workbook();
        await workbook.xlsx.load(arrayBuffer);

        const worksheet = workbook.worksheets[0];
        if (!worksheet) {
          this.msg.error('El archivo no contiene hojas válidas');
          this.loading = false;
          return;
        }

        // Obtener la fila de encabezados
        const headerRow = worksheet.getRow(1);
        if (!headerRow || !headerRow.values) {
          this.msg.error('No se pudieron leer los encabezados del Excel');
          this.loading = false;
          return;
        }
        // Extraer encabezados, omitiendo el primer índice que es undefined
        this.excelHeaders = (headerRow.values as any[])
          .slice(1)
          .map((v) => (v ? v.toString() : ''));

        const jsonData: any[] = [];
        worksheet.eachRow((row: any, rowNumber: number) => {
          // Saltar encabezado
          if (rowNumber === 1) return;

          const rowValues = row.values.slice(1); // eliminar índice 0
          const obj: any = {};

          this.excelHeaders.forEach((header, index) => {
            obj[header] = rowValues[index] ?? '';
          });

          jsonData.push(obj);
        });

        // ----------------------------------------------------
        // Validar contenido
        // ----------------------------------------------------
        if (jsonData.length === 0) {
          this.msg.error('El archivo está vacío');
          this.loading = false;
          return;
        }

        this.previewData = jsonData;
        this.loading = false;
      } catch (error) {
        console.error('Error leyendo Excel con ExcelJS:', error);
        this.msg.error('No se pudo leer el archivo Excel.');
        this.loading = false;
      }
    };

    reader.readAsArrayBuffer(file);
  }

  @ViewChild('mensajeInput') mensajeInput!: ElementRef<HTMLTextAreaElement>;
  insertVariable(event: any) {
    const variable = event.value;
    if (!variable || !this.mensajeInput) return;

    const textarea = this.mensajeInput.nativeElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentMessage = this.messageText || '';

    // Inserta la variable donde está el cursor
    const newMessage = currentMessage.substring(0, start) + `[${variable}]`;
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

  async submitForm() {
    if (
      !this.selectedCampaign ||
      this.excelHeaders.length === 0 ||
      !this.selectedArea ||
      !this.listId ||
      !this.name ||
      !this.description
    ) {
      this.msg.warn('AL CAMPOS REQUERIDOS');
      return;
    }

    let request = {
      list_id: this.listId,
      list_name: this.name,
      list_description: this.description,
      campaign_id: this.selectedCampaign,
      active: 'N',
      type: 'M',
      departmentId: this.selectedArea,
      campaign_name: this.campaign?.campaign_name,
    };

    const campaignEmails = this.previewData.map((contacto: any) => ({
      script_text: this.renderTemplate(this.messageText, contacto),
      phone_number: contacto[this.contact],
      vicidial_lead_id: this.listId,
    }));

    /** ---------------------------
     *  EXCELJS IMPLEMENTATION
     * --------------------------- */
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('CampaignEmails');

    // Columnas automáticas según keys del JSON
    worksheet.columns = Object.keys(campaignEmails[0]).map((key) => ({
      header: key,
      key: key,
      width: 30,
    }));

    // Agregar todas las filas
    worksheet.addRows(campaignEmails);

    // Generar buffer
    const excelBuffer = await workbook.xlsx.writeBuffer();

    const fileName = `campaign_emails_${new Date().getTime()}.xlsx`;
    const file = new File([excelBuffer], fileName, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    // Enviar al servicio
    this.audioStoreService.createlistaMultiple(request, file).subscribe({
      next: (res) => {
        if (res.status === 'duplicate') {
          this.msg.warn(
            'El ID de la lista ya existe. Por favor, elige un identificador diferente.'
          );
        } else {
          this.msg.success('Los leads se guardaron correctamente.');
          this.onCancel();
        }
      },
      error: (err) => {},
    });
  }

  onCampaignChange(event: any) {
    const selectedCampaingId = event.value;
    if (selectedCampaingId) {
      this.campaign = this.listCampaignVicidial.find(
        (res: any) => res.campaign_id == selectedCampaingId
      );
    }
  }

  clearFile(fileUpload: any) {
    this.selectedFile = null;
    fileUpload.clear(); // limpia el input de PrimeNG
  }

  onCancel() {
    this.ref.close();
  }
}
