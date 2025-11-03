import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HealthService } from '@services/health.service';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export const serverDownGuard: CanActivateFn = () => {
  const healthService = inject(HealthService);
  const router = inject(Router);

  // Intento simple al backend (puede ser /ping, /health, etc.)
  return healthService.pingServer().pipe(
    map(() => {
      // Server volvió → redirigir a la página principal
      const previousUrl = sessionStorage.getItem('previousUrl');
      router.navigate([previousUrl ?? '/']);
      return false;
    }),
    catchError(() => {
      // Server sigue caído → permitir acceso a /server-down
      return of(true);
    })
  );
};
