import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AloSatService } from '@services/alo-sat.service';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { UserStore } from '@stores/user.store';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-transfer-call',
  imports: [
    CommonModule,
    FormsModule,
    SelectModule,
    ButtonModule,
    RadioButtonModule,
  ],
  templateUrl: './transfer-call.component.html',
  styles: ``,
})
export class TransferCallComponent implements OnInit {
  private readonly dialogService = inject(DialogService);

  private readonly msg = inject(MessageGlobalService);

  readonly userStore = inject(UserStore);

  private readonly aloSatService = inject(AloSatService);

  public readonly ref = inject(DynamicDialogRef);

  listRoles = [
    { id: 2, name: 'Supervisor' },
    { id: 3, name: 'Asesor' },
  ];

  roleId?: number = 2;

  prev?: number = 2;

  userId?: number;

  get listUsers(): any[] {
    return this.userStore.items().filter((u) => u.roleId == this.roleId);
  }

  ngOnInit(): void {
    const q: Record<string, any> = {
      byTransfer: true,
    };
    this.userStore.loadAll(undefined, undefined, q);
  }

  selectRole() {
    if (this.prev != this.roleId) {
      this.userId = undefined;
      this.prev = this.roleId;
    }
  }

  onSubmit() {
    if (this.userId) {
      this.aloSatService.transferCall(this.userId).subscribe({
        next: (res) => {
          this.msg.success('¡Llamada transferida con éxito!');
          this.ref.close();
        },
      });
    }
  }
}
