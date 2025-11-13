import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  Input,
  OnInit,
  signal,
} from '@angular/core';
import { IButtonSplit } from '@interfaces/button.interface';
import { ButtonModule } from 'primeng/button';
import { Menu } from 'primeng/menu';

@Component({
  selector: 'button-split',
  standalone: true,
  imports: [CommonModule, Menu, ButtonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="relative inline-flex items-center">
      <p-menu #menu [model]="options" [popup]="true" appendTo="body">
        <ng-template #item let-item>
          <button
            class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            (click)="handleAction(item)"
          >
            <iconify-icon [icon]="item.icon" class="text-lg"></iconify-icon>
            {{ item.label }}
          </button>
        </ng-template>
      </p-menu>
      <button
        (click)="menu.toggle($event)"
        [disabled]="disabled"
        class="p-button p-component p-button-secondary p-button-rounded px-2 py-2 relative z-20"
      >
        <iconify-icon icon="mdi:dots-vertical" class="text-lg"></iconify-icon>
      </button>
    </div>
  `,
})
export class ButtonSplitComponent implements OnInit {
  isOpen = signal<boolean>(false);
  @Input() context: any;
  @Input() disabled: boolean = false;
  toogle() {
    this.isOpen.set(this.isOpen() ? false : true);
  }
  handleAction(item: IButtonSplit) {
    this.isOpen.set(false);
    item.action(this.context);
  }
  @Input() options!: IButtonSplit[];
  constructor() {}

  ngOnInit() {}
}
