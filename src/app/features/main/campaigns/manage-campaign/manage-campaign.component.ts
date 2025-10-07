import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BtnDeleteComponent } from '@shared/buttons/btn-delete/btn-delete.component';
import { ButtonDetailComponent } from '@shared/buttons/button-detail/button-detail.component';
import { ButtonEditComponent } from '@shared/buttons/button-edit/button-edit.component';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { ColorPickerModule } from 'primeng/colorpicker';
import { InputTextModule } from 'primeng/inputtext';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TableModule } from 'primeng/table';
import { CreateCampaignComponent } from './create-campaign/create-campaign.component';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { DialogService } from 'primeng/dynamicdialog';
import { AudioSettingsComponent } from './audio-settings/audio-settings.component';
import { ProgresoCampaniaComponent } from './progreso-campania/progreso-campania.component';
import { CampaignStore } from '@stores/campaign.store';
import { ButtonProgressComponent } from '@shared/buttons/button-progress/button-progress.component';
import { VicidialService } from '@services/vicidial.service';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { ScheduleService } from '@services/schedule.service';
import { CampaignService } from '@services/campaign.service';
import { Campaign } from '@models/campaign.model';

@Component({
  selector: 'app-manage-campaign',
  imports: [
    TableModule,
    InputTextModule,
    CommonModule,
    ColorPickerModule,
    ButtonModule,
    FormsModule,
    BreadcrumbModule,
    ButtonDetailComponent,
    ButtonEditComponent,
    BtnDeleteComponent,
    ButtonSaveComponent,
    OverlayPanelModule,
    ButtonProgressComponent,
    InputIcon,
    IconField,
    TagModule,
  ],
  templateUrl: './manage-campaign.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``,
})
export class ManageMampaignComponent {
  campaniaList: Campaign[] = [];
  campaniaListFiltradas: Campaign[] = [];
  filtroNombre: string = '';
  openModal: boolean = false;
  openModalDetalle: boolean = false;
  private readonly msg = inject(MessageGlobalService);

  private readonly dialogService = inject(DialogService);
  private readonly vicidialService = inject(VicidialService);
  readonly campaignStore = inject(CampaignStore);
  private readonly scheduleService = inject(ScheduleService);

  readonly campaignService = inject(CampaignService);

  ngOnInit(): void {
    this.loadData();
  }

  private resetOnSuccessEffect = effect(() => {
    const error = this.campaignStore.error();
    const action = this.campaignStore.lastAction();

    // Manejo de errores
    if (!this.openModal && !this.openModalDetalle && error) {
      console.log('error', error);
      this.msg.error(
        error ?? '¡Ups, ocurrió un error inesperado al eliminar la Campaña!'
      );
      return; // Salimos si hay un error
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'deleted') {
      this.msg.success('¡La Campaña fue eliminado exitosamente!');
      this.campaignStore.clearSelected();
      this.loadData();
      return;
    }
  });

  loadData() {
    this.campaignService.getAll().subscribe((res) => {
      if (res) {
        this.campaniaList = res.data;
        this.campaniaListFiltradas = [...this.campaniaList];
      }
    });
  }

  filtrar() {
    const filtro = this.filtroNombre.toLowerCase();
    this.campaniaListFiltradas = this.campaniaList.filter((c) =>
      c.name.toLowerCase().includes(filtro)
    );
  }

  addNew() {
    this.campaignStore.clearSelected();
    this.openModal = true;
    const ref = this.dialogService.open(CreateCampaignComponent, {
      header: 'Nueva Campaña',
      styleClass: 'modal-8xl',
      modal: true,
      dismissableMask: false,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      this.openModal = false;
      this.loadData();
    });
  }

  menuAbierto: number | null = null;

  toggleMenu(id: number) {
    this.menuAbierto = this.menuAbierto === id ? null : id;
  }

  cerrarMenu() {
    this.menuAbierto = null;
  }

  getContraste(color: string): string {
    // Convierte color hex a RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Calcular luminancia
    const luminancia = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Retorna blanco si es oscuro, negro si es claro
    return luminancia > 0.5 ? '#000000' : '#ffffff';
  }

  edit(registro: any) {
    this.campaignStore.loadById(registro.id);
    this.openModal = true;
    const ref = this.dialogService.open(CreateCampaignComponent, {
      data: registro,
      header: 'Editar Campaña - ' + registro.nombre,
      styleClass: 'modal-8xl',
      modal: true,
      dismissableMask: false,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      this.openModal = false;
      this.loadData();
    });
  }

  remove(registro: any) {
    this.msg.confirm(
      `<div class='px-4 py-2'>
            <p class='text-center'> ¿Está seguro de eliminar la campaña <span class='uppercase font-bold'>${registro.nombre}</span>? </p>
            <p class='text-center'> Esta acción no se puede deshacer. </p>
          </div>`,
      () => {
        if (registro.id_tipo_campania == 3) {
          this.campaignStore.delete(registro.id);
          this.vicidialService
            .eliminarCampania(registro.campaniaId)
            .subscribe((res) => {
              if (res.status == 'not_found') {
                this.msg.error(
                  'No existe una campaña con ese campaign_id : ' +
                    registro.campaniaId
                );
              } else {
                this.msg.success(
                  'La Campaña fue eliminado correctamente en Vicidial, ' +
                    registro.nombre
                );
                this.scheduleService.deleteByCampain(registro.id).subscribe(
                  (res) => {
                    this.campaignStore.delete(registro.id);
                  },
                  (err) => {
                    this.campaignStore.delete(registro.id);
                  }
                );
              }
            });
        } else {
          this.campaignStore.delete(registro.id);
        }
      }
    );
  }

  copiarCampaniaId(registro: any) {
    navigator.clipboard
      .writeText(registro.campaniaId.toString())
      .then(() => {
        registro.copiado = true;

        // Volver a "copiar" después de 5 segundos
        setTimeout(() => {
          registro.copiado = false;
        }, 1000);
      })
      .catch((err) => {
        console.error('Error al copiar:', err);
      });
  }

  verResultadosProgreso(registro: any) {
    if (registro.id_tipo_campania) {
      const modal_item = this.dialogService.open(ProgresoCampaniaComponent, {
        data: registro,
        header: 'Progreso de Campaña ' + registro.nombre,
        styleClass: 'modal-lg',
        modal: true,
        dismissableMask: false,
        closable: true,
      });
      modal_item.onClose.subscribe((res) => {
        if (res) {
          this.loadData();
        }
      });
    }
  }

  verResultados(registro: any) {
    if (registro.id_tipo_campania) {
      const modal_item = this.dialogService.open(AudioSettingsComponent, {
        data: registro,
        header: 'Configurar Campaña ' + registro.nombre,
        styleClass: 'modal-8xl',
        modal: true,
        dismissableMask: false,
        closable: true,
      });
      modal_item.onClose.subscribe((res) => {
        if (res) {
          this.loadData();
        }
      });
    }
  }

  configurar(registro: any) {}
}
