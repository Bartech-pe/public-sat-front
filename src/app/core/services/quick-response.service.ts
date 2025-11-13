import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { environment } from '@envs/environments';
import {
  ICreateQuickRespone,
  IQuickResponseFilter,
  IUpdateQuickRespone,
} from '@models/quick-response.model';

@Injectable({
  providedIn: 'root',
})
export class QuickResponseService {
  private basePath = `${environment.apiUrl}v1/quick-response`;
  constructor(private http: HttpClient) {}
  getQuickResponses(query: IQuickResponseFilter) {
    let params = new HttpParams();
    if (query.categoryId) {
      params = params.set('categoryId', query.categoryId.toString());
    }
    if (query.status !== undefined && query.status !== null) {
      params = params.set('status', query.status.toString());
    }
    if (query.orderby) {
      params = params.set('orderby', query.orderby);
    }
    if (query.search) {
      params = params.set('search', query.search);
    }
    return this.http.get<any>(this.basePath, { params });
  }
  postCreate(body: ICreateQuickRespone) {
    return this.http.post<any>(this.basePath, body);
  }
  putUpdate(id: number, body: IUpdateQuickRespone) {
    return this.http.put<any>(`${this.basePath}/${id}`, body);
  }
  delete(id: number) {
    return this.http.delete<any>(`${this.basePath}/${id}`);
  }
}
