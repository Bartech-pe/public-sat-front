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
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { GlobalService } from '@services/global-app.service';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { VicidialService } from '@services/vicidial.service';
import { ButtonCancelComponent } from '@shared/buttons/button-cancel/button-cancel.component';
import { descargarPlantillaExcelAudio } from '@utils/plantilla-excel';

import {
  FileSystemFileEntry,
  NgxFileDropEntry,
  NgxFileDropModule,
} from 'ngx-file-drop';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FieldsetModule } from 'primeng/fieldset';
import { InputTextModule } from 'primeng/inputtext';
import * as XLSX from 'xlsx';
import { Campaign } from '@models/campaign.model';
import { DropdownModule } from 'primeng/dropdown';
import { environment } from '@envs/environments';
import { TableModule } from 'primeng/table';
import { DepartmentStore } from '@stores/department.store';
import { Department } from '@models/department.model';
@Component({
  selector: 'app-audio-settings',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgxFileDropModule,
    ButtonModule,
    FieldsetModule,
    InputTextModule,
    ButtonCancelComponent,
    DropdownModule,
    TableModule,
  ],
  templateUrl: './audio-settings.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``,
})
export class AudioSettingsComponent {
  audioUrl: SafeUrl | null = null;
  audioBlob: Blob | null = null;
  campania!: any;
  formlist: any = {
    list_id: null,
    list_name: '',
    list_description: '',
    campaign_id: '',
    active: 'Y',
    departmentId:'',
    campaign_name:'',
    dtoList: [],
  };

  public files: NgxFileDropEntry[] = [];
  public selectedFile: File | null = null;
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  readonly departmentStore = inject(DepartmentStore); 

  get departmentList(): Department[] {
      return this.departmentStore.items();
  }

  listAudios:any=[];
  listListVicidial:any=[];
  listCampaignVicidial:any=[];

  ttsText: string = '';
  columnas: string[] = [];
  previewData: any[] = [];
  nameArchivo: string = '';
  uploadProgress = 0;
  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;
  audioUrlAudio: SafeUrl | null = null;
  vidicialId: string | null = null;
  constructor(
    private globalService: GlobalService,
    private msg: MessageGlobalService,
    private sanitizer: DomSanitizer,
    public config: DynamicDialogConfig,
    private vicidialService: VicidialService
  ) {}

  ngOnInit(): void {

    this.loadData();
  }

  loadData() {
    this.departmentStore.loadAll();
    this.vicidialService.getlistCampaniaAll().subscribe(res=>{
      this.listCampaignVicidial = res;
    })

    this.listAudio();
  }

  listAudio(){
     this.vicidialService.getAllAudio().subscribe(res=>{
      this.listAudios = res;
    })
  }

  descargarPlantilla() {
    descargarPlantillaExcelAudio();
  }

  onFileDropped(files: NgxFileDropEntry[]) {
    const droppedFile = files[0];
    this.formlist.dtoList = [];
    this.files = files;
    if (droppedFile.fileEntry.isFile) {
      
      const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
      this.nameArchivo = droppedFile.relativePath;
      const ext = this.nameArchivo.split('.').pop()?.toLowerCase();

      if (!['xlsx', 'xls', 'csv'].includes(ext!)) {
        this.msg.error('Formato no válido. Solo se permite .xlsx, .xls, .csv');
        return;
      }

      fileEntry.file((file: File) => {

        this.selectedFile = file;
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
          const requiredFields = ['TELEFONO', 'OBLIGADO'];
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

          let filasValidas = 0;

          // Procesar filas
          jsonData.forEach((element: any, index: number) => {
            const telefono = element.TELEFONO?.toString().trim();
            const obligado = element.OBLIGADO?.toString().trim();

            if (telefono && obligado) {
              this.formlist.dtoList.push({
                first_name: obligado,
                last_name: element.PLACA || '',
                phone_number: telefono,
                status: 'NEW',
              });
              filasValidas++;
            } else {
              console.warn(
                `Fila ${index + 2} omitida: faltan datos obligatorios`
              );
            }
          });

          if (filasValidas === 0) {
            this.msg.error('No hay filas válidas con TELEFONO y OBLIGADO');
          } else {
            console.log(
              'Datos válidos cargados en dtoList:',
              this.formlist.dtoList
            );
          }
        };

        reader.readAsArrayBuffer(file);
      });
    }
  }

  reproducirTexto() {
    const texto = (this.ttsText || '').trim();

    if (texto.length < 20) {
      this.msg.info('El texto debe tener al menos 20 caracteres.');
      return;
    }

    this.globalService.createTextoAudio(texto).subscribe({
      next: (blob) => {
        this.audioBlob = blob;
        const url = URL.createObjectURL(blob);
        this.audioUrl = this.sanitizer.bypassSecurityTrustUrl(url);
        this.audioUrlAudio = this.sanitizer.bypassSecurityTrustUrl(url);
        // Reproducir automáticamente
        const audio = new Audio(url);
        audio.play();

        // También podrías permitir la descarga usando this.audioUrl
      },
      error: (err) => {
        console.error('Error al convertir texto:', err);
      },
    });
  }

  descargarAudio() {
    if (this.audioBlob) {
      const url = URL.createObjectURL(this.audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mi-audio.wav'; // Puedes cambiar el name
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url); // Limpieza
    }
  }

  loading = false;
  async convertToPCM16Mono8k(blob: Blob): Promise<Blob> {
      const audioCtx = new AudioContext();
      const arrayBuffer = await blob.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      // Re-muestrear a 8 kHz
      const offlineCtx = new OfflineAudioContext(1, audioBuffer.duration * 8000, 8000);
      const source = offlineCtx.createBufferSource();
      source.buffer = audioBuffer;

      // Convertir a mono
      const merger = offlineCtx.createChannelMerger(1);
      source.connect(merger);
      merger.connect(offlineCtx.destination);

      source.start(0);
      const renderedBuffer = await offlineCtx.startRendering();

      // Convertir a WAV PCM 16-bit
      const wavBlob = this.audioBufferToWavBlob(renderedBuffer);

      return wavBlob;
  }

  audioBufferToWavBlob(buffer: AudioBuffer): Blob {
      const numOfChan = 1;
      const length = buffer.length * numOfChan * 2 + 44;
      const bufferData = new ArrayBuffer(length);
      const view = new DataView(bufferData);

      const writeString = (view: DataView, offset: number, str: string) => {
        for (let i = 0; i < str.length; i++) {
          view.setUint8(offset + i, str.charCodeAt(i));
        }
      };

      const sampleRate = 8000;
      const numSamples = buffer.length;
      const channelData = buffer.getChannelData(0);
      let offset = 0;

      // Escribir cabecera WAV
      writeString(view, offset, 'RIFF'); offset += 4;
      view.setUint32(offset, 36 + numSamples * 2, true); offset += 4;
      writeString(view, offset, 'WAVE'); offset += 4;
      writeString(view, offset, 'fmt '); offset += 4;
      view.setUint32(offset, 16, true); offset += 4;
      view.setUint16(offset, 1, true); offset += 2; // PCM
      view.setUint16(offset, 1, true); offset += 2; // Mono
      view.setUint32(offset, sampleRate, true); offset += 4;
      view.setUint32(offset, sampleRate * 2, true); offset += 4;
      view.setUint16(offset, 2, true); offset += 2;
      view.setUint16(offset, 16, true); offset += 2;
      writeString(view, offset, 'data'); offset += 4;
      view.setUint32(offset, numSamples * 2, true); offset += 4;

      let pos = 44;
      for (let i = 0; i < numSamples; i++, pos += 2) {
        let s = Math.max(-1, Math.min(1, channelData[i]));
        view.setInt16(pos, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      }

      return new Blob([view], { type: 'audio/wav' });
  }
  name_archivo:any;
  async CargarVicidial() {
    this.loading = true;

    try {
        const randomNumber = Math.floor(Math.random() * 100);
        const name_clear = `${this.campania.campaign_id}_${randomNumber}`;
        this.name_archivo = `${name_clear}.wav`;

        // Si hay un nuevo audio grabado o cargado
        if (this.audioBlob) {
          const wavBlob = await this.convertToPCM16Mono8k(this.audioBlob);
          const file = new File([wavBlob], this.name_archivo, { type: 'audio/wav' });

          this.globalService.uploadAudio(file).subscribe({
            next: (res) => {
              this.msg.success('Audio subido exitosamente.');
              this.audioBlob = null;
              // Luego de subir el audio, actualizamos la campaña
              this.actualizarCampania(name_clear);
            },
            error: (err) => {
              console.error('Error al subir el audio:', err);
              this.msg.error('Error al subir el audio.');
              this.loading = false;
            },
          });
        } else {
        
          this.msg.info('No se detectó nuevo audio, actualizando solo el nombre.');
          this.actualizarCampania(name_clear);
        }
      } catch (err) {
        console.error(err);
        this.msg.error('No se pudo procesar el audio.');
        this.loading = false;
      }
  }

  private actualizarCampania(name_clear: string) {
      const vdCampaignId = this.campania?.campaign_id;
      if (!vdCampaignId) {
        this.msg.error('No se puede editar la campaña: ID no válido.');
        this.loading = false;
        return;
      }

      if (!name_clear) {
        this.msg.error('el nombre de archivo no existe');
        this.loading = false;
        return;
      }

      const requestVicidialEdit = {
        survey_first_audio_file: name_clear,
      };

      this.vicidialService.editarCampania(vdCampaignId, requestVicidialEdit).subscribe({
        next: (res) => {
          this.msg.success('Campaña actualizada correctamente.');
          this.listAudio();
          this.uploadProgress = 100;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error al actualizar campaña:', err);
          this.msg.error('No se pudo actualizar la campaña.');
          this.loading = false;
        },
      });
  }

  reproducirAudio(){
    environment.urlTextoAudioreproducir
  }

  onCampaignChange(event: any) {
    const selectedCampaingId = event.value;
    if(selectedCampaingId){

        this.formlist.campaign_id = selectedCampaingId;

        const campaign = this.listCampaignVicidial.find(
          (res: any) => res.campaign_id == selectedCampaingId
        );

        if (campaign) {

          this.campania = campaign;

          console.log( this.campania);

          this.formlist.campaign_name = campaign.campaign_name; 
 
        }

        this.vicidialService.getByIdlistCampania(selectedCampaingId).subscribe(res => {
            if (res?.survey_first_audio_file) {
          
             this.audioUrlAudio =   this.sanitizer.bypassSecurityTrustUrl(`${environment.urlTextoAudioreproducir}${res.survey_first_audio_file}.wav`)
            } else {
              this.audioUrlAudio = '';
            }
        })
        
        this.vicidialService.getlistCampania(selectedCampaingId).subscribe(res=>{
          this.listListVicidial= res;
        })
    }
  }

  onAudioChange(event: any) {
    const selectedAudio = event.value;
    this.audioUrlAudio = environment.urlTextoAudioreproducir + selectedAudio;
    setTimeout(() => {
      this.audioPlayer?.nativeElement.play().catch(err => console.log('No se pudo reproducir automáticamente:', err));
    }, 100);
  }
 
  eliminarArchivo() {
    this.nameArchivo = '';
    this.columnas = [];
    this.previewData = [];
  }

  onCancel() {
    this.ref.close();
  }

  guardarlead() {

    if (!this.formlist) {
      this.msg.error('No hay información de la lista para guardar');
      return;
    }

      if (!this.selectedFile) {
      this.msg.error('Por favor selecciona un archivo primero');
      return;
    }

    if (!this.formlist.list_id || !this.formlist.list_name?.trim()) {
      this.msg.error('Debe seleccionar una lista válida antes de guardar');
      return;
    }

    if (!this.formlist.dtoList || this.formlist.dtoList.length === 0) {
      this.msg.error('No hay leads para guardar');
      return;
    }
    
    this.formlist.dtoList = [];
    this.vicidialService.createlista(this.formlist ,this.selectedFile,).subscribe({
      next: (res) => {
          this.msg.success('Leads guardados correctamente');
          this.onCancel();
      },
      error: (err) => {},
    });
  }
}
