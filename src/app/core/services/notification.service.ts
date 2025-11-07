import { Injectable } from '@angular/core';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ChatMessageNotication } from '@models/chat-message.model';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationService extends GenericCrudService<ChatMessageNotication> {
  constructor(http: HttpClient) {
    super(http, 'notifications');
  }

  
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

  findAllByuserId(): Observable<any[]> {
      return this.http.get<any[]>(`${this.url}/unread`);
  }

  
  allAsReadNotification(data: any): Observable<any> {
     
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      return this.http.post<any>(`${this.url}/mark-all-as-read`, data, { headers }).pipe(catchError(this.handleError));
  }
 

}
