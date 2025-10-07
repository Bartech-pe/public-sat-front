import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Role } from '@models/role.model';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { BtnDeleteComponent } from '@shared/buttons/btn-delete/btn-delete.component';
import { ButtonEditComponent } from '@shared/buttons/button-edit/button-edit.component';
import { RoleStore } from '@stores/role.store';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { ImageModule } from 'primeng/image';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { TableModule } from 'primeng/table';
import { RoleFormComponent } from './role-form/role-form.component';
import { BtnCustomComponent } from '@shared/buttons/btn-custom/btn-custom.component';
import { PaginatorComponent } from '@shared/paginator/paginator.component';
import { CardModule } from 'primeng/card';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { TitleSatComponent } from '@shared/title-sat/title-sat.component';

@Component({
  selector: 'app-roles',
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
    TitleSatComponent,
    ButtonSaveComponent,
    ButtonEditComponent,
    BtnDeleteComponent,
    PaginatorComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './roles.component.html',
  styles: ``,
  providers: [DialogService],
})
export class RolesComponent {
  createButtonLabel: string = 'rol';

  openModal: boolean = false;

  private readonly msg = inject(MessageGlobalService);

  private readonly dialogService = inject(DialogService);

  readonly store = inject(RoleStore);

  limit = signal(10);
  offset = signal(0);

  get totalItems(): number {
    return this.store.totalItems();
  }

  get listRoles(): Role[] {
    return this.store.items();
  }

  private resetOnSuccessEffect = effect(() => {
    const error = this.store.error();
    const action = this.store.lastAction();

    // Manejo de errores
    if (!this.openModal && error) {
      console.log('error', error);
      this.msg.error(
        error ?? '¡Ups, ocurrió un error inesperado al eliminar el rol!'
      );
      return; // Salimos si hay un error
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'deleted') {
      this.msg.success('¡Rol eliminado exitosamente!');
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
    const ref = this.dialogService.open(RoleFormComponent, {
      header: 'Nuevo rol',
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

  edit(item: Role) {
    this.store.loadById(item.id);
    this.openModal = true;
    const ref = this.dialogService.open(RoleFormComponent, {
      header: 'Editar Rol',
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

  remove(item: Role) {
    this.msg.confirm(
      `<div class='px-4 py-2'>
        <p class='text-center'> ¿Está seguro de eliminar el rol <span class='uppercase font-bold'>${item.name}</span>? </p>
        <p class='text-center'> Esta acción no se puede deshacer. </p>
      </div>`,
      () => {
        this.store.delete(item.id);
      }
    );
  }
}
