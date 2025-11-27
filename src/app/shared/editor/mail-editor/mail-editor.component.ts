import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  forwardRef,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { EditorModule, Editor } from 'primeng/editor';

@Component({
  selector: 'mail-editor',
  imports: [CommonModule, FormsModule, EditorModule],
  templateUrl: './mail-editor.component.html',
  styles: `
  ::ng-deep .ql-editor {
    -webkit-user-modify: read-write-plaintext-only;
  }

  .lt-suggestion {
    background: #fffdcc;
    border-bottom: 2px dotted #d4a600;
    cursor: pointer;
  }

  ::ng-deep .ql-picker-item{
    padding-top: 1px !important;
    padding-bottom: 1px !important;
  }
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MailEditorComponent),
      multi: true,
    },
  ],
})
export class MailEditorComponent implements ControlValueAccessor {
  @ViewChild(Editor) editor!: Editor;

  quill: any;

  internalValue: string = '';

  // Callbacks requeridos por el ControlValueAccessor
  private onChange = (value: any) => {};
  private onTouched = () => {};

  // =========   ControlValueAccessor   =========
  writeValue(value: any): void {
    this.internalValue = value || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // Si Quill ya está inicializado
    if (this.quill) {
      this.quill.enable(!isDisabled);
    }

    // Si todavía NO se inicializó, espera a que cargue
    const waitForQuill = () => {
      if (this.quill) {
        this.quill.enable(!isDisabled);
      } else {
        setTimeout(waitForQuill, 20);
      }
    };

    waitForQuill();
  }

  onEditorInit(q: any) {
    this.waitForQuill();
  }

  waitForQuill() {
    const tryInit = () => {
      const instance = this.editor?.getQuill?.();

      if (instance && instance.root) {
        this.quill = instance;
        this.enableSpellcheck(instance.root);
      } else {
        setTimeout(tryInit, 25);
      }
    };

    tryInit();
  }

  enableSpellcheck(editorEl: HTMLElement) {
    editorEl.setAttribute('spellcheck', 'true');
    editorEl.spellcheck = true;

    (editorEl.style as any)['webkitUserModify'] = 'read-write-plaintext-only';
  }
}
