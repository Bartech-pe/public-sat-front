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
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { DepartmentStore } from '@stores/department.store';
import { Department } from '@models/department.model';
import { AudioStoreService } from '@services/audio-store.service';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { Workbook } from 'exceljs';
import { TtsService } from '@services/tts.service';

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
    SelectModule,
    TableModule,
    ButtonSaveComponent,
  ],
  templateUrl: './audio-settings.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``,
})
export class AudioSettingsComponent implements OnInit {
  @ViewChild('fileDropRef') fileDropRef: any;
  audioDirectory: string = '';
  audioUrl: SafeUrl | null = null;
  audioBlob: Blob | null = null;
  campania!: any;
  formlist: any = {
    list_id: null,
    list_name: '',
    list_description: '',
    campaign_id: '',
    active: 'N',
    type: 'I',
    departmentId: '',
    campaign_name: '',
  };

  dtoList: any[] = [];

  public files: NgxFileDropEntry[] = [];
  public selectedFile: File | null = null;
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly departmentStore = inject(DepartmentStore);

  private readonly ttsService = inject(TtsService);

  get departmentList(): Department[] {
    return this.departmentStore.items();
  }

  listAudios: any = [];
  listListVicidial: any = [];
  listCampaignVicidial: any = [];

  ttsText: string = '';
  columnas: string[] = [];
  previewData: any[] = [];
  nameArchivo: string = '';
  uploadProgress = 0;
  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;
  audioUrlAudio: SafeUrl | null = null;
  vidicialId: string | null = null;
  constructor(
    private msg: MessageGlobalService,
    private sanitizer: DomSanitizer,
    public config: DynamicDialogConfig,
    private vicidialService: VicidialService,
    private audioStoreService: AudioStoreService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.getDirectoryPath();
  }

  getDirectoryPath() {
    this.audioStoreService.getAudioStoreDirectory().subscribe({
      next: (res) => {
        this.audioDirectory = res.url;
      },
    });
  }

  loadData() {
    this.departmentStore.loadAll();
    this.vicidialService.getlistCampaniaAll().subscribe((res) => {
      this.listCampaignVicidial = res;
    });

    this.listAudio();
  }

  listAudio() {
    this.audioStoreService.getAllAudio().subscribe((res) => {
      this.listAudios = res;
    });
  }

  descargarPlantilla() {
    descargarPlantillaExcelAudio();
  }

  onFileDropped(files: NgxFileDropEntry[]) {
    const droppedFile = files[0];
    this.dtoList = [];
    this.files = files;

    if (droppedFile.fileEntry.isFile) {
      const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
      this.nameArchivo = droppedFile.relativePath;
      const ext = this.nameArchivo.split('.').pop()?.toLowerCase();

      if (!['xlsx', 'xls', 'csv'].includes(ext!)) {
        this.msg.error('Formato no válido. Solo se permite .xlsx, .xls, .csv');
        return;
      }

      fileEntry.file(async (file: File) => {
        this.selectedFile = file;

        const reader = new FileReader();

        reader.onload = async (e: any) => {
          const buffer = e.target.result;

          const workbook = new Workbook();

          try {
            // Cargar el archivo Excel
            await workbook.xlsx.load(buffer);
          } catch (err) {
            this.msg.error('No se pudo leer el archivo, formato incorrecto');
            return;
          }

          // Primera hoja
          const worksheet = workbook.worksheets[0];

          if (!worksheet) {
            this.msg.error('El archivo no contiene hojas');
            return;
          }

          // Extraer todas las filas en JSON (headers en la primera fila)
          const sheetHeaders: string[] = [];
          worksheet.getRow(1).eachCell((cell) => {
            sheetHeaders.push((cell.value || '').toString().trim());
          });

          // Validar columnas obligatorias
          const requiredFields = ['TELEFONO', 'OBLIGADO'];
          for (const field of requiredFields) {
            if (!sheetHeaders.includes(field)) {
              this.msg.error(
                `El campo obligatorio "${field}" no está presente en el archivo.`
              );
              return;
            }
          }

          const telefonoIndex = sheetHeaders.indexOf('TELEFONO') + 1;
          const obligadoIndex = sheetHeaders.indexOf('OBLIGADO') + 1;
          const placaIndex = sheetHeaders.indexOf('PLACA') + 1;

          let filasValidas = 0;

          // Recorrer filas desde la segunda (1 = header)
          worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Saltar encabezados

            const telefono = row
              .getCell(telefonoIndex)
              .value?.toString()
              .trim();
            const obligado = row
              .getCell(obligadoIndex)
              .value?.toString()
              .trim();
            const placa = placaIndex ? row.getCell(placaIndex).value || '' : '';

            if (telefono && obligado) {
              this.dtoList.push({
                first_name: obligado,
                last_name: placa.toString(),
                phone_number: telefono,
                status: 'NEW',
              });
              filasValidas++;
            }
          });

          if (filasValidas === 0) {
            this.msg.error('No hay filas válidas con TELEFONO y OBLIGADO');
          }
        };

        reader.readAsArrayBuffer(file);
      });
    }
  }

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  onDropZoneClick() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const fileEntry: NgxFileDropEntry = {
        relativePath: file.name,
        fileEntry: {
          isFile: true,
          isDirectory: false,
          name: file.name,
          fullPath: file.name,
          file: (callback: (file: File) => void) => callback(file),
        } as FileSystemFileEntry,
      };
      this.onFileDropped([fileEntry]); // Reuse existing logic
    }
  }

  reproducirTexto() {
    const text = (this.ttsText || '').trim();

    if (text.length < 20) {
      this.msg.info('El texto debe tener al menos 20 caracteres.');
      return;
    }

    this.ttsService.create({ text }).subscribe({
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
    const offlineCtx = new OfflineAudioContext(
      1,
      audioBuffer.duration * 8000,
      8000
    );
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
    writeString(view, offset, 'RIFF');
    offset += 4;
    view.setUint32(offset, 36 + numSamples * 2, true);
    offset += 4;
    writeString(view, offset, 'WAVE');
    offset += 4;
    writeString(view, offset, 'fmt ');
    offset += 4;
    view.setUint32(offset, 16, true);
    offset += 4;
    view.setUint16(offset, 1, true);
    offset += 2; // PCM
    view.setUint16(offset, 1, true);
    offset += 2; // Mono
    view.setUint32(offset, sampleRate, true);
    offset += 4;
    view.setUint32(offset, sampleRate * 2, true);
    offset += 4;
    view.setUint16(offset, 2, true);
    offset += 2;
    view.setUint16(offset, 16, true);
    offset += 2;
    writeString(view, offset, 'data');
    offset += 4;
    view.setUint32(offset, numSamples * 2, true);
    offset += 4;

    let pos = 44;
    for (let i = 0; i < numSamples; i++, pos += 2) {
      let s = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(pos, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }

    return new Blob([view], { type: 'audio/wav' });
  }
  name_archivo: any;
  async CargarVicidial() {
    this.loading = true;

    try {
      // Si hay un nuevo audio grabado o cargado
      if (this.audioBlob) {
        const randomNumber = Math.floor(Math.random() * 100);
        const name_clear = `${this.campania.campaign_id}_${randomNumber}`;
        this.name_archivo = `${name_clear}.wav`;

        const wavBlob = await this.convertToPCM16Mono8k(this.audioBlob);
        const file = new File([wavBlob], this.name_archivo, {
          type: 'audio/wav',
        });

        this.audioStoreService.uploadAudio(file).subscribe({
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
        const nameWithoutExtension = this.nameAudioOrigin
          .split('.')
          .slice(0, -1)
          .join('.');

        // this.msg.info(
        //   'No se detectó nuevo audio, actualizando solo el nombre.'
        // );
        this.actualizarCampania(nameWithoutExtension);
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

    this.vicidialService
      .editarCampania(vdCampaignId, requestVicidialEdit)
      .subscribe({
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

  onCampaignChange(event: any) {
    const selectedCampaingId = event.value;
    if (selectedCampaingId) {
      this.formlist.campaign_id = selectedCampaingId;

      const campaign = this.listCampaignVicidial.find(
        (res: any) => res.campaign_id == selectedCampaingId
      );

      if (campaign) {
        this.campania = campaign;
        this.formlist.campaign_name = campaign.campaign_name;
      }

      this.vicidialService
        .getByIdlistCampania(selectedCampaingId)
        .subscribe((res) => {
          if (res?.survey_first_audio_file) {
            this.audioUrlAudio = this.sanitizer.bypassSecurityTrustUrl(
              `${this.audioDirectory}${res.survey_first_audio_file}.wav`
            );
          } else {
            this.audioUrlAudio = '';
          }
        });

      this.audioStoreService
        .getlistCampania(selectedCampaingId)
        .subscribe((res) => {
          this.listListVicidial = res;
        });
    }
  }

  nameAudioOrigin: string = '';
  onAudioChange(event: any) {
    const selectedAudio = event.value;
    this.nameAudioOrigin = event.value;
    this.audioUrlAudio = this.audioDirectory + selectedAudio;
    setTimeout(() => {
      this.audioPlayer?.nativeElement
        .play()
        .catch((err) =>
          console.log('No se pudo reproducir automáticamente:', err)
        );
    }, 100);
  }

  eliminarArchivo() {
    this.nameArchivo = '';
    this.columnas = [];
    this.previewData = [];
    this.fileInput.nativeElement.value = '';

    if (this.fileDropRef) {
      this.fileDropRef.files = [];
    }
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

    this.audioStoreService
      .createlista(this.formlist, this.selectedFile)
      .subscribe({
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
        error: (err) => {
          console.error('Error al guardar la lista:', err);
          this.msg.error(
            'Ocurrió un error al guardar los leads. Intenta nuevamente más tarde.'
          );
        },
      });
  }
}
