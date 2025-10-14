import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-chatsat-wsp',
  imports: [
    CommonModule,
  ],
  templateUrl: './chatsat-wsp.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatsatWspComponent { }
