import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { AuthStore } from '@stores/auth.store';

@Component({
  selector: 'app-title-sat',
  imports: [CommonModule],
  template: `
    <div class="flex flex-col gap-2">
      <h5 class="text-2xl font-semibold capitalize">{{ title }}</h5>
      <p *ngIf="showDesc" class="text-sm font-normal text-gray-700">
        {{ description }}
      </p>
    </div>
  `,
  styles: ``,
})
export class TitleSatComponent {
  @Input() showDesc: boolean = true;

  authStore = inject(AuthStore);

  get title(): string {
    return this.authStore.screenSelected()?.name!;
  }

  get description(): string {
    return this.authStore.screenSelected()?.description!;
  }
}
