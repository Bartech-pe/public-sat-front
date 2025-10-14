import { EndDTO, InterferCallDTO, RecordingDTO, SpyDTO } from '../../../../../../core/models/supervise';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActualCall, SuperviseItem } from '@models/supervise';
import { AmiService } from '@services/ami.service';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SliderModule } from 'primeng/slider';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-intervenir-llamada',
  templateUrl: './intervenir-llamada.component.html',
   standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [DialogModule,ButtonModule ,TooltipModule,SliderModule]
})
export class IntervenirLlamadaComponent implements OnInit {
  @Input() visible!:boolean
  @Output() visibleChange = new EventEmitter<boolean>();
  @Input() item!:ActualCall
  constructor(private amiService:AmiService) { }

  ngOnInit() {
  }
   onClose() {
  this.visible = false;
  this.visibleChange.emit(false); 
}
hangUp(){
   const admin:EndDTO={
      channel: this.item.channel ?? ''
    }
      this.amiService.postEndCall(admin).subscribe((response:any)=>{})
}
entercall(){
  const spy:SpyDTO={
      admin: this.item.agent,
      destiny: this.item.channel ?? ''
    }
    this.amiService.postEnterCall(spy).subscribe((response:any)=>{})
}
interferCall(){
    const spy:InterferCallDTO={
      agent: this.item.agent,
      client: this.item.channel ?? '',
      extension: this.item.extension ?? ''
    }
    this.amiService.postInterferCall(spy).subscribe((response:any)=>{})
}
  formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    const secondsU = remainingSeconds.toFixed(0)
    return `${String(minutes).padStart(2, "0")}:${String(secondsU).padStart(2, "0")}`
  }


}
