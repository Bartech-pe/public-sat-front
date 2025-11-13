// auth-google.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '@services/auth.service';

export const authGoogleGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // console.log("🚀 [authGoogleGuard] Se ejecutó el guard");
  // console.log("🔒 [authGoogleGuard] Estado de sesión:", auth.isLoggedIn());
  // console.log("🔒 [authGoogleGuard] Ruta solicitada:", state.url);

  // if (auth.isLoggedIn()) {
  //   return true;
  // }

  console.warn("❌ Usuario NO autenticado → redirigiendo a /mail");
  router.navigate(['/mail']);
  return false;
};
