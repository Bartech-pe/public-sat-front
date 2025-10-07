import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { QuickResponseItem } from '@models/quick-response.model';
import { BtnDeleteSquareComponent } from '@shared/buttons/btn-delete-square/btn-delete-square.component';
import { BtnEditSquareComponent } from '@shared/buttons/btn-edit-square/btn-edit-square.component';
import { marked } from 'marked';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-quick-card',
  templateUrl: './quick-card.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [TagModule, BtnEditSquareComponent, BtnDeleteSquareComponent],
  standalone: true,
})
export class QuickCardComponent implements OnInit {
  @Input() item!: QuickResponseItem;
  @Output() edit = new EventEmitter<void>();
  @Output() deleteItem = new EventEmitter<void>();
  constructor() {}

  ngOnInit() {}
  
  getIcon(element: string) {
    switch (element) {
      case 'Pagos y Facturación':
        return 'mdi:credit-card';
      case 'Trámites Tributarios':
        return 'mdi:warehouse';
      case 'Servicios Digitales':
        return 'pi-wallet';
      case 'Procesos Legales':
        return 'mdi:scale-balance';
      default:
        return 'mdi:bell';
    }
  }
  getFormattedContent(content: string) {
    const word = marked.parseInline(content);
    return word;
  }
}
