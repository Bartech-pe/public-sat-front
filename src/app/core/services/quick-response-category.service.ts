import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@envs/environments';

@Injectable({
  providedIn: 'root',
})
export class QuickResponseCategoryService {
  private basePath = `${environment.apiUrl}v1/quick-response-category`;
  constructor(private http: HttpClient) {}
  getCategories() {
    return this.http.get<any>(`${this.basePath}`);
  }
}
