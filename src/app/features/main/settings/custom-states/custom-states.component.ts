import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  inject,
} from '@angular/core';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ColorPickerModule } from 'primeng/colorpicker';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { DialogService } from 'primeng/dynamicdialog';
import { StateFormComponent } from './state-form/state-form.component';
import { MessageGlobalService } from '@services/message-global.service';
import { CardModule } from 'primeng/card';
import { TabsModule } from 'primeng/tabs';
import { AccordionModule } from 'primeng/accordion';
import { TagModule } from 'primeng/tag';
import { CommonModule } from '@angular/common';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { DialogModule } from 'primeng/dialog';
import { EstadoCampaniaStore } from '@stores/estado-campania.store';
import { EstadoCampania } from '@models/estado-campania.model';
import { EstadoAtencionStore } from '@stores/estado-atencion.store';
import { EstadoTelefonicoStore } from '@stores/estado-telefonico.store';
import { EstadoAtencion } from '@models/estado-atencion.model';
import { EstadoTelefonico } from '@models/estado-telefonico.model';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { BtnEditSquareComponent } from '@shared/buttons/btn-edit-square/btn-edit-square.component';
import { BtnDeleteSquareComponent } from '@shared/buttons/btn-delete-square/btn-delete-square.component';

@Component({
  selector: 'app-custom-states',
  imports: [
    TableModule,
    InputTextModule,
    ColorPickerModule,
    ButtonModule,
    FormsModule,
    BreadcrumbModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    TabsModule,
    TagModule,
    AccordionModule,
    CommonModule,
    AvatarModule,
    BadgeModule,
    DialogModule,
    TableModule,
    ButtonSaveComponent,
    BtnEditSquareComponent,
    BtnDeleteSquareComponent,
  ],
  providers: [DialogService],
  templateUrl: './custom-states.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CustomStatesComponent {
  home = { icon: 'pi pi-home', routerLink: '/' };

  openModal: boolean = false;
  value: number = 0;

  private readonly msg = inject(MessageGlobalService);
  private readonly dialogService = inject(DialogService);
  readonly storeCampania = inject(EstadoCampaniaStore);
  readonly storeAtencion = inject(EstadoAtencionStore);
  readonly storeCanal = inject(EstadoTelefonicoStore);

  get totalItemsCampania(): number {
    return this.storeCampania.totalItems();
  }

  get listadoEstadosCampania(): EstadoCampania[] {
    return this.storeCampania.items();
  }

  get totalItemsAtencion(): number {
    return this.storeAtencion.totalItems();
  }

  get listadoEstadosAtencion(): EstadoAtencion[] {
    return this.storeAtencion.items();
  }

  get totalItemsCanal(): number {
    return this.storeCanal.totalItems();
  }

  get listadoEstadosCanal(): EstadoTelefonico[] {
    return this.storeCanal.items();
  }

  get estadosTelefonico(): EstadoTelefonico[] {
    return this.listadoEstadosCanal.filter((m) => m.categoria === 1);
  }

  get estadosEmail(): EstadoTelefonico[] {
    return this.listadoEstadosCanal.filter((m) => m.categoria === 2);
  }

  get estadosChat(): EstadoTelefonico[] {
    return this.listadoEstadosCanal.filter((m) => m.categoria === 3);
  }

  get estadosWhatsApp(): EstadoTelefonico[] {
    return this.listadoEstadosCanal.filter((m) => m.categoria === 4);
  }

  private resetOnSuccessEffect = effect(() => {
    // CAMPANIA
    const errorCampania = this.storeCampania.error();
    const actionCampania = this.storeCampania.lastAction();

    if (!this.openModal && errorCampania) {
      this.msg.error(errorCampania ?? '¡Error al eliminar Campaña!');
      return;
    }

    if (actionCampania === 'deleted') {
      this.msg.success('¡Estado de Campaña eliminado exitosamente!');
      this.storeCampania.clearAll();
      this.storeCampania.loadAll();
      return;
    }

    // ATENCIÓN
    const errorAtencion = this.storeAtencion.error();
    const actionAtencion = this.storeAtencion.lastAction();

    if (!this.openModal && errorAtencion) {
      this.msg.error(errorAtencion ?? '¡Error al eliminar Atención!');
      return;
    }

    if (actionAtencion === 'deleted') {
      this.msg.success('¡Estado de Atención eliminado exitosamente!');
      this.storeAtencion.clearAll();
      this.storeAtencion.loadAll();
      return;
    }

    // CANAL
    const errorCanal = this.storeCanal.error();
    const actionCanal = this.storeCanal.lastAction();

    if (!this.openModal && errorCanal) {
      this.msg.error(errorCanal ?? '¡Error al eliminar Canal Telefónico!');
      return;
    }

    if (actionCanal === 'deleted') {
      this.msg.success('¡Estado Telefónico eliminado exitosamente!');
      this.storeCanal.clearAll();
      this.storeCanal.loadAll();
      return;
    }
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.storeCampania.loadAll();
    this.storeAtencion.loadAll();
    this.storeCanal.loadAll();
  }

  openNew() {}

  nuevoEstadoCampania() {
    this.openModal = true;
    this.storeCampania.clearSelected();
    const ref = this.dialogService.open(StateFormComponent, {
      header: 'Nuevo Estado - Campaña',
      styleClass: 'modal-md',
      modal: true,
      dismissableMask: false,
      closable: true,
      data: 2,
    });

    ref.onClose.subscribe((res) => {
      this.openModal = false;
      if (res) {
        this.loadData();
      }
    });
  }

  EditarEstadoCampania(state: EstadoCampania) {
    this.storeCampania.loadById(state.id);
    this.openModal = true;
    const ref = this.dialogService.open(StateFormComponent, {
      header: 'Editar Estado - Campaña: ' + state.nombre,
      styleClass: 'modal-lg',
      modal: true,
      focusOnShow: false,
      dismissableMask: false,
      closable: true,
      data: 2,
    });

    ref.onClose.subscribe((res) => {
      this.openModal = false;
      if (res) {
        this.loadData();
      }
    });
  }

  eliminarEstadoCampania(state: any) {
    this.msg.confirm(
      `<div class='px-4 py-2'>
        <p class='text-center'> ¿Está seguro de eliminar el Estado <span class='uppercase font-bold'>${state.nombre}</span>? </p>
        <p class='text-center'> Esta acción no se puede deshacer. </p>
      </div>`,
      () => {
        this.storeCampania.delete(state.id);
      }
    );
  }

  nuevoEstadoAtencion() {
    this.openModal = true;
    this.storeAtencion.clearSelected();
    const ref = this.dialogService.open(StateFormComponent, {
      header: 'Nuevo Estado - Atención',
      styleClass: 'modal-md',
      modal: true,
      dismissableMask: false,
      closable: true,
      data: 1,
    });

    ref.onClose.subscribe((res) => {
      this.openModal = false;
      if (res) {
        this.loadData();
      }
    });
  }

  EditarEstadoAtencion(state: any) {
    this.storeAtencion.loadById(state.id);
    this.openModal = true;
    const ref = this.dialogService.open(StateFormComponent, {
      header: 'Editar estado - Atención: ' + state.nombre,
      styleClass: 'modal-lg',
      modal: true,
      dismissableMask: false,
      closable: true,
      data: 1,
    });

    ref.onClose.subscribe((res) => {
      this.openModal = false;
      if (res) {
        this.loadData();
      }
    });
  }

  eliminarEstadoAtencion(state: any) {
    this.msg.confirm(
      `<div class='px-4 py-2'>
        <p class='text-center'> ¿Está seguro de eliminar el Estado <span class='uppercase font-bold'>${state.nombre}</span>? </p>
        <p class='text-center'> Esta acción no se puede deshacer. </p>
      </div>`,
      () => {
        this.storeAtencion.delete(state.id);
      }
    );
  }

  nuevoEstadoTelefonico() {
    this.openModal = true;
    this.storeCanal.clearSelected();
    const ref = this.dialogService.open(StateFormComponent, {
      header: 'Nuevo Estado - Canal',
      styleClass: 'modal-md',
      modal: true,
      dismissableMask: false,
      closable: true,
      data: 0,
    });

    ref.onClose.subscribe((res) => {
      this.openModal = false;
      if (res) {
        this.loadData();
      }
    });
  }

  EditarEstadoTelefonico(state: any) {
    this.storeCanal.loadById(state.id);
    this.openModal = true;
    const ref = this.dialogService.open(StateFormComponent, {
      header: 'Editar estado - Canal: ' + state.nombre,
      styleClass: 'modal-lg',
      modal: true,
      dismissableMask: false,
      closable: true,
      data: 0,
    });

    ref.onClose.subscribe((res) => {
      this.openModal = false;
      if (res) {
        this.loadData();
      }
    });
  }

  eliminarEstadoTelefonico(state: any) {
    this.msg.confirm(
      `<div class='px-4 py-2'>
        <p class='text-center'> ¿Está seguro de eliminar el Estado <span class='uppercase font-bold'>${state.nombre}</span>? </p>
        <p class='text-center'> Esta acción no se puede deshacer. </p>
      </div>`,
      () => {
        this.storeCanal.delete(state.id);
      }
    );
  }
}
