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
import { CarteraDetalleService } from '@services/detalleCartera.service';
import { MessageGlobalService } from '@services/message-global.service';
import { GeneralServicio } from '@services/servicioGeneral.service';
import { DetalleCarteraStore } from '@stores/detalleCartera.store';
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
  selector: 'app-asignar-cartera',
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
  templateUrl: './asignar-cartera.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``,
})
export class AsignarCarteraComponent implements OnInit {
  private readonly msg = inject(MessageGlobalService);

  mostrarAsignacionModal = false;
  cantidadCasos = 0;

  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly dialogService: DialogService = inject(DialogService);

  readonly storeUser = inject(UserStore);
  constructor(private generalServicio: GeneralServicio) {}


  idCartera: any = undefined;
  selectedRows: any[] = [];
  selectedRowsAsignados: any[] = [];

  get listUsers(): User[] {
    return this.storeUser.items().filter((user) => user.idRole === 3);
  }
  ngOnInit(): void {
    const instance = this.dialogService.getInstance(this.ref);

    const data = instance.data;
    if (data) {
      this.idCartera = data.id_cartera;
      this.selectedRows = data.asignaciones;
    }
    this.loadData();
  }

  loadData() {
    this.storeUser.loadAll();
  }

  selectedUser: any = null;
  nuevaCarga: number = 0;
  esAsignable: boolean = true;
  motivoAsignacion: string = '';

  calcularCarga(user: User) {
    console.log(user);

    this.generalServicio.getByIdDetalleAsignar(user.id).subscribe({
      next: (res) => {
        console.log(res);
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
    
    const arrayRequest: any[] = [];

    this.selectedRows.forEach((element) => {  
      arrayRequest.push({
        idCarteraDetalle: Number(element.id),
        idUserPrev: Number(element.idUser),
        idUser: Number(this.selectedUser.id),
        motivo: element.motivo,
      })
    });

    if(arrayRequest.length !=0 ){
   
      this.generalServicio.createMultiple(arrayRequest).subscribe((res) => {
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
    this.cerrarModal();
  }
}
