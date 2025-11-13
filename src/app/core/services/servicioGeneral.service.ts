import { HttpClient } from '@angular/common/http';
import { environment } from '@envs/environments';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

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

  getAllCampania(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/gestion-campania/all`);
  }

}