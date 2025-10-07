import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { CapitalizePipe } from '@pipes/capitalize.pipe';

@Component({
  selector: 'app-clock',
  imports: [CommonModule, CapitalizePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="flex items-center gap-2">
      <iconify-icon
        icon="streamline-ultimate:calendar-3-bold"
        class="text-sm -mt-0.5"
      />
      <span class="text-sm font-extralight">
        {{ now | date : 'd/MM/y h:mm a' | lowercase | capitalize }}
      </span>
    </div>
  `,
  styles: ``,
})
export class ClockComponent implements OnInit, OnDestroy {
  now: Date = new Date();
  private intervalId?: number;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.intervalId = window.setInterval(() => {
        this.now = new Date();
      }, 1000);
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }
}
