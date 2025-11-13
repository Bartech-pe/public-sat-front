import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@envs/enviroments';
import { PaginatedResponse } from '@interfaces/paginated-response.interface';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { AsignacionDetalleCartera } from '@models/detalleCartera.model';

@Injectable({
  providedIn: 'root',
})
export class GeneralServicio {

  private readonly url!: string;

  constructor(private http: HttpClient) {
    this.url = `${environment.apiUrl}`;
  }

  getByIdDetalle(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/cartera-detalle/detalle/${id}`);
  }

  getByIdDetalleAsignar(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/asignar-cartera/detalle/${id}`);
  }


  createMultiple(detalles: any[]): Observable<any> {
    return this.http.post(`${this.url}/asignar-cartera/multiple`, {
      detalles: detalles
    });
  }

  getByIdDetalleAsignado(id_user: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/asignar-cartera/detalle/${id_user}`);
  }

  getAllCampania(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/gestion-campania/all`);
  }

}