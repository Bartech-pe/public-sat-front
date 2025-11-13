import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { EmailCampaign } from '@models/email-campaign.model';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EmailCampaignService extends GenericCrudService<EmailCampaign> {
  constructor(http: HttpClient) {
    super(http, 'email-campaigns');
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

  sendCampaignEmail(formData: any): Observable<any> {
    return this.http.post<any>(`${this.url}/bulk`, formData);
  }

  getEmailTemplate(id: number): Observable<any> {
    return this.http.get<any>(`${this.url}/progress/${id}`);
  }

  createlistMulti(formData: FormData): Observable<any> {
        return this.http.post<any>(`${this.url}`, formData).pipe(catchError(this.handleError));
  }
}
