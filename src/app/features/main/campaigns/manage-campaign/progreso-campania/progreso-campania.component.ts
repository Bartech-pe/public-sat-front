import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { ProgresoCampania, VicidialService } from '@services/vicidial.service';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
@Component({
  selector: 'app-progreso-campania',
  imports: [ CommonModule,ProgressBarModule,ProgressSpinnerModule],
  templateUrl: './progreso-campania.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``
})
export class ProgresoCampaniaComponent {
  progreso!: ProgresoCampania;
  constructor(
     public config: DynamicDialogConfig,
    private msg: MessageGlobalService,
    private vicidialService:VicidialService,) {

    }

    ngOnInit(): void {

      console.log(this.config.data)
     
      if(this.config.data){
            if(this.config.data.vdCampaignId){ 
              this.vicidialService.getByIdProgreso(this.config.data.vdCampaignId).subscribe(data=>{
                  console.log(data)
                     this.progreso = data;
              })
            }
      }
    }

    get progresoCampania(): number {
      if (!this.progreso || this.progreso.total_leads === 0) {
        return 0;
      }
      return Math.round((this.progreso.llamadas_realizadas / this.progreso.total_leads) * 100);
    }
}
