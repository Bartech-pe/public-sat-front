import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-intern-chat',
  imports: [
    CommonModule,
  ],
  templateUrl: './intern-chat.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InternChatComponent { }
