import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '@envs/environments';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  
   private readonly baseUrl!: string;
   private readonly urlTextoAudio!: string;
  constructor(private http: HttpClient) {
    this.baseUrl = `${environment.apiUrl}`;
    this.urlTextoAudio = `${environment.urlTextoAudio}`;
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

  getAll(endpoint: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${endpoint}`)
      .pipe(catchError(this.handleError));
  }

  getById(id: number, endpoint: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${endpoint}/${id}`)
      .pipe(catchError(this.handleError));
  }

  create(data: any, endpoint: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${endpoint}`, data)
      .pipe(catchError(this.handleError));
  }

  update(id: number, data: any, endpoint: string): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/${endpoint}/${id}`, data)
      .pipe(catchError(this.handleError));
  }

  delete(id: number, endpoint: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${endpoint}/${id}`)
      .pipe(catchError(this.handleError));
  }

  getByItemId(id_item: number, endpoint: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${endpoint}/${id_item}`)
      .pipe(catchError(this.handleError));
  }

  createTextoAudio(text: string){
   const body = new HttpParams().set('text', text);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post(`${this.urlTextoAudio}/tts`, body.toString(), { headers, responseType: 'blob' });
  }

  uploadAudio(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file); // "file" debe coincidir con el nombre usado en FileInterceptor('file')

    return this.http.post(`${this.baseUrl}/central/upload`, formData);
  }

  // createTextoAudio(data: any): Observable<any> {
  //   return this.http.post<any>(`${this.urlTextoAudio}/tts`, data)
  //     .pipe(catchError(this.handleError));
  // }

}
