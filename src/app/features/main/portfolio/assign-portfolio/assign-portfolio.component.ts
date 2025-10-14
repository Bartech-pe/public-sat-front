import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { User } from '@models/user.model';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { PortfolioDetailService } from '@services/portfolio-detail.service';
import { GeneralServicio } from '@services/servicioGeneral.service';
import { UserStore } from '@stores/user.store';
import { CalendarModule } from 'angular-calendar';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import {
  DialogService,
  DynamicDialogModule,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { SliderModule } from 'primeng/slider';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-assign-portfolio',
  imports: [
    DynamicDialogModule,
    CommonModule,
    FormsModule,
    TableModule,
    InputTextModule,
    ReactiveFormsModule,
    CalendarModule,
    ButtonModule,
    SliderModule,
    DropdownModule,
  ],
  templateUrl: './assign-portfolio.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``,
})
export class AssignPortfolioComponent implements OnInit {
  private readonly msg = inject(MessageGlobalService);

  mostrarAsignacionModal = false;
  cantidadCasos = 0;

  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly dialogService: DialogService = inject(DialogService);

  readonly storeUser = inject(UserStore);
  constructor(private portfolioDetailService: PortfolioDetailService) {}

  portfolioId: any = undefined;
  selectedRows: any[] = [];
  selectedRowsAsignados: any[] = [];

  ngOnInit(): void {
    const instance = this.dialogService.getInstance(this.ref);

    const data = instance.data;
    if (data) {
      this.portfolioId = data.portfolioId;
      this.selectedRows = data.asignaciones;
    }
    this.loadData();
  }

  get listUsers(): User[] {
    const users = this.storeUser.items().filter((user) => user.roleId === 3);

    // Obtener los IDs de usuarios ya seleccionados
    const selectedUserIds = this.selectedRows.map((row) => row.user.id);

    // Filtrar los que no están en la lista seleccionada
    const filteredUsers = users.filter(
      (user) => !selectedUserIds.includes(user.id)
    );
    return filteredUsers;
  }

  loadData() {
    this.storeUser.loadAll();
  }

  selectedUser: any = null;
  nuevaCarga: number = 0;
  esAsignable: boolean = true;
  motivoAsignacion: string = '';

  calcularCarga(user: User) {
    this.portfolioDetailService
      .getByIdDetalleAsignar(user.id, this.portfolioId)
      .subscribe({
        next: (res) => {
          this.selectedRowsAsignados = res;
          const nuevosCasos = this.selectedRows.length;
          const totalCasos = res.length + nuevosCasos;
          this.nuevaCarga = totalCasos;
          this.esAsignable = true;
        },
      });
  }

  cerrarModal() {
    this.mostrarAsignacionModal = false;
    this.selectedUser = null;
    this.motivoAsignacion = '';
    this.ref.close();
  }

  confirmarAsignacion() {
    const arrayRequest: any[] = this.selectedRows.map((element) => ({
      portfolioDetailId: Number(element.id),
      userPrevId: Number(element.userId),
      userId: Number(this.selectedUser.id),
      motivo: element.motivo,
    }));

    if (arrayRequest.length != 0) {
      this.portfolioDetailService
        .createMultiple(arrayRequest)
        .subscribe((res) => {
          if (res) {
            if (res.data.length != 0) {
              this.msg.success(res.message);
              this.ref.close(res.data);
            } else {
              this.msg.info(res.message);
            }
          }
        });
    }
  }
}
