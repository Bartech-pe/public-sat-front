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
  selector: 'btn-delete-square',
  imports: [CommonModule, ButtonModule, TooltipModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <p-button
      *ngIf="canDelete"
      severity="danger"
      (click)="onHandler()"
      [disabled]="disabled"
      styleClass="w-full h-9 !rounded-full !shadow-none"
      pTooltip="Eliminar"
      tooltipPosition="top"
      tooltipStyleClass="!text-xs !font-normal !pt-4"
    >
      <div class="flex justify-center items-center gap-1">
        <iconify-icon [icon]="'lucide:trash-2'" class="text-lg -mt-1" />
      </div>
    </p-button>
  `,
  styles: ``,
})
export class BtnDeleteSquareComponent {
  @Input() disabled: boolean = false;

  authStore = inject(AuthStore);

  get canDelete(): boolean {
    return !!this.authStore.screenSelected()?.RoleScreen?.canDelete;
  }

  @Output() onClick = new EventEmitter();

  onHandler() {
    this.onClick.emit();
  }
}
