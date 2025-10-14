import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-attention-hour',
  imports: [
    CommonModule,
  ],
  templateUrl: './attention-hour.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttentionHourComponent { }
