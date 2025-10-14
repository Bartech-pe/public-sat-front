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
import { MessageGlobalService } from '@services/generic/message-global.service';
import { UserStore } from '@stores/user.store';
import { User } from '@models/user.model';
import { Router } from '@angular/router';
import { DatePicker } from 'primeng/datepicker';
import { DepartmentStore } from '@stores/department.store';
import { OfficeStore } from '@stores/office.store';
import { Department } from '@models/department.model';
import { Office } from '@models/office.model';
import { SelectModule } from 'primeng/select';
import { FieldsetModule } from 'primeng/fieldset';
import { ButtonCancelComponent } from '@shared/buttons/button-cancel/button-cancel.component';
import { PortfolioDetailStore } from '@stores/portfolio-detail.store';
import { PortfolioDetailService } from '@services/portfolio-detail.service';
import { PortfolioDetail } from '@models/portfolio-detail.model';
import { PortfolioStore } from '@stores/portfolio.store';
import { CitizenContact } from '@models/citizen.model';

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
    ButtonCancelComponent,
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
      departmentId: [undefined, Validators.required],
      officeId: [undefined, Validators.required],
      dateStart: [undefined, Validators.required],
      dateEnd: [undefined, Validators.required],
      amount: [0],
      status: [false],
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
      this.nombreArchivo = '';
      this.id = item.id ?? null;
      this.formData.setValue({
        name: item.name,
        description: item.description,
        status: item.status ?? false,
        dateStart: new Date(item.dateStart),
        dateEnd: new Date(item.dateEnd),
        departmentId: item?.office?.departmentId,
        officeId: item.officeId,
        amount: item.amount ?? 0,
      });

      const data = item.detalles.map((row: any): PortfolioDetail => {
        return {
          id: row.id,
          userId: row.user?.id,
          user: row.user,
          segment: row.segment,
          profile: row.profile,
          taxpayerName: row.taxpayerName,
          taxpayerType: row.taxpayerType,
          tipDoc: row.tipDoc,
          docIde: row.docIde,
          code: row.code,
          debt: row.debt || 0,
          citizenContacts: row.citizenContacts,
        };
      });
      this.previewData = data;
    }
  });

  descargarPlantilla() {
    descargarPlantillaExcel();
  }

  columnas: string[] = [];
  previewData: PortfolioDetail[] = [];
  nombreArchivo: string = '';
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
              const data = jsonData.map((item): PortfolioDetail => {
                const citizenContacts: CitizenContact[] =
                  this.getCitizenContacts(item);
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
                  // phone1: item['TELEFONO 1'],
                  // phone2: item['TELEFONO 2'],
                  // phone3: item['TELEFONO 3'],
                  // phone4: item['TELEFONO 4'],
                  // whatsapp: item['WHATSAPP'],
                  // email: emailValue,
                  citizenContacts,
                };
              });

              const invaluserIds = data.some(
                (d: PortfolioDetail) =>
                  !d.user?.name ||
                  !this.listUsers.find(
                    (u: User) =>
                      u.name?.trim().toLowerCase() ===
                      d.user?.name?.trim().toLowerCase()
                  )
              );

              if (invaluserIds) {
                this.msg.confirm(
                  `<div class='px-4 py-2'>
                    <p class='text-center'> Se encontraron sectoristas no registrados o pertenecientes a otra office, solo tienes permitido asignar a miembros de tu propia office </p>
                    <p class='text-center'> Si decides continuar se registrará la cartera excluyendo estos sectoristas no validados. </p>
                  </div>`,
                  () => {
                    const arraydetallecartera: any[] = data
                      .filter(
                        (d: PortfolioDetail) =>
                          d.user?.name &&
                          this.listUsers.find(
                            (u: User) =>
                              u.name?.trim().toLowerCase() ===
                              d.user?.name?.trim().toLowerCase()
                          )
                      )
                      .map((d: PortfolioDetail) => {
                        const user = this.listUsers.find(
                          (u: User) =>
                            u.name?.trim().toLowerCase() ===
                            d.user?.name?.trim().toLowerCase()
                        );
                        d.userId = user.id;
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
                    (d: PortfolioDetail) =>
                      d.user?.name &&
                      this.listUsers.find(
                        (u: User) =>
                          u.name?.trim().toLowerCase() ===
                          d.user?.name?.trim().toLowerCase()
                      )
                  )
                  .map((d: PortfolioDetail) => {
                    const user = this.listUsers.find(
                      (u: User) =>
                        u.name?.trim().toLowerCase() ===
                        d.user?.name?.trim().toLowerCase()
                    );
                    d.userId = user.id;
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
    this.portfolioStore.clearSelected();
    this.portfolioDetailStore.clearSelected();
    this.ref.close();
  }

  guardar() {
    if (this.formData.valid) {
      const { departmentId, ...request } = this.formData.value;

      if (this.id) {
        request.amount = this.previewData.length;
        request.detalles = this.previewData
          .filter((p) => !p.id)
          .map((p) => {
            const { user, ...item } = p;
            return item;
          });

        this.portfolioStore.update(this.id, { id: this.id, ...request });
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
        this.portfolioStore.create(request);
      }
      //this.router.navigate(['/portfolios']);
    }
  }
}
