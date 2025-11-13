import { filter } from 'rxjs';
import { Component, CUSTOM_ELEMENTS_SCHEMA, effect, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { MenuModule } from 'primeng/menu';
import { ActualCall, AMIFilter, SuperviseItem } from '@models/supervise';
import { ButtonDetailComponent } from "@shared/buttons/button-detail/button-detail.component";
import { ButtonSplitComponent } from '@shared/buttons/button-split/button-split.component';
import { IButtonSplit } from '@interfaces/button.interface';
import { EscuchaVivoComponent } from '../paneles-supervision/escucha-vivo/escucha-vivo.component';
import { IntervenirLlamadaComponent } from '../paneles-supervision/intervenir-llamada/intervenir-llamada.component';
import { ControlGrabacionComponent } from '../paneles-supervision/control-grabacion/control-grabacion.component';
import { AmiService } from '@services/ami.service';
import { groupBy } from '@utils/array.util';
import { AmiSocketService } from '@services/ami-socket.service';
import { MessageService } from 'primeng/api';
@Component({
  selector: 'app-supervision',
  templateUrl: './supervision.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  standalone: true,
   imports: [
    TableModule,
    InputTextModule,
    ButtonModule,
    FormsModule, MenuModule,
    BreadcrumbModule, CheckboxModule,
    Select, DatePickerModule, CardModule,ControlGrabacionComponent,
    ButtonSplitComponent,EscuchaVivoComponent,IntervenirLlamadaComponent
],
})
export class SupervisionComponent implements OnInit {
  constructor(
    private AmiService:AmiService,
    private amiSocketService: AmiSocketService,
    private messageService:MessageService 
  ) {
     effect(() => {
      const request:AMIFilter ={
        limit: this.limit(),
        offset: this.offset(),
        state: this.activeStateFilter() || undefined,
        search: this.activeSearch(),
        alert: this.activeAlert() ? true : undefined
      }
     this.getActiveCall(request)
});
   }
  items =  signal<ActualCall[]>([
  ])
    activeStateFilter = signal<string | null>(null);
    changeEventState(event:any){
        console.log(event)
        if(event.value!=''){
          const itemsFilter = this.items().filter((item)=>item.actualState.state==event.value)
           this.items.set(itemsFilter)
        }
    }
  estadoOptionns = [
    { name: 'Todas', value: undefined },
    { name: 'En Llamada', value: 'En Llamada' },
    { name: 'Disponible', value: 'Disponible' },
    { name: 'En Pausa', value: 'En Pausa' },
  ]
  showListen=false
  showInterupt=false
  showControl=false
  timeoutRef: any;
  limit = signal<number>(50);
  offset = signal<number>(0);
  minutes = signal<number>(0);
  itemListen !:ActualCall
  itemInterrupt !:ActualCall
  itemControl !:ActualCall
  enLlamada = signal<number>(0);
  disponible = signal<number>(0);
  fueraLinea = signal<number>(0);
  pausa = signal<number>(0);
  activeSearch = signal<string>('');
  activeAlert = signal<boolean>(false);

  menuItems:IButtonSplit[]=[
     {
      label: 'Escuchar en vivo',
      icon: 'mdi:headphones',
      action: (item:ActualCall) => this.onLiveListen(item),
    },
    {
      label: 'Interrumpir llamada',
      icon: 'mdi:phone-cancel',
      action: (item:ActualCall) => this.onInterruptCall(item),
    },
    {
      label: 'Control de grabación',
      icon: 'mdi:record-circle',
      action: (item:ActualCall) => this.onControlRecording(item),
    },
  ]
  ngOnInit() {
    this.amiSocketService.onNewChannelsDetected().subscribe((response:any) =>{
    this.items.set(response)
    const grouped = groupBy(this.items(), item => item.actualState.state);
    this.disponible.set((grouped['Disponible']||[]).length)
    this.enLlamada.set((grouped['En Llamada']||[]).length)
    this.fueraLinea.set((grouped['Fuera de Linea']||[]).length)
    this.pausa.set((grouped['En Pausa']||[]).length)
    })

    this.AmiService.getActiveChannelsAction().subscribe((response:any)=>{
      const request:AMIFilter ={
        limit: this.limit(),
        offset: this.offset(),
        state: this.activeStateFilter() || undefined,
      }
       this.getActiveCall(request)
    })
    setInterval(() => {
    const items = this.items();
    for (const item of items) {
      const newDuration = item.duration + 1;
      item.duration = newDuration;
    }
    this.items.set([...items]);
    },1000)
  }
  onLiveListen(item:ActualCall) {
     this.showListen=true
     this.itemListen=item
   }
  formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    const secondsU = remainingSeconds.toFixed(0)
    return `${String(minutes).padStart(2, "0")}:${String(secondsU).padStart(2, "0")}`
  }
onInterruptCall(item:ActualCall) {
  this.showInterupt=true
  this.itemInterrupt=item
}
onControlRecording(item:ActualCall) {
  this.showControl=true
  this.itemControl=item
}
getActiveCall(query:AMIFilter){
  this.AmiService.getActiveChannels(query).subscribe((response)=>{
    this.items.set(response.items)
    const grouped = groupBy(this.items(), item => item.actualState.state);
    this.disponible.set((grouped['Disponible']||[]).length)
    this.enLlamada.set((grouped['En Llamada']||[]).length)
    this.fueraLinea.set((grouped['Fuera de Linea']||[]).length)
    this.pausa.set((grouped['En Pausa']||[]).length)

  })
}
Alert(){
  if (!this.minutes || this.minutes() <= 0) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Ingrese minutos válidos' });
      return;
    }
    if (this.timeoutRef) {
      clearTimeout(this.timeoutRef);
    }
    const ms = this.minutes() * 60 * 1000;
    this.messageService.add({ severity: 'info', summary: 'Alerta programada', detail: `Se activará en ${this.minutes()} minutos` });

    this.timeoutRef = setTimeout(() => {
      this.messageService.add({ severity: 'success', summary: '¡Alerta!', detail: 'Se cumplió el tiempo programado' });
    }, ms);
}
}
