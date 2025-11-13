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
import { ButtonEditComponent } from '@shared/buttons/button-edit/button-edit.component';
import { ButtonDeleteComponent } from '@shared/buttons/button-delete/button-delete.component';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageGlobalService } from '@services/message-global.service';
import { UserFormComponent } from './user-form/user-form.component';
import { SkillUserFormComponent } from './skill-user-form/skill-user-form.component';
import { ButtonCustomComponent } from '@shared/buttons/btn-custom/btn-custom.component';
import { UserInboxFormComponent } from './user-inbox-form/user-inbox-form.component';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { UserVicidialComponent } from './user-vicidial/user-vicidial.component';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-users',
  imports: [
    CommonModule,
    ButtonModule,
    TableModule,
    AvatarModule,
    ImageModule,
    AvatarGroupModule,
    BadgeModule,
    OverlayBadgeModule,
    ButtonSaveComponent,
    ButtonCustomComponent,
    ButtonEditComponent,
    ButtonDeleteComponent,
    CardModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './users.component.html',
  styles: ``,
})
export class UsersComponent implements OnInit {
  title: string = 'Usuarios';

  descripcion: string =
    'Un usuario es miembro de su equipo de atención al cliente, quién puede ver y responder a los mensajes del ciudadano.';

  createButtonLabel: string = 'Crear usuario';

  openModal: boolean = false;

  private readonly msg = inject(MessageGlobalService);

  private readonly dialogService = inject(DialogService);

  readonly store = inject(UserStore);

  limit = signal(10);
  offset = signal(0);

  get totalItems(): number {
    return this.store.totalItems();
  }

  get listUsers(): User[] {
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

      this.store.clearSelected();
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

  addNew() {
    this.store.clearSelected();
    this.openModal = true;
    const ref = this.dialogService.open(UserFormComponent, {
      header: 'Nuevo Usuario',
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
      header: 'Editar Agente',
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
        <p class='text-center'> ¿Está seguro de eliminar el rol <span class='uppercase font-bold'>${item.name}</span>? </p>
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
      header: `Asignar habilidad - ${item.name}`,
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
      header: `Asignar canales - ${item.name}`,
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
    const ref = this.dialogService.open(UserVicidialComponent, {
      header: `Credenciales VICIdial | ${item.name}`,
      styleClass: 'modal-md',
      modal: true,
      data: item.vicidial,
      focusOnShow: false,
      dismissableMask: false,
      closable: true,
    });
  }
}
