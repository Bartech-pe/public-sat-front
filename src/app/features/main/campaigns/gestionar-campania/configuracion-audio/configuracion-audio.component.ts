import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Campania } from '@models/campania.model';
import { Vicidiallists } from '@models/vicidial.model';
import { GlobalService } from '@services/global-app.service';
import { MessageGlobalService } from '@services/message-global.service';
import { VicidialService } from '@services/vicidial.service';
import { ButtonCancelComponent } from '@shared/buttons/button-cancel/button-cancel.component';
import { descargarPlantillaExcel, descargarPlantillaExcelAudio } from '@utils/plantilla-excel';
import { response, Router } from 'express';

import { FileSystemFileEntry, NgxFileDropEntry, NgxFileDropModule } from 'ngx-file-drop';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FieldsetModule } from 'primeng/fieldset';
import { InputTextModule } from 'primeng/inputtext';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-configuracion-audio',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgxFileDropModule,
    ButtonModule,
    FieldsetModule,
    InputTextModule,
    ButtonCancelComponent
  ],
  templateUrl: './configuracion-audio.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``
})

export class ConfiguracionAudioComponent {
      audioUrl: SafeUrl | null = null;
      audioBlob: Blob | null = null;
      campania!: Campania;
      formlist:any={
        list_id:null,
        list_name:'',
        list_description:'',
        campaign_id:'',
        active:'Y',
        dtoList:[]
      };
      public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);
      constructor(
        private globalService:GlobalService,
        private msg: MessageGlobalService,
        private sanitizer: DomSanitizer,
        public config: DynamicDialogConfig,
        private vicidialService: VicidialService,
      ){ 

      }

      ngOnInit(): void {
          if(this.config.data){
              if(this.config.data.campaniaId){ 
                  this.campania = this.config.data;
                  this.formlist.campaign_id= this.config.data.campaniaId;
              }

              // this.vicidialService.getAll('central/listas').subscribe(res=>{
              //   console.log(res);
              // })
          }
      }

      descargarPlantilla() {
        descargarPlantillaExcelAudio();
      }
      
      ttsText: string = '';
      columnas: string[] = [];
      previewData: any[] = [];
      nombreArchivo: string = '';
      uploadProgress = 0;

      onFileDropped(files: NgxFileDropEntry[]) {
        const droppedFile = files[0];
        this.formlist.dtoList = [];

        if (droppedFile.fileEntry.isFile) {
          const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
          this.nombreArchivo = droppedFile.relativePath;
          const ext = this.nombreArchivo.split('.').pop()?.toLowerCase();

          if (!['xlsx', 'xls', 'csv'].includes(ext!)) {
            this.msg.error('Formato no válido. Solo se permite .xlsx, .xls, .csv');
            return;
          }

          fileEntry.file((file: File) => {
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
                  this.msg.error(`El campo obligatorio "${field}" no está presente en el archivo.`);
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
                    status:'NEW'
                  });
                  filasValidas++;
                } else {
                  console.warn(`Fila ${index + 2} omitida: faltan datos obligatorios`);
                }
              });

              if (filasValidas === 0) {
                this.msg.error('No hay filas válidas con TELEFONO y OBLIGADO');
              } else {
                console.log('Datos válidos cargados en dtoList:', this.formlist.dtoList);
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

              // Reproducir automáticamente
              const audio = new Audio(url);
              audio.play();

              // También podrías permitir la descarga usando this.audioUrl
            },
            error: (err) => {
              console.error('Error al convertir texto:', err);
            }
        })
      }

      descargarAudio() {
        if (this.audioBlob) {
          const url = URL.createObjectURL(this.audioBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'mi-audio.wav'; // Puedes cambiar el nombre
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url); // Limpieza
        }
      }
      loading = false;
      CargarVicidial(){
         this.loading = true;
          if (!this.audioBlob) {
              this.msg.error('No hay audio para subir');
              return;
          }
          const randomNumber = Math.floor(Math.random() * 100); // entero entre 0 y 99999
          const nombre_archivo = `${this.campania.campaniaId}_${randomNumber}.wav`;
          if (this.audioBlob) {
              const file = new File([this.audioBlob], nombre_archivo, { type: 'audio/wav' });
              this.globalService.uploadAudio(file).subscribe({
                next: (res) => {
                  this.msg.success('subida exitosa audio para subir');
                  let requestVicidialEdit = {
                      campaign_name: this.campania.nombre,
                      survey_first_audio_file: nombre_archivo,
                  };

                  let campaniaId = this.campania.campaniaId;
                  if (!campaniaId) {
                    this.msg.error('No se puede editar la campaña: campaniaId está vacío o indefinido.');
                    return;
                  }
                  this.vicidialService
                      .editarCampania(campaniaId, requestVicidialEdit)
                      .subscribe((res) => { });
                  this.uploadProgress = 100;
                   this.loading = false;
                },
                error: (err) => {
                  console.error('Error al subir', err);
                   this.loading = false;
                }
              });
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

      guardarlead(){
       if (!this.formlist) {
          this.msg.error('No hay información de la lista para guardar');
          return;
        }

        // Validar list_id y list_name
        if (!this.formlist.list_id || !this.formlist.list_name?.trim()) {
          this.msg.error('Debe seleccionar una lista válida antes de guardar');
          return;
        }

        // Validar que dtoList tenga datos
        if (!this.formlist.dtoList || this.formlist.dtoList.length === 0) {
          this.msg.error('No hay leads para guardar');
          return;
        }

        this.vicidialService.create(this.formlist,'central/listas').subscribe({
          next: (res) => {
            console.log(res);
            if(res.status == "created"){
              this.msg.success('Leads guardados correctamente');
              // Limpiar dtoList si quieres
              this.formlist.dtoList = [];
              this.onCancel();
            }
           
          },
          error: (err) => {
            console.error('Error al guardar leads:', err);
            this.msg.error('Error al guardar leads');
          }
        });

      }

}
