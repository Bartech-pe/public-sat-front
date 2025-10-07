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

@Component({
  selector: 'button-save',
  imports: [CommonModule, ButtonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <p-button
      severity="primary"
      size="small"
      [disabled]="disabled"
      [loading]="loading"
      styleClass="!rounded-full !bg-[#375F95] !border-[#375F95] !text-white !font-semibold hover:!bg-[#2c4c78] transition flex items-center gap-2"
    >
      <div class="flex justify-center items-center gap-1">
        <iconify-icon *ngIf="showIcon" [icon]="icon" class="text-lg"></iconify-icon>
        <div>{{ label }}</div>
      </div>
    </p-button>
  `,
  styles: ``,
})
export class ButtonSaveComponent {
  @Input() label: string = 'Guardar';
  @Input() icon: string = 'lucide:save';
  @Input() showIcon: boolean = true;
  @Input() disabled!: boolean;
  @Input() loading!: boolean;

  @Output() click = new EventEmitter<void>();

  authStore = inject(AuthStore);

  get canCreate(): boolean {
    return !!this.authStore.screenSelected()?.RoleScreenOffice?.canCreate;
  }
}
