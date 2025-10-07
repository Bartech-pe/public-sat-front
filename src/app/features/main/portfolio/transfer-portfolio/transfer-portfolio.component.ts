import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CalendarModule } from 'angular-calendar';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { SliderModule } from 'primeng/slider';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-transfer-portfolio',
  imports: [
    DynamicDialogModule,
    CommonModule,
    FormsModule,
    TableModule,
    InputTextModule,
    ReactiveFormsModule,
    CalendarModule,
    ButtonModule,
    SliderModule,
  ],
  templateUrl: './transfer-portfolio.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``,
})
export class TransferPortfolioComponent {
  motivoTransferencia: string = '';
  confirmarTransferencia() {}

  cancelarTransferencia() {}
}
