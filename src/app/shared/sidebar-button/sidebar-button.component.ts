import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import { IsActiveMatchOptions, Router, RouterModule } from '@angular/router';
import { MenuOption } from '@interfaces/menu-option.interface';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'sidebar-button',
  imports: [CommonModule, RouterModule, TooltipModule],
  templateUrl: './sidebar-button.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``,
})
export class SidebarButtonComponent implements OnInit {
  private readonly router = inject(Router);

  _option!: MenuOption;

  @Input() collapsed: boolean = false;

  @Input() set option(val: MenuOption) {
    this._option = val;
  }

  get option(): MenuOption {
    return this._option;
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  isParentActive(option: MenuOption): boolean {
    return option.items.some((item) =>
      this.router.isActive(item.link, {
        paths: 'exact',
        queryParams: 'ignored',
        matrixParams: 'ignored',
        fragment: 'ignored',
      })
    );
  }

  isChildRouteActive(link: string): boolean {
    const tree = this.router.createUrlTree([link]);

    const matchOptions: IsActiveMatchOptions = {
      paths: 'subset', // parcial (como `exact: false`)
      queryParams: 'subset',
      fragment: 'ignored',
      matrixParams: 'ignored',
    };

    return this.router.isActive(tree, matchOptions);
  }

  toggleOption() {
    if (this.option.active) {
      this.option.expand = !this.option.expand;
    }
  }
}
