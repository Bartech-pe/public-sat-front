import {
  Component,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ColorPickerModule } from 'primeng/colorpicker';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { DialogService } from 'primeng/dynamicdialog';

import { MessageGlobalService } from '@services/message-global.service';
import { CommonModule } from '@angular/common';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { Router } from '@angular/router';
import { CarteraStore } from '@stores/cartera.store';
import { Cartera } from '@models/cartera.model';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ButtonDetailComponent } from '@shared/buttons/button-detail/button-detail.component';
import { ButtonEditComponent } from '@shared/buttons/button-edit/button-edit.component';
import { ButtonDeleteComponent } from '@shared/buttons/button-delete/button-delete.component';
import { NewBriefcaseComponent } from './new-briefcase/new-briefcase.component';
import { EditBriefcaseComponent } from './edit-briefcase/edit-briefcase.component';
import { ButtonStatuComponent } from '@shared/buttons/button-statu/button-statu.component';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-briefcase',
  imports: [
    TableModule,
    InputTextModule,
    CommonModule,
    ColorPickerModule,
    ButtonModule,
    FormsModule,
    ButtonSaveComponent,
    ButtonEditComponent,
    ButtonDeleteComponent,
    OverlayPanelModule,
    ButtonDetailComponent,
    ButtonStatuComponent,
    TagModule,
  ],
  templateUrl: './briefcase.component.html',
  styles: ``,
})
export class BriefcaseComponent implements OnInit, OnDestroy {
  breadcrumbItems = [{ label: 'Inicio' }, { label: 'Carteras' }];
  home = { icon: 'pi pi-home', routerLink: '/' };
  openModal: boolean = false;
  openModalDetalle: boolean = false;
  private readonly msg = inject(MessageGlobalService);
  private readonly dialogService = inject(DialogService);
  readonly carteraStore = inject(CarteraStore);

  limit = signal(10);
  offset = signal(0);

  get listCarteras(): Cartera[] {
    return this.carteraStore.items();
  }

  constructor(private router: Router) {}

  filtroNombre: string = '';

  // filtrar() {
  //   const filtro = this.filtroNombre.toLowerCase();
  //   this.carterasFiltradas = this.listCarteras.filter((c) =>
  //     c.name.toLowerCase().includes(filtro)
  //   );
  // }

  ngOnInit(): void {
    this.loadData();
  }

  private resetOnSuccessEffect = effect(() => {
    const error = this.carteraStore.error();
    const action = this.carteraStore.lastAction();

    // Manejo de errores
    if (!this.openModal && !this.openModalDetalle && error) {
      console.log('error', error);
      this.msg.error(
        error ?? '¡Ups, ocurrió un error inesperado al eliminar la cartera!'
      );
      return; // Salimos si hay un error
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'deleted') {
      this.msg.success('¡La Cartera fue eliminado exitosamente!');
      this.carteraStore.clearAll();
      this.carteraStore.loadAll();
      return;
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'toggleStatus') {
      this.msg.success('¡El estado de la cartera se actualizó exitosamente!');
      this.carteraStore.clearAll();
      this.carteraStore.loadAll();
      return;
    }
  });

  loadData() {
    this.carteraStore.loadAll();
  }

  onPageChange(event: { limit: number; offset: number }) {
    this.limit.set(event.limit);
    this.offset.set(event.offset);
    this.loadData();
  } 

  addNew() {
    this.openModal = true;
    this.carteraStore.clearSelected();
    const ref = this.dialogService.open(NewBriefcaseComponent, {
      header: 'Crear Nueva Cartera',
      styleClass: 'modal-8xl',
      modal: true,
      dismissableMask: false,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      this.openModal = false;
      if (res) {
        this.loadData();
      }
    });
  }

  verDetalle(registro: any) {
    this.openModalDetalle = true;
    const modal_item = this.dialogService.open(EditBriefcaseComponent, {
      data: registro.id,
      header: 'Gestionar Cartera - ' + registro.name,
      styleClass: 'modal-9xl',
      modal: true,
      dismissableMask: false,
      closable: true,
    });
    modal_item.onClose.subscribe((res) => {
      this.openModalDetalle = false;
      if (res) {
        this.loadData();
      }
    });
  }

  edit(registro: any) {
    this.carteraStore.loadById(registro.id);
    this.openModal = true;
    const ref = this.dialogService.open(NewBriefcaseComponent, {
      header: 'Editar Cartera - ' + registro.name,
      styleClass: 'modal-8xl',
      modal: true,
      dismissableMask: false,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      this.openModal = false;
      if (res) {
        this.loadData();
      }
    });
  }

  editarEstadoCartera(registro: any) {
    // registro.status = true;
    // registro.amount = Number(registro.amount);
    this.msg.confirm(
      `<div class='px-4 py-2'>
        <p class='text-center'> ¿Está seguro de cambiar el estado de la cartera <span class='uppercase font-bold'>${registro.name}</span>? </p>
        <p class='text-center'> Esta acción no se puede deshacer. </p>
      </div>`,
      () => {
        this.carteraStore.toggleStatus(registro.id);
      }
    );
  }

  remove(registro: any) {
    this.msg.confirm(
      `<div class='px-4 py-2'>
        <p class='text-center'> ¿Está seguro de eliminar la cartera <span class='uppercase font-bold'>${registro.name}</span>? </p>
        <p class='text-center'> Esta acción no se puede deshacer. </p>
      </div>`,
      () => {
        this.carteraStore.delete(registro.id);
      }
    );
  }

  ngOnDestroy() {
    //this.socketService.disconnect();
  }
}
