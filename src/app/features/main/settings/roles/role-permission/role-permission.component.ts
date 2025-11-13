import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Role, RoleScreen } from '@models/role.model';
import { Screen } from '@models/screen.model';
import { User } from '@models/user.model';
import { MessageGlobalService } from '@services/message-global.service';
import { ScreenService } from '@services/screen.service';
import { ButtonCancelComponent } from '@shared/buttons/button-cancel/button-cancel.component';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { RoleStore } from '@stores/role.store';
import { ScreenStore } from '@stores/screen.store';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';

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

  readonly store = inject(RoleStore);

  readonly screenStore = inject(ScreenStore);

  readonly screenService = inject(ScreenService);

  permissions: RoleScreen[] = [];
  parentIdsWithChildren: RoleScreen[] = [];

  get loading(): boolean {
    return this.store.loading();
  }

  private resetOnSuccessEffect = effect(() => {
    const error = this.store.error();
    const action = this.store.lastAction();

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

      this.store.clearSelected();
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

  idRole!: number;

  ngOnInit(): void {
    // this.screenStore.loadAll();
    const instance = this.dialogService.getInstance(this.ref);

    const data = instance.data;

    if (data) {
      this.idRole = data['idRole'];

      this.cargarGrupoModulo(this.idRole);
    }
  }

  cargarGrupoModulo(id: number) {
    this.screenService.findAllByRol(id).subscribe({
      next: (data) => {
        // Obtener IDs de los padres que tienen al menos un hijo
        const parentIdsWithChildren = new Set(
          data
            .filter((parent) =>
              data.some((child) => child.idParent === parent.id)
            )
            .map((parent) => parent.id)
        );

        // Separar en dos listas: padres con hijos y los demás
        const parentsWithChildren = data.filter((item) =>
          parentIdsWithChildren.has(item.id)
        );

        const otherScreens = data.filter(
          (item) => !parentIdsWithChildren.has(item.id)
        );

        // Mapear ambos grupos a RoleScreen
        this.parentIdsWithChildren = parentsWithChildren.map((screen) =>
          this.mapToRoleScreen(screen, data)
        );

        console.log("parentIdsWithChildren", parentsWithChildren, this.parentIdsWithChildren);

        this.permissions = otherScreens.map((screen) =>
          this.mapToRoleScreen(screen, data)
        );
      },
    });
  }

  private mapToRoleScreen(screen: any, allScreens: any[]): RoleScreen {
    const role = screen?.roles?.[0];
    const roleScreen = role?.RoleScreen;

    return {
      idScreen: screen.id,
      name: screen.name,
      idRole: role?.id ?? this.idRole,
      idParent: screen.idParent,
      parent: allScreens.find((p) => p.id === screen.idParent),
      markAll: this.markAll(roleScreen),
      canRead: roleScreen?.canRead ?? false,
      canCreate: roleScreen?.canCreate ?? false,
      canUpdate: roleScreen?.canUpdate ?? false,
      canDelete: roleScreen?.canDelete ?? false,
    };
  }

  selectAll(permiso: RoleScreen) {
    permiso.canRead = permiso.markAll!;
    permiso.canCreate = permiso.markAll!;
    permiso.canUpdate = permiso.markAll!;
    permiso.canDelete = permiso.markAll!;
  }

  markAll(permiso?: RoleScreen) {
    return (
      permiso?.canRead &&
      permiso?.canCreate &&
      permiso?.canUpdate &&
      permiso?.canDelete
    );
  }

  checkMarkRead(event: boolean, permiso: RoleScreen) {
    if (event) return;
    permiso.markAll = false;
    permiso.canCreate = false;
    permiso.canUpdate = false;
    permiso.canDelete = false;
  }

  checkMarkAll(permiso: RoleScreen) {
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
    this.store.clearSelected();
    this.ref.close(false);
  }

  onSubmit() {
    this.store.assignment(
      this.idRole! as number,
      this.permissions
        .map((item: RoleScreen) => {
          const { name, markAll, idParent, parent, ...permiso } = item;
          return permiso;
        })
        .concat(
          this.parentIdsWithChildren.map((item: RoleScreen) => {
            const { name, markAll, idParent, parent, ...permiso } = item;
            return {
              ...permiso,
              canRead: this.permissions
                .filter((p) => p.idParent === item.idScreen)
                .some((p) => p.canRead),
            };
          })
        )
    );
  }
}
