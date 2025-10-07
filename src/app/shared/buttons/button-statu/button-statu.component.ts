import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'button-statu',
  imports: [ButtonModule, TooltipModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <p-button
    [disabled]="disabled"
      text
      severity="success"
      size="small"
      rounded
      styleClass="!w-7.5 !px-0.5"
      pTooltip="Actualizar Estado"
      tooltipPosition="top"
      tooltipStyleClass="!text-xs !font-normal !p-0"
    >
      <div class="flex items-center justify-center">
        <iconify-icon [icon]="'gravity-ui:lock'" class="text-lg" />
      </div>
    </p-button>
  `,
  styles: ``,
})
export class ButtonStatuComponent {
 @Input() disabled: boolean = false;
}
