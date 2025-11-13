import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Portfolio } from '@models/portfolio.model';
import { CitizenAssistanceService } from '@services/citizen-assistance.service';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { PortfolioService } from '@services/portfolio.service';
import { BtnCustomComponent } from '@shared/buttons/btn-custom/btn-custom.component';
import { PortfolioStore } from '@stores/portfolio.store';
import { DatePickerModule } from 'primeng/datepicker';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-managed-download',
  imports: [
    CommonModule,
    FormsModule,
    SelectModule,
    DatePickerModule,
    BtnCustomComponent,
  ],
  templateUrl: './managed-download.component.html',
  styles: ``,
})
export class ManagedDownloadComponent implements OnInit {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly msg = inject(MessageGlobalService);

  private readonly portfolioService = inject(PortfolioService);

  private readonly citizenAssistanceService = inject(CitizenAssistanceService);

  dateSelected = signal<Date | undefined>(undefined);
  portfolioId = signal<number | undefined>(undefined);
  portfolioList = signal<Portfolio[]>([]);

  get invalid(): boolean {
    return !this.dateSelected() || !this.portfolioId();
  }

  ngOnInit(): void {}

  changeDate(e: any) {
    const dateSelected: Date = this.dateSelected()!;

    this.portfolioService
      .getAll(undefined, undefined, {
        dateSelected,
      })
      .subscribe({
        next: (res) => {
          this.portfolioList.set(res.data);
        },
      });
  }

  onCancel() {
    this.ref.close();
  }

  onSubmit() {
    const dateSelected: Date = this.dateSelected()!;
    const portfolioId: number = this.portfolioId()!;
    this.citizenAssistanceService
      .managedDownload(portfolioId, dateSelected)
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `atenciones_${
            dateSelected.toISOString().split('T')[0]
          }.xlsx`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          this.msg.error(err);
        },
      });
  }
}
