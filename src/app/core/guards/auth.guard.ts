import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { AuthStore } from '../stores/auth.store';
import { map, of, take, tap } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const store = inject(AuthStore);
  const router = inject(Router);

  const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  // Si estamos en servidor, no validamos
  if (!isBrowser) {
    return of(true);
  }

  return store.checkSession().pipe(
    take(1), // solo queremos el primer valor
    map(() => {
      return store.isAuthenticated();
    }),
    tap((isAuth) => {
      if (!isAuth) {
        router.navigate(['/auth/login']);
      }
    }),
    map((isAuth) => isAuth)
  );
};
