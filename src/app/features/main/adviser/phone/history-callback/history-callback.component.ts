import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  Validators,
} from '@angular/forms';
import { CallItem } from '@models/call.model';
import { DurationPipe } from '@pipes/duration.pipe';
import { AloSatService } from '@services/alo-sat.service';
import { CallService } from '@services/call.service';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { BtnCustomComponent } from '@shared/buttons/btn-custom/btn-custom.component';
import { PaginatorComponent } from '@shared/paginator/paginator.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-history-callback',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    DurationPipe,
    BtnCustomComponent,
    PaginatorComponent,
  ],
  templateUrl: './history-callback.component.html',
  styles: ``,
})
export class HistoryCallbackComponent implements OnInit {
  private readonly msg = inject(MessageGlobalService);

  public readonly ref = inject(DynamicDialogRef);

  private readonly dialogService = inject(DialogService);

  private readonly aloSatService = inject(AloSatService);

  private readonly callService = inject(CallService);

  limit = signal<number>(10);
  offset = signal<number>(0);
  totalItems?: number = 0;

  items = signal<CallItem[]>([]);

  submited: boolean = false;

  campaignId: string = '';

  ngOnInit(): void {
    const instance = this.dialogService.getInstance(this.ref);

    const data = instance.data;

    if (data) {
      const { campaignId } = data;
      this.campaignId = campaignId;
    }

    this.getCalls(this.limit(), this.offset());
  }

  getCalls(limit?: number, offset?: number, q?: Record<string, any>) {
    this.callService.getCallsByUser(limit, offset, q).subscribe((res) => {
      this.items.set(res.data);
      this.totalItems = res.total;
    });
  }

  onPageChange(event: { limit: number; offset: number }) {
    this.limit.set(event.limit);
    this.offset.set(event.offset);
    this.getCalls(this.limit(), this.offset());
  }

  onSubmit(phoneNumber: string) {
    this.submited = true;

    this.aloSatService.manualDialing(phoneNumber, '1').subscribe({
      next: (data) => {
        this.msg.success('¡Marcación exitosa!');
        this.ref.close(true);
      },
    });
  }
}
