import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { SkeletonDirective } from './skeleton/skeleton.directive';
import { PaginatorDirective } from './paginator/paginator.directive';
import { Column, SortField, SortTable } from '@models/column-table.models';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { BtnCustomComponent } from '@shared/buttons/btn-custom/btn-custom.component';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { ImageModule } from 'primeng/image';
import { BadgeModule } from 'primeng/badge';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { TooltipModule } from 'primeng/tooltip';
import { BtnDeleteComponent } from '@shared/buttons/btn-delete/btn-delete.component';
import { ButtonEditComponent } from '@shared/buttons/button-edit/button-edit.component';
import { TagModule } from 'primeng/tag';
import { ButtonSplitComponent } from '@shared/buttons/button-split/button-split.component';

@Component({
  selector: 'complete-table',
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    TableModule,
    SelectModule,
    CardModule,
    AvatarModule,
    ImageModule,
    BadgeModule,
    OverlayBadgeModule,
    TooltipModule,
    TagModule,
    SkeletonDirective,
    PaginatorDirective,
    BtnCustomComponent,
    ButtonEditComponent,
    BtnDeleteComponent,
    ButtonSplitComponent,
  ],
  templateUrl: './complete-table.component.html',
  styles: ``,
})
export class CompleteTableComponent {
  @Input() cols: Column[] = [];

  @Input() dataTable: any[] = [];

  @Input() set total(v: number) {
    this.totalItems.set(v);
  }

  @Input() set limit(v: number) {
    this.limitItems.set(v);
  }

  @Input() set offset(v: number) {
    this.offsetItems.set(v);
  }

  @Input() orderBy: SortField[] = [];

  @Output() actionClicked = new EventEmitter<{ action: string; item: any }>();

  @Output() searchChange = new EventEmitter<{
    limit: number;
    offset: number;
    q?: Record<string, any>;
  }>();

  get orderOptions(): SortTable[] {
    return [
      ...[
        {
          name: 'Fecha de creación',
          field: 'createdAt',
          type: 'date',
        },
      ],
      ...this.orderBy,
    ].flatMap((item) => {
      switch (item.type) {
        case 'date':
          return [
            {
              label: `${item.name} más nuevos`,
              field: item.field,
              order: 'DESC',
            },
            {
              label: `${item.name} más antiguos`,
              field: item.field,
              order: 'ASC',
            },
          ];
        case 'string':
          return [
            {
              label: `${item.name} de A a Z`,
              field: item.field,
              order: 'ASC',
            },
            {
              label: `${item.name} de Z a A`,
              field: item.field,
              order: 'DESC',
            },
          ];
        default:
          return [
            {
              label: `${item.name} de menor a mayor`,
              field: item.field,
              order: 'ASC',
            },
            {
              label: `${item.name} de mayor a menor`,
              field: item.field,
              order: 'DESC',
            },
          ];
      }
    });
  }

  limitItems = signal<number>(10);

  offsetItems = signal<number>(0);

  totalItems = signal<number>(0);

  limitOptions = signal<number[]>([10, 25, 50]);

  loadingTable = signal<boolean>(false);

  searchText = signal<string | undefined>(undefined);

  orderField = signal<SortTable | undefined>({
    label: 'Fecha de creación más nuevos',
    field: 'createdAt',
    order: 'DESC',
  });

  getInitial(text: string) {
    const words = text.split(' ');
    return (words[0][0] + (words[1] ? words[1][0] : '')).toUpperCase();
  }

  getFieldValue(row: any, fieldPath: string): any {
    return fieldPath.split('.').reduce((obj, key) => obj?.[key], row);
  }

  handleButtonClick(action: string, row: any) {
    this.actionClicked.emit({ action, item: row });
  }

  isButtonDisabled(btn: any, row: any): boolean {
    if (typeof btn.disabled === 'function') {
      return btn.disabled(row);
    }
    return !!btn.disabled; // si es booleano
  }

  cleanFilter() {
    this.searchText.set(undefined);
    this.sendSearch();
  }

  onPageChange = ({ limit, offset }: { limit: number; offset: number }) => {
    this.limitItems.set(limit);
    this.offsetItems.set(offset);
    this.sendSearch();
  };

  sendSearch() {
    this.searchChange.emit({
      limit: this.limitItems(),
      offset: this.offsetItems(),
      q: {
        searchText: this.searchText(),
        orderField: this.orderField(),
      },
    });
  }
}
