import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { User } from '@models/user.model';
import { UserStore } from '@stores/user.store';
import { AvatarModule } from 'primeng/avatar';
import { ImageModule } from 'primeng/image';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { TableModule } from 'primeng/table';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { UserFormComponent } from './user-form/user-form.component';
import { SkillUserFormComponent } from './skill-user-form/skill-user-form.component';
import { UserInboxFormComponent } from './user-inbox-form/user-inbox-form.component';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { VicidialUserComponent } from './user-vicidial/user-vicidial.component';
import { CardModule } from 'primeng/card';
import { TitleSatComponent } from '@shared/title-sat/title-sat.component';
import { TooltipModule } from 'primeng/tooltip';
import { CompleteTableComponent } from '@shared/table/complete-table/complete-table.component';
import { ColumnDefinition, SortField } from '@models/column-table.models';

@Component({
  selector: 'app-users',
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
    TooltipModule,
    ButtonSaveComponent,
    TitleSatComponent,
    CompleteTableComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './users.component.html',
  styles: ``,
})
export class UsersComponent implements OnInit {
  title: string = 'Usuarios';

  descripcion: string =
    'Un usuario es miembro de su equipo de atención al cliente, quién puede ver y responder a los mensajes del ciudadano.';

  createButtonLabel: string = 'Nuevo Usuario';

  openModal: boolean = false;

  private readonly msg = inject(MessageGlobalService);

  private readonly dialogService = inject(DialogService);

  readonly store = inject(UserStore);

  cols!: ColumnDefinition[];

  orderBy: SortField[] = [
    {
      name: 'Nombre',
      field: 'name',
      type: 'string',
    },
  ];

  limit = signal<number>(10);
  offset = signal<number>(0);

  get totalItems(): number {
    return this.store.totalItems();
  }

  get dataTable(): User[] {
    return this.store.items();
  }

  private resetOnSuccessEffect = effect(() => {
    const error = this.store.error();
    const action = this.store.lastAction();

    // Manejo de errores
    if (!this.openModal && error) {
      console.log('error', error);
      this.msg.error(
        error ?? '¡Ups, ocurrió un error inesperado al eliminar el usuario!'
      );
      return; // Salimos si hay un error
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'deleted') {
      this.msg.success('¡Usuario eliminado exitosamente!');

      this.store.clearSelected();
      this.loadData();
      return;
    }
  });

  ngOnInit(): void {
    this.cols = [
      {
        fields: [
          { field: 'name' },
          { field: 'email', textClass: 'text-xs font-light italic' },
        ],
        avatarUrl: 'avatarUrl',
        header: 'Nombre',
        widthClass: '!min-w-72',
      },
      {
        fields: [
          { field: 'role.name', textClass: 'text-sm capitalize text-center' },
        ],
        header: 'Rol',
        align: 'center',
      },
      {
        field: 'verify',
        type: 'boolean',
        header: 'Cuenta verificada',
        align: 'center',
        trueText: 'Verificado',
        falseText: 'Verificación pendiente',
      },
      {
        header: 'Habilidades',
        type: 'buttons',
        align: 'center',
        buttons: [
          {
            icon: 'lucide:stars',
            tooltip: 'Asignar habilidades',
            severity: 'contrast',
            badgeField: 'skills',
            onClick: 'assignmentSkills',
          },
        ],
      },
      {
        header: 'Canales',
        type: 'buttons',
        align: 'center',
        buttons: [
          {
            icon: 'fluent:channel-share-12-regular',
            tooltip: 'Asignar canales',
            severity: 'contrast',
            badgeField: 'skills',
            onClick: 'assignmentInboxes',
            disabled: (row) => !this.isAloSat(row),
          },
        ],
      },
      {
        header: 'VICIdial',
        type: 'buttons',
        align: 'center',
        buttons: [
          {
            icon: 'lucide:phone-call',
            tooltip: 'Credenciales VICIdial',
            severity: 'primary',
            badgeField: undefined,
            onClick: 'vicidialParams',
            showDot: true,
            disabled: (row) => !row.vicidial,
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
      case 'assignmentSkills':
        this.assignmentSkills(item);
        break;
      case 'assignmentInboxes':
        this.assignmentInboxes(item);
        break;
      case 'vicidialParams':
        this.vicidialParams(item);
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

  isAloSat(user: User): boolean {
    return user?.officeId === 1;
  }

  getInitial(user: User) {
    const words = user.displayName.split(' ');
    return words[0][0] + (words[1] ? words[1][0] : '');
  }

  addNew() {
    this.store.clearSelected();
    this.openModal = true;
    const ref = this.dialogService.open(UserFormComponent, {
      header: 'Nuevo usuario',
      styleClass: 'modal-lg',
      modal: true,
      focusOnShow: false,
      dismissableMask: true,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      this.openModal = false;
      if (res) {
        this.loadData();
      }
    });
  }

  edit(item: User) {
    this.openModal = true;
    this.store.loadById(item.id);
    const ref = this.dialogService.open(UserFormComponent, {
      header: 'Editar usuario',
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

  remove(item: User) {
    this.msg.confirm(
      `<div class='px-4 py-2'>
        <p class='text-center'> ¿Está seguro de eliminar el usuario <span class='uppercase font-bold'>${item.name}</span>? </p>
        <p class='text-center'> Esta acción no se puede deshacer. </p>
      </div>`,
      () => {
        this.store.delete(item.id);
      }
    );
  }

  assignmentSkills(item: User) {
    this.store.loadById(item.id);
    this.openModal = true;
    const ref = this.dialogService.open(SkillUserFormComponent, {
      header: `Asignar habilidad | ${item.name}`,
      styleClass: 'modal-md',
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

  assignmentInboxes(item: User) {
    this.store.loadById(item.id);
    this.openModal = true;
    const ref = this.dialogService.open(UserInboxFormComponent, {
      header: `Asignar canales | ${item.name}`,
      styleClass: 'modal-md',
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

  vicidialParams(item: User) {
    this.dialogService.open(VicidialUserComponent, {
      header: `Credenciales VICIdial | ${item.name}`,
      styleClass: 'modal-md',
      data: item.vicidial,
      modal: true,
      focusOnShow: false,
      dismissableMask: false,
      closable: true,
    });
  }
}
