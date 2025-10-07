import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@envs/environments';

@Injectable({
  providedIn: 'root'
})
export class CallStateService {

private basePath = `${environment.apiUrl}v1/call-states`;
constructor(private http: HttpClient) { }
getCategories() {
    return this.http.get<any>(`${this.basePath}`);
 }
}
