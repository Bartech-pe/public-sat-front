import { CommonModule } from '@angular/common';
import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'skeleton',
  standalone: true,
  imports: [CommonModule, SkeletonModule],
  template: `
    <ng-template #template>
      <ng-container *ngIf="loading; else emptyMessageTemplate">
        <tr *ngFor="let _ of arrRows; let i = index">
          <td *ngFor="let __ of arrCols; let j = index">
            <p-skeleton width="100%" height="1.5rem" />
          </td>
        </tr>
      </ng-container>

      <ng-template #emptyMessageTemplate>
        <tr>
          <td colspan="100">
            <div class="text-center text-sm font-extralight">
              No se encontraron registros.
            </div>
          </td>
        </tr>
      </ng-template>
    </ng-template>
  `,
  styles: ``,
})
export class SkeletonComponent {
  @Input() loading: boolean = false;

  @Input() numCols: number = 0;
  @Input() numRows: number = 4;

  @ViewChild('template', { static: true }) templateRef!: TemplateRef<any>;

  get arrCols(): any[] {
    return Array(this.numCols).fill(0);
  }

  get arrRows(): any[] {
    return Array(this.numRows).fill(0);
  }
}
