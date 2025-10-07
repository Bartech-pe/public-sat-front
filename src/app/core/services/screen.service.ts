import { Injectable } from '@angular/core';
import { GenericCrudService } from '@services/generic/generic-crud.service';
import { Screen } from '@models/screen.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ScreenService extends GenericCrudService<Screen> {
  constructor(http: HttpClient) {
    super(http, 'screens');
  }

  findAllByOffice(id: number): Observable<Screen[]> {
    return this.http.get<Screen[]>(`${this.url}/byOffice/${id}`);
  }
}
