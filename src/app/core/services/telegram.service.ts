import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@envs/environments';
import { catchError, Observable, throwError } from 'rxjs';


interface TelegramAuthResponse {
  success: string;
  message: string;
}

interface TelegramAuthRequest
{
  phoneNumber: string;
  code?: string;
  force?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TelegramService {
  private readonly url = `${environment.channelConnectorApiUrl}`;

  constructor(private http: HttpClient) { }

  sendCodeAuth(request: TelegramAuthRequest): Observable<TelegramAuthResponse> {
    return this.http.post<TelegramAuthResponse>(`${this.url}telegram/init`, {...request, force: true})
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error al generar QR:', error);
          return throwError(() => new Error(error.message));
        })
      );
  }

  createAuthSession(request: TelegramAuthRequest): Observable<TelegramAuthResponse>
  {
    return this.http.post<TelegramAuthResponse>(`${this.url}telegram/confirm-code`, request)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error al generar QR:', error);
          return throwError(() => new Error(error.message));
        })
      );
  }
}
