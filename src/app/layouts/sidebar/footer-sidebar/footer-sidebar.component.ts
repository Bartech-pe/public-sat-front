import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { AuthStore } from '../../../core/stores/auth.store';
import { PopoverModule } from 'primeng/popover';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { AuthService } from '@services/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'footer-sidebar',
  imports: [
    CommonModule,
    PopoverModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    OverlayPanelModule,
  ],
  templateUrl: './footer-sidebar.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``,
})
export class FooterSidebarComponent {
  private readonly store = inject(AuthStore);
  readonly authService = inject(AuthService);

  get name(): string | undefined {
    return this.store.user()?.name;
  }

  get role(): string | undefined {
    return this.store.user()?.role?.name;
  }

  get initals(): string | undefined {
    return this.store.user()?.name.charAt(0);
  }

  get connected(): boolean {
    return !!this.store.user()?.connected;
  }

  clearsession() {
    this.store.logout();
  }
}
