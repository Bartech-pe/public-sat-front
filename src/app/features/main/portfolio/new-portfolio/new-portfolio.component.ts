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
import { Workbook } from 'exceljs';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { UserStore } from '@stores/user.store';
import { User } from '@models/user.model';
import { DatePicker } from 'primeng/datepicker';
import { DepartmentStore } from '@stores/department.store';
import { OfficeStore } from '@stores/office.store';
import { Department } from '@models/department.model';
import { Office } from '@models/office.model';
import { SelectModule } from 'primeng/select';
import { FieldsetModule } from 'primeng/fieldset';
import { BlockUIModule } from 'primeng/blockui';
import { ButtonCancelComponent } from '@shared/buttons/button-cancel/button-cancel.component';
import { PortfolioDetailStore } from '@stores/portfolio-detail.store';
import { PortfolioDetailService } from '@services/portfolio-detail.service';
import { PortfolioDetail } from '@models/portfolio-detail.model';
import { PortfolioStore } from '@stores/portfolio.store';
import { CitizenContact } from '@models/citizen.model';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { PaginatorComponent } from '@shared/paginator/paginator.component';

@Component({
  selector: 'app-new-portfolio',
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
    BlockUIModule,
    ButtonSaveComponent,
    ButtonCancelComponent,
    PaginatorComponent,
  ],
  templateUrl: './new-portfolio.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``,
})
export class NewPortfolioComponent implements OnInit {
  readonly userStore = inject(UserStore);

  readonly portfolioStore = inject(PortfolioStore);

  readonly portfolioDetailStore = inject(PortfolioDetailStore);

  readonly portfolioDetailService = inject(PortfolioDetailService);

  // readonly portfolioService = inject(PortfolioService);

  readonly areaStore = inject(DepartmentStore);

  readonly officeStore = inject(OfficeStore);

  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);
  formData!: FormGroup;

  get listUsers(): any[] {
    return this.userStore.items()!;
  }

  get listDepartments(): Department[] {
    return this.areaStore.items();
  }

  get listOffices(): Office[] {
    return this.officeStore
      .items()
      .filter(
        (item) => item.departmentId === this.formData.get('departmentId')?.value
      );
  }

  get loading(): boolean {
    return this.portfolioStore.loading();
  }

  columnas: string[] = [];

  nombreArchivo: string = '';
  loadingFile: boolean = false;
  //'PAGO',
  plantillaCabeceras: string[] = [
    'SECTORISTA',
    'SEGMENTO',
    'PERFIL',
    'CONTRIBUYENTE',
    'TIPO DE CONTRIBUYENTE',
    'TIPO DOC. IDE.',
    'N° DOC. IDE.',
    'CODIGO DE CONTRIBUYENTE',
    'DEUDA',
    'TELEFONO 1',
    'TELEFONO 2',
    'TELEFONO 3',
    'TELEFONO 4',
    'WHATSAPP',
    'EMAIL',
  ];
  public selectedFile: File | null = null;
  public files: NgxFileDropEntry[] = [];

  limit = signal(10);
  offset = signal(0);
  totalItems: number = 0;

  limitPreview = signal(10);
  offsetPreview = signal(0);
  totalItemsPreview: number = 0;

  previewDataAll: PortfolioDetail[] = [];
  previewData: PortfolioDetail[] = [];

  portfolioDetail: PortfolioDetail[] = [];

  id!: number;
  constructor(private fb: FormBuilder, private msg: MessageGlobalService) {}

  ngOnInit(): void {
    this.formData = this.fb.group({
      name: [undefined, Validators.required],
      description: [undefined, Validators.required],
      departmentId: [undefined, Validators.required],
      officeId: [undefined, Validators.required],
      dateStart: [undefined, Validators.required],
      dateEnd: [undefined, Validators.required],
    });

    this.userStore.loadAll();
    this.areaStore.loadAll();
    this.officeStore.loadAll();
  }

  private resetOnSuccessEffect = effect(() => {
    const item = this.portfolioStore.selectedItem();
    const error = this.portfolioStore.error();
    const action = this.portfolioStore.lastAction();

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

      this.portfolioStore.clearSelected();
      this.portfolioDetailStore.clearSelected();
      this.ref.close(true);
      return;
    }

    // Si hay un item seleccionado, se carga en el formulario
    if (item && !this.id) {
      this.columnas = [];
      this.previewData = [];
      this.previewDataAll = [];
      this.nombreArchivo = '';
      this.id = item.id ?? null;
      this.formData.setValue({
        name: item.name,
        description: item.description,
        dateStart: new Date(item.dateStart),
        dateEnd: new Date(item.dateEnd),
        departmentId: item?.office?.departmentId,
        officeId: item.officeId,
      });

      this.loadDataPortfolioDetail();

      // const data = item.detalles.map((row: any): PortfolioDetail => {
      //   return {
      //     id: row.id,
      //     userId: row.user?.id,
      //     user: row.user,
      //     segment: row.segment,
      //     profile: row.profile,
      //     taxpayerName: row.taxpayerName,
      //     taxpayerType: row.taxpayerType,
      //     tipDoc: row.tipDoc,
      //     docIde: row.docIde,
      //     code: row.code,
      //     debt: row.debt || 0,
      //     citizenContacts: row.citizenContacts,
      //   };
      // });
      // this.previewData = data;
    }
  });

  loadDataPortfolioDetail() {
    this.portfolioDetailService
      .findAllByPortfolioId(this.id!, this.limit(), this.offset())
      .subscribe({
        next: (res) => {
          this.portfolioDetail = res.data;
          this.totalItems = res.total ?? 0;
        },
      });
  }

  onPageChange(event: { limit: number; offset: number }) {
    console.log('event', event);
    this.limit.set(event.limit);
    this.offset.set(event.offset);
    this.loadDataPortfolioDetail();
  }

  filterPreviewData() {
    this.totalItemsPreview = this.previewDataAll.length;
    this.previewData = this.previewDataAll.slice(
      this.offsetPreview(),
      this.offsetPreview() + this.limitPreview()
    );
  }

  onPageChangePreview(event: { limit: number; offset: number }) {
    console.log('event', event);
    this.limitPreview.set(event.limit);
    this.offsetPreview.set(event.offset);
    this.filterPreviewData();
  }

  descargarPlantilla() {
    descargarPlantillaExcel();
  }

  // onFileDropped(files: NgxFileDropEntry[]) {
  //   const droppedFile = files[0];
  //   this.files = files;
  //   if (droppedFile.fileEntry.isFile) {
  //     const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
  //     this.nombreArchivo = droppedFile.relativePath;
  //     const ext = this.nombreArchivo.split('.').pop()?.toLowerCase();
  //     if (!['xlsx', 'xls', 'csv'].includes(ext!)) {
  //       this.msg.error('Formato no válido. Solo se permite .xlsx, .xls, .csv');
  //       return;
  //     }

  //     fileEntry.file((file: File) => {
  //       const reader = new FileReader();
  //       this.selectedFile = file;
  //       reader.onload = async (e: any) => {
  //         const arrayBuffer = e.target.result;
  //         const workbook = new Workbook();
  //         await workbook.xlsx.load(arrayBuffer);

  //         const worksheet = workbook.worksheets[0]; // Primera hoja
  //         const jsonData: any[] = [];

  //         // Obtener encabezados desde la primera fila
  //         const headerRow = worksheet.getRow(1);
  //         const headers: CellValue[] = Array.isArray(headerRow.values)
  //           ? headerRow.values.slice(1) // Omite el primer elemento vacío
  //           : [];

  //         // Recorrer filas desde la segunda en adelante
  //         worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
  //           if (rowNumber === 1) return; // Saltar encabezado

  //           const rowData: any = {};
  //           row.eachCell((cell, colNumber) => {
  //             const header = headers[colNumber - 1];
  //             const key = String(header); // Asegura que sea una clave válida
  //             rowData[key] = cell.value;
  //           });

  //           jsonData.push(rowData);
  //         });

  //         if (jsonData.length) {
  //           const columnasArchivo = headers.map((h) => h as string);

  //           // Verificamos si las columnas coinciden con la plantilla
  //           const coinciden = this.validarCabeceras(columnasArchivo);

  //           if (coinciden) {
  //             this.columnas = columnasArchivo;
  //             //this.previewData = jsonData;
  //             const data = jsonData.map((item): PortfolioDetail => {
  //               const citizenContacts: CitizenContact[] =
  //                 this.getCitizenContacts(item);
  //               return {
  //                 user: { name: item['SECTORISTA'] } as User,
  //                 segment: item['SEGMENTO'],
  //                 profile: item['PERFIL'],
  //                 taxpayerName: item['CONTRIBUYENTE'],
  //                 taxpayerType: item['TIPO DE CONTRIBUYENTE'],
  //                 tipDoc: item['TIPO DOC. IDE.'],
  //                 docIde: item['N° DOC. IDE.'],
  //                 code: String(item['CODIGO DE CONTRIBUYENTE']),
  //                 debt: parseFloat(item['DEUDA']) || 0,
  //                 citizenContacts,
  //               };
  //             });

  //             const invaluserIds = data.some(
  //               (d: PortfolioDetail) =>
  //                 !d.user?.name ||
  //                 !this.listUsers.find(
  //                   (u: User) =>
  //                     u.name?.trim().toLowerCase() ===
  //                     d.user?.name?.trim().toLowerCase()
  //                 )
  //             );

  //             if (invaluserIds) {
  //               this.msg.confirm(
  //                 `<div class='px-4 py-2'>
  //                   <p class='text-center'> Se encontraron sectoristas no registrados o pertenecientes a otra office, solo tienes permitido asignar a miembros de tu propia office </p>
  //                   <p class='text-center'> Si decides continuar se registrará la cartera excluyendo estos sectoristas no validados. </p>
  //                 </div>`,
  //                 () => {
  //                   this.previewDataAll = data
  //                     .filter(
  //                       (d: PortfolioDetail) =>
  //                         d.user?.name &&
  //                         this.listUsers.find(
  //                           (u: User) =>
  //                             u.name?.trim().toLowerCase() ===
  //                             d.user?.name?.trim().toLowerCase()
  //                         )
  //                     )
  //                     .map((d: PortfolioDetail) => {
  //                       const user = this.listUsers.find(
  //                         (u: User) =>
  //                           u.name?.trim().toLowerCase() ===
  //                           d.user?.name?.trim().toLowerCase()
  //                       );
  //                       d.userId = user.id;
  //                       d.user = user;
  //                       return d;
  //                     });

  //                   if (this.previewDataAll.length === 0) {
  //                     this.msg.error('No se encontraron sectoritas válidos.');
  //                     this.columnas = [];
  //                     this.previewDataAll = [];
  //                     this.previewData = [];
  //                     this.nombreArchivo = '';
  //                   } else {
  //                     this.filterPreviewData();
  //                     this.msg.warn(
  //                       'Archivo cargado, excluyendo sectoristas no encontrados.'
  //                     );
  //                   }
  //                 }
  //               );
  //             } else {
  //               this.previewDataAll = data
  //                 .filter(
  //                   (d: PortfolioDetail) =>
  //                     d.user?.name &&
  //                     this.listUsers.find(
  //                       (u: User) =>
  //                         u.name?.trim().toLowerCase() ===
  //                         d.user?.name?.trim().toLowerCase()
  //                     )
  //                 )
  //                 .map((d: PortfolioDetail) => {
  //                   const user = this.listUsers.find(
  //                     (u: User) =>
  //                       u.name?.trim().toLowerCase() ===
  //                       d.user?.name?.trim().toLowerCase()
  //                   );
  //                   d.userId = user.id;
  //                   d.user = user;
  //                   return d;
  //                 });

  //               this.filterPreviewData();
  //               this.msg.success('Archivo válido, listo para registrar.');
  //             }
  //           } else {
  //             this.msg.info(
  //               'Las cabeceras del archivo no coinciden con la plantilla requerida.'
  //             );
  //             this.columnas = [];
  //             this.previewDataAll = [];
  //             this.previewData = [];
  //             this.nombreArchivo = '';
  //           }
  //         }
  //       };

  //       reader.readAsArrayBuffer(file);
  //     });
  //   }
  // }

  async onFileDropped(files: NgxFileDropEntry[]) {
    if (!files?.length) return;

    const droppedFile = files[0];
    this.files = files;

    if (!droppedFile.fileEntry.isFile) return;

    const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
    this.nombreArchivo = droppedFile.relativePath;

    if (!this.esExtensionValida(this.nombreArchivo)) {
      this.msg.error('Formato no válido. Solo se permite .xlsx, .xls o .csv');
      return;
    }

    fileEntry.file(async (file: File) => {
      this.selectedFile = file;
      this.loadingFile = true;
      const jsonData = await this.leerArchivoExcel(file);

      if (!jsonData.data.length) {
        this.msg.info('El archivo está vacío o no se pudo leer correctamente.');
        this.loadingFile = false;
        return;
      }

      const columnasArchivo = jsonData.headers;
      if (!this.validarCabeceras(columnasArchivo)) {
        this.limpiarDatos();
        this.msg.info(
          'Las cabeceras del archivo no coinciden con la plantilla requerida.'
        );
        this.loadingFile = false;
        return;
      }

      this.columnas = columnasArchivo;
      const data = this.mapearDatos(jsonData.data);
      this.procesarUsuarios(data);
    });
  }

  private esExtensionValida(nombreArchivo: string): boolean {
    const ext = nombreArchivo.split('.').pop()?.toLowerCase();
    return ['xlsx', 'xls', 'csv'].includes(ext ?? '');
  }

  private async leerArchivoExcel(
    file: File
  ): Promise<{ headers: string[]; data: any[] }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e: any) => {
        try {
          const arrayBuffer = e.target.result;
          const workbook = new Workbook();
          await workbook.xlsx.load(arrayBuffer);

          const worksheet = workbook.worksheets[0];
          const headerRow = worksheet.getRow(1);
          const headers = Array.isArray(headerRow.values)
            ? headerRow.values.slice(1).map((h) => String(h ?? '').trim())
            : [];

          const data: any[] = [];

          worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber === 1) return;
            const rowData: any = {};
            row.eachCell((cell, colNumber) => {
              const key = String(headers[colNumber - 1]);
              rowData[key] = cell.value;
            });
            data.push(rowData);
          });

          resolve({ data, headers });
        } catch (err) {
          console.error('Error leyendo Excel:', err);
          reject(err);
        }
      };
      reader.onerror = () => reject('Error al leer el archivo');
      reader.readAsArrayBuffer(file);
    });
  }

  private mapearDatos(jsonData: any[]): PortfolioDetail[] {
    return jsonData.map((item) => {
      const citizenContacts = this.getCitizenContacts(item);
      return {
        user: { name: item['SECTORISTA'] } as User,
        segment: item['SEGMENTO'],
        profile: item['PERFIL'],
        taxpayerName: item['CONTRIBUYENTE'],
        taxpayerType: item['TIPO DE CONTRIBUYENTE'],
        tipDoc: item['TIPO DOC. IDE.'],
        docIde: item['N° DOC. IDE.'],
        code: String(item['CODIGO DE CONTRIBUYENTE']),
        debt: parseFloat(item['DEUDA']) || 0,
        citizenContacts,
      };
    });
  }

  private procesarUsuarios(data: PortfolioDetail[]) {
    const usuarioValido = (name?: string) =>
      this.listUsers.find(
        (u: User) => u.name?.trim().toLowerCase() === name?.trim().toLowerCase()
      );

    const dataValida = data
      .filter((d) => d.user?.name && usuarioValido(d.user.name))
      .map((d) => {
        const user = usuarioValido(d.user?.name);
        return { ...d, userId: user.id, user };
      });

    const tieneInvalidos = dataValida.length < data.length;

    this.loadingFile = false;

    if (tieneInvalidos) {
      this.msg.confirm(
        `<div class='px-4 py-2'>
        <p class='text-center'>Se encontraron sectoristas no registrados o de otra oficina.</p>
        <p class='text-center'>Si continúas, se excluirán del registro.</p>
      </div>`,
        () => this.finalizarCarga(dataValida, true)
      );
    } else {
      this.finalizarCarga(dataValida, false);
    }
  }

  private finalizarCarga(dataValida: PortfolioDetail[], excluidos: boolean) {
    if (!dataValida.length) {
      this.msg.error('No se encontraron sectoristas válidos.');
      this.limpiarDatos();
      return;
    }

    this.previewDataAll = dataValida;
    this.filterPreviewData();
    this.msg[excluidos ? 'warn' : 'success'](
      excluidos
        ? 'Archivo cargado, excluyendo sectoristas no encontrados.'
        : 'Archivo válido, listo para registrar.'
    );
  }

  private limpiarDatos() {
    this.columnas = [];
    this.previewDataAll = [];
    this.previewData = [];
    this.nombreArchivo = '';
    this.selectedFile = null;
    this.limitPreview.set(10);
    this.offsetPreview.set(0);
    this.totalItemsPreview = 0;
  }

  getCitizenContacts(row: any): CitizenContact[] {
    const tipDoc = row['TIPO DOC. IDE.'];
    const docIde = row['N° DOC. IDE.'];
    const email =
      typeof row['EMAIL'] === 'object' && row['EMAIL']
        ? row['EMAIL'].text || row['EMAIL'].email || undefined
        : row['EMAIL'] || undefined;
    const phone1 = row['TELEFONO 1'];
    const phone2 = row['TELEFONO 2'];
    const phone3 = row['TELEFONO 3'];
    const phone4 = row['TELEFONO 4'];
    const whatsapp = row['WHATSAPP'];
    return [
      {
        tipDoc: tipDoc,
        docIde: docIde,
        contactType: 'PHONE',
        isAdditional: false,
        value: phone1,
        status: true,
      },
      {
        tipDoc: tipDoc,
        docIde: docIde,
        contactType: 'PHONE',
        isAdditional: false,
        value: phone2,
        status: true,
      },
      {
        tipDoc: tipDoc,
        docIde: docIde,
        contactType: 'PHONE',
        isAdditional: false,
        value: phone3,
        status: true,
      },
      {
        tipDoc: tipDoc,
        docIde: docIde,
        contactType: 'PHONE',
        isAdditional: false,
        value: phone4,
        status: true,
      },
      {
        tipDoc: tipDoc,
        docIde: docIde,
        contactType: 'EMAIL',
        isAdditional: false,
        value: email,
        status: true,
      },
      {
        tipDoc: tipDoc,
        docIde: docIde,
        contactType: 'WHATSAPP',
        isAdditional: false,
        value: whatsapp,
        status: true,
      },
    ]
      .map((item) => item as CitizenContact)
      .filter((item) => !!item.value);
  }

  getPhoneContacts(contacts: CitizenContact[]): CitizenContact[] {
    return contacts
      .filter((item) => item.contactType === 'PHONE')
      .map((item, i) => ({ ...item, label: `Teléfono ${i + 1}` }));
  }

  getWhatsappContacts(contacts: CitizenContact[]): CitizenContact[] {
    return contacts
      .filter((item) => item.contactType === 'WHATSAPP')
      .map((item, i) => ({ ...item, label: `Whatsapp ${i + 1}` }));
  }

  getEmailContacts(contacts: CitizenContact[]): CitizenContact[] {
    return contacts
      .filter((item) => item.contactType === 'EMAIL')
      .map((item, i) => ({ ...item, label: `Email ${i + 1}` }));
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
    console.log('archivo', archivo);
    console.log('plantilla', plantilla);

    // Compara longitud e igualdad exacta (sin importar el orden)
    return (
      plantilla.length === archivo.length &&
      plantilla.every((col) => archivo.includes(col))
    );
  }

  onCancel() {
    this.portfolioStore.clearSelected();
    this.portfolioDetailStore.clearSelected();
    this.ref.close();
  }

  onSubmit() {
    if (this.formData.valid) {
      const { departmentId, ...request } = this.formData.value;
      if (this.id) {
        this.portfolioStore.update(
          this.id,
          { id: this.id, ...request },
          this.selectedFile ?? undefined
        );
      } else {
        if (!this.selectedFile) {
          this.msg.error('Por favor selecciona un archivo primero');
          return;
        }
        if (!this.previewData || this.previewData.length === 0) {
          this.msg.error('Debe agregar al menos un registro antes de guardar.');
          return;
        }

        this.portfolioStore.create(request, this.selectedFile);
      }
    }
  }
}
