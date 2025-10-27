import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Inbox } from '@models/inbox.model';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { BtnCustomComponent } from '@shared/buttons/btn-custom/btn-custom.component';
import { BtnDeleteComponent } from '@shared/buttons/btn-delete/btn-delete.component';
import { ButtonEditComponent } from '@shared/buttons/button-edit/button-edit.component';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { PaginatorComponent } from '@shared/paginator/paginator.component';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { TableModule } from 'primeng/table';
import { InboxFormComponent } from './inbox-form/inbox-form.component';
import { InboxUserFormComponent } from './inbox-user-form/inbox-user-form.component';
import { ImageModule } from 'primeng/image';
import { InboxStore } from '@stores/inbox.store';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-channels',
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    RouterModule,
    AvatarModule,
    AvatarGroupModule,
    ImageModule,
    BadgeModule,
    OverlayBadgeModule,
    TableModule,
    PaginatorComponent,
    ButtonSaveComponent,
    ButtonEditComponent,
    BtnDeleteComponent,
    BtnCustomComponent,
  ],
  templateUrl: './channels.component.html',
  styles: ``,
})
export class ChannelsComponent {
  title: string = 'Canales';
  descripcion: string =
    'Un canal es el modo de comunicación que tu cliente elige para interactuar contigo. Una bandeja de entrada es donde administras interacciones para un canal específico. Puede incluir comunicaciones de diversas fuentes como correo electrónico, chat en vivo y redes sociales.';

  createButtonLabel: string = 'Configurar canal';

  openModal: boolean = false;

  private readonly msg = inject(MessageGlobalService);

  private readonly dialogService = inject(DialogService);

  readonly store = inject(InboxStore);

  limit = signal(10);
  offset = signal(0);

  get totalItems(): number {
    return this.store.totalItems();
  }

  get listInboxes(): Inbox[] {
    return this.store.items().filter(x => !['instagram', 'messenger'].includes(x.name));
  }

  private resetOnSuccessEffect = effect(() => {
    const error = this.store.error();
    const action = this.store.lastAction();

    // Manejo de errores
    if (!this.openModal && error) {
      console.log('error', error);
      this.msg.error(
        error ?? '¡Ups, ocurrió un error inesperado al eliminar el canal!'
      );
      return; // Salimos si hay un error
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'deleted') {
      this.msg.success('Canal eliminado exitosamente!');
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
    // this.store.clearSelected();
    this.openModal = true;
    const ref = this.dialogService.open(InboxFormComponent, {
      header: 'Nueva entrada',
      styleClass: 'modal-lg',
      maskStyleClass: 'backdrop-blur-sm',
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

  edit(item: Inbox) {
    // this.store.loadById(item.id);
    this.openModal = true;
    const ref = this.dialogService.open(InboxFormComponent, {
      data: item,
      header: 'Editar entrada',
      styleClass: 'modal-2xl',
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

  assignment(item: Inbox) {
    this.store.loadById(item.id);
    this.openModal = true;
    const ref = this.dialogService.open(InboxUserFormComponent, {
      header: `Añadir agentes - ${item.name} (${item.channel?.name})`,
      styleClass: 'modal-6xl',
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

  remove(item: Inbox) {
    this.msg.confirm(
      `<div class='px-4 py-2'>
          <p class='text-center'> ¿Está seguro de eliminar el canal <span class='uppercase font-bold'>${item.name}</span>? </p>
          <p class='text-center'> Esta acción no se puede deshacer. </p>
        </div>`,
      () => {
        this.store.delete(item.id);
      }
    );
  }
}
