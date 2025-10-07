import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error) => {
      if (error.status === 0) {
        error.error.message =
          'No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.';
      }
      return throwError(() => error);
    })
  );
};
