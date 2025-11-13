import {
  EndDTO,
  InterferCallDTO,
  RecordingDTO,
  SpyDTO,
} from '../../../../../../core/models/supervise';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { ActualCall, SuperviseItem } from '@models/supervise';
import { DurationPipe } from '@pipes/duration.pipe';
import { AloSatService } from '@services/alo-sat.service';
import { AmiService } from '@services/ami.service';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SliderModule } from 'primeng/slider';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-intervenir-llamada',
  templateUrl: './intervenir-llamada.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    DialogModule,
    ButtonModule,
    TooltipModule,
    SliderModule,
    DurationPipe,
  ],
})
export class IntervenirLlamadaComponent implements OnInit {
  @Input() visible!: boolean;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Input() item!: any;

  private readonly aloSatService = inject(AloSatService);

  private readonly msg = inject(MessageGlobalService);

  constructor(private amiService: AmiService) {}

  get header(): string {
    return `Intervenir llamada`;
  }

  ngOnInit() {}

  onClose() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  hangUp() {
    this.aloSatService.endCallByUserId(this.item.userId).subscribe({
      next: (data) => {
        this.msg.success('¡Llamada finalizada!');
        this.onClose();
      },
    });
  }

  entercall() {
    const spy: SpyDTO = {
      admin: this.item.agent,
      destiny: this.item.lastCall.channel,
    };
    this.amiService.postEnterCall(spy).subscribe((response: any) => {});
  }

  interferCall() {
    this.aloSatService.transferCallMe(this.item.userId).subscribe({
      next: (res) => {
        this.msg.success('¡Llamada transferida con éxito!');
        this.onClose();
      },
    });
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
