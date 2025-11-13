import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@envs/enviroments';
import { ICreateHorario, IUpdateHorario } from '@models/horario.model';

@Injectable({
  providedIn: 'root'
})
export class HorarioService {
private basePath = `${environment.apiUrl}/horario`;
constructor(private http: HttpClient) { }
getDays(){
  return this.http.get<any>(`${this.basePath}/week/days`);
}
getByCampain(id:number){
  return this.http.get<any>(`${this.basePath}/campania/${id}`);
}
postCreate(body:ICreateHorario){
  return this.http.post<any>(this.basePath, body);
 }
 putUpdate(id:number,body:IUpdateHorario){
return this.http.put<any>(`${this.basePath}/${id}`, body);
 }
 delete(id:number){
  return this.http.delete<any>(`${this.basePath}/${id}`);
 }
  deleteByCampain(id:number){
  return this.http.delete<any>(`${this.basePath}/campain/${id}`);
 }
}
