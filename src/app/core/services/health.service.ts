import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@envs/environments';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HealthService {
  private baseUrl = `${environment.apiUrl}v1/health`;

  constructor(private http: HttpClient) {}

  pingServer(): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}`);
  }
}
