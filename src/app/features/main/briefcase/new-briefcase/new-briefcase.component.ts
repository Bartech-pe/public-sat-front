import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  ElementRef,
  Inject,
  inject,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ColorPickerModule } from 'primeng/colorpicker';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { descargarPlantillaExcel } from '@utils/plantilla-excel';
import { FileSystemFileEntry, NgxFileDropEntry } from 'ngx-file-drop';
import { NgxFileDropModule } from 'ngx-file-drop';
import { CellValue, Workbook } from 'exceljs';
import { MessageGlobalService } from '@services/message-global.service';
import { UserStore } from '@stores/user.store';
import { User } from '@models/user.model';
import { CarteraStore } from '@stores/cartera.store';
import { Router } from '@angular/router';
import { DetalleCarteraStore } from '@stores/detalleCartera.store';
import { DetalleCartera } from '@models/detalleCartera.model';
import { DatePicker } from 'primeng/datepicker';
import { AreaStore } from '@stores/area.store';
import { OficinaStore } from '@stores/oficina.store';
import { Area } from '@models/area.model';
import { Oficina } from '@models/oficina.model';
import { SelectModule } from 'primeng/select';
import { FieldsetModule } from 'primeng/fieldset';
import { CarteraDetalleService } from '@services/detalleCartera.service';
import { convertToPeruTime } from '@utils/date.util';
import { ButtonCancelComponent } from '@shared/buttons/button-cancel/button-cancel.component';

@Component({
  selector: 'app-new-briefcase',
  imports: [
    TableModule,
    InputTextModule,
    CommonModule,
    ColorPickerModule,
    ReactiveFormsModule,
    CalendarModule,
    ButtonModule,
    FormsModule,
    FieldsetModule,
    BreadcrumbModule,
    NgxFileDropModule,
    DatePicker,
    SelectModule,
    ButtonCancelComponent,
  ],
  templateUrl: './new-briefcase.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``,
})
export class NewBriefcaseComponent implements OnInit {
  readonly userStore = inject(UserStore);

  readonly carteraStore = inject(CarteraStore);

  readonly detalleCarteraStore = inject(DetalleCarteraStore);

  readonly carteraDetalleService = inject(CarteraDetalleService);

  readonly areaStore = inject(AreaStore);

  readonly oficinaStore = inject(OficinaStore);

  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);
  formData!: FormGroup;

  get listUsers(): any[] {
    return this.userStore.items()!;
  }

  get listAreas(): Area[] {
    return this.areaStore.items();
  }

  get listOficinas(): Oficina[] {
    return this.oficinaStore
      .items()
      .filter((item) => item.idArea === this.formData.get('idArea')?.value);
  }

  get loading(): boolean {
    return this.carteraStore.loading();
  }

  id!: number;
  constructor(
    private fb: FormBuilder,
    private msg: MessageGlobalService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.formData = this.fb.group({
      name: [undefined, Validators.required],
      description: [undefined, Validators.required],
      idArea: [undefined, Validators.required],
      idOficina: [undefined, Validators.required],
      dateStart: [undefined, Validators.required],
      dateEnd: [undefined, Validators.required],
      amount: [0],
      status: [false],
    });

    this.userStore.loadAll();
    this.areaStore.loadAll();
    this.oficinaStore.loadAll();
  }

  private resetOnSuccessEffect = effect(() => {
    const item = this.carteraStore.selectedItem();
    const error = this.carteraStore.error();
    const action = this.carteraStore.lastAction();

    // Manejo de errores
    if (error) {
      console.log('error', error);
      this.msg.error(
        error ?? '¡Ups, ocurrió un error inesperado al guardar la cartera!'
      );
      return; // Salimos si hay un error
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'created' || action === 'updated') {
      this.msg.success(
        action === 'created'
          ? '¡Cartera creada exitosamente!'
          : '¡Cartera actualizada exitosamente!'
      );

      this.formData.reset({
        code: '',
        message: '',
      });

      this.carteraStore.clearSelected();
      this.detalleCarteraStore.clearSelected();
      this.ref.close(true);
      return;
    }
    this.columnas = [];
    this.previewData = [];
    this.nombreArchivo = '';

    // Si hay un item seleccionado, se carga en el formulario
    if (item) {
      this.id = item.id ?? null;
      this.formData.setValue({
        name: item.name ?? '',
        description: item.description ?? '',
        status: item.status ?? false,
        dateStart: new Date(item.dateStart) ?? null,
        dateEnd: new Date(item.dateEnd) ?? null,
        idArea: item.oficina.idArea,
        idOficina: item.idOficina,
        amount: item.amount ?? 0,
      });

      //this.detalleCarteraStore.loadByIdDetalle(this.id);
      this.carteraDetalleService
        .findAllByIdCartera(this.id)
        .subscribe((res) => {
          console.log('detalle cartera', res);

          const data = res.map((row: any): DetalleCartera => {
            return {
              idUser: row.user?.id,
              user: row.user,
              segmento: row.segmento,
              perfil: row.perfil,
              contribuyente: row.contribuyente,
              tipoContribuyente: row.tipoContribuyente,
              codigo: String(row.codigo),
              deuda: row.deuda || 0,
              estadoCaso: 'update',
              fecha: row.fecha,
              telefono1: row.telefono1,
              telefono2: row.telefono2,
              telefono3: row.telefono3,
              telefono4: row.telefono4,
              whatsapp: row.whatsapp,
              email: row.email,
            };
          });
          this.previewData = data;
        });
    } else {
      // No hay item seleccionado, se resetea el formulario
      this.formData.reset({
        name: '',
        description: '',
        status: false,
        dateStart: null,
        dateEnd: null,
        idArea: null,
        idOficina: null,
        amount: 0,
      });
    }
  });

  descargarPlantilla() {
    descargarPlantillaExcel();
  }

  columnas: string[] = [];
  previewData: DetalleCartera[] = [];
  nombreArchivo: string = '';
  //'PAGO',
  plantillaCabeceras: string[] = [
    'SECTORISTA',
    'SEGMENTO',
    'PERFIL',
    'CONTRIBUYENTE',
    'TIPO DE CONTRIBUYENTE',
    'CODIGO',
    'DEUDA',
    'TELEFONO 1',
    'TELEFONO 2',
    'TELEFONO 3',
    'TELEFONO 4',
    'WHATSAPP',
    'EMAIL',
  ];

  onFileDropped(files: NgxFileDropEntry[]) {
    const droppedFile = files[0];

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

        reader.onload = async (e: any) => {
          const arrayBuffer = e.target.result;
          const workbook = new Workbook();
          await workbook.xlsx.load(arrayBuffer);

          const worksheet = workbook.worksheets[0]; // Primera hoja
          const jsonData: any[] = [];

          // Obtener encabezados desde la primera fila
          const headerRow = worksheet.getRow(1);
          const headers: CellValue[] = Array.isArray(headerRow.values)
            ? headerRow.values.slice(1) // Omite el primer elemento vacío
            : [];

          // Recorrer filas desde la segunda en adelante
          worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber === 1) return; // Saltar encabezado

            const rowData: any = {};
            row.eachCell((cell, colNumber) => {
              const header = headers[colNumber - 1];
              const key = String(header); // Asegura que sea una clave válida
              rowData[key] = cell.value;
            });

            jsonData.push(rowData);
          });

          if (jsonData.length) {
            const columnasArchivo = headers.map((h) => h as string);

            // Verificamos si las columnas coinciden con la plantilla
            const coinciden = this.validarCabeceras(columnasArchivo);

            if (coinciden) {
              this.columnas = columnasArchivo;
              //this.previewData = jsonData;
              const data = jsonData.map((item): DetalleCartera => {
                const fechaPeru = new Date();

                const emailValue =
                  typeof item['EMAIL'] === 'object' && item['EMAIL']
                    ? item['EMAIL'].text || item['EMAIL'].email || undefined
                    : item['EMAIL'] || undefined;

                return {
                  user: { name: item['SECTORISTA'] } as User,
                  segmento: item['SEGMENTO'],
                  perfil: item['PERFIL'],
                  contribuyente: item['CONTRIBUYENTE'],
                  tipoContribuyente: item['TIPO DE CONTRIBUYENTE'],
                  codigo: String(item['CODIGO']),
                  deuda: parseFloat(item['DEUDA']) || 0,
                  estadoCaso: 'new',
                  fecha: fechaPeru,
                  telefono1: item['TELEFONO 1'],
                  telefono2: item['TELEFONO 2'],
                  telefono3: item['TELEFONO 3'],
                  telefono4: item['TELEFONO 4'],
                  whatsapp: item['WHATSAPP'],
                  email: emailValue,
                };
              });

              const invalidUsers = data.some(
                (d: DetalleCartera) =>
                  !d.user?.name ||
                  !this.listUsers.find(
                    (u: User) =>
                      u.name?.trim().toLowerCase() ===
                      d.user?.name?.trim().toLowerCase()
                  )
              );

              if (invalidUsers) {
                this.msg.confirm(
                  `<div class='px-4 py-2'>
                    <p class='text-center'> Se encontraron sectoristas no registrados o pertenecientes a otra oficina, solo tienes permitido asignar a miembros de tu propia oficina </p>
                    <p class='text-center'> Si decides continuar se registrará la cartera excluyendo estos sectoristas no validados. </p>
                  </div>`,
                  () => {
                    const arraydetallecartera: any[] = data
                      .filter(
                        (d: DetalleCartera) =>
                          d.user?.name &&
                          this.listUsers.find(
                            (u: User) =>
                              u.name?.trim().toLowerCase() ===
                              d.user?.name?.trim().toLowerCase()
                          )
                      )
                      .map((d: DetalleCartera) => {
                        const user = this.listUsers.find(
                          (u: User) =>
                            u.name?.trim().toLowerCase() ===
                            d.user?.name?.trim().toLowerCase()
                        );
                        d.idUser = user.id;
                        d.user = user;
                        return d;
                      });

                    arraydetallecartera.forEach((element) => {
                      this.previewData.push(element);
                    });

                    if (this.previewData.length === 0) {
                      this.msg.error('No se encontraron sectoritas válidos.');
                      this.columnas = [];
                      this.previewData = [];
                      this.nombreArchivo = '';
                    } else {
                      this.msg.warn(
                        'Archivo cargado, excluyendo sectoristas no encontrados.'
                      );
                    }
                  }
                );
              } else {
                const arraydetallecartera: any[] = data
                  .filter(
                    (d: DetalleCartera) =>
                      d.user?.name &&
                      this.listUsers.find(
                        (u: User) =>
                          u.name?.trim().toLowerCase() ===
                          d.user?.name?.trim().toLowerCase()
                      )
                  )
                  .map((d: DetalleCartera) => {
                    const user = this.listUsers.find(
                      (u: User) =>
                        u.name?.trim().toLowerCase() ===
                        d.user?.name?.trim().toLowerCase()
                    );
                    d.idUser = user.id;
                    d.user = user;
                    return d;
                  });

                arraydetallecartera.forEach((element) => {
                  this.previewData.push(element);
                });

                this.msg.success('Archivo válido, listo para registrar.');
              }
            } else {
              this.msg.info(
                'Las cabeceras del archivo no coinciden con la plantilla requerida.'
              );
              this.columnas = [];
              this.previewData = [];
              this.nombreArchivo = '';
            }
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

  validarCabeceras(cabeceras: string[]): boolean {
    const plantilla = this.plantillaCabeceras.map((c) =>
      c.trim().toLowerCase()
    );
    const archivo = cabeceras.map((c) => c.trim().toLowerCase());

    // Compara longitud e igualdad exacta (sin importar el orden)
    return (
      plantilla.length === archivo.length &&
      plantilla.every((col) => archivo.includes(col))
    );
  }

  eliminarArchivo() {
    this.nombreArchivo = '';
    this.columnas = [];
    this.previewData = [];
  }

  onCancel() {
    this.carteraStore.clearSelected();
    this.detalleCarteraStore.clearSelected();
    this.ref.close();
  }

  guardar() {
    if (this.formData.valid) {
      const { idArea, ...request } = this.formData.value;

      if (this.id) {
        request.amount = this.previewData.length;
        request.detalles = this.previewData.map((p) => {
          const { user, ...item } = p;
          return item;
        });

        this.carteraStore.update(this.id, { id: this.id, ...request });
      } else {
        if (!this.previewData || this.previewData.length === 0) {
          this.msg.error('Debe agregar al menos un registro antes de guardar.');
          return;
        }

        request.amount = this.previewData.length;
        request.detalles = this.previewData.map((p) => {
          const { user, ...item } = p;
          return item;
        });
        this.carteraStore.create(request);
      }
      //this.router.navigate(['/briefcase']);
    }
  }
}
