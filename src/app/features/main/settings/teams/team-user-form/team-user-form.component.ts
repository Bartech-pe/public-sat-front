import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Team, TeamUser } from '@models/team.model';
import { User } from '@models/user.model';
import { MessageGlobalService } from '@services/message-global.service';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { TeamStore } from '@stores/team.store';
import { UserStore } from '@stores/user.store';
import { splitBlocks } from '@utils/array.util';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ImageModule } from 'primeng/image';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-team-user-form',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    AvatarModule,
    ImageModule,
    MultiSelectModule,
    ButtonModule,
    ButtonSaveComponent,
  ],
  templateUrl: './team-user-form.component.html',
  styles: ``,
})
export class TeamUserFormComponent implements OnInit {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly msg = inject(MessageGlobalService);

  readonly store = inject(TeamStore);

  readonly storeUser = inject(UserStore);

  assignmentList: TeamUser[][] = [];

  itemSelected: Team | null = null;

  selectedUsers: User[] = [];

  get userList(): User[] {
    return this.storeUser.items();
  }

  get loading(): boolean {
    return this.store.loading();
  }

  private resetOnSuccessEffect = effect(() => {
    const item = this.store.selectedItem();
    const error = this.store.error();
    const action = this.store.lastAction();

    // Manejo de errores
    if (error) {
      console.log('error', error);
      this.msg.error(
        error ?? '¡Ups, ocurrió un error inesperado al guardar el rol!'
      );
      return; // Salimos si hay un error
    }

    this.itemSelected = item;

    if (item?.users?.length) {
      const list = item?.users.map((item) => {
        return {
          avatarUrl: item.avatarUrl,
          name: item.name,
          email: item.email,
          idUser: item.id,
          idTeam: this.itemSelected?.id!,
        } as TeamUser;
      });
      this.assignmentList = splitBlocks<TeamUser>(list, 10);
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'assignment') {
      this.msg.success('¡Equipo asignado exitosamente!');

      this.assignmentList = [];

      this.store.clearSelected();
      this.ref.close(true);
      return;
    }
  });

  ngOnInit(): void {
    this.storeUser.loadAll();
  }

  assign() {
    const list = this.assignmentList.flat().flat();
    this.selectedUsers.forEach((item) => {
      if (!list.map((a) => a.idUser).includes(item.id)) {
        list.push({
          avatarUrl: item.avatarUrl,
          name: item.name,
          email: item.email,
          idUser: item.id,
          idTeam: this.itemSelected?.id!,
        } as TeamUser);
      }
    });
    this.assignmentList = splitBlocks<TeamUser>(list, 10);

    this.selectedUsers = [];
  }

  onSubmit() {
    this.store.assignment(
      this.itemSelected?.id! as number,
      this.assignmentList.flat().flatMap((item) => ({
        idTeam: item.idTeam,
        idUser: item.idUser,
      }))
    );
  }
}
