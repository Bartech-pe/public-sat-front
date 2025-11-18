import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogService } from 'primeng/dynamicdialog';
import { ImageModule } from 'primeng/image';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { TableModule } from 'primeng/table';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { OfficeStore } from '@stores/office.store';
import { Office } from '@models/office.model';
import { OfficeFormComponent } from './office-form/office-form.component';
import { AuthStore } from '@stores/auth.store';
import { RolePermissionComponent } from './role-permission/role-permission.component';
import { TagModule } from 'primeng/tag';
import { CompleteTableComponent } from '@shared/table/complete-table/complete-table.component';
import { ColumnDefinition, SortField } from '@models/column-table.models';

@Component({
  selector: 'app-offices',
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
    CompleteTableComponent,
  ],
  templateUrl: './offices.component.html',
  styles: ``,
})
export class OfficesComponent implements OnInit {
  private readonly authStore = inject(AuthStore);

  get title(): string {
    return this.authStore.screenSelected()?.name!;
  }

  get description(): string {
    return this.authStore.screenSelected()?.description!;
  }

  createButtonLabel: string = 'Nueva Oficina';

  openModal: boolean = false;

  private readonly msg = inject(MessageGlobalService);

  private readonly dialogService = inject(DialogService);

  readonly store = inject(OfficeStore);

  cols!: ColumnDefinition[];

  orderBy: SortField[] = [
    {
      name: 'Nombre',
      field: 'name',
      type: 'string',
    },
  ];

  limit = signal(10);
  offset = signal(0);

  get totalItems(): number {
    return this.store.totalItems();
  }

  get dataTable(): Office[] {
    return this.store.items();
  }

  private resetOnSuccessEffect = effect(() => {
    const error = this.store.error();
    const action = this.store.lastAction();

    // Manejo de errores
    if (!this.openModal && error) {
      console.log('error', error);
      this.msg.error(
        error ?? '¡Ups, ocurrió un error inesperado al eliminar la oficina!'
      );
      return; // Salimos si hay un error
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'deleted') {
      this.msg.success('Oficina eliminada exitosamente!');
      this.store.clearAll();
      this.loadData();
      return;
    }
  });

  ngOnInit(): void {
    this.cols = [
      {
        fields: [
          { field: 'name' },
          { field: 'description', textClass: 'text-xs font-light italic' },
        ],
        header: 'Nombre',
        align: 'start',
      },
      {
        fields: [
          {
            field: 'department.name',
            textClass: 'text-sm capitalize text-center',
          },
        ],
        header: 'Área',
        align: 'center',
      },
      {
        header: 'Permisos',
        type: 'buttons',
        align: 'center',
        buttons: [
          {
            icon: 'lucide:layout-grid',
            tooltip: 'Permisos',
            severity: 'success',
            onClick: 'assignment',
          },
        ],
      },
      {
        field: 'status',
        type: 'boolean',
        header: 'Estado',
        align: 'center',
        trueText: 'Activo',
        falseText: 'Inactivo',
        isTag: true,
         widthClass: '!w-32',
      },
      {
        header: '',
        type: 'custom-buttons',
        buttons: [
          {
            component: 'button-edit',
            onClick: 'edit',
          },
          {
            component: 'btn-delete',
            onClick: 'remove',
          },
        ],
         widthClass: '!w-28',
      },
    ];

    this.loadData();
  }

  loadData(q?: Record<string, any>) {
    this.store.loadAll(this.limit(), this.offset(), q);
  }

  searchChange({
    limit,
    offset,
    q,
  }: {
    limit: number;
    offset: number;
    q: Record<string, any>;
  }) {
    this.limit.set(limit);
    this.offset.set(offset);
    this.loadData(q);
  }

  onTableAction(event: { action: string; item: any }) {
    const { action, item } = event;

    switch (action) {
      case 'assignment':
        this.assignment(item);
        break;
      case 'edit':
        this.edit(item);
        break;
      case 'remove':
        this.remove(item);
        break;
      default:
        console.warn(`Acción no manejada: ${action}`);
    }
  }

  addNew() {
    this.store.clearSelected();
    this.openModal = true;
    const ref = this.dialogService.open(OfficeFormComponent, {
      header: 'Nueva Oficina',
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

  edit(item: Office) {
    this.store.loadById(item.id);
    this.openModal = true;
    const ref = this.dialogService.open(OfficeFormComponent, {
      header: 'Editar Oficina',
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

  assignment(item: Office) {
    // this.store.loadById(item.id);
    this.openModal = true;
    const ref = this.dialogService.open(RolePermissionComponent, {
      header: `Permisos | ${item.name}`,
      styleClass: 'modal-10xl',
      modal: true,
      data: { officeId: item.id },
      focusOnShow: false,
      dismissableMask: false,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      this.openModal = false;
    });
  }

  remove(item: Office) {
    this.msg.confirm(
      `<div class='px-4 py-2'>
        <p class='text-center'> ¿Está seguro de eliminar la oficina <span class='uppercase font-bold'>${item.name}</span>? </p>
        <p class='text-center'> Esta acción no se puede deshacer. </p>
      </div>`,
      () => {
        this.store.delete(item.id);
      }
    );
  }
}
