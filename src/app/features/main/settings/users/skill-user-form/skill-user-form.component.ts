import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Skill, SkillUser } from '@models/skill.model';
import { MessageGlobalService } from '@services/message-global.service';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { SkillStore } from '@stores/skill.store';
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
import { ButtonDeleteComponent } from '@shared/buttons/button-delete/button-delete.component';

@Component({
  selector: 'app-skill-user-form',
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
  templateUrl: './skill-user-form.component.html',
  styles: ``,
})
export class SkillUserFormComponent implements OnInit {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly msg = inject(MessageGlobalService);

  readonly store = inject(SkillStore);

  readonly storeUser = inject(UserStore);

  assignmentList: SkillUser[] = [];

  itemSelected!: User;

  get skills(): Skill[] {
    return this.store.items();
  }

  selectedSkills: Skill[] = [];

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
      this.msg.success('Habilidad asignada exitosamente!');

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
      if (item?.skills?.length) {
        this.assignmentList = item.skills.map(
          (sk: any) =>
            ({
              name: sk.name,
              idSkill: sk.id,
              idUser: sk.SkillUser.idUser,
              score: sk.SkillUser.score,
            } as SkillUser)
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
    this.selectedSkills.forEach((item) => {
      if (!this.assignmentList.map((a) => a.idSkill).includes(item.id)) {
        this.assignmentList.push({
          name: item.name,
          idSkill: item.id,
          idUser: this.itemSelected?.id!,
          score: 0,
        } as SkillUser);
      }
    });
  }

  remove(item: SkillUser): void {
    this.assignmentList = this.assignmentList.filter(
      (i) => i.idSkill !== item.idSkill
    );
  }

  onSubmit() {
    this.store.assignment(
      this.itemSelected?.id! as number,
      this.assignmentList.map((item) => ({
        idSkill: item.idSkill,
        idUser: this.itemSelected?.id!,
        score: item.score,
      }))
    );
  }
}
