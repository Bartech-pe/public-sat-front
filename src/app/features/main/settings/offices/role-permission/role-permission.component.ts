import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Role, RoleScreenOffice } from '@models/role.model';
import { Screen } from '@models/screen.model';
import { User } from '@models/user.model';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { RoleService } from '@services/role.service';
import { ScreenService } from '@services/screen.service';
import { ButtonCancelComponent } from '@shared/buttons/button-cancel/button-cancel.component';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { AuthStore } from '@stores/auth.store';
import { OfficeStore } from '@stores/office.store';
import { RoleStore } from '@stores/role.store';
import { ScreenStore } from '@stores/screen.store';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-role-permission',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    CheckboxModule,
    ButtonModule,
    ButtonCancelComponent,
    ButtonSaveComponent,
  ],
  templateUrl: './role-permission.component.html',
  styles: ``,
})
export class RolePermissionComponent implements OnInit {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly dialogService: DialogService = inject(DialogService);

  private readonly msg = inject(MessageGlobalService);

  readonly authStore = inject(AuthStore);

  readonly officeStore = inject(OfficeStore);

  readonly roleService = inject(RoleService);

  readonly screenStore = inject(ScreenStore);

  readonly screenService = inject(ScreenService);

  permissions: { name: string; permissions: RoleScreenOffice[] }[] = [];
  parentIdsWithChildren: { name: string; permissions: RoleScreenOffice[] }[] =
    [];

  get loading(): boolean {
    return this.officeStore.loading();
  }

  roleList: Role[] = [];

  private resetOnSuccessEffect = effect(() => {
    const error = this.officeStore.error();
    const action = this.officeStore.lastAction();

    // Manejo de errores
    if (error) {
      console.log('error', error);
      this.msg.error(
        error ?? '¡Ups, ocurrió un error inesperado al guardar los permisos!'
      );
      return; // Salimos si hay un error
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'assignment') {
      this.msg.success('Permisos asignados exitosamente!');

      this.permissions = [];

      this.officeStore.clearSelected();
      this.ref.close(true);
      return;
    }
  });

  // private userEffect = effect(() => {
  //   const items = this.screenStore.items();

  //   // Si hay un item seleccionado, se carga en el formulario
  //   if (items) {

  //   } else {
  //     this.permissions = [];
  //   }
  // });

  officeId!: number;

  ngOnInit(): void {
    const instance = this.dialogService.getInstance(this.ref);

    const data = instance.data;

    if (data) {
      this.officeId = data['officeId'];

      // Esperar a que roles y screens estén listos
      combineLatest([
        this.roleService.getAll(),
        this.screenService.findAllByOffice(this.officeId),
      ]).subscribe({
        next: ([roles, screens]) => {
          this.roleList = roles.data
            .filter((r) => r.id !== 1 && r.id !== this.authStore.user()?.roleId)
            .sort((a, b) => a.id - b.id);
          this.buildPermissions(screens, this.roleList);
        },
      });
    }
  }

  private buildPermissions(data: any[], roles: Role[]) {
    // Obtener IDs de los padres que tienen al menos un hijo
    const parentIdsWithChildren = new Set(
      data
        .filter((parent) => data.some((child) => child.parentId === parent.id))
        .map((parent) => parent.id)
    );

    const parentsWithChildren = data.filter((item) =>
      parentIdsWithChildren.has(item.id)
    );

    const otherScreens = data.filter(
      (item) => !parentIdsWithChildren.has(item.id)
    );

    this.parentIdsWithChildren = parentsWithChildren.map((screen) =>
      this.mapToRoleScreen(screen, data, roles)
    );

    this.permissions = otherScreens.map((screen) =>
      this.mapToRoleScreen(screen, data, roles)
    );
  }

  private mapToRoleScreen(screen: any, allScreens: any[], roles: Role[]) {
    return {
      name: screen.name,
      parentId: screen.parentId,
      parent: allScreens.find((p) => p.id === screen.parentId),
      permissions: roles.map((r) => {
        const roleScreen = screen.roles.find(
          (ro: Role) => ro.id === r.id
        )?.RoleScreenOffice;
        return {
          roleId: r.id,
          screenId: screen.id,
          officeId: this.officeId,
          markAll: this.markAll(roleScreen),
          canRead: roleScreen?.canRead ?? false,
          canCreate: roleScreen?.canCreate ?? false,
          canUpdate: roleScreen?.canUpdate ?? false,
          canDelete: roleScreen?.canDelete ?? false,
        };
      }),
    };
  }

  selectAll(permiso: RoleScreenOffice) {
    permiso.canRead = permiso.markAll!;
    permiso.canCreate = permiso.markAll!;
    permiso.canUpdate = permiso.markAll!;
    permiso.canDelete = permiso.markAll!;
  }

  markAll(permiso?: RoleScreenOffice) {
    return (
      permiso?.canRead &&
      permiso?.canCreate &&
      permiso?.canUpdate &&
      permiso?.canDelete
    );
  }

  checkMarkRead(event: boolean, permiso: RoleScreenOffice) {
    if (event) return;
    permiso.markAll = false;
    permiso.canCreate = false;
    permiso.canUpdate = false;
    permiso.canDelete = false;
  }

  checkMarkAll(permiso: RoleScreenOffice) {
    permiso.canRead =
      permiso.canCreate ||
      permiso.canUpdate ||
      permiso.canDelete ||
      permiso.canRead;
    permiso.markAll =
      permiso.canCreate &&
      permiso.canUpdate &&
      permiso.canDelete &&
      permiso.canRead;
  }

  onCancel() {
    this.officeStore.clearSelected();
    this.ref.close(false);
  }

  onSubmit() {
    this.officeStore.assignment(
      this.officeId! as number,
      this.permissions
        .map((item: any) => item.permissions)
        .flat()
        .map((item: RoleScreenOffice) => {
          const { name, markAll, parentId, parent, ...permiso } = item;
          return permiso;
        })
        .concat(
          this.parentIdsWithChildren
            .map((item: any) => item.permissions)
            .flat()
            .map((item: RoleScreenOffice) => {
              const { name, markAll, parentId, parent, ...permiso } = item;
              return {
                ...permiso,
                canRead: this.permissions
                  .map((p: any) => p.permissions)
                  .flat()
                  .filter((p) => p.parentId === item.screenId)
                  .some((p) => p.canRead),
              };
            })
        )
    );
  }
}
