import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LogoComponent } from '@shared/logo/logo.component';

@Component({
  selector: 'header-sidebar',
  imports: [CommonModule, LogoComponent],
  templateUrl: './header-sidebar.component.html',
  styles: ``
})
export class HeaderSidebarComponent {

}
