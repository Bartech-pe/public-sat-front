import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@envs/enviroments';
import { ICreateFeriado, IUpdateFeriado } from '@models/feriado.model';

@Injectable({
  providedIn: 'root'
})
export class FeriadoService {

private basePath = `${environment.apiUrl}/feriado`;
constructor(private http: HttpClient) { }
 getByDate(date:Date){
    return this.http.get<any>(`${this.basePath}/date/${date}`);
 }
getAll(){
    return this.http.get<any>(`${this.basePath}`);
 }
 postCreate(body:ICreateFeriado){
  return this.http.post<any>(this.basePath, body);
 }
 putUpdate(id:number,body:IUpdateFeriado){
return this.http.put<any>(`${this.basePath}/${id}`, body);
 }
 delete(id:number){
  return this.http.delete<any>(`${this.basePath}/${id}`);
 }
}
