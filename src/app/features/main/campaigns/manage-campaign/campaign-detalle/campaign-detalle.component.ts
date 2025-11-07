import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import {
  CampaignData,
  CampaignDetalle,
  CampaignResumen,
  CampaignResumenMultype,
} from '@models/audio-campaign.model';
import { AudioStoreService } from '@services/audio-store.service';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { VicidialService } from '@services/vicidial.service';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-campaign-detalle',
  imports: [
    TableModule,
    InputTextModule,
    CommonModule,
    ButtonModule,
    BreadcrumbModule,
    DropdownModule,
  ],
  templateUrl: './campaign-detalle.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``,
})
export class CampaignDetalleComponent {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);
  private readonly audioStoreService = inject(AudioStoreService);

  constructor(
    //private globalService: GlobalService,
    private msg: MessageGlobalService,
    public config: DynamicDialogConfig,
    private vicidialService: VicidialService
  ) {}
  dataResumen: CampaignResumenMultype = {} as CampaignResumenMultype;
  called: CampaignResumen = {} as CampaignResumen;
  listCalled: CampaignDetalle[] = [];
  ngOnInit(): void {
    if (this.config) {
      this.vicidialService
        .getByIdProgresoList(this.config.data.vdlistId)
        .subscribe((res) => {
          this.called = res.resumen;
          this.listCalled = res.detalle;
        });

      this.audioStoreService
        .getByIdCampaignResumenMultype(this.config.data.id)
        .subscribe((res) => {
          this.dataResumen = res;
        });
    }
  }

  onCancel() {
    this.ref.close();
  }

  onCerrar() {
    console.log('Tarjeta cerrada!'); // Tu lógica: e.g., remover del array
  }
  cerrarTarjeta() {}
}
