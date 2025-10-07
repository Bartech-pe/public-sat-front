import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Team } from '@models/team.model';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { BtnDeleteComponent } from '@shared/buttons/btn-delete/btn-delete.component';
import { ButtonEditComponent } from '@shared/buttons/button-edit/button-edit.component';
import { TeamStore } from '@stores/team.store';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { ImageModule } from 'primeng/image';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { TableModule } from 'primeng/table';
import { TeamFormComponent } from './team-form/team-form.component';
import { BtnCustomComponent } from '@shared/buttons/btn-custom/btn-custom.component';
import { TeamUserFormComponent } from './team-user-form/team-user-form.component';
import { PaginatorComponent } from '@shared/paginator/paginator.component';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-teams',
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
    ButtonEditComponent,
    BtnDeleteComponent,
    BtnCustomComponent,
    PaginatorComponent,
    CardModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './teams.component.html',
  styles: ``,
})
export class TeamsComponent implements OnInit {
  title: string = 'Equipos';
  descripcion: string =
    'Los equipos te permiten organizar a los agentes en grupos basados en sus responsabilidades. Un agente puede pertenecer a varios equipos. Cuando trabajas en colaboración, puedes asignar conversaciones a equipos específicos.';

  createButtonLabel: string = 'Nuevo Equipo';

  openModal: boolean = false;

  private readonly msg = inject(MessageGlobalService);

  private readonly dialogService = inject(DialogService);

  readonly store = inject(TeamStore);

  limit = signal(10);
  offset = signal(0);

  get totalItems(): number {
    return this.store.totalItems();
  }

  get listTeams(): Team[] {
    return this.store.items();
  }

  private resetOnSuccessEffect = effect(() => {
    const error = this.store.error();
    const action = this.store.lastAction();

    // Manejo de errores
    if (!this.openModal && error) {
      console.log('error', error);
      this.msg.error(
        error ?? '¡Ups, ocurrió un error inesperado al eliminar el equipo!'
      );
      return; // Salimos si hay un error
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'deleted') {
      this.msg.success('¡equipo eliminado exitosamente!');
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

  onPageChange(event: { limit: number; offset: number }) {
    this.limit.set(event.limit);
    this.offset.set(event.offset);
    this.loadData();
  }

  addNew() {
    this.store.clearSelected();
    this.openModal = true;
    const ref = this.dialogService.open(TeamFormComponent, {
      header: 'Nuevo Equipo',
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

  edit(item: Team) {
    this.store.loadById(item.id);
    this.openModal = true;
    const ref = this.dialogService.open(TeamFormComponent, {
      header: 'Editar Equipo',
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

  assignment(item: Team) {
    this.store.loadById(item.id);
    this.openModal = true;
    const ref = this.dialogService.open(TeamUserFormComponent, {
      header: `Añadir agentes al equipo - ${item.name}`,
      styleClass: 'modal-6xl',
      modal: true,
      focusOnShow: false,
      dismissableMask: false,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      this.openModal = false;
    });
  }

  remove(item: Team) {
    this.msg.confirm(
      `<div class='px-4 py-2'>
        <p class='text-center'> ¿Está seguro de eliminar el equipo <span class='uppercase font-bold'>${item.name}</span>? </p>
        <p class='text-center'> Esta acción no se puede deshacer. </p>
      </div>`,
      () => {
        this.store.delete(item.id);
      }
    );
  }
}
