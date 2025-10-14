import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-mail-dash',
  imports: [
    CommonModule,
  ],
  templateUrl: './mail-dash.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MailDashComponent { }
