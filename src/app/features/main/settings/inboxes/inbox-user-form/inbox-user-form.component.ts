import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Inbox, InboxUser } from '@models/inbox.model';
import { User } from '@models/user.model';
import { MessageGlobalService } from '@services/message-global.service';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { InboxStore } from '@stores/inbox.store';
import { UserStore } from '@stores/user.store';
import { splitBlocks } from '@utils/array.util';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ImageModule } from 'primeng/image';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'inbox-user-form',
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
  templateUrl: './inbox-user-form.component.html',
  styles: ``,
})
export class InboxUserFormComponent implements OnInit {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly msg = inject(MessageGlobalService);

  readonly store = inject(InboxStore);

  readonly storeUser = inject(UserStore);

  assignmentList: InboxUser[][] = [];

  itemSelected: Inbox | null = null;

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
        error ?? '¡Ups, ocurrió un error inesperado al asignar el usuario!'
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
          idInbox: this.itemSelected?.id!,
        } as InboxUser;
      });
      this.assignmentList = splitBlocks<InboxUser>(list, 10);
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'assignment') {
      this.msg.success('Agente asignado exitosamente!');

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
          idInbox: this.itemSelected?.id!,
        } as InboxUser);
      }
    });
    this.assignmentList = splitBlocks<InboxUser>(list, 10);

    this.selectedUsers = [];
  }

  onSubmit() {
    this.store.assignment(
      this.itemSelected?.id! as number,
      this.assignmentList.flat().flatMap((item) => ({
        idInbox: item.idInbox,
        idUser: item.idUser,
      }))
    );
  }
}
