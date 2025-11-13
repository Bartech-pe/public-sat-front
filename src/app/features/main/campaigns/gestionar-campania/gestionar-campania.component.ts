import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonDeleteComponent } from '@shared/buttons/button-delete/button-delete.component';
import { ButtonDetailComponent } from '@shared/buttons/button-detail/button-detail.component';
import { ButtonEditComponent } from '@shared/buttons/button-edit/button-edit.component';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { ColorPickerModule } from 'primeng/colorpicker';
import { InputTextModule } from 'primeng/inputtext';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TableModule } from 'primeng/table';
import { CrearCampaniaComponent } from './crear-campania/crear-campania.component';
import { MessageGlobalService } from '@services/message-global.service';
import { DialogService } from 'primeng/dynamicdialog';
import { GeneralServicio } from '@services/servicioGeneral.service';
import { ConfiguracionAudioComponent } from './configuracion-audio/configuracion-audio.component';
import { ProgresoCampaniaComponent } from './progreso-campania/progreso-campania.component';
import { GestionCampaniaStore } from '@stores/gestion-campania.store';
import { ButtonProgressComponent } from '@shared/buttons/button-progress/button-progress.component';
import { VicidialService } from '@services/vicidial.service';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { Campania } from '@models/campania.model';
import { HorarioService } from '@services/horario.service';
import { IDayWeek } from '@models/horario.model';
import { EmailConfigurationComponent } from './email-configuration/email-configuration.component';

@Component({
  selector: 'app-gestionar-campania',
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
    ButtonDeleteComponent,
    ButtonSaveComponent,
    OverlayPanelModule,
    ButtonProgressComponent,
    InputIcon,
    IconField,
    TagModule
  ],
  templateUrl: './gestionar-campania.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``,
})
export class GestionarCampaniaComponent {
  campaniaList: any[] = [];
  campaniaListFiltradas: any[] = [];
  filtroNombre: string = '';
  openModal: boolean = false;
  openModalDetalle: boolean = false;
  private readonly msg = inject(MessageGlobalService);

  private readonly dialogService = inject(DialogService);
  private readonly vicidialService = inject(VicidialService);
  readonly gestionCampaniaStore = inject(GestionCampaniaStore);
  private readonly horarioService=inject(HorarioService);

  readonly generalServicio = inject(GeneralServicio);
  ngOnInit(): void {
    this.loadData();
  }


  private resetOnSuccessEffect = effect(() => {
    const error = this.gestionCampaniaStore.error();
    const action = this.gestionCampaniaStore.lastAction();

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
      this.gestionCampaniaStore.clearSelected();
      this.loadData();
      return;
    }
  });

  loadData() {
    this.generalServicio.getAllCampania().subscribe((res) => {
      if (res) {
        this.campaniaList = res;
        this.campaniaListFiltradas = [...this.campaniaList];
      }
    });
  }

  filtrar() {
    const filtro = this.filtroNombre.toLowerCase();
    this.campaniaListFiltradas = this.campaniaList.filter((c) =>
      c.nombre.toLowerCase().includes(filtro)
    );
  }

  addNew() {
    this.gestionCampaniaStore.clearSelected();
    this.openModal = true;
    const ref = this.dialogService.open(CrearCampaniaComponent, {
      header: 'Crear Nueva Campaña',
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
    this.gestionCampaniaStore.loadById(registro.id);
    this.openModal = true;
    const ref = this.dialogService.open(CrearCampaniaComponent, {
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
           
                this.gestionCampaniaStore.delete(registro.id);
                this.vicidialService.eliminarCampania(registro.campaniaId).subscribe((res) => {
                  if(res.status == "not_found"){
                      this.msg.error('No existe una campaña con ese campaign_id : ' + registro.campaniaId);
                  }else{
                      this.msg.success('La Campaña fue eliminado correctamente en Vicidial, ' + registro.nombre);
                      this.horarioService.deleteByCampain(registro.id).subscribe((res)=>{
                        this.gestionCampaniaStore.delete(registro.id);
                      },err=>{
                        this.gestionCampaniaStore.delete(registro.id);
                      });
                    }
                });
        }else{
           this.gestionCampaniaStore.delete(registro.id);
        }
         
        
      }
    );
  }

  copiarCampaniaId(registro: any) {
    navigator.clipboard.writeText(registro.campaniaId.toString()).then(() => {
      registro.copiado = true;

    // Volver a "copiar" después de 5 segundos
    setTimeout(() => {
      registro.copiado = false;
    }, 1000);
    }).catch(err => {
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
    console.log(registro);

    if (registro.id_tipo_campania ==  1) {
      const modal_item = this.dialogService.open(ConfiguracionAudioComponent, {
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
    }else if(registro.id_tipo_campania == 2){
      const modal_item_correo = this.dialogService.open(EmailConfigurationComponent, {
        data: registro,
        header: 'Configurar Correo ' + registro.nombre,
        styleClass: 'modal-8xl',
        modal: true,
        dismissableMask: false,
        closable: true,
      });
      
      modal_item_correo.onClose.subscribe((res) => {
        if (res) {
          this.loadData();
        }
      });
    }
  }

  configurar(registro: any) {}
}
