import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageGlobalService } from '@services/message-global.service';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { UserStore } from '@stores/user.store';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ImageModule } from 'primeng/image';
import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { RatingModule } from 'primeng/rating';
import { InputNumberModule } from 'primeng/inputnumber';
import { User } from '@models/user.model';
import { InboxStore } from '@stores/inbox.store';
import { Inbox, InboxUser } from '@models/inbox.model';
import { ButtonDeleteComponent } from '@shared/buttons/button-delete/button-delete.component';

@Component({
  selector: 'app-user-inbox-form',
  imports: [
    CommonModule,
    FormsModule,
    MultiSelectModule,
    RatingModule,
    TableModule,
    AvatarModule,
    ImageModule,
    CheckboxModule,
    InputNumberModule,
    ButtonModule,
    ButtonSaveComponent,
    ButtonDeleteComponent,
  ],
  templateUrl: './user-inbox-form.component.html',
  styles: ``,
})
export class UserInboxFormComponent implements OnInit {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly msg = inject(MessageGlobalService);

  readonly store = inject(InboxStore);

  readonly storeUser = inject(UserStore);

  assignmentList: InboxUser[] = [];

  itemSelected!: User;

  get inboxes(): Inbox[] {
    return this.store.items();
  }

  selectedInboxes: Inbox[] = [];

  get loading(): boolean {
    return this.store.loading();
  }

  private resetOnSuccessEffect = effect(() => {
    const item = this.storeUser.selectedItem();
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

    // Si se ha creado o actualizado correctamente
    if (action === 'assignment') {
      this.msg.success('¡Canal asignado exitosamente!');

      this.assignmentList = [];

      this.store.clearSelected();
      this.ref.close(true);
      return;
    }
  });

  private userEffect = effect(() => {
    const item = this.storeUser.selectedItem();
    // Si hay un item seleccionado, se carga en el formulario
    if (item) {
      this.itemSelected = item;
      if (item?.inboxes?.length) {
        this.assignmentList = item.inboxes.map(
          (inbox: any) =>
            ({
              idInbox: inbox.id,
              idUser: inbox.InboxUser.idUser,
              inbox: inbox,
            } as InboxUser)
        );
      } else {
        this.assignmentList = [];
      }
    }
  });

  ngOnInit(): void {
    this.store.loadAll();
  }

  get invalid(): boolean {
    return !this.assignmentList.length;
  }

  assign() {
    this.selectedInboxes.forEach((item) => {
      if (!this.assignmentList.map((a) => a.idInbox).includes(item.id)) {
        this.assignmentList.push({
          idInbox: item.id,
          idUser: this.itemSelected?.id!,
          inbox: item,
        } as InboxUser);
      }
    });
  }

  remove(item: InboxUser): void {
    this.assignmentList = this.assignmentList.filter(
      (i) => i.idInbox !== item.idInbox
    );
  }

  onSubmit() {
    const q: Record<string, any> = {
      byUser: true,
    };
    this.store.assignment(
      this.itemSelected?.id! as number,
      this.assignmentList.map((item) => ({
        idInbox: item.idInbox,
        idUser: this.itemSelected?.id!,
      })),
      q
    );
  }
}
