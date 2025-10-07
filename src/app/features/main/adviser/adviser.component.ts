import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-adviser',
  imports: [CommonModule, RouterModule, TabsModule],
  template: ` <router-outlet /> `,
  styles: ``,
})
export class AdviserComponent {}
