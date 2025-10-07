import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';

@Component({
  selector: 'channel-icon',
  imports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: ` <div class="w-20 h-20 flex justify-center items-center">
    <iconify-icon [icon]="logo" class="text-7xl" />
  </div> `,
  styles: ``,
})
export class ChannelIconComponent {
  @Input() logo!: string;
}
