import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AloSatService } from '@services/alo-sat.service';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { BtnCustomComponent } from '@shared/buttons/btn-custom/btn-custom.component';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-call-dispo',
  imports: [CommonModule, FormsModule, BtnCustomComponent, CheckboxModule],
  templateUrl: './call-dispo.component.html',
  styles: ``,
})
export class CallDispoComponent implements OnInit {
  private readonly msg = inject(MessageGlobalService);

  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly dialogService: DialogService = inject(DialogService);

  private readonly aloSatService = inject(AloSatService);

  dispoChoiceList: {
    statusId: string;
    statusName: string;
    campaignId?: string;
  }[] = [];

  dispoChoice?: string;

  pauseAgent: boolean = false;

  ngOnInit(): void {
    const instance = this.dialogService.getInstance(this.ref);

    const data = instance.data;

    if (data) {
      const { campaignId } = data;
      this.loadDispositions(campaignId);
    }
  }

  selectDispoChoice(statusId: string) {
    this.dispoChoice = statusId;
  }

  loadDispositions(campaignId: string) {
    this.aloSatService.findAllCallDisposition(campaignId).subscribe({
      next: (data) => {
        this.dispoChoiceList = data.filter((item) => !item.campaignId);
      },
    });
  }

  onCancel() {
    this.ref.close();
  }

  onSubmit() {
    this.aloSatService.updateDispo(this.dispoChoice!, this.pauseAgent).subscribe({
      next: (data) => {
        this.ref.close();
        this.msg.success('¡Resultado registrado y llamada finalizada!');
      },
    });
  }
}
