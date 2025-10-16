import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@envs/environments';
import { PaginatedResponse } from '@interfaces/paginated-response.interface';
import { CallHistory, ICallFilter } from '@models/call.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CallService {
  private basePath = `${environment.apiUrl}v1/call`;

  constructor(private http: HttpClient) {}

  getQuickResponses(
    query: ICallFilter
  ): Observable<PaginatedResponse<CallHistory>> {
    const params = Object.entries(query)
      .filter(
        ([_, value]) => value !== undefined && value !== null && value !== ''
      )
      .reduce(
        (httpParams, [key, value]) => httpParams.set(key, value.toString()),
        new HttpParams()
      );
    return this.http.get<any>(this.basePath, { params });
  }
  getStateStatus(query: ICallFilter) {
    const params = Object.entries(query)
      .filter(
        ([_, value]) => value !== undefined && value !== null && value !== ''
      )
      .reduce(
        (httpParams, [key, value]) => httpParams.set(key, value.toString()),
        new HttpParams()
      );
    return this.http.get<any>(this.basePath + '/statesCount', { params });
  }
  getAdvisors() {
    return this.http.get<any>(this.basePath + '/advisors');
  }
}
