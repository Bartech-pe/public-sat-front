import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'logo',
  imports: [CommonModule],
  template: `
    <div [ngClass]="['font-extrabold text-white italic', size]">SAT</div>
  `,
  styles: ``,
})
export class LogoComponent {
  _size = 'text-6xl';
  @Input() set size(value: string) {
    this._size = value;
  }

  get size(): string {
    return this._size;
  }
}
