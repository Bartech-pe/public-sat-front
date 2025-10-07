import { Component, Input } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-modal-loader',
  imports: [ProgressBarModule, ProgressSpinnerModule],
  providers: [MessageService],
  templateUrl: './modal-loader.component.html',
  styles: ``
})
export class ModalLoaderComponent {

  @Input() messageLoader: string = "Cargando...";
}
