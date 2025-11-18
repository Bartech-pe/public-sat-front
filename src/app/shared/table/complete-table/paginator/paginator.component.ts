import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { BtnCustomComponent } from '@shared/buttons/btn-custom/btn-custom.component';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-paginator',
  imports: [CommonModule, ButtonModule, SelectModule, BtnCustomComponent],
  template: `
    <ng-template #template>
      <tr>
        <td colspan="100">
          <div
            class="flex items-center gap-2"
            [ngClass]="{
              'justify-center': position == 'center',
              'justify-start': position == 'start',
              'justify-end': position == 'end'
            }"
          >
            <div class="text-sm">
              {{ paginateValue }}
            </div>

            <btn-custom
              severity="contrast"
              icon="lucide:chevrons-left"
              [tooltip]="currentPage === 1 ? undefined : 'Primera página'"
              [disabled]="currentPage === 1"
              (click)="changePage(1)"
            />
            <btn-custom
              severity="contrast"
              icon="lucide:chevron-left"
              [tooltip]="currentPage === 1 ? undefined : 'Página anterior'"
              [disabled]="currentPage === 1"
              (click)="previous()"
            />

            @for (page of pages(); track $index) {
            <ng-container *ngIf="page === '...'; else numberButton">
              <span class="px-2 text-sm text-gray-500">...</span>
            </ng-container>
            <ng-template #numberButton>
              <p-button
                [variant]="page === currentPage ? undefined : 'text'"
                severity="contrast"
                size="small"
                rounded
                styleClass="!w-7 !h-7"
                (click)="onPageClick(page)"
              >
                <div class="flex justify-center text-sm items-center">
                  {{ page }}
                </div>
              </p-button>
            </ng-template>
            }

            <btn-custom
              severity="contrast"
              icon="lucide:chevron-right"
              [tooltip]="
                currentPage === totalPages ? undefined : 'Página siguiente'
              "
              [disabled]="currentPage === totalPages"
              (click)="next()"
            />
            <btn-custom
              severity="contrast"
              icon="lucide:chevrons-right"
              [tooltip]="
                currentPage === totalPages ? undefined : 'Última página'
              "
              [disabled]="currentPage === totalPages"
              (click)="changePage(totalPages)"
            />
            <p-select
              *ngIf="limitOptions.length"
              [options]="limitOptions"
              [(ngModel)]="limit"
              (onChange)="changeLimit($event.value)"
              class="w-19"
              styleClass="!w-19 !rounded-full !h-8 !items-center"
              appendTo="body"
            />
          </div>
        </td>
      </tr>
    </ng-template>
  `,
  styles: ``,
})
export class PaginatorComponent {
  @Input() totalItems = 0;
  @Input() limit = 10;
  @Input() offset = 0;
  @Input() position: 'start' | 'end' | 'center' = 'center';
  @Input() limitOptions: number[] = [];

  @Output() pageChange = new EventEmitter<{ limit: number; offset: number }>();

  @ViewChild('template', { static: true }) templateRef!: TemplateRef<any>;

  get currentPage(): number {
    return Math.floor(this.offset / this.limit) + 1;
  }

  get totalPages(): number {
    return this.totalItems == 0 ? 1 : Math.ceil(this.totalItems / this.limit);
  }

  get paginateValue(): string {
    return `Mostrando ${
      this.currentPage == this.totalPages
        ? this.totalItems
        : this.currentPage * this.limit
    } de ${this.totalItems}`;
  }

  onPageClick(page: number | string): void {
    if (typeof page === 'number') {
      this.changePage(page);
    }
  }

  changePage(page: number) {
    if (this.currentPage == page) return;
    const newOffset = (page - 1) * this.limit;
    this.pageChange.emit({ limit: this.limit, offset: newOffset });
  }

  next() {
    if (this.currentPage < this.totalPages) {
      this.changePage(this.currentPage + 1);
    }
  }

  previous() {
    if (this.currentPage > 1) {
      this.changePage(this.currentPage - 1);
    }
  }

  pages(): (number | string)[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const range: (number | string)[] = [];

    const showLeft = current - 1;
    const showRight = current + 1;

    // Siempre mostrar la primera página
    range.push(1);

    // Mostrar puntos si hay separación entre la primera y el bloque central
    if (showLeft > 2) {
      range.push('...');
    }

    // Agregar páginas alrededor del actual (si están dentro de rango)
    for (let i = showLeft; i <= showRight; i++) {
      if (i > 1 && i < total) {
        range.push(i);
      }
    }

    // Mostrar puntos si hay separación entre el bloque central y la última
    if (showRight < total - 1) {
      range.push('...');
    }

    // Siempre mostrar la última página si hay más de 1
    if (total > 1) {
      range.push(total);
    }

    return range;
  }

  changeLimit(e: number) {
    this.pageChange.emit({ limit: e, offset: 0 });
  }
}
