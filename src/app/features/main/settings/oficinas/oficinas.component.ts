import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { MessageGlobalService } from '@services/message-global.service';
import { ButtonDeleteComponent } from '@shared/buttons/button-delete/button-delete.component';
import { ButtonEditComponent } from '@shared/buttons/button-edit/button-edit.component';
import { PaginatorComponent } from '@shared/paginator/paginator.component';
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
import { OficinaStore } from '@stores/oficina.store';
import { Oficina } from '@models/oficina.model';
import { OficinaFormComponent } from './oficina-form/oficina-form.component';

@Component({
  selector: 'app-oficinas',
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
    ButtonEditComponent,
    ButtonDeleteComponent,
    PaginatorComponent,
  ],
  templateUrl: './oficinas.component.html',
  styles: ``,
})
export class OficinasComponent {
  title: string = 'Oficinas';
  descripcion: string =
    'Un usuario es miembro de su equipo de atención al cliente, quién puede ver y responder a los mensajes del ciudadano. La siguiente lista muestra todos los usuarios en su cuenta.';

  createButtonLabel: string = 'Crear Nueva Oficina';

  openModal: boolean = false;

  private readonly msg = inject(MessageGlobalService);

  private readonly dialogService = inject(DialogService);

  readonly store = inject(OficinaStore);

  limit = signal(10);
  offset = signal(0);

  get totalItems(): number {
    return this.store.totalItems();
  }

  get listOficinas(): Oficina[] {
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
      this.msg.success('¡área eliminado exitosamente!');
      this.store.clearAll();
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
    const ref = this.dialogService.open(OficinaFormComponent, {
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

  edit(item: Oficina) {
    this.store.loadById(item.id);
    this.openModal = true;
    const ref = this.dialogService.open(OficinaFormComponent, {
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

  assignment(item: Oficina) {
    // this.store.loadById(item.id);
    // this.openModal = true;
    // const ref = this.dialogService.open(OficinaPermissionComponent, {
    //   header: `Permisos del rol - ${item.name}`,
    //   styleClass: 'modal-6xl',
    //   modal: true,
    //   data: { idRole: item.id },
    //   focusOnShow: false,
    //   dismissableMask: false,
    //   closable: true,
    // });
    // ref.onClose.subscribe((res) => {
    //   this.openModal = false;
    // });
  }

  remove(item: Oficina) {
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
