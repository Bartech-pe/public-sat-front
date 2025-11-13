import { QuickResponseService } from './../../../../core/services/quick-response.service';
import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  signal,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  ValidationErrors,
  AbstractControl,
} from '@angular/forms';
import {
  ICreateQuickRespone,
  QuickResponseItem,
} from '@models/QuickResponse.model';
import { QuickResponseCategoryModel } from '@models/QuickResponseCategory.model';
import { QuickResponseCategoryService } from '@services/quick-response-category.service';
import { ButtonCancelComponent } from '@shared/buttons/button-cancel/button-cancel.component';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { Select } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-quick-response-dialog',
  templateUrl: './quick-response-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    DialogModule,
    ButtonModule,
    TooltipModule,
    ReactiveFormsModule,
    FormsModule,
    RadioButtonModule,
    Select,
    InputTextModule,
    CommonModule,
    InputIconModule,
    TextareaModule,
    IconFieldModule,
    ButtonCancelComponent,
    ToggleSwitch
  ],
})
export class QuickResponseDialogComponent implements OnInit {
  @Input() header!: string;
  @Input() visible!: boolean;
  @Output() reload = new EventEmitter<void>();
  @ViewChild('textareaRef') textareaRef!: ElementRef<HTMLTextAreaElement>;
  characterLimit = 500;

  @Output() visibleChange = new EventEmitter<boolean>();
  quickform!: FormGroup;
  quickResponseCategories = signal<QuickResponseCategoryModel[]>([]);
  constructor(
    private FormBuilder: FormBuilder,
    private QuickResponseCategoryService: QuickResponseCategoryService,
    private QuickResponseService: QuickResponseService
  ) {
    this.quickform = this.FormBuilder.group({
      isActive: [null, [Validators.required]],
      title: ['', [Validators.required]],
      content: ['', [Validators.required, Validators.maxLength(500)]],
      // keywords: ['', [this.keywordsValidator]],
      quickResponseCategoryId: [0, [Validators.required]],
    });
  }

  ngOnInit() {}
  keywordsValidator(control: AbstractControl): ValidationErrors | null {
    const value: string = control.value;

    if (!value) return null;

    const keywords = value
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k !== '');

    const hasInvalid = keywords.some((word) => /\s/.test(word));
    if (hasInvalid) {
      return {
        invalidKeyword:
          'Cada palabra clave debe ser una sola palabra sin espacios',
      };
    }

    const hasDuplicates = new Set(keywords).size !== keywords.length;
    if (hasDuplicates) {
      return { duplicateKeyword: 'No se permiten palabras clave duplicadas' };
    }

    return null;
  }
  getCategories() {
    this.QuickResponseCategoryService.getCategories().subscribe(
      (response: QuickResponseCategoryModel[]) => {
        this.quickResponseCategories.set(response);
      }
    );
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible'] && changes['visible'].currentValue === true) {
      this.getCategories();
    }
  }
  applyFormatting(format: 'bold' | 'italic' | 'underline') {
    const textarea = this.textareaRef?.nativeElement as HTMLTextAreaElement;
    if (!textarea) return;

    const { selectionStart, selectionEnd, value } = textarea;
    const selectedText = value.substring(selectionStart, selectionEnd);

    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `<u>${selectedText}</u>`;
        break;
    }

    this.quickform.patchValue({
      content:
        value.substring(0, selectionStart) +
        formattedText +
        value.substring(selectionEnd),
    });

    setTimeout(() => {
      const newPos = selectionStart + formattedText.length;
      textarea.setSelectionRange(newPos, newPos);
      textarea.focus();
    });
  }
  onClose() {
    this.visible = false;
    this.visibleChange.emit(false);
  }
  IsLimitExceeded() {
    return this.quickform.value.content?.length > this.characterLimit;
  }
  createQuickRespone() {
    const create: ICreateQuickRespone = {
      title: this.quickform.get('title')?.value,
      content: this.quickform.get('content')?.value,
      isActive: this.quickform.get('isActive')?.value,
      quickResponseCategoryId: this.quickform.get('quickResponseCategoryId')
        ?.value,
      keywords: this.quickform.get('keywords')?.value,
    };
    this.QuickResponseService.postCreate(create).subscribe((response: any) => {
      this.visible = false;
      this.visibleChange.emit(false);
      this.reload.emit();
      this.quickform.reset();
    });
  }
}
