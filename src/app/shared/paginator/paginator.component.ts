import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { ButtonCustomComponent } from '@shared/buttons/btn-custom/btn-custom.component';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'sat-paginator',
  imports: [CommonModule, ButtonModule, ButtonCustomComponent],
  templateUrl: './paginator.component.html',
  styles: ``,
})
export class PaginatorComponent {
  @Input() totalItems = 0;
  @Input() limit = 10;
  @Input() offset = 0;

  @Output() pageChange = new EventEmitter<{ limit: number; offset: number }>();

  get currentPage(): number {
    return Math.floor(this.offset / this.limit) + 1;
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.limit);
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
}
