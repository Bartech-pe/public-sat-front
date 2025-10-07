import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@envs/environments';
import { Schedule } from '@models/schedule.model';

@Injectable({
  providedIn: 'root',
})
export class ScheduleService {
  private basePath = `${environment.apiUrl}v1/schedules`;
  constructor(private http: HttpClient) {}
  getDays() {
    return this.http.get<any>(`${this.basePath}/week/days`);
  }
  getByCampain(id: number) {
    return this.http.get<any>(`${this.basePath}/campania/${id}`);
  }
  postCreate(body: Schedule) {
    return this.http.post<any>(this.basePath, body);
  }
  putUpdate(id: number, body: Schedule) {
    return this.http.put<any>(`${this.basePath}/${id}`, body);
  }
  delete(id: number) {
    return this.http.delete<any>(`${this.basePath}/${id}`);
  }
  deleteByCampain(id: number) {
    return this.http.delete<any>(`${this.basePath}/campain/${id}`);
  }
}
