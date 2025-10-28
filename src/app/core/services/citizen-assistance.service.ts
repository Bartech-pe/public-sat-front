import { Injectable } from '@angular/core';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import {
  HttpClient,
  HttpErrorResponse,
  HttpResponse,
} from '@angular/common/http';
import { CitizenAssistance } from '@models/citizen-assistance.model';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CitizenAssistanceService extends GenericCrudService<CitizenAssistance> {
  constructor(http: HttpClient) {
    super(http, 'citizen-assistances');
  }

  findByPortfolioDetail(
    portfolioDetailId: number
  ): Observable<CitizenAssistance[]> {
    return this.http.get<CitizenAssistance[]>(
      `${this.url}/findByPortfolioDetail/${portfolioDetailId}`
    );
  }

  findVerificacionByPortfolioDetail(
    portfolioDetailId: number
  ): Observable<CitizenAssistance[]> {
    return this.http.get<CitizenAssistance[]>(
      `${this.url}/findVerificacionByPortfolioDetail/${portfolioDetailId}`
    );
  }

  findByDocIde(docIde: string): Observable<CitizenAssistance[]> {
    return this.http.get<CitizenAssistance[]>(
      `${this.url}/findByDocIde/${docIde}`
    );
  }

  managedDownload(portfolioId: number, dateSelected: Date) {
    return this.http
      .get(`${this.url}/managed-download/${portfolioId}/${dateSelected}`, {
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
