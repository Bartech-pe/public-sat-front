import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-cons-consultas',
  imports: [
    CommonModule,
  ],
  templateUrl: './cons-consultas.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsConsultasComponent { }
