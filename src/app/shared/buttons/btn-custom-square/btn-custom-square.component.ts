import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { ButtonModule, ButtonSeverity } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'btn-custom-square',
  imports: [CommonModule, ButtonModule, TooltipModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <button
      pButton
      [rounded]="rounded"
      [text]="type === 'text'"
      [outlined]="type === 'outlined'"
      size="small"
      [severity]="severity !== 'white' ? severity : 'info'"
      [pTooltip]="tooltip"
      tooltipPosition="top"
      tooltipStyleClass="!text-xs !font-normal !p-0"
      (click)="onHandler()"
      [disabled]="disabled"
      [class]="getBtnClass()"
      class="!rounded-full !shadow-none"
    >
      <iconify-icon [icon]="icon" [class]="getIconClasses()" pButtonIcon />
      <span *ngIf="!!label" pButtonLabel [class]="getLabelClasses()">
        {{ label }}
      </span>
    </button>
  `,
  styles: ``,
})
export class ButtonCustomSquareComponent {
  @Input() severity: ButtonSeverity | 'white' = 'info';
  @Input() tooltip!: string;
  @Input() icon!: string;
  @Input() disabled!: boolean;
  @Input() rounded: boolean = true;
  @Input() type: 'text' | 'outlined' | undefined = 'text';
  @Input() label?: string;
  @Input() styleClass: string = '';

  @Output() onClick = new EventEmitter();

  onHandler() {
    this.onClick.emit();
  }

  getBtnClass(): string {
    return `group ${this.styleClass}`;
  }

  getIconClasses(): string {
    const base = '!text-lg text-inherit transition-colors duration-200';

    if (this.severity === 'white') {
      return `${base} text-white group-hover:text-sky-700`;
    }

    return `${base}`;
  }

  getLabelClasses(): string {
    const base = '!text-sm !font-light';

    if (this.severity === 'white') {
      return `${base} text-white group-hover:text-sky-700`;
    }

    return `${base}`;
  }
}
