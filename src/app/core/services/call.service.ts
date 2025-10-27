import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@envs/environments';
import { PaginatedResponse } from '@interfaces/paginated-response.interface';
import { CallHistory, CallItem, ICallFilter } from '@models/call.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CallService {
  private basePath = `${environment.apiUrl}v1/call`;

  constructor(private http: HttpClient) {}

  getQuickResponses(
    limit?: number,
    offset?: number,
    q?: Record<string, any>
  ): Observable<PaginatedResponse<CallItem>> {
    const query = q ? `q=${encodeURIComponent(JSON.stringify(q))}` : '';
    const limitQ = limit ? `limit=${limit}&` : '';
    const offsetQ = limit ? `offset=${offset}&` : '';
    return this.http.get<PaginatedResponse<CallItem>>(
      `${this.basePath}?${limitQ}${offsetQ}${query}`
    );
    // return this.http.get<any>(this.basePath, { params });
  }

  getStateStatus(q: Record<string, any>) {
    const query = q ? `?q=${encodeURIComponent(JSON.stringify(q))}` : '';
    return this.http.get<any>(`${this.basePath}/statesCount${query}`);
  }

  getAdvisors() {
    return this.http.get<any>(this.basePath + '/advisors');
  }

  getStatesCountByNow() {
    return this.http.get<any>(this.basePath + '/statesCountByNow');
  }
}
