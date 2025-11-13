import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  Inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { applySatColors } from '@constants/sat-colors';
import { LoaderComponent } from '@layouts/loader/loader.component';
import { AloSatService } from '@services/alo-sat.service';
import { AuthStore } from '@stores/auth.store';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    ConfirmDialog,
    ToastModule,
    LoaderComponent,
  ],
  templateUrl: './app.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppComponent implements OnInit {
  title = 'SAT';

  private readonly authStore = inject(AuthStore);

  private readonly aloSatService = inject(AloSatService);

  loading = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.loading = true; // empieza la navegación
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.loading = false; // termina la navegación
      }
    });
  }

  get isAloSat(): boolean {
    return this.authStore.user()?.officeId === 1;
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
