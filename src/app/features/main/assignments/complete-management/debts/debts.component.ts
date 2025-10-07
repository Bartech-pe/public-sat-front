import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-debts',
  imports: [CommonModule],
  templateUrl: './debts.component.html',
  styles: ``,
})
export class DebtsComponent implements OnInit {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly dialogService: DialogService = inject(DialogService);

  debts: any[] = [];
  total: number = 0;

  ngOnInit(): void {
    const instance = this.dialogService.getInstance(this.ref);
    const data = instance.data;
    if (data) {
      this.debts = data.items;
      this.total = data.total;
    }
  }

  groupByref(data: any[]) {
    return data.reduce((acc, obj) => {
      const clave = obj['referencia'];
      acc[clave] = acc[clave] || [];
      acc[clave].push(obj);
      return acc;
    }, {});
  }

  getCuotaZero(array: any[]) {
    return array.find((item) => item.cuota === '0');
  }
}
