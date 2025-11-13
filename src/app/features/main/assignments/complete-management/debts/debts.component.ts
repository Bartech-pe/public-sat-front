import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
} from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-debts',
  imports: [CommonModule, AccordionModule],
  templateUrl: './debts.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``,
})
export class DebtsComponent implements OnInit {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly dialogService: DialogService = inject(DialogService);

  debts: any[] = [];
  total: number = 0;
  name?: string;
  code?: string;
  currentDate = new Date();
  debtActive: number[] = [];

  ngOnInit(): void {
    const instance = this.dialogService.getInstance(this.ref);
    const data = instance.data;
    if (data) {
      this.name = data.name;
      this.code = data.code;
      this.total = data.total;
      this.debts = data.items;
      this.debtActive = this.debts.map((_, i) => i);
      console.log('this.debts', this.debts);
    }
  }
}
