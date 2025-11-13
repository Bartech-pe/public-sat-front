import { Component, inject, OnInit } from '@angular/core';
import { CaseInformation } from '@models/portfolio-detail.model';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-case-information',
  imports: [],
  templateUrl: './case-information.component.html',
  styles: ``,
})
export class InformacionCasoComponent implements OnInit {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly dialogService: DialogService = inject(DialogService);

  caseInformation?: CaseInformation;

  ngOnInit(): void {
    const instance = this.dialogService.getInstance(this.ref);

    this.caseInformation = instance.data;
  }
}
