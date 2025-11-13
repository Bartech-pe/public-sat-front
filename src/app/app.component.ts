import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  Inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { applySatColors } from '@constants/sat-colors';
import { AloSatService } from '@services/alo-sat.service';
import { AuthStore } from '@stores/auth.store';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, ConfirmDialog, ToastModule],
  templateUrl: './app.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppComponent implements OnInit {
  title = 'SAT';

  private readonly authStore = inject(AuthStore);

  private readonly aloSatService = inject(AloSatService);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  get isAloSat(): boolean {
    return this.authStore.user()?.idOficina === 1;
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      applySatColors();
    }
    if (this.isAloSat) {
      // this.aloSatService.startKeepalive();
    }
  }
}
