import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@envs/environments';

@Injectable({
  providedIn: 'root'
})
export class MetabaseReportsService {

  private baseUrl = `${environment.apiUrl}v1/metabase/dashboard`;
  
  constructor(private http: HttpClient) {}

  getDashboardAlosat(id: string): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(`${this.baseUrl}/${id}`);
  }

}
