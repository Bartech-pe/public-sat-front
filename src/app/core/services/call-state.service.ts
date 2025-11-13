import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@envs/enviroments';

@Injectable({
  providedIn: 'root'
})
export class CallStateService {

private basePath = `${environment.apiUrl}/call-state`;
constructor(private http: HttpClient) { }
getCategories() {
    return this.http.get<any>(`${this.basePath}`);
 }
}
