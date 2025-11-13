import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@envs/environments';
import { catchError, Observable, throwError } from 'rxjs';


export interface TelegramAuthResponse {
  success: string;
  message: string;
  authStatuses?: AuthStatuses;
}
export interface AuthStatuses{
  authMethod: 'EMAIL' | 'DEFAULT',
  emailRequired: boolean;
  codeSended: boolean;
}
interface TelegramAuthRequest
{
  email?: string;
  phoneNumber: string;
  code?: string;
  force?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TelegramService {
  private readonly url = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  sendCodeAuth(request: TelegramAuthRequest): Observable<TelegramAuthResponse> {
    return this.http.post<TelegramAuthResponse>(`${this.url}v1/telegram/init`, {...request, force: true})
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error al generar QR:', error);
          return throwError(() => new Error(error.message));
        })
      );
  }

  createAuthSession(request: TelegramAuthRequest): Observable<TelegramAuthResponse>
  {
    return this.http.post<TelegramAuthResponse>(`${this.url}v1/telegram/confirm-code`, request)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error al generar QR:', error);
          return throwError(() => new Error(error.message));
        })
      );
  }
}
