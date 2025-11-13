import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { MessageGlobalService } from '@services/message-global.service';
import { AuthStore } from '@stores/auth.store';
import { catchError, EMPTY, map, of } from 'rxjs';

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
    catchError((error) => {
      const isServerDown =
        error.status === 0 || error.name === 'HttpErrorResponse';

      if (isServerDown) {
        console.log('error', error);
        msg.error(error?.error?.message);
        const currentUrl = router.url;
        sessionStorage.setItem('previousUrl', currentUrl);
        router.navigate(['/server-down']);
      } else {
        authService.logout();
        router.navigate(['/auth/login']);
      }
      return EMPTY;
    }),
    map((res: any) => {
      if (!res.canAccess) {
        authStore.selectScreen(null);
        router.navigate(['/']);
        return false;
      } else if (res.child) {
        router.navigate([res.child.url]);
        return false;
      }
      authStore.selectScreen(res?.screen);
      return true;
    }),
    catchError(() => {
      router.navigate(['/']);
      return of(false);
    })
  );
};
