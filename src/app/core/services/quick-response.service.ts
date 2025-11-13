import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { ICreateQuickRespone, IQuickResponseFilter, IUpdateQuickRespone, QuickResponseModel } from '@models/QuickResponse.model';
import { environment } from '@envs/enviroments';

@Injectable({
  providedIn: 'root'
})
export class QuickResponseService {

private basePath = `${environment.apiUrl}/quick-response`;
constructor(private http: HttpClient) { }
 getQuickResponses(query:IQuickResponseFilter) {
    let params = new HttpParams();
    if (query.categoryId) {
      params = params.set('categoryId', query.categoryId.toString());
    }
    if (query.isActive !== undefined && query.isActive !== null) {
      params = params.set('isActive', query.isActive.toString());
    }
    if (query.orderby) {
      params = params.set('orderby', query.orderby);
    }
     if (query.search) {
      params = params.set('search', query.search);
    }
    return this.http.get<any>(this.basePath, { params });
 }
 postCreate(body:ICreateQuickRespone){
  return this.http.post<any>(this.basePath, body);
 }
 putUpdate(id:number,body:IUpdateQuickRespone){
return this.http.put<any>(`${this.basePath}/${id}`, body);
 }
 delete(id:number){
  return this.http.delete<any>(`${this.basePath}/${id}`);
 }


}
