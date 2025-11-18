import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  inject,
  ViewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { MailService } from '@services/mail.service';
import {
  AutoCompleteCompleteEvent,
  AutoCompleteModule,
} from 'primeng/autocomplete';
import { CardModule } from 'primeng/card';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { EditorModule, Editor } from 'primeng/editor';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { BtnCustomComponent } from '@shared/buttons/btn-custom/btn-custom.component';
import { PredefinedResponsesService } from '@services/predefined.service';
import { PredefinedResponses } from '@models/predefined-response.model';
import { Popover, PopoverModule } from 'primeng/popover';
import { EmailSignatureService } from '@services/email-signature.service';
import Quill from 'quill';
import Block from 'quill/blots/block';
import Container from 'quill/blots/container';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';

// Obtener Parchment para asignar el scope (alcance) correcto
const Parchment = Quill.import('parchment');

// Definición y Registro de Blots de Tabla Personalizados (Debe ir antes de @Component)

// Usamos 'override' ya que TypeScript 4.3+ lo exige al anular miembros
class TableCell extends Block {
  static override blotName = 'td';
  static override tagName = 'td';
}

class TableRow extends Container {
  static override blotName = 'tr';
  static override tagName = 'tr';
  // El alcance de CONTAINER_BLOT es a menudo más apropiado para las filas que contienen bloques internos (celdas).
  static override scope = Parchment.Scope.BLOCK;
}
TableRow.allowedChildren = [TableCell];

class CustomTable extends Container {
  static override blotName = 'table';
  static override tagName = 'table';
  static override scope = Parchment.Scope.BLOCK;
}
CustomTable.allowedChildren = [TableRow];

Quill.register(
  {
    'formats/td': TableCell,
    'formats/tr': TableRow,
    'formats/table': CustomTable,
  },
  true
);

@Component({
  selector: 'app-mail-editor',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    EditorModule,
    InputTextModule,
    TextareaModule,
    AutoCompleteModule,
    CardModule,
    PopoverModule,
    InputNumberModule,
    ButtonModule,
    BtnCustomComponent,
  ],
  templateUrl: './mail-editor.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``,
})
export class MailEditorComponent {
  @ViewChild(Editor, { static: true }) editor!: Editor;

  @ViewChild('responses') responses!: Popover;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly msg = inject(MessageGlobalService);

  private readonly mailService = inject(MailService);

  private readonly predefinedResponsesService = inject(
    PredefinedResponsesService
  );

  private readonly emailSignatureService = inject(EmailSignatureService);

  predefinedResponseList: PredefinedResponses[] = [];

  formData = new FormGroup({
    to: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    subject: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    content: new FormControl<string | undefined>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  loading: boolean = false;

  emailItemsTo: any[] = [];

  attachments: any[] = [];

  signature?: string;
  selectedRows: number = 1;
  selectedCols: number = 2;
  showTablePicker: boolean = false;

  searchEmailTo(event: AutoCompleteCompleteEvent) {
    this.mailService.getEmailCitizen(event.query).subscribe({
      next: (res) => {
        this.emailItemsTo = res;
      },
    });
  }

  loadPredefinedResponseMail() {
    this.predefinedResponsesService.allMail().subscribe({
      next: (data) => {
        this.predefinedResponseList = data;
      },
    });
  }

  selectResponse(event: any) {
    this.responses.toggle(event);
  }

  get content() {
    return this.formData.get('content');
  }

  insertResponse(response: PredefinedResponses) {
    console.log('response.content', response.content);
    this.content?.setValue(this.content.value + response.content);
  }

  attachFile() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      Array.from(input.files).forEach((file) => {
        const newAttachment = {
          file,
          name: file.name,
          size: file.size,
          progress: 0,
        };

        this.attachments.push(newAttachment);

        // Simular carga con progreso
        this.simulateUpload(newAttachment);
      });

      // Reset del input (para poder volver a elegir el mismo archivo)
      input.value = '';
    }
  }

  simulateUpload(fileObj: any) {
    const interval = setInterval(() => {
      if (fileObj.progress >= 100) {
        fileObj.progress = 100; // aseguramos que quede exacto
        clearInterval(interval);
      } else {
        fileObj.progress += 10;
      }
    }, 300);
  }

  removeAttachment(index: number) {
    this.attachments.splice(index, 1);
  }

  insertSignature() {
    this.emailSignatureService.findOneByTokenUserId().subscribe({
      next: (data) => {
        if (data?.content) {
          this.content?.setValue(
            this.content.value + '<br><p>--</p><br>' + data?.content
          );
        }
      },
    });
  }

  /**
   * Inserta una tabla con el número de filas y columnas seleccionadas.
   */
  insertCustomTable(): void {
    this.showTablePicker = false; // Oculta el selector

    const quill = this.editor.getQuill(); // Accede al objeto Quill
    if (!quill) return;

    const numRows = this.selectedRows;
    const numCols = this.selectedCols;

    if (numRows < 1 || numCols < 1) {
      this.msg.warn('Debe seleccionar al menos 1 fila y 1 columna.');
      return;
    }

    const range = quill.getSelection(true);
    if (!range) return;

    // 1. Construir la estructura DOM/Blot en memoria
    // Utilizamos el método estático create() del Blot, que devuelve el nodo DOM.
    const tableElement = CustomTable.create() as HTMLTableElement;

    // APLICAR ESTILOS INLINE PARA COMPATIBILIDAD CON CORREO
    tableElement.setAttribute('border', '1');
    tableElement.setAttribute('cellpadding', '5');
    tableElement.setAttribute('cellspacing', '0');
    tableElement.setAttribute(
      'style',
      'border: 1px solid #ccc; border-collapse: collapse; width: 100%; margin: 10px 0;'
    );

    for (let r = 0; r < numRows; r++) {
      const rowElement = TableRow.create() as HTMLTableRowElement;
      for (let c = 0; c < numCols; c++) {
        const cellElement = TableCell.create() as HTMLTableCellElement;

        // APLICAR ESTILOS INLINE A LA CELDA
        cellElement.setAttribute(
          'style',
          'border: 1px solid #ccc; min-width: 50px; padding: 5px; vertical-align: top;'
        );

        // El <br> permite que la celda sea clickeable y tenga altura en Quill.
        cellElement.innerHTML = `C${c}F${r}`;
        rowElement.appendChild(cellElement);
      }
      tableElement.appendChild(rowElement);
    }

    // console.log('tableElement', range.index, tableElement.outerHTML);

    this.content?.setValue(this.content?.value + tableElement.outerHTML);

    // // 2. Insertamos el elemento HTML de la tabla directamente en el índice del cursor.
    // quill.clipboard.dangerouslyPasteHTML(range.index, tableElement.outerHTML);

    // // 3. Movemos el cursor justo después de la tabla
    // quill.setSelection(range.index + 1, 0, Quill.sources.USER);
  }

  onCancel() {
    this.ref.close(false);
  }

  onSubmit() {
    const form = this.formData.value;

    // Crear FormData
    const formData = new FormData();
    formData.append('to', form.to!.trim()); // backend espera string, él mismo convierte en array
    formData.append('subject', form.subject!);
    formData.append('content', form.content!);
    this.attachments.forEach((a) => {
      formData.append('attachments', a.file);
    });

    this.mailService.sendEmailCenter(formData).subscribe({
      next: (res) => {
        this.ref.close(true);
        this.msg.success('Mensaje enviado correctamente.');
      },
      error: (err) => {
        console.error('Error al enviar', err);
        this.msg.error(err?.message || 'Ocurrio un error al enviar el mensaje');
      },
    });
  }
}
