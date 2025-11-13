import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnInit, signal } from '@angular/core';
import { IButtonSplit } from '@interfaces/button.interface';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'button-split',
  standalone:true,
   imports: [ButtonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="relative inline-flex items-center">
      <button
        (click)="toogle()"  [disabled]="disabled"
        class="p-button p-component p-button-secondary p-button-rounded px-2 py-2 relative z-20"
      >
        <iconify-icon icon="mdi:dots-vertical" class="text-lg"></iconify-icon>
      </button>

      @if (isOpen()) {
        <div
          class="absolute right-0 top-full mt-1 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
        >
          <div class="py-1">
            @for (item of options; track $index) {
              <button
                class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                (click)="handleAction(item)"
              >
                <iconify-icon [icon]="item.icon" class="text-lg"></iconify-icon>
                {{ item.label }}
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class ButtonSplitComponent implements OnInit {
  isOpen = signal<boolean>(false)
  @Input() context: any; 
  @Input() disabled: boolean = false;
  toogle(){
      this.isOpen.set(this.isOpen() ? false : true);
  }
  handleAction(item: IButtonSplit) {
    this.isOpen.set(false);
    item.action(this.context);
  }
  @Input() options!: IButtonSplit[]
  constructor() { }

  ngOnInit() {
  }

}
