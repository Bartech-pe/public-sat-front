import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '@envs/environments';

export interface CreateVicidialCredentialDto {
  inboxId?: number;
  name: string;
  vicidialHost: string;
  publicIp: string;
  privateIp: string;
  user: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class VicidialCredentialService {
  private baseUrl = `${environment.apiUrl}v1/vicidial-credentials`;

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse): Observable<never> {
    let mensaje = 'Error desconocido';
    if (error.error instanceof ErrorEvent) {
      // Error del cliente o red
      mensaje = `Error de red: ${error.error.message}`;
    } else {
      // Error del backend
      mensaje = `Error del servidor (${error.status}): ${error.message}`;
    }
    console.error(mensaje);
    return throwError(() => new Error(mensaje));
  }

  createCredential(payload: CreateVicidialCredentialDto): Observable<any> {
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      return this.http.post<any>(`${this.baseUrl}`, payload, { headers }).pipe(catchError(this.handleError));
  }


}
