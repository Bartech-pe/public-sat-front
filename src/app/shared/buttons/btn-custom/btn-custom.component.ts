import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

export type ButtonSeverity =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'help'
  | 'danger'
  | 'contrast';

@Component({
  selector: 'btn-custom',
  imports: [CommonModule, ButtonModule, TooltipModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <button
      pButton
      [rounded]="rounded"
      [text]="text"
      [outlined]="outlined"
      size="small"
      [severity]="severity !== 'white' ? severity : 'info'"
      [pTooltip]="tooltip"
      tooltipPosition="top"
      tooltipStyleClass="!text-xs text-center !font-normal !p-0"
      (click)="onHandler($event)"
      [disabled]="disabled"
      [class]="getBtnClass()"
    >
      <iconify-icon [icon]="icon" [class]="getIconClasses()" pButtonIcon />
      <span *ngIf="!!label" pButtonLabel>
        {{ label }}
      </span>
    </button>
  `,
  styles: ``,
})
export class BtnCustomComponent {
  @Input() severity: ButtonSeverity | 'white' = 'info';
  @Input() tooltip!: string;
  @Input() icon!: string;
  @Input() disabled!: boolean;
  @Input() rounded: boolean = true;
  @Input() outlined: boolean = false;
  @Input() text: boolean = true;
  @Input() label?: string;
  @Input() styleClass: string = '';

  @Output() onClick = new EventEmitter();

  onHandler(event: MouseEvent) {
    this.onClick.emit(event);
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
    const base = '!text-sm';

    if (this.severity === 'white') {
      return `${base} text-white group-hover:text-sky-700`;
    }

    return `${base}`;
  }
}
