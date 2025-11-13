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
import { DialogService } from 'primeng/dynamicdialog';

import { MessageGlobalService } from '@services/generic/message-global.service';
import { CommonModule } from '@angular/common';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { Router } from '@angular/router';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ButtonEditComponent } from '@shared/buttons/button-edit/button-edit.component';
import { BtnDeleteComponent } from '@shared/buttons/btn-delete/btn-delete.component';
import { NewPortfolioComponent } from './new-portfolio/new-portfolio.component';
import { EditPortfolioComponent } from './edit-portfolio/edit-portfolio.component';
import { ButtonStatuComponent } from '@shared/buttons/button-statu/button-statu.component';
import { TagModule } from 'primeng/tag';
import { Portfolio } from '@models/portfolio.model';
import { PortfolioStore } from '@stores/portfolio.store';
import { ContactDetailsComponent } from './contact-details/contact-details.component';
import { ButtonManageComponent } from '@shared/buttons/button-manage/button-manage.component';
import { SocketService } from '@services/socket.service';
import { ProgressBarModule } from 'primeng/progressbar';
import { CardModule } from 'primeng/card';
import { BtnCustomComponent } from '@shared/buttons/btn-custom/btn-custom.component';
import { TimeRemainingPipe } from '@pipes/time-remaining.pipe';
import { PaginatorComponent } from '@shared/paginator/paginator.component';
import { ManagedDownloadComponent } from './managed-download/managed-download.component';
import { TitleSatComponent } from '@shared/title-sat/title-sat.component';
@Component({
  selector: 'app-portfolios',
  imports: [
    CommonModule,
    CardModule,
    TableModule,
    InputTextModule,
    ColorPickerModule,
    ButtonModule,
    FormsModule,
    OverlayPanelModule,
    TagModule,
    ButtonManageComponent,
    ButtonStatuComponent,
    ButtonSaveComponent,
    ButtonEditComponent,
    BtnDeleteComponent,
    BtnCustomComponent,
    ProgressBarModule,
    TimeRemainingPipe,
    PaginatorComponent,
    TitleSatComponent,
  ],
  templateUrl: './portfolios.component.html',
  styles: ``,
})
export class PortfoliosComponent implements OnInit, OnDestroy {
  openModal: boolean = false;

  openModalDetalle: boolean = false;

  private readonly msg = inject(MessageGlobalService);

  private readonly dialogService = inject(DialogService);

  private readonly socketService = inject(SocketService);

  readonly portfolioStore = inject(PortfolioStore);

  limit = signal(10);
  offset = signal(0);

  get totalItems(): number {
    return this.portfolioStore.totalItems();
  }

  get listPortfolios(): Portfolio[] {
    return this.portfolioStore.items();
  }

  progress: number = 0;
  updated: boolean = false;
  cancelLoading: boolean = false;
  remainingSeconds?: number;
  portfolioProggessId?: number;
  portfolioName?: string;
  processed: number = 0;
  percentValue: number = 0;
  total: number = 0;
  message?: string;

  mostrarMessage: boolean = false;

  filtroNombre: string = '';

  // filtrar() {
  //   const filtro = this.filtroNombre.toLowerCase();
  //   this.portfoliosFiltradas = this.listPortfolios.filter((c) =>
  //     c.name.toLowerCase().includes(filtro)
  //   );
  // }

  ngOnInit(): void {
    this.loadData();

    this.socketService.onPortfolioProgress().subscribe((data) => {
      this.mostrarMessage = true;
      (this.updated = data.updated), (this.progress = data.processed);
      this.portfolioProggessId = data.portfolioId;
      this.portfolioName = data.name;
      this.processed = data.processed;
      this.total = data.total;
      this.percentValue = data.progress;
      this.remainingSeconds = data.remainingSeconds;
    });

    // Escuchar fin del proceso
    this.socketService.onPortfolioComplete().subscribe((data) => {
      this.message = data.message;
      this.msg.success(data.message);
      this.mostrarMessage = false;
      this.clearProgress();
    });

    // Escuchar fin del proceso
    this.socketService.onPortfolioCancelled().subscribe((data) => {
      this.message = data.message;
      this.msg.info(data.message);
      this.mostrarMessage = false;
      this.clearProgress();
      this.loadData();
    });

    // Escuchar fin del proceso
    this.socketService.onPortfolioError().subscribe((data) => {
      this.message = data.message;
      this.msg.error(data.message);
    });
  }

  private resetOnSuccessEffect = effect(() => {
    const error = this.portfolioStore.error();
    const action = this.portfolioStore.lastAction();

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
      this.portfolioStore.clearAll();
      this.portfolioStore.loadAll();
      return;
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'toggleStatus') {
      this.msg.success('¡El estado de la cartera se actualizó exitosamente!');
      this.portfolioStore.clearAll();
      this.portfolioStore.loadAll();
      return;
    }
  });

  clearProgress() {
    this.progress = 0;
    this.portfolioProggessId = undefined;
    this.cancelLoading = false;
    this.portfolioName = undefined;
    this.processed = 0;
    this.total = 0;
    this.updated = false;
  }

  loadData() {
    this.portfolioStore.loadAll(this.limit(), this.offset());
  }

  cancelProgress() {
    if (this.portfolioProggessId) {
      this.msg.confirm(
        this.updated
          ? `<div class='px-4 py-2'>
        <p class='text-center'> ¿Está seguro de cancelar la carga de la cartera <span class='uppercase font-bold'>${this.portfolioName}</span>? </p>
        <p class='text-center'> Esta acción solo detendrá la carga de nuevos contribuyentes. </p>
      </div>`
          : `<div class='px-4 py-2'>
        <p class='text-center'> ¿Está seguro de cancelar la carga de la cartera <span class='uppercase font-bold'>${this.portfolioName}</span>? </p>
        <p class='text-center'> Esta acción eliminará permanentemente la cartera incompleta. </p>
      </div>`,
        () => {
          this.cancelLoading = true;
          this.socketService.cancelProtfolio(this.portfolioProggessId!);
        }
      );
    }
  }

  onPageChange(event: { limit: number; offset: number }) {
    this.limit.set(event.limit);
    this.offset.set(event.offset);
    this.loadData();
  }

  addNew() {
    this.openModal = true;
    this.portfolioStore.clearSelected();
    const ref = this.dialogService.open(NewPortfolioComponent, {
      header: 'Nueva Cartera',
      styleClass: 'modal-10xl',
      modal: true,
      dismissableMask: false,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      this.openModal = false;
      this.loadData();
      //  this.mostrarMessage = true;
      if (res) {
        this.loadData();
      }
    });
  }

  managedDownload() {
    const ref = this.dialogService.open(ManagedDownloadComponent, {
      header: 'Descargar gestionado',
      styleClass: 'modal-md',
      modal: true,
      focusOnShow: false,
      dismissableMask: false,
      closable: true,
    });

    ref.onClose.subscribe((res) => {});
  }

  verDetalle(item: Portfolio) {
    this.openModalDetalle = true;
    const modal_item = this.dialogService.open(EditPortfolioComponent, {
      data: {
        portfolioId: item.id,
        officeId: item.officeId,
      },
      header: `Gestionar Cartera - ${item.name}`,
      styleClass: 'modal-10xl',
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
    this.portfolioStore.loadById(registro.id);
    this.openModal = true;
    const ref = this.dialogService.open(NewPortfolioComponent, {
      header: 'Editar Cartera - ' + registro.name,
      styleClass: 'modal-10xl',
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

  editarEstadoPortfolio(registro: any) {
    this.msg.confirm(
      `<div class='px-4 py-2'>
        <p class='text-center'> ¿Está seguro de cambiar el estado de la cartera <span class='uppercase font-bold'>${registro.name}</span> a FINALIZADO? </p>
        <p class='text-center'> Esta acción no se puede deshacer. </p>
      </div>`,
      () => {
        this.portfolioStore.toggleStatus(registro.id);
        this.loadData();
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
        this.portfolioStore.delete(registro.id);
      }
    );
  }

  ngOnDestroy() {
    this.socketService.disconnect();
  }

  contactDetails() {
    this.openModal = true;
    const ref = this.dialogService.open(ContactDetailsComponent, {
      header: 'Datos de contacto',
      styleClass: 'modal-md',
      modal: true,
      focusOnShow: false,
      dismissableMask: false,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      this.openModal = false;
      if (res) {
        // this.loadData();
      }
    });
  }
}
