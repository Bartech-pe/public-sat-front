import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'button-detail',
  imports: [ButtonModule, TooltipModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <p-button
    [disabled]="disabled"
      text
      severity="info"
      size="small"
      rounded
      styleClass="!w-7.5 !px-0.5"
      pTooltip="Gestionar"
      tooltipPosition="top"
      tooltipStyleClass="!text-xs !font-normal !p-0"
    >
      <div class="flex items-center justify-center">
        <iconify-icon [icon]="'lucide:view'" class="text-lg" />
      </div>
    </p-button>
  `,
  styles: ``,
})
export class ButtonDetailComponent {
@Input() disabled: boolean = false;
}
