import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  inject,
  Input,
  Output,
} from '@angular/core';
import { AuthStore } from '@stores/auth.store';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'btn-delete',
  imports: [CommonModule, ButtonModule, TooltipModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <p-button
      *ngIf="canDelete"
      (click)="onHandler()"
      [disabled]="disabled"
      severity="danger"
      size="small"
      rounded
      [text]="text"
      [pTooltip]="tooltip"
      tooltipPosition="top"
      tooltipStyleClass="!text-xs !font-normal !p-0"
    >
      <ng-template pTemplate="icon">
        <iconify-icon [icon]="icon" class="text-lg" />
      </ng-template>
    </p-button>
  `,
  styles: ``,
})
export class BtnDeleteComponent {
  @Input() disabled: boolean = false;
  @Input() text: boolean = true;
  @Input() icon: string = 'lucide:trash-2';
  @Input() tooltip: string = 'Eliminar';

  authStore = inject(AuthStore);

  get canDelete(): boolean {
    return !!this.authStore.screenSelected()?.RoleScreenOffice?.canDelete;
  }

  @Output() onClick = new EventEmitter();

  onHandler() {
    this.onClick.emit();
  }
}
