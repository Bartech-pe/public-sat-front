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
  selector: 'button-edit',
  imports: [CommonModule, ButtonModule, TooltipModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <p-button
      *ngIf="canUpdate"
      [disabled]="disabled"
      severity="secondary"
      size="small"
      rounded
      text
      styleClass="!w-7.5 !px-0.5"
      pTooltip="Editar"
      tooltipPosition="top"
      tooltipStyleClass="!text-xs !font-normal !p-0"
    >
      <div class="flex items-center justify-center">
        <iconify-icon [icon]="'uil:edit'" class="text-lg" />
      </div>
    </p-button>
  `,
  styles: ``,
})
export class ButtonEditComponent {
  @Input() disabled: boolean = false;

  authStore = inject(AuthStore);

  get canUpdate(): boolean {
    return !!this.authStore.screenSelected()?.RoleScreen?.canUpdate;
  }
}
