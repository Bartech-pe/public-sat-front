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
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { Select } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { QuickResponseCategoryService } from '@services/quick-response-category.service';
import { QuickResponseService } from './../../../../core/services/quick-response.service';
import { IUpdateQuickRespone, QuickResponseItem } from '@models/quick-response.model';
import { QuickResponseCategoryModel } from '@models/quick-response-category.model';

@Component({
  selector: 'app-quick-response-update',
  templateUrl: './quick-response-update.component.html',
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
  ],
})
export class QuickResponseUpdateComponent implements OnInit {
  @Input() item!: QuickResponseItem;
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
  ) {}

  ngOnInit() {
    this.quickform = this.FormBuilder.group({
      status: [this.item.status, [Validators.required]],
      title: [this.item.title, [Validators.required]],
      content: [
        this.item.content,
        [Validators.required, Validators.maxLength(500)],
      ],
      keywords: [this.item.keywords, []],
      quickResponseCategoryId: [
        this.item.quickResponseCategory.quickResponseCategoryId,
        [Validators.required],
      ],
    });
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
  updateQuickRespone(id: number) {
    const update: IUpdateQuickRespone = {
      title: this.quickform.get('title')?.value,
      content: this.quickform.get('content')?.value,
      status: this.quickform.get('status')?.value,
      quickResponseCategoryId: this.quickform.get('quickResponseCategoryId')
        ?.value,
      keywords: this.quickform.get('keywords')?.value,
    };
    this.QuickResponseService.putUpdate(id, update).subscribe(
      (response: any) => {
        this.visible = false;
        this.visibleChange.emit(false);
        this.reload.emit();
      }
    );
  }
}
