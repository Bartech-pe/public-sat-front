import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-attention-ivr',
  imports: [
    CommonModule,
  ],
  templateUrl: './attention-ivr.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttentionIvrComponent { }
