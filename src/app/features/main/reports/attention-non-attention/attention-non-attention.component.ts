import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-attention-non-attention',
  imports: [
    CommonModule,
  ],
  templateUrl: './attention-non-attention.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttentionNonAttentionComponent { }
