import { Injectable } from '@angular/core';
import { QuickResponseCategoryModel } from '@models/QuickResponseCategory.model';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '@envs/enviroments';

@Injectable({
  providedIn: 'root'
})
export class QuickResponseCategoryService{

private basePath = `${environment.apiUrl}/quick-response-category`;
constructor(private http: HttpClient) { }
 getCategories() {
    return this.http.get<any>(`${this.basePath}`);
 }
}
