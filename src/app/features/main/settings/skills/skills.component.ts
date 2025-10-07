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
import { MessageGlobalService } from '@services/generic/message-global.service';
import { UserStore } from '@stores/user.store';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { BadgeModule } from 'primeng/badge';
import { ChipModule } from 'primeng/chip';
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { ImageModule } from 'primeng/image';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { TableModule } from 'primeng/table';
import { SkillFormComponent } from './skill-form/skill-form.component';
import { Skill } from '@models/skill.model';
import { CardModule } from 'primeng/card';
import { SkillStore } from '@stores/skill.store';
import { BtnDeleteSquareComponent } from '@shared/buttons/btn-delete-square/btn-delete-square.component';
import { BtnEditSquareComponent } from '@shared/buttons/btn-edit-square/btn-edit-square.component';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-skills',
  imports: [
    CommonModule,
    FormsModule,
    SelectModule,
    ButtonModule,
    TableModule,
    AvatarModule,
    ImageModule,
    InputTextModule,
    AvatarGroupModule,
    BadgeModule,
    ChipModule,
    OverlayBadgeModule,
    CardModule,
    ButtonSaveComponent,
    BtnEditSquareComponent,
    BtnDeleteSquareComponent,
    TagModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './skills.component.html',
  styles: ``,
})
export class SkillsComponent implements OnInit {
  title: string = 'Gestión de habilidades';

  descripcion: string =
    'Administra el catálogo de habilidades para los asesores.';

  createButtonLabel: string = 'Nueva Habilidad';

  private readonly msg = inject(MessageGlobalService);

  private readonly dialogService = inject(DialogService);

  readonly store = inject(SkillStore);

  limit = signal(10);
  offset = signal(0);
  searchText = signal('');

  listCategorias = [
    'Todas las categorías',
    'Tributaria',
    'No tributaria',
    'Administrativa',
  ];

  categoria: string = 'Todas las categorías';
  openModal: boolean = false;

  get totalItems(): number {
    return this.store.totalItems();
  }

  get listSkills(): Skill[] {
    return this.store
      .items()
      .filter((item) =>
        this.categoria === 'Todas las categorías'
          ? true
          : this.categoria === item.category
      );
  }

  private resetOnSuccessEffect = effect(() => {
    const error = this.store.error();
    const action = this.store.lastAction();

    // Manejo de errores
    if (!this.openModal && error) {
      console.log('error', error);
      this.msg.error(
        error ?? '¡Ups, ocurrió un error inesperado al eliminar la habilidad'
      );
      return; // Salimos si hay un error
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'deleted') {
      this.msg.success('¡Habilidad eliminada exitosamente!');

      this.store.clearAll();
      this.loadData();
      return;
    }
  });

  skills = [
    {
      name: 'Atensión rápida',
      points: 4.5,
    },
    {
      name: 'Inglés',
      points: 5,
    },
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.store.loadAll(this.limit(), this.offset());
  }

  search() {
    const q: Record<string, any> = {
      search: this.searchText(),
    };
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
    const ref = this.dialogService.open(SkillFormComponent, {
      header: 'Nueva Habilidad',
      styleClass: 'modal-md',
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

  edit(item: Skill) {
    this.store.loadById(item.id);
    const ref = this.dialogService.open(SkillFormComponent, {
      header: 'Editar Habilidad',
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

  remove(item: Skill) {
    this.msg.confirm(
      `<div class='px-4 py-2'>
        <p class='text-center'> ¿Está seguro de eliminar la habilidad <span class='uppercase font-bold'>${item.name}</span>? </p>
        <p class='text-center'> Esta acción no se puede deshacer. </p>
      </div>`,
      () => {
        this.store.delete(item.id);
      }
    );
  }
}
