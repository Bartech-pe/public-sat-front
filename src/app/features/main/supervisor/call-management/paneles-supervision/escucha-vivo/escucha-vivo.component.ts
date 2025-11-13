import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { SliderModule } from 'primeng/slider';
import { ActualCall, EndDTO, SpyDTO, SuperviseItem } from '@models/supervise';
import { AmiService } from '@services/ami.service';
import { DurationPipe } from '@pipes/duration.pipe';
import { TimeElapsedPipe } from '@pipes/time-elapsed.pipe';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-escucha-vivo',
  templateUrl: './escucha-vivo.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    FormsModule,
    DialogModule,
    ButtonModule,
    TooltipModule,
    SliderModule,
    DurationPipe,
    TimeElapsedPipe,
  ],
})
export class EscuchaVivoComponent implements OnInit {
  @Input() visible!: boolean;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Input() item!: any;
  escucha: string = 'Modo escucha (solo pueden oirte)';

  constructor(private amiService: AmiService) {}

  volume = signal<number>(100);

  get header(): string {
    return `Escuchar en Vivo`;
  }

  ngOnInit() {}

  onClose() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  listen() {
    const spy: SpyDTO = {
      admin: this.item.phoneLogin,
      destiny: this.item.lastCall.channel,
      volume: this.volume(),
    };
    this.amiService.postListen(spy).subscribe((response: any) => {});
  }

  pause() {
    const admin: EndDTO = {
      channel: this.item.lastCall.channel,
    };
    this.amiService.postEndCall(admin).subscribe((response: any) => {});
  }

  formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const secondsU = remainingSeconds.toFixed(0);
    return `${String(minutes).padStart(2, '0')}:${String(secondsU).padStart(
      2,
      '0'
    )}`;
  };
}
