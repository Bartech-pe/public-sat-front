import { inject, Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '@envs/environments';
import {
  CampaignData,
  CampaignResumenMultype,
} from '@models/audio-campaign.model';
export interface ProgresoCampania {
  agentes_conectados: number;
  llamadas_pendientes: number;
  llamadas_realizadas: number;
  total_leads: number;
}
@Injectable({
  providedIn: 'root',
})
export class AudioStoreService {
  private readonly baseUrl: string = `${environment.apiUrl}v1/audio-store/`;

  private readonly http = inject(HttpClient);

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

  getAudioStoreDirectory(): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(`${this.baseUrl}directory`);
  }

  getlistCampania(id: string): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.baseUrl}listas/${id}`)
      .pipe(catchError(this.handleError));
  }

  createlista(data: any, file: File): Observable<any> {
    const formData = new FormData();

    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });

    formData.append('file', file, file.name);

    return this.http
      .post<any>(`${this.baseUrl}listas`, formData)
      .pipe(catchError(this.handleError));
  }

  getAllAudio(): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.baseUrl}audios`)
      .pipe(catchError(this.handleError));
  }

  getByIdCampaignResumenMultype(id: any): Observable<CampaignResumenMultype> {
    return this.http
      .get<CampaignResumenMultype>(`${this.baseUrl}listasMultiple/${id}`)
      .pipe(catchError(this.handleError));
  }

  createlistaMultiple(data: any, file: File): Observable<any> {
    const formData = new FormData();

    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });

    formData.append('file', file, file.name);

    return this.http
      .post<any>(`${this.baseUrl}listasMultiple`, formData)
      .pipe(catchError(this.handleError));
  }

  editarList(listId: number, data: Partial<any>): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.patch(`${this.baseUrl}campanias/list/${listId}`, data, {
      headers,
    });
  }

  uploadAudio(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file); // "file" debe coincidir con el nombre usado en FileInterceptor('file')

    return this.http.post(`${this.baseUrl}upload`, formData);
  }
}
