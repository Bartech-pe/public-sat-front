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
import { MessageGlobalService } from '@services/message-global.service';
import { DropdownModule } from 'primeng/dropdown';
import { EditorModule } from 'primeng/editor';
import { InputSwitchModule } from 'primeng/inputswitch';
import { FieldsetModule } from 'primeng/fieldset';
import { ButtonCancelComponent } from '@shared/buttons/button-cancel/button-cancel.component';
import { TableModule } from 'primeng/table';
import { Select } from 'primeng/select';
import { NgxFileDropEntry, NgxFileDropModule } from 'ngx-file-drop';
import { Checkbox } from 'primeng/checkbox';
import { Dialog } from 'primeng/dialog';
import { EstadoCampania } from '@models/estado-campania.model';
import { AreaCampania } from '@models/area-campania.model';
import { AreaCampaniaStore } from '@stores/area-campania.store';
import { TipoCampaniaStore } from '@stores/tipo-campania.store';
import { EstadoCampaniaStore } from '@stores/estado-campania.store';
import { SmsCampaingService } from '@services/sms-campaing.service';
import { MessagePreview, ShowHeader } from '@models/sms-campaing';
import { User } from '@models/user.model';
import { AuthStore } from '@stores/auth.store';
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
    Checkbox,
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

  constructor(public config: DynamicDialogConfig){
     if (this.config.data) {
      this.editarCampania = true;
    } else {
      this.editarCampania = false;
    }
  }

  private readonly fb = inject(FormBuilder);
    readonly areaCampaniaStore = inject(AreaCampaniaStore);
    readonly estadoCampaniaStore = inject(EstadoCampaniaStore);
    readonly smsCampaingService = inject(SmsCampaingService)
      readonly authStore = inject(AuthStore);
    

  id!: number;
  formData!: FormGroup;
  visible: boolean = false;
   limit = signal(100);
  offset = signal(0);

  // Opciones de contactos
  contactos: ShowHeader[] = [];

  listaVistaPrevia = [
   
  ];

  columnas: string[] = [];
  previewData: any[] = [];
  nombreArchivo: string = '';
  codigoPais: string = '+51';
  countryCode:boolean=false
  rows:any[]=[]
  

  ngOnInit(): void {
    this.rows.length
    this.formData = this.fb.group({
      name: [undefined, Validators.required],
      senderId: [undefined, Validators.required],
      contact: [undefined, Validators.required],
      message: [undefined, Validators.required],
      countryCode: [this.countryCode],
      id_area_campania: [null, Validators.required],
      id_estado_campania: [null, Validators.required],
    });
    this.loadData();
    if(this.editarCampania){
      this.smsCampaingService.findOne(this.config.data).subscribe((res) => {
        if(res.showheaders){
          this.contactos = res.showheaders
        }
        this.formData.reset({
          name: res.nombre,
          senderId: res.senderId,
          message: res.message,
          countryCode: res.countryCode,
          id_estado_campania: res.id_estado_campania,
          id_area_campania: res.id_area_campania,
          contact:this.contactos.find((item)=>item.label==res.contact)?.value ?? ''
        });
        
        
      })
    }

  }

  uploadExcelFile(file:File) {
    this.smsCampaingService.readSMSExcel(file).subscribe((res)=>{
       this.contactos = res.showheaders
       this.rows = res.rows
    })
  }
  previewMessage(){
    const values = this.formData.getRawValue()
    const request:MessagePreview={
      rows: this.rows,
      message: values.message,
      contact: this.contactos.find((item)=>item.value==values.contact)?.label ?? ''
    }
    this.smsCampaingService.getMessagePreview(request).subscribe((res)=>{
       this.listaVistaPrevia = res
    });
  }

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  onDropZoneClick() {
    this.fileInput.nativeElement.click();
  }
   get estadoCampanias(): EstadoCampania[] {
      return this.estadoCampaniaStore.items()!;
    }
  
    get areaCampanias(): AreaCampania[] {
      return this.areaCampaniaStore.items()!;
    }
  
    
   loadData() {
    this.areaCampaniaStore.loadAll(this.limit(), this.offset());
    this.estadoCampaniaStore.loadAll(this.limit(), this.offset());
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
  }

  onCancel() {
    this.ref.close();
  }
  get userCurrent(): User {
      return this.authStore.user()!;
    }
  createCampaing(){ 
     const request = this.formData.getRawValue();
     if(this.editarCampania){
      const update={
        senderId: request.senderId,
        nombre: request.name,
        contact: this.contactos.find((item)=>item.value==request.contact)?.label ?? '',
        message: request.message,
        id_area_campania: request.id_area_campania,
        id_estado_campania: request.id_estado_campania,
        countryCode: request.countryCode,
      }
      this.smsCampaingService.update(this.config.data,update).subscribe((res)=>{})
       return;
     }
     const createBody={
        senderId: request.senderId,
        nombre: request.name,
        contact:this.contactos.find((item)=>item.value==request.contact)?.label ?? '',
        message: request.message,
        id_area_campania: request.id_area_campania,
        id_estado_campania: request.id_estado_campania,
        countryCode: request.countryCode,
        createUser :this.userCurrent.id,
        rows: this.rows
     }
    console.log('req',createBody)
     this.smsCampaingService.create(createBody).subscribe((res)=>{})

  }

  showDialog() {
    this.previewMessage()
    this.visible = true;
  }
}
