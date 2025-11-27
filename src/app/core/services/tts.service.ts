import {
  HttpClient,
  HttpErrorResponse,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@envs/environments';
import { catchError, map, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TtsService {
  protected readonly url!: string;

  constructor(protected http: HttpClient) {
    this.url = `${environment.apiUrl}v1/tts`;
  }

  create(body: { text: string }) {
    return this.http
      .post(this.url, body, {
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(
        map((response: HttpResponse<Blob>) => {
          // Éxito → devolvemos el blob
          return response.body as Blob;
        }),
        catchError((error: HttpErrorResponse) => {
          // Manejo genérico si no es JSON
          let errorMsg = 'Error al descargar el archivo.';
          if (error.status === 404) {
            errorMsg =
              'No se encontró información para el día y cartera seleccionados.';
          } else if (error.status === 500) {
            errorMsg = 'Error interno del servidor.';
          } else if (error.status === 0) {
            errorMsg = 'No se pudo conectar con el servidor.';
          }

          return throwError(() => errorMsg);
        })
      );
  }
}
