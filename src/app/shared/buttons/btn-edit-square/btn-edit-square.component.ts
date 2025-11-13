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
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'btn-edit-square',
  imports: [CommonModule, ButtonModule, TooltipModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <p-button
      *ngIf="canUpdate"
      severity="contrast"
      outlined
      size="small"
      (click)="onHandler()"
      [disabled]="disabled"
      styleClass="!rounded-full !shadow-none"
    >
      <div class="flex items-center justify-center">
        <iconify-icon [icon]="'uil:edit'" class="text-lg -mt-1" />
        <div>Editar</div>
      </div>
    </p-button>
  `,
  styles: ``,
})
export class BtnEditSquareComponent {
  @Input() disabled: boolean = false;

  authStore = inject(AuthStore);

  get canUpdate(): boolean {
    return !!this.authStore.screenSelected()?.RoleScreen?.canUpdate;
  }

  @Output() onClick = new EventEmitter();

  onHandler() {
    this.onClick.emit();
  }
}
