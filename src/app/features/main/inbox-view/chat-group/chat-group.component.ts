import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '@models/user.model';
import { ChatMessageService } from '@services/message.service';
import { ButtonCancelComponent } from '@shared/buttons/button-cancel/button-cancel.component';
import { ButtonSaveComponent } from '@shared/buttons/button-save/button-save.component';
import { AuthStore } from '@stores/auth.store';
import { UserStore } from '@stores/user.store';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { PopoverModule } from 'primeng/popover';
import { TableModule } from 'primeng/table';
@Component({
  selector: 'app-chat-group',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PopoverModule,
    TableModule,
    ButtonCancelComponent,
    ButtonSaveComponent,
  ],
  templateUrl: './chat-group.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``
})
export class ChatGroupComponent {
  readonly storeUser = inject(UserStore);
  readonly authStore = inject(AuthStore);

  readonly chatMessageService = inject(ChatMessageService);
  get listUsers(): User[] {
    return this.storeUser.items();
  }

  limit = signal(10);
  offset = signal(0);
  filteredList = [...this.listUsers];

  id!: number;

  get loading(): boolean {
    return this.storeUser.loading();
  }
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  formData = new FormGroup({
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    })
  });

  ngOnInit(): void {
    this.loadData();
  }
  searchTerm = '';
  selectedUsers: any[] = [];
  groupName = '';

  applyFilter() {
    const term = this.searchTerm.toLowerCase();
    this.filteredList = this.listUsers.filter(user =>
      user.displayName.toLowerCase().includes(term)
    );
  }

  loadData() {
    this.storeUser.loadAll(this.limit(), this.offset());
  }

  onCancel() {
    this.ref.close(false);
  }

  onSubmit() {

    if (this.id) {

    } else {

      const form = this.formData;
      let idUsuarioslist: number[] = [];
      this.selectedUsers.forEach(element => {
        idUsuarioslist.push(element.id);
      });

      const body = {
        name: form.value.name,
        userIds: idUsuarioslist,
        isGroup: true
      };

      console.log(body)

      this.chatMessageService.registerRoomGrupo(body).subscribe({
        next: (res) => {
          console.log('✅ Chat privado creado o encontrado:', res);
          if (res) {
            this.loadData();
            this.ref.close(res);
          }
        },
        error: (err) => {
          console.error(err);
        }
      });

    }
  }
}
