import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AuthStore } from '@stores/auth.store';
import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';

@Component({
  selector: 'app-breadcrumb',
  imports: [CommonModule, BreadcrumbModule],
  templateUrl: './breadcrumb.component.html',
  styles: ``,
})
export class BreadcrumbComponent {
  authStore = inject(AuthStore);

  get screen(): any {
    return this.authStore.screenSelected();
  }

  get breadcrumbItems(): MenuItem[] {
    return [{ name: 'Inicio', url: '/' }, this.screen?.parent, this.screen]
      .filter((item) => item)
      .map((item) => ({ label: item.name, routerLink: item.url }));
  }
  // breadcrumbItems = [{ label: 'Inicio' }, { label: 'Mis Asiganciones' }];
  home = { icon: 'pi pi-home', routerLink: '/' };
}
