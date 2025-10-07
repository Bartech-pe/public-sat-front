import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '@envs/environments';
export interface ProgresoCampania {
  agentes_conectados: number;
  llamadas_pendientes: number;
  llamadas_realizadas: number;
  total_leads: number;
}
@Injectable({
  providedIn: 'root'
})
export class VicidialService {
  
  private readonly baseUrl!: string;
  constructor(private http: HttpClient) {
    this.baseUrl = `${environment.apiUrl}`;
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

  getById(id: any, endpoint: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${endpoint}/${id}`)
      .pipe(catchError(this.handleError));
  }

  getByIdProgreso(id: any): Observable<ProgresoCampania> {
    return this.http.get<ProgresoCampania>(`${this.baseUrl}/central/campanias/progreso/${id}`)
      .pipe(catchError(this.handleError));
  }

  create(data: any, endpoint: string): Observable<any> {
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      return this.http.post<any>(`${this.baseUrl}/${endpoint}`, data, { headers }).pipe(catchError(this.handleError));
  }

  editarCampania(campaign_id: string, data: Partial<any>): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.patch(`${this.baseUrl}/central/campanias/${campaign_id}`, data, { headers });
  }

  eliminarCampania(campaign_id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/central/campanias/${campaign_id}`);
  }


}