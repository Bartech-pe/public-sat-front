import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { MessageGlobalService } from '@services/generic/message-global.service';
import { AuthStore } from '@stores/auth.store';
import { catchError, EMPTY, map, of } from 'rxjs';

interface VerifyAccessResponse {
  canAccess: boolean;
  child?: { path: string };
  screen?: any;
}

export const verifyScreenGuard: CanActivateChildFn = (route, state) => {
  const authService = inject(AuthService);
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const msg = inject(MessageGlobalService);

  const stateUrl = state.url.split('?')[0];

  if (stateUrl === '/') {
    authStore.selectScreen(null);
    return of(true);
  }

  return authService.verifyAccess(stateUrl).pipe(
    map((res: VerifyAccessResponse) => {
      sessionStorage.removeItem('previousUrl');

      // Si no puede acceder → volver a raíz
      if (!res.canAccess) {
        authStore.selectScreen(null);
        router.navigate(['/']);
        return false;
      }

      // Si tiene un hijo asociado → redirigir al hijo
      if (res.child) {
        router.navigate([res.child.path]);
        return false;
      }

      // Caso normal → guardar pantalla actual
      authStore.selectScreen(res.screen ?? null);
      return true;
    }),
    catchError((error) => {
      const isServerDown =
        error.status === 0 || error.name === 'HttpErrorResponse';

      if (isServerDown) {
        console.error('Server down:', error);
        msg.error(error?.error?.message ?? 'Servidor no disponible');
        const currentUrl = router.url;
        const previousUrl = sessionStorage.getItem('previousUrl');

        if (!previousUrl && currentUrl !== '/server-down') {
          sessionStorage.setItem('previousUrl', currentUrl);
        }
        router.navigate(['/server-down']);
      } else {
        // Error de autenticación → cerrar sesión
        authService.logout();
        router.navigate(['/auth/login']);
      }
      return EMPTY;
    })
  );
};
