import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-survey-chat',
  imports: [
    CommonModule
  ],
  templateUrl: './survey-chat.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SurveyChatComponent { }
