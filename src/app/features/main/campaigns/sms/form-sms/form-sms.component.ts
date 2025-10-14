import { mergeMap } from 'rxjs';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
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
  FormControl,
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
import { SmsCampaingService } from '@services/sms-campania.service';
import { MessagePreview, ShowHeader } from '@models/sms-campaing';
import { CampaignState } from '@models/campaign-state.model';
import { CampaignStateStore } from '@stores/campaign-state.store';
import { DepartmentStore } from '@stores/department.store';
import { Department } from '@models/department.model';
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
  readonly smsCampaingService = inject(SmsCampaingService);
  readonly departmentStore = inject(DepartmentStore);
  readonly authStore = inject(AuthStore);

  id!: number;
  formData!: FormGroup;
  visible: boolean = false;
  limit = signal(100);
  offset = signal(0);

  // Opciones de contactos
  contactos: ShowHeader[] = [];

  listaVistaPrevia:any[] = [];

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
      contact: [{ value: undefined, disabled: true },Validators.required],
      variable: [{ value: undefined, disabled: true }],
      message: [undefined, Validators.required],
      countryCode: [this.countryCode],
      id_area_campania: [null],
      id_estado_campania: [null],
    });
    this.loadData();
    if (this.editarCampania) {
      this.smsCampaingService.findOne(this.config.data).subscribe((res) => {
        if (res.showheaders) {
          this.contactos = res.showheaders;
        }
        this.formData.reset({
          name: res.nombre,
          senderId: res.senderId,
          message: res.message,
          countryCode: res.countryCode,
          id_estado_campania: res.id_estado_campania,
          id_area_campania: res.id_area_campania,
          contact:this.contactos.find((item) => item.label == res.contact)?.value ?? '',
        });
      });
    }
  }

  uploadExcelFile(file: File) {
    this.smsCampaingService.readSMSExcel(file).subscribe({
      next: (res) => {
        this.contactos = res.showheaders;
        this.rows = res.rows;
        this.nombreArchivo = file.name;

        // ✅ Habilitar el select de contacto
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
    contactControl?.reset(); // limpia el valor seleccionado
    contactControl?.disable(); // lo deshabilita nuevamente

    const variableControl = this.formData.get('variable');
    variableControl?.reset(); // limpia el valor seleccionado
    variableControl?.disable(); // lo deshabilita nuevamente
  }

  previewMessage() {
    const values = this.formData.getRawValue();

      if (!values.message || !Array.isArray(this.rows)) return;

      // const mensajes = this.rows.map((contacto) => ({
      //   message: this.renderTemplate(values.message, contacto),
      //   contact: this.contactos.find((item) => item.value == values.contact)?.label ?? ''
      // }));

      // console.log('Mensajes personalizados:', mensajes);

      // let quees= this.contactos.find((item) => item.value == values.contact)?.label ??  '';


      // console.log(quees);
      // //     '',)
      // this.listaVistaPrevia = mensajes;


    const request: MessagePreview = {
      rows: this.rows,
      message: values.message,
      contact:
        this.contactos.find((item) => item.value == values.contact)?.label ??
        '',
    };


    this.smsCampaingService.getMessagePreview(request).subscribe((res) => {
      this.listaVistaPrevia = res;
    });
  }

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  onDropZoneClick() {
    this.fileInput.nativeElement.click();
  }

  private renderTemplate(template: string, contacto: any): string {
    // Buscar todas las variables entre corchetes como [NOMBRE], [CORREO], [CELULAR], etc.
    return template.replace(/\[([^\]]+)\]/g, (_, variable) => {
      const key = variable.trim().toUpperCase();
      // Si el contacto tiene una propiedad con ese nombre, la reemplaza, si no deja vacío
      return contacto[key] ?? '';
    });
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

  createCampaing() {
    const request = this.formData.getRawValue();

    if (this.editarCampania) {
      const update = {
        senderId: request.senderId,
        name: request.name,
        contact: this.contactos.find((item) => item.value == request.contact)?.label ??  '',
        message: request.message,
        // departmentId: request.id_area_campania,
        // campaignStateId: request.id_estado_campania,
        countryCode: request.countryCode,
      };

      this.smsCampaingService.update(this.config.data, update).subscribe({
        next: () => {
          this.msg.success('Campaña SMS actualizada exitosamente');
          this.ref.close(true); // ✅ Se ejecuta correctamente
        },
        error: (err) => {
          this.msg.error('Error al actualizar la campaña SMS');
          console.error(err);
        },
      });

      return;
    }

    const createBody = {
      senderId: request.senderId,
      name: request.name,
      contact: this.contactos.find((item) => item.value == request.contact)?.label ??  '',
      message: request.message,
      // departmentId: request.id_area_campania,
      // campaignStateId: request.id_estado_campania,
      countryCode: false,
      createUser: this.userCurrent.id,
      rows: this.rows,
    };

    this.smsCampaingService.create(createBody).subscribe({
      next: (res) => {
        this.msg.success('Campaña SMS enviada exitosamente');
        this.ref.close(true);
      },
      error: (err) => {
        this.msg.error('Error al enviar la campaña');
        console.error(err);
      },
    });
  }

  @ViewChild('mensajeInput') mensajeInput!: ElementRef<HTMLTextAreaElement>
  insertVariable(event: any) {
    const variable = event.value;
    if (!variable || !this.mensajeInput) return;

    const textarea = this.mensajeInput.nativeElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentMessage = this.formData.get('message')?.value || '';

    // Inserta la variable donde está el cursor
    const newMessage =
      currentMessage.substring(0, start) +
     `[${variable}]`
      currentMessage.substring(end);

    // Actualiza el formControl
    this.formData.patchValue({ message: newMessage });

    console.log( newMessage)
    // Vuelve a enfocar y coloca el cursor al final del texto insertado
    setTimeout(() => {
      textarea.focus();
      const cursorPosition = start + variable.length + 2;
      textarea.setSelectionRange(cursorPosition, cursorPosition);
    });

    // Limpia el select
    //this.selectedVariable = null;
  }

  showDialog() {
    this.previewMessage();
    this.visible = true;
  }
}
