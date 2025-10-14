import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-cons-attention',
  imports: [
    CommonModule,
  ],
  templateUrl: './cons-attention.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsAttentionComponent { }
