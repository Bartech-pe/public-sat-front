import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { EditorModule } from 'primeng/editor';
import { InputSwitchModule } from 'primeng/inputswitch';
import { FieldsetModule } from 'primeng/fieldset';
import { ButtonCancelComponent } from '@shared/buttons/button-cancel/button-cancel.component';
import { TableModule } from 'primeng/table';
import { Select } from 'primeng/select';
import { NgxFileDropModule } from 'ngx-file-drop';
import { Dialog } from 'primeng/dialog';
import { User } from '@models/user.model';
import { AuthStore } from '@stores/auth.store';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { SmsCampaignService } from '@services/sms-campaign.service';
import { ShowHeader } from '@models/sms-campaign.model';
import { CampaignState } from '@models/campaign-state.model';
import { CampaignStateStore } from '@stores/campaign-state.store';
import { DepartmentStore } from '@stores/department.store';
import { Department } from '@models/department.model';
import { Workbook } from 'exceljs';

@Component({
  selector: 'app-form-sms',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    DropdownModule,
    EditorModule,
    InputSwitchModule,
    DatePickerModule,
    ButtonModule,
    FieldsetModule,
    ButtonCancelComponent,
    TableModule,
    Select,
    NgxFileDropModule,
    Dialog,
  ],
  templateUrl: './form-sms.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``,
})
export class FormSmsComponent implements OnInit {
  @ViewChild('fileDropRef') fileDropRef: any;

  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);
  private readonly msg = inject(MessageGlobalService);
  editarCampania: boolean = true;
  charCount = 0;

  constructor(public config: DynamicDialogConfig) {
    if (this.config.data) {
      this.editarCampania = true;
    } else {
      this.editarCampania = false;
    }
  }

  private readonly fb = inject(FormBuilder);
  readonly campaignStateStore = inject(CampaignStateStore);
  readonly smsCampaignService = inject(SmsCampaignService);
  readonly departmentStore = inject(DepartmentStore);
  readonly authStore = inject(AuthStore);

  id!: number;
  formData!: FormGroup;
  visible: boolean = false;
  limit = signal(100);
  offset = signal(0);

  // Opciones de contactos
  contactos: ShowHeader[] = [];

  listaVistaPrevia: any[] = [];

  columnas: string[] = [];
  previewData: any[] = [];
  nombreArchivo: string = '';
  codigoPais: string = '+51';
  countryCode: boolean = false;
  rows: any[] = [];

  ngOnInit(): void {
    this.rows.length;
    this.formData = this.fb.group({
      name: [undefined, Validators.required],
      senderId: [undefined, Validators.required],
      contact: [{ value: undefined, disabled: true }, Validators.required],
      variable: [{ value: undefined, disabled: true }],
      message: [undefined, Validators.required],
      countryCode: [this.countryCode],
      id_area_campania: [null],
      id_estado_campania: [null],
    });
    this.loadData();
    if (this.editarCampania) {
      this.smsCampaignService.findOne(this.config.data).subscribe((res) => {
        if (res.showheaders) {
          this.contactos = res.showheaders;
        }
        // this.formData.reset({
        //   name: res.nombre,
        //   senderId: res.senderId,
        //   message: res.message,
        //   countryCode: res.countryCode,
        //   id_estado_campania: res.id_estado_campania,
        //   id_area_campania: res.id_area_campania,
        //   contact:
        //     this.contactos.find((item) => item.label == res.contact)?.value ??
        //     '',
        // });
      });
    }
  }

  uploadExcelFile(file: File) {
    this.smsCampaignService.readSMSExcel(file).subscribe({
      next: (res) => {
        this.contactos = res.showheaders;
        this.rows = res.rows;
        this.nombreArchivo = file.name;

        // Habilitar el select de contacto
        this.formData.get('contact')?.enable();
        this.formData.get('variable')?.enable();
        this.msg.success('¡Archivo cargado correctamente!');

        // (opcional) Resetear el valor anterior
        this.formData.get('contact')?.reset();
        this.formData.get('variable')?.reset();
      },
      error: (err) => {
        console.error('Error al leer el archivo', err);
        this.msg.error('¡No se pudo cargar el archivo!');
      },
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (!this.isExcelFile(file)) {
        console.error('Por favor selecciona un archivo Excel válido');
        return;
      }
      this.uploadExcelFile(file);
    }
  }

  eliminarArchivo() {
    this.nombreArchivo = '';
    this.columnas = [];
    this.previewData = [];
    this.contactos = [];
    this.msg.info('¡Archivo eliminado correctamente!');

    // Limpiar y deshabilitar el campo select
    const contactControl = this.formData.get('contact');
    contactControl?.reset();
    contactControl?.disable();

    const variableControl = this.formData.get('variable');
    variableControl?.reset();
    variableControl?.disable();

    this.fileInput.nativeElement.value = '';

    // Limpiar drop zone (solo visual)
    if (this.fileDropRef) {
      this.fileDropRef.files = []; // limpia la lista interna de ngx-file-drop
    }
  }

  previewMessage() {
    const values = this.formData.getRawValue();
    this.listaVistaPrevia = [];
    if (!values.message || !Array.isArray(this.rows)) return;

    this.listaVistaPrevia = this.rows.map((contacto: any) => ({
      message: this.renderTemplate(values.message, contacto),
      contact: contacto[values.contact],
    }));
  }

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  onDropZoneClick() {
    this.fileInput.nativeElement.click();
  }

  get CampaignList(): CampaignState[] {
    return this.campaignStateStore.items()!;
  }

  get departmentList(): Department[] {
    return this.departmentStore.items()!;
  }

  loadData() {
    this.departmentStore.loadAll(this.limit(), this.offset());
    this.campaignStateStore.loadAll(this.limit(), this.offset());
  }
  private isExcelFile(file: File): boolean {
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    return (
      validTypes.includes(file.type) ||
      file.name.endsWith('.xls') ||
      file.name.endsWith('.xlsx')
    );
  }

  onCancel() {
    this.ref.close();
  }

  get userCurrent(): User {
    return this.authStore.user()!;
  }

  async createCampaing() {
    if (this.formData.invalid) {
      this.msg.warn(
        'Por favor, completa todos los campos requeridos antes de continuar.'
      );
      this.formData.markAllAsTouched();
      return;
    }

    if (!this.listaVistaPrevia || this.listaVistaPrevia.length === 0) {
      this.msg.warn('Por favor, valide la lista antes de crear la campaña.');
      return;
    }

    const contactosInvalidos = this.listaVistaPrevia.filter(
      (c: any) => !c.contact || !c.message || c.message.trim() === ''
    );

    if (contactosInvalidos.length > 0) {
      this.msg.warn(
        'Algunos contactos no tienen número o mensaje. Por favor verifica la lista.'
      );
      return;
    }

    const campaignSMS = this.listaVistaPrevia.map((contacto: any) => ({
      codProceso: 1,
      codRemitente: 1,
      numTelDestino: contacto.contact.toString(),
      mensaje: contacto.message.trim(),
      codTipDocumento: null,
      valTipDocumento: null,
      nomTerminal: 'ABC_Terminal',
    }));

    try {
      // -------------------------------------------------------
      // Generar archivo Excel con EXCELJS
      // -------------------------------------------------------
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet('CampaignSMS');

      // Headers
      const headers = Object.keys(campaignSMS[0]);
      worksheet.addRow(headers);

      // Rows
      campaignSMS.forEach((row: any) => {
        worksheet.addRow(headers.map((h: string) => row[h]));
      });

      // Auto ancho de columnas
      headers.forEach((h: string, i: number) => {
        worksheet.getColumn(i + 1).width = Math.max(15, h.length + 5);
      });

      // Buffer del Excel
      const excelBuffer = await workbook.xlsx.writeBuffer();

      const fileName = `campaign_sms_${Date.now()}.xlsx`;
      const file = new File([excelBuffer], fileName, {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const request = this.formData.getRawValue();
      const formData = new FormData();
      formData.append('name', request.name.trim());
      formData.append('campaignStatus', '1');
      formData.append('sender', request.senderId.trim());
      formData.append('message', request.message.trim());
      formData.append(
        'totalRegistered',
        this.listaVistaPrevia.length.toString()
      );
      formData.append('file', file, file.name);

      // -------------------------------------------------------
      // Enviar al backend
      // -------------------------------------------------------
      this.smsCampaignService.createlistMulti(formData).subscribe({
        next: () => {
          this.msg.success('Campaña SMS creada y enviada exitosamente.');
          this.ref.close(true);
        },
        error: () => {
          this.msg.error(
            'Ocurrió un error al enviar la campaña. Intenta nuevamente.'
          );
        },
      });
    } catch (error) {
      console.error('Error generando archivo Excel:', error);
      this.msg.error('Error al generar el archivo Excel.');
    }
  }

  @ViewChild('mensajeInput') mensajeInput!: ElementRef<HTMLTextAreaElement>;
  insertVariable(event: any) {
    const variable = event.value;
    if (!variable || !this.mensajeInput) return;

    const textarea = this.mensajeInput.nativeElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentMessage = this.formData.get('message')?.value || '';

    // Inserta la variable donde está el cursor
    const newMessage = currentMessage.substring(0, start) + `[${variable}]`;
    currentMessage.substring(end);

    // Actualiza el formControl
    this.formData.patchValue({ message: newMessage });

    console.log(newMessage);
    // Vuelve a enfocar y coloca el cursor al final del texto insertado
    setTimeout(() => {
      textarea.focus();
      const cursorPosition = start + variable.length + 2;
      textarea.setSelectionRange(cursorPosition, cursorPosition);
    });

    // Limpia el select
    //this.selectedVariable = null;
  }

  private renderTemplate(template: string, contacto: any): string {
    return template.replace(/\[([^\]]+)\]/g, (_, variable) => {
      const key = variable.trim().toUpperCase();
      // Si el contacto tiene una propiedad con ese nombre, la reemplaza, si no deja vacío
      return contacto[key] ?? '';
    });
  }

  showDialog() {
    this.previewMessage();
    this.visible = true;
  }
}
