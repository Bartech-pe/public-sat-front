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

import { MessageGlobalService } from '@services/generic/message-global.service';
import { CommonModule } from '@angular/common';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { Router } from '@angular/router';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ButtonDetailComponent } from '@shared/buttons/button-detail/button-detail.component';
import { ButtonEditComponent } from '@shared/buttons/button-edit/button-edit.component';
import { BtnDeleteComponent } from '@shared/buttons/btn-delete/btn-delete.component';
import { NewPortfolioComponent } from './new-portfolio/new-portfolio.component';
import { EditPortfolioComponent } from './edit-portfolio/edit-portfolio.component';
import { ButtonStatuComponent } from '@shared/buttons/button-statu/button-statu.component';
import { TagModule } from 'primeng/tag';
import { Portfolio } from '@models/portfolio.model';
import { PortfolioStore } from '@stores/portfolio.store';
import { PortfolioDetail } from '@models/portfolio-detail.model';
import { ContactDetailsComponent } from './contact-details/contact-details.component';
import { ButtonManageComponent } from '@shared/buttons/button-manage/button-manage.component';
import { SocketService } from '@services/socket.service';
import { ProgressBarModule } from 'primeng/progressbar';
@Component({
  selector: 'app-portfolios',
  imports: [
    TableModule,
    InputTextModule,
    CommonModule,
    ColorPickerModule,
    ButtonModule,
    FormsModule,
    ButtonSaveComponent,
    ButtonEditComponent,
    BtnDeleteComponent,
    OverlayPanelModule,
    ButtonStatuComponent,
    TagModule,
    ButtonManageComponent,
    ProgressBarModule
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

  get listPortfolios(): Portfolio[] {
    return this.portfolioStore.items();
  }

  progress = 0;
  processed = 0;
  total = 0;
  message = '';

  mostrarMessage:boolean = false;

  constructor(private router: Router) {}

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
      this.progress = data.percentage;
      this.processed = data.processed;
      this.total = data.total;
      console.log(
        `📊 Cartera ${data.portfolioId}: ${data.percentage}% (${data.processed}/${data.total})`
      );
    });

    // Escuchar fin del proceso
    this.socketService.onPortfolioComplete().subscribe((data) => {
      this.message = data.message;
      this.msg.success('Proceso completado:', data.message)
      this.mostrarMessage = false;
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

  loadData() {
    this.portfolioStore.loadAll();
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

  verDetalle(registro: any) {
    this.openModalDetalle = true;
    const modal_item = this.dialogService.open(EditPortfolioComponent, {
      data: registro.id,
      header: 'Gestionar Cartera - ' + registro.name,
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
    // registro.status = true;
    // registro.amount = Number(registro.amount);
    this.msg.confirm(
      `<div class='px-4 py-2'>
        <p class='text-center'> ¿Está seguro de cambiar el estado de la cartera <span class='uppercase font-bold'>${registro.name}</span>? </p>
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
