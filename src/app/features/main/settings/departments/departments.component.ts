import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { Department } from '@models/department.model';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { BtnDeleteComponent } from '@shared/buttons/btn-delete/btn-delete.component';
import { ButtonEditComponent } from '@shared/buttons/button-edit/button-edit.component';
import { PaginatorComponent } from '@shared/paginator/paginator.component';
import { DepartmentStore } from '@stores/department.store';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogService } from 'primeng/dynamicdialog';
import { ImageModule } from 'primeng/image';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { TableModule } from 'primeng/table';
import { DepartmentFormComponent } from './department-form/department-form.component';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { AuthStore } from '@stores/auth.store';

@Component({
  selector: 'app-departments',
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TableModule,
    AvatarModule,
    ImageModule,
    AvatarGroupModule,
    BadgeModule,
    OverlayBadgeModule,
    ButtonSaveComponent,
    ButtonEditComponent,
    BtnDeleteComponent,
    PaginatorComponent,
  ],
  templateUrl: './departments.component.html',
  styles: ``,
})
export class DepartmentsComponent {
  private readonly authStore = inject(AuthStore);

  get title(): string {
    return this.authStore.screenSelected()?.name!;
  }

  get description(): string {
    return this.authStore.screenSelected()?.description!;
  }

  createButtonLabel: string = 'Nueva Área';

  openModal: boolean = false;

  private readonly msg = inject(MessageGlobalService);

  private readonly dialogService = inject(DialogService);

  readonly store = inject(DepartmentStore);

  limit = signal(10);
  offset = signal(0);

  get totalItems(): number {
    return this.store.totalItems();
  }

  get listDepartments(): Department[] {
    return this.store.items();
  }

  private resetOnSuccessEffect = effect(() => {
    const error = this.store.error();
    const action = this.store.lastAction();

    // Manejo de errores
    if (!this.openModal && error) {
      console.log('error', error);
      this.msg.error(
        error ?? '¡Ups, ocurrió un error inesperado al eliminar el área!'
      );
      return; // Salimos si hay un error
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'deleted') {
      this.msg.success('¡Área eliminado exitosamente!');
      this.store.clearAll();
      this.loadData();
      return;
    }
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.store.loadAll(this.limit(), this.offset());
  }

  onPageChange(event: { limit: number; offset: number }) {
    this.limit.set(event.limit);
    this.offset.set(event.offset);
    this.loadData();
  }

  addNew() {
    this.store.clearSelected();
    this.openModal = true;
    const ref = this.dialogService.open(DepartmentFormComponent, {
      header: 'Nueva Área',
      styleClass: 'modal-lg',
      modal: true,
      focusOnShow: false,
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

  edit(item: Department) {
    this.store.loadById(item.id);
    this.openModal = true;
    const ref = this.dialogService.open(DepartmentFormComponent, {
      header: 'Editar Área',
      styleClass: 'modal-lg',
      modal: true,
      focusOnShow: false,
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

  assignment(item: Department) {
    // this.store.loadById(item.id);
    // this.openModal = true;
    // const ref = this.dialogService.open(AreaPermissionComponent, {
    //   header: `Permisos del rol - ${item.name}`,
    //   styleClass: 'modal-6xl',
    //   modal: true,
    //   data: { roleId: item.id },
    //   focusOnShow: false,
    //   dismissableMask: false,
    //   closable: true,
    // });
    // ref.onClose.subscribe((res) => {
    //   this.openModal = false;
    // });
  }

  remove(item: Department) {
    this.msg.confirm(
      `<div class='px-4 py-2'>
        <p class='text-center'> ¿Está seguro de eliminar el área <span class='uppercase font-bold'>${item.name}</span>? </p>
        <p class='text-center'> Esta acción no se puede deshacer. </p>
      </div>`,
      () => {
        this.store.delete(item.id);
      }
    );
  }
}
