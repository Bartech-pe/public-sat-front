import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-templates',
  imports: [CommonModule, RouterModule],
  template: ` <router-outlet /> `,
  styles: ``,
})
export class TemplatesComponent {}
