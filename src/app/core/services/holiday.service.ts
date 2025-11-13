import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@envs/environments';
import { Holiday } from '@models/holiday.model';
import { GenericCrudService } from './generic/generic-crud.service';

@Injectable({
  providedIn: 'root',
})
export class HolidayService extends GenericCrudService<Holiday> {
  constructor(http: HttpClient) {
    super(http, 'holidays');
  }

  getByDate(date: Date) {
    return this.http.post<Holiday>(`${this.url}/byDate`, {date});
  }
}
