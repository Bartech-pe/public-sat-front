import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { StepperComponent } from "./stepper/stepper.component";
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MenuItem } from 'primeng/api';
import { routes } from '../../../../../app.routes';

@Component({
  selector: 'app-new-inbox',
  imports: [StepperComponent, StepperComponent, BreadcrumbModule, RouterModule, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './new-inbox.component.html',
  styles: ``
})



export class NewInboxComponent {

    breadcrumbItems = [
      { label: 'Inicio' },
      { label: 'Ajustes', route: "/settings/inboxes/new" },
      { label: 'Entradas', route: '/'}
    ];
    home = { icon: 'tabler:home', routerLink: '/' };

    constructor(){}


}
