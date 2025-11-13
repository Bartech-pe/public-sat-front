import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  signal,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Inbox } from '@models/inbox.model';
import { GlobalService } from '@services/global-app.service';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { InboxStore } from '@stores/inbox.store';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ToggleSwitch } from 'primeng/toggleswitch';

@Component({
  selector: 'app-assign-supervisor',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    FormsModule,
    ToggleSwitch,
  ],
  templateUrl: './assign-supervisor.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``,
})
export class AssignSupervisorComponent {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);
  checked: boolean = false;

  readonly store = inject(InboxStore);

  limit = signal(10);
  offset = signal(0);

  user: any = {};
  get totalItems(): number {
    return this.store.totalItems();
  }

  get listInboxes(): Inbox[] {
    return this.store.items();
  }

  constructor(
    public config: DynamicDialogConfig,
    private msg: MessageGlobalService,
    private globalService: GlobalService
  ) {}

  ngOnInit(): void {
    if (this.config.data) {
      this.user = this.config.data;
      this.loadData();
      this.globalService
        .getByItemId(this.user.id, 'inboxs/assignment')
        .subscribe((resp) => {
          if (resp && Array.isArray(resp)) {
            const idsAsignados = resp.map((r: any) => r.inboxId);

            this.listInboxes.forEach((item) => {
              item.checked = idsAsignados.includes(item.id); // modifica directamente el campo
            });
          }
        });
    }
  }

  loadData() {
    this.store.loadAll(this.limit(), this.offset());
  }

  onPageChange(event: { limit: number; offset: number }) {
    this.limit.set(event.limit);
    this.offset.set(event.offset);
    // this.loadData();
  }

  btnAsignarCanal() {
    const idsSeleccionados = this.listInboxes
      .filter((item) => item.checked)
      .map((item) => ({
        inboxId: item.id,
        userId: this.user.id,
      }));

    this.globalService
      .create(idsSeleccionados, `inboxs/assignment/supervisor/${this.user.id}`)
      .subscribe((res) => {
        if (res) {
          this.ref.close(true);
        }
      });
  }

  onCancel() {
    this.ref.close();
  }
}
