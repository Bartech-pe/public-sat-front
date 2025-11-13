import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  Input,
} from '@angular/core';
import { AuthStore } from '@stores/auth.store';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'button-delete',
  imports: [CommonModule, ButtonModule, TooltipModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <p-button
      *ngIf="canDelete"
      [disabled]="disabled"
      severity="danger"
      size="small"
      rounded
      text
      styleClass="!w-7.5 !px-0.5"
      pTooltip="Eliminar"
      tooltipPosition="top"
      tooltipStyleClass="!text-xs !font-normal !p-0"
    >
      <iconify-icon [icon]="'lucide:trash-2'" class="text-lg" />
    </p-button>
  `,
  styles: ``,
})
export class ButtonDeleteComponent {
  @Input() disabled: boolean = false;

  authStore = inject(AuthStore);

  get canDelete(): boolean {
    return !!this.authStore.screenSelected()?.RoleScreen?.canDelete;
  }
}
