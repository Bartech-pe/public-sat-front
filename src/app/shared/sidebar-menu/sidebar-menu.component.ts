import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { MenuOption } from '@interfaces/menu-option.interface';
import { SidebarButtonComponent } from '@shared/sidebar-button/sidebar-button.component';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'sidebar-menu',
  imports: [CommonModule, RouterModule, SidebarButtonComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './sidebar-menu.component.html',
  styles: ``,
})
export class SidebarMenuComponent implements OnInit {
  private routerSubscription!: Subscription;

  private readonly router = inject(Router);

  _items!: MenuOption[];

  @Input() set items(val: MenuOption[]) {
    this._items = val;
  }

  get items(): MenuOption[] {
    return this._items;
  }

  ngOnInit(): void {
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateMenuState(event.urlAfterRedirects);
      });
    const currentUrl = this.router.url;
    this.updateMenuState(currentUrl);
  }

  private updateMenuState(url: string): void {
    this.items.forEach((item) => {
      item.active = url.startsWith(item.link);
      if (item.items?.some((sub) => url.startsWith(sub.link))) {
        item.active = true;
        item.expand = true;
      } else {
        item.expand = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}
