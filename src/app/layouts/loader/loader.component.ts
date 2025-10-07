// loader.component.ts
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loader',
  imports: [CommonModule],
  template: `
    <div class="loader-overlay" *ngIf="loading">
      <div class="absolute">
        <div class="font-black text-2xl italic text-[#194a84]">SAT</div>
      </div>
      <div class="spinner w-20 h-20"></div>
    </div>
  `,
  styles: [
    `
      /* loader.component.css */
      .loader-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      }

      .spinner {
        border: 0.275rem solid #f3f3f3;
        border-top: 0.275rem solid #194a84;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        100% {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class LoaderComponent {
  @Input() loading = false;
}
