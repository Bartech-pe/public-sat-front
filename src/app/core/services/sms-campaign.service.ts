import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GenericCrudService } from './generic/generic-crud.service';
import { MessagePreview, SmsCampaign } from '@models/sms-campaign.model';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SmsCampaignService extends GenericCrudService<SmsCampaign> {
  constructor(http: HttpClient) {
    super(http, 'sms-campaigns');
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

  readSMSExcel(file: File) {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<any>(`${this.url}/readSMSExcel`, formData);
  }

  getMessagePreview(body: MessagePreview) {
    return this.http.post<any>(`${this.url}/preview`, body);
  }

  createlistMulti(formData: FormData): Observable<any> {
      return this.http.post<any>(`${this.url}`, formData).pipe(catchError(this.handleError));
  }

  getMessagePreviewDetails(id: number) {
    return this.http.get<any>(`${this.url}/view/${id}`);
  }
}
