import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActualCall, RecordingDTO, SuperviseItem } from '@models/supervise';
import { AmiService } from '@services/ami.service';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SliderModule } from 'primeng/slider';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-control-grabacion',
  templateUrl: './control-grabacion.component.html',
   standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [DialogModule,ButtonModule ,TooltipModule,SliderModule]
})
export class ControlGrabacionComponent implements OnInit {

  @Input() visible!:boolean
  @Output() visibleChange = new EventEmitter<boolean>();
  @Input() item!:ActualCall
  constructor(private amiService:AmiService) { }
  active:boolean = false;

  ngOnInit() {
  }
   onClose() {
  this.visible = false;
  this.visibleChange.emit(false); 
}
recording(){
  const recording:RecordingDTO={
    channel: this.item.channel ?? '',
    agent: this.item.agent
  }
  this.amiService.postRecording(recording).subscribe((response:any)=>{
     this.active = true;
  })
}
  formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    const secondsU = remainingSeconds.toFixed(0)
    return `${String(minutes).padStart(2, "0")}:${String(secondsU).padStart(2, "0")}`
  }
}
