import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthStore } from '../stores/auth.store';

export const redirectIfLoggedInGuard: CanMatchFn = (route, segments) => {
  const store = inject(AuthStore);
  const router = inject(Router);

  const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  // Si estamos en SSR, permitimos el acceso
  if (!isBrowser) {
    return true;
  }

  if (store.isAuthenticated()) {
    router.navigate(['/']);
    return false;
  }

  return true;
};
